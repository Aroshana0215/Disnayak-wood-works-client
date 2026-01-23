import { getFirestore, collection, addDoc, doc, runTransaction, getDoc, setDoc } from "firebase/firestore";

const db = getFirestore();
const cubicValueCollection = collection(db, "cubicValue"); // Firestore collection
const counterRef = doc(db, "counters", "cubicValueCounter"); // Counter document

/**
 * Upload JSON data to cubicValue collection in Firestore
 * @param {Array} data Array of cubicValue objects
 * @returns {Promise<number>} Number of records uploaded
 */
export const ImportCubicValuesJSON = async (data) => {
  if (!Array.isArray(data)) throw new Error("Data must be an array of objects");

  let uploadedCount = 0;

  // Ensure counter exists
  const counterSnapshot = await getDoc(counterRef);
  if (!counterSnapshot.exists()) {
    await setDoc(counterRef, { currentID: 0 }); // Initialize counter if missing
    console.log("Counter document created");
  }

  for (const record of data) {
    try {
      // Run transaction to get unique ID
      const newID = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentID = counterDoc.data().currentID || 0;
        const nextID = currentID + 1;
        transaction.update(counterRef, { currentID: nextID });
        return nextID;
      });

      const recordWithID = {
        ...record,
        cubicValueId: `CUB-${newID}`,
        cubicValueNumber: newID,
      };

      await addDoc(cubicValueCollection, recordWithID);
      uploadedCount++;
    } catch (err) {
      console.error("Error uploading record:", err.message);
    }
  }

  console.log(`${uploadedCount} records uploaded successfully`);
  return uploadedCount;
};
