import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    doc,
    query,
    where,
  } from "firebase/firestore";
  
  const db = getFirestore();
  
  // Insert new bill advance record
  export const createbillAdvance = async (billAdvanceData) => {
    console.log("billAdvance: ", billAdvanceData);
    try {
      const docRef = await addDoc(collection(db, "billAdvance"), billAdvanceData);
      console.log("New bill advance entered into the system with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error entering new bill advance: ", error.message);
      throw error;
    }
  };
  
  // Get all bill advance records
  export const getAllbillAdvances = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "billAdvance"));
      const billAdvanceList = [];
      querySnapshot.forEach((doc) => {
        billAdvanceList.push({ id: doc.id, ...doc.data() });
      });
      return billAdvanceList;
    } catch (error) {
      console.error("Error fetching bill advance list: ", error.message);
      throw error;
    }
  };
  
  // Update bill advance record
  export const updatebillAdvance = async (billAdvanceId, billAdvanceData) => {
    try {
      const billAdvanceRef = doc(db, "billAdvance", billAdvanceId);
      await updateDoc(billAdvanceRef, billAdvanceData);
      console.log("Bill advance updated successfully");
    } catch (error) {
      console.error("Error updating bill advance: ", error.message);
      throw error;
    }
  };
  
  // Get one bill advance record by ID
  export const getbillAdvanceById = async (billAdvanceId) => {
    console.log("🚀 ~ getbillAdvanceById ~ billAdvanceId:", billAdvanceId)
    try {
      const billAdvanceRef = doc(db, "billAdvance", billAdvanceId);
      const billAdvanceSnapshot = await getDoc(billAdvanceRef);
  
      if (billAdvanceSnapshot.exists()) {
        const billAdvanceDetails = {
          id: billAdvanceSnapshot.id,
          ...billAdvanceSnapshot.data(),
        };
        return billAdvanceDetails;
      } else {
        console.log("Bill advance not found");
        return null;
      }
    } catch (error) {
      console.error("Error getting bill advance: ", error.message);
      throw error;
    }
  };
  
  // Get bill advance records by bill ID
  export const getbillAdvancesByBillId = async (billId) => {
    console.log("billId:", billId);
    try {
      const q = query(
        collection(db, "billAdvance"),
        where("BillId", "==", billId),
        where("status", "==", "A"),
      );
      const querySnapshot = await getDocs(q);
  
      const billAdvanceList = [];
      querySnapshot.forEach((doc) => {
        billAdvanceList.push({ id: doc.id, ...doc.data() });
      });
  
      return billAdvanceList;
    } catch (error) {
      console.error("Error getting bill advance details: ", error.message);
      throw error;
    }
  };
  