import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { auth } from "../FirebaseConfig"; // Make sure to import your auth instance
import { onAuthStateChanged } from "firebase/auth"; // Import this to track authentication state
import { router, useRouter } from "expo-router";
import CustomLoader from "@/components/loadingIndicator";

import { db } from "../FirebaseConfig";

import "../global.css"; // Import global CSS file (NativeWind)
import { doc, DocumentData, getDoc } from "firebase/firestore";

import { UserStorageService } from "../storage/functions/userStorageService";

import { UserData } from "../interfaces/UserData";

// export default function Index() {
//   const [loading, setLoading] = useState(true); // To show loading screen while checking authentication
//   const [user, setUser] = useState<any>(null); // To store the user info

//   useEffect(() => {
//     // Check authentication state
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser); // User is signed in
//         router.push("/(tabs)"); // Redirect to the main app (tabs)
//       } else {
//         setUser(null); // No user is signed in
//         router.push("/(auth)/login"); // Redirect to sign-in page
//       }
//       setLoading(false); // Stop the loading screen once checked
//     });

//     // Clean up the subscription on unmount
//     return () => unsubscribe();
//   }, []);

//   if (loading) {
//     // Show loading screen while checking auth state
//     return <CustomLoader />;
//   }

//   // Render null or any other UI if user is signed in
//   return null;
// }

const docIds: string[] = ["9682ySNqk0txuAGq75JI", "Idgkdk2tkKPEplx46z3h"];
const collectionName = "Users";

const Index = () => {
  const router = useRouter(); // Get router instance

  const [docsData, setDocsData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // const timer = setTimeout(() => {
    //   //router.push("/(tabs)");
    //   router.push("/serviceProvider/sp_ShopEdit");
    //   //router.push("/(tabs)/shop");

    //   const shopId = "123";
    //   //router.push(`../customer/${shopId}`);
    // }, 50);
    // return () => clearTimeout(timer);

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
        setError("Error fetching documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  console.log("\n\ndocsData: ", docsData);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     //router.push("/(tabs)");
  //     router.push("/(tabs)");

  //     const shopId = "123";
  //     //router.push(`../customer/${shopId}`);
  //   }, 50);
  //   return () => clearTimeout(timer); // Cleanup the timer if the component unmounts before the timeout completes
  // }, []); // Empty array ensures this runs once

  const onItemPress = async (doc: UserData) => {
    await UserStorageService.saveUserData(doc);
    router.push("/(tabs)/chat/shopChat");
    //router.push("/(tabs)/chat/personalChat");

    //displayData();
  };

  const displayData = async () => {
    const savedUserData = await UserStorageService.getUserData();
    Alert.alert("Saved User Data", JSON.stringify(savedUserData, null, 2));
  };

  return (
    <View className="flex-1 bg-gray-400 justify-center items-center">
      {docsData.map((doc) => (
        <TouchableOpacity
          key={doc.userName}
          className="bg-blue-500 px-20 py-3 rounded-lg justify-center items-center m-4"
          onPress={() => onItemPress(doc)}
        >
          <Text className="text-white font-bold text-lg">{doc.userName}</Text>
          <Text className="text-white font-bold text-sm">ID: {doc.userId}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Index;
