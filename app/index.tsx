import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

import { fetchAndStoreServiceCategories, getAndStoreCities } from "@/utility/u_getSystemInfo";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { getUserFavoritesServices } from "@/utility/u_handleUserFavorites";
import { forceFullResync, startRealtimeSync } from "@/db/realtimeSync";

const Index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // forceFullResync(); // Uncomment this line to force a full resync of the database
    const initializeApp = async () => {
      try {
        // Update service categories and city data
        const isServiceUpdated = await updateServiceCategories();
        const isLocationsUpdated = await getAndStoreCities();

        // Start realtime sync for database
        await startRealtimeSync();

        // Validate initialization data
        if (!isServiceUpdated) {
          Alert.alert("Error", "Service Category Data is not updated!");
          setLoading(false);
          return;
        }

        if (!isLocationsUpdated) {
          Alert.alert("Error", "City Data is not updated");
          setLoading(false);
          return;
        }

        // Check if user data exists and navigate accordingly
        const userData = await UserStorageService.getUserData();
        if (userData) {
          await getUserFavoritesServices();
          setTimeout(() => {
            router.push("/(tabs)");
          }, 1000);
        } else {
          setTimeout(() => {
            router.push("/(auth)/login");
            setLoading(false);
          }, 1000);
        }
      } catch (error) {
        setLoading(false);
        Alert.alert(
          "Initialization Error",
          "Failed to initialize the application. Please restart the app."
        );
      }
    };

    initializeApp();
  }, [router]);

  const updateServiceCategories = async (): Promise<boolean> => {
    try {
      const success = await fetchAndStoreServiceCategories();
      return success || false;
    } catch (error) {
      Alert.alert("Error", "Failed to update service categories");
      return false;
    }
  };

  return (
    <View style={styles.loadingContainer}>
      <LottieView
        source={require("../assets/lottie/business-salesman.json")}
        autoPlay
        loop
        style={styles.animation}
      />
      <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
      <Text style={styles.loadingText}>Lanka Service</Text>
    </View>
  );
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
    width: 400,
    height: 400,
  },
});

export default Index;
