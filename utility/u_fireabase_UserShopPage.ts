import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { ShopPageData, UserComment } from "../interfaces/iShop";
import { ShopDataForCharRoomCreating } from "../interfaces/iChat";
import { UserData } from "../interfaces/UserData";
import { ShopServices } from "../interfaces/iShop";

/**
 * Retrieves the Shop Page Data for a given user.
 * @param userId  The ID of the user.
 * @returns A promise resolving to ShopPageData or null if not found/invalid.
 */
export const getShopPageData = async (userId: string): Promise<ShopPageData | null> => {
  if (!userId) {
    console.error("❌ Error: Invalid user ID. userId is required.");
    return null;
  }

  if (!db) {
    console.warn("❌ Firestore is invalid. ❌");
    return null;
  }

  try {
    console.warn("Getting Shop Page Data from Firebase 🔄");

    // Fetch the main document data
    const docRef = doc(db, "Users", userId, "Shop", "ShopPageInfo");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn("Shop page info not found.");
      return null;
    }
    const shopData = docSnap.data() as ShopPageData;

    return shopData;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
};

/**
 * Updates the 'items' field in the ShopPageInfo document for a given user.
 *
 * @param userId - The ID of the user.
 * @param items - An array of ShopServices objects to update the items field.
 * @returns A promise that resolves to true if the update is successful, otherwise false.
 */
export const updateShopItems = async (userId: string, items: ShopServices[]): Promise<boolean> => {
  if (!userId) {
    console.error("❌ Error: Invalid user ID. userId is required.");
    return false;
  }

  if (!db) {
    console.warn("❌ Firestore is invalid. ❌");
    return false;
  }

  try {
    console.warn("Updating items in Firebase 🔄");
    const shopDocRef = doc(db, "Users", userId, "Shop", "ShopPageInfo");
    await updateDoc(shopDocRef, { items });
    return true;
  } catch (error) {
    console.error("Error updating items: ", error);
    return false;
  }
};
