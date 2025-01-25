import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // Import Firebase Storage
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Import Firebase storage methods
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component
import { getStorage } from 'firebase/storage';
import { fetchPaymentData, savePaymentData } from '../utils/dashboardUtils';

const CorporateBusinessForm = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [formData, setFormData] = useState({
    paymentSlip: null,
    paymentSlipPreview: null
  });

  const [userRole, setUserRole] = useState('admin');
  const [checkboxValues, setCheckboxValues] = useState({
    paymentSlip: true
  });

  const [userIdFromAdmin, setUserIdFromAdmin] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null); // State for preview modal

  useEffect(() => {
    if (state.paymentInformation.userId) {
      setFormData({
        paymentSlip: null, // Initialize the payment slip
        paymentSlipPreview: null // Initialize the payment slip preview
      });

      setCheckboxValues({
        paymentSlip: true
      });
    }
    if (state.user.role === 'user') {
      setUserRole('user');
    }
    if (state.user?.role === 'admin') {
      setUserIdFromAdmin(state.user.uid);
    }
  }, [state.companyInformation, state.user.role]);

  useEffect(() => {
    const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;
    if (userId) {
      fetchPaymentData(userId, dispatch).then(paymentData => {
        if (paymentData?.paymentSlip) {
          setFormData({
            paymentSlip: paymentData.paymentSlip,
            paymentSlipPreview: paymentData.paymentSlip.url
          });
        }
      });
    }
  }, [state.user, userIdFromAdmin, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        paymentSlip: file,
        paymentSlipPreview: previewUrl
      });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxValues({ ...checkboxValues, [name]: checked });
  };

  const uploadFile = async (file, userId) => {
    if (!file) return null;

    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `payments/${userId}/payment_slip.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, path: fileName };
    } catch (error) {
      console.error('Error uploading payment slip:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;

      // Upload payment slip
      const paymentSlipFile = formData.paymentSlip instanceof File ? formData.paymentSlip : null;
      const existingPayment = state.paymentInformation || {};

      // Upload new file or keep existing URL
      const paymentSlip = paymentSlipFile
        ? await uploadFile(paymentSlipFile, userId)
        : existingPayment.paymentSlip || null;

      // Delete old file if new one is uploaded
      if (paymentSlipFile && existingPayment.paymentSlip) {
        await deleteOldFile(existingPayment.paymentSlip.path);
      }

      const formDataToSave = {
        paymentSlip,
        status: state.user?.role === 'admin' ? 'Resubmit' : 'Pending',
        userId: userId,
      };

      const result = await savePaymentData(formDataToSave, userId);

      if (result.success) {
        alert(result.message);
        // navigate('/section-six', { state: { userId: userIdFromAdmin } });
      } else {
        alert('Error saving payment information. Please try again.');
      }

    } catch (error) {
      console.error('Error handling document: ', error);
      alert('Error saving payment information. Please try again.');
    }
  };

  // Add handleBack function
  const handleBack = () => {
    navigate('/section-four', { state: { userId: userIdFromAdmin } });
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
          <span className="ml-2 font-medium text-green-500">Payment Information</span>
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
          <div className="flex items-center justify-center w-8 h-8 text-blue-500 rounded-full">5</div>
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
              <input
                type="checkbox"
                name="paymentSlip"
                className="mr-2"
                disabled={userRole === 'user'}
                checked={checkboxValues.paymentSlip}
                onChange={handleCheckboxChange}
              />
              <label className="block font-medium">Upload Payment Slip</label>
            </div>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues.paymentSlip}
              />
              {(formData.paymentSlipPreview || (formData.paymentSlip && formData.paymentSlip.url)) && (
                <div className="mt-2" onClick={() => handlePreview(formData.paymentSlipPreview || formData.paymentSlip.url)}>
                  <img
                    src={formData.paymentSlipPreview || formData.paymentSlip.url}
                    alt="Payment Slip Preview"
                    className="w-40 h-auto object-contain border rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded"
          >
            Back
          </button>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded"
            >
              Save
            </button>
            {/* <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
            >
              Next
            </button> */}
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