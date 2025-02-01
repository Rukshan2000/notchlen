import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the Firestore database
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation for redirection and route state management
import SideNav from "../components/TopNav"; // Importing the TopNav component
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { fetchShareholderData } from '../utils/dashboardUtils';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserDocumentByEmail, getUserRole } from '../firestore';
import { span } from 'framer-motion/client';


const ShareholderForm = () => {
  const { state, dispatch } = useUserContext();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const location = useLocation(); // Initialize useLocation hook
  const [userRole, setUserRole] = useState('admin');
  const [userIdFromAdmin, setUserIdFromAdmin] = useState('');

  const [shareholders, setShareholders] = useState([{
    title: '',
    fullName: '',
    dob: '',
    province: '',
    district: '',
    division: '',
    address1: '',
    address2: '',
    postCode: '',
    phone: '',
    mobile: '',
    email: '',
    shares: '',
    nicFront: null,
    nicBack: null,
    signature: null,
  }]);

  const [checkboxValues, setCheckboxValues] = useState([{
    title: state.user?.role === 'admin' ? false : true,
    fullName: state.user?.role === 'admin' ? false : true,
    dob: state.user?.role === 'admin' ? false : true,
    province: state.user?.role === 'admin' ? false : true,
    district: state.user?.role === 'admin' ? false : true,
    division: state.user?.role === 'admin' ? false : true,
    address1: state.user?.role === 'admin' ? false : true,
    address2: state.user?.role === 'admin' ? false : true,
    postCode: state.user?.role === 'admin' ? false : true,
    phone: state.user?.role === 'admin' ? false : true,
    mobile: state.user?.role === 'admin' ? false : true,
    email: state.user?.role === 'admin' ? false : true,
    shares: state.user?.role === 'admin' ? false : true,
    nicFront: state.user?.role === 'admin' ? false : true,
    nicBack: state.user?.role === 'admin' ? false : true,
    signature: state.user?.role === 'admin' ? false : true,
  }]);

  // Auth state management useEffect
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

  // Shareholder data fetching useEffect
  useEffect(() => {
    setUserIdFromAdmin(localStorage.getItem('applicationUserId'));

    const userId = state.user?.role === 'admin' ? userIdFromAdmin : state.user?.uid;
    console.log("userId from section four useEffect", userId);

    if (userId) {
      fetchShareholderData(userId, dispatch).then(() => {
        if (state.shareHolderInformation) {
          setShareholders(state.shareHolderInformation.shareholders || [shareholders]);
          setCheckboxValues(state.shareHolderInformation.shareholderCheckboxes || shareholders.map(() => ({
            title: state.user?.role === 'admin' ? false : true,
            fullName: state.user?.role === 'admin' ? false : true,
            dob: state.user?.role === 'admin' ? false : true,
            province: state.user?.role === 'admin' ? false : true,
            district: state.user?.role === 'admin' ? false : true,
            division: state.user?.role === 'admin' ? false : true,
            address1: state.user?.role === 'admin' ? false : true,
            address2: state.user?.role === 'admin' ? false : true,
            postCode: state.user?.role === 'admin' ? false : true,
            phone: state.user?.role === 'admin' ? false : true,
            mobile: state.user?.role === 'admin' ? false : true,
            email: state.user?.role === 'admin' ? false : true,
            shares: state.user?.role === 'admin' ? false : true,
            nicFront: state.user?.role === 'admin' ? false : true,
            nicBack: state.user?.role === 'admin' ? false : true,
            signature: state.user?.role === 'admin' ? false : true,
          })));
        }
      });
    }

    if (state.user?.role === 'user') {
      setUserRole('user');
    }
  }, [state.user, userIdFromAdmin, dispatch]);

  // Add useEffect for user role
  useEffect(() => {
    if (state.user?.role === 'user') {
      setUserRole('user');
    }
  }, [state.user]);




  const addShareholder = () => {
    setShareholders([...shareholders, {
      title: '',
      fullName: '',
      dob: '',
      province: '',
      district: '',
      division: '',
      address1: '',
      address2: '',
      postCode: '',
      phone: '',
      mobile: '',
      email: '',
      shares: '',
      nicFront: null,
      nicBack: null,
      signature: null,
    }]);

    setCheckboxValues([...checkboxValues, {
      title: state.user?.role === 'admin' ? false : true,
      fullName: state.user?.role === 'admin' ? false : true,
      dob: state.user?.role === 'admin' ? false : true,
      province: state.user?.role === 'admin' ? false : true,
      district: state.user?.role === 'admin' ? false : true,
      division: state.user?.role === 'admin' ? false : true,
      address1: state.user?.role === 'admin' ? false : true,
      address2: state.user?.role === 'admin' ? false : true,
      postCode: state.user?.role === 'admin' ? false : true,
      phone: state.user?.role === 'admin' ? false : true,
      mobile: state.user?.role === 'admin' ? false : true,
      email: state.user?.role === 'admin' ? false : true,
      shares: state.user?.role === 'admin' ? false : true,
      nicFront: state.user?.role === 'admin' ? false : true,
      nicBack: state.user?.role === 'admin' ? false : true,
      signature: state.user?.role === 'admin' ? false : true,
    }]);
  };

  const handleShareholderChange = (e, index) => {
    const { name, value } = e.target;
    const newShareholders = [...shareholders];
    newShareholders[index] = {
      ...newShareholders[index],
      [name]: value
    };
    setShareholders(newShareholders);
  };

  const handleFileChange = (e, index, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const newShareholders = [...shareholders];
      newShareholders[index] = {
        ...newShareholders[index],
        [fieldName]: file,
      };
      setShareholders(newShareholders);
    }
  };

  const handleView = (url) => {
    window.open(url, '_blank');
  };

  const uploadFile = async (file, userId, shareholderIndex, fileType) => {
    if (!file) return null;

    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `shareholders/${userId}/shareholder_${shareholderIndex}/${fileType}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, path: fileName };
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      throw error;
    }
  };

  const deleteOldFile = async (filePath) => {
    if (!filePath) return;

    const storage = getStorage();
    const fileRef = ref(storage, filePath);
    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting old file:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalCheckboxValues = state.user.role === 'admin'
        ? checkboxValues
        : checkboxValues.map(checkbox => {
          return Object.keys(checkbox).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {});
        });

      const userId = state.user.role === 'admin' ? userIdFromAdmin : state.user.uid;

      // Upload files and get URLs for each shareholder
      const shareholdersWithFiles = await Promise.all(shareholders.map(async (shareholder, index) => {
        const nicFrontFile = shareholder.nicFront instanceof File ? shareholder.nicFront : null;
        const nicBackFile = shareholder.nicBack instanceof File ? shareholder.nicBack : null;
        const signatureFile = shareholder.signature instanceof File ? shareholder.signature : null;

        // Get existing file data if available
        const existingShareholder = state.shareHolderInformation?.shareholders[index] || {};

        // Upload new files or keep existing URLs
        const nicFront = nicFrontFile
          ? await uploadFile(nicFrontFile, userId, index, 'nicFront')
          : existingShareholder.nicFront || null;

        const nicBack = nicBackFile
          ? await uploadFile(nicBackFile, userId, index, 'nicBack')
          : existingShareholder.nicBack || null;

        const signature = signatureFile
          ? await uploadFile(signatureFile, userId, index, 'signature')
          : existingShareholder.signature || null;

        // Delete old files if new ones are uploaded
        if (nicFrontFile && existingShareholder.nicFront) {
          await deleteOldFile(existingShareholder.nicFront.path);
        }
        if (nicBackFile && existingShareholder.nicBack) {
          await deleteOldFile(existingShareholder.nicBack.path);
        }
        if (signatureFile && existingShareholder.signature) {
          await deleteOldFile(existingShareholder.signature.path);
        }

        return {
          ...shareholder,
          nicFront,
          nicBack,
          signature
        };
      }));

      const formData = {
        shareholders: shareholdersWithFiles,
        shareholderCheckboxes: finalCheckboxValues,
        status: state.user.role === 'admin' ? 'Resubmit' : 'Pending',
        createdAt: serverTimestamp(),
        userId: userId,
      };

      const shareholdersRef = collection(db, 'shareholders');
      const q = query(shareholdersRef, where('userId', '==', formData.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'shareholders', querySnapshot.docs[0].id);
        await updateDoc(docRef, formData);
        alert('Shareholder information updated successfully!');
      } else {
        await addDoc(shareholdersRef, formData);
        alert('Shareholder information saved successfully!');
      }

      // Update context
      dispatch({
        type: 'SET_SHAREHOLDER_INFORMATION',
        payload: {
          shareholders: shareholdersWithFiles,
          shareholderCheckboxes: finalCheckboxValues,
          status: formData.status,
          userId: formData.userId
        }
      });

      // Only update local checkbox state if user is not admin
      if (state.user.role !== 'admin') {
        setCheckboxValues(finalCheckboxValues);
      }

      navigate('/section-five', { state: { userId: userIdFromAdmin } });

    } catch (error) {
      console.error('Error handling document: ', error);
      alert('Error saving shareholder information. Please try again.');
    }
  };

  const handleNext = () => {
    navigate('/section-five', { state: { userId: userIdFromAdmin } });
  };

  const handleBack = () => {
    navigate('/section-three', { state: { userId: userIdFromAdmin } });
  };

  const handleCheckboxChange = (e, index) => {
    const { name, checked } = e.target;
    const newCheckboxValues = [...checkboxValues];
    newCheckboxValues[index] = {
      ...newCheckboxValues[index],
      [name]: checked
    };
    setCheckboxValues(newCheckboxValues);
  };

  return (
    <div className="p-6 mx-auto mt-12 bg-gray-100 rounded-lg shadow-lg max-w-8xl">
      <SideNav />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">1</div>
          <span className="ml-2 font-medium text-green-500">Contact Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">2</div>
          <span className="ml-2 font-medium text-green-500">Business Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">3</div>
          <span className="ml-2 font-medium text-green-500">Director Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">4</div>
          <span className="ml-2 font-medium text-blue-500">Shareholder Information</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">5</div>
          <span className="ml-2 text-gray-600">Payment Verification</span>
        </div>
        <div className="w-full h-1 mx-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-300 rounded-full">6</div>
          <span className="ml-2 text-gray-600">Contact Verification</span>
        </div>
      </div>

      <form className="grid max-w-4xl grid-cols-1 gap-6 p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold text-center">Shareholder Information</h2>

        {shareholders.map((shareholder, index) => (
          <div key={index} className="grid grid-cols-2 gap-6 p-6 border-b border-gray-300">
            {/* Title */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="title"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].title}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Title</label>
              </div>
              <select
                name="title"
                value={shareholder.title}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].title}
              >
                <option value="">Select Title</option>
                <option>Mr.</option>
                <option>Mrs.</option>
                <option>Miss.</option>
                <option>Dr.</option>
                <option>Prof.</option>
                <option>Rev.</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="fullName"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].fullName}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Full Name</label>
              </div>
              <input
                type="text"
                name="fullName"
                value={shareholder.fullName}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].fullName}
              />
            </div>

            {/* Date of Birth */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="dob"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].dob}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Date of Birth</label>
              </div>
              <input
                type="date"
                name="dob"
                value={shareholder.dob}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].dob}
              />
            </div>

            {/* Province */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="province"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].province}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Province</label>
              </div>
              <input
                type="text"
                name="province"
                value={shareholder.province}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].province}
              />
            </div>

            {/* District */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="district"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].district}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder District</label>
              </div>
              <input
                type="text"
                name="district"
                value={shareholder.district}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].district}
              />
            </div>

            {/* Division */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="division"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].division}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Divisional Secretariat Division</label>
              </div>
              <input
                type="text"
                name="division"
                value={shareholder.division}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].division}
              />
            </div>

            {/* Address 1 */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="address1"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].address1}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Address 1</label>
              </div>
              <input
                type="text"
                name="address1"
                value={shareholder.address1}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].address1}
              />
            </div>

            {/* Address 2 */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="address2"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].address2}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Address Line 2 (Optional)</label>
              </div>
              <input
                type="text"
                name="address2"
                value={shareholder.address2}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].address2}
              />
            </div>

            {/* Post Code */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="postCode"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].postCode}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Postal Code</label>
              </div>
              <input
                type="text"
                name="postCode"
                value={shareholder.postCode}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].postCode}
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="phone"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].phone}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Residential Phone No. (Optional)</label>
              </div>
              <input
                type="text"
                name="phone"
                value={shareholder.phone}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].phone}
              />
            </div>

            {/* Mobile */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="mobile"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].mobile}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Mobile Phone No.</label>
              </div>
              <input
                type="text"
                name="mobile"
                value={shareholder.mobile}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].mobile}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="email"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].email}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Shareholder Email Address</label>
              </div>
              <input
                type="email"
                name="email"
                value={shareholder.email}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].email}
              />
            </div>

            {/* Shares */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="shares"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].shares}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">No. of Shares to be Held</label>
              </div>
              <input
                type="number"
                name="shares"
                value={shareholder.shares}
                onChange={(e) => handleShareholderChange(e, index)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                disabled={!checkboxValues[index].shares}
              />
            </div>

            {/* NIC Front Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="nicFront"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].nicFront}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Upload NIC Front</label>
              </div>
              <div className="space-y-2 flex items-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, index, 'nicFront')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].nicFront}
                />
                <button
                  className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                  onClick={() => handleView(shareholder.nicFront?.url)}
                >
                  View
                </button>
              </div>
              {shareholder.nicFront?.url && (
                <span className='text-green-500'>File Uploaded!</span>
              )}
            </div>

            {/* NIC Back Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="nicBack"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].nicBack}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Upload NIC Back</label>
              </div>
              <div className="space-y-2 flex items-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, index, 'nicBack')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].nicBack}
                />
                <button
                  className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                  onClick={() => handleView(shareholder.nicBack?.url)}
                >
                  View
                </button>
              </div>
              {shareholder.nicBack?.url && (
                <span className='text-green-500'>File Uploaded!</span>
              )}
            </div>

            {/* Signature Upload */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="signature"
                  className="mr-2"
                  disabled={userRole === 'user'}
                  checked={checkboxValues[index].signature}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                <label className="block font-medium">Upload Signature</label>
              </div>
              <div className="space-y-2 flex items-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, index, 'signature')}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md"
                  disabled={!checkboxValues[index].signature}
                />
                <button
                  className="bg-blue-500 text-white px-3 rounded py-4 ms-2"
                  onClick={() => handleView(shareholder.signature?.url)}
                >
                  View
                </button>
              </div>
              {shareholder.signature?.url && (
                <span className='text-green-500'>File Uploaded!</span>
              )}
            </div>

            {/* Empty div to maintain grid alignment when there's an odd number of file uploads */}
            <div className="mb-4"></div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-6 p-6">
          <button
            type="button"
            onClick={addShareholder}
            className="px-6 py-3 mt-4 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Add Another Shareholder
          </button>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded"
          >
            Back
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShareholderForm;
