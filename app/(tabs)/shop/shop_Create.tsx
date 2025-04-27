import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { UserStorageService } from "../../../storage/functions/userStorageService";
import { ShopPageData } from "../../../interfaces/iShop";

const ShopCreate = () => {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopCategory, setShopCategory] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceInfo, setServiceInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(true); // State to control popup visibility

  const handleCreateShop = async () => {
    if (!shopName || !shopDescription || !shopCategory || !phoneNumber) {
      Alert.alert("Error", "Please fill in all the required fields.");
      return;
    }

    setLoading(true);

    try {
      const userData = await UserStorageService.getUserData();
      if (!userData || !userData.userId) {
        Alert.alert("Error", "User data not found.");
        setLoading(false);
        return;
      }

      // Create shop data based on the ShopPageData interface
      const shopData: ShopPageData = {
        shopName,
        shopDescription,
        shopCategory,
        phoneNumber,
        serviceInfo,
        shopPageImageUrl: "", // Placeholder for shop image URL
        shopLocation: "", // Placeholder for shop location
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
        totalRingsCount: 0,
        avgRating: 0, // Added avgRating property
      };

      const shopDocRef = doc(db, "Users", userData.userId, "Shop", "ShopPageInfo");
      await setDoc(shopDocRef, shopData);

      Alert.alert("Success", "Shop created successfully!");
      router.push("/(tabs)/shop/userShopPage");
    } catch (error) {
      console.error("Error creating shop:", error);
      Alert.alert("Error", "Failed to create shop. Please try again.");
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
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => handlePopupResponse(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handlePopupResponse(true)}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Create Your Shop</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Shop Category"
        value={shopCategory}
        onChangeText={setShopCategory}
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

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreateShop}>
          <Text style={styles.buttonText}>Create Shop</Text>
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
});

export default ShopCreate;