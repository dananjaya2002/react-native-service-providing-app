// app/utils/updateShopService.ts
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { uploadImageToCloud } from "./u_uploadImageNew";

import { ShopServices } from "../interfaces/iShop";

/**
 * Updates a shop service item.
 *
 * @param userId - The user's unique id.
 * @param shopServices - The current array of shop services.
 * @param selectedServiceData - The service info to update.
 * @returns A Promise that resolves to true if successful, false otherwise.
 */
export const updateShopService = async (
  userId: string,
  shopServices: ShopServices[],
  selectedServiceData: ShopServices
): Promise<boolean> => {
  try {
    // Check if the service exists in the current shopServices data
    const index = shopServices.findIndex((item) => item.id === selectedServiceData.id);
    if (index === -1) {
      console.error("Service with the provided ID does not exist in shop data.");
      return false;
    }

    const filteredServices = shopServices.filter(
      (service) =>
        service.title.trim() !== "" &&
        service.description.trim() !== "" &&
        service.imageUrl.trim() !== ""
    );
    shopServices = filteredServices;

    // Check if the service image URL is a local file path
    // If so, upload the image to Cloud Storage and get the URL
    let finalImageUrl = selectedServiceData.imageUrl;
    console.log("selectedServiceData.imageUrl", selectedServiceData.imageUrl);
    if (selectedServiceData.imageUrl.startsWith("file://")) {
      const uploadedImageUrl = await uploadImageToCloud(selectedServiceData.imageUrl);
      if (!uploadedImageUrl) {
        console.error("Failed to upload image.");
        return false;
      }
      finalImageUrl = uploadedImageUrl;
    } else {
      console.warn("Image URL is not a local file path. Skipping upload.");
    }
    // Update selectedServiceData with the new image URL
    const updatedService = { ...selectedServiceData, imageUrl: finalImageUrl };

    // Update the shopServices array with the modified service
    const updatedShopServices = [...shopServices];
    updatedShopServices[index] = updatedService;

    // Update the Firebase document at /Users/<userId>/Shop/ShopPageInfo
    const shopPageDocRef = doc(db, "Users", userId, "Shop", "ShopPageInfo");
    await updateDoc(shopPageDocRef, {
      items: updatedShopServices,
    });

    return true;
  } catch (error) {
    console.error("Error updating shop service:", error);
    return false;
  }
};

/**
 * Fetches the shop services from Firestore for the given user.
 *
 * @param userId - The user's unique id.
 * @returns A Promise that resolves to an array of ShopServices.
 */
export const fetchShopServices = async (userId: string): Promise<ShopServices[]> => {
  try {
    // Reference the document at /Users/<userId>/Shop/ShopPageInfo
    const shopPageDocRef = doc(db, "Users", userId, "Shop", "ShopPageInfo");
    const docSnap = await getDoc(shopPageDocRef);
    if (!docSnap.exists()) {
      console.error("Shop page document does not exist.");
      return [];
    }
    const data = docSnap.data();
    if (!data.items || !Array.isArray(data.items)) {
      console.error("Items field is missing or is not an array.");
      return [];
    } // Cast and return the items array as ShopServices[]
    return data.items as ShopServices[];
  } catch (error) {
    console.error("Error fetching shop services:", error);

    return [];
  }
};

/**
 * Adds a new service to the 'items' array in the ShopPageInfo document.
 *
 * @param {string} userId - The user's unique ID.
 * @param {ShopServices} newService - The new service to add.
 * @returns {Promise<ShopServices[]>} - A Promise that resolves to the updated items array, or an empty array on failure.
 */
export const addNewService = async (
  userId: string,
  newService: ShopServices
): Promise<ShopServices[]> => {
  try {
    const shopPageDocRef = doc(db, "Users", userId, "Shop", "ShopPageInfo");

    await updateDoc(shopPageDocRef, {
      items: arrayUnion(newService),
    });

    // Fetch the updated document and return the items array
    const docSnap = await getDoc(shopPageDocRef);
    if (docSnap.exists() && docSnap.data() && Array.isArray(docSnap.data().items)) {
      return docSnap.data().items as ShopServices[];
    } else {
      console.warn("Failed to fetch updated items array.");
      return [];
    }
  } catch (error) {
    console.error("Error adding new service:", error);
    return [];
  }
};

/**
 * Deletes selected services from the 'items' array in the ShopPageInfo document.
 *
 * @param {string} userId - The user's unique ID.
 * @param {ShopServices[]} selectedItems - The array of services to delete.
 * @param {ShopServices[]} shopServiceData - The array of all services.
 * @returns {Promise<boolean>} - A Promise that resolves to true if deletion is successful, false otherwise.
 */
export const deleteSelectedServices = async (
  userId: string,
  selectedItems: ShopServices[],
  shopServiceData: ShopServices[]
): Promise<boolean> => {
  try {
    // Filter out empty items from selectedItems and shopServiceData
    const filteredSelectedItems = selectedItems.filter(
      (service) =>
        service.title.trim() !== "" &&
        service.description.trim() !== "" &&
        service.imageUrl.trim() !== ""
    );

    const filteredShopServiceData = shopServiceData.filter(
      (service) =>
        service.title.trim() !== "" &&
        service.description.trim() !== "" &&
        service.imageUrl.trim() !== ""
    );

    // If there are no items to remove, return true.
    if (filteredSelectedItems.length === 0) {
      return true;
    }

    const shopPageDocRef = doc(db, "Users", userId, "Shop", "ShopPageInfo");

    // Remove selected items from the document
    await updateDoc(shopPageDocRef, {
      items: arrayRemove(...filteredSelectedItems),
    });

    // Update the local shopServiceData array
    const updatedShopServiceData = filteredShopServiceData.filter(
      (service) => !filteredSelectedItems.some((selected) => selected.id === service.id)
    );

    //update the firestore document with the new array.
    await updateDoc(shopPageDocRef, {
      items: updatedShopServiceData,
    });

    return true; // Deletion successful
  } catch (error) {
    console.error("Error deleting selected services:", error);
    return false; // Deletion failed
  }
};
