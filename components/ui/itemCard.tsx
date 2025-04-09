import React from "react";
import { Pressable, View, Text, Image } from "react-native";

interface Item {
  title: string;
  imageUrl: string;
  description: string;
}

interface ItemCardProps {
  item: Item;
  onPress: (item: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  return (
    <Pressable
      onPress={() => onPress(item)}
      className="w-80 mx-1 rounded-2xl overflow-hidden bg-white border border-neutral-300 shadow-xl"
    >
      <View className="h-12 justify-center bg-white">
        <Text className="text-black font-bold text-md text-center" numberOfLines={1}>
          {item.title}
        </Text>
      </View>

      <View className="h-64">
        <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
      </View>

      <View className="flex-1 h-auto w-full items-center justify-center my-2">
        <Text className="text-black font-normal text-sm" numberOfLines={5}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
};

export default ItemCard;
