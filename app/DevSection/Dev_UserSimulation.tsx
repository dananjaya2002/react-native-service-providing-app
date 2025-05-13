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
  "7OFWCDUdU8hxGHXjSFcmUFMUJWA2",
  "nOBPhGvTjVYtssv0qQqIsh4TefN2",
  "CftyRElb1JVxv13kHfbiVI3nCs22",
  "YPgshfs9YaZbnPSrr2eHcAzFvk03",
  "8IdNtylQxsNTZX64x8Yj8nfnZSG2",
  "coGCeQZJg1VR3tSEp4PfMUNglTl1",
  "4PzYYTbgQ6WTrXYkHkNQm2Tf6Ul1",
  "MKtxSyhPt5cMzxtfUPhRZ4RPM3I2",
  "aJA6eWEHb6R6ixC5ewky2yEMQaz1",
  "D16ZnkrnqunSDhbuZEvd",
];

//D16ZnkrnqunSDhbuZEvd
//UPj9MG3Wd9XNHIgWqdQjTQXphpJ2

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
    await clearUserData(); // Clear any existing user data before saving new data
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
    <View style={styles.container}>
      <Text style={styles.titleText}>Development Area For Select a User Quickly</Text>
      <Text style={styles.subtitleText}>All these users are actual users from the database.</Text>
      {docsData.map((doc) => {
        const currentColor = colors[colorIndex % colors.length]; // Cycle through colors
        colorIndex++;
        return (
          <TouchableOpacity
            key={doc.userName}
            style={[styles.userButton, { backgroundColor: currentColor }]}
            onPress={() => onItemPress(doc)}
          >
            <Text style={styles.userName}>{doc.userName}</Text>
            <Text style={styles.userId}>ID: {doc.userId}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: "500",
    color: "black",
    marginBottom: 16,
  },
  userButton: {
    paddingHorizontal: 80,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
  },
  userName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  userId: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default Dev_UserSimulation;
