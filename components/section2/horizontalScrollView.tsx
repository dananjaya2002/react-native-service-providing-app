import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, View, StyleSheet, Pressable, Image, Text } from "react-native";

import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../FirebaseConfig"; // Import Firebase db instance

/**
 * Horizontal scrolling component with tiles
 *
 * @param items - Array of items --> imageUrl, title, name
 *
 */

type Item = {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  items: Item[];
};

type HorizontalScrollViewProps = {
  items: Item[];
};

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const gap = (width - itemWidth) / 4;

const HorizontalScrollView: React.FC<HorizontalScrollViewProps> = ({ items }) => {
  const handlePress = (item: Item) => {
    console.log("Item pressed:", item);
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + gap}
      className="  ml-4"
    >
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => handlePress(item)}
          className="w-80 mr-2 rounded-2xl overflow-hidden bg-white border border-neutral-300 shadow-xl"
        >
          <View className="h-64">
            <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="contain" />
          </View>

          <View className="h-auto w-full bg-slate-50 items-center justify-center flex-1">
            <Text className="text-black font-bold text-sm " numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-black text-base font-bold">{item.title}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};
export default HorizontalScrollView;
