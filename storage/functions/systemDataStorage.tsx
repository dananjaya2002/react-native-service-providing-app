import { StorageService } from "../asyncStorage";
import { ShopCategory } from "../../interfaces/iShop";

// Storage keys as constants to avoid typos
// !!! DO NOT CHANGE THESE VALUES IF ALREADY BEING USED !!!
export const STORAGE_KEYS = {
  SERVICE_CATEGORIES: "service_categories",
  CITIES: "cities",
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
   * CITIES Section
   *
   */
  // Save Cities data to storage
  static async saveCities(cities: Cities[]): Promise<void> {
    await StorageService.storeObject<Cities[]>(STORAGE_KEYS.CITIES, cities);
  }

  // Get Cities data from storage
  static async getCities(): Promise<Cities[] | null> {
    return await StorageService.getObject<Cities[]>(STORAGE_KEYS.CITIES);
  }

  // Clear Locations data from storage
  static async clearCities(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.CITIES);
  }

  /**
   *
   * Add more system-specific storage methods as needed
   *
   */
}
