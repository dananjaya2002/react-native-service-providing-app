import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

import { UserData } from "../interfaces/UserData";

import { ShopList } from "../interfaces/iShop";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { Alert } from "react-native";

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
    const savedUserData = (await UserStorageService.getUserData()) as UserData;
    if (!savedUserData) {
      Alert.alert("Error", "User data not found. Please log in again.");
      return false;
    }

    const userDocRef = doc(db, "Users", savedUserData.userId, "UserData", "UserFavoritesShops");

    // Overwrite the entire document with the new data
    await setDoc(userDocRef, updatedData);
    console.log(`Successfully updated user favorites for user ID: ${savedUserData.userId}`);
    return true;
  } catch (error) {
    console.error("Error updating user favorites:", error);
    return false;
  }
};
