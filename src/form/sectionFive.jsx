import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Import Firebase storage methods
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component
import { getStorage } from 'firebase/storage';
import { fetchPaymentData, savePaymentData } from '../utils/dashboardUtils';
import { updateOverallStatus } from '../utils/statusUpdateUtils';
import { sendUpdateEmailToAdmin, sendUpdateEmailToUser } from '../utils/emailService';
import axios from 'axios';
import { getBusinessData, getContactData, getOnepayData } from '../utils/firebaseDataService';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, storage } from '../firebase';
import { getUserDocumentByEmail, getUserRole } from '../firestore';


const PaymentForm = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { state, dispatch } = useUserContext();
  const [userIdFromAdmin, setUserIdFromAdmin] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // State for preview modal
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardPaymentCompleted, setCardPaymentCompleted] = useState(false);
  const [formData, setFormData] = useState({
    paymentSlip: null,
    paymentSlipPreview: null,
    cardPayment: null,
    cardReference: null,
  });

  const [userRole, setUserRole] = useState('admin');
  const [checkboxValues, setCheckboxValues] = useState({
    paymentSlip: true,
    cardPayment: true
  });

  // Add this state to track total amount
  const [totalAmount, setTotalAmount] = useState(0);

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
    
  useEffect(() => {
    if (state.paymentInformation.userId) {
      setFormData({
        paymentSlip: null, // Initialize the payment slip
        paymentSlipPreview: null, // Initialize the payment slip preview
        cardPayment: null,
      });

      setCheckboxValues({
        // paymentSlip: true
        paymentSlip: state.user.role === 'admin' ? false : true,
        cardPayment: state.user.role === 'admin' ? false : true,
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
          paymentSlip: paymentData.paymentSlip || null,
          paymentSlipPreview: paymentData.paymentSlip?.url || null
        });
        setCheckboxValues({
          paymentSlip: state.user.role === 'admin' ? false : state.paymentInformation.checkPaymentSlip ?? true,
        });
        setTermsAccepted(paymentData.termsAccepted || false);
      }
    });

    const fetchOnepayData = async () => {
      const onepayData = await getOnepayData(userId);
      console.log("onepayData", onepayData);
      if (onepayData?.status === 'Completed') {
        setCardPaymentCompleted(true);
        setFormData({
          cardPayment: onepayData.additionalData.enteredAmount || null, //TODO : enable this
          // cardPayment: onepayData.amount || null,
          cardReference: onepayData.additionalData.reference || null,
        });
        setCheckboxValues({
          cardPayment: false
        });
      }


    };

    fetchOnepayData();
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

  // Modify the handleChange function or add a new one for card payment
  const handleCardPaymentChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    const processingFee = amount * 0.03;
    const total = amount + processingFee;

    setFormData({
      ...formData,
      cardPayment: amount
    });
    setTotalAmount(total);
  };

  const handlePaymentClick = async () => {
    // Generate a unique reference number
    const reference = `ref${new Date().getTime()}`;
    console.log("reference", reference);
    const amount = "150";//TODO : 2 DECIMAL PLACES

    const contactData = await getContactData(state.user.uid);
    // Get the cloud function URL from Firebase
    // const callbackUrl = `https://${process.env.APP_REGION}-${process.env.APP_PROJECT_ID}.cloudfunctions.net/onepayCallback`;


    let data = JSON.stringify({
      "currency": "LKR",
      "amount": amount,
      "app_id": "CBN01190734B13223DDA9",
      "reference": reference,
      "customer_first_name": "Mr./Mrs.",
      "customer_last_name": contactData?.contactPersonName || "xxxx",
      "customer_phone_number": contactData?.contactPersonPhone || "+94777777777",
      "customer_email": contactData?.contactPersonEmail || "user@example.com",
      "transaction_redirect_url": window.location.origin + "/section-five",
      "hash": "1ee71507ddd93f082f51740b1c0fc80298d1d99ef758d9b7132df209628c5a71",
      "additional_data": JSON.stringify({
        userId: state.user.uid,
        reference: reference,
        enteredAmount: formData.cardPayment,
        timestamp: new Date().toISOString()
      }),
    });

    // First save the onepay reference to Firestore
    const saveOnepayRef = async () => {
      try {
        const onepayRef = collection(db, 'onepay');
        await addDoc(onepayRef, {
          userId: state.user.uid,
          reference: reference,
          status: 'Pending',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving onepay reference:', error);
        return;
      }
    };


    // Save reference then make onepay request
    saveOnepayRef().then(() => {
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

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
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

  const sendSubmitEmail = async () => {
    const contactData = await getContactData(state.user.uid);
    const businessData = await getBusinessData(state.user.uid);
    const companyName = businessData?.companyName || "xxxxx";
    const contactPersonName = contactData?.contactPersonName || "xxxx xxxx";
    const contactPersonEmail = contactData?.contactPersonEmail || "xxx@xxx.com";
    const contactPersonPhone = contactData?.contactPersonPhone || "0777777777";

    const submissionDate = new Date().toLocaleDateString();
    try {
      const emailContent = {
        to: 'nisaldayan@gmail.com', //admin email
        message: {
          subject: 'NOTCHLN - New Application Submission',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4A90E2; font-size: 30px; font-weight: bold; margin: 0;">NOTCHLN</h1>
              </div>
              
              <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 24px; margin-bottom: 20px; text-align: center;">New Application Submission</h2>
                
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">
                  A new application has been submitted for review.
                </p>
                
                <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 25px 0;">
                  <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">Applicant Details:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #555; width: 40%;">Company Name:</td>
                      <td style="padding: 8px 0; color: #333;">${companyName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #555; width: 40%;">Contact Person:</td>
                      <td style="padding: 8px 0; color: #333;">${contactPersonName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #555;">Email:</td>
                      <td style="padding: 8px 0; color: #333;">${contactPersonEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #555;">Phone:</td>
                      <td style="padding: 8px 0; color: #333;">${contactPersonPhone}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #555;">Submission Date:</td>
                      <td style="padding: 8px 0; color: #333;">${submissionDate}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://notchln.com/admin/dashboard" 
                     style="background-color: #4A90E2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View Application
                  </a>
                </div>
              </div>
              
              <div style="color: #777; font-size: 12px; text-align: center; margin-top: 20px;">
                <p>This is an automated notification from the NOTCHLN application system.</p>
              </div>
              
              <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #777; font-size: 12px;">
                  © ${new Date().getFullYear()} NOTCHLN. All rights reserved.
                </p>
              </div>
            </div>
          `
        }
      };

      const response = await fetch('https://us-central1-e-corporate.cloudfunctions.net/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContent)
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      console.log('Submission notification sent to admin successfully');
    } catch (error) {
      console.error('Error sending submission notification:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.paymentSlip && !cardPaymentCompleted) {
      alert('Please complete the card payment or upload payment slip before submitting.');
      return;
    }
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }


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
        checkPaymentSlip: state.user.role === 'user' ? false : checkboxValues.paymentSlip,
        checkCardPayment: state.user.role === 'user' ? false : checkboxValues.cardPayment,
        cardPayment: formData.cardPayment,
        cardReference: formData.cardReference,
        status: state.user?.role === 'admin' ? 'Resubmit' : 'Pending',
        userId: userId,
        createdAt: serverTimestamp(),
        termsAccepted: termsAccepted,
        termsAcceptedAt: serverTimestamp()
      };

      // Check if document exists and update or create accordingly
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'payments', querySnapshot.docs[0].id);
        await updateDoc(docRef, formDataToSave);
        await updateOverallStatus(userId, state, dispatch);
        if (userRole !== 'user') {
          await sendUpdateEmailToUser(userId);
        } else {
          await sendUpdateEmailToAdmin(userId);
        }
        console.log('Payment information updated successfully!');
      } else {
        await addDoc(paymentsRef, formDataToSave);
        await sendSubmitEmail();
        console.log('Payment information saved successfully!');
      }

      // Update context
      dispatch({
        type: 'SET_PAYMENT_INFORMATION',
        payload: {
          paymentSlip,
          status: formDataToSave.status,
          userId: formDataToSave.userId,
          termsAccepted: termsAccepted,
          termsAcceptedAt: serverTimestamp()
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
          <div className="mb-4 bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="paymentSlip"
                  className="mr-2"
                  checked={checkboxValues.paymentSlip}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Upload Payment Slip</label>
            </div>
            <div className="space-y-2 ">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues.paymentSlip}
                required={formData.paymentSlip ? false : true}
              />
              <div className="space-y-2 flex justify-center">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-10 rounded py-3"
                  onClick={() => handleView(formData.paymentSlip?.url)}
                >
                  View
                </button>
              </div>
            </div>
            {formData.paymentSlip?.url && (
              <span className='text-green-500'>File Uploaded!</span>
            )}
          </div>

          {/* Card Payment */}
          <div className="mb-4 bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="cardPayment"
                  className="mr-2"
                  checked={checkboxValues.cardPayment}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Card Payment</label>
            </div>
            <div className="space-y-2 ">
              <input
                type="number"
                name="cardPayment"
                value={formData.cardPayment}
                placeholder="ENTER AMOUNT"
                onChange={handleCardPaymentChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues.cardPayment}
                required={formData.cardPayment ? false : true}
              />
              {formData.cardPayment > 0 && (
                <div className="text-sm space-y-1">
                  <p>Amount: LKR {formData.cardPayment.toLocaleString()}</p>
                  <p>Processing fee (3%): LKR {(formData.cardPayment * 0.03).toLocaleString()}</p>
                  <p className="font-semibold">Total amount: LKR {totalAmount.toLocaleString()}</p>
                </div>
              )}
              <div className="space-y-2 flex justify-center">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-10 rounded py-3"
                  onClick={handlePaymentClick}
                >
                  Pay
                </button>
              </div>
            </div>
            {cardPaymentCompleted && (
              <span className='text-green-500'>Payment Successful!</span>
            )}
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={handleTermsChange}
            className="mr-2"
            required
          />
          <p className="text-black">
            * I have read and agree to the &nbsp;
            <a
              href="https://corporate.lk/terms%20&%20conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Terms and Conditions.
            </a>

          </p>
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
              Submit
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