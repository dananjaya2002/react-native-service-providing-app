import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router, useRouter } from "expo-router";
import { db } from "../../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { UserStorageService } from "../../storage/functions/userStorageService";
import { UserData } from "../../interfaces/UserData";
import { fetchAndStoreServiceCategories } from "@/utility/u_getSystemInfo";
import { clearUserData } from "@/utility/u_cleanUpForNewUser";
import { getUserFavoritesServices } from "@/utility/u_handleUserFavorites";

const docIds: string[] = [
  "3pb3ivjRuAQmMjaSK15v",
  "D16ZnkrnqunSDhbuZEvd",
  "EcF2dYNoKXXSZcOyrhmK",
  "KK58uPO3PKmAEuGZZxtY",
];

const Dev_UserSimulation = () => {
  const [docsData, setDocsData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // const timer = setTimeout(() => {
    //   router.push("/(tabs)");
    // }, 50);
    // return () => clearTimeout(timer);

    updateServiceCategories(); // update service categories

    const fetchDocuments = async () => {
      try {
        // Fetch all documents concurrently
        const fetchPromises = docIds.map((userId) => {
          const docRef = doc(db, "Users", userId, "UserData", "UserLoginData");
          return getDoc(docRef);
        });

        const snapshots = await Promise.all(fetchPromises);

        // Process the fetched snapshots and filter out any missing docs
        const data = snapshots
          .map((snapshot, index) => {
            if (snapshot.exists()) {
              return { userId: docIds[index], ...snapshot.data() } as UserData;
            }
            return null;
          })
          .filter((doc): doc is UserData => doc !== null);

        setDocsData(data);
      } catch (err: any) {
        console.error("Error fetching documents: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

  function transformUserData(rawData: UserData): UserData {
    return {
      userId: rawData.userId,
      isServiceProvider: rawData.isServiceProvider,
      userName: rawData.userName,
      profileImageUrl: rawData.profileImageUrl,
    };
  }

  const onItemPress = async (doc: UserData) => {
    clearUserData(); // Clear any existing user data before saving new data
    // Transform the data before saving it.
    const formattedDoc = transformUserData(doc);
    await UserStorageService.saveUserData(formattedDoc);
    await getUserFavoritesServices();
    console.log("Saved User Data: ", formattedDoc);
    router.push("/(tabs)");
  };

  const colors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12"]; // Array of your 4 colors
  let colorIndex = 0;

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center">
      <Text className="text-2xl font-bold text-black mb-4">
        Development Area For Select a User Quickly
      </Text>
      <Text className="text-lg font-medium text-black mb-4">
        All these users are actual users from the database.
      </Text>
      {docsData.map((doc) => {
        const currentColor = colors[colorIndex % colors.length]; // Cycle through colors
        colorIndex++;
        return (
          <TouchableOpacity
            key={doc.userName}
            className="px-20 py-3 rounded-lg justify-center items-center m-4"
            style={{ backgroundColor: currentColor }}
            onPress={() => onItemPress(doc)}
          >
            <Text className="text-white font-bold text-lg">{doc.userName}</Text>
            <Text className="text-white font-bold text-sm">ID: {doc.userId}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Dev_UserSimulation;

const styles = StyleSheet.create({});
