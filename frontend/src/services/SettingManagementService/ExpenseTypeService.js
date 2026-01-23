import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, runTransaction } from "firebase/firestore";
import { createAsyncThunk } from "@reduxjs/toolkit";

const db = getFirestore();

// Insert new expenseType
export const createExpenseType = async (expenseTypeData) => {
  console.log("New expense type entered into the system", expenseTypeData);

  const counterDocRef = doc(db, "counters", "expenseTypeCounter");

  try {
    // Run a transaction to ensure atomicity
    const expenseTypeID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      if (!counterDoc.exists()) {
        throw new Error("Counter document does not exist!");
      }

      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newExpenseTypeID = `EXPENSE-${newID}`;

      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });

      return newExpenseTypeID;
    });

    // Add the new expense type record with the generated expenseTypeID
    const expenseTypeDataWithID = { ...expenseTypeData, expenseTypeID: expenseTypeID };
    const docRef = await addDoc(collection(db, "expenseType"), expenseTypeDataWithID);
    console.log("New expense type entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error entering new expense type: ", error.message);
    throw error;
  }
};

// Retrieve all expense types
export const getAllActiveExpenseType = async () => {
  try {
    // Ensure 'expenseTypeID' is a field in the Firestore documents to order by
    const expenseTypeQuery = query(
      collection(db, "expenseType"), // Collection reference
      where("status", "==", "A"),
      orderBy("expenseTypeID", "asc") // Order by 'expenseTypeID' in ascending order
    );

    const querySnapshot = await getDocs(expenseTypeQuery);

    const expenseTypeList = [];
    querySnapshot.forEach((doc) => {
      expenseTypeList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return expenseTypeList;
  } catch (error) {
    console.error("Error fetching expense type list: ", error.message);
    throw error;
  }
};

export const getAllExpenseType = async () => {
  try {
    // Ensure 'expenseTypeID' is a field in the Firestore documents to order by
    const expenseTypeQuery = query(
      collection(db, "expenseType"), // Collection reference
      orderBy("expenseTypeID", "asc") // Order by 'expenseTypeID' in ascending order
    );

    const querySnapshot = await getDocs(expenseTypeQuery);

    const expenseTypeList = [];
    querySnapshot.forEach((doc) => {
      expenseTypeList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return expenseTypeList;
  } catch (error) {
    console.error("Error fetching expense type list: ", error.message);
    throw error;
  }
};

// Update expenseType
export const updateExpenseType = async (expenseTypeID, expenseTypeData) => {
  console.log("expenseTypeData:", expenseTypeData);
  try {
    const expenseTypeRef = doc(db, "expenseType", expenseTypeID);
    await updateDoc(expenseTypeRef, expenseTypeData);
    console.log("Expense type updated successfully");
  } catch (error) {
    console.error("Error updating expense type: ", error.message);
    throw error;
  }
};

// Retrieve expenseType by ID (formatted for query)
export const getExpenseTypeById = async (expenseTypeID) => {
  const formattedExpenseTypeID = expenseTypeID.trim();
  try {
    // Create a query against the collection
    const q = query(
      collection(db, "expenseType"),
      where("expenseTypeID", "==", formattedExpenseTypeID)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if any documents match the query
    if (!querySnapshot.empty) {
      // Return the first matching document
      const docSnapshot = querySnapshot.docs[0];
      const expenseType = { id: docSnapshot.id, ...docSnapshot.data() };
      return expenseType;
    } else {
      console.log("Expense type not found");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving expense type:", error.message);
    throw new Error("Error retrieving expense type: " + error.message);
  }
};

// Retrieve expenseType by document ID
export const getById = async (expenseTypeID) => {
  try {
    // Create a reference to the document
    const docRef = doc(db, "expenseType", expenseTypeID);

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

// Update expenseType by document ID
export const updateExpenseTypeById = async (expenseTypeID, updatedData) => {
  try {
    const expenseTypeDocRef = doc(db, "expenseType", expenseTypeID);
    await updateDoc(expenseTypeDocRef, updatedData);

    console.log("Expense type updated successfully");
  } catch (error) {
    console.error("Error updating expense type:", error.message);
    throw error;
  }
};

// Retrieve expenseType document by ID
export const getExpenseTypeDocumentById = async (docID) => {
  try {
    const expenseTypeDocRef = doc(db, "expenseType", docID);
    const expenseTypeDocSnapshot = await getDoc(expenseTypeDocRef);

    if (expenseTypeDocSnapshot.exists()) {
      return { id: expenseTypeDocSnapshot.id, ...expenseTypeDocSnapshot.data() };
    } else {
      console.warn(`Expense type document with ID '${docID}' not found`);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving expense type document by ID:", error.message);
    throw new Error(`Error retrieving expense type document by ID: ${error.message}`);
  }
};
