import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, Image, Text, View, StyleSheet } from "react-native";

export interface Shop {
  id: string;
  title: string;
  description: string;
  rating: number;
  imageUrl: string;
}

interface ShopCardProps {
  item: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  return (
    <TouchableOpacity
      style={styles.card}
      className="flex-row bg-white h-[120px] w-full items-center mb-2 px-2 rounded-xl border border-gray-200"
    >
      <Image source={{ uri: item.imageUrl }} className="mr-4 w-[100px] h-[100px] rounded-md" />
      <View className="flex-1 h-full pb-1 pr-2 justify-between">
        <View>
          <Text className="text-lg font-semibold mb-1">{item.title}</Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text className="text-sm text-blue-600 font-bold ml-1">{item.rating.toFixed(1)}</Text>
          </View>
          <TouchableOpacity onPress={toggleFavorite} className="pl-4 pr-2 py-1">
            {isFavorite ? (
              <Ionicons name="heart" size={25} color="red" />
            ) : (
              <Ionicons name="heart-outline" size={25} color="gray" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    // NativeWind handles layout, background, padding, border radius, and margin.
    // We'll keep the shadow styles here.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default ShopCard;
