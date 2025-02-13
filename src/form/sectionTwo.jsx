import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SideNav from "../components/TopNav";
import { fetchBusinessData } from '../utils/dashboardUtils';
import { getUserDocumentByEmail, getUserRole } from '../firestore';
import { updateOverallStatus } from '../utils/statusUpdateUtils';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getStorage } from 'firebase/storage';


const CorporateBusinessForm = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const userIdFromAdmin = localStorage.getItem('applicationUserId');
  const [formData, setFormData] = useState({
    companyName: '',
    companyNameType: '',
    companyLogo: null,
    companyAddress: '',
    companyProvince: '',
    companyDistrict: '',
    companyDivisionalOffice: '',
    companyGNDivision: '',
    companyPostalCode: '',
    companyEmail: '',
    businessDescription: ''
  });

  const [userRole, setUserRole] = useState('admin');
  const [checkboxValues, setCheckboxValues] = useState({
    companyName: state.user?.role === 'admin' ? false : true,
    companyNameType: state.user?.role === 'admin' ? false : true,
    companyLogo: state.user?.role === 'admin' ? false : true,
    companyAddress: state.user?.role === 'admin' ? false : true,
    companyProvince: state.user?.role === 'admin' ? false : true,
    companyDistrict: state.user?.role === 'admin' ? false : true,
    companyDivisionalOffice: state.user?.role === 'admin' ? false : true,
    companyGNDivision: state.user?.role === 'admin' ? false : true,
    companyPostalCode: state.user?.role === 'admin' ? false : true,
    companyEmail: state.user?.role === 'admin' ? false : true,
    businessDescription: state.user?.role === 'admin' ? false : true
  });

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

  // Business data fetching useEffect
  useEffect(() => {
    const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;
    console.log("userId from section two useEffect", userId);

    if (userId) {
      fetchBusinessData(userId, dispatch).then(() => {
        setFormData({
          companyName: state.businessInformation?.companyName || '',
          companyNameType: state.businessInformation?.companyNameType || '',
          companyLogo: state.businessInformation?.companyLogo || null,
          companyAddress: state.businessInformation?.companyAddress || '',
          companyProvince: state.businessInformation?.companyProvince || '',
          companyDistrict: state.businessInformation?.companyDistrict || '',
          companyDivisionalOffice: state.businessInformation?.companyDivisionalOffice || '',
          companyGNDivision: state.businessInformation?.companyGNDivision || '',
          companyPostalCode: state.businessInformation?.companyPostalCode || '',
          companyEmail: state.businessInformation?.companyEmail || '',
          businessDescription: state.businessInformation?.businessDescription || ''
        });

        setCheckboxValues({
          companyName: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyName ?? true,
          companyNameType: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyNameType ?? true,
          companyLogo: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyLogo ?? true,
          companyAddress: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyAddress ?? true,
          companyProvince: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyProvince ?? true,
          companyDistrict: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyDistrict ?? true,
          companyDivisionalOffice: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyDivisionalOffice ?? true,
          companyGNDivision: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyGNDivision ?? true,
          companyPostalCode: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyPostalCode ?? true,
          companyEmail: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyEmail ?? true,
          businessDescription: state.user?.role === 'admin' ? false : state.businessInformation?.checkBusinessDescription ?? true
        });
      });
    }

    if (state.user?.role === 'user') {
      setUserRole('user');
    }
  }, [state.user, userIdFromAdmin, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxValues({ ...checkboxValues, [name]: checked });
  };

  const uploadFile = async (file, userId, fileType) => {
    if (!file) return null;

    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `business/${userId}/${fileType}.${fileExtension}`;
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        companyLogo: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;

      // Handle company logo upload
      const logoFile = formData.companyLogo instanceof File ? formData.companyLogo : null;

      // Get existing business data
      const businessRef = collection(db, 'business');
      const q = query(businessRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const existingBusiness = querySnapshot.empty ? {} : querySnapshot.docs[0].data();

      // Upload new logo or keep existing URL
      const companyLogo = logoFile
        ? await uploadFile(logoFile, userId, 'logo')
        : existingBusiness.companyLogo || null;

      // Delete old logo if new one is uploaded
      if (logoFile && existingBusiness.companyLogo) {
        await deleteOldFile(existingBusiness.companyLogo.path);
      }

      const dataToAdd = {
        ...formData,
        companyLogo,
        checkCompanyName: state.user?.role === 'user' ? false : checkboxValues.companyName,
        checkCompanyNameType: state.user?.role === 'user' ? false : checkboxValues.companyNameType,
        checkCompanyLogo: state.user?.role === 'user' ? false : checkboxValues.companyLogo,
        checkCompanyAddress: state.user?.role === 'user' ? false : checkboxValues.companyAddress,
        checkCompanyProvince: state.user?.role === 'user' ? false : checkboxValues.companyProvince,
        checkCompanyDistrict: state.user?.role === 'user' ? false : checkboxValues.companyDistrict,
        checkCompanyDivisionalOffice: state.user?.role === 'user' ? false : checkboxValues.companyDivisionalOffice,
        checkCompanyGNDivision: state.user?.role === 'user' ? false : checkboxValues.companyGNDivision,
        checkCompanyPostalCode: state.user?.role === 'user' ? false : checkboxValues.companyPostalCode,
        checkCompanyEmail: state.user?.role === 'user' ? false : checkboxValues.companyEmail,
        checkBusinessDescription: state.user?.role === 'user' ? false : checkboxValues.businessDescription,
        status: 'Pending',
        userId: userId,
        createdAt: serverTimestamp()
      };

      const dataToUpdate = {
        ...formData,
        companyLogo,
        checkCompanyName: state.user?.role === 'user' ? false : checkboxValues.companyName,
        checkCompanyNameType: state.user?.role === 'user' ? false : checkboxValues.companyNameType,
        checkCompanyLogo: state.user?.role === 'user' ? false : checkboxValues.companyLogo,
        checkCompanyAddress: state.user?.role === 'user' ? false : checkboxValues.companyAddress,
        checkCompanyProvince: state.user?.role === 'user' ? false : checkboxValues.companyProvince,
        checkCompanyDistrict: state.user?.role === 'user' ? false : checkboxValues.companyDistrict,
        checkCompanyDivisionalOffice: state.user?.role === 'user' ? false : checkboxValues.companyDivisionalOffice,
        checkCompanyGNDivision: state.user?.role === 'user' ? false : checkboxValues.companyGNDivision,
        checkCompanyPostalCode: state.user?.role === 'user' ? false : checkboxValues.companyPostalCode,
        checkCompanyEmail: state.user?.role === 'user' ? false : checkboxValues.companyEmail,
        checkBusinessDescription: state.user?.role === 'user' ? false : checkboxValues.businessDescription,
        status: state.user?.role === 'admin' ? 'Resubmit' : 'Pending',
        createdAt: serverTimestamp()
      };

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'business', querySnapshot.docs[0].id);
        await updateDoc(docRef, dataToUpdate);
        await updateOverallStatus(userId, state, dispatch);
        console.log('Business information updated successfully!');
      } else {
        await addDoc(businessRef, dataToAdd);
        console.log('Business information saved successfully!');
      }

      // // Update context
      // dispatch({
      //   type: 'SET_BUSINESS_INFORMATION',
      //   payload: {
      //     ...formDataToSave,
      //     status: formDataToSave.status,
      //     userId: formDataToSave.userId
      //   }
      // });

      navigate('/section-three', { state: { userId: userIdFromAdmin } });

    } catch (error) {
      console.error('Error handling document: ', error);
      console.log('Error saving business information. Please try again.');
    }
  };

  const handleNext = () => {
    navigate('/section-three', { state: { userId: userIdFromAdmin } });

  };

  const handleBack = () => {
    navigate('/section-one');
  };

  const handleView = (url) => {
    window.open(url, '_blank');
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
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">2</div>
          <span className="ml-2 font-medium text-blue-500">Business Information
          </span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">3</div>
          <span className="ml-2 text-gray-600">Director Information</span>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid max-w-4xl grid-cols-1 gap-6 p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h2 className="col-span-1 mb-4 text-2xl font-semibold text-center">Business Information</h2>
        <div className="grid grid-cols-2 gap-6 p-6">

          {/* Company Name */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyName"
                  className="mr-2"
                  checked={checkboxValues.companyName}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Company Name</label>
            </div>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyName}
              required
            />
          </div>

          {/* Business Type */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyNameType"
                  className="mr-2"
                  checked={checkboxValues.companyNameType}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Company Name Type</label>
            </div>
            <select
              name="companyNameType"
              value={formData.companyNameType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyNameType}
              required
            >
              <option value="">Select Company Name Type</option>
              <option value="(PVT) LTD">(PVT) LTD</option>
              <option value="(PRIVATE) LIMITED">(PRIVATE) LIMITED</option>
            </select>
          </div>

          {/* Company Logo Upload */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyLogo"
                  className="mr-2"
                  checked={checkboxValues.companyLogo}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Company Logo</label>
            </div>
            <div className="space-y-2 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues.companyLogo}
                required={formData.companyLogo ? false : true}
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                onClick={() => handleView(formData.companyLogo?.url)}
              >
                View
              </button>
            </div>
            {formData.companyLogo?.url && (
              <span className='text-green-500'>File Uploaded!</span>
            )}
          </div>

          {/* Company Address */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyAddress"
                  className="mr-2"
                  checked={checkboxValues.companyAddress}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Company Address</label>
            </div>
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyAddress}
              required
            />
          </div>

          {/* Company Province */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyProvince"
                  className="mr-2"
                  checked={checkboxValues.companyProvince}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Company Province</label>
            </div>
            <input
              type="text"
              name="companyProvince"
              value={formData.companyProvince}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyProvince}
              required
            />
          </div>

          {/* Company District */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyDistrict"
                  className="mr-2"
                  checked={checkboxValues.companyDistrict}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Company District</label>
            </div>
            <input
              type="text"
              name="companyDistrict"
              value={formData.companyDistrict}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyDistrict}
              required
            />
          </div>

          {/* Company Divisional Office */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyDivisionalOffice"
                  className="mr-2"
                  checked={checkboxValues.companyDivisionalOffice}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Companies Divisional Secretariat Office</label>
            </div>
            <input
              type="text"
              name="companyDivisionalOffice"
              value={formData.companyDivisionalOffice}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyDivisionalOffice}
              required
            />
          </div>

          {/* Company GN Division */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyGNDivision"
                  className="mr-2"
                  checked={checkboxValues.companyGNDivision}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Companies GN Division</label>
            </div>
            <input
              type="text"
              name="companyGNDivision"
              value={formData.companyGNDivision}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyGNDivision}
              required
            />
          </div>

          {/* Company Postal Code */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyPostalCode"
                  className="mr-2"
                  checked={checkboxValues.companyPostalCode}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Companies Postal / Zip Code</label>
            </div>
            <input
              type="text"
              name="companyPostalCode"
              value={formData.companyPostalCode}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyPostalCode}
              required
            />
          </div>

          {/* Company Email */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="companyEmail"
                  className="mr-2"
                  checked={checkboxValues.companyEmail}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Companies E-mail Address</label>
            </div>
            <input
              type="email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.companyEmail}
              required
            />
          </div>

          {/* Business Description */}
          <div className="mb-4 col-span-2">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="businessDescription"
                  className="mr-2"
                  checked={checkboxValues.businessDescription}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Business Description</label>
            </div>
            <textarea
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.businessDescription}
              required
              rows="4"
            />
          </div>
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
        <div className="mt-4">
          <hr className="mb-8 border-gray-300" />
          <p className="my-4 text-center text-black">By accessing or using the Services, you agree to be bound by these Terms as if signed by you.</p>
        </div>
      </form>
    </div>
  );
};

export default CorporateBusinessForm;
