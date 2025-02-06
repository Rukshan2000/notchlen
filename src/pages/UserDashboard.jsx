import React, { useEffect } from "react";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchContactData, fetchBusinessData, fetchDirectorData, fetchShareholderData, fetchPaymentData } from "../utils/dashboardUtils";
import { updateOverallStatus } from '../utils/statusUpdateUtils';

const Dashboard = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate();

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
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
    // updateOverallStatus(state.user.uid, state, dispatch);
  }, [state.user, dispatch]);

  const handleEditClick = () => {
    navigate('/section-one', { state: { mode: 'edit' } });
  };

  const handleViewClick = () => {
    navigate('/form');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">

      <h1 className="mb-6 text-4xl font-bold">Your Approval Status</h1>
      <h1 className="mb-6 text-xl ">{state.companyInformation?.overallStatus}</h1>

      <div className="flex flex-col justify-between w-full max-w-4xl p-6 rounded-lg shadow-lg">
        <div className="space-y-4">
          {[
            { label: "Contact Information", status: state.companyInformation?.status },
            { label: "Business Information", status: state.businessInformation?.status },
            { label: "Director Information", status: state.directorInformation?.status },
            { label: "Shareholder Information", status: state.shareHolderInformation?.status },
            { label: "Payment Information", status: state.paymentInformation?.status },
          ].map(({ label, status }) => (
            <div key={label} className="flex justify-between">
              <p className="font-semibold">{label}:</p>
              <p>{status || 'Not submitted'}</p>
            </div>
          ))}

        </div>
        <div className="flex mt-6 space-x-4">
          {/* <button
            onClick={handleViewClick}
            className="px-4 py-2 font-semibold text-gray-800 transition duration-200 bg-white rounded-lg hover:bg-gray-200"
          >
            View Details
          </button> */}
          <button
            onClick={handleEditClick}
            className="px-4 py-2 font-semibold text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
