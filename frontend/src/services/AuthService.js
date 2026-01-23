import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "../firebase/firebaseConfig";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const db = getFirestore();

export const signIn = async (payload) => {
  try {
    const userCredentials = await signInWithEmailAndPassword(
      firebaseAuth,
      payload.email,
      payload.password
    );
    const user = userCredentials.user;
    console.log("Logged in with:", user.email);
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      console.log("No such user!");
    }
    let userData = docSnap.data();
    let userDetails = {
      ...userData,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    };
    return userDetails;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const signUp = async (payload) => {
  try {
    const userCredentials = await createUserWithEmailAndPassword(
      firebaseAuth,
      payload.email,
      payload.password
    );
    const user = userCredentials.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: payload.email,
      displayName: payload.fullName,
      photoURL: user.photoURL,
      phoneNumber: payload.phoneNumber,
    });
    console.log("Registered with:", user.email);
    let userDetails = {
      uid: user.uid,
      email: payload.email,
      displayName: payload.fullName,
      photoURL: user.photoURL,
      phoneNumber: payload.phoneNumber,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    };
    return userDetails;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const LogOut = async () => {
  try {
    const result = await signOut(firebaseAuth);
    console.log(result);
    return { isSuccess: true };
  } catch (error) {
    console.log(error);
    return { isSuccess: false, error };
  }
};
