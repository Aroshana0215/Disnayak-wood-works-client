import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  runTransaction
} from "firebase/firestore";

const db = getFirestore();

// Insert new expense for price Card List
export const newExpense = async (expenseData) => {
  const counterDocRef = doc(db, "counters", "expenseCounter");

  try {
    // Check if the counter document exists
    const counterDocSnapshot = await getDoc(counterDocRef);

    if (!counterDocSnapshot.exists()) {
      // If the counter document does not exist, create it with currentID: 0
      await setDoc(counterDocRef, { currentID: 0 });
      console.log("Expense counter document created with initial currentID: 0");
    }

    // Run a transaction to ensure atomicity and generate the expense ID
    const expenseID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newExpenseID = `EXP${newID}`;

      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });

      return newExpenseID;
    });

    // Add the new expense record with the generated expenseID
    const expenseDataWithID = { ...expenseData, expenseID };
    const docRef = await addDoc(collection(db, "expense"), expenseDataWithID);
    console.log("New expense entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New expense: ", error.message);
    throw error;
  }
};

export const getAllexpense = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "expense"));
    const expenseList = [];
    querySnapshot.forEach((doc) => {
      expenseList.push({ id: doc.id, ...doc.data() });
    });
    return expenseList;
  } catch (error) {
    console.error("Error fetching  expense List: ", error.message);
    throw error;
  }
};

// Update expense
export const updateexpense = async (expenseId, expenseData) => {
  try {
    const expenseRef = doc(db, "expense", expenseId);
    await updateDoc(expenseRef, expenseData);
    console.log("Price Card expense updated successfully");
  } catch (error) {
    console.error("Error updating Price Card expense: ", error.message);
    throw error;
  }
};

// Get One expense by ID
export const getexpenseById = async (expenseId) => {
  try {
    const expenseRef = doc(db, "expense", expenseId);
    const expenseSnapshot = await getDoc(expenseRef);

    if (expenseSnapshot.exists()) {
      const expense = { id: expenseSnapshot.id, ...expenseSnapshot.data() };
      return expense;
    } else {
      console.log("expense not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting expense: ", error.message);
    throw error;
  }
};
