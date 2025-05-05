import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { auth } from "../FirebaseConfig"; // Import Firebase auth instance
import { onAuthStateChanged } from "firebase/auth"; // Import auth state listener
import { useRouter } from "expo-router";
// import CustomLoader from "@/components/unUsed/2/loadingIndicator";
import { db } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../global.css"; // Import global styles
import { UserStorageService } from "../storage/functions/userStorageService";
import { UserData } from "../interfaces/UserData";

const Check = () => {
  const router = useRouter(); // Get router instance

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user data from Firestore using the authenticated user's ID
          const docRef = doc(db, "Users", currentUser.uid, "UserData", "UserLoginData");
          const snapshot = await getDoc(docRef);

          if (snapshot.exists()) {
            const data = snapshot.data() as UserData;
            setUserData(data);

            // Optionally save the user data locally
            await UserStorageService.saveUserData(data);
          } else {
            setError("User data not found.");
          }
        } catch (err: any) {
          console.error("Error fetching user data: ", err);
          setError("Error fetching user data.");
        } finally {
          setLoading(false);
        }
      } else {
        // Redirect to login if no user is authenticated
        router.push("/(auth)/login");
      }
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Show loading screen while fetching user data
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3498db" />
        <Text>CustomLoader replacement.</Text>
      </View>
    );
  }

  if (error) {
    // Show error message if there's an issue
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  const onItemPress = async () => {
    if (userData) {
      Alert.alert("User Data", JSON.stringify(userData, null, 2));
    }
  };

  return (
    <View className="flex-1 bg-gray-400 justify-center items-center">
      {userData ? (
        <TouchableOpacity
          className="px-20 py-3 rounded-lg justify-center items-center m-4"
          style={{ backgroundColor: "#3498db" }}
          onPress={onItemPress}
        >
          <Text className="text-white font-bold text-lg">{userData.userName}</Text>
          <Text className="text-white font-bold text-sm">ID: {userData.userId}</Text>
        </TouchableOpacity>
      ) : (
        <Text>No user data available.</Text>
      )}
    </View>
  );
};

export default Check;
