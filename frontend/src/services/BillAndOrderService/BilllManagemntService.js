import {
  getFirestore,
  collection,
  addDoc,
  doc,
  runTransaction,
  getDocs,
  updateDoc,
  getDoc,
  query,
  orderBy
} from "firebase/firestore";

const db = getFirestore();

// Insert new billDetails for price Card List
export const newBill = async (billDetailsData) => {
  
  const counterDocRef = doc(db, "counters", "billCounter");

  try {
    // Run a transaction to ensure atomicity
    const billID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);
      
      if (!counterDoc.exists()) {
        throw new Error("Counter document does not exist!");
      }
      
      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      
      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });
      
      return newID;
    });

    const newBillID = `BILL-${billID}`;
    const billDataWithID = {
      ...billDetailsData,
      billID: newBillID,
      billNumber: billID // Add categoryNumber field
    };
    
    // Add the new bill record with the generated billID

    const docRef = await addDoc(collection(db, "billDetails"), billDataWithID);
    console.log("New billDetails entered into the system with ID: ", docRef.id);
    // Retrieve the saved document
    const savedDoc = await getDoc(docRef);
    if (savedDoc.exists()) {
      return { id: docRef.id, ...savedDoc.data() };
    } else {
      throw new Error("Saved document does not exist!");
    }
  } catch (error) {
    console.error("Error Entering New billDetails: ", error.message);
    throw error;
  }
};

export const getAllbillDetails = async () => {
  try {
    const priceCardQuery = query(
      collection(db, "billDetails"), // Collection reference
      orderBy("billNumber", "desc") // Order by 'id' in ascending order
    );
    
    const querySnapshot = await getDocs(priceCardQuery);
    
    const billDetailsList = [];
    querySnapshot.forEach((doc) => {
      billDetailsList.push({ id: doc.id, ...doc.data() });
    });
    
    // Return the ordered list
    return billDetailsList;

  } catch (error) {
    console.error("Error fetching  billDetails List: ", error.message);
    throw error;
  }
};

// Update billDetails
export const updatebillDetails = async (billDetailsId, billDetailsData) => {
  try {
    const billDetailsRef = doc(db, "billDetails", billDetailsId);
    await updateDoc(billDetailsRef, billDetailsData);
    console.log("Price Card billDetails updated successfully");
  } catch (error) {
    console.error("Error updating Price Card billDetails: ", error.message);
    throw error;
  }
};

// Get One billDetails by ID
export const getbillDetailsById = async (billDetailsId) => {
  try {
    const billDetailsRef = doc(db, "billDetails", billDetailsId);
    const billDetailsSnapshot = await getDoc(billDetailsRef);

    if (billDetailsSnapshot.exists()) {
      const billDetails = {
        id: billDetailsSnapshot.id,
        ...billDetailsSnapshot.data(),
      };
      return billDetails;
    } else {
      console.error("Bill details not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting bill details: ", error.message);
    throw error;
  }
};

