import { StorageService } from "../asyncStorage";
import { ShopCategory } from "../../interfaces/iShop";

// Storage keys as constants to avoid typos
// !!! DO NOT CHANGE THESE VALUES IF ALREADY BEING USED !!!
export const STORAGE_KEYS = {
  SERVICE_CATEGORIES: "service_categories",
  // Add more keys as needed
};

export class SystemDataStorage {
  /**
   *
   * SERVICE_CATEGORIES Section
   *
   */
  // Save Service Categories data to storage
  static async saveServiceCategories(categories: ShopCategory[]): Promise<void> {
    await StorageService.storeObject<ShopCategory[]>(STORAGE_KEYS.SERVICE_CATEGORIES, categories);
  }

  // Get Service Categories data from storage
  static async getServiceCategories(): Promise<ShopCategory[] | null> {
    return await StorageService.getObject<ShopCategory[]>(STORAGE_KEYS.SERVICE_CATEGORIES);
  }

  // Clear Service Categories data from storage
  static async clearServiceCategories(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.SERVICE_CATEGORIES);
  }

  /**
   *
   * Add more system-specific storage methods as needed
   *
   */
}
