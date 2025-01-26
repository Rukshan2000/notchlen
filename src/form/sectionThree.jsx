import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component
import { fetchBusinessData, fetchDirectorData } from '../utils/dashboardUtils';

const CorporateBusinessForm = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const userIdFromAdmin = location.state?.userId;
  const [userRole, setUserRole] = useState('admin');

  const [directors, setDirectors] = useState([]);

  const [checkboxValues, setCheckboxValues] = useState([{
    title: true,
    fullName: true,
    dob: true,
    province: true,
    district: true,
    division: true,
    address1: true,
    address2: true,
    postCode: true,
    phone: true,
    mobile: true,
    email: true,
    occupation: true,
    nicFront: true,
    nicBack: true,
    signature: true,
  }]);

  const [previewUrl, setPreviewUrl] = useState(null); // State for preview modal

  // Fetch existing director data
  useEffect(() => {
    const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;
    fetchDirectorData(userId, dispatch);
  }, [state.user, userIdFromAdmin, dispatch]);

  useEffect(() => {
    if (state.directorInformation) {
      setDirectors(state.directorInformation.directors || []);
    }
  }, [state.directorInformation]);

  // Set user role
  useEffect(() => {
    if (state.user?.role === 'user') {
      setUserRole('user');
    }
  }, [state.user]);

  const addDirector = () => {
    setDirectors([...directors, {
      title: '',
      fullName: '',
      dob: '',
      province: '',
      district: '',
      division: '',
      address1: '',
      address2: '',
      postCode: '',
      phone: '',
      mobile: '',
      email: '',
      occupation: '',
      nicFront: null,
      nicBack: null,
      signature: null,
    }]);

    setCheckboxValues([...checkboxValues, {
      title: state.user?.role === 'admin' ? false : true,
      fullName: state.user?.role === 'admin' ? false : true,
      dob: state.user?.role === 'admin' ? false : true,
      province: state.user?.role === 'admin' ? false : true,
      district: state.user?.role === 'admin' ? false : true,
      division: state.user?.role === 'admin' ? false : true,
      address1: state.user?.role === 'admin' ? false : true,
      address2: state.user?.role === 'admin' ? false : true,
      postCode: state.user?.role === 'admin' ? false : true,
      phone: state.user?.role === 'admin' ? false : true,
      mobile: state.user?.role === 'admin' ? false : true,
      email: state.user?.role === 'admin' ? false : true,
      occupation: state.user?.role === 'admin' ? false : true,
      nicFront: state.user?.role === 'admin' ? false : true,
      nicBack: state.user?.role === 'admin' ? false : true,
      signature: state.user?.role === 'admin' ? false : true,
    }]);
  };

  const handleDirectorChange = (e, index) => {
    const { name, value } = e.target;
    const newDirectors = [...directors];
    newDirectors[index][name] = value;
    setDirectors(newDirectors);
  };

  const handleCheckboxChange = (e, index) => {
    const { name, checked } = e.target;
    const newCheckboxValues = [...checkboxValues];
    newCheckboxValues[index][name] = checked;
    setCheckboxValues(newCheckboxValues);
  };

  // Function to upload file to Firebase Storage
  const uploadFile = async (file, userId, directorIndex, fileType) => {
    if (!file) return null;

    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `directors/${userId}/director_${directorIndex}/${fileType}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, path: fileName };
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      throw error;
    }
  };

  // Function to delete old files when updating
  const deleteOldFile = async (filePath) => {
    if (!filePath) return;

    const storage = getStorage();
    const fileRef = ref(storage, filePath);
    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting old file:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only reset checkboxes if the user is not an admin
      const finalCheckboxValues = state.user.role === 'admin'
        ? checkboxValues
        : checkboxValues.map(checkbox => {
          return Object.keys(checkbox).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {});
        });

      const userId = state.user.role === 'admin' ? userIdFromAdmin : state.user.uid;

      // Upload files and get URLs for each director
      const directorsWithFiles = await Promise.all(directors.map(async (director, index) => {
        const nicFrontFile = director.nicFront instanceof File ? director.nicFront : null;
        const nicBackFile = director.nicBack instanceof File ? director.nicBack : null;
        const signatureFile = director.signature instanceof File ? director.signature : null;

        // Get existing file data if available
        const existingDirector = state.directorInformation.directors[index] || {};

        // Upload new files or keep existing URLs
        const nicFront = nicFrontFile
          ? await uploadFile(nicFrontFile, userId, index, 'nicFront')
          : existingDirector.nicFront || null;

        const nicBack = nicBackFile
          ? await uploadFile(nicBackFile, userId, index, 'nicBack')
          : existingDirector.nicBack || null;

        const signature = signatureFile
          ? await uploadFile(signatureFile, userId, index, 'signature')
          : existingDirector.signature || null;

        // Delete old files if new ones are uploaded
        if (nicFrontFile && existingDirector.nicFront) {
          await deleteOldFile(existingDirector.nicFront.path);
        }
        if (nicBackFile && existingDirector.nicBack) {
          await deleteOldFile(existingDirector.nicBack.path);
        }
        if (signatureFile && existingDirector.signature) {
          await deleteOldFile(existingDirector.signature.path);
        }

        return {
          ...director,
          nicFront,
          nicBack,
          signature
        };
      }));

      const formData = {
        directors: directorsWithFiles,
        directorCheckboxes: finalCheckboxValues,
        status: state.user.role === 'admin' ? 'Resubmit' : 'Pending',
        createdAt: serverTimestamp(),
        userId: userId,
      };

      const directorsRef = collection(db, 'directors');
      const q = query(directorsRef, where('userId', '==', formData.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'directors', querySnapshot.docs[0].id);
        await updateDoc(docRef, formData);
        alert('Director information updated successfully!');
      } else {
        await addDoc(directorsRef, formData);
        alert('Director information saved successfully!');
      }

      // Update context
      dispatch({
        type: 'SET_DIRECTOR_INFORMATION',
        payload: {
          directors: directorsWithFiles,
          directorCheckboxes: finalCheckboxValues,
          status: formData.status,
          userId: formData.userId
        }
      });

      // Only update local checkbox state if user is not admin
      if (state.user.role !== 'admin') {
        setCheckboxValues(finalCheckboxValues);
      }

      navigate('/section-four', { state: { userId: userIdFromAdmin } });

    } catch (error) {
      console.error('Error handling document: ', error);
      alert('Error saving director information. Please try again.');
    }
  };

  const handleNext = () => {
    navigate('/section-four', { state: { userId: userIdFromAdmin } });
  };

  const handleBack = () => {
    navigate('/section-two');
  };

  // Update handleFileChange to show preview
  const handleFileChange = (e, index, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);

      const newDirectors = [...directors];
      newDirectors[index] = {
        ...newDirectors[index],
        [fieldName]: file,
        [`${fieldName}Preview`]: previewUrl
      };
      setDirectors(newDirectors);
    }
  };

  const handlePreview = (url) => {
    setPreviewUrl(url);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="p-6 mx-auto mt-12 bg-gray-100 rounded-lg shadow-lg max-w-8xl">
      <SideNav />
      <div className="flex items-center justify-between mb-6 ">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">1</div>
          <span className="ml-2 font-medium text-green-500">Contact Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">2</div>
          <span className="ml-2 font-medium text-green-500">Business Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">3</div>
          <span className="ml-2 font-medium text-blue-500">Director Information
          </span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">4</div>
          <span className="ml-2 text-gray-600">Shareholder Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">5</div>
          <span className="ml-2 text-gray-600">Payment Verification</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">6</div>
          <span className="ml-2 text-gray-600">Contact Verification</span>
        </div>

      </div>

      <form onSubmit={handleSubmit} className="grid max-w-4xl grid-cols-1 gap-6 p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold text-center">Director Information</h2>

        {directors.map((director, index) => (
          <div key={index} className="grid grid-cols-2 gap-6 p-6 border-b border-gray-300">
            {/* Title */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="title"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].title}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Title</label>
              </div>
              <select
                name="title"
                value={director.title}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].title}
              >
                <option value="">Select Title</option>
                <option>Mr.</option>
                <option>Mrs.</option>
                <option>Miss.</option>
                <option>Dr.</option>
                <option>Prof.</option>
                <option>Rev.</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="fullName"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].fullName}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Full Name</label>
              </div>
              <input
                type="text"
                name="fullName"
                value={director.fullName}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].fullName}
              />
            </div>

            {/* Date of Birth (Optional) */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="dob"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].dob}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Date of Birth (Optional)</label>
              </div>
              <input
                type="date"
                name="dob"
                value={director.dob}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].dob}
              />
            </div>

            {/* Province */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="province"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].province}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Province</label>
              </div>
              <input
                type="text"
                name="province"
                value={director.province}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].province}
              />
            </div>

            {/* District */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="district"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].district}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director District</label>
              </div>
              <input
                type="text"
                name="district"
                value={director.district}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].district}
              />
            </div>

            {/* Divisional Secretariat Division */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="division"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].division}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Divisional Secretariat Division</label>
              </div>
              <input
                type="text"
                name="division"
                value={director.division}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].division}
              />
            </div>

            {/* Address 1 */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="address1"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].address1}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Address 1</label>
              </div>
              <input
                type="text"
                name="address1"
                value={director.address1}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].address1}
              />
            </div>

            {/* Address 2 (Optional) */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="address2"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].address2}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Address 2 (Optional)</label>
              </div>
              <input
                type="text"
                name="address2"
                value={director.address2}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].address2}
              />
            </div>

            {/* Post Code/ZIP */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="postCode"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].postCode}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Post Code/ZIP</label>
              </div>
              <input
                type="text"
                name="postCode"
                value={director.postCode}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].postCode}
              />
            </div>

            {/* Residential Phone No. (Optional) */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="phone"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].phone}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Residential Phone No. (Optional)</label>
              </div>
              <input
                type="text"
                name="phone"
                value={director.phone}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].phone}
              />
            </div>

            {/* Mobile Phone No. */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="mobile"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].mobile}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Mobile Phone No.</label>
              </div>
              <input
                type="text"
                name="mobile"
                value={director.mobile}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].mobile}
              />
            </div>

            {/* Email Address */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="email"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].email}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Email Address</label>
              </div>
              <input
                type="email"
                name="email"
                value={director.email}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].email}
              />
            </div>

            {/* Occupation */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="occupation"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].occupation}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Occupation</label>
              </div>
              <input
                type="text"
                name="occupation"
                value={director.occupation}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].occupation}
              />
            </div>

            {/* NIC Front Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="nicFront"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].nicFront}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director NIC Front</label>
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index, 'nicFront')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].nicFront}
                />
                {(director.nicFrontPreview || director.nicFront?.url) && (
                  <div className="mt-2" onClick={() => handlePreview(director.nicFrontPreview || director.nicFront?.url)}>
                    <img
                      src={director.nicFrontPreview || director.nicFront?.url}
                      alt="NIC Front Preview"
                      className="w-40 h-auto object-contain border rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* NIC Back Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="nicBack"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].nicBack}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director NIC Back</label>
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index, 'nicBack')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].nicBack}
                />
                {(director.nicBackPreview || director.nicBack?.url) && (
                  <div className="mt-2" onClick={() => handlePreview(director.nicBackPreview || director.nicBack?.url)}>
                    <img
                      src={director.nicBackPreview || director.nicBack?.url}
                      alt="NIC Back Preview"
                      className="w-40 h-auto object-contain border rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Signature Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="signature"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].signature}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Director Signature</label>
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index, 'signature')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].signature}
                />
                {(director.signaturePreview || director.signature?.url) && (
                  <div className="mt-2" onClick={() => handlePreview(director.signaturePreview || director.signature?.url)}>
                    <img
                      src={director.signaturePreview || director.signature?.url}
                      alt="Signature Preview"
                      className="w-40 h-auto object-contain border rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-6 p-6">

          {/* Button to add another director */}
          <button
            type="button"
            onClick={addDirector}
            className="px-6 py-3 mt-4 font-semibold text-white bg-green-600 rounded-lg"
          >
            Add Another Director
          </button>

        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        </div>

      </form>

      {/* Modal for preview */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={closePreview}>
          <div className="bg-white p-4 rounded">
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-screen" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateBusinessForm;
