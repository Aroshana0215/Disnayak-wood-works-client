// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

//DWW live configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkusm510K59Pr-an8ZgRvj293JkVXLhvQ",
  authDomain: "dww-client.firebaseapp.com",
  projectId: "dww-client",
  storageBucket: "dww-client.firebasestorage.app",
  messagingSenderId: "185821108041",
  appId: "1:185821108041:web:2b3718f765cc75d2316c98",
  measurementId: "G-EGG27KCNQV"
};

// Dev configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCQn6tSIZFp5ibD7ffh2QWKNmlawJ69jbs",
//   authDomain: "dww-dev.firebaseapp.com",
//   projectId: "dww-dev",
//   storageBucket: "dww-dev.firebasestorage.app",
//   messagingSenderId: "378487047518",
//   appId: "1:378487047518:web:7f45e92fce3c4ca83e3bcf",
//   measurementId: "G-QYRP1F6RLS"
// };

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp); 
