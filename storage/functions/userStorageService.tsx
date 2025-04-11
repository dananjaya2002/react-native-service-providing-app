import { StorageService } from "../asyncStorage";
import { UserData } from "../../interfaces/UserData";

// Storage keys as constants to avoid typos
// !!! DO NOT CHANGE THESE VALUES IF ALREADY BEING USED !!!
export const STORAGE_KEYS = {
  USER_DATA: "user_data",
  USER_SETTINGS: "user_settings", // not implemented yet
  // Add more keys as needed
};

export class UserStorageService {
  /**
   * Save user data to storage
   * @param userData - The user data object to save
   */
  static async saveUserData(userData: UserData): Promise<void> {
    try {
      await StorageService.storeObject<UserData>(STORAGE_KEYS.USER_DATA, userData);
    } catch (error) {
      console.error("Error saving user data to storage:", error);
      throw new Error("Failed to save user data.");
    }
  }

  /**
   * Get user data from storage
   * @returns The user data object or null if not found
   */
  static async getUserData(): Promise<UserData | null> {
    try {
      return await StorageService.getObject<UserData>(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error("Error retrieving user data from storage:", error);
      throw new Error("Failed to retrieve user data.");
    }
  }

  /**
   * Clear user data from storage
   */
  static async clearUserData(): Promise<void> {
    try {
      await StorageService.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error("Error clearing user data from storage:", error);
      throw new Error("Failed to clear user data.");
    }
  }
}