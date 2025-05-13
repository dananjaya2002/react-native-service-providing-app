import React from "react";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";

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
    <Pressable onPress={() => onPress(item)} style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {item.title}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText} numberOfLines={5}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  titleContainer: {
    height: 48,
    justifyContent: "center",
    backgroundColor: "white",
  },
  titleText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  imageContainer: {
    height: 256,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  descriptionContainer: {
    flex: 1,
    height: "auto",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  descriptionText: {
    color: "black",
    fontWeight: "normal",
    fontSize: 14,
  },
});

export default ItemCard;
