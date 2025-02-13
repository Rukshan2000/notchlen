import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // Import Firebase Storage
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Import Firebase storage methods
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component
import { getStorage } from 'firebase/storage';
import { fetchPaymentData, savePaymentData } from '../utils/dashboardUtils';
import { updateOverallStatus } from '../utils/statusUpdateUtils';

import axios from 'axios';


const PaymentForm = () => {
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
        // paymentSlip: true
        paymentSlip: state.user.role === 'admin' ? false : true,
      });
    }
    if (state.user.role === 'user') {
      setUserRole('user');
    }
    if (state.user?.role === 'admin') {
      setUserIdFromAdmin(localStorage.getItem('applicationUserId'));
    }
  }, [state.companyInformation, state.user.role]);

  useEffect(() => {
    const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;
    fetchPaymentData(userId, dispatch).then(paymentData => {
      if (paymentData?.paymentSlip) {
        setFormData({
          paymentSlip: paymentData.paymentSlip,
          paymentSlipPreview: paymentData.paymentSlip.url
        });
        setCheckboxValues({
          paymentSlip: state.user.role === 'admin' ? false : true,
        });
      }
    });


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

  const handlePaymentClick = async () => {
    // Generate a unique reference number
    const reference = `ref${new Date().getTime()}`;
    console.log("reference", reference);

    // Get the cloud function URL from Firebase
    // const callbackUrl = `https://${process.env.APP_REGION}-${process.env.APP_PROJECT_ID}.cloudfunctions.net/onepayCallback`;


    let data = JSON.stringify({
      "currency": "LKR",
      "amount": 150.00,
      "app_id": "CBN01190734B13223DDA9",
      "reference": reference,
      "customer_first_name": state.companyInformation?.contactPersonName || "first name",
      "customer_last_name": "last name",
      "customer_phone_number": state.companyInformation?.contactPersonPhone || "+94777777777",
      "customer_email": state.companyInformation?.contactPersonEmail || "user@example.com",
      "transaction_redirect_url": window.location.origin + "/payment-success",
      "hash": "1ee71507ddd93f082f51740b1c0fc80298d1d99ef758d9b7132df209628c5a71",
      "additional_data": JSON.stringify({
        userId: state.user.uid,
        timestamp: reference
      }),
    });

    // First save the payment reference to Firestore
    const savePaymentRef = async () => {
      try {
        const paymentRef = collection(db, 'payments');
        await addDoc(paymentRef, {
          userId: state.user.uid,
          reference: reference,
          amount: 150.00,
          status: 'Pending',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving payment reference:', error);
        return;
      }
    };


    // Save reference then make payment request
    savePaymentRef().then(() => {
      axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.onepay.lk/v3/checkout/link/',
        headers: {
          'Authorization': 'ab9e37baf2579dd2ca7ba920bbad67e9df7a65c10443ff330b2dd66a67a81d08cefd9751f596e9b2.YX4E1190734B13223DE36',
          'Content-Type': 'application/json'
        },
        data: data
      })
        .then((response) => {
          console.log("payment response", response.data.data.gateway.redirect_url);
          const redirectUrl = response.data.data.gateway.redirect_url;
          // Use navigate for redirection

          window.open(redirectUrl, '_blank');

        })
        .catch((error) => {
          console.log("payment error", error);
        });
    });
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

      // Get existing payment data
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const existingPayment = querySnapshot.empty ? {} : querySnapshot.docs[0].data();

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
        createdAt: serverTimestamp(),
      };

      // Check if document exists and update or create accordingly
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'payments', querySnapshot.docs[0].id);
        await updateDoc(docRef, formDataToSave);
        await updateOverallStatus(userId, state, dispatch);

        console.log('Payment information updated successfully!');
      } else {
        await addDoc(paymentsRef, formDataToSave);
        console.log('Payment information saved successfully!');
      }

      // Update context
      dispatch({
        type: 'SET_PAYMENT_INFORMATION',
        payload: {
          paymentSlip,
          status: formDataToSave.status,
          userId: formDataToSave.userId
        }
      });

      // Only update local checkbox state if user is not admin
      if (state.user?.role !== 'admin') {
        setCheckboxValues({
          paymentSlip: true
        });
      }

      navigate('/dashboard');

    } catch (error) {
      console.error('Error handling document: ', error);
      console.log('Error saving payment information. Please try again.');
    }
  };

  // Add handleBack function
  const handleBack = () => {
    navigate('/section-four', { state: { userId: userIdFromAdmin } });
  };


  const handleView = (url) => {
    window.open(url, '_blank');
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  const handleNext = () => {
    navigate('/section-six', { state: { userId: userIdFromAdmin } });
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
      <form className="grid max-w-4xl grid-cols-1 gap-6 p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h2 className="col-span-1 mb-4 text-2xl font-semibold text-center">Payment information</h2>
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
            <div className="space-y-2 flex items-center">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues.paymentSlip}
              />
              <button
                className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                onClick={() => handleView(formData.paymentSlip?.url)}
              >
                View
              </button>
            </div>
            {formData.paymentSlip?.url && (
              <span className='text-green-500'>File Uploaded!</span>
            )}
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
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handlePaymentClick}
              className="px-4 py-2 font-semibold text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Payment
            </button>
            {/* <button
              type="button"
              onClick={handleNext}
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

export default PaymentForm;