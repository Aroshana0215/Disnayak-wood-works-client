import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query, 
  where 
} from "firebase/firestore";

const db = getFirestore();

// Insert new employDependent for price Card List
export const newDependant = async (employDependentData) => {
  try {
    const docRef = await addDoc(
      collection(db, "employDependent"),
      employDependentData
    );
    console.log(
      "New employDependent entered into the system with ID: ",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New employDependent: ", error.message);
    throw error;
  }
};

export const getAllemployDependent = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "employDependent"));
    const employDependentList = [];
    querySnapshot.forEach((doc) => {
      employDependentList.push({ id: doc.id, ...doc.data() });
    });
    return employDependentList;
  } catch (error) {
    console.error("Error fetching  employDependent List: ", error.message);
    throw error;
  }
};

// Update employDependent
export const updateemployDependent = async (
  employDependentId,
  employDependentData
) => {
  try {
    const employDependentRef = doc(db, "employDependent", employDependentId);
    await updateDoc(employDependentRef, employDependentData);
    console.log("Price Card employDependent updated successfully");
  } catch (error) {
    console.error("Error updating Price Card employDependent: ", error.message);
    throw error;
  }
};

// Get One employDependent by ID
export const getemployDependentById = async (employDependentId) => {
  try {
    const employDependentRef = doc(db, "employDependent", employDependentId);
    const employDependentSnapshot = await getDoc(employDependentRef);

    if (employDependentSnapshot.exists()) {
      const employDependent = {
        id: employDependentSnapshot.id,
        ...employDependentSnapshot.data(),
      };
      return employDependent;
    } else {
      console.log("employDependent not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting employDependent: ", error.message);
    throw error;
  }
};

// Get dependents by eid_fk
export const getDependentsByEid = async (eid_fk) => {
  try {
    const dependentsQuery = query(
      collection(db, "employDependent"),
      where("eid_fk", "==", eid_fk)
    );

    const querySnapshot = await getDocs(dependentsQuery);
    const dependentsList = [];

    querySnapshot.forEach((doc) => {
      dependentsList.push({ id: doc.id, ...doc.data() });
    });

    return dependentsList;
  } catch (error) {
    console.error("Error fetching dependents by eid_fk: ", error.message);
    throw error;
  }
};
