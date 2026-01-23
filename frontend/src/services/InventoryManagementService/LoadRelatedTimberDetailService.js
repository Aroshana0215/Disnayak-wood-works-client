import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const db = getFirestore();

// Insert new Load Related Timber Details
export const NewLdRelatedTimber = async (timberData) => {
  try {
    const docRefs = await Promise.all(
      timberData.map(async (data) => {
        const docRef = await addDoc(
          collection(db, "relatedTimberDetails"),
          data
        );
        console.log(
          "New Load Related Timber Details entered into the system with ID: ",
          docRef.id
        );
        return docRef.id;
      })
    );
    return docRefs;
  } catch (error) {
    console.error("Error Entering New Load Related Timber: ", error.message);
    throw error;
  }
};

export const getAllLdRelatedTimber = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "relatedTimberDetails"));
    const TimberlList = [];
    querySnapshot.forEach((doc) => {
      TimberlList.push({ id: doc.id, ...doc.data() });
    });
    return TimberlList;
  } catch (error) {
    console.error("Error fetching Load Related Timber List: ", error.message);
    throw error;
  }
};

// Update Load Related Timber Details
export const updateLdRelatedTimber = async (timberId, timberData) => {
  try {
    const TimberDetailsRef = doc(db, "relatedTimberDetails", timberId);
    await updateDoc(TimberDetailsRef, timberData);
    console.log("Load Related Timber Details updated successfully");
  } catch (error) {
    console.error(
      "Error updating Load Related Timber Details: ",
      error.message
    );
    throw error;
  }
};

// Get One Load Details ID
export const getLdRelatedTimberById = async (timberId) => {
  try {
    console.log("timberId", timberId);

    const q = query(
      collection(db, "relatedTimberDetails"),
      where("timberNo", "==", timberId)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Assuming uniqueAttribute is unique, return the first matching document
      const docSnapshot = querySnapshot.docs[0];
      const timberDetail = { id: docSnapshot.id, ...docSnapshot.data() };
      return timberDetail;
    } else {
      console.log("TimberDetail not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting Load Related Timber Details: ", error.message);
    throw error;
  }
};

// Get One Load Details By permitid_fk
export const getLdRelatedTimberByLoadId = async (LoadId) => {
  try {
    const q = query(
      collection(db, "relatedTimberDetails"),
      where("permitid_fk", "==", LoadId)
    );
    const querySnapshot = await getDocs(q);

    const timberDetailsList = [];
    querySnapshot.forEach((doc) => {
      timberDetailsList.push({ id: doc.id, ...doc.data() });
    });

    return timberDetailsList;
  } catch (error) {
    console.error("Error getting Load Related Timber Details: ", error.message);
    throw error;
  }
};
