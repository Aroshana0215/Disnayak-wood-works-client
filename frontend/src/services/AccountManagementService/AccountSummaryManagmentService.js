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

// Insert new accountSummary for price Card List
export const newAccountSummary = async (accountSummaryData) => {
  try {
    const docRef = await addDoc(
      collection(db, "accountSummary"),
      accountSummaryData
    );
    console.log(
      "New accountSummary entered into the system with ID: ",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New accountSummary: ", error.message);
    throw error;
  }
};

export const getAllaccountSummary = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "accountSummary"));
    const accountSummaryList = [];
    querySnapshot.forEach((doc) => {
      accountSummaryList.push({ id: doc.id, ...doc.data() });
    });
    return accountSummaryList;
  } catch (error) {
    console.error("Error fetching  accountSummary List: ", error.message);
    throw error;
  }
};

// Update accountSummary
export const updateAccountSummary = async (
  accountSummaryId,
  accountSummaryData
) => {
  console.log("AccountSummary updated ", accountSummaryData);
  try {
    const accountSummaryRef = doc(db, "accountSummary", accountSummaryId);
    await updateDoc(accountSummaryRef, accountSummaryData);
    console.log("AccountSummary updated successfully");
  } catch (error) {
    console.error("Error updating accountSummary: ", error.message);
    throw error;
  }
};

// Get One accountSummary by ID
export const getaccountSummaryById = async (accountSummaryId) => {
  try {
    const accountSummaryRef = doc(db, "accountSummary", accountSummaryId);
    const accountSummarySnapshot = await getDoc(accountSummaryRef);

    if (accountSummarySnapshot.exists()) {
      const accountSummary = {
        id: accountSummarySnapshot.id,
        ...accountSummarySnapshot.data(),
      };
      return accountSummary;
    } else {
      console.log("accountSummary not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting accountSummary: ", error.message);
    throw error;
  }
};

export const getActiveAccountSummaryDetails = async () => {
  try {
    const q = query(
      collection(db, "accountSummary"),
      where("status", "==", "A")
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If query returns a result, get the first document
      const docSnapshot = querySnapshot.docs[0];
      const accountSummaryDetails = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };
      return accountSummaryDetails;
    } else {
      console.log("No accountSummaryDetails found");
      return null;
    }
  } catch (error) {
    console.error("Error getting accountSummaryDetails: ", error.message);
    throw error;
  }
};


// Get One accountSummary by ID
export const getActiveaccountSummaryById = async (accountSummaryId) => {
  try {

    const q = query(
      collection(db, "accountSummary"),
      where("accountSummaryId", "==", "A")
    );

    const querySnapshot = await getDocs(q);

    const accountSummaryRef = doc(db, "accountSummary", accountSummaryId);
    const accountSummarySnapshot = await getDoc(accountSummaryRef);

    if (accountSummarySnapshot.exists()) {
      const accountSummary = {
        id: accountSummarySnapshot.id,
        ...accountSummarySnapshot.data(),
      };
      return accountSummary;
    } else {
      console.log("accountSummary not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting accountSummary: ", error.message);
    throw error;
  }
};
