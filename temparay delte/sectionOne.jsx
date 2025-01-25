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

const CorporateBusinessForm = () => {
  const { state, dispatch } = useUserContext();
  console.log("state is the one", state);

  const navigate = useNavigate(); // Initialize useNavigate hook
  const [userRole, setUserRole] = useState('admin');
  const location = useLocation();
  const userIdFromAdmin = location.state?.userId;
  console.log("userIdFromAdmin from section one", userIdFromAdmin);

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

  const [emailVerification, setEmailVerification] = useState({
    isVerified: false,
    verificationSent: false,
    error: ''
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

      if (user?.emailVerified && user.email === formData.contactPersonEmail) {
        console.log('Email verified for:', user.email);
        setEmailVerification(prev => ({
          ...prev,
          isVerified: true,
          verificationSent: false,
          error: ''
        }));

        // Update Firestore
        try {
          const contactsRef = collection(db, 'contacts');
          const q = query(contactsRef, where('userId', '==', state.companyInformation.userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
              emailVerified: true,
              contactPersonEmail: formData.contactPersonEmail
            });
          }
        } catch (error) {
          console.error('Error updating verification status:', error);
        }
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

  const checkVerificationStatus = async () => {
    try {
      // Get current auth user
      const currentUser = auth.currentUser;
      console.log('Current User:', currentUser);

      if (currentUser) {
        // Force refresh to get latest verification status
        await currentUser.reload();
        console.log('Email Verified Status:', currentUser.emailVerified);

        if (currentUser.emailVerified && currentUser.email === formData.contactPersonEmail) {
          setEmailVerification(prev => ({
            ...prev,
            isVerified: true,
            verificationSent: false,
            error: ''
          }));

          // Update Firestore
          const contactsRef = collection(db, 'contacts');
          const q = query(contactsRef, where('userId', '==', state.companyInformation.userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
              emailVerified: true,
              contactPersonEmail: formData.contactPersonEmail
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

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

    checkVerificationStatus();

    console.log('Verification Status:', {
      checkboxEnabled: checkboxValues.contactPersonEmail,
      isVerified: emailVerification.isVerified,
      email: formData.contactPersonEmail
    });

    // Check if email verification is required and completed
    if (checkboxValues.contactPersonEmail && !emailVerification.isVerified) {
      alert('Please verify the contact person email before submitting the form.');
      // Scroll to the email input field
      const emailInput = document.querySelector('input[name="contactPersonEmail"]');
      emailInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    } else {
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
          createdAt: serverTimestamp(),
          userId: state.user.uid,
          emailVerified: emailVerification.isVerified
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
          createdAt: serverTimestamp(),
          emailVerified: emailVerification.isVerified
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

        // Redirect user to form2 after successful submission
        navigate('/section-two', { state: { userId: userIdFromAdmin } });

      } catch (error) {
        console.error('Error handling document: ', error);
        alert('Error saving contact. Please try again.');
      }
    };
  };

  const handleNext = () => {
    navigate('/section-two', { state: { userId: userIdFromAdmin } });

  };

  const handleEmailVerification = async () => {
    try {
      setEmailVerification(prev => ({ ...prev, error: '', verificationSent: true }));

      // Initialize a new Firebase app instance for verification
      const verificationAuth = getAuth();
      await setPersistence(verificationAuth, browserSessionPersistence);

      const tempPassword = Math.random().toString(36).slice(-8);

      // Disable auth state listener temporarily
      const unsubscribe = onAuthStateChanged(auth, () => { });

      try {
        // Use the verification auth instance
        const userCredential = await createUserWithEmailAndPassword(verificationAuth, formData.contactPersonEmail, tempPassword);
        await sendEmailVerification(userCredential.user);
        await signOut(verificationAuth);

        setEmailVerification(prev => ({
          ...prev,
          verificationSent: true,
          message: 'Verification email sent! Please check your email.'
        }));
      } finally {
        // Re-enable auth state listener
        unsubscribe();
      }

    } catch (error) {
      console.error('Error in email verification:', error);
      setEmailVerification(prev => ({
        ...prev,
        error: 'Error sending verification email. Please try again.',
        verificationSent: false
      }));
    }
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
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  name="contactPersonEmail"
                  value={formData.contactPersonEmail}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues.contactPersonEmail}
                />
              </div>
              {checkboxValues.contactPersonEmail && formData.contactPersonEmail && !emailVerification.isVerified && (
                <button
                  type="button"
                  onClick={handleEmailVerification}
                  className="min-w-[120px] h-12 px-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={emailVerification.verificationSent}
                >
                  {emailVerification.verificationSent ? 'Sent' : 'Verify Email'}
                </button>
              )}
              {emailVerification.isVerified && (
                <div className="flex items-center text-green-600">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </div>
              )}
            </div>
            {emailVerification.error && (
              <p className="mt-2 text-sm text-red-600">{emailVerification.error}</p>
            )}
            {emailVerification.verificationSent && !emailVerification.isVerified && (
              <p className="mt-2 text-sm text-green-600">
                Please check your email for verification link. Click the link to verify your email address.
              </p>
            )}
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
      </form>
    </div>
  );
};

export default CorporateBusinessForm;
