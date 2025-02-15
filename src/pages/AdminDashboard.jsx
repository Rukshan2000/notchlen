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
import { fetchContactData, fetchBusinessData, fetchDirectorData, fetchShareholderData, fetchPaymentData } from "../utils/dashboardUtils";
import { getApplicationData } from '../utils/firebaseDataService';


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
  const handleDownloadPDF = async (userId) => {
    console.log("Starting PDF generation for userId:", userId);
    try {
      // Get all application data
      const {
        contactData,
        businessData,
        directorData,
        shareholderData,
        paymentData
      } = await getApplicationData(userId);

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(0, 87, 183);
      doc.text("User Application Details", 20, 20);

      // Contact Information
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Contact Information", 20, 40);
      doc.setFontSize(12);
      doc.text(`Email: ${contactData?.email || 'N/A'}`, 30, 50);
      doc.text(`Registration Plan: ${contactData?.registrationPlan || 'N/A'}`, 30, 60);
      doc.text(`Contact Person Title: ${contactData?.contactPersonTitle || 'N/A'}`, 30, 70);
      doc.text(`Contact Person Name: ${contactData?.contactPersonName || 'N/A'}`, 30, 80);
      doc.text(`Contact Person Email: ${contactData?.contactPersonEmail || 'N/A'}`, 30, 90);
      doc.text(`Contact Person Phone: ${contactData?.contactPersonPhone || 'N/A'}`, 30, 100);

      // Business Information
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Business Information", 20, 20);
      doc.setFontSize(12);
      doc.text(`Company Name: ${businessData?.companyName || 'N/A'}`, 30, 30);
      doc.text(`Business Type: ${businessData?.companyNameType || 'N/A'}`, 30, 40);
      doc.text(`Company Address: ${businessData?.companyAddress || 'N/A'}`, 30, 50);
      doc.text(`Company Province: ${businessData?.companyProvince || 'N/A'}`, 30, 60);
      doc.text(`Company District: ${businessData?.companyDistrict || 'N/A'}`, 30, 70);
      doc.text(`Company Divisional Office: ${businessData?.companyDivisionalOffice || 'N/A'}`, 30, 80);
      doc.text(`Company GN Division: ${businessData?.companyGNDivision || 'N/A'}`, 30, 90);
      doc.text(`Company Postal Code: ${businessData?.companyPostalCode || 'N/A'}`, 30, 100);
      doc.text(`Company Email: ${businessData?.companyEmail || 'N/A'}`, 30, 110);
      doc.text(`Business Description: ${businessData?.businessDescription || 'N/A'}`, 30, 120);

      // Director Information
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Director Information", 20, 20);
      doc.setFontSize(12);

      if (directorData?.directors?.length > 0) {
        let yPosition = 30;
        directorData.directors.forEach((director, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`Director ${index + 1}:`, 30, yPosition);
          doc.text(`Title: ${director.title || 'N/A'}`, 40, yPosition + 10);
          doc.text(`Full Name: ${director.fullName || 'N/A'}`, 40, yPosition + 20);
          doc.text(`Date of Birth: ${director.dob || 'N/A'}`, 40, yPosition + 30);
          doc.text(`Province: ${director.province || 'N/A'}`, 40, yPosition + 40);
          doc.text(`District: ${director.district || 'N/A'}`, 40, yPosition + 50);
          doc.text(`Division: ${director.division || 'N/A'}`, 40, yPosition + 60);
          doc.text(`Address 1: ${director.address1 || 'N/A'}`, 40, yPosition + 70);
          doc.text(`Address 2: ${director.address2 || 'N/A'}`, 40, yPosition + 80);
          doc.text(`Post Code: ${director.postCode || 'N/A'}`, 40, yPosition + 90);
          doc.text(`Phone: ${director.phone || 'N/A'}`, 40, yPosition + 100);
          doc.text(`Mobile: ${director.mobile || 'N/A'}`, 40, yPosition + 110);
          doc.text(`Email: ${director.email || 'N/A'}`, 40, yPosition + 120);
          doc.text(`Occupation: ${director.occupation || 'N/A'}`, 40, yPosition + 130);
          yPosition += 150;
        });
      } else {
        doc.text("No director information available", 30, 30);
      }

      // Shareholder Information
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Shareholder Information", 20, 20);
      doc.setFontSize(12);

      if (shareholderData?.shareholders?.length > 0) {
        let yPosition = 30;
        shareholderData.shareholders.forEach((shareholder, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`Shareholder ${index + 1}:`, 30, yPosition);
          doc.text(`Title: ${shareholder.title || 'N/A'}`, 40, yPosition + 10);
          doc.text(`Full Name: ${shareholder.fullName || 'N/A'}`, 40, yPosition + 20);
          doc.text(`Date of Birth: ${shareholder.dob || 'N/A'}`, 40, yPosition + 30);
          doc.text(`Province: ${shareholder.province || 'N/A'}`, 40, yPosition + 40);
          doc.text(`District: ${shareholder.district || 'N/A'}`, 40, yPosition + 50);
          doc.text(`Division: ${shareholder.division || 'N/A'}`, 40, yPosition + 60);
          doc.text(`Address 1: ${shareholder.address1 || 'N/A'}`, 40, yPosition + 70);
          doc.text(`Address 2: ${shareholder.address2 || 'N/A'}`, 40, yPosition + 80);
          doc.text(`Post Code: ${shareholder.postCode || 'N/A'}`, 40, yPosition + 90);
          doc.text(`Phone: ${shareholder.phone || 'N/A'}`, 40, yPosition + 100);
          doc.text(`Mobile: ${shareholder.mobile || 'N/A'}`, 40, yPosition + 110);
          doc.text(`Email: ${shareholder.email || 'N/A'}`, 40, yPosition + 120);
          doc.text(`Shares: ${shareholder.shares || 'N/A'}%`, 40, yPosition + 130);
          yPosition += 150;
        });
      } else {
        doc.text("No shareholder information available", 30, 30);
      }

      // Payment Information
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Payment Information", 20, 20);
      doc.setFontSize(12);
      doc.text(`Payment Status: ${paymentData?.status || 'N/A'}`, 30, 30);
      doc.text(`Payment Date: ${paymentData?.date || 'N/A'}`, 30, 40);
      doc.text(`Payment Slip: ${paymentData?.paymentSlip?.url ? 'Uploaded' : 'Not uploaded'}`, 30, 50);

      // Overall Status
      doc.setFontSize(16);
      doc.setTextColor(0, 87, 183);
      doc.text("Application Status", 20, 70);
      doc.setFontSize(14);
      doc.text(`Overall Status: ${contactData?.overallStatus || 'N/A'}`, 30, 80);

      // Save the PDF
      const fileName = `user_application_${contactData?.contactPersonName || 'user'}.pdf`;
      console.log("Saving PDF with filename:", fileName);
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
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
                onClick={() => handleDownloadPDF(userDetail.userId)}
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
