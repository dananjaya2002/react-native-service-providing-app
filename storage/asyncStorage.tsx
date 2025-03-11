// asyncStorage.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define type for storage data
export interface StorageItem<T> {
  key: string;
  data: T;
}

export class StorageService {
  /**
   * Store an object in AsyncStorage
   * @param key The storage key
   * @param data The data to store
   */
  static async storeObject<T>(key: string, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error storing data:", error);
      throw error;
    }
  }

  /**
   * Retrieve an object from AsyncStorage
   * @param key The storage key
   * @returns The stored data or null if not found
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error retrieving data:", error);
      throw error;
    }
  }

  /**
   * Remove a specific item from storage
   * @param key The storage key to remove
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
      throw error;
    }
  }

  /**
   * Get all keys stored in AsyncStorage
   * @returns Array of storage keys
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error("Error getting all keys:", error);
      throw error;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}
