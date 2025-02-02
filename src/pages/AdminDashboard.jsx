import React, { useContext, useState, useEffect } from 'react';
import ReactPaginate from "react-paginate";

import { sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../firebase'; // Import the Firestore and Auth databases

import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import usersData from '../data/users.json';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { getFormDocumentIdByUserid } from '../firestore';
import { getStorage, ref, deleteObject, listAll } from 'firebase/storage';
import { jsPDF } from "jspdf";
import { getUserDocumentByEmail, getUserRole } from '../firestore';


const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [userDetail, setUserDetail] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useUserContext();

  const userIdFromAdmin = location.state?.userId;

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

  const handleViewDetails = (user) => {
    setUserDetail(user);
  };

  // Function to handle PDF export
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("User Details", 20, 20);
    doc.text(`Name: ${userDetail.name}`, 20, 30);
    doc.text(`Email: ${userDetail.email}`, 20, 40);
    doc.text(`Status: ${userDetail.status}`, 20, 50);

    // Save the PDF
    doc.save('user_details.pdf');
  };

  const paginatedUsers = users.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage);

  const handleDeleteUsers = async (userIds) => {
    console.log("userIds", userIds);
    try {
      const db = getFirestore();
      const storage = getStorage();

      const deleteStorageFolder = async (folderPath) => {
        try {
          const folderRef = ref(storage, folderPath);
          const list = await listAll(folderRef);

          // Delete all items in subfolders recursively
          const subFolderPromises = list.prefixes.map(prefix =>
            deleteStorageFolder(prefix.fullPath)
          );
          await Promise.all(subFolderPromises);

          // Delete all files in current folder
          const filePromises = list.items.map(item =>
            deleteObject(item)
          );
          await Promise.all(filePromises);

        } catch (error) {
          console.log(`Error deleting folder ${folderPath}:`, error);
        }
      };

      const deletePromises = userIds.map(async (userId) => {
        // Delete from multiple collections
        const collections = ["contacts", "business", "directors", "payments", "shareholders"];
        const deleteDocPromises = collections.map(async (collectionName) => {
          // Query for documents where userId matches
          const q = query(collection(db, collectionName), where('userId', '==', userId));
          const querySnapshot = await getDocs(q);

          // Delete all matching documents
          const docDeletePromises = querySnapshot.docs.map(async (doc) => {
            await deleteDoc(doc.ref);
          });

          await Promise.all(docDeletePromises);
        });

        // Delete associated storage folders
        try {
          await deleteStorageFolder(`directors/${userId}`);
          await deleteStorageFolder(`shareholders/${userId}`);
          await deleteStorageFolder(`payments/${userId}`);
        } catch (error) {
          console.log('Error in storage deletion:', error);
          // Continue with deletion even if storage deletion fails
        }

        await Promise.all(deleteDocPromises);
      });

      await Promise.all(deletePromises);
      setUsers(users.filter(user => !userIds.includes(user.userId)));
      console.log('Users deleted successfully!');
    } catch (error) {
      console.error('Error deleting users: ', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const userDoc = doc(getFirestore(), "contacts", userId);
      await updateDoc(userDoc, { overallStatus: "Approved" });
      setUsers(users.map(user => user.id === userId ? { ...user, overallStatus: "Approved" } : user));
      console.log('User approved successfully!');
    } catch (error) {
      console.error('Error approving user: ', error);
    }
  };

  const handleReject = async (userId) => {
    try {
      const userDoc = doc(getFirestore(), "contacts", userId);
      await updateDoc(userDoc, { overallStatus: "Rejected" });
      setUsers(users.map(user => user.id === userId ? { ...user, overallStatus: "Rejected" } : user));
      console.log('User rejected successfully!');
    } catch (error) {
      console.error('Error rejecting user: ', error);
    }
  };


  const handleView = async (userId) => {
    console.log("userId", userId);
    if (localStorage.getItem('applicationUserId')) {
      localStorage.removeItem('applicationUserId');
    }

    // Save userId in local storage
    localStorage.setItem('applicationUserId', userId);

    navigate('/section-one');

  };

  return (

    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="mt-20 mb-8 text-4xl font-bold text-blue-600">User Management</h1>

        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="text-sm text-white uppercase bg-blue-600">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>

              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-3">{user.contactPersonName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.overallStatus}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                      onClick={() => handleViewDetails(user)}
                    >
                      View
                    </button>
                    <button
                      className="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600"
                      onClick={() => handleApprove(user.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                      onClick={() => handleReject(user.id)}
                    >
                      Reject
                    </button>
                    <button
                      className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                      onClick={() => handleDeleteUsers([user.userId])}
                    >
                      Delete
                    </button>
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
          breakLabel={"..."}
          pageCount={Math.ceil(users.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName="flex justify-center mt-4"
          pageClassName="mx-1"
          activeClassName="bg-blue-600 text-white"
          previousClassName="mr-2 bg-blue-500 text-white px-3 py-1 rounded"
          nextClassName="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
        />

        {/* User Details Modal */}
        {userDetail && (
          <div className="p-6 mt-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-600">User Details</h2>
            <p><strong>Name:</strong> {userDetail.contactPersonName}</p>
            <p><strong>Email:</strong> {userDetail.email}</p>
            <p><strong>Status:</strong> {userDetail.overallStatus}</p>

            <div className="flex mt-6 space-x-4">
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                onClick={handleDownloadPDF}
              >
                Download as PDF
              </button>
              <button
                className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                onClick={() => handleApprove(userDetail.id)}
              >
                Approve
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                onClick={() => handleReject(userDetail.id)}
              >
                Reject
              </button>
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                onClick={() => handleView(userDetail.userId)}
              >
                View Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
