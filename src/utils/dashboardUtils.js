import { getFormDocumentIdByUserid } from "../firestore";
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { serverTimestamp } from 'firebase/firestore';

export const fetchContactData = async (userId, dispatch) => {
    if (!userId) return; // Early return if no userId

    try {
        const contactData = await getFormDocumentIdByUserid(userId);
        console.log("contactData from fetchContactData", contactData);

        if (contactData) {
            dispatch({
                type: 'SET_COMPANY_INFORMATION',
                payload: {
                    ...contactData,
                }
            });
        }
    } catch (error) {
        console.error('Error fetching contact data:', error);
    }
};

export const fetchBusinessData = async (userId, dispatch) => {
    if (!userId) return;

    try {
        const businessRef = collection(db, 'business');
        const q = query(businessRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        console.log("querySnapshot from fetchBusinessData", querySnapshot);

        if (!querySnapshot.empty) {
            const businessData = querySnapshot.docs[0].data();
            console.log("businessData from fetchBusinessData", businessData);
            dispatch({
                type: 'SET_BUSINESS_INFORMATION',
                payload: {
                    ...businessData,
                }
            });
        }
    } catch (error) {
        console.error('Error fetching business data:', error);
    }
};

// Update fetchPaymentData to properly handle the payment slip URL
export const fetchPaymentData = async (userId, dispatch) => {
    if (!userId) return;

    try {
        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const paymentData = querySnapshot.docs[0].data();
            // Ensure paymentSlip data structure is maintained
            const formattedPaymentData = {
                ...paymentData,
                paymentSlip: paymentData.paymentSlip ? {
                    url: paymentData.paymentSlip.url,
                    path: paymentData.paymentSlip.path
                } : null
            };

            dispatch({
                type: 'SET_PAYMENT_INFORMATION',
                payload: formattedPaymentData
            });

            return formattedPaymentData; // Return the data for local state update
        }
    } catch (error) {
        console.error('Error fetching payment data:', error);
    }
};

export const savePaymentData = async (paymentData, userId) => {
    try {
        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docRef = doc(db, 'payments', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
                ...paymentData,
                updatedAt: serverTimestamp()
            });
            return { success: true, message: 'Payment information updated successfully' };
        } else {
            await addDoc(paymentsRef, {
                ...paymentData,
                createdAt: serverTimestamp()
            });
            return { success: true, message: 'Payment information saved successfully' };
        }
    } catch (error) {
        console.error('Error saving payment data:', error);
        return { success: false, message: error.message };
    }
};

export const fetchDirectorData = async (userId, dispatch) => {
    if (!userId) return;

    try {
        const directorsRef = collection(db, 'directors');
        const q = query(directorsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const directorData = querySnapshot.docs[0].data();
            const newCheckboxValues = directorData.directorCheckboxes || directorData.directors.map(director => ({
                title: false,
                fullName: false,
                dob: false,
                province: false,
                district: false,
                division: false,
                address1: false,
                address2: false,
                postCode: false,
                phone: false,
                mobile: false,
                email: false,
                occupation: false,
                nicFront: false,
                nicBack: false,
                signature: false,
            }));

            dispatch({
                type: 'SET_DIRECTOR_INFORMATION',
                payload: {
                    directors: directorData.directors,
                    directorCheckboxes: newCheckboxValues,
                    status: directorData.status,
                    userId: userId
                }
            });
        }
    } catch (error) {
        console.error('Error fetching director data:', error);
    }
};

export const fetchShareholderData = async (userId, dispatch) => {
    if (!userId) return;

    try {
        const shareholdersRef = collection(db, 'shareholders');
        const q = query(shareholdersRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const shareholderData = querySnapshot.docs[0].data();
            const newCheckboxValues = shareholderData.shareholderCheckboxes || shareholderData.shareholders.map(shareholder => ({
                title: false,
                fullName: false,
                dob: false,
                province: false,
                district: false,
                division: false,
                address1: false,
                address2: false,
                postCode: false,
                phone: false,
                mobile: false,
                email: false,
                shares: false,
                nicFront: false,
                nicBack: false,
                signature: false,
            }));

            dispatch({
                type: 'SET_SHAREHOLDER_INFORMATION',
                payload: {
                    shareholders: shareholderData.shareholders,
                    shareholderCheckboxes: newCheckboxValues,
                    status: shareholderData.status,
                    userId: userId
                }
            });
        }
    } catch (error) {
        console.error('Error fetching shareholder data:', error);
    }
}; 