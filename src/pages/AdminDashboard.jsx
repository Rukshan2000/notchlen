import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useReactToPrint } from 'react-to-print';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [userDetail, setUserDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, "contacts");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleOpenModal = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleApprove = async () => {
    try {
      const userDoc = doc(getFirestore(), "contacts", selectedUserId);
      await updateDoc(userDoc, { status: "Approved" });
      setUsers(users.map(user => user.id === selectedUserId ? { ...user, status: "Approved" } : user));
      alert('User approved successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Error approving user: ', error);
    }
  };

  const handleReject = async () => {
    try {
      const userDoc = doc(getFirestore(), "contacts", selectedUserId);
      await updateDoc(userDoc, { status: "Rejected" });
      setUsers(users.map(user => user.id === selectedUserId ? { ...user, status: "Rejected" } : user));
      alert('User rejected successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Error rejecting user: ', error);
    }
  };

  const handleViewDetails = (user) => {
    setUserDetail(user);
  };

  const componentRef = React.useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const paginatedUsers = users.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage);

  const handleDeleteUser = async (userId) => {
    try {
      const userDoc = doc(getFirestore(), "contacts", userId);
      await deleteDoc(userDoc);
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user: ', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-gray-100">
      <h1 className="py-6 text-3xl font-semibold text-center text-blue-600">Admin Dashboard</h1>
      
      {/* Main Container */}
      <div className="flex flex-col w-full p-6 bg-white shadow-lg lg:w-4/5 md:w-11/12 rounded-xl">
        
        {/* User List Section */}
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-blue-600 rounded-xl">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr key={user.id} className="transition-all duration-300 hover:bg-gray-100">
                  <td className="px-6 py-3 border-b">{user.name}</td>
                  <td className="px-6 py-3 border-b">{user.email}</td>
                  <td className="px-6 py-3 border-b">{user.status}</td>
                  <td className="px-6 py-3 space-x-2 border-b">
                    <button className="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600" onClick={() => handleViewDetails(user)}>View</button>
                    <button className="px-4 py-2 text-white bg-red-500 rounded-full hover:bg-red-600" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    <button className="px-4 py-2 text-white bg-green-500 rounded-full hover:bg-green-600" onClick={() => handleOpenModal(user.id)}>Approve/Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <ReactPaginate
          previousLabel={"< Previous"}
          nextLabel={"Next >"}
          pageCount={Math.ceil(users.length / itemsPerPage)}
          onPageChange={handlePageClick}
          containerClassName="flex justify-center mt-6"
          pageClassName="mx-2"
          activeClassName="bg-blue-600 text-white"
          previousClassName="bg-blue-600 text-white px-4 py-2 rounded-full"
          nextClassName="bg-blue-600 text-white px-4 py-2 rounded-full"
        />
        
      </div>

      {/* User Details Modal */}
      {userDetail && (
        <div ref={componentRef} className="w-full max-w-md p-6 mx-auto mt-6 bg-white shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold text-blue-600">User Details</h2>
          <p className="mt-4"><strong>Name:</strong> {userDetail.name}</p>
          <p><strong>Email:</strong> {userDetail.email}</p>
          <p><strong>Status:</strong> {userDetail.status}</p>
          <button className="px-6 py-2 mt-6 text-white bg-blue-500 rounded-full hover:bg-blue-600" onClick={handlePrint}>Download as PDF</button>
        </div>
      )}

      {/* Modal for Approve/Reject User */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg w-96">
            <h2 className="text-2xl font-semibold text-center">Approve/Reject User</h2>
            <p className="mt-4 text-center">Are you sure you want to approve/reject this user?</p>
            <div className="flex justify-center mt-6 space-x-4">
              <button className="px-6 py-2 text-white bg-green-500 rounded-full hover:bg-green-600" onClick={handleApprove}>Approve</button>
              <button className="px-6 py-2 text-white bg-red-500 rounded-full hover:bg-red-600" onClick={handleReject}>Reject</button>
              <button className="px-6 py-2 text-white bg-gray-500 rounded-full hover:bg-gray-600" onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
