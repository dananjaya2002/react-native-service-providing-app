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
  Image,
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

      await clearUserData(); // Clear any existing user data before saving new data
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/login_Image.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Login</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#48ACF0" />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.signupContainer}
            onPress={() => router.push("/(auth)/signin")}
          >
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.signupText}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    padding: 30,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: "80%",
    height: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  error: {
    color: "#ff3b30",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#48ACF0",
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  link: {
    color: "#666",
    textAlign: "center",
    fontSize: 15,
  },
  signupText: {
    color: "#48ACF0",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#48ACF0",
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Login;
