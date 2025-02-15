import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const getApplicationData = async (userId) => {
    try {
        // Get references to all collections
        const contactsRef = collection(db, 'contacts');
        const businessRef = collection(db, 'business');
        const directorsRef = collection(db, 'directors');
        const shareholdersRef = collection(db, 'shareholders');
        const paymentsRef = collection(db, 'payments');

        // Get documents for the user from each collection
        const [
            contactSnap,
            businessSnap,
            directorSnap,
            shareholderSnap,
            paymentSnap
        ] = await Promise.all([
            getDocs(query(contactsRef, where('userId', '==', userId))),
            getDocs(query(businessRef, where('userId', '==', userId))),
            getDocs(query(directorsRef, where('userId', '==', userId))),
            getDocs(query(shareholdersRef, where('userId', '==', userId))),
            getDocs(query(paymentsRef, where('userId', '==', userId)))
        ]);

        // Return data from snapshots
        return {
            contactData: contactSnap.docs[0]?.data() || null,
            businessData: businessSnap.docs[0]?.data() || null,
            directorData: directorSnap.docs[0]?.data() || null,
            shareholderData: shareholderSnap.docs[0]?.data() || null,
            paymentData: paymentSnap.docs[0]?.data() || null
        };
    } catch (error) {
        console.error('Error fetching application data:', error);
        throw error;
    }
};

// Individual collection fetchers
const getContactData = async (userId) => {
    try {
        const contactsRef = collection(db, 'contacts');
        const snapshot = await getDocs(query(contactsRef, where('userId', '==', userId)));
        return snapshot.docs[0]?.data() || null;
    } catch (error) {
        console.error('Error fetching contact data:', error);
        throw error;
    }
};

const getVarifyData = async (userId) => {
    try {
        const varifyRef = collection(db, 'varify');
        const snapshot = await getDocs(query(varifyRef, where('userId', '==', userId)));
        return snapshot.docs[0]?.data() || null;
    } catch (error) {
        console.error('Error fetching varify data:', error);
        throw error;
    }
};

const getBusinessData = async (userId) => {
    try {
        const businessRef = collection(db, 'business');
        const snapshot = await getDocs(query(businessRef, where('userId', '==', userId)));
        return snapshot.docs[0]?.data() || null;
    } catch (error) {
        console.error('Error fetching business data:', error);
        throw error;
    }
};

const getDirectorData = async (userId) => {
    try {
        const directorsRef = collection(db, 'directors');
        const snapshot = await getDocs(query(directorsRef, where('userId', '==', userId)));
        return snapshot.docs[0]?.data() || null;
    } catch (error) {
        console.error('Error fetching director data:', error);
        throw error;
    }
};

const getShareholderData = async (userId) => {
    try {
        const shareholdersRef = collection(db, 'shareholders');
        const snapshot = await getDocs(query(shareholdersRef, where('userId', '==', userId)));
        return snapshot.docs[0]?.data() || null;
    } catch (error) {
        console.error('Error fetching shareholder data:', error);
        throw error;
    }
};

const getPaymentData = async (userId) => {
    try {
        const paymentsRef = collection(db, 'payments');
        const snapshot = await getDocs(query(paymentsRef, where('userId', '==', userId)));
        return snapshot.docs[0]?.data() || null;
    } catch (error) {
        console.error('Error fetching payment data:', error);
        throw error;
    }
};

export {
    getApplicationData,
    getContactData,
    getVarifyData,
    getBusinessData,
    getDirectorData,
    getShareholderData,
    getPaymentData
}; 