import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { fetchAndStoreServiceCategories, getAndStoreCities } from "@/utility/u_getSystemInfo";
import { Svg, Path, Rect, Circle, Polygon } from "react-native-svg"; // Import components for SVG rendering
import { UserStorageService } from "@/storage/functions/userStorageService";
import { getUserFavoritesServices } from "@/utility/u_handleUserFavorites";
import LottieView from "lottie-react-native";

const Index = () => {
  const router = useRouter(); // Get router instance

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // setTimeout(() => {
    //   router.push("/DevSection/DevUI");
    // }, 1000);
    // return;

    const initializeApp = async () => {
      try {
        console.log("Initializing app...");
        const isServiceUpdated = await updateServiceCategories(); // Call the function to update service categories
        const isLocationsUpdated = await getAndStoreCities(); // Call the function to get and store cities

        if (isServiceUpdated!) {
          Alert.alert("Error", "Service Data is not updated!");
          return;
        }
        if (!isLocationsUpdated) {
          Alert.alert("Error", "ShopLocation Data is not updated");
          return;
        }
        // Check if user data exists
        const userData = await UserStorageService.getUserData();
        if (userData) {
          await getUserFavoritesServices(); // Store User Favorites in local storage
          setTimeout(() => {
            console.log("User data found:", userData);
            router.push("/(tabs)"); // Navigate to the home page if user data exists
          }, 1000); // Add a slight delay for better UX
        } else {
          setTimeout(() => {
            console.log("No user data found. Redirecting to login...");
            router.push("/(auth)/login"); // Navigate to the login page if no user data
          }, 1000); // Add a slight delay for better UX
        }
      } catch (error) {
        setLoading(false);
        console.error("Error during initialization: ", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const updateServiceCategories = async () => {
    try {
      console.log("Updating Service Categories...");
      const success = await fetchAndStoreServiceCategories();
      if (success) {
        console.log("Service Categories updated successfully ✅");
      } else {
        console.warn("No Service Categories to update.");
      }
    } catch (error) {
      console.error("Error updating Service Categories: ", error);
    }
  };

  if (loading) {
    // Show loading screen while initializing
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../assets/lottie/business-salesman.json")} // Path to your animation file
          autoPlay
          loop
          style={styles.animation}
        />
        {/* Activity Indicator */}
        <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
        {/* Loading Text */}
        <Text style={styles.loadingText}>Lanka Service</Text>
      </View>
    );
  }

  return <View className="flex-1 bg-gray-400 justify-center items-center"></View>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  activityIndicator: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  animation: {
    width: 400, // Adjust the width as needed
    height: 400, // Adjust the height as needed
  },
});

export default Index;
