import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { getFormDocumentIdByUserid, getUserRole } from "../firestore";
import SideNav from "../components/TopNav";
import { FaRegEdit, FaDownload, FaCheckCircle, FaExclamationCircle, FaRegFileAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState('');
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const contactData = await getFormDocumentIdByUserid(state.user.uid);
        console.log("Fetched contact data: ", contactData);

        const registrationStatus = await getUserRole(state.user.uid);

        setFormProgress(contactData ? contactData.progress : 0);

        dispatch({
          type: 'SET_COMPANY_INFORMATION',
          payload: {
            ...contactData,
            registrationStatus
          }
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (state.user?.uid) {
      fetchUserData();
    }
  }, [state.user, dispatch]);

  const handleEditClick = () => {
    navigate('/section-one', { state: { mode: 'edit' } });
  };

  const handleViewSummaryClick = () => {
    navigate('/summary');
  };

  const handleSignatureUploadClick = () => {
    navigate('/upload-signature');
  };

  const handleResubmissionRequestClick = () => {
    navigate('/resubmission-request');
  };

  const handleDownloadSummary = () => {
    console.log('Downloading PDF summary...');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />

      <div className="flex flex-col items-start justify-start w-full px-8 pt-16">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Welcome, {state.user?.name}</h1>

        {/* Form Progress Section */}
        <div className="w-full p-8 mb-8 transition-all transform bg-white shadow-xl rounded-3xl hover:scale-105 hover:shadow-2xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Form Progress</h2>
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-gray-700">{formProgress}%</span>
            </div>
            <div className="flex mb-6">
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className="h-3 bg-blue-500 rounded-full"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={handleEditClick}
              className="px-6 py-3 font-medium text-white transition-all transform bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105"
            >
              Edit Form
            </button>
          </div>
        </div>

        {/* Data Submission & PDF Summary */}
        <div className="w-full p-8 mb-8 transition-all transform bg-white shadow-xl rounded-3xl hover:scale-105 hover:shadow-2xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Data Submission & PDF Summary</h2>
          <p className="mb-4 text-gray-600">Download a summary of your submitted data in PDF format.</p>
          <div className="flex space-x-6">
            <button
              onClick={handleDownloadSummary}
              className="px-6 py-3 font-medium text-white transition-all transform bg-yellow-600 rounded-full shadow-lg hover:bg-yellow-700 hover:scale-105"
            >
              Download Summary <FaDownload className="inline ml-2" />
            </button>
            <button
              onClick={handleViewSummaryClick}
              className="px-6 py-3 font-medium text-white transition-all transform bg-gray-600 rounded-full shadow-lg hover:bg-gray-700 hover:scale-105"
            >
              View Summary <FaRegFileAlt className="inline ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
