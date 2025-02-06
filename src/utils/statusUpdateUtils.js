import { getFormDocumentIdByUserid } from "../firestore";
// import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { serverTimestamp } from 'firebase/firestore';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { useUserContext } from '../context/UserContext';
import { fetchContactData, fetchBusinessData, fetchDirectorData, fetchShareholderData, fetchPaymentData } from "../utils/dashboardUtils";

export const updateOverallStatus = async (userId, state, dispatch) => {
    console.log("-----------------------updateOverallStatus is working", { state }, userId);
    try {
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


        if (!contactSnap.empty) {
            const docRef = doc(db, 'contacts', contactSnap.docs[0].id);

            if (state.user.role !== 'user') {
                await updateDoc(docRef, { overallStatus: "Resubmit" });
                console.log('status util from admin - changed to resubmit!');
            } else {
                // Get status from each collection
                const statusArray = [
                    contactSnap.docs[0]?.data()?.status,
                    businessSnap.docs[0]?.data()?.status,
                    directorSnap.docs[0]?.data()?.status,
                    shareholderSnap.docs[0]?.data()?.status,
                    paymentSnap.docs[0]?.data()?.status
                ];

                console.log("---------------------------Status Array from Firebase:", statusArray);

                const overallStatus = statusArray.includes('Resubmit') ? 'Resubmit' : 'Pending';
            
                await updateDoc(docRef, { overallStatus: overallStatus });

                console.log("-------------------------Overall Status Updated to:", overallStatus);
            }
        } else {
            console.error('No contact document found for user:', userId);
        }
    } catch (error) {
        console.error('Error status update util:', error);
    }
};

