import { storage } from './firebase';
import { ref, uploadBytes } from "firebase/storage";

// Function to upload a file
export const uploadFile = async (file) => {
  const storageRef = ref(storage, `uploads/${file.name}`);
  try {
    await uploadBytes(storageRef, file);
    console.log("File uploaded successfully!");
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}; 