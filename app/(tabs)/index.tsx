import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Platform } from "react-native";

import ShopCard from "../../components/section2/shopCard";
import Header from "../../components/section2/header_Main";
import { Category } from "../../components/section2/categoriesList";
import CategoriesList from "../../components/section2/categoriesList";

import shopData from "../../assets/Data/data2";
import FilterSection, { City } from "../../components/section2/searchSection";
import { Link, router } from "expo-router";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { Drawer } from "react-native-drawer-layout";
import { Ionicons } from "@expo/vector-icons";

const reactLogo = require("../../assets/images/reactLogo.png");

interface Shop {
  id: string;
  title: string;
  description: string;
  rating: number;
  imageUrl: string;
}

const HomeScreen: React.FC = () => {
  const [open, setOpen] = useState(false);

  const dummyData: Record<string, Category> = {
    cat1: {
      categoryID: "cat1",
      categoryName: "Plumbing",
      iconName: "water-outline", // Make sure "water-outline" exists in Ionicons.glyphMap
    },
    cat2: {
      categoryID: "cat2",
      categoryName: "Electrician",
      iconName: "flash-outline",
    },
    cat3: {
      categoryID: "cat3",
      categoryName: "Cleaning",
      iconName: "brush-outline",
    },
    cat4: {
      categoryID: "cat4",
      categoryName: "Cleaning",
      iconName: "brush-outline",
    },
    cat5: {
      categoryID: "cat5",
      categoryName: "Cleaning",
      iconName: "brush-outline",
    },
  };

  const handleFilterSelect = (filterValue: string): void => {
    console.log("Filter selected:", filterValue);

    // You can update state or perform navigation based on the filter value here.
  };

  const [categories, setCategories] = useState<Record<string, Category>>({});

  const dummyCities: Record<string, City> = {
    city1: { id: "city1", name: "New York" },
    city2: { id: "city2", name: "Los Angeles" },
    city3: { id: "city3", name: "Chicago" },
  };

  const handleShopClick = (gestureEvent: TapGestureHandlerStateChangeEvent) => {
    console.log("Shop tapped!", gestureEvent.nativeEvent);
    const shopId = "123";
    router.push(`../customer/${shopId}`);
  };

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerPosition="right" // Slide from right to left
      drawerStyle={{
        backgroundColor: "#ecf0f1",
        width: 300,
        padding: 20,
      }}
      renderDrawerContent={() => (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Filter Options</Text>
          {/* Add filter components here */}
        </View>
      )}
    >
      <View className="flex-1 bg-primary">
        <Header title="Home" onPressBack={() => console.log("Back pressed")} />
        <View className="flex-row h-[50] mx-2">
          <View className="flex-1 mr-1">
            <FilterSection
              data={dummyCities}
              onSelect={() => {
                console.log("City selected");
              }}
            />
          </View>
          <View className="bg-green-600 w-[50] h-full justify-center item-center">
            <TouchableOpacity
              onPress={() => setOpen((prev) => !prev)}
              style={{
                backgroundColor: "#f2f2f2",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="menu" size={36} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <CategoriesList data={dummyData} />
        {/* Shop List */}
        <View className="flex-1 px-2">
          <FlatList
            data={shopData}
            keyExtractor={(item: Shop) => item.id}
            renderItem={({ item }: { item: Shop }) => (
              <ShopCard item={item} onShopClick={handleShopClick} />
            )}
          />
        </View>
      </View>
    </Drawer>
  );
};

export default HomeScreen;
