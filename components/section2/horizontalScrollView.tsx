import React from "react";
import { Dimensions, ScrollView, View, StyleSheet, Pressable, Image, Text } from "react-native";

import { items } from "../../assets/Data/data";

type Item = {
  id: number;
  name: string;
  price: string;
  image: string;
};

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const gap = (width - itemWidth) / 4;

const TileScrolling = () => {
  // Event handler for press events
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
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => handlePress(item)}
          className="w-80 mr-2 rounded-2xl overflow-hidden bg-white border border-neutral-300 shadow-xl"
        >
          <View className="h-64">
            <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="center" />
          </View>

          <View className="h-auto w-full bg-slate-50 items-center justify-center flex-1">
            <Text className="text-black font-bold text-sm " numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-black text-base font-bold">{item.price}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};
export default TileScrolling;
