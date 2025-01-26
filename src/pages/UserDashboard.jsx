// Dashboard.js
import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { getFormDocumentIdByUserid } from "../firestore";
import { fetchContactData, fetchBusinessData, fetchDirectorData, fetchShareholderData, fetchPaymentData } from "../utils/dashboardUtils";

const Dashboard = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate();

  // Sample user approval status
  // const user = {
  //   name: "John Doe",
  //   status: "Approved",
  //   uid: "yQ3IoMQs1ieVHTlsMTRo4CH8dhh1"
  // };

  useEffect(() => {
    const fetchData = async () => {
      if (state.user?.uid) {
        try {
          await fetchContactData(state.user.uid, dispatch);
          await fetchBusinessData(state.user.uid, dispatch);
          await fetchDirectorData(state.user.uid, dispatch);
          await fetchShareholderData(state.user.uid, dispatch);
          await fetchPaymentData(state.user.uid, dispatch);
        } catch (error) {
          console.log("user not logged in", error);
        }
      }
    };

    fetchData();
  }, [state.user, dispatch]);

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "Approved":
  //       return "bg-green-500";
  //     case "Pending":
  //       return "bg-yellow-500";
  //     case "ReSubmit":
  //       return "bg-orange-500";
  //     case "Rejected":
  //       return "bg-red-500";
  //     default:
  //       return "bg-gray-500"; 
  //   }
  // };

  const handleEditClick = () => {
    navigate('/section-one', { state: { mode: 'edit' } });
  };

  const handleViewClick = () => {
    navigate('/form');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Your Approval Status</h1>
      <div className={`flex flex-col justify-between p-6 rounded-lg shadow-lg   w-100`}>
        {/* <div>
          <h2 className="text-xl font-semibold">Company Name</h2>
          <p className="mt-2">Status: Todo</p>
        </div> */}
        <div>
          <div className="flex">
            <p>Contact Information: </p>
            <p>{state.companyInformation?.status || 'Not submitted'}</p>
          </div>
          <div className="flex">
            <p>Business Information: </p>
            <p>{state.businessInformation?.status || 'Not submitted'}</p>
          </div>
          <div className="flex">
            <p>Director Information: </p>
            <p>{state.directorInformation?.status || 'Not submitted'}</p>
          </div>
          <div className="flex">
            <p>Shareholder Information: </p>
            <p>{state.shareholderInformation?.status || 'Not submitted'}</p>
          </div>
          <div className="flex">
            <p>Payment Information: </p>
            <p>{state.paymentInformation?.status || 'Not submitted'}</p>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button onClick={handleViewClick} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200">
            View Details
          </button>
          <button onClick={handleEditClick} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;