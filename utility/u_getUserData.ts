import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import fs from "fs"; // Import the 'fs' module

import { UserData } from "../interfaces/UserData";

/**
 * Retrieves the User Data for a given user.
 *
 * @param id - The ID of the User.
 * @returns A promise resolving to UserData or null if not found/invalid.
 */

export const getUserData = async (id: string): Promise<UserData | null> => {
  if (!id) {
    console.error("❌ Error: Invalid user ID. id is required.");
    return null;
  }

  if (!db) {
    console.warn("❌ Firestore is invalid. ❌");
    return null;
  }

  try {
    console.warn("Getting User Data from Firebase 🔄");

    // Fetch the main document data
    const docRef = doc(db, "Users", id, "UserData", "UserLoginData");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn("User Info info not found.");
      return null;
    }
    const customerData = docSnap.data() as UserData;

    return customerData;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
};
