import React, { useState } from "react";
import { View, Text, Image, FlatList, Pressable, Dimensions } from "react-native";
import tempItems from "../../assets/Data/data2"; // Ensure this file exports an array of Shop objects
import { Ionicons } from "@expo/vector-icons";

import { useShop } from "../../context/ShopContext";

type Shop = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
};

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const gap = (width - itemWidth) / 4;

const shopEditService: React.FC = () => {
  // State for multi-select mode and selected items
  const [multiSelectMode, setMultiSelectMode] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Shop[]>([]);

  const { shop } = useShop();
  console.log("\n\nShop data:", shop);

  // Use tempItems data directly and add a transparent placeholder if the count is odd (Assuming only two columns are displayed)
  const data: Shop[] =
    shop.length % 2 !== 0 ? [...shop, { id: "", title: "", description: "", imageUrl: "" }] : shop;

  // Toggle the selection state for an item
  const toggleSelection = (item: Shop) => {
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
  const handleLongPress = (item: Shop) => {
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

  // Regular press action for an item (when not in multi-select mode)
  const handlePress = (item: Shop): void => {
    console.log("Item pressed:", item);
  };

  const renderItem = ({ item }: { item: Shop }) => {
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
        <View className="h-12 justify-center bg-white">
          <Text className="text-black font-bold text-md text-center " numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <Image
          source={{ uri: item.imageUrl }}
          resizeMode="contain"
          className="w-full h-40 rounded-lg"
        />
        <View className="flex-1 h-auto w-full items-center justify-center my-2 ">
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
    <View className="flex-1 bg-white">
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
        data={data}
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
          <Text className="text-white font-bold">Delete All</Text>
        </Pressable>
      )}
    </View>
  );
};

export default shopEditService;
