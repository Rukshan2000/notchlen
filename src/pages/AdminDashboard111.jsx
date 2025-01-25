import React, { useState } from 'react';

const usersData = [
  { id: 1, username: 'john_doe', contactInfo: 'john.doe@example.com', businessInfo: 'XYZ Corp', directorInfo: 'John Doe', shareholderInfo: 'John Doe, Jane Smith', paymentVerification: 'Verified', contactVerification: 'Verified' },
  { id: 2, username: 'jane_doe', contactInfo: 'jane.doe@example.com', businessInfo: 'ABC Ltd', directorInfo: 'Jane Doe', shareholderInfo: 'Jane Doe, John Smith', paymentVerification: 'Verified', contactVerification: 'Verified' },
  // Add more dummy users if needed
];

const cardsData = [
  { name: 'Contact Information', field: 'contactInfo' },
  { name: 'Business Information', field: 'businessInfo' },
  { name: 'Director Information', field: 'directorInfo' },
  { name: 'Shareholder Information', field: 'shareholderInfo' },
  { name: 'Payment Verification', field: 'paymentVerification' },
  { name: 'Contact Verification', field: 'contactVerification' },
];

function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setSelectedCard(null); // Reset selected card when viewing a new user
  };

  const handleActionClick = (card) => {
    setSelectedCard(card);
    setShowModal(true); // Show modal when card is selected
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>

      {/* Table of Users */}
      <table className="min-w-full mb-6 border-collapse table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 text-left">Username</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="px-4 py-2">{user.username}</td>
              <td className="px-4 py-2">
                <button
                  className="px-3 py-1 mr-2 text-white bg-blue-500 rounded-md"
                  onClick={() => handleViewClick(user)}
                >
                  View
                </button>
                <button className="px-3 py-1 mr-2 text-white bg-red-500 rounded-md">Delete</button>
                <button className="px-3 py-1 text-white bg-green-500 rounded-md">Download PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show Cards after clicking View */}
      {selectedUser && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Details for {selectedUser.username}</h2>

          <div className="grid grid-cols-3 gap-6">
            {cardsData.map((card, index) => (
              <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{card.name}</h2>
                <button
                  className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
                  onClick={() => handleActionClick(card)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Displaying Card Data */}
      {showModal && selectedCard && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-xl font-semibold">Details for {selectedCard.name}</h3>
            <p className="text-gray-700">{selectedUser[selectedCard.field]}</p>
            <div className="mt-4 space-x-2">
              <button className="px-4 py-2 text-white bg-green-500 rounded-md">Approve</button>
              <button className="px-4 py-2 text-white bg-red-500 rounded-md">Reject</button>
              <button className="px-4 py-2 text-white bg-yellow-500 rounded-md">Resubmit</button>
            </div>
            <button
              className="w-full px-4 py-2 mt-4 text-white bg-gray-500 rounded-md"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
