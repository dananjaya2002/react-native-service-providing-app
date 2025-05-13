import React from "react";
import { FlatList, Image, Pressable, Text, View, StyleSheet } from "react-native";
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
      return <View style={styles.placeholder} />;
    }

    return (
      <Pressable style={styles.itemContainer} onPress={() => handlePress(item)}>
        <Image source={{ uri: item.image }} resizeMode="contain" style={styles.image} />
        <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
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

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    margin: 8,
    padding: 8,
    opacity: 0,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
  },
  itemName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    color: "#718096",
  },
});

export default MainScreen;
