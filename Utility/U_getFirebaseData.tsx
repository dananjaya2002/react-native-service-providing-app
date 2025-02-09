import { doc, getDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig"; // Adjust the path if needed

export const getSingleServiceProviderData = async () => {
  if (!db) {
    console.warn("❌ Firestore is invalid.");
    return null;
  }

  try {
    console.warn(" ✅ Firestore is being accessed...");

    const docRef = doc(db, "Service Providers", "p3246"); // Fetch by document ID
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("\nDocument data:", docSnap.data());
      return docSnap.data(); // Returning the document data
    } else {
      console.warn("No service provider found with ID p3246.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
};
