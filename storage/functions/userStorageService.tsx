// userStorageService.tsx
import { StorageService } from "../asyncStorage";
import { UserData } from "../../interfaces/UserData";
import { ShopList } from "@/interfaces/iShop";

// export interface UserData {
//   favorites?: string[];
//   isServiceProvider: boolean;
//   password: string;
//   userName: string;
// }

// Storage keys as constants to avoid typos
// !!! DO NOT CHANGE THESE VALUES IF ALREADY BEING USED !!!
export const STORAGE_KEYS = {
  USER_DATA: "user_data",
  USER_FAVORITES: "user_favorites",
  USER_SETTINGS: "user_settings", // not implemented yet
  // Add more keys as needed
};

export class UserStorageService {
  /**
   *
   * USER_DATA Section
   *
   */
  //Save user data to storage
  static async saveUserData(userData: UserData): Promise<void> {
    await StorageService.storeObject<UserData>(STORAGE_KEYS.USER_DATA, userData);
  }

  //Get user data from storage
  static async getUserData(): Promise<UserData | null> {
    return await StorageService.getObject<UserData>(STORAGE_KEYS.USER_DATA);
  }

  //Clear user data from storage
  static async clearUserData(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.USER_DATA);
  }
  /**
   *
   * USER_FAVORITES Section
   *
   */
  // Save user favorites to storage
  static async saveUserFavorites(favorites: ShopList[]): Promise<void> {
    await StorageService.storeObject<ShopList[]>(STORAGE_KEYS.USER_FAVORITES, favorites);
  }

  // Get user favorites from storage
  static async getUserFavorites(): Promise<ShopList[] | null> {
    return await StorageService.getObject<ShopList[]>(STORAGE_KEYS.USER_FAVORITES);
  }

  // Clear user favorites from storage
  static async clearUserFavorites(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.USER_FAVORITES);
  }
  /**
   *
   * USER_SELECTED_SHOP Section
   *
   */
  // //Save user data to storage
  // static async saveSelectedShopData(userData: UserData): Promise<void> {
  //   await StorageService.storeObject<UserData>(STORAGE_KEYS.USER_DATA, userData);
  // }

  // //Get user data from storage
  // static async getSelectedShopData(): Promise<UserData | null> {
  //   return await StorageService.getObject<UserData>(STORAGE_KEYS.USER_DATA);
  // }

  // //Clear user data from storage
  // static async clearSelectedShopData(): Promise<void> {
  //   await StorageService.removeItem(STORAGE_KEYS.USER_DATA);
  // }

  /**
   *
   * USER_SETTINGS Section
   *
   */

  // Add more user-specific storage methods as needed
}
