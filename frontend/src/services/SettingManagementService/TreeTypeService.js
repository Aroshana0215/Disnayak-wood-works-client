import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, runTransaction } from "firebase/firestore";
import { createAsyncThunk } from "@reduxjs/toolkit";

const db = getFirestore();

// Insert new treeType
export const createTreeType = async (treeTypeData) => {
  console.log("New tree type entered into the system", treeTypeData);

  const counterDocRef = doc(db, "counters", "treeTypeCounter");

  try {
    // Run a transaction to ensure atomicity
    const treeTypeID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      if (!counterDoc.exists()) {
        throw new Error("Counter document does not exist!");
      }

      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newtreeTypeID = `TYPE-${newID}`;

      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });

      return newtreeTypeID;
    });

    // Add the new tree type record with the generated treeTypeID
    const treeTypeDataWithID = { ...treeTypeData, treeTypeID: treeTypeID };
    const docRef = await addDoc(collection(db, "treeType"), treeTypeDataWithID);
    console.log("New tree type entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New type entered: ", error.message);
    throw error;
  }
};

export const getAllActiveTreeType = async () => {
  try {
    // Ensure 'id' is a field in the Firestore documents to order by
    const treeTypeQuery = query(
      collection(db, "treeType"), // Collection reference
      where("status", "==", "A"),
      orderBy("treeTypeID", "asc") // Order by 'id' in ascending order
    );

    const querySnapshot = await getDocs(treeTypeQuery);

    const treeTypeList = [];
    querySnapshot.forEach((doc) => {
      treeTypeList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return treeTypeList;
  } catch (error) {
    console.error("Error fetching treeType List: ", error.message);
    throw error;
  }
};

export const getAllTreeType = async () => {
  try {
    // Ensure 'id' is a field in the Firestore documents to order by
    const treeTypeQuery = query(
      collection(db, "treeType"), // Collection reference
      orderBy("treeTypeID", "asc") // Order by 'id' in ascending order
    );

    const querySnapshot = await getDocs(treeTypeQuery);

    const treeTypeList = [];
    querySnapshot.forEach((doc) => {
      treeTypeList.push({ id: doc.id, ...doc.data() });
    });

    // Return the ordered list
    return treeTypeList;
  } catch (error) {
    console.error("Error fetching treeType List: ", error.message);
    throw error;
  }
};

// Update category
export const updateCategory = async (treeTypeID, treeTypeData) => {
  console.log("treeTypeData:", treeTypeData);
  try {
    const treeTypeRef = doc(db, "treeType", treeTypeID);
    await updateDoc(treeTypeRef, treeTypeData);
    console.log("treeType updated successfully");
  } catch (error) {
    console.error("Error updating treeType : ", error.message);
    throw error;
  }
};

export const getCategoryById = async (treeTypeID) => {
  const formattedtreeTypeID = treeTypeID.trim();
  try {
    // Create a query against the collection
    const q = query(
      collection(db, "treeType"),
      where("treeTypeID", "==", formattedtreeTypeID)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if any documents match the query
    if (!querySnapshot.empty) {
      // Assuming uniqueAttribute is unique, return the first matching document
      const docSnapshot = querySnapshot.docs[0];
      const treeType = { id: docSnapshot.id, ...docSnapshot.data() };
      return treeType;
    } else {
      console.log("Category not found");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving category:", error.message);
    throw new Error("Error retrieving category: " + error.message);
  }
};

export const getById = async (treeTypeID) => {
  try {
    // Create a reference to the document
    const docRef = doc(db, "treeType", treeTypeID);

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

export const updateTreeType = async (treeTypeID, updatedData) => {
    try {
      const treeTypeDocRef = doc(db, "treeType", treeTypeID);
      await updateDoc(treeTypeDocRef, updatedData);
  
      console.log("Tree type updated successfully");
    } catch (error) {
      console.error("Error updating tree type:", error.message);
      throw error;
    }
  };

  export const getTreeTypeById = async (docID) => {
    try {
      const treeTypeDocRef = doc(db, "treeType", docID);
      const treeTypeDocSnapshot = await getDoc(treeTypeDocRef);
  
      if (treeTypeDocSnapshot.exists()) {
        return { id: treeTypeDocSnapshot.id, ...treeTypeDocSnapshot.data() };
      } else {
        console.warn(`Tree type document with ID '${docID}' not found`);
        return null;
      }
    } catch (error) {
      console.error("Error retrieving tree type document by ID:", error.message);
      throw new Error(`Error retrieving tree type document by ID: ${error.message}`);
    }
  };
