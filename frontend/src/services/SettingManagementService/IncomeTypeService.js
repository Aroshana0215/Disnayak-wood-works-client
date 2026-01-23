import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, runTransaction } from "firebase/firestore";
import { createAsyncThunk } from "@reduxjs/toolkit";

const db = getFirestore();

// Insert new incomeType
export const createIncomeType = async (incomeTypeData) => {
  console.log("New income type entered into the system", incomeTypeData);

  const counterDocRef = doc(db, "counters", "incomeTypeCounter");

  try {
    // Run a transaction to ensure atomicity
    const incomeTypeID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      if (!counterDoc.exists()) {
        throw new Error("Counter document does not exist!");
      }

      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newIncomeTypeID = `INCOME-${newID}`;

      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });

      return newIncomeTypeID;
    });

    // Add the new income type record with the generated incomeTypeID
    const incomeTypeDataWithID = { ...incomeTypeData, incomeTypeID: incomeTypeID };
    const docRef = await addDoc(collection(db, "incomeType"), incomeTypeDataWithID);
    console.log("New income type entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error entering new income type: ", error.message);
    throw error;
  }
};

// Retrieve all income types
export const getAllActiveIncomeType = async () => {
  try {
    // Ensure 'incomeTypeID' is a field in the Firestore documents to order by
    const incomeTypeQuery = query(
      collection(db, "incomeType"), // Collection reference
      where("status", "==", "A"),
      orderBy("incomeTypeID", "asc") // Order by 'incomeTypeID' in ascending order
    );

    const querySnapshot = await getDocs(incomeTypeQuery);

    const incomeTypeList = [];
    querySnapshot.forEach((doc) => {
      incomeTypeList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return incomeTypeList;
  } catch (error) {
    console.error("Error fetching income type list: ", error.message);
    throw error;
  }
};


// Retrieve all income types
export const getAllIncomeType = async () => {
  try {
    // Ensure 'incomeTypeID' is a field in the Firestore documents to order by
    const incomeTypeQuery = query(
      collection(db, "incomeType"), // Collection reference
      orderBy("incomeTypeID", "asc") // Order by 'incomeTypeID' in ascending order
    );

    const querySnapshot = await getDocs(incomeTypeQuery);

    const incomeTypeList = [];
    querySnapshot.forEach((doc) => {
      incomeTypeList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return incomeTypeList;
  } catch (error) {
    console.error("Error fetching income type list: ", error.message);
    throw error;
  }
};

// Update incomeType
export const updateIncomeType = async (incomeTypeID, incomeTypeData) => {
  console.log("incomeTypeData:", incomeTypeData);
  try {
    const incomeTypeRef = doc(db, "incomeType", incomeTypeID);
    await updateDoc(incomeTypeRef, incomeTypeData);
    console.log("Income type updated successfully");
  } catch (error) {
    console.error("Error updating income type: ", error.message);
    throw error;
  }
};

// Retrieve incomeType by ID (formatted for query)
export const getIncomeTypeById = async (incomeTypeID) => {
  const formattedIncomeTypeID = incomeTypeID.trim();
  try {
    // Create a query against the collection
    const q = query(
      collection(db, "incomeType"),
      where("incomeTypeID", "==", formattedIncomeTypeID)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if any documents match the query
    if (!querySnapshot.empty) {
      // Return the first matching document
      const docSnapshot = querySnapshot.docs[0];
      const incomeType = { id: docSnapshot.id, ...docSnapshot.data() };
      return incomeType;
    } else {
      console.log("Income type not found");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving income type:", error.message);
    throw new Error("Error retrieving income type: " + error.message);
  }
};

// Retrieve incomeType by document ID
export const getById = async (incomeTypeID) => {
  try {
    // Create a reference to the document
    const docRef = doc(db, "incomeType", incomeTypeID);

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

// Update incomeType by document ID
export const updateIncomeTypeById = async (incomeTypeID, updatedData) => {
  try {
    const incomeTypeDocRef = doc(db, "incomeType", incomeTypeID);
    await updateDoc(incomeTypeDocRef, updatedData);

    console.log("Income type updated successfully");
  } catch (error) {
    console.error("Error updating income type:", error.message);
    throw error;
  }
};

// Retrieve incomeType document by ID
export const getIncomeTypeDocumentById = async (docID) => {
  try {
    const incomeTypeDocRef = doc(db, "incomeType", docID);
    const incomeTypeDocSnapshot = await getDoc(incomeTypeDocRef);

    if (incomeTypeDocSnapshot.exists()) {
      return { id: incomeTypeDocSnapshot.id, ...incomeTypeDocSnapshot.data() };
    } else {
      console.warn(`Income type document with ID '${docID}' not found`);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving income type document by ID:", error.message);
    throw new Error(`Error retrieving income type document by ID: ${error.message}`);
  }
};
