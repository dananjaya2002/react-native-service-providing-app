import { UserStorageService } from "../storage/functions/userStorageService";

// Function to clear user data for a new user
export async function clearUserData(): Promise<void> {
  try {
    await UserStorageService.clearUserData();
    await UserStorageService.clearUserFavorites();
    // Add more cleanup logic if needed
    console.log("User data cleaned up successfully.");
  } catch (error) {
    console.error("Error cleaning up user data:", error);
  }
}
