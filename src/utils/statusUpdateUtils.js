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
        const q = query(contactsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docRef = doc(db, 'contacts', querySnapshot.docs[0].id);

            if (state.user.role !== 'user') {
                await updateDoc(docRef, { overallStatus: "Resubmit" });
                console.log('status util - changed to resubmit!');
            } else {
                await fetchContactData(userId, dispatch);
                await fetchBusinessData(userId, dispatch);
                await fetchDirectorData(userId, dispatch);
                await fetchShareholderData(userId, dispatch);
                await fetchPaymentData(userId, dispatch);

                const statusArray = [
                    state.companyInformation?.status,
                    state.businessInformation?.status,
                    state.directorInformation?.status,
                    state.shareHolderInformation?.status,
                    state.paymentInformation?.status
                ];

                const overallStatus = statusArray.includes('Resubmit') ? 'Resubmit' : 'Pending';
                await updateDoc(docRef, { overallStatus: overallStatus });

                console.log("-------------------overallStatus", overallStatus);
                console.log("-------------------statusArray", statusArray);
            }
        } else {
            console.error('No document found for user:', userId);
        }
    } catch (error) {
        console.error('Error status update util:', error);
    }
};

