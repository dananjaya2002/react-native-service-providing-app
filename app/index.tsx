import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { auth } from "../FirebaseConfig"; // Make sure to import your auth instance
import { onAuthStateChanged } from "firebase/auth"; // Import this to track authentication state
import { router, useRouter } from "expo-router";
import CustomLoader from "@/components/loadingIndicator";

import "../global.css"; // Import global CSS file (NativeWind)

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

const Index = () => {
  const router = useRouter(); // Get router instance

  useEffect(() => {
    const timer = setTimeout(() => {
      //router.push("/(tabs)");
      router.push("/(tabs)/shop");

      const shopId = "123";
      //router.push(`../customer/${shopId}`);
    }, 50);
    return () => clearTimeout(timer); // Cleanup the timer if the component unmounts before the timeout completes
  }, []); // Empty array ensures this runs once

  return (
    <View className="flex-1 bg-gray-400">
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg justify-center items-center "
        onPress={() => router.push("/(tabs)")}
      >
        <Text className="text-white font-bold text-lg">Press Me</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;
