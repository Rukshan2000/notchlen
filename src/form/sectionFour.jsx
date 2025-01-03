import React, { useState } from 'react';
import { db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component


const ShareholderForm = () => {
  const { state } = useUserContext();
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  const [shareholders, setShareholders] = useState([{
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
    shares: '',
    nicFront: null,
    nicBack: null,
    signature: null,
  }]);

  const addShareholder = () => {
    setShareholders([...shareholders, {
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
      shares: '',
      nicFront: null,
      nicBack: null,
      signature: null,
    }]);
  };

  const handleShareholderChange = (e, index) => {
    const { name, value } = e.target;
    const newShareholders = [...shareholders];
    newShareholders[index][name] = value;
    setShareholders(newShareholders);
  };

  const handleFileChange = (e, index, fieldName) => {
    const file = e.target.files[0];
    const newShareholders = [...shareholders];
    newShareholders[index][fieldName] = file;
    setShareholders(newShareholders);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        shareholders,
        status: 'Pending',
        createdAt: serverTimestamp(),
        userId: state.user.uid,
      };

      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where('userId', '==', state.companyInformation.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);
        await updateDoc(docRef, formData);
        alert('Shareholder information updated successfully!');
      } else {
        await addDoc(collection(db, 'contacts'), formData);
        alert('Shareholder information saved successfully!');
      }

      // Reset form data after submission
      setShareholders([{
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
        shares: '',
        nicFront: null,
        nicBack: null,
        signature: null,
      }]);

      // Redirect user after submission
      navigate('/section-five'); // Change to appropriate path

    } catch (error) {
      console.error('Error handling document: ', error);
      alert('Error saving shareholder information. Please try again.');
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
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">2</div>
          <span className="ml-2 font-medium text-green-500">Business Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>

        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">3</div>
          <span className="ml-2 font-medium text-green-500">Director Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">4</div>
          <span className="ml-2 font-medium text-blue-500">Shareholder  Information
          </span>
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
      <h2 className="mb-4 text-2xl font-semibold text-center">Shareholder Information</h2>

        {shareholders.map((shareholder, index) => (
          <div key={index} className="grid grid-cols-2 gap-6 p-6 border-b border-gray-300">
            {/* Title */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Title</label>
              <select
                name="title"
                value={shareholder.title}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
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
              <label className="block font-medium">Shareholder Full Name</label>
              <input
                type="text"
                name="fullName"
                value={shareholder.fullName}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Date of Birth */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={shareholder.dob}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Province */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Province</label>
              <input
                type="text"
                name="province"
                value={shareholder.province}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* District */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder District</label>
              <input
                type="text"
                name="district"
                value={shareholder.district}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Divisional Secretariat Division */}
            <div className="mb-4">
              <label className="block font-medium">Divisional Secretariat Division</label>
              <input
                type="text"
                name="division"
                value={shareholder.division}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Address 1 */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Address 1</label>
              <input
                type="text"
                name="address1"
                value={shareholder.address1}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Address 2 (Optional) */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Address Line 2 (Optional)</label>
              <input
                type="text"
                name="address2"
                value={shareholder.address2}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Postal Code */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Postal Code</label>
              <input
                type="text"
                name="postCode"
                value={shareholder.postCode}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Residential Phone No. (Optional) */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Residential Phone No. (Optional)</label>
              <input
                type="text"
                name="phone"
                value={shareholder.phone}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Mobile Phone No. */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Mobile Phone No.</label>
              <input
                type="text"
                name="mobile"
                value={shareholder.mobile}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Email Address */}
            <div className="mb-4">
              <label className="block font-medium">Shareholder Email Address</label>
              <input
                type="email"
                name="email"
                value={shareholder.email}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Number of Shares */}
            <div className="mb-4">
              <label className="block font-medium">No. of Shares to be Held</label>
              <input
                type="number"
                name="shares"
                value={shareholder.shares}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* NIC Front Upload */}
            <div className="mb-4">
              <label className="block font-medium">Upload NIC Front</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, index, 'nicFront')}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* NIC Back Upload */}
            <div className="mb-4">
              <label className="block font-medium">Upload NIC Back</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, index, 'nicBack')}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Signature Upload */}
            <div className="mb-4">
              <label className="block font-medium">Upload Signature</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, index, 'signature')}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>
          </div>
        ))}

        {/* Add another shareholder */}
        <div className="grid grid-cols-2 gap-6 p-6">
          <button
            type="button"
            onClick={addShareholder}
            className="px-4 py-2 text-white bg-green-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
          >
            Add Another Shareholder
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
          >
                  Save and Next
                  </button>
        </div>
      </form>
    </div>
  );
};

export default ShareholderForm;
