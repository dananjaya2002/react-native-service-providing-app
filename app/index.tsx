import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../FirebaseConfig";

const Index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, redirect to the main app
        router.push("/(tabs)");
      } else {
        // User is not authenticated, redirect to the login page
        router.push("/(auth)/login");
      }
      setLoading(false);
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    // Show a loading indicator while checking authentication state
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return null; // Render nothing while redirecting
};

export default Index;