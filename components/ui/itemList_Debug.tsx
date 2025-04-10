import React from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { items } from "../../assets/Data/data";

type Item = {
  id: number;
  name: string;
  price: string;
  image: string;
};
const MainScreen = () => {
  // Add a transparent placeholder if the item count is odd
  const data =
    items.length % 2 !== 0 ? [...items, { id: -1, name: "", price: "", image: "" }] : items;

  // Event handler for press events
  const handlePress = (item: Item) => {
    console.log("Item pressed:", item);
  };

  const renderItem = ({ item }: { item: Item }) => {
    if (item.id === -1) {
      // Render a transparent placeholder
      return <View className="flex-1 m-2 p-2 opacity-0" />;
    }

    return (
      <Pressable
        className="flex-1 m-2 p-2 bg-white rounded-xl shadow-xl"
        onPress={() => handlePress(item)}
      >
        <Image
          source={{ uri: item.image }}
          resizeMode="contain"
          className="w-full h-40 rounded-lg"
        />
        <Text className="mt-2 text-lg font-bold" numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text className="text-gray-600">{item.price}</Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
    />
  );
};

export default MainScreen;
