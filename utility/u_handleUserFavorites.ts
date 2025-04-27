import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

import { UserData } from "../interfaces/UserData";

import { ShopList } from "../interfaces/iShop";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { Alert } from "react-native";

/**
 * Fetches the user's favorite services from the Firestore database.
 *
 * Retrieves the user's favorite shops and stores the data in local storage.
 * Returns an empty list if no favorites are found or an error occurs.
 *
 * @returns {Promise<ShopList[]>} A promise that resolves to an array of the user's favorite shops.
 */
export const getUserFavoritesServices = async (): Promise<ShopList[]> => {
  try {
    const savedUserData = (await UserStorageService.getUserData()) as UserData;
    if (!savedUserData) {
      Alert.alert("Error", "User data not found. Please log in again.");
      return [];
    }
    const userDocRef = doc(db, "Users", savedUserData.userId, "UserData", "UserFavoritesShops");
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const favoritesData = userDocSnap.data();
      const shopList: ShopList[] = Object.keys(favoritesData).map((key) => ({
        id: key,
        ...favoritesData[key],
      }));
      // Store the fetched data in local storage
      await UserStorageService.saveUserFavorites(shopList);
      return shopList;
    } else {
      console.log("No userFavoritesShops document found.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }
};

export const updateUserFavoritesServices = async (updatedData: ShopList[]): Promise<boolean> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 1-second timeout
    console.log("Simulated update of user favorites", updatedData.length);
    // return true; // Simulate success
    const savedUserData = (await UserStorageService.getUserData()) as UserData;
    if (!savedUserData) {
      Alert.alert("Error", "User data not found. Please log in again.");
      return false;
    }

    const userDocRef = doc(db, "Users", savedUserData.userId, "UserData", "UserFavoritesShops");

    // Overwrite the entire document with the new data
    await setDoc(userDocRef, updatedData);

    // Update the local storage with the new favorites
    await UserStorageService.saveUserFavorites(updatedData);

    console.log(`Successfully updated user favorites for user ID: ${savedUserData.userId}`);
    return true;
  } catch (error) {
    console.error("Error updating user favorites:", error);
    return false;
  }
};

/**
 * Adds a shop to the user's list of favorite shops.
 *
 * @param {ShopList} shop - The shop to be added to the favorites.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the operation is successful, otherwise `false`.
 */
export const addShopToFavorites = async (shop: ShopList): Promise<boolean> => {
  try {
    // Fetch the current favorites from local storage
    const currentFavorites = (await UserStorageService.getUserFavorites()) || [];

    // Check if the shop already exists in the favorites
    const isShopAlreadyFavorite = currentFavorites.some((favorite) => favorite.id === shop.id);
    if (isShopAlreadyFavorite) {
      Alert.alert("Info", "This shop is already in your favorites.");
      return true; // Return true since the shop is already in favorites
    }

    // Add the new shop to the favorites array
    const updatedFavorites = [...currentFavorites, shop];

    // Update the local storage and Firestore
    const updateSuccess = await updateUserFavoritesServices(updatedFavorites);
    if (updateSuccess) {
      return true; // Successfully added to favorites
    } else {
      Alert.alert("Error", "Failed to update favorites. Please try again later.");
      return false; // Failed to update favorites
    }
  } catch (error) {
    console.error("Error adding shop to favorites:", error);
    Alert.alert("Error", "An error occurred while adding the shop to favorites.");
    return false; // Return false in case of an error
  }
};

/**
 * Checks if a given shop exists in the user's local favorites.
 *
 * @param {ShopList} shop - The shop to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the shop exists, otherwise `false`.
 */
export const isShopInFavorites = async (shop: ShopList): Promise<boolean> => {
  try {
    // Fetch the current favorites from local storage
    const currentFavorites = (await UserStorageService.getUserFavorites()) || [];

    // Check if the shop exists in the favorites
    return currentFavorites.some((favorite) => favorite.id === shop.id);
  } catch (error) {
    console.error("Error checking if shop is in favorites:", error);
    return false; // Return false in case of an error
  }
};
