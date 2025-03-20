// userStorageService.tsx
import { StorageService } from "../asyncStorage";

// TypeScript interfaces
import { ShopPageData, UserComment, ShopServices } from "../../interfaces/iShop";

// Storage keys as constants to avoid typos
// !!! DO NOT CHANGE THESE VALUES IF ALREADY BEING USED !!!
export const STORAGE_KEYS = {
  OWNER_SHOP_PAGE: "ownerShopPage_data",
  // Add more keys as needed
};

export class OwnerShopPageAsyncStorage {
  /**
   *
   * OWNER_SHOP_PAGE Section
   *
   */
  //Save ShopPage data to storage
  static async saveUserData(userData: ShopPageData): Promise<void> {
    await StorageService.storeObject<ShopPageData>(STORAGE_KEYS.OWNER_SHOP_PAGE, userData);
  }

  //Get ShopPage data from storage
  static async getUserData(): Promise<ShopPageData | null> {
    return await StorageService.getObject<ShopPageData>(STORAGE_KEYS.OWNER_SHOP_PAGE);
  }

  //Clear ShopPage data from storage
  static async clearUserData(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.OWNER_SHOP_PAGE);
  }

  /**
   *
   * USER_SETTINGS Section
   *
   */

  // Add more user-specific storage methods as needed
}
