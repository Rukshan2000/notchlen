import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component
import { fetchBusinessData, fetchDirectorData } from '../utils/dashboardUtils';
import { updateOverallStatus } from '../utils/statusUpdateUtils';
import { onAuthStateChanged } from 'firebase/auth';
import { sendUpdateEmailToAdmin, sendUpdateEmailToUser } from '../utils/emailService';
import { getUserDocumentByEmail, getUserRole } from '../firestore';

const CorporateBusinessForm = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [userRole, setUserRole] = useState('admin');
  const [userIdFromAdmin, setUserIdFromAdmin] = useState('');

  const [directors, setDirectors] = useState([{
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

  const [checkboxValues, setCheckboxValues] = useState([{
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

  // Auth state management useEffect
  useEffect(() => {
    // Check localStorage for auth data on component mount
    const savedAuth = localStorage.getItem('authUser');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      dispatch({
        type: 'SET_USER',
        payload: authData
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth State Changed:', user);

      if (user) {
        // Update localStorage when auth state changes
        const userDoc = await getUserDocumentByEmail(user.email);
        const role = await getUserRole(userDoc.id);

        const authData = {
          email: user.email,
          uid: user.uid,
          role: role,
        };

        localStorage.setItem('authUser', JSON.stringify(authData));

        dispatch({
          type: 'SET_USER',
          payload: authData
        });
      } else {
        // Clear localStorage when user signs out
        localStorage.removeItem('authUser');
        dispatch({ type: 'CLEAR_USER' });
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Fetch existing director data
  useEffect(() => {
    setUserIdFromAdmin(localStorage.getItem('applicationUserId'));
    console.log("userIdFromAdmin from section three", userIdFromAdmin);
    const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;
    if (userId) {
      fetchDirectorData(userId, dispatch).then(() => {
        if (state.directorInformation) {
          setDirectors(state.directorInformation.directors || []);
          setCheckboxValues(state.directorInformation.directorCheckboxes || directors.map(() => ({
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
          })));
        }
      });
    }


    if (state.user?.role === 'user') {
      setUserRole('user');
    }


  }, [state.user, userIdFromAdmin, dispatch]);

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
        // await updateOverallStatus(formData.userId, state, dispatch);
        await updateOverallStatus(state.directorInformation.userId, state, dispatch);
        if (userRole !== 'user') {
          await sendUpdateEmailToUser(state.directorInformation.userId);
        } else {
          await sendUpdateEmailToAdmin(state.directorInformation.userId);
        }
        console.log('Director information updated successfully!');
      } else {
        await addDoc(directorsRef, formData);
        console.log('Director information saved successfully!');
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
      console.log('Error saving director information. Please try again.');
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
      const newDirectors = [...directors];
      newDirectors[index] = {
        ...newDirectors[index],
        [fieldName]: file,
      };
      setDirectors(newDirectors);
    }
  };

  const handleView = (url) => {
    window.open(url, '_blank');
  };

  const handleDeleteDirector = (index) => {
    const newDirectors = [...directors];
    newDirectors.splice(index, 1);
    setDirectors(newDirectors);

    const newCheckboxValues = [...checkboxValues];
    newCheckboxValues.splice(index, 1);
    setCheckboxValues(newCheckboxValues);
  };

  console.log("checkboxValues", checkboxValues);

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

      <form className="grid max-w-4xl grid-cols-1 gap-6 p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold text-center">Director Information</h2>

        {directors.map((director, index) => (
          <div key={index} className="grid grid-cols-2 gap-6 p-6 border-b border-gray-300">
            {/* Add delete button at the top right of each director section */}
            <div className="col-span-2 flex justify-end mb-4">
              <button
                type="button"
                onClick={() => handleDeleteDirector(index)}
                className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg"
              >
                Delete Director
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="title"
                    className="mr-2"
                    checked={checkboxValues[index].title}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="fullName"
                    className="mr-2"
                    checked={checkboxValues[index].fullName}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="dob"
                    className="mr-2"
                    checked={checkboxValues[index].dob}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="province"
                    className="mr-2"
                    checked={checkboxValues[index].province}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="district"
                    className="mr-2"
                    checked={checkboxValues[index].district}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="division"
                    className="mr-2"
                    checked={checkboxValues[index].division}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="address1"
                    className="mr-2"
                    checked={checkboxValues[index].address1}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="address2"
                    className="mr-2"
                    checked={checkboxValues[index].address2}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="postCode"
                    className="mr-2"
                    checked={checkboxValues[index].postCode}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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

            {/* Phone Number */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="phone"
                    className="mr-2"
                    checked={checkboxValues[index].phone}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
                <label className="block font-medium">Phone Number</label>
              </div>
              <input
                type="tel"
                name="phone"
                value={director.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    (/^\d*$/.test(value) || value === '') &&
                    (value.length === 0 || value[0] === '0') &&
                    value.length <= 10
                  ) {
                    handleDirectorChange(e, index);
                  }
                }}
                pattern="0[0-9]{9}"
                maxLength="10"
                placeholder="0XXXXXXXXX"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].phone}
                required
                title="Phone number must start with 0 and be 10 digits long"
              />
            </div>

            {/* Mobile Number */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="mobile"
                    className="mr-2"
                    checked={checkboxValues[index].mobile}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
                <label className="block font-medium">Mobile Number</label>
              </div>
              <input
                type="tel"
                name="mobile"
                value={director.mobile}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    (/^\d*$/.test(value) || value === '') &&
                    (value.length === 0 || value[0] === '0') &&
                    value.length <= 10
                  ) {
                    handleDirectorChange(e, index);
                  }
                }}
                pattern="0[0-9]{9}"
                maxLength="10"
                placeholder="0XXXXXXXXX"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].mobile}
                required
                title="Phone number must start with 0 and be 10 digits long"
              />
            </div>

            {/* Email Address */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="email"
                    className="mr-2"
                    checked={checkboxValues[index].email}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="occupation"
                    className="mr-2"
                    checked={checkboxValues[index].occupation}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
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
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="nicFront"
                    className="mr-2"
                    checked={checkboxValues[index].nicFront}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
                <label className="block font-medium">Director NIC Front</label>
              </div>
              <div className="space-y-2 flex items-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, index, 'nicFront')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].nicFront}
                  required={director.nicFront ? false : true}
                />
                <button
                  className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                  onClick={() => handleView(director.nicFront?.url)}
                >
                  View
                </button>
              </div>
              {director.nicFront?.url && (
                <span className='text-green-500'>File Uploaded!</span>
              )}
            </div>

            {/* NIC Back Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="nicBack"
                    className="mr-2"
                    checked={checkboxValues[index].nicBack}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
                <label className="block font-medium">Director NIC Back</label>
              </div>
              <div className="space-y-2 flex items-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, index, 'nicBack')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].nicBack}
                  required={director.nicBack ? false : true}
                />
                <button
                  className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                  onClick={() => handleView(director.nicBack?.url)}
                >
                  View
                </button>
              </div>
              {director.nicBack?.url && (
                <span className='text-green-500'>File Uploaded!</span>
              )}
            </div>

            {/* Signature Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {userRole !== 'user' && (
                  <input
                    type="checkbox"
                    name="signature"
                    className="mr-2"
                    checked={checkboxValues[index].signature}
                    onChange={(e) => handleCheckboxChange(e, index)}
                  />
                )}
                <label className="block font-medium">Director Signature</label>
              </div>
              <div className="space-y-2 flex items-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, index, 'signature')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].signature}
                  required={director.signature ? false : true}
                />
                <button
                  className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                  onClick={() => handleView(director.signature?.url)}
                >
                  View
                </button>
              </div>
              {director.signature?.url && (
                <span className='text-green-500'>File Uploaded!</span>
              )}
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
              onClick={handleSubmit}
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
        <div className="mt-4">
          <hr className="mb-8 border-gray-300" />
          <p className="my-4 text-center text-black">By accessing or using the Services, you agree to be bound by these Terms as if signed by you.</p>
        </div>
      </form>
    </div>
  );
};

export default CorporateBusinessForm;
