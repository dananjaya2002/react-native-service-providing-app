import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";

export type CategoryCardType2Props = {
  categoryID: string;
  categoryName: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

type CategoryCardType2ComponentProps = {
  category: CategoryCardType2Props;
  onCategoryPress: (categoryID: CategoryCardType2Props) => void;
};

const CategoryCardType2: React.FC<CategoryCardType2ComponentProps> = ({
  category,
  onCategoryPress,
}) => {
  const { categoryID, categoryName, iconName } = category; // Destructure the category object
  return (
    <RectButton onPress={() => onCategoryPress(category)} style={styles.rectButton}>
      <View style={styles.container}>
        <Ionicons name={iconName} size={22} color="#333" style={styles.icon} />

        <Text>{categoryName}</Text>
      </View>
    </RectButton>
  );
};

export default CategoryCardType2;

const styles = StyleSheet.create({
  rectButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    height: "100%",
  },
  icon: {
    marginHorizontal: 12, // Ensures spacing between icon and text
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
