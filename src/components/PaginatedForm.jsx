import React, { useContext, useState, useEffect } from 'react';
import PackageSelection from './PackageSelection';
import ContactPersonForm from './ContactPersonForm';
import CompanyInformation from './CompanyInformation';
import CompanyDirectorForm from './CompanyDirectorForm';
import AgreementForm from './AgreementForm';
import PaymentForm from './PaymentForm';
import { useUserContext } from '../context/UserContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getFormDocumentIdByUserid } from '../firestore';
import { useLocation } from 'react-router-dom';

const getContactDocumentByUserId = async (userId) => {
  try {
    const contactRef = doc(db, 'contacts', userId);
    const contactSnap = await getDoc(contactRef);

    if (contactSnap.exists()) {
      return contactSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching contact document:', error);
    return null;
  }
};

const PaginatedForm = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { state, dispatch } = useUserContext();
  const location = useLocation();
  const isEditMode = location.state?.mode === 'edit';
  const userIdFromAdmin = location.state?.userId ;

  useEffect(() => {
    const fetchContactData = async () => {
      if (state.user?.uid) {
        const contactData = await getFormDocumentIdByUserid(userIdFromAdmin? userIdFromAdmin : state.user.uid);
        
        if (contactData) {
          dispatch({
            type: 'SET_COMPANY_INFORMATION',
            payload: {
              ...contactData,
              editMode: userIdFromAdmin? 'fromAdmin':'fromUser'
            }
          });
        }
      }
    };

    fetchContactData();
  }, [state.user, dispatch]);

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, 6)); // Adjust max page number accordingly
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      {currentPage === 1 && <PackageSelection />}
      {currentPage === 2 && <ContactPersonForm />}
      {currentPage === 3 && <CompanyInformation />}
      {currentPage === 4 && <CompanyDirectorForm />}
      {currentPage === 5 && <AgreementForm />}
      {currentPage === 6 && <PaymentForm />}

      <div className="flex justify-between mt-4">
        <button onClick={handlePrevious} disabled={currentPage === 1} className="bg-gray-300 p-2 rounded">
          Previous
        </button>
        <button onClick={handleNext} disabled={currentPage === 6} className="bg-blue-500 text-white p-2 rounded">
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginatedForm;
