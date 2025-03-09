import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";

// Define the Category type with a typed iconName.
export type Category = {
  categoryID: string;
  categoryName: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

type CategoryCardProps = {
  category: Category;
  onCategoryPress: (categoryID: string) => void;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onCategoryPress }) => {
  const { categoryID, categoryName, iconName } = category;
  return (
    <RectButton style={styles.card} onPress={() => onCategoryPress(categoryName)}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={22} color="#333" />
      </View>
      <Text style={styles.title}>{categoryName}</Text>
    </RectButton>
  );
};

type CategoriesListProps = {
  // Expecting a map of categories from Firebase or another source.
  categories: Record<string, Category>;
  onCategoryPress: (categoryName: string) => void;
};

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onCategoryPress }) => {
  // Convert the map to an array for FlatList.
  const categoriesArray = Object.values(categories);

  return (
    <View style={{ paddingVertical: 8 }}>
      <FlatList
        data={categoriesArray}
        keyExtractor={(item) => item.categoryID}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <CategoryCard category={item} onCategoryPress={onCategoryPress} />
        )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
