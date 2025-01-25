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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const contactData = await getFormDocumentIdByUserid(state.user.uid);
        const registrationStatus = await getUserRole(state.user.uid);

        setUserStatus(contactData?.status || "Pending");

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-400";
      case "Pending":
        return "bg-yellow-400";
      case "ReSubmit":
        return "bg-orange-400";
      case "Rejected":
        return "bg-red-400";
      default:
        return "bg-gray-300";
    }
  };

  const handleEditClick = () => {
    navigate('/section-one', { state: { mode: 'edit' } });
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

  const handleViewSummaryClick = () => {
    navigate('/summary');
  };

  const sections = [
    { name: "Contact information", status: userStatus },
    { name: "Business Information", status: userStatus },
    { name: "Director Information", status: userStatus },
    { name: "Shareholder Information", status: userStatus },
    { name: "Payment Verification", status: userStatus },
    { name: "Contact Verification", status: userStatus },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />

      <div className="flex flex-col items-start justify-start w-full px-8 pt-16">
        <h1 className="mb-8 text-4xl font-extrabold text-gray-800">Welcome, {state.user?.name}</h1>

        {/* Approval Status Section */}
        <div className="w-full p-8 mb-8 bg-white shadow-sm rounded-3xl">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">Approval Status for Each Section</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <div key={index} className="p-6 transition-all duration-200 shadow bg-gradient-to-br from-white to-gray-100 rounded-xl hover:shadow-md">
                <h3 className="mb-4 text-xl font-medium text-gray-900">{section.name}</h3>
                <div className={`flex items-center justify-between p-4 rounded-lg text-white ${getStatusColor(section.status)}`}>
                  <div className="text-lg font-medium">Status: {section.status}</div>
                  {section.status === "Pending" && <FaExclamationCircle className="w-6 h-6" />}
                  {section.status === "Approved" && <FaCheckCircle className="w-6 h-6" />}
                </div>
                <div className="flex mt-4 space-x-4">
                  {section.status === "ReSubmit" && (
                    <button
                      onClick={handleResubmissionRequestClick}
                      className="px-4 py-2 text-white bg-orange-500 rounded-full hover:bg-orange-600"
                    >
                      Resubmit
                    </button>
                  )}
                  {section.status === "Pending" && (
                    <button
                      onClick={handleSignatureUploadClick}
                      className="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
                    >
                      Upload Signature
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Submission & PDF Summary */}
        <div className="w-full p-8 bg-white shadow-sm rounded-3xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Data Submission & PDF Summary</h2>
          <p className="mb-4 text-gray-500">Download a summary of your submitted data in PDF format.</p>
          <div className="flex space-x-6">
            <button
              onClick={handleDownloadSummary}
              className="px-6 py-3 text-white transition-all bg-blue-500 rounded-full shadow hover:bg-blue-400 hover:scale-105"
            >
              Download Summary <FaDownload className="inline ml-2" />
            </button>
            <button
              onClick={handleViewSummaryClick}
              className="px-6 py-3 text-white transition-all bg-gray-600 rounded-full shadow hover:bg-gray-700 hover:scale-105"
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
