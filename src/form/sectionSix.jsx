import React, { useState } from 'react';
import { auth } from '../firebase'; // Ensure Firebase is correctly set up
import { RecaptchaVerifier, signInWithPhoneNumber, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import SideNav from "../components/TopNav"; // Importing the TopNav component


const OtpVerificationForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    emailOtp: '',
    phoneOtp: ''
  });

  const [verificationIds, setVerificationIds] = useState({
    phoneVerificationId: null
  });

  const [otpSent, setOtpSent] = useState({
    emailOtpSent: false,
    phoneOtpSent: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEmailVerification = async () => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(formData.email, 'temporaryPassword'); // You should ensure this is a valid flow
      await sendEmailVerification(userCredential.user);
      setOtpSent({ ...otpSent, emailOtpSent: true });
      alert("Email OTP sent!");
    } catch (error) {
      console.error('Error sending email OTP:', error);
      alert('Error sending email OTP. Please try again.');
    }
  };

  const handlePhoneVerification = () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        console.log("Recaptcha verified");
      }
    }, auth);

    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, formData.phone, appVerifier)
      .then((confirmationResult) => {
        setVerificationIds({ ...verificationIds, phoneVerificationId: confirmationResult.verificationId });
        setOtpSent({ ...otpSent, phoneOtpSent: true });
        alert('Phone OTP sent!');
      })
      .catch((error) => {
        console.error('Error sending phone OTP:', error);
        alert('Error sending phone OTP. Please try again.');
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify both OTPs
    let verificationSuccess = true;

    // Email OTP verification
    if (formData.emailOtp && otpSent.emailOtpSent) {
      try {
        const userCredential = await auth.signInWithEmailAndPassword(formData.email, 'temporaryPassword');
        if (userCredential.user.emailVerified) {
          alert('Email verified successfully!');
        } else {
          alert('Please verify your email.');
          verificationSuccess = false;
        }
      } catch (error) {
        alert('Error verifying email OTP. Please try again.');
        verificationSuccess = false;
      }
    }

    // Phone OTP verification
    if (formData.phoneOtp && verificationIds.phoneVerificationId) {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationIds.phoneVerificationId,
        formData.phoneOtp
      );
      try {
        await auth.currentUser.linkWithCredential(credential);
        alert('Phone verified successfully!');
      } catch (error) {
        alert('Error verifying phone OTP. Please try again.');
        verificationSuccess = false;
      }
    }

    if (verificationSuccess) {
      navigate('/next-page'); // Redirect to the next page after successful verification
    }
  };

  const handleBack = () => {
    navigate('/section-five');
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
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">3</div>
          <span className="ml-2 font-medium text-green-500">Payment Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">5</div>
          <span className="ml-2 font-medium text-blue-500">Contact Verification</span>
        </div>

      </div>

      <h2 className="mb-6 text-2xl font-semibold text-center">Email and Phone Verification</h2>
      <form onSubmit={handleSubmit} className="grid max-w-4xl grid-cols-1 gap-6 p-6 mx-auto bg-white rounded-lg shadow-xl">

        {/* Email Section */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            required
          />
          <button
            type="button"
            onClick={handleEmailVerification}
            className={`px-6 py-3 mt-3 text-white bg-blue-500 rounded-lg ${otpSent.emailOtpSent ? 'bg-gray-500 cursor-not-allowed' : ''}`}
            disabled={otpSent.emailOtpSent}
          >
            {otpSent.emailOtpSent ? 'OTP Sent' : 'Send Email OTP'}
          </button>
          {otpSent.emailOtpSent && (
            <>
              <div className="mt-3">
                <label htmlFor="emailOtp" className="block mb-2 font-medium">Enter OTP Code</label>
                <input
                  type="text"
                  name="emailOtp"
                  value={formData.emailOtp}
                  onChange={handleChange}
                  placeholder="Enter Email OTP"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                />
              </div>
            </>
          )}
        </div>

        {/* Phone Section */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
            required
          />
          <button
            type="button"
            onClick={handlePhoneVerification}
            className={`px-6 py-3 mt-3 text-white bg-blue-500 rounded-lg ${otpSent.phoneOtpSent ? 'bg-gray-500 cursor-not-allowed' : ''}`}
            disabled={otpSent.phoneOtpSent}
          >
            {otpSent.phoneOtpSent ? 'OTP Sent' : 'Send Phone OTP'}
          </button>
          {otpSent.phoneOtpSent && (
            <>
              <div className="mt-3">
                <label htmlFor="phoneOtp" className="block mb-2 font-medium">Enter OTP Code</label>
                <input
                  type="text"
                  name="phoneOtp"
                  value={formData.phoneOtp}
                  onChange={handleChange}
                  placeholder="Enter Phone OTP"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                />
              </div>
              <div id="recaptcha-container" className="mt-3"></div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Form
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OtpVerificationForm;
