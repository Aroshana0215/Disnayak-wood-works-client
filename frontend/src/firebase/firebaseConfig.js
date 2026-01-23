// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

//DTS live configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCrJEMG2srxm665yfJUJolYSiYX5Pj95vU",
//   authDomain: "dts-client.firebaseapp.com",
//   projectId: "dts-client",
//   storageBucket: "dts-client.appspot.com",
//   messagingSenderId: "880085947366", 
//   appId: "1:880085947366:web:ee8010f84df7588733bc27",
//   measurementId: "G-BBWE0Q93CP",
// };

// Dev configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOXiwyEFkDRzZRYeqaHaJsw4Sg2mR4Bs0",
  authDomain: "dts-dev-287e5.firebaseapp.com",
  projectId: "dts-dev-287e5",
  storageBucket: "dts-dev-287e5.firebasestorage.app",
  messagingSenderId: "494170016714",
  appId: "1:494170016714:web:15167ca0c64d114dc95d33",
  measurementId: "G-4J325DKHTC"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp); 
