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

// Insert new order for price Card List
export const createOrder = async (orderData) => {
  console.log("orderData: ", orderData);
  try {
    const docRef = await addDoc(collection(db, "orderDetails"), orderData);
    console.log("New order entered into the system with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error Entering New order: ", error.message);
    throw error;
  }
};

export const getAlleOrder = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "orderDetails"));
    const orderDetailsList = [];
    querySnapshot.forEach((doc) => {
      orderDetailsList.push({ id: doc.id, ...doc.data() });
    });
    return orderDetailsList;
  } catch (error) {
    console.error("Error fetching price Card List: ", error.message);
    throw error;
  }
};

// Update order
export const updateorder = async (orderId, orderData) => {
  try {
    const orderDetailsRef = doc(db, "orderDetails", orderId);
    await updateDoc(orderDetailsRef, orderData);
    console.log("Price Card order updated successfully");
  } catch (error) {
    console.error("Error updating Price Card order: ", error.message);
    throw error;
  }
};

// Get One order by ID
export const getorderById = async (orderId) => {
  try {
    const orderDetailsRef = doc(db, "orderDetails", orderId);
    const orderDetailsSnapshot = await getDoc(orderDetailsRef);

    if (orderDetailsSnapshot.exists()) {
      const orderDetails = {
        id: orderDetailsSnapshot.id,
        ...orderDetailsSnapshot.data(),
      };
      return orderDetails;
    } else {
      console.log("order not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting order: ", error.message);
    throw error;
  }
};

// Get orderId By timberType and area Parameters
export const getorderIdByBillId = async (billId) => {
  console.log("billId:",billId);
  try {
    const q = query(
      collection(db, "orderDetails"),
      where("billId_fk", "==", billId)
    );
    const querySnapshot = await getDocs(q);

    const billDetailsList = [];
    querySnapshot.forEach((doc) => {
      billDetailsList.push({ id: doc.id, ...doc.data() });
    });

    return billDetailsList;
  } catch (error) {
    console.error("Error getting Load Related Timber Details: ", error.message);
    throw error;
  }
};
