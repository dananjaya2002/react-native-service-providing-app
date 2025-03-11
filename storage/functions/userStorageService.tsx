// userStorageService.tsx
import { StorageService } from "../asyncStorage";

export interface UserData {
  favorites?: string[];
  isServiceProvider: boolean;
  password: string;
  userName: string;
}

// Storage keys as constants to avoid typos
// !!! DO NOT CHANGE THESE VALUES IF ALREADY BEING USED !!!
export const STORAGE_KEYS = {
  USER_DATA: "user_data",
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
   * USER_SETTINGS Section
   *
   */

  // Add more user-specific storage methods as needed
}
