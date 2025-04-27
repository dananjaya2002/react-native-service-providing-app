import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth, db } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloud } from "../../utility/u_uploadImageNew"; // Import the Cloudinary upload function
import { UserData } from "../../interfaces/UserData"; // Import the UserData interface

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState(""); // Add userName input
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for image upload
  const router = useRouter();

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setImageUri(selectedImageUri);

        // Start uploading the image
        setLoading(true);
        const uploadedUrl = await uploadImageToCloud(selectedImageUri);
        setLoading(false);

        if (uploadedUrl) {
          setImageUrl(uploadedUrl);
          Alert.alert("Image Uploaded", "Image uploaded successfully!");
        } else {
          Alert.alert("Upload Failed", "Failed to upload the image.");
        }
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Error picking image:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleSignUp = async () => {
    if (loading) {
      Alert.alert("Please Wait", "Image is still uploading. Please wait until the upload is complete.");
      return;
    }

    if (!imageUrl) {
      Alert.alert("Image Required", "Please upload an image before signing up.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a UserData object
      const userData: UserData = {
        userId: user.uid,
        userName: userName,        
        profileImageUrl: imageUrl,
        isServiceProvider: false, // Default value, can be updated later        
      };

      // Save the user data to Firestore
      const userDocRef = doc(db, "Users", user.uid, "UserData", "UserLoginData");
      await setDoc(userDocRef, userData, { merge: true });

      Alert.alert("Sign-Up Successful", "You have successfully signed up!");
      router.push("/(tabs)");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="User Name"
        value={userName}
        onChangeText={setUserName}
      />
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
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        <Text style={styles.imagePickerText}>Pick an Image</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
      {loading && <ActivityIndicator size="large" color="#3498db" />}
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
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
  imagePicker: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default Signin;