import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, runTransaction } from "firebase/firestore";
import { createAsyncThunk } from "@reduxjs/toolkit";

const db = getFirestore();

// Insert new category for price Card List
export const createCategory = async (categoryData) => {
    console.log("New Category entered into the system", categoryData);
  
    const counterDocRef = doc(db, "counters", "categoryCounter");
  
    try {
      // Run a transaction to ensure atomicity
      const categoryID = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterDocRef);
  
        if (!counterDoc.exists()) {
          throw new Error("Counter document does not exist!");
        }
  
        const currentID = counterDoc.data().currentID || 0;
        const newID = currentID + 1;
  
        // Update the counter document with the new ID
        transaction.update(counterDocRef, { currentID: newID });
  
        return newID;
      });
  
      // Add the new category record with the generated categoryID and categoryNumber
      const newCategoryID = `CAT-${categoryID}`;
      const categoryDataWithID = {
        ...categoryData,
        categoryId: newCategoryID,
        categoryNumber: categoryID, // Add categoryNumber field
      };
  
      // Add the document to Firestore
      const docRef = await addDoc(collection(db, "priceCard"), categoryDataWithID);
      console.log("New Category entered into the system with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error Entering New Category: ", error.message);
      throw error;
    }
  };

export const getAllCategories = async () => {
    try {
      // Ensure 'id' is a field in the Firestore documents to order by
      const priceCardQuery = query(
        collection(db, "priceCard"), // Collection reference
        orderBy("categoryNumber", "desc") // Order by 'id' in ascending order
      );
      
      const querySnapshot = await getDocs(priceCardQuery);
      
      const priceCardList = [];
      querySnapshot.forEach((doc) => {
        priceCardList.push({ id: doc.id, ...doc.data() });
      });
      
      // Return the ordered list
      return priceCardList;
    } catch (error) {
      console.error("Error fetching price Card List: ", error.message);
      throw error;
    }
  };


// Update category
export const updateCategory = async (categoryId, categoryData ) => {
    console.log("categoryData:",categoryData)
    try {
        const priceCardRef = doc(db, "priceCard", categoryId);
        await updateDoc(priceCardRef, categoryData);
        console.log("Price Card Category updated successfully");
    } catch (error) {
        console.error("Error updating Price Card Category: ", error.message);
        throw error;
    }
};

export const getCategoryById = async (categoryId) => {
    const formattedCategoryId = categoryId.trim();
    try {
        // Create a query against the collection
        const q = query(
            collection(db, "priceCard"),
            where("categoryId", "==", formattedCategoryId),
        );

        // Execute the query
        const querySnapshot = await getDocs(q);


        // Check if any documents match the query
        if (!querySnapshot.empty) {

            // Assuming uniqueAttribute is unique, return the first matching document
            const docSnapshot = querySnapshot.docs[0];
            const priceCard = { id: docSnapshot.id, ...docSnapshot.data() };
            return priceCard;
        } else {
            console.log("Category not found");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving category:", error.message);
        throw new Error("Error retrieving category: " + error.message);
    }
};



export const getById = async (categoryId) => {
    try {
        // Create a reference to the document
        const docRef = doc(db, "priceCard", categoryId);

        // Execute the query
        const docSnapshot = await getDoc(docRef);

        // Check if the document exists
        if (docSnapshot.exists()) {
            // Return the document data along with the document ID
            const document = { id: docSnapshot.id, ...docSnapshot.data() };
            return document;
        } else {
            console.log("Document not found");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving document:", error.message);
        throw new Error("Error retrieving document: " + error.message);
    }
};

// Delete category
export const deleteCategory = createAsyncThunk("category/delete", async (categoryId) => {
    try {
        const priceCardRef = doc(db, "priceCard", categoryId);
        await deleteDoc(priceCardRef);
        console.log("Price Card Category deleted successfully");
        return categoryId;
    } catch (error) {
        console.error("Error deleting Price Card Category: ", error.message);
        throw error;
    }
});



export const getCategoryIdBytimberType  = async (timberType) => {

    try {
        const q = query(
            collection(db, "priceCard"),
            where("timberType", "==", timberType),
        );

        const querySnapshot = await getDocs(q);
        console.log("querySnapshot empty:", querySnapshot.empty);

        if (!querySnapshot.empty) {
            const priceCardList = [];
            querySnapshot.forEach((doc) => {
                priceCardList.push({ id: doc.id, ...doc.data() });
            });
            return priceCardList;
        } else {
            console.log("No stockSummaryDetails found for the given parameters.");
            return null;
        }
    } catch (error) {
        console.error("Error getting stockSummaryDetails: ", error.message);
        throw error;
    }
};



export const validateCategoryType  = async (categoryData) => {

    try {
        const q = query(
            collection(db, "priceCard"),
            where("timberType", "==", categoryData.timberType),
            where("timberNature", "==", categoryData.timberNature),
            where("minlength", "==", categoryData.minlength),
            where("maxlength", "==", categoryData.maxlength),

        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const priceCardList = [];
            querySnapshot.forEach((doc) => {
                priceCardList.push({ id: doc.id, ...doc.data() });
            });
            return priceCardList;
        } else {
            console.log("No stockSummaryDetails found for the given parameters.");
            return null;
        }
    } catch (error) {
        console.error("Error getting stockSummaryDetails: ", error.message);
        throw error;
    }
};

export const validateCategoryType2  = async (categoryData) => {

    try {
        console.log("categoryData:", categoryData);
        const q = query(
            collection(db, "priceCard"),
            where("timberType", "==", categoryData.timberType),
            where("timberNature", "==", categoryData.timberNature),
            where("areaLength", "==", categoryData.areaLength),
            where("areaWidth", "==", categoryData.areaWidth),

        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const priceCardList = [];
            querySnapshot.forEach((doc) => {
                priceCardList.push({ id: doc.id, ...doc.data() });
            });
            return priceCardList;
        } else {
            console.log("No stockSummaryDetails found for the given parameters.");
            return null;
        }
    } catch (error) {
        console.error("Error getting stockSummaryDetails: ", error.message);
        throw error;
    }
};


export const getCategorybasedOnLength = async (categoryData) => {
    try {
        const categoryList = await validateCategoryType2(categoryData);
        console.log("categoryList:", categoryList);

        if (categoryList && categoryList.length > 0) {
            // Find the first category where categoryData.length is between minlength and maxlength
            const matchedCategory = categoryList.find(category =>
                category.minlength <= categoryData.length && categoryData.length <= category.maxlength
            );

            if (matchedCategory) {
                console.log("Matching category:", matchedCategory);
                return matchedCategory; // Returns a single object, not an array
            } else {
                console.log("No matching category found for the given length.");
                return null;
            }
        } else {
            console.log("No categoryList found for the given parameters.");
            return null;
        }
    } catch (error) {
        console.error("Error getting stockSummaryDetails: ", error.message);
        throw error;
    }
};


