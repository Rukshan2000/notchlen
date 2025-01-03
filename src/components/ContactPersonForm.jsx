import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useUserContext } from '../context/UserContext';

const ContactPersonForm = () => {
  const { state } = useUserContext();
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    phone: ''
  });

  const [userRole, setUserRole] = useState('admin');

  const [checkboxValues, setCheckboxValues] = useState({
    title: true,
    name: true,
    email: true,
    phone: true
  });

  useEffect(() => {
    if (state.companyInformation) {
      setFormData({
        title: state.companyInformation.title || '',
        name: state.companyInformation.name || '',
        email: state.companyInformation.email || '',
        phone: state.companyInformation.phone || ''
      });

      setCheckboxValues({
        title: state.companyInformation.checkTitle ?? true,
        name: state.companyInformation.checkName ?? true,
        email: state.companyInformation.checkEmail ?? true,
        phone: state.companyInformation.checkPhone ?? true
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
        checkTitle: checkboxValues.title,
        checkName: checkboxValues.name,
        checkEmail: checkboxValues.email,
        checkPhone: checkboxValues.phone,
        status: 'Pending',
        createdAt: serverTimestamp(),
        userId: state.user.uid,
      };
      const dataToUpdate = {
        ...formData,
        checkTitle: checkboxValues.title,
        checkName: checkboxValues.name,
        checkEmail: checkboxValues.email,
        checkPhone: checkboxValues.phone,
        status: state.companyInformation.editMode === 'fromUser'?'Pending':'ReSubmit',
        createdAt: serverTimestamp(),

      };

      // Query to check if document exists
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where("userId", "==", state.companyInformation.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Document exists, update it
        const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);
        await updateDoc(docRef, dataToUpdate);
        alert('Contact updated successfully!');
      } else {
        // Document doesn't exist, create new one
        await addDoc(collection(db, 'contacts'), dataToAdd);
        alert('Contact saved successfully!');
      }

      setFormData({ title: '', name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error handling document: ', error);
      alert('Error saving contact. Please try again.');
    }
  };

  console.log("show checkbox values", checkboxValues);
  console.log(" see",state.companyInformation.checkTitle);
  

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-4 text-xl font-semibold">Contact Person Form</h2>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            name="title"
            className="mr-2"
            disabled={userRole === 'user'}
            checked={checkboxValues.title}
            onChange={handleCheckboxChange}
          />
          <label className="block font-medium">Title</label>
        </div>
        <select
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={!checkboxValues.title}
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
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            name="name"
            className="mr-2"
            disabled={userRole === 'user'}
            checked={checkboxValues.name}
            onChange={handleCheckboxChange}
          />
          <label className="block font-medium">Name</label>
        </div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={!checkboxValues.name}
        />
      </div>
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
          className="w-full p-2 border border-gray-300 rounded"
          disabled={!checkboxValues.email}
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            name="phone"
            className="mr-2"
            disabled={userRole === 'user'}
            checked={checkboxValues.phone}
            onChange={handleCheckboxChange}
          />
          <label className="block font-medium">Phone Number</label>
        </div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={!checkboxValues.phone}
        />
      </div>
      <button type="submit" className="p-2 text-white bg-blue-500 rounded">Submit</button>
    </form>
  );
};

export default ContactPersonForm;
