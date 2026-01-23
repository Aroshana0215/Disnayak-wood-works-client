import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, runTransaction } from "firebase/firestore";
import { createAsyncThunk } from "@reduxjs/toolkit";

const db = getFirestore();

// Insert new timberNature
export const createTimberNature = async (timberNatureData) => {
  console.log("New timber nature entered into the system", timberNatureData);

  const counterDocRef = doc(db, "counters", "timberNatureCounter");

  try {
    // Run a transaction to ensure atomicity
    const timberNatureID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      if (!counterDoc.exists()) {
        throw new Error("Counter document does not exist!");
      }

      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newTimberNatureID = `NATURE-${newID}`;

      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });

      return newTimberNatureID;
    });

    // Add the new timber nature record with the generated timberNatureID
    const timberNatureDataWithID = { ...timberNatureData, timberNatureID: timberNatureID };
    const docRef = await addDoc(collection(db, "timberNature"), timberNatureDataWithID);
    console.log("New timber nature entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New timber nature: ", error.message);
    throw error;
  }
};

export const getAllActiveTimberNature = async () => {
  try {
    // Ensure 'timberNatureID' is a field in the Firestore documents to order by
    const timberNatureQuery = query(
      collection(db, "timberNature"), // Collection reference
      where("status", "==", "A"),
      orderBy("timberNatureID", "asc") // Order by 'timberNatureID' in ascending order
    );

    const querySnapshot = await getDocs(timberNatureQuery);

    const timberNatureList = [];
    querySnapshot.forEach((doc) => {
      timberNatureList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return timberNatureList;
  } catch (error) {
    console.error("Error fetching timber nature list: ", error.message);
    throw error;
  }
};

export const getAllTimberNature = async () => {
  try {
    // Ensure 'timberNatureID' is a field in the Firestore documents to order by
    const timberNatureQuery = query(
      collection(db, "timberNature"), // Collection reference
      orderBy("timberNatureID", "asc") // Order by 'timberNatureID' in ascending order
    );

    const querySnapshot = await getDocs(timberNatureQuery);

    const timberNatureList = [];
    querySnapshot.forEach((doc) => {
      timberNatureList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return timberNatureList;
  } catch (error) {
    console.error("Error fetching timber nature list: ", error.message);
    throw error;
  }
};

// Update timberNature
export const updateTimberNature = async (timberNatureID, timberNatureData) => {
  console.log("timberNatureData:", timberNatureData);
  try {
    const timberNatureRef = doc(db, "timberNature", timberNatureID);
    await updateDoc(timberNatureRef, timberNatureData);
    console.log("Timber nature updated successfully");
  } catch (error) {
    console.error("Error updating timber nature: ", error.message);
    throw error;
  }
};

export const getTimberNatureById = async (timberNatureID) => {
  const formattedTimberNatureID = timberNatureID.trim();
  try {
    // Create a query against the collection
    const q = query(
      collection(db, "timberNature"),
      where("timberNatureID", "==", formattedTimberNatureID)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if any documents match the query
    if (!querySnapshot.empty) {
      // Return the first matching document
      const docSnapshot = querySnapshot.docs[0];
      const timberNature = { id: docSnapshot.id, ...docSnapshot.data() };
      return timberNature;
    } else {
      console.log("Timber nature not found");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving timber nature:", error.message);
    throw new Error("Error retrieving timber nature: " + error.message);
  }
};

export const getById = async (timberNatureID) => {
  try {
    // Create a reference to the document
    const docRef = doc(db, "timberNature", timberNatureID);

    // Execute the query
    const docSnapshot = await getDoc(docRef);

    // Check if the document exists
    if (docSnapshot.exists()) {
      // Return the document data along with the document ID
      const document = { id: docSnapshot.id, ...docSnapshot.data() };
      return document;
    } else {
      console.log("Document not found");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving document:", error.message);
    throw new Error("Error retrieving document: " + error.message);
  }
};

export const updateTimberNatureById = async (timberNatureID, updatedData) => {
  try {
    const timberNatureDocRef = doc(db, "timberNature", timberNatureID);
    await updateDoc(timberNatureDocRef, updatedData);

    console.log("Timber nature updated successfully");
  } catch (error) {
    console.error("Error updating timber nature:", error.message);
    throw error;
  }
};

export const getTimberNatureDocumentById = async (docID) => {
  try {
    const timberNatureDocRef = doc(db, "timberNature", docID);
    const timberNatureDocSnapshot = await getDoc(timberNatureDocRef);

    if (timberNatureDocSnapshot.exists()) {
      return { id: timberNatureDocSnapshot.id, ...timberNatureDocSnapshot.data() };
    } else {
      console.warn(`Timber nature document with ID '${docID}' not found`);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving timber nature document by ID:", error.message);
    throw new Error(`Error retrieving timber nature document by ID: ${error.message}`);
  }
};
