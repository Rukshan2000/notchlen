import React, { createContext, useReducer, useContext } from 'react';


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
    status: 'Form not submitted', 
    userId: '',
    editMode:'false',
    checkTitle: true,
    checkName: true,
    checkEmail: true,
    checkPhone: true,

  },
};




const UserContext = createContext();


const userReducer = (state, action) => {

  
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
    default:
      return state;
  }
};


export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUserContext = () => {
  return useContext(UserContext);
};
