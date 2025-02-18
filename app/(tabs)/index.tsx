import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Platform } from "react-native";

import ShopCard from "../../components/section2/shopCard";
import Header from "../../components/section2/header_Main";
import { Category } from "../../components/section2/categoriesList";
import CategoriesList from "../../components/section2/categoriesList";

import shopData from "../../assets/Data/data2";
import FilterSection, { City } from "../../components/section2/searchSection";

const reactLogo = require("../../assets/images/reactLogo.png");

interface Shop {
  id: string;
  title: string;
  description: string;
  rating: number;
  imageUrl: string;
}

const HomeScreen: React.FC = () => {
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

  return (
    <View className="flex-1 bg-green-900 relative">
      <Header title="Home" onPressBack={() => console.log("Back pressed")} />

      <FilterSection data={dummyCities} onSelect={() => console.log("Search Button Pressed")} />

      <CategoriesList data={dummyData} />

      {/* Shop List */}
      <FlatList
        data={shopData}
        keyExtractor={(item: Shop) => item.id}
        renderItem={({ item }: { item: Shop }) => <ShopCard item={item} />}
      />
    </View>
  );
};

export default HomeScreen;
