import { StorageService } from "../asyncStorage";

// Define your user data type
export interface UserData {
  id: number;
  name: string;
  email: string;
  // Add any other user properties
}

// Storage keys as constants to avoid typos
export const STORAGE_KEYS = {
  USER_DATA: "user_data",
  USER_SETTINGS: "user_settings",
  // Add more keys as needed
};

export class UserStorageService {
  /**
   * Save user data to storage
   */
  static async saveUserData(userData: UserData): Promise<void> {
    await StorageService.storeObject<UserData>(STORAGE_KEYS.USER_DATA, userData);
  }

  /**
   * Get user data from storage
   */
  static async getUserData(): Promise<UserData | null> {
    return await StorageService.getObject<UserData>(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Clear user data from storage
   */
  static async clearUserData(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Add more user-specific storage methods as needed
}
