import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirectio
import SideNav from "../components/TopNav"; // Importing the TopNav component


const CorporateBusinessForm = () => {
  const { state } = useUserContext();
  const navigate = useNavigate(); // Initialize useNavigate hook
  
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

  useEffect(() => {
    if (state.companyInformation) {
      setFormData({
        companyName: state.companyInformation.companyName || '',
        businessType: state.companyInformation.businessType || '',
        registrationNumber: state.companyInformation.registrationNumber || '',
        authorizedPersonName: state.companyInformation.authorizedPersonName || '',
        authorizedPersonEmail: state.companyInformation.authorizedPersonEmail || '',
        authorizedPersonPhone: state.companyInformation.authorizedPersonPhone || ''
      });

      setCheckboxValues({
        companyName: state.companyInformation.checkCompanyName ?? true,
        businessType: state.companyInformation.checkBusinessType ?? true,
        registrationNumber: state.companyInformation.checkRegistrationNumber ?? true,
        authorizedPersonName: state.companyInformation.checkAuthorizedPersonName ?? true,
        authorizedPersonEmail: state.companyInformation.checkAuthorizedPersonEmail ?? true,
        authorizedPersonPhone: state.companyInformation.checkAuthorizedPersonPhone ?? true
      });
    }
    if (state.user.role === 'user') {
      setUserRole('user');
    }
  }, [state.companyInformation]);

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
        checkCompanyName: checkboxValues.companyName,
        checkBusinessType: checkboxValues.businessType,
        checkRegistrationNumber: checkboxValues.registrationNumber,
        checkAuthorizedPersonName: checkboxValues.authorizedPersonName,
        checkAuthorizedPersonEmail: checkboxValues.authorizedPersonEmail,
        checkAuthorizedPersonPhone: checkboxValues.authorizedPersonPhone,
        status: 'Pending',
        createdAt: serverTimestamp(),
        userId: state.user.uid
      };

      const dataToUpdate = {
        ...formData,
        checkCompanyName: checkboxValues.companyName,
        checkBusinessType: checkboxValues.businessType,
        checkRegistrationNumber: checkboxValues.registrationNumber,
        checkAuthorizedPersonName: checkboxValues.authorizedPersonName,
        checkAuthorizedPersonEmail: checkboxValues.authorizedPersonEmail,
        checkAuthorizedPersonPhone: checkboxValues.authorizedPersonPhone,
        status: state.companyInformation.editMode === 'fromUser' ? 'Pending' : 'ReSubmit',
        createdAt: serverTimestamp()
      };

      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where('userId', '==', state.companyInformation.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);
        await updateDoc(docRef, dataToUpdate);
        alert('Contact updated successfully!');
      } else {
        await addDoc(collection(db, 'contacts'), dataToAdd);
        alert('Contact saved successfully!');
      }

      // Reset form data after submission
      setFormData({
        companyName: '',
        businessType: '',
        registrationNumber: '',
        authorizedPersonName: '',
        authorizedPersonEmail: '',
        authorizedPersonPhone: ''
      });

      // Redirect user to form2 after successful submission
      navigate('/section-three'); // Replace '/form2' with the correct path for form2

    } catch (error) {
      console.error('Error handling document: ', error);
      alert('Error saving contact. Please try again.');
    }
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
              <input
                type="checkbox"
                name="companyName"
                className="mr-2"
                disabled={userRole === 'user'}
                checked={checkboxValues.companyName}
                onChange={handleCheckboxChange}
              />
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
              <input
                type="checkbox"
                name="businessType"
                className="mr-2"
                disabled={userRole === 'user'}
                checked={checkboxValues.businessType}
                onChange={handleCheckboxChange}
              />
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
              <input
                type="checkbox"
                name="registrationNumber"
                className="mr-2"
                disabled={userRole === 'user'}
                checked={checkboxValues.registrationNumber}
                onChange={handleCheckboxChange}
              />
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
              <input
                type="checkbox"
                name="authorizedPersonName"
                className="mr-2"
                disabled={userRole === 'user'}
                checked={checkboxValues.authorizedPersonName}
                onChange={handleCheckboxChange}
              />
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
              <input
                type="checkbox"
                name="authorizedPersonEmail"
                className="mr-2"
                disabled={userRole === 'user'}
                checked={checkboxValues.authorizedPersonEmail}
                onChange={handleCheckboxChange}
              />
              <label className="block font-medium">Authorized Person Email</label>
            </div>
            <input
              type="email"
              name="authorizedPersonEmail"
              value={formData.authorizedPersonEmail}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.authorizedPersonEmail}
            />
          </div>

          {/* Authorized Person Phone */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="authorizedPersonPhone"
                className="mr-2"
                disabled={userRole === 'user'}
                checked={checkboxValues.authorizedPersonPhone}
                onChange={handleCheckboxChange}
              />
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

        <button
          type="submit"
          className="w-1/3 py-3 ml-auto text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
          >
        Save and Next
        </button>
      </form>
    </div>
  );
};

export default CorporateBusinessForm;
