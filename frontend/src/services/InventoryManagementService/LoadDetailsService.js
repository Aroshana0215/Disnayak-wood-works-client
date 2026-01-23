import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

const db = getFirestore();

// Insert new Load Details
export const NewLoad = async (loadData) => {
  console.log("New Load Details entered into the system", loadData);

  const counterDocRef = doc(db, "counters", "loadCounter");

  try {
    // Run a transaction to ensure atomicity
    const loadID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      if (!counterDoc.exists()) {
        throw new Error("Counter document does not exist!");
      }

      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newLoadID = `LOAD-${newID}`;

      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });

      return newLoadID;
    });

    // Add the new load record with the generated LoadID and timestamp
    const loadDataWithIDAndTimestamp = {
      ...loadData,
      loadID: loadID,
      createdDate: serverTimestamp(),
    };
    const docRef = await addDoc(
      collection(db, "relatedPermitDetails"),
      loadDataWithIDAndTimestamp
    );
    console.log("New Load Details entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New Load Details: ", error.message);
    throw error;
  }
};


export const getAllLoadDetails = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "relatedPermitDetails"));
    const LoadDetailList = [];
    querySnapshot.forEach((doc) => {
      LoadDetailList.push({ id: doc.id, ...doc.data() });
    });
    return LoadDetailList;
  } catch (error) {
    console.error("Error fetching Load Detail List: ", error.message);
    throw error;
  }
};

// Update Load Details
export const updateLoadDetails = async (loadId, loadData) => {
  try {
    const LoadDetailsRef = doc(db, "relatedPermitDetails", loadId);
    await updateDoc(LoadDetailsRef, loadData);
    console.log("Load Details updated successfully");
  } catch (error) {
    console.error("Error updating Load Details: ", error.message);
    throw error;
  }
};

// Get One Load Details ID
export const getLoadDetailsById = async (loadId) => {
  try {
    const LoadDetailsRef = doc(db, "relatedPermitDetails", loadId);
    const LoadDetailsSnapshot = await getDoc(LoadDetailsRef);

    if (LoadDetailsSnapshot.exists()) {
      const loadDetails = {
        id: LoadDetailsSnapshot.id,
        ...LoadDetailsSnapshot.data(),
      };
      return loadDetails;
    } else {
      console.log("load Details not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting load Details: ", error.message);
    throw error;
  }
};
