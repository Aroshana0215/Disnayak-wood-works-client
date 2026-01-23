import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  setDoc,
  runTransaction,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";

const db = getFirestore();

export const newPaySheet = async (employeePaySheetData) => {
  console.log("employeePaySheetData:", employeePaySheetData);

  const counterDocRef = doc(db, "counters", "paySheetCounter");

  try {
    // Check if the counter document exists
    const counterDocSnapshot = await getDoc(counterDocRef);

    if (!counterDocSnapshot.exists()) {
      // If the counter document does not exist, create it with currentID: 0
      await setDoc(counterDocRef, { currentID: 0 });
      console.log("PaySheet counter document created with initial currentID: 0");
    }

    // Check if there's an active paysheet for the employee
    const querySnapshot = await getDocs(
      query(
        collection(db, "employeePaySheet"),
        where("eid_fk", "==", employeePaySheetData.eid_fk),
        where("status", "==", "A")
      )
    );

    if (!querySnapshot.empty && querySnapshot.docs.length > 0) {
      console.log("Active paysheet found, checking dates");

      const latestPaySheetSnapshot = await getDocs(
        query(
          collection(db, "employeePaySheet"),
          where("eid_fk", "==", employeePaySheetData.eid_fk),
          where("status", "==", "A"),
          orderBy("createdDate", "desc"),
          limit(1)
        )
      );

      if (!latestPaySheetSnapshot.empty) {
        const firstDoc = latestPaySheetSnapshot.docs[0].data();
        let filteredDate = "";

        if (firstDoc.toDate != null) {
          const date = new Date(firstDoc.toDate.seconds * 1000);
          const options = {
            weekday: "short",
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short",
          };
          filteredDate = date.toLocaleString("en-US", options);
        }

        // const fromDate = new Date(employeePaySheetData.fromDate);
        // const toDate = new Date(employeePaySheetData.toDate);
        // const parsedFilteredDate = new Date(filteredDate);
        // if (toDate <= parsedFilteredDate || fromDate <= parsedFilteredDate) {
        //   throw new Error("Cannot enter Pay sheet record for paid date.");
        // }
      }
    }

    // Run a transaction to ensure atomicity and generate the paySheet ID
    const paySheetID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newPaySheetID = `PAY${newID}`;

      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });

      return newPaySheetID;
    });

    // Add the new paysheet record with the generated paySheetID
    const employeePaySheetDataWithID = { ...employeePaySheetData, paySheetID };
    const docRef = await addDoc(
      collection(db, "employeePaySheet"),
      employeePaySheetDataWithID
    );
    console.log(
      "New employeePaySheet entered into the system with ID: ",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New employeePaySheet: ", error.message);
    throw error;
  }
}

export const getPaysheetDetailsByEmployee = async (eid) => {
  try {
    const q = query(
      collection(db, "employeePaySheet"),
      where("eid_fk", "==", eid),
      where("status", "==", "A")
    );

    const querySnapshot = await getDocs(q);
    const employeePaySheets = []; // Initialize an array to store employeePaySheet objects

    querySnapshot.forEach((docSnapshot) => {
      // Create an object containing the id and data() for each document
      const employeePaySheet = { id: docSnapshot.id, ...docSnapshot.data() };
      employeePaySheets.push(employeePaySheet); // Push the object to the array
    });

    return employeePaySheets; // Return the array of employeePaySheet objects
  } catch (error) {
    console.error("Error getting employeePaySheets: ", error.message);
    throw error;
  }
};

// Update employeePaySheet
export const updateemployeePaySheet = async (
  employeePaySheetId,
  employeePaySheetData
) => {
  try {
    const employeePaySheetRef = doc(db, "employeePaySheet", employeePaySheetId);
    await updateDoc(employeePaySheetRef, employeePaySheetData);
    console.log("Price Card employeePaySheet updated successfully");
  } catch (error) {
    console.error(
      "Error updating Price Card employeePaySheet: ",
      error.message
    );
    throw error;
  }
};

// Get One employeePaySheet by ID
export const getemployeePaySheetById = async (paymentId) => {
  try {
    const employeePaySheetRef = doc(db, "employeePaySheet", paymentId);
    const employeePaySheetSnapshot = await getDoc(employeePaySheetRef);

    if (employeePaySheetSnapshot.exists()) {
      const employeePaySheet = {
        id: employeePaySheetSnapshot.id,
        ...employeePaySheetSnapshot.data(),
      };
      return employeePaySheet;
    } else {
      console.log("employeePaySheet not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting employeePaySheet: ", error.message);
    throw error;
  }
};

export const getLatestToDateByEmployee = async (eid) => {
  try {
    const q = query(
      collection(db, "employeePaySheet"),
      where("eid_fk", "==", eid),
      where("status", "==", "A"),
      orderBy("toDate", "desc"), // Order by toDate in descending order
      limit(1) // Get only the latest record
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const latestPaySheet = querySnapshot.docs[0].data();
      return latestPaySheet.toDate;
    } else {
      console.log("No active paysheet found for this employee.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching latest toDate: ", error.message);
    throw error;
  }
};

