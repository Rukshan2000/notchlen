import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // Import Firebase Storage
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase storage methods
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component

const CorporateBusinessForm = () => {
  const { state } = useUserContext();
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  const [formData, setFormData] = useState({

    paymentSlip: null // New field for payment slip
  });

  const [userRole, setUserRole] = useState('admin');
  const [checkboxValues, setCheckboxValues] = useState({
    email: true,

    contactPersonPhone: true
  });

  useEffect(() => {
    if (state.companyInformation) {
      setFormData({

        paymentSlip: null // Initialize the payment slip
      });

      setCheckboxValues({

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, paymentSlip: file });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxValues({ ...checkboxValues, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Upload payment slip to Firebase Storage
      let paymentSlipUrl = '';
      if (formData.paymentSlip) {
        const storageRef = ref(storage, `paymentSlips/${formData.paymentSlip.name}`);
        await uploadBytes(storageRef, formData.paymentSlip);
        paymentSlipUrl = await getDownloadURL(storageRef);
      }

      const dataToAdd = {
        ...formData,

        paymentSlipUrl, // Save the URL of the payment slip
        status: 'Pending',
        createdAt: serverTimestamp(),
        userId: state.user.uid
      };

      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where('userId', '==', state.companyInformation.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);
        await updateDoc(docRef, dataToAdd);
        alert('Contact updated successfully!');
      } else {
        await addDoc(collection(db, 'contacts'), dataToAdd);
        alert('Contact saved successfully!');
      }

      // Reset form data after submission
      setFormData({

        paymentSlip: null
      });

      // Redirect user to the next section after successful submission
      navigate('/section-six'); // Replace '/section-two' with the correct path

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
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">3</div>
          <span className="ml-2 font-medium text-green-500">Director Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
      
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">3</div>
          <span className="ml-2 font-medium text-green-500">Shareholder Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">5</div>
          <span className="ml-2 font-medium text-blue-500">Payment Verification</span>
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
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Existing fields... */}

          {/* Payment Slip Upload */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <label className="block font-medium">Upload Payment Slip</label>
            </div>
            <input
              type="file"
              name="paymentSlip"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
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
