import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import SvgUri from "react-native-svg"; // Import for rendering SVGs
import { fetchAndStoreServiceCategories } from "@/utility/u_getSystemInfo";

const Index = () => {
  const router = useRouter(); // Get router instance

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing app...");
        await updateServiceCategories(); // Call the function to update service categories
        setTimeout(() => {
          router.push("/DevSection/DevUI"); // Navigate to the next screen
        }, 1000); // Add a slight delay for better UX
      } catch (error) {
        console.error("Error during initialization: ", error);
      } finally {
        setLoading(true);
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
});

export default Index;
