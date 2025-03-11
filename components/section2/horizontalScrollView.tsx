import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, View, StyleSheet, Pressable, Image, Text } from "react-native";

import { collection, doc, getDoc, getDocs, query, VectorValue, where } from "firebase/firestore";
import { db } from "../../FirebaseConfig"; // Import Firebase db instance

// TypeScript interfaces
import { ShopServices } from "../../interfaces/iShop";
/**
 * Horizontal scrolling component with tiles
 *
 * @param items - Array of items --> imageUrl, title, name
 *
 */

type HorizontalScrollViewProps = {
  items: ShopServices[];
};

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const gap = (width - itemWidth) / 4;

const HorizontalScrollView: React.FC<HorizontalScrollViewProps> = ({ items }) => {
  const handlePress = (item: ShopServices) => {
    console.log("ShopServices pressed:", item);
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + gap}
      contentContainerStyle={{ paddingHorizontal: 10 }}
    >
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => handlePress(item)}
          className="w-80 mx-1 rounded-2xl overflow-hidden bg-white  border border-neutral-300 shadow-xl"
        >
          <View className="h-12 justify-center bg-white">
            <Text className="text-black font-bold text-md text-center " numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View className="h-64">
            <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
          </View>
          <View className="flex-1 h-auto w-full items-center justify-center my-2 px-4">
            <Text className="text-black font-normal text-sm " numberOfLines={5}>
              {item.description}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};
export default HorizontalScrollView;
