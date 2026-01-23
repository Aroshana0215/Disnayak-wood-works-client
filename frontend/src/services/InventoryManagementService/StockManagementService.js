import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, doc, runTransaction} from "firebase/firestore";


const db = getFirestore();

// Insert new Inventory Details
export const NewInventory = async (inventoryData) => {
    console.log("New Inventory entered into the system", inventoryData);
  
    const counterDocRef = doc(db, "counters", "inventoryCounter");
  
    try {
      // Run a transaction to ensure atomicity
      const inventoryID = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterDocRef);
  
        if (!counterDoc.exists()) {
          throw new Error("Counter document does not exist!");
        }
  
        const currentID = counterDoc.data().currentID || 0;
        const newID = currentID + 1;
        const newInventoryID = `INV-${newID}`;
  
        // Update the counter document with the new ID
        transaction.update(counterDocRef, { currentID: newID });
  
        return newInventoryID;
      });
  
      // Add the new inventory record with the generated inventoryID
      const inventoryDataWithID = { ...inventoryData, inventoryId: inventoryID };
      const docRef = await addDoc(collection(db, "Inventory"), inventoryDataWithID);
      const inventoryDetailsSnapshot = await getDoc(docRef);
  
      if (inventoryDetailsSnapshot.exists()) {
        const newInventory = { id: inventoryDetailsSnapshot.id, ...inventoryDetailsSnapshot.data() };
        console.log("New Inventory Details entered into the system with ID: ", newInventory.id);
        return newInventory;
      } else {
        console.log("Inventory Details not found");
        return null;
      }
    } catch (error) {
      console.error("Error getting Inventory Details: ", error.message);
      throw error;
    }
  };


export const getAllInventoryDetails = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "Inventory"));
        const InventoryDetailList = [];
        querySnapshot.forEach((doc) => {
            InventoryDetailList.push({ id: doc.id, ...doc.data() });
        });
        return InventoryDetailList;
    } catch (error) {
        console.error("Error fetching Inventory Detail List: ", error.message);
        throw error;
    }
};

// Update Inventory Details
export const updateInventoryDetails = async (InventoryId, InventoryData ) => {
    try {
        const InventoryDetailsRef = doc(db, "Inventory", InventoryId);
        await updateDoc(InventoryDetailsRef, InventoryData);
        console.log("Inventory Details updated successfully");
    } catch (error) {
        console.error("Error updating Inventory Details: ", error.message);
        throw error;
    }
};

// Get One Inventory Details ID
export const getInventoryDetailsById =  async (InventoryId) => {
    try {
        const InventoryDetailsRef = doc(db, "Inventory", InventoryId);
        const InventoryDetailsSnapshot = await getDoc(InventoryDetailsRef);

        if (InventoryDetailsSnapshot.exists()) {
            const loadDetails = { id: InventoryDetailsSnapshot.id, ...InventoryDetailsSnapshot.data() };
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


