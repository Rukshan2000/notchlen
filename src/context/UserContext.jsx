import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Initial state
const initialState = {
  user: {
    email: null,
    uid: null,
    role: null,
  },
  companyInformation: {
    title: '',
    name: '',
    email: '',
    phone: '',
    checkTitle: true,
    checkName: true,
    checkEmail: true,
    checkPhone: true,
    status: '',
    userId: null,
    userIdFromAdmin: null,
    overallStatus: null,
  },
  businessInformation: {
    companyName: '',
    companyNameType: '',
    companyLogo: null,
    companyAddress: '',
    companyProvince: '',
    companyDistrict: '',
    companyDivisionalOffice: '',
    companyGNDivision: '',
    companyPostalCode: '',
    companyEmail: '',
    businessDescription: '',
    checkCompanyName: true,
    checkcompanyNameType: true,
    checkCompanyLogo: true,
    checkCompanyAddress: true,
    checkCompanyProvince: true,
    checkCompanyDistrict: true,
    checkCompanyDivisionalOffice: true,
    checkCompanyGNDivision: true,
    checkCompanyPostalCode: true,
    checkCompanyEmail: true,
    checkBusinessDescription: true,
    status: '',
    userId: null,
  },
  directorInformation: {
    directors: [],
    directorCheckboxes: [],
    status: '',
    userId: null,
  },
  shareHolderInformation: {
    shareholders: [],
    shareholderCheckboxes: [],
    status: '',
    userId: null,
  },
  paymentInformation: {
    paymentSlip: {
      url: null,
      path: null
    },
    checkPaymentSlip: true,
    checkCardPayment: true,
    cardPayment: null,
    cardReference: null,
    status: '',
    userId: null,
    createdAt: null,
    termsAccepted: false,
    termsAcceptedAt: null
  },
};

// Create context
const UserContext = createContext();

// Reducer function
const userReducer = (state, action) => {
  console.log("FROM USER REDUCER", { state, action });

  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: {
          email: null,
          uid: null,
        }
      };
    case 'SET_COMPANY_INFORMATION':
      return { ...state, companyInformation: action.payload };

    case 'SET_BUSINESS_INFORMATION':
      return { ...state, businessInformation: action.payload };

    case 'SET_DIRECTOR_INFORMATION':
      return {
        ...state,
        directorInformation: {
          ...state.directorInformation,
          ...action.payload
        }
      };

    case 'SET_SHAREHOLDER_INFORMATION':
      return {
        ...state,
        shareHolderInformation: {
          ...state.shareHolderInformation,
          ...action.payload
        }
      };

    case 'SET_PAYMENT_INFORMATION':
      return {
        ...state,
        paymentInformation: {
          ...state.paymentInformation,
          ...action.payload,
          paymentSlip: action.payload.paymentSlip ? {
            url: action.payload.paymentSlip.url,
            path: action.payload.paymentSlip.path
          } : null,
          termsAccepted: action.payload.termsAccepted || false,
          termsAcceptedAt: action.payload.termsAcceptedAt || null
        }
      };

    case 'CLEAR_PAYMENT_INFORMATION':
      return {
        ...state,
        paymentInformation: {
          paymentSlip: null,
          status: 'Form not submitted',
          userId: null,
          createdAt: null
        }
      };

    default:
      return state;
  }
};

// Provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase auth listener to persist user state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        dispatch({
          type: 'SET_USER',
          payload: {
            uid: user.uid,
            email: user.email,
            // ... other user properties
          }
        });
      } else {
        // User is signed out
        dispatch({ type: 'CLEAR_USER' });
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or your loading component
  }

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export const useUserContext = () => {
  return useContext(UserContext);
};
