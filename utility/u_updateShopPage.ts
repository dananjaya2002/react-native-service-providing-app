import { doc, writeBatch } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { Alert } from "react-native";

/**
 * Updates the shop main page.
 *
 * @param userID - The ID of the user.
 * @param title - The updated shop name.
 * @param description - The updated shop description (or service info when doing a partial update).
 * @param phoneNumber - The updated phone number.
 * @param category - The updated shop category.
 * @param shopPageImageUrl - The updated shop image URL.
 * @param serviceInfo - The updated service information.
 * @param shouldDoFullUpdate - Flag to determine whether to update all related documents.
 * @param shopLocation - The updated shop location.
 * @returns A promise resolving to true if the update was successful, or false otherwise.
 */
export const updateShopMainPage = async (
  userID: string,
  title: string,
  description: string,
  phoneNumber: string,
  category: string,
  shopPageImageUrl: string,
  serviceInfo: string,
  shouldDoFullUpdate: boolean,
  shopLocation: string
): Promise<boolean> => {
  try {
    if (
      !userID ||
      !title ||
      !description ||
      !phoneNumber ||
      !category ||
      !serviceInfo ||
      !shopLocation
    ) {
      console.error(
        "❌ Error: userID, title, description, phoneNumber, category, serviceInfo, and shopLocation are required."
      );
      Alert.alert(
        "Error",
        "userID, title, description, phoneNumber, category, serviceInfo, and shopLocation are required."
      );
      return false;
    }

    const batch = writeBatch(db);

    // Reference to the shop page document
    const userShopDocRef = doc(db, `Users/${userID}/Shop`, "ShopPageInfo");

    if (!shouldDoFullUpdate) {
      // Partial update: update only phoneNumber, serviceInfo, and shopCategory.
      batch.update(userShopDocRef, {
        phoneNumber: phoneNumber,
        serviceInfo: serviceInfo,
      });
    } else {
      // Full update: update multiple documents.
      // 1. Update the Main Shop Page document.
      batch.update(userShopDocRef, {
        shopName: title,
        shopDescription: description,
        phoneNumber: phoneNumber,
        shopCategory: category,
        shopPageImageUrl: shopPageImageUrl,
        serviceInfo: serviceInfo,
        shopLocation: shopLocation,
      });

      // 2. Update the document in the ShopList collection.
      const shopListDocRef = doc(db, "ShopList", userID);
      batch.update(shopListDocRef, {
        shopName: title,
        shopDescription: description,
        shopPageImageUrl: shopPageImageUrl,
        shopCategory: category,
        shopLocation: shopLocation,
      });

      // 3. Update the document in the System/SearchList/ShopListCollection.
      const searchListDocRef = doc(db, "System/SearchList/ShopListCollection", userID);
      batch.update(searchListDocRef, {
        shopTitle: title,
      });
    }

    // Commit the batch operation.
    await batch.commit();
    console.log("✅ Shop main page updated successfully.");
    return true;
  } catch (error) {
    console.error("❌ Error updating shop main page: ", error);
    Alert.alert("Error", "Failed to update shop page. Please try again.");
    return false;
  }
};
