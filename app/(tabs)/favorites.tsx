// app/(tabs)/bookmarks.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { getUserFavoritesServices } from "@/utility/u_getUserFavoritesServices";

import { ShopList } from "@/interfaces/iShop";

const favorites = () => {
  const [favorites, setFavorites] = useState<ShopList[]>([]);
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const userFavorites = await getUserFavoritesServices();
        setFavorites(userFavorites);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    fetchBookmarks();
  }, []);
  function handleShopPress(id: string): void {
    console.log(`Shop with ID ${id} pressed`);
    // Here you can navigate to the shop details page or perform any other action
    // For example, if you're using React Navigation:
    // navigation.navigate('ShopDetails', { shopId: id });
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorites found</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => handleShopPress(item.id)}>
              {item.shopPageImageUrl && (
                <Image source={{ uri: item.shopPageImageUrl }} style={styles.shopImage} />
              )}
              <Text style={styles.shopName}>{item.shopName}</Text>
              {item.shopDescription && (
                <Text style={styles.shopDescription}>{item.shopDescription}</Text>
              )}
              {/* You can add more details here */}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  listContent: {
    paddingBottom: 16,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  shopDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default favorites;
