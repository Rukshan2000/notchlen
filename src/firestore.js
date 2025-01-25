import { db } from './firebase';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore";


// Function to add user data to Firestore
export const addUserToFirestore = async (userId, userData) => {
  try {
    await addDoc(collection(db, "users"), {
      uid: userId,
      ...userData,
      role: "user",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
  }
};

// Function to get user role
export const getUserRole = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data().role; // Return the role
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const getUserDocumentByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email)); // Adjust 'users' to your collection name
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0]; // Return the first document found
  } else {
    throw new Error('No user found with this email');
  }
}; 

export async function getFormDocumentIdByUserid(userId) {
  try {
    const contactsRef = collection(db, "contacts");
    const q = query(contactsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the document's data/properties
      return querySnapshot.docs[0].data();
    } else {
      console.log("No document found with the given user id.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document ID:", error);
    return null;
  }
}