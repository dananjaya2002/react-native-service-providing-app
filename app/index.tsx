import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from '../FirebaseConfig'; // Make sure to import your auth instance
import { onAuthStateChanged } from 'firebase/auth'; // Import this to track authentication state
import { router } from 'expo-router';
import CustomLoader from '@/components/loadingIndicator';

export default function Index() {
  const [loading, setLoading] = useState(true); // To show loading screen while checking authentication
  const [user, setUser] = useState<any>(null); // To store the user info

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // User is signed in
        router.push('/(tabs)'); // Redirect to the main app (tabs)
      } else {
        setUser(null); // No user is signed in
        router.push('/(auth)/login'); // Redirect to sign-in page
      }
      setLoading(false); // Stop the loading screen once checked
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Show loading screen while checking auth state
    return <CustomLoader />;
  }

  // Render null or any other UI if user is signed in
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
