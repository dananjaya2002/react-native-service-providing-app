import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";

// Define the Category type with a typed iconName.
// This ensures the iconName matches one of the keys in Ionicons.glyphMap.
export interface Category {
  categoryID: string;
  categoryName: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

interface CategoriesListProps {
  // Data coming from Firebase as a map (object) keyed by categoryID
  data: Record<string, Category>;
}

// CategoryCard component using arrow function
const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const { categoryName, iconName } = category;
  return (
    <RectButton style={styles.card} onPress={() => console.log("Pressed", categoryName)}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={22} color="#333" />
      </View>
      <Text style={styles.title}>{categoryName}</Text>
    </RectButton>
  );
};

// CategoriesList component using arrow function
const CategoriesList: React.FC<CategoriesListProps> = ({ data }) => {
  // Convert the map to an array for FlatList
  const categoriesArray = Object.values(data);

  return (
    <View className="h-auto bg-stone-600 py-1">
      <FlatList
        data={categoriesArray}
        keyExtractor={(item) => item.categoryID}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => <CategoryCard category={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 4,
    padding: 10,
    alignItems: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android shadow
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default CategoriesList;
