import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Dimensions,
  ScrollView,
  TextInput,
  StyleSheet,
  BackHandler,
  Button,
} from "react-native";
import tempItems from "../../assets/Data/data2"; // Ensure this file exports an array of Shop objects
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuidv4 } from "uuid";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserStorageService } from "../../storage/functions/userStorageService";
import { OwnerShopPageAsyncStorage } from "../../storage/functions/ownerShopDataStorage";
import HeaderMain from "../../components/section2/header_Main";
import BottomSheet from "@gorhom/bottom-sheet";
import SlideUpMenu, {
  SlideUpMenuHandle,
} from "../../components/section2/BottomSheets/bottomSheetShopEdit";
// TypeScript interfaces
import { ShopPageData, UserComment, ShopServices } from "../../interfaces/iShop";
import { ShopDataForCharRoomCreating } from "../../interfaces/iChat";
import { UserData } from "../../interfaces/UserData";

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const gap = (width - itemWidth) / 4;

const shopEditService: React.FC = () => {
  // State for multi-select mode and selected items
  const [multiSelectMode, setMultiSelectMode] = useState<boolean>(false);

  //const [shopData, setShopData] = useState<ShopPageData | null>(null);
  const [selectedItems, setSelectedItems] = useState<ShopServices[]>([]);
  const [shopServiceData, setShopServiceData] = useState<ShopServices[]>([]);
  const [loading, setLoading] = useState(true);

  // Values for the bottom sheet
  const slideUpMenuRef = useRef<SlideUpMenuHandle>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Callback from SlideUpMenu: when index is -1, the sheet is closed.
  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index !== -1);
    console.log("Sheet index changed:", index);
  }, []);
  // Back button handling: if sheet is open, close it and prevent default back action.
  useEffect(() => {
    const onBackPress = () => {
      if (sheetOpen) {
        slideUpMenuRef.current?.close();
        return true; // Prevent default behavior
      }
      return false; // Allow default back action
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [sheetOpen]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load the shop data from async storage
        const shopData = await OwnerShopPageAsyncStorage.getUserData();
        if (shopData) {
          //setShopData(shopData);
          //console.log("Retrieved shop data:", shopData);

          // Extract the shop services from the data
          const extractedShopServices: ShopServices[] = Object.values(
            shopData.items
          ) as ShopServices[];

          setShopServiceData(
            extractedShopServices
              .map((item, index) => ({
                ...item,
                id: item.id || index.toString(),
              }))
              .concat(
                extractedShopServices.length % 2 !== 0
                  ? [{ id: "", title: "", description: "", imageUrl: "" }]
                  : []
              )
          );
          console.log("\n\nShop services data:", extractedShopServices);
        } else {
          console.log("No shop data found.");
        }
      } catch (error) {
        console.error("Error retrieving shop data:", error);
        return null;
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  // Toggle the selection state for an item
  const toggleSelection = (item: ShopServices) => {
    const isSelected = selectedItems.includes(item); // Check if the item is already selected
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

  // Action to perform on selected items
  const doActionOnSelected = () => {
    console.log("Performing action on selected items:", selectedItems);
    // After performing the action, clear selection and exit multi-select mode
    setSelectedItems([]);
    setMultiSelectMode(false);
  };
  // Handler for when the save button is pressed inside the bottom sheet

  // Regular press action for an item (when not in multi-select mode)
  const handlePress = (item: ShopServices): void => {
    slideUpMenuRef.current?.open();
    console.log("Item pressed:", item);
  };

  const renderItem = ({ item }: { item: ShopServices }) => {
    //console.log("Item Card-rendered 🔶🔶");
    if (item.title === "") {
      // Render a transparent placeholder
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
            handlePress(item);
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

  const addNewServiceButtonPress = () => {
    console.log("New service button pressed");
  };

  return (
    <View className="flex-1 bg-green-400">
      <HeaderMain
        title="Edit Services"
        onPressBack={() => {
          console.log("Back Pressed");
        }}
      />
      <View className="flex-1 bg-primary">
        <View className="bg-red-200 h-32 w-screen py-2 px-4">
          {/* Wrapper view with the dashed border */}
          <View
            className="h-full w-full flex items-center justify-center"
            style={{ borderWidth: 2, borderColor: "black", borderStyle: "dashed" }}
          >
            <Pressable
              onPress={addNewServiceButtonPress}
              android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
              style={({ pressed }) => [
                {
                  transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                  opacity: pressed ? 0.8 : 1,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <Ionicons name="add" size={36} color="black" />
            </Pressable>
          </View>
        </View>
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
            onPress={doActionOnSelected}
            className="bg-red-600 py-4 px-10 rounded-2xl absolute bottom-8 right-8 shadow-xl"
          >
            <Text className="text-white font-bold">Delete</Text>
          </Pressable>
        )}
      </View>

      {/* Bottom Sheet for Editing Service Details */}
      <SlideUpMenu ref={slideUpMenuRef} onChange={handleSheetChange}>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Enter Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Button title="Close Menu" onPress={() => slideUpMenuRef.current?.close()} />
        </View>
      </SlideUpMenu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  menuContent: {
    padding: 20,
    backgroundColor: "#e3b9b9",
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  multilineInput: {
    height: 80,
  },
});

export default shopEditService;
