import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { ShopList } from "../interfaces/iShop";
import { UserData } from "@/interfaces/UserData";

/**
 * Retrieves the Shop List Data for a given Shop ID.
 *
 * @param id - The ID of the Shop.
 * @returns A promise resolving to UserData or null if not found/invalid.
 */
export const getShopListData = async (id: string): Promise<UserData | null> => {
  if (!id) {
    console.error("❌ Error: Invalid shop ID. id is required.");
    return null;
  }
  try {
    console.log(id, "Getting Shop List Data from Firebase 🔄");
    // Fetch the document data
    const shopListQuery = query(collection(db, "ShopList"), where("userDocId", "==", id));
    const querySnapshot = await getDocs(shopListQuery);
    if (querySnapshot.empty) {
      console.warn("Shop list data not found.");
      return null;
    }
    // Assuming there's only one document with the matching userDocId
    const docSnap = querySnapshot.docs[0];
    const shopListData = docSnap.data() as ShopList;

    // Map ShopPageData to UserData
    const userData: UserData = {
      userId: id,
      isServiceProvider: true,
      userName: shopListData.shopName,
      profileImageUrl: shopListData.shopPageImageUrl,
    };

    return userData;

    return userData;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
};
