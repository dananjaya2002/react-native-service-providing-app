import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { UserStorageService } from "../../../storage/functions/userStorageService";
import { ShopCategory, ShopPageData } from "../../../interfaces/iShop";
import { SystemDataStorage } from "../../../storage/functions/systemDataStorage";
import { Dropdown } from "react-native-element-dropdown"; // Import Dropdown
import { createShopPage } from "@/utility/u_createShopPage";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloud } from "@/utility/u_uploadImageNew";

const ShopCreate = () => {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopCategory, setShopCategory] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceInfo, setServiceInfo] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [categories, setCategories] = useState<ShopCategory[]>([]); // State to store categories
  const [cities, setCities] = useState<Cities[]>([]); // State to store cities
  const [shopPageImageUrl, setShopPageImageUrl] = useState<string>("");
  const [loadingImage, setLoadingImage] = useState(false); // Loading state for image upload

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await SystemDataStorage.getServiceCategories();
        const fetchedCities = await SystemDataStorage.getCities();
        const userData = await UserStorageService.getUserData();
        if (!userData || !userData.userId) {
          Alert.alert("Error", "User data not found. Please log in again.");
          return;
        }
        if (!userData.isServiceProvider) {
          setShowPopup(true); // Show the popup if the user is not a service provider
        }
        console.log("Fetched cities:", fetchedCities);
        if (fetchedCategories) {
          setCategories(fetchedCategories);
        }
        if (fetchedCities) {
          setCities(fetchedCities);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateShop = async () => {
    if (
      !shopName ||
      !shopDescription ||
      !shopCategory ||
      !phoneNumber ||
      !shopLocation ||
      !shopPageImageUrl
    ) {
      Alert.alert("Error", "Please fill in all the required fields.");
      return;
    }

    setLoading(true);

    try {
      const userData = await UserStorageService.getUserData();
      if (!userData || !userData.userId) {
        Alert.alert("Error", "User data not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Create shop data based on the ShopPageData interface
      const shopData: ShopPageData = {
        shopName: shopName,
        shopDescription: shopDescription,
        shopCategory: shopCategory,
        phoneNumber: phoneNumber,
        serviceInfo: serviceInfo,
        shopPageImageUrl: shopPageImageUrl, // Placeholder for shop image URL
        shopLocation: shopLocation, // Placeholder for shop location
        gpsCoordinates: {
          latitude: 0, // Default latitude
          longitude: 0, // Default longitude
        },
        dashboardInfo: {
          avgRatings: 0,
          totalRatings: 0,
          waiting: 0,
          completed: 0,
          items: 0,
          agreement: "",
          messages: 0,
          totalComments: 0,
        },
        items: [], // Empty array for shop services
        totalRatingsCount: 0,
        avgRating: 0, // Added avgRating property
      };

      // console.log("Shop data to be created:", shopData);
      // return;

      const result = await createShopPage(userData.userId, shopData);
      if (result) {
        console.log("✅ Shop created successfully!");
        try {
          router.replace("/(tabs)/shop/userShopPage");
        } catch (err) {
          console.error("Navigation error:", err);
        }
      } else {
        Alert.alert("Error", "Failed to create shop. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error creating shop:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePopupResponse = (response: boolean) => {
    setShowPopup(false); // Hide the popup
    if (!response) {
      router.push("/(tabs)"); // Navigate back to the home tab if "Cancel" is clicked
    }
  };

  // Function to handle image picking and uploading
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload an image."
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
        setShopPageImageUrl(selectedImageUri);

        setLoadingImage(true);
        const uploadedUrl = await uploadImageToCloud(selectedImageUri);
        setLoadingImage(false);

        if (uploadedUrl) {
          setShopPageImageUrl(uploadedUrl); // Assign the uploaded URL to shopPageImageUrl
        } else {
          Alert.alert("Upload Failed", "Failed to upload the shop image.");
        }
      }
    } catch (error: any) {
      setLoadingImage(false);
      console.error("Error picking and uploading image:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal for Popup */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => handlePopupResponse(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Shop</Text>
            <Text style={styles.modalMessage}>
              You are not a service provider. Do you want to create a shop?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handlePopupResponse(true)}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => handlePopupResponse(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Create Your Shop</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
            <Text style={styles.imagePickerText}>Pick Shop Image</Text>
          </TouchableOpacity>
          {shopPageImageUrl && (
            <Image source={{ uri: shopPageImageUrl }} style={styles.imagePreview} />
          )}
          {loadingImage && <ActivityIndicator size="large" color="#3498db" />}
          <TextInput
            style={styles.input}
            placeholder="Shop Name"
            value={shopName}
            onChangeText={setShopName}
          />
          <TextInput
            style={styles.input}
            placeholder="Shop Description"
            value={shopDescription}
            onChangeText={setShopDescription}
            multiline
          />
          <Dropdown
            style={styles.dropdown}
            data={categories}
            labelField="categoryName"
            valueField="categoryName"
            placeholder="Select a category"
            value={shopCategory}
            onChange={(item) => {
              setShopCategory(item.categoryName);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            data={cities} // No mapping needed if Cities already has label/value
            labelField="label"
            valueField="label"
            placeholder="Select a city"
            value={shopLocation}
            onChange={(item) => setShopLocation(item.label)}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Service Info"
            value={serviceInfo}
            onChangeText={setServiceInfo}
            multiline
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreateShop}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
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
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "#007bff",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
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

export default ShopCreate;
