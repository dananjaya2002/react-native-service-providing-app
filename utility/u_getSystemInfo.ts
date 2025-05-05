import { doc, getDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { ShopCategory } from "../interfaces/iShop";
import { SystemDataStorage } from "../storage/functions/systemDataStorage";
import { Alert } from "react-native";

/**
 * Retrieves the Service Categories from Firebase.
 *
 * @returns A promise resolving to an array of ShopCategory or an empty array if no data is found.
 */
export const getServiceCategories = async (): Promise<ShopCategory[]> => {
  try {
    console.log("Fetching Service Categories from Firebase 🔄");

    // Reference to the document in Firestore
    const docRef = doc(db, "System", "ServiceCategories");
    const docSnap = await getDoc(docRef);

    // Check if the document exists
    if (!docSnap.exists()) {
      console.warn("No Service Categories found.");
      return [];
    }

    // Transform the fetched data into an array of ShopCategory
    const rawData = docSnap.data();
    const serviceCategories = Object.values(rawData).map((category: any) => ({
      categoryID: category.categoryID,
      categoryName: category.categoryName,
      iconName: category.iconName,
    })) as ShopCategory[];

    return serviceCategories;
  } catch (error) {
    console.error("Error fetching Service Categories: ", error);
    return [];
  }
};

/**
 * Fetches Service Categories from Firebase and stores them in AsyncStorage.
 *
 * @returns A promise resolving to true if data is successfully stored, false otherwise.
 */
export const fetchAndStoreServiceCategories = async (): Promise<boolean> => {
  try {
    console.log("Fetching and storing Service Categories 🔄");

    // Fetch the service categories
    const serviceCategories = await getServiceCategories();

    // Store the categories if data is retrieved
    if (serviceCategories.length > 0) {
      await SystemDataStorage.saveServiceCategories(serviceCategories);
      console.log("Service Categories successfully stored ✅", serviceCategories);
      return true;
    } else {
      console.warn("No Service Categories to store.");
      return false;
    }
  } catch (error) {
    console.error("Error fetching and storing Service Categories: ", error);
    return false;
  }
};

/**
 * Fetches Cities from Firebase and stores them in AsyncStorage.
 *
 * @returns A promise resolving to true if data is successfully stored, false otherwise.
 */
export const getAndStoreCities = async (): Promise<boolean> => {
  try {
    console.log("Fetching Cities from Firebase 🔄");

    // Reference to the document in Firestore
    const docRef = doc(db, "System", "locations");
    const docSnap = await getDoc(docRef);

    // Check if the document exists
    if (!docSnap.exists()) {
      console.warn("No Cities found.");
      return false;
    }

    // Extract the cities array from the raw data
    const rawData = docSnap.data();

    // Ensure the cities key exists and is an array
    const citiesArray = rawData.cities;
    if (!Array.isArray(citiesArray)) {
      console.warn("Invalid Cities data format.");
      return false;
    }

    // Transform the cities array into the Cities[] type
    const cities = citiesArray.map((city: any) => ({
      label: city.label,
      value: city.value,
    })) as Cities[];

    // Store the cities if data is retrieved
    if (cities.length > 0) {
      await SystemDataStorage.saveCities(cities);
      console.log("Cities successfully stored ✅", cities);
      return true;
    } else {
      console.warn("No Cities to store.");
      return false;
    }
  } catch (error) {
    console.error("Error fetching and storing Cities: ", error);
    Alert.alert("Error", "Failed to fetch cities. Please try again later.");
    return false;
  }
};
