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
  where
} from "firebase/firestore";
import { uploadToCloudinary } from "../../services/ImageUploadService/ImageUploadService";

const db = getFirestore();

export const newEmployee = async (employeeDetailsData) => {
  console.log("employeeDetailsData", employeeDetailsData);
  
  const counterDocRef = doc(db, "counters", "employeeCounter");

  try {
    // Upload image to Firebase Storage if present
    let imageUrl = "";
    if (employeeDetailsData.employeeImage) {
      imageUrl = await uploadToCloudinary(employeeDetailsData.employeeImage);
    }

    // Check if the counter document exists
    const counterDocSnapshot = await getDoc(counterDocRef);
    
    if (!counterDocSnapshot.exists()) {
      // If the counter document does not exist, create it with currentID: 0
      await setDoc(counterDocRef, { currentID: 0 });
      console.log("Employee counter document created with initial currentID: 0");
    }

    // Run a transaction to ensure atomicity
    const empID = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);
      
      const currentID = counterDoc.data().currentID || 0;
      const newID = currentID + 1;
      const newEmpID = `EMP-${newID}`;
      
      // Update the counter document with the new ID
      transaction.update(counterDocRef, { currentID: newID });
      
      return newEmpID;
    });
    
    // Add the new employee record with the generated empID
    const employeeDetailsWithID = { ...employeeDetailsData, empID: empID, employeeImage: imageUrl };
    const docRef = await addDoc(collection(db, "employeeDetails"), employeeDetailsWithID);
    console.log("New employeeDetails entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New employeeDetails: ", error.message);
    throw error;
  }
};

export const getAllemployeeDetails = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "employeeDetails"));
    const employeeDetailsList = [];
    querySnapshot.forEach((doc) => {
      employeeDetailsList.push({ id: doc.id, ...doc.data() });
    });
    return employeeDetailsList;
  } catch (error) {
    console.error("Error fetching employeeDetails List: ", error.message);
    throw error;
  }
};

export const getAllActiveEmployeeDetails = async () => {
  try {
    const q = query(
      collection(db, "employeeDetails"),
      where("status", "==", "A")
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const activeEmployeeDetailsList = [];
      querySnapshot.forEach((doc) => {
        activeEmployeeDetailsList.push({ id: doc.id, ...doc.data() });
      });
      return activeEmployeeDetailsList;
    } else {
      console.error("No active employees available.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching active employee details list:", error.message);
    throw error;
  }
};


// Update employeeDetails
export const updateemployeeDetails = async (
  employeeDetailsId,
  employeeDetailsData
) => {
  try {
    const employeeDetailsRef = doc(db, "employeeDetails", employeeDetailsId);
    await updateDoc(employeeDetailsRef, employeeDetailsData);
    console.log("Employee details updated successfully");
  } catch (error) {
    console.error("Error updating employee details: ", error.message);
    throw error;
  }
};

// Get One employeeDetails by ID
export const getemployeeDetailsById = async (employeeDetailsId) => {
  try {
    const employeeDetailsRef = doc(db, "employeeDetails", employeeDetailsId);
    const employeeDetailsSnapshot = await getDoc(employeeDetailsRef);

    if (employeeDetailsSnapshot.exists()) {
      const employeeDetails = {
        id: employeeDetailsSnapshot.id,
        ...employeeDetailsSnapshot.data(),
      };
      return employeeDetails;
    } else {
      console.log("Employee details not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting employee details: ", error.message);
    throw error;
  }
};

export const getEmployeeByEid = async (eid) => {
  const formattedEmpId = eid.trim();
  try {
      // Create a query against the collection
      const q = query(
          collection(db, "employeeDetails"),
          where("eid", "==", formattedEmpId),
      );

      // Execute the query
      const querySnapshot = await getDocs(q);

      // Check if any documents match the query
      if (!querySnapshot.empty) {
          // Assuming eid is unique, return the first matching document
          const docSnapshot = querySnapshot.docs[0];
          const employee = { id: docSnapshot.id, ...docSnapshot.data() };
          return employee;
      } else {
          console.log("Employee not found");
          return null;
      }
  } catch (error) {
      console.error("Error retrieving employee:", error.message);
      throw new Error("Error retrieving employee: " + error.message);
  }
};
