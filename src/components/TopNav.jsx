import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../auth';
import logo from '../assets/long.png'; // Importing the logo

const TopNav = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility

  const handleLogout = async () => {
    try {
      await logOut();
      setUserInfo(null);
      alert('User logged out successfully!');
    } catch (error) {
      setError('Error logging out: ' + error.message);
    }
    navigate('/');
  };

  const handleFormClick = () => {
    setShowModal(true); // Show modal when "Form" link is clicked
  };

  const handleModalClose = (accepted) => {
    setShowModal(false);
    if (accepted) {
      navigate('/section-one'); // Redirect to the form page if user accepts
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full p-4 text-white bg-gray-100 rounded-md shadow-lg bg-opacity-60 backdrop-blur-lg">
      <div className="flex items-center justify-between mr-14 ml-14">
        <img
          src={logo} // Using the imported logo
          alt="Logo"
          className="h-10" // Adjust size as needed
        />
        <ul className="flex space-x-6 text-gray-800">
          <li>
            <Link to="/dashboard" className="font-medium transition-colors duration-300 hover:text-blue-500">
              Home
            </Link>
          </li>
          <li>
            <button
              onClick={handleFormClick}
              className="font-medium transition-colors duration-300 hover:text-blue-500"
            >
              Form
            </button>
          </li>
          <li>
            <Link
              to="https://corporate.lk/terms%20&%20conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors duration-300 hover:text-blue-500"
            >
              Terms 
            </Link>
          </li>
          {/* Add more navigation links here */}
        </ul>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white transition duration-300 bg-red-500 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Modal for Terms and Conditions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50 mt-52">
          <div className="bg-white p-6 rounded-lg w-1/3 max-w-lg shadow-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center text-blue-600">Terms and Conditions</h2>
            <p className="mt-4 text-black ">
              By accessing or using the Services, you agree to be bound by these Terms as if signed by you.
              <br />
              <a
                href="https://corporate.lk/terms%20&%20conditions" // Terms and conditions link
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-blue-600 underline"
              >
                Click here to read the full Terms and Conditions.
              </a>
            </p>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleModalClose(false)}
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModalClose(true)}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNav;
