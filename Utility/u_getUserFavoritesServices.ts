import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import fs from "fs"; // Import the 'fs' module

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
