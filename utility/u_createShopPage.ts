import { doc, collection, writeBatch } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { ShopPageData, ShopList } from "../interfaces/iShop";
import { Alert } from "react-native";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { UserData } from "@/interfaces/UserData";

/**
 * Creates a shop page and updates relevant collections in Firebase using a batch operation.
 *
 * @param {string} userID - The ID of the user.
 * @param {ShopPageData} shopData - The shop data of type `ShopPageData`.
 * @returns {Promise<boolean>} A promise resolving to `true` if successful, `false` otherwise.
 */
export const createShopPage = async (userID: string, shopData: ShopPageData): Promise<boolean> => {
  try {
    if (!userID || !shopData) {
      console.error("❌ Error: Invalid input. userID and shopData are required.");
      Alert.alert("Error", "Invalid input. userID and shopData are required.");
      return false;
    }

    // Getting Local stored user data.
    const localUserData = await UserStorageService.getUserData();
    if (!localUserData) {
      console.error("❌ Error: User data is null.");
      Alert.alert("Error: Cannot find user Data from the local storage.");
      return false;
    }

    // Initialize a batch
    const batch = writeBatch(db);

    // Create a subcollection "Shop" under /Users/<userID> and add "ShopPageInfo"
    const userShopDocRef = doc(collection(db, `Users/${userID}/Shop`), "ShopPageInfo");
    batch.set(userShopDocRef, shopData);

    // Update the /Users/<userID>/UserData/UserLoginData document to set "isServiceProvider" to true
    const userLoginDataDocRef = doc(db, `Users/${userID}/UserData/UserLoginData`);
    batch.update(userLoginDataDocRef, { isServiceProvider: true });

    // Create a document in /ShopList/ collection with userID
    const shopListData: ShopList = {
      id: userID,
      rating: shopData.avgRating,
      shopName: shopData.shopName,
      shopDescription: shopData.shopDescription,
      shopPageImageUrl: shopData.shopPageImageUrl,
      totalRatingsCount: shopData.dashboardInfo.totalRatings,
      shopCategory: shopData.shopCategory,
      shopLocation: shopData.shopLocation,
      shopPageRef: `Users/${userID}/Shop/ShopPageInfo`,
      userDocId: userID,
      avgRating: shopData.avgRating,
    };
    const shopListDocRef = doc(db, "ShopList", userID);
    batch.set(shopListDocRef, shopListData);

    // Create a document in /System/SearchList/ShopListCollection with userID
    const searchListData = {
      shopId: userID,
      shopTitle: shopData.shopName,
    };
    const searchListDocRef = doc(db, "System/SearchList/ShopListCollection", userID);
    batch.set(searchListDocRef, searchListData);

    // Commit the batch
    await batch.commit();

    // Create an object with updated local user data
    const updatedLocalUserData: UserData = {
      ...localUserData,
      isServiceProvider: true,
    };

    // Update the local storage with the updated user data
    await UserStorageService.saveUserData(updatedLocalUserData);

    console.log("✅ Shop page created successfully using batch.");
    return true;
  } catch (error) {
    console.error("❌ Error creating shop page: ", error);
    return false;
  }
};
