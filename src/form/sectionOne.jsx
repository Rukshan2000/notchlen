import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component


const CorporateBusinessForm = () => {
  const { state } = useUserContext();
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  const [formData, setFormData] = useState({
    email: '',
    registrationPlan: '',
    contactPersonTitle: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: ''
  });

  const [userRole, setUserRole] = useState('admin');
  const [checkboxValues, setCheckboxValues] = useState({
    email: true,
    registrationPlan: true,
    contactPersonTitle: true,
    contactPersonName: true,
    contactPersonEmail: true,
    contactPersonPhone: true
  });

  useEffect(() => {
    if (state.companyInformation) {
      setFormData({
        email: state.companyInformation.email || '',
        registrationPlan: state.companyInformation.registrationPlan || '',
        contactPersonTitle: state.companyInformation.contactPersonTitle || '',
        contactPersonName: state.companyInformation.contactPersonName || '',
        contactPersonEmail: state.companyInformation.contactPersonEmail || '',
        contactPersonPhone: state.companyInformation.contactPersonPhone || ''
      });

      setCheckboxValues({
        email: state.companyInformation.checkEmail ?? true,
        registrationPlan: state.companyInformation.checkRegistrationPlan ?? true,
        contactPersonTitle: state.companyInformation.checkContactPersonTitle ?? true,
        contactPersonName: state.companyInformation.checkContactPersonName ?? true,
        contactPersonEmail: state.companyInformation.checkContactPersonEmail ?? true,
        contactPersonPhone: state.companyInformation.checkContactPersonPhone ?? true
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
        checkEmail: checkboxValues.email,
        checkRegistrationPlan: checkboxValues.registrationPlan,
        checkContactPersonTitle: checkboxValues.contactPersonTitle,
        checkContactPersonName: checkboxValues.contactPersonName,
        checkContactPersonEmail: checkboxValues.contactPersonEmail,
        checkContactPersonPhone: checkboxValues.contactPersonPhone,
        status: 'Pending',
        createdAt: serverTimestamp(),
        userId: state.user.uid
      };

      const dataToUpdate = {
        ...formData,
        checkEmail: checkboxValues.email,
        checkRegistrationPlan: checkboxValues.registrationPlan,
        checkContactPersonTitle: checkboxValues.contactPersonTitle,
        checkContactPersonName: checkboxValues.contactPersonName,
        checkContactPersonEmail: checkboxValues.contactPersonEmail,
        checkContactPersonPhone: checkboxValues.contactPersonPhone,
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
        email: '',
        registrationPlan: '',
        contactPersonTitle: '',
        contactPersonName: '',
        contactPersonEmail: '',
        contactPersonPhone: ''
      });

      // Redirect user to form2 after successful submission
      navigate('/section-two'); // Replace '/form2' with the correct path for form2

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
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">3</div>
          <span className="ml-2 font-medium text-blue-500">Contact Information
          </span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">4</div>
          <span className="ml-2 text-gray-600">Business Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">4</div>
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
        <h2 className="col-span-1 mb-4 text-2xl font-semibold text-center">Contact information</h2>
<div  className="grid grid-cols-2 gap-6 p-6">
        {/* Email */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="email"
              className="mr-2"
              disabled={userRole === 'user'}
              checked={checkboxValues.email}
              onChange={handleCheckboxChange}
            />
            <label className="block font-medium">Email Address</label>
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            disabled={!checkboxValues.email}
          />
        </div>

        {/* Registration Plan */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="registrationPlan"
              className="mr-2"
              disabled={userRole === 'user'}
              checked={checkboxValues.registrationPlan}
              onChange={handleCheckboxChange}
            />
            <label className="block font-medium">Corporate Business Registration Plans</label>
          </div>
          <select
            name="registrationPlan"
            value={formData.registrationPlan}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            disabled={!checkboxValues.registrationPlan}
          >
            <option value="">Select Registration Plan</option>
            <option value="Startup 20000/= (PRIVATE LIMITED)">Startup 20000/= (PRIVATE LIMITED)</option>
            <option value="Professional 21400/= (PRIVATE LIMITED)">Professional 21400/= (PRIVATE LIMITED)</option>
            <option value="Enterprise 35000/= (PRIVATE LIMITED)">Enterprise 35000/= (PRIVATE LIMITED)</option>
            <option value="Export Import Combo 26400/= (PRIVATE LIMITED)">Export Import Combo 26400/= (PRIVATE LIMITED)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Contact Person Title */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="contactPersonTitle"
              className="mr-2"
              disabled={userRole === 'user'}
              checked={checkboxValues.contactPersonTitle}
              onChange={handleCheckboxChange}
            />
            <label className="block font-medium">Contact Person Title</label>
          </div>
          <select
            name="contactPersonTitle"
            value={formData.contactPersonTitle}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            disabled={!checkboxValues.contactPersonTitle}
          >
            <option value="">Select Title</option>
            <option>Mr</option>
            <option>Mrs</option>
            <option>Miss</option>
            <option>Prof</option>
            <option>Dr</option>
            <option>Rev</option>
          </select>
        </div>

        {/* Contact Person Name */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="contactPersonName"
              className="mr-2"
              disabled={userRole === 'user'}
              checked={checkboxValues.contactPersonName}
              onChange={handleCheckboxChange}
            />
            <label className="block font-medium">Full Name</label>
          </div>
          <input
            type="text"
            name="contactPersonName"
            value={formData.contactPersonName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            disabled={!checkboxValues.contactPersonName}
          />
        </div>

        {/* Contact Person Email */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="contactPersonEmail"
              className="mr-2"
              disabled={userRole === 'user'}
              checked={checkboxValues.contactPersonEmail}
              onChange={handleCheckboxChange}
            />
            <label className="block font-medium">Contact Person's Email Address</label>
          </div>
          <input
            type="email"
            name="contactPersonEmail"
            value={formData.contactPersonEmail}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            disabled={!checkboxValues.contactPersonEmail}
          />
        </div>

        {/* Contact Person Phone */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="contactPersonPhone"
              className="mr-2"
              disabled={userRole === 'user'}
              checked={checkboxValues.contactPersonPhone}
              onChange={handleCheckboxChange}
            />
            <label className="block font-medium">Contact Person's Phone Number</label>
          </div>
          <input
            type="text"
            name="contactPersonPhone"
            value={formData.contactPersonPhone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            disabled={!checkboxValues.contactPersonPhone}
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
