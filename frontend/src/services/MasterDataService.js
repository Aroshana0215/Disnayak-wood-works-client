import { getFirestore, getDoc, doc} from "firebase/firestore";

const db = getFirestore();

export const getByMid = async (mId) => {
    try {
        // Create a reference to the document
        const docRef = doc(db, "masterData", mId);

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



