// app/(tabs)/bookmarks.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { getUserFavoritesServices } from "@/utility/u_getUserFavoritesServices";

import { ShopList } from "@/interfaces/iShop";
import ShopCard from "@/components/ui/shopCard";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { router } from "expo-router";
import HeaderMain from "@/components/ui/header_Main";

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

  const handleShopClick = (item: ShopList, event: TapGestureHandlerStateChangeEvent): void => {
    router.push(`/customer/${item.userDocId}`);
  };

  const handleFavoriteIconClick = (item: ShopList): void => {
    console.log(`Favorite icon clicked for shop with ID ${item.id}`);
    setFavorites((prevFavorites) => prevFavorites.filter((favorite) => favorite.id !== item.id));
  };

  return (
    <View style={styles.container}>
      <HeaderMain title="Favorites" />
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorites found</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ShopCard
                item={item}
                onShopClick={handleShopClick}
                shouldDisplayFavoriteIcon={true}
                onFavoriteClick={handleFavoriteIconClick}
              />
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  listContainer: {
    paddingBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 16,
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
