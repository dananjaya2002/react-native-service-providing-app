import React, { useCallback, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth, db } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloud } from "../../utility/u_uploadImageNew";
import { UserData } from "../../interfaces/UserData";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { clearUserData } from "@/utility/u_cleanUpForNewUser";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const router = useRouter();

  // Function to handle image picking and uploading
  const handleImagePick = useCallback(async () => {
    Keyboard.dismiss();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload a profile picture."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setImageUri(selectedImageUri);

        setLoading(true);
        const uploadedUrl = await uploadImageToCloud(selectedImageUri);
        setLoading(false);

        if (uploadedUrl) {
          setImageUrl(uploadedUrl);
          Alert.alert("Image Uploaded", "Profile picture uploaded successfully!");
        } else {
          Alert.alert("Upload Failed", "Failed to upload the profile picture.");
        }
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Error picking and uploading image:", error);
      Alert.alert("Error", error.message);
    }
  }, []);

  // Function to handle sign-up
  const handleSignUp = async () => {
    if (loading) {
      Alert.alert(
        "Please Wait",
        "Image is still uploading. Please wait until the upload is complete."
      );
      return;
    }

    if (!imageUrl) {
      Alert.alert("Image Required", "Please upload an image before signing up.");
      return;
    }

    setSigningUp(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a UserData object
      const userData: UserData = {
        userId: user.uid,
        userName: userName,
        profileImageUrl: imageUrl,
        isServiceProvider: false,
      };

      // Save the user data to Firestore
      const userDocRef = doc(db, "Users", user.uid, "UserData", "UserLoginData");
      await setDoc(userDocRef, userData, { merge: true });

      await clearUserData();

      // Save the user data to local storage
      await UserStorageService.saveUserData(userData);

      setSigningUp(false);
      router.push("/(tabs)");
    } catch (err: any) {
      setSigningUp(false);
      setError(err.message);
    }
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
              source={require("../../assets/images/signin_Image.png")}
              style={styles.welcomeImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Sign Up</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="User Name"
              value={userName}
              onChangeText={setUserName}
              placeholderTextColor="#999"
            />
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

          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
            <Ionicons name="camera" size={20} color="white" style={styles.iconSpacing} />
            <Text style={styles.imagePickerText}>
              {imageUri ? "Change Profile Picture" : "Upload Profile Picture"}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              {loading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#48ACF0" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>
          )}

          {signingUp ? (
            <ActivityIndicator size="large" color="#48ACF0" style={styles.loadingIndicator} />
          ) : (
            <TouchableOpacity
              style={[styles.signUpButton, (signingUp || loading) && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={signingUp || loading}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.loginContainer}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.link}>
              Already have an account? <Text style={styles.loginText}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  welcomeImage: {
    width: "80%",
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
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
  imagePicker: {
    backgroundColor: "#48ACF0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconSpacing: {
    marginRight: 8,
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#48ACF0",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 60,
  },
  uploadingText: {
    marginTop: 5,
    color: "#48ACF0",
    fontWeight: "bold",
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  signUpButton: {
    backgroundColor: "#48ACF0",
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: "#a8d4f5",
  },
  signUpButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  link: {
    color: "#666",
    textAlign: "center",
    fontSize: 15,
  },
  loginText: {
    color: "#48ACF0",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default Signin;
