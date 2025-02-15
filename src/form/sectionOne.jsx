import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; // Import the Firestore and Auth databases
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate for redirection
import SideNav from "../components/TopNav"; // Importing the TopNav component
import { getFormDocumentIdByUserid } from '../firestore';
import { fetchContactData } from '../utils/dashboardUtils';
import { getUserDocumentByEmail, getUserRole } from '../firestore';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { updateOverallStatus } from '../utils/statusUpdateUtils';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { sendUpdateEmailToAdmin, sendUpdateEmailToUser } from '../utils/emailService';

const CorporateBusinessForm = () => {
  const { state, dispatch } = useUserContext();
  console.log("state is the one", state);

  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('admin');
  const location = useLocation();
  const userIdFromAdmin = localStorage.getItem('applicationUserId');
  console.log("userIdFromAdmin from section one", userIdFromAdmin);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    registrationPlan: '',
    contactPersonTitle: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: ''
  });

  const [checkboxValues, setCheckboxValues] = useState({
    email: true,
    registrationPlan: true,
    contactPersonTitle: true,
    contactPersonName: true,
    contactPersonEmail: true,
    contactPersonPhone: true
  });

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

    const userId = state.user.role === 'admin' ? userIdFromAdmin : state.user.uid;
    console.log("userId from useEffect", userId);

    if (userId && !formData.email) { // Only fetch and set data if form is empty
      fetchContactData(userId, dispatch).then(() => {
        // Only set form data if current form is empty
        setFormData({
          email: state.companyInformation.email || '',
          registrationPlan: state.companyInformation.registrationPlan || '',
          contactPersonTitle: state.companyInformation.contactPersonTitle || '',
          contactPersonName: state.companyInformation.contactPersonName || '',
          contactPersonEmail: state.companyInformation.contactPersonEmail || '',
          contactPersonPhone: state.companyInformation.contactPersonPhone || ''
        });

        setCheckboxValues({
          email: state.user.role === 'admin' ? false : state.companyInformation.checkEmail ?? true,
          registrationPlan: state.user.role === 'admin' ? false : state.companyInformation.checkRegistrationPlan ?? true,
          contactPersonTitle: state.user.role === 'admin' ? false : state.companyInformation.checkContactPersonTitle ?? true,
          contactPersonName: state.user.role === 'admin' ? false : state.companyInformation.checkContactPersonName ?? true,
          contactPersonEmail: state.user.role === 'admin' ? false : state.companyInformation.checkContactPersonEmail ?? true,
          contactPersonPhone: state.user.role === 'admin' ? false : state.companyInformation.checkContactPersonPhone ?? true
        });
      });
    }

    if (state.user.role === 'user') {
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
        checkEmail: state.user.role === 'user' ? false : checkboxValues.email,
        checkRegistrationPlan: state.user.role === 'user' ? false : checkboxValues.registrationPlan,
        checkContactPersonTitle: state.user.role === 'user' ? false : checkboxValues.contactPersonTitle,
        checkContactPersonName: state.user.role === 'user' ? false : checkboxValues.contactPersonName,
        checkContactPersonEmail: state.user.role === 'user' ? false : checkboxValues.contactPersonEmail,
        checkContactPersonPhone: state.user.role === 'user' ? false : checkboxValues.contactPersonPhone,
        status: 'Pending',
        overallStatus: 'Pending',
        createdAt: serverTimestamp(),
        userId: state.user.uid
      };

      const dataToUpdate = {
        ...formData,
        checkEmail: state.user.role === 'user' ? false : checkboxValues.email,
        checkRegistrationPlan: state.user.role === 'user' ? false : checkboxValues.registrationPlan,
        checkContactPersonTitle: state.user.role === 'user' ? false : checkboxValues.contactPersonTitle,
        checkContactPersonName: state.user.role === 'user' ? false : checkboxValues.contactPersonName,
        checkContactPersonEmail: state.user.role === 'user' ? false : checkboxValues.contactPersonEmail,
        checkContactPersonPhone: state.user.role === 'user' ? false : checkboxValues.contactPersonPhone,
        status: state.user.role === 'admin' ? 'Resubmit' : 'Pending',
        createdAt: serverTimestamp()
      };

      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where('userId', '==', state.companyInformation.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);
        await updateDoc(docRef, dataToUpdate);
        await updateOverallStatus(state.companyInformation.userId, state, dispatch);

        if (userRole !== 'user') {
          await sendUpdateEmailToUser(state.companyInformation.userId);
        } else {
          await sendUpdateEmailToAdmin(state.companyInformation.userId);
        }

        console.log('Contact updated successfully!');
      } else {
        await addDoc(collection(db, 'contacts'), dataToAdd);
        console.log('Contact saved successfully!');
      }

      // Redirect user to form2 after successful submission
      navigate('/section-two', { state: { userId: userIdFromAdmin } });

    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving contact. Please try again.');
    }
  };

  const handleNext = () => {
    navigate('/section-two', { state: { userId: userIdFromAdmin } });

  };


  const generateOtp = () => {
    // Generate a 6-digit number between 100000 and 999999
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(otp);
    return otp;
  };

  const handleEmailVarification = async () => {
    const otp = generateOtp();
    console.log("otp is", otp);

    try {
      const emailContent = {
        to: formData.contactPersonEmail,
        message: {
          subject: 'NOTCHLN - Email Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4A90E2; font-size: 30px; font-weight: bold; margin: 0;">NOTCHLN</h1>
              </div>
              
              <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 24px; margin-bottom: 20px; text-align: center;">Email Verification</h2>
                
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">
                  Please use the following verification code to complete your email verification process:
                </p>
                
                <div style="background-color: #fff; padding: 15px; border-radius: 5px; text-align: center; margin: 25px 0;">
                  <h1 style="color: #4A90E2; font-size: 36px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                </div>
                
                <p style="color: #555; font-size: 14px; text-align: center; margin-top: 20px;">
                  This verification code will expire in 10 minutes for security purposes.
                </p>
              </div>
              
              <div style="color: #777; font-size: 12px; text-align: center; margin-top: 20px;">
                <p>This is an automated message, please do not reply.</p>
                <p>If you did not request this verification code, please ignore this email.</p>
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

      alert('OTP sent successfully!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };


  const handleVarify = () => {
    console.log("Email otp clicked");
  };

  return (
    <div className="p-6 mx-auto mt-12 bg-gray-100 rounded-lg shadow-lg max-w-8xl">
      <SideNav />
      <div className="flex items-center justify-between mb-6 ">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">1</div>
          <span className="ml-2 font-medium text-blue-500">Contact Information
          </span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">3</div>
          <span className="ml-2 text-gray-600">Business Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">4</div>
          <span className="ml-2 text-gray-600">Director Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">5</div>
          <span className="ml-2 text-gray-600">Shareholder Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">6</div>
          <span className="ml-2 text-gray-600">Payment Verification</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">7</div>
          <span className="ml-2 text-gray-600">Contact Verification</span>
        </div>

      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid max-w-4xl grid-cols-1 gap-6 p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h2 className="col-span-1 mb-4 text-2xl font-semibold text-center">Contact information</h2>
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Email */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="email"
                  className="mr-2"
                  checked={checkboxValues.email}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Email Address</label>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md uppercase"
              disabled={!checkboxValues.email}
              required
            />
          </div>

          {/* Registration Plan */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="registrationPlan"
                  className="mr-2"
                  checked={checkboxValues.registrationPlan}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Corporate Business Registration Plans</label>
            </div>
            <select
              name="registrationPlan"
              value={formData.registrationPlan}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.registrationPlan}
              required
            >
              <option value="">SELECT REGISTRATION PLAN</option>
              <option value="STARTUP 20000/= (PRIVATE LIMITED)">STARTUP 20000/= (PRIVATE LIMITED)</option>
              <option value="PROFESSIONAL 21400/= (PRIVATE LIMITED)">PROFESSIONAL 21400/= (PRIVATE LIMITED)</option>
              <option value="ENTERPRISE 35000/= (PRIVATE LIMITED)">ENTERPRISE 35000/= (PRIVATE LIMITED)</option>
              <option value="EXPORT IMPORT COMBO 26400/= (PRIVATE LIMITED)">EXPORT IMPORT COMBO 26400/= (PRIVATE LIMITED)</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* Contact Person Title */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="contactPersonTitle"
                  className="mr-2"
                  checked={checkboxValues.contactPersonTitle}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Contact Person Title</label>
            </div>
            <select
              name="contactPersonTitle"
              value={formData.contactPersonTitle}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.contactPersonTitle}
              required
            >
              <option value="">SELECT TITLE</option>
              <option>MR</option>
              <option>MRS</option>
              <option>MISS</option>
              <option>PROF</option>
              <option>DR</option>
              <option>REV</option>
            </select>
          </div>

          {/* Contact Person Name */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="contactPersonName"
                  className="mr-2"
                  checked={checkboxValues.contactPersonName}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Full Name</label>
            </div>
            <input
              type="text"
              name="contactPersonName"
              value={formData.contactPersonName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md uppercase"
              disabled={!checkboxValues.contactPersonName}
              required
            />
          </div>

          {/* Contact Person Email */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="contactPersonEmail"
                  className="mr-2"
                  checked={checkboxValues.contactPersonEmail}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Contact Person's Email Address</label>
            </div>
            <div className="flex mb-3">
              <input
                type="email"
                name="contactPersonEmail"
                value={formData.contactPersonEmail}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md uppercase"
                disabled={!checkboxValues.contactPersonEmail}
                required
              />
              <button
                type="button"
                onClick={handleEmailVarification}
                className="ms-2 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
              >
                Send
              </button>
            </div>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter OTP"
                name="contactPersonEmailVarified"
                value={formData.contactPersonEmailVarified}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md uppercase"

              />
              <button
                type="button"
                onClick={handleVarify}
                className="ms-2 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
              >
                Verify
              </button>
            </div>
          </div>

          {/* Contact Person Phone */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {userRole !== 'user' && (
                <input
                  type="checkbox"
                  name="contactPersonPhone"
                  className="mr-2"
                  checked={checkboxValues.contactPersonPhone}
                  onChange={handleCheckboxChange}
                />
              )}
              <label className="block font-medium">Contact Person's Phone Number</label>
            </div>
            <input
              type="tel"
              name="contactPersonPhone"
              value={formData.contactPersonPhone}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and ensure starts with 0
                if (
                  (/^\d*$/.test(value) || value === '') && // Only numbers
                  (value.length === 0 || value[0] === '0') && // Must start with 0
                  value.length <= 10 // Max 10 digits
                ) {
                  handleChange(e);
                }
              }}
              pattern="0[0-9]{9}"
              maxLength="10"
              placeholder="0XXXXXXXXX"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
              disabled={!checkboxValues.contactPersonPhone}
              required
              title="Phone number must start with 0 and be 10 digits long"
            />
          </div>

        </div>
        <div className="flex justify-end mt-6">
          {/* <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button> */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
            >
              Next
            </button>
          </div>
        </div>
        <div className="mt-4">
          <hr className="mb-8 border-gray-300" />
          <p className="my-4 text-center text-black">By accessing or using the Services, you agree to be bound by these Terms as if signed by you.</p>
        </div>
      </form>
    </div>
  );
};

export default CorporateBusinessForm;
