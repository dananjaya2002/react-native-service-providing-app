import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { router } from "expo-router";
import CustomLoader from "@/components/unUsed/2/loadingIndicator";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Track login state

  const handleLogin = async () => {
    setLoading(true); // Start the loading indicator
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/(tabs)");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false); // Stop loading after the login attempt (success or error)
    }
  };

  if (loading) {
    // If the login is in progress, show the loading screen
    return <CustomLoader />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lanka Service</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={() => router.push("/(tabs)")}>
        <Text style={styles.googleButtonText}>Login With Google Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
        <Text style={styles.newAccountLink}>New Here? Create a New Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    height: 50,
    width: "90%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  googleButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  newAccountLink: {
    textAlign: "center",
    marginTop: 20,
    color: "#007bff",
    fontWeight: "bold",
  },
});
