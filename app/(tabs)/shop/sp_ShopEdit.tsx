import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Dimensions,
  StyleSheet,
  BackHandler,
  Button,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserStorageService } from "../../../storage/functions/userStorageService";
import { OwnerShopPageAsyncStorage } from "../../../storage/functions/ownerShopDataStorage";
import HeaderMain from "../../../components/ui/header_Main";
import SlideUpMenu from "../../../components/ui/BottomSheets/bottomSheetShopEdit";
import CustomButton from "../../../components/ui/BottomSheets/bsButton";
import ImagePickerBox from "../../../components/ui/BottomSheets/bsImagePicker";
import { BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
// TypeScript interfaces
import { ShopPageData, UserComment, ShopServices } from "../../../interfaces/iShop";
import { ShopDataForCharRoomCreating } from "../../../interfaces/iChat";
import { UserData } from "../../../interfaces/UserData";
import {
  updateShopService,
  fetchShopServices,
  addNewService,
  deleteSelectedServices,
} from "@/utility/updateShopService";
import { router } from "expo-router";

const shopEditService: React.FC = () => {
  // General states
  const [shopServiceData, setShopServiceData] = useState<ShopServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  // State for multi-select mode and selected items
  const [selectedItems, setSelectedItems] = useState<ShopServices[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState<boolean>(false);

  // Slide up menu related state and ref
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [serviceModifyType, setServiceModifyType] = useState<"update" | "add">("update");

  const [sheetTitle, setSheetTitle] = useState<string | null>(null);
  const [sheetDescription, setSheetDescription] = useState<string | null>(null);
  const [sheetImageUrl, setSheetImageUrl] = useState<string | null>(null);

  const [selectedServiceInfo, setSelectedServiceInfo] = useState<ShopServices | null>(null);
  // Load shop data from async storage
  useEffect(() => {
    const loadData = async () => {
      const fetchedUserData = (await UserStorageService.getUserData()) as UserData;

      if (!fetchedUserData.userId) {
        console.error("User ID can not found.", fetchedUserData);
        setLoading(false);
        return;
      }
      setUserData(fetchedUserData);
      await getShopServiceData(fetchedUserData.userId);
      if (!shopServiceData) {
        console.log("Initial Shop Loading Failed", shopServiceData);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const getShopServiceData = async (userID: string) => {
    if (userID === null || userID === "") {
      console.error("User ID is Null or Empty", userData);
      return;
    }
    const shopData = await fetchShopServices(userID);
    if (shopData) {
      setShopServiceData(
        shopData
          .map((item, index) => ({
            ...item,
            id: item.id || index.toString(),
          }))
          .concat(
            shopData.length % 2 !== 0 ? [{ id: "", title: "", description: "", imageUrl: "" }] : []
          )
      );
      //console.log("\n\nShop services data:", shopData);
    } else {
      console.log("No shop data found.");
    }
  };

  // Back button handling: if sheet is open, close it and prevent default back action.
  useEffect(() => {
    const onBackPress = () => {
      if (bottomSheetVisible) {
        setBottomSheetVisible(false);
        return true; // Prevent default behavior
      }
      return false; // Allow default back action
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [bottomSheetVisible]);

  // If the data is still loading, display a loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Toggle the selection state for an item
  const toggleSelection = (item: ShopServices) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id); // Check if the item is already selected
    if (isSelected) {
      const newSelected = selectedItems.filter((i) => i !== item);
      setSelectedItems(newSelected); // Remove the item from selected items
      // If no items are selected, exit multi-select mode
      if (newSelected.length === 0) setMultiSelectMode(false);
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // When an item is long pressed, enter multi-select mode (if not already)
  // or toggle its selection
  const handleLongPress = (item: ShopServices) => {
    if (!multiSelectMode) {
      setMultiSelectMode(true);
      setSelectedItems([item]);
    } else {
      toggleSelection(item);
    }
  };

  // Delete selected items button press handler
  const onDeleteSelectedItemPressed = async () => {
    setLoading(true);
    console.log("Performing action on selected items:", selectedItems);
    // After performing the action, clear selection and exit multi-select mode
    if (!userData?.userId || !shopServiceData || selectedItems.length === 0) {
      console.error("Missing required user or service data for delete.");
      return;
    }
    const isSuccess = await deleteSelectedServices(userData.userId, selectedItems, shopServiceData);
    if (isSuccess) {
      console.log("Selected items deleted successfully.");
      getShopServiceData(userData.userId);
    } else {
      console.error("Failed to delete selected items.");
    }
    setSelectedItems([]);
    setMultiSelectMode(false);
    setLoading(false);
  };

  // Regular press action for an item (when not in multi-select mode)
  const handleRegularPressAction = (item: ShopServices): void => {
    setSheetTitle(item.title);
    setSheetDescription(item.description);
    setSheetImageUrl(item.imageUrl);
    setSelectedServiceInfo(item);
    setBottomSheetVisible(true);
  };

  const handleUpdateServiceButton = async () => {
    // Check if the sheet data is empty
    if (sheetTitle === null || sheetDescription === null || sheetImageUrl === null) {
      console.log("sheetTitle", sheetTitle);
      console.log("sheetDescription", sheetDescription);
      console.log("sheetImageUrl", sheetImageUrl);
      console.error("Sheet data fields are empty.");
      alert("Please fill all the fields to update the service.");
      return;
    }

    console.log("Service Modify Type:", serviceModifyType);
    if (serviceModifyType === "add") {
      if (!userData) {
        console.error("User Data is missing.");
        return;
      }
      setLoading(true);
      const newServiceObject: ShopServices = {
        id: shopServiceData.length.toString(),
        title: sheetTitle,
        imageUrl: sheetImageUrl,
        description: sheetDescription,
      };
      const newServiceArray: ShopServices[] = await addNewService(
        userData.userId,
        newServiceObject
      );
      console.log("newServiceArray", newServiceArray);
      if (newServiceArray.length > 0) {
        console.log("Shop service updated successfully.");
        getShopServiceData(userData.userId);
        setSheetTitle(null);
        setSheetDescription(null);
        setSheetImageUrl(null);
        setServiceModifyType("update");
      }
      setBottomSheetVisible(false);
      setLoading(false);
      return;
    }

    if (!userData?.userId || !shopServiceData || !selectedServiceInfo) {
      console.error("Missing required user or service data.");
      return;
    }

    const newServiceObject: ShopServices = {
      id: selectedServiceInfo.id,
      title: sheetTitle,
      imageUrl: sheetImageUrl,
      description: sheetDescription,
    };

    setLoading(true);
    // Call the utility function to update the shop service
    const updateSuccess = await updateShopService(
      userData.userId,
      shopServiceData,
      newServiceObject
    );

    if (updateSuccess) {
      console.log("Shop service updated successfully.");
      getShopServiceData(userData.userId);
    } else {
      console.error("Failed to update shop service.");
    }

    setSheetTitle(null);
    setSheetDescription(null);
    setSheetImageUrl(null);
    // Clear the sheet fields and dismiss the sheet
    setSelectedServiceInfo(null);
    setBottomSheetVisible(false);
    setSelectedServiceInfo(null);

    setLoading(false);
  };

  const renderItem = ({ item }: { item: ShopServices }) => {
    if (item.title === "") {
      // Render a transparent placeholder for odd-numbered items
      return <View className="flex-1 m-2 p-2 opacity-0" />;
    }
    const isSelected = selectedItems.includes(item);

    return (
      <Pressable
        onLongPress={() => handleLongPress(item)}
        onPress={() => {
          // If in multi-select mode, toggle selection instead of normal press action
          if (multiSelectMode) {
            toggleSelection(item);
          } else {
            handleRegularPressAction(item);
          }
        }}
        className="flex-1 m-2 p-2 bg-white rounded-xl shadow-xl relative"
      >
        <View className="h-14 justify-center bg-white">
          <Text className="text-black font-bold text-md text-center " numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        <Image
          source={{ uri: item.imageUrl }}
          resizeMode="contain"
          className="w-full h-40 rounded-lg"
        />
        <View className="flex-1 h-auto w-full items-center justify-center my-1 ">
          <Text className="text-black font-normal text-sm " numberOfLines={5}>
            {item.description}
          </Text>
        </View>
        {/* Overlay a semi-transparent dark view with an icon when selected */}
        {multiSelectMode && isSelected && (
          <View className="absolute inset-0 rounded-xl bg-black/60 justify-center items-center">
            <Ionicons name="trash-outline" size={48} color="#e53a3a" />
          </View>
        )}
      </Pressable>
    );
  };

  const addNewServiceButtonPress = async () => {
    setServiceModifyType("add");

    setSheetTitle(null);
    setSheetDescription(null);
    setSheetImageUrl(null);

    setSelectedServiceInfo(null);
    setBottomSheetVisible(true);
  };

  return (
    <View className="flex-1 bg-primary">
      <HeaderMain
        title="Edit Services"
        onPressBack={() => {
          router.back(); // Navigate to the previous screen using Expo Router
        }}
      />
      <View className="flex-1">
        <View className=" h-32 w-screen py-2 px-4">
          {/* Add new Service Section */}
          <Pressable
            onPress={addNewServiceButtonPress}
            android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
            style={styles.addServiceButton}
          >
            <View style={styles.addServiceButtonTextContainer}>
              <Text style={styles.addServiceButtonText}>Add New Service</Text>
              <Ionicons name="add" size={36} color="black" />
            </View>
          </Pressable>
        </View>
        {/* Show All Services */}
        <FlatList
          data={shopServiceData}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id !== "" ? item.id : index.toString())}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
        />
        {/* Render the action button only in multi-select mode */}
        {multiSelectMode && (
          <Pressable
            onPress={onDeleteSelectedItemPressed}
            className="bg-red-600 py-4 px-10 rounded-2xl absolute bottom-8 right-8 shadow-xl"
          >
            <Text className="text-white font-bold">Delete</Text>
          </Pressable>
        )}
      </View>

      {/* Bottom Sheet for Editing Service Details */}
      <SlideUpMenu
        isVisible={bottomSheetVisible}
        onChange={(index) => {
          console.log("Sheet index changed:", index);
          if (index === -1) setBottomSheetVisible(false);
        }}
        footer={
          <View style={styles.bottomSheetButtonContainer}>
            <CustomButton
              title="Update"
              onPress={() => {
                handleUpdateServiceButton();
              }}
            />
          </View>
        }
      >
        <View style={styles.bottomSheetTextInputContainer}>
          <Text style={styles.bottomSheetTextInputText}>Title</Text>
          <BottomSheetTextInput
            style={styles.bottomSheetTextInput}
            placeholder="Add the Title"
            value={sheetTitle ?? ""}
            onChangeText={setSheetTitle}
          />
        </View>
        <View style={styles.bottomSheetTextInputContainer}>
          <Text style={styles.bottomSheetTextInputText}>Description</Text>
          <BottomSheetTextInput
            style={[styles.bottomSheetTextInput, styles.bottomSheetMultilineTextInput]}
            placeholder="Add the Description"
            value={sheetDescription ?? ""}
            onChangeText={setSheetDescription}
            multiline={true}
          />
        </View>

        <View style={styles.bottomSheetTextInputContainer}>
          <ImagePickerBox
            initialImage={sheetImageUrl ?? ""}
            onImageChange={(uri) => {
              setSheetImageUrl(uri);
            }}
          />
        </View>
      </SlideUpMenu>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheetTextInputContainer: {
    marginVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    height: "auto",
  },
  bottomSheetTextInputText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  bottomSheetTextInput: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    // Adding a subtle shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Elevation for Android shadow
    elevation: 2,
  },
  bottomSheetMultilineTextInput: {
    height: 100, // increased height for multiline text
    textAlignVertical: "top", // aligns text at the top on Android
    // padding for the text inside the input
  },
  bottomSheetButtonContainer: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    overflow: "hidden",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  addServiceButtonTextContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "black",
    borderStyle: "dashed",
    margin: 8,
    borderRadius: 6,
  },
  addServiceButton: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: "white",
  },
  addServiceButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // White with opacity
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default shopEditService;
