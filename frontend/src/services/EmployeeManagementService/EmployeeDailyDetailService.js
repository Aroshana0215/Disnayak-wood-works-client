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
  orderBy ,
  Timestamp 
} from "firebase/firestore";

const db = getFirestore();

export const newDailyDetail = async (employeeDailyDetailsData) => {
  console.log("employeeDailyDetailsData:",employeeDailyDetailsData);
  try {
    // Check if a record with the same dateTime, eid_fk, and status=A exists
    const querySnapshot = await getDocs(
      query(
        collection(db, "employeeDailyDetails"),
        where("dateTime", "==", employeeDailyDetailsData.dateTime),
        where("eid_fk", "==", employeeDailyDetailsData.eid_fk),
        where("status", "==", "A")
      )
    );

    if (!querySnapshot.empty) {
      throw new Error("duplicate record for the same day");;
    }

    // If no duplicate record found, proceed with adding the new record
    const docRef = await addDoc(
      collection(db, "employeeDailyDetails"),
      employeeDailyDetailsData
    );
    console.log(
      "New employeeDailyDetails entered into the system with ID: ",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New employeeDailyDetails: ", error.message);
    throw error;
  }
};

export const getEmployeeWorkedDetail = async (formData) => {
  console.log("Fetching Employee Work Details for:", formData);

  try {
    const fromDateTimestamp = Timestamp.fromDate(new Date(formData.fromDate));
    
    // 🔹 Ensure `toDate` includes the **entire day** (until 23:59:59)
    const toDateObject = new Date(formData.toDate);
    toDateObject.setHours(23, 59, 59, 999);
    const toDateTimestamp = Timestamp.fromDate(toDateObject);

    const q = query(
      collection(db, "employeeDailyDetails"),
      where("eid_fk", "==", formData.eid),
      where("status", "==", "A"),
      where("dateTime", ">=", fromDateTimestamp),
      where("dateTime", "<=", toDateTimestamp) // 🔥 Ensures end-of-day inclusion
    );

    const querySnapshot = await getDocs(q);
    const employeeWorkList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched Employee Work List:", employeeWorkList);
    return employeeWorkList;
  } catch (error) {
    console.error("Error getting employee work details:", error.message);
    throw error;
  }
};



export const getAllemployeeDailyDetails = async () => {
  try {
    const q = query(
      collection(db, "employeeDailyDetails"),
      orderBy("dateTime", "asc")
    );

    const querySnapshot = await getDocs(q);

    const employeeDailyDetailsList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
      };
    });

    // Extra manual sort safeguard
    const sortedList = employeeDailyDetailsList.sort((a, b) => {
      const aTime = a.dateTime?.seconds ?? 0;
      const bTime = b.dateTime?.seconds ?? 0;
      return aTime - bTime; // ascending
    });

    console.log("🚀 ~ Sorted employeeDailyDetailsList:", sortedList);
    return sortedList;
  } catch (error) {
    console.error("Error fetching employeeDailyDetails List:", error.message);
    throw error;
  }
};
;



// Update employeeDailyDetails
export const updateemployeeDailyDetails = async (
  employeeDailyDetailsId,
  employeeDailyDetailsData
) => {
  try {
    const employeeDailyDetailsRef = doc(
      db,
      "employeeDailyDetails",
      employeeDailyDetailsId
    );
    await updateDoc(employeeDailyDetailsRef, employeeDailyDetailsData);
    console.log("Price Card employeeDailyDetails updated successfully");
  } catch (error) {
    console.error(
      "Error updating Price Card employeeDailyDetails: ",
      error.message
    );
    throw error;
  }
};

// Get One employeeDailyDetails by ID
export const getemployeeDailyDetailsById = async (employeeDailyDetailsId) => {
  try {
    const employeeDailyDetailsRef = doc(
      db,
      "employeeDailyDetails",
      employeeDailyDetailsId
    );
    const employeeDailyDetailsSnapshot = await getDoc(employeeDailyDetailsRef);

    if (employeeDailyDetailsSnapshot.exists()) {
      const employeeDailyDetails = {
        id: employeeDailyDetailsSnapshot.id,
        ...employeeDailyDetailsSnapshot.data(),
      };
      return employeeDailyDetails;
    } else {
      console.log("employeeDailyDetails not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting employeeDailyDetails: ", error.message);
    throw error;
  }
};

export const updateDailyDetailsAsPaid = async (data) => {
  console.log("Updating daily details as paid for range:", data);
  try {

    const formatedFromDate = new Date(data.fromDate);
    formatedFromDate.setHours(0, 0, 0, 0);

    const formatedToDate = new Date(data.toDate);
    formatedToDate.setHours(23, 59, 59, 999);

    const formData = {
      fromDate: formatedFromDate,
      toDate: formatedToDate,
      eid: data.eid_fk,
    };

    console.log("Updating daily details as paid for range:", formData);

    const paySheetList = await getEmployeeWorkedDetail(formData);

    if (!paySheetList || paySheetList.length === 0) {
      console.log("No records found within the given date range.");
      return "No records found.";
    }

    // Batch update all retrieved documents
    const batchPromises = paySheetList.map(async (item) => {
      const docRef = doc(db, "employeeDailyDetails", item.id);
      return updateDoc(docRef, { isPaid: true });
    });

    await Promise.all(batchPromises);

    console.log(`Updated ${paySheetList.length} records as Paid.`);
    return `Updated ${paySheetList.length} records successfully.`;
  } catch (error) {
    console.error("Error updating daily details as paid:", error.message);
    throw error;
  }
};



