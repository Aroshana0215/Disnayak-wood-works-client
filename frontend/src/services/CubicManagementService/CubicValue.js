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


  // Get bill advance records by bill ID
export const getcubicValueByLengthCur = async (length, circumference) => {
  console.log("length:", length);
  console.log("circumference:", circumference);
  length = Number(length);
  circumference = Number(circumference);


  try {
    const q = query(
      collection(db, "cubicValue"),
      where("length", "==", length),
      where("circumference", "==", circumference)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
             console.error("Empty");
      return null; // No match found
    }

    // Return only one record
    const doc = querySnapshot.docs[0];
             console.error("doc:"+ doc.data());
    return { id: doc.id, ...doc.data() };

  } catch (error) {
    console.error("Error getting cubic value details: ", error.message);
    throw error;
  }
};

  