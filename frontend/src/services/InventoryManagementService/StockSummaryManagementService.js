import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  getDoc
} from "firebase/firestore";

const db = getFirestore();

// Insert new order for price Card List
export const createStockSummary = async (stockData) => {
  console.log("stockData:",stockData);
  try {
    const docRef = await addDoc(collection(db, "inventorySummary"), stockData);
    console.log("sucessfully created inventory details: ");
    return docRef.id;
  } catch (error) {
    console.error("Error Entering inventory details ", error.message);
    throw error;
  }
};

export const getActiveStockSummaryDetails = async (categoryId, length) => {
  console.log("categoryId:",categoryId);
  console.log("length:",length);
  const formattedCategoryId = categoryId.trim();
  const formattedLength = String(length); 

  console.log("formattedCategoryId:",formattedCategoryId);
  console.log("🚀 ~ formattedLength:", formattedLength)
  try {
    const q = query(
      collection(db, "inventorySummary"),
      where("categoryId_fk", "==", formattedCategoryId),
      where("length", "==", formattedLength),
      where("status", "==", "A")
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If query returns a result, get the first document
      const docSnapshot = querySnapshot.docs[0];
      const stockSummaryDetails = { id: docSnapshot.id, ...docSnapshot.data() };
      return stockSummaryDetails;
    } else {
      console.log("No stockSummaryDetails found for categoryId:",formattedCategoryId);
      return null;
    }
  } catch (error) {
    console.error("Error getting stockSummaryDetails: ", error.message);
    throw error;
  }
};

// export const updateStockSummaryDetails = async (stockId, stockData) => {
//   try {
//     const priceCardRef = doc(db, "inventorySummary", stockId);
//     await updateDoc(priceCardRef, stockData);
//     console.log("Inventory Summary updated successfully");
//   } catch (error) {
//     console.error("Error updating Inventory Summary: ", error.message);
//     throw error;
//   }
// };

export const updateStockSummaryDetails = async (stockId, stockData) => {
  try {
    const priceCardRef = doc(db, "inventorySummary", stockId);
    await updateDoc(priceCardRef, stockData);

    // Fetch updated data after update
    const updatedDoc = await getDoc(priceCardRef);

    if (updatedDoc.exists()) {
      console.log("Inventory Summary updated successfully:", updatedDoc.data());
      return updatedDoc.data(); 
    } else {
      console.log("Inventory Summary updated, but document not found.");
      return null
    }
  } catch (error) {
    console.error("Error updating Inventory Summary: ", error.message);
    return { success: false, error: error.message };
  }
};



export const getAllSummaryDetails = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "inventorySummary"));
    const InventoryDetailList = [];
    querySnapshot.forEach((doc) => {      
      InventoryDetailList.push({ id: doc.id, ...doc.data() });
    });
    return InventoryDetailList;
  } catch (error) {
    console.error(
      "Error fetching Inventory Summary Detail List: ",
      error.message
    );
    throw error;
  }
};

export const getAllActiveStockDetails = async () => {
  try {
    const q = query(
      collection(db, "inventorySummary"),
      where("status", "==", "A")
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
    const InventoryDetailList = [];
    querySnapshot.forEach((doc) => {      
      InventoryDetailList.push({ id: doc.id, ...doc.data() });
    });
    return InventoryDetailList;
  }else{
    console.error("Noc ative stocks available: ");
  }
  } catch (error) {
    console.error(
      "Error fetching Inventory Summary Detail List: ",
      error.message
    );
    throw error;
  }
};


export const getStockSummaryById = async (stockId) => {
  try {
    // Reference to the document in the "inventorySummary" collection by its ID
    const docRef = doc(db, "inventorySummary", stockId);
    
    // Retrieve the document data
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      // If the document exists, return its data along with the document ID
      return { id: docSnapshot.id, ...docSnapshot.data() };
    } else {
      console.log("No document found with the given ID:", stockId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Inventory Summary by ID: ", error.message);
    throw error;
  }
};


export const getActiveStockForSwitchCategory  = async (categoryData) => {

    try {
      debugger
        const q = query(
            collection(db, "inventorySummary"),
            where("timberType", "==", categoryData.timberType),
            where("timberNature", "==", categoryData.timberNature),
            where("areaLength", "==", categoryData.areaLength),
            where("areaWidth", "==", categoryData.areaWidth),
            where("length", "==", categoryData.length),
            where("status", "==", "A")

        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const priceCardList = [];
            querySnapshot.forEach((doc) => {
                priceCardList.push({ id: doc.id, ...doc.data() });
            });
            return priceCardList;
        } else {
            console.log("No stockSummaryDetails found for the given parameters.");
            return null;
        }
    } catch (error) {
        console.error("Error getting stockSummaryDetails: ", error.message);
        throw error;
    }
};


