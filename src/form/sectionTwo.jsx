import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SideNav from "../components/TopNav";
import { fetchBusinessData } from '../utils/dashboardUtils';
import { getUserDocumentByEmail, getUserRole } from '../firestore';
import { updateOverallStatus } from '../utils/statusUpdateUtils';


const CorporateBusinessForm = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const userIdFromAdmin = localStorage.getItem('applicationUserId');
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    registrationNumber: '',
    authorizedPersonName: '',
    authorizedPersonEmail: '',
    authorizedPersonPhone: ''
  });

  const [userRole, setUserRole] = useState('admin');
  const [checkboxValues, setCheckboxValues] = useState({
    companyName: true,
    businessType: true,
    registrationNumber: true,
    authorizedPersonName: true,
    authorizedPersonEmail: true,
    authorizedPersonPhone: true
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
          businessType: state.businessInformation?.businessType || '',
          registrationNumber: state.businessInformation?.registrationNumber || '',
          authorizedPersonName: state.businessInformation?.authorizedPersonName || '',
          authorizedPersonEmail: state.businessInformation?.authorizedPersonEmail || '',
          authorizedPersonPhone: state.businessInformation?.authorizedPersonPhone || ''
        });

        setCheckboxValues({
          companyName: state.user?.role === 'admin' ? false : state.businessInformation?.checkCompanyName ?? true,
          businessType: state.user?.role === 'admin' ? false : state.businessInformation?.checkBusinessType ?? true,
          registrationNumber: state.user?.role === 'admin' ? false : state.businessInformation?.checkRegistrationNumber ?? true,
          authorizedPersonName: state.user?.role === 'admin' ? false : state.businessInformation?.checkAuthorizedPersonName ?? true,
          authorizedPersonEmail: state.user?.role === 'admin' ? false : state.businessInformation?.checkAuthorizedPersonEmail ?? true,
          authorizedPersonPhone: state.user?.role === 'admin' ? false : state.businessInformation?.checkAuthorizedPersonPhone ?? true
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToAdd = {
        ...formData,
        checkCompanyName: state.user.role === 'user' ? false : checkboxValues.companyName,
        checkBusinessType: state.user.role === 'user' ? false : checkboxValues.businessType,
        checkRegistrationNumber: state.user.role === 'user' ? false : checkboxValues.registrationNumber,
        checkAuthorizedPersonName: state.user.role === 'user' ? false : checkboxValues.authorizedPersonName,
        checkAuthorizedPersonEmail: state.user.role === 'user' ? false : checkboxValues.authorizedPersonEmail,
        checkAuthorizedPersonPhone: state.user.role === 'user' ? false : checkboxValues.authorizedPersonPhone,
        status: 'Pending',
        createdAt: serverTimestamp(),
        userId: state.user.uid
      };

      const dataToUpdate = {
        ...formData,
        checkCompanyName: state.user.role === 'user' ? false : checkboxValues.companyName,
        checkBusinessType: state.user.role === 'user' ? false : checkboxValues.businessType,
        checkRegistrationNumber: state.user.role === 'user' ? false : checkboxValues.registrationNumber,
        checkAuthorizedPersonName: state.user.role === 'user' ? false : checkboxValues.authorizedPersonName,
        checkAuthorizedPersonEmail: state.user.role === 'user' ? false : checkboxValues.authorizedPersonEmail,
        checkAuthorizedPersonPhone: state.user.role === 'user' ? false : checkboxValues.authorizedPersonPhone,
        status: state.user.role === 'admin' ? 'Resubmit' : 'Pending',
        createdAt: serverTimestamp()
      };

      const businessRef = collection(db, 'business');
      const q = query(businessRef, where('userId', '==', state.companyInformation.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'business', querySnapshot.docs[0].id);
        await updateDoc(docRef, dataToUpdate);
        await updateOverallStatus(state.businessInformation.userId, state, dispatch);

        console.log('Business information updated successfully!');
      } else {
        await addDoc(businessRef, dataToAdd);
        console.log('Business information saved successfully!');
      }

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
            />
          </div>

          {/* Business Type */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="businessType"
                  className="mr-2"
                  checked={checkboxValues.businessType}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Business Type</label>
            </div>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.businessType}
            >
              <option value="">Select Business Type</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Corporation">Corporation</option>
              <option value="LLC">LLC</option>
            </select>
          </div>

          {/* Registration Number */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="registrationNumber"
                  className="mr-2"
                  checked={checkboxValues.registrationNumber}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Registration Number</label>
            </div>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.registrationNumber}
            />
          </div>

          {/* Authorized Person Name */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="authorizedPersonName"
                  className="mr-2"
                  checked={checkboxValues.authorizedPersonName}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Authorized Person Name</label>
            </div>
            <input
              type="text"
              name="authorizedPersonName"
              value={formData.authorizedPersonName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.authorizedPersonName}
            />
          </div>

          {/* Authorized Person Email */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="authorizedPersonEmail"
                  className="mr-2"
                  checked={checkboxValues.authorizedPersonEmail}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Authorized Person Email</label>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  name="authorizedPersonEmail"
                  value={formData.authorizedPersonEmail}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues.authorizedPersonEmail}
                />
              </div>
            </div>
          </div>

          {/* Authorized Person Phone */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="authorizedPersonPhone"
                  className="mr-2"
                  checked={checkboxValues.authorizedPersonPhone}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Authorized Person Phone</label>
            </div>
            <input
              type="text"
              name="authorizedPersonPhone"
              value={formData.authorizedPersonPhone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.authorizedPersonPhone}
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
      </form>
    </div>
  );
};

export default CorporateBusinessForm;
