import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router"; // Import useRouter for navigation
import { auth } from "../../FirebaseConfig";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { getUserData } from "@/utility/u_getUserData";
import { Ionicons } from "@expo/vector-icons";
import { clearUserData } from "@/utility/u_cleanUpForNewUser";
import { getUserFavoritesServices } from "@/utility/u_handleUserFavorites";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State for loading indicator
  const router = useRouter(); // Initialize the router for navigation

  const handleLogin = async () => {
    setLoading(true); // Set loading to true when the button is pressed
    setError(""); // Clear any previous errors
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userData = await getUserData(user.uid);
      if (!userData) {
        throw new Error("Failed to fetch user data.");
      }

      clearUserData(); // Clear any existing user data before saving new data
      await getUserFavoritesServices();

      // Save user data to local storage
      await UserStorageService.saveUserData(userData);

      setTimeout(() => {
        router.push("/(tabs)"); // Navigate to home after a short delay
      }, 100);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  // Function to handle FAB press
  const handleFabPress = () => {
    // Navigate to your desired page
    router.push("/DevSection/Dev_UserSimulation"); // Replace with your target route
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={styles.title}>Login</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" /> // Show loading indicator
          ) : (
            <Button title="Login" onPress={handleLogin} disabled={loading} /> // Disable button while loading
          )}
          <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
            <Text style={styles.link}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    color: "blue",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  // FAB styles
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#007AFF",
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Login;
