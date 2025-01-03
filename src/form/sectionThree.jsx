import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component


const CorporateBusinessForm = () => {
  const { state } = useUserContext();
  const navigate = useNavigate(); // Initialize useNavigate hook
  
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
  };

  const handleDirectorChange = (e, index) => {
    const { name, value } = e.target;
    const newDirectors = [...directors];
    newDirectors[index][name] = value;
    setDirectors(newDirectors);
  };

  const handleFileChange = (e, index, fieldName) => {
    const file = e.target.files[0];
    const newDirectors = [...directors];
    newDirectors[index][fieldName] = file;
    setDirectors(newDirectors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        directors,
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
        alert('Contact updated successfully!');
      } else {
        await addDoc(collection(db, 'contacts'), formData);
        alert('Contact saved successfully!');
      }

      // Reset form data after submission
      setDirectors([{
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

      // Redirect user after submission
      navigate('/section-four'); // Change to appropriate path

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
              <label className="block font-medium">Director Title</label>
              <select
                name="title"
                value={director.title}
                onChange={(e) => handleDirectorChange(e, index)}
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
              <label className="block font-medium">Director Full Name</label>
              <input
                type="text"
                name="fullName"
                value={director.fullName}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Date of Birth (Optional) */}
            <div className="mb-4">
              <label className="block font-medium">Director Date of Birth (Optional)</label>
              <input
                type="date"
                name="dob"
                value={director.dob}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Province */}
            <div className="mb-4">
              <label className="block font-medium">Director Province</label>
              <input
                type="text"
                name="province"
                value={director.province}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* District */}
            <div className="mb-4">
              <label className="block font-medium">Director District</label>
              <input
                type="text"
                name="district"
                value={director.district}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Divisional Secretariat Division */}
            <div className="mb-4">
              <label className="block font-medium">Divisional Secretariat Division</label>
              <input
                type="text"
                name="division"
                value={director.division}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Address 1 */}
            <div className="mb-4">
              <label className="block font-medium">Director Address 1</label>
              <input
                type="text"
                name="address1"
                value={director.address1}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Address 2 (Optional) */}
            <div className="mb-4">
              <label className="block font-medium">Director Address 2 (Optional)</label>
              <input
                type="text"
                name="address2"
                value={director.address2}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Post Code/ZIP */}
            <div className="mb-4">
              <label className="block font-medium">Director Post Code/ZIP</label>
              <input
                type="text"
                name="postCode"
                value={director.postCode}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Residential Phone No. (Optional) */}
            <div className="mb-4">
              <label className="block font-medium">Director Residential Phone No. (Optional)</label>
              <input
                type="text"
                name="phone"
                value={director.phone}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Mobile Phone No. */}
            <div className="mb-4">
              <label className="block font-medium">Director Mobile Phone No.</label>
              <input
                type="text"
                name="mobile"
                value={director.mobile}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Email Address */}
            <div className="mb-4">
              <label className="block font-medium">Director Email Address</label>
              <input
                type="email"
                name="email"
                value={director.email}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Occupation */}
            <div className="mb-4">
              <label className="block font-medium">Director Occupation</label>
              <input
                type="text"
                name="occupation"
                value={director.occupation}
                onChange={(e) => handleDirectorChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* NIC Front Upload */}
            <div className="mb-4">
              <label className="block font-medium">Director NIC Front</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, index, 'nicFront')}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* NIC Back Upload */}
            <div className="mb-4">
              <label className="block font-medium">Director NIC Back</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, index, 'nicBack')}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
            </div>

            {/* Signature Upload */}
            <div className="mb-4">
              <label className="block font-medium">Director Signature</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, index, 'signature')}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              />
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

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-3 mt-4 font-semibold text-white bg-blue-600 rounded-lg"
        >
                  Save and Next

        </button>
        </div>


      </form>
    </div>
  );
};

export default CorporateBusinessForm;
