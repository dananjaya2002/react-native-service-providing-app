import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { updateUserFavoritesServices } from "@/utility/u_handleUserFavorites";

import { ShopList } from "@/interfaces/iShop";
import ShopCard from "@/components/ui/shopCard";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { router } from "expo-router";
import HeaderMain from "@/components/ui/header_Main";
import FBASaveButton from "@/components/ui/buttons/saveButton_FAB";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { useFocusEffect } from "@react-navigation/native";

const Favorites = () => {
  // State
  const favorites = useRef<ShopList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Fetch favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
      return () => {};
    }, [])
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  // Fetch bookmarks from local storage
  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const userFavorites = await UserStorageService.getUserFavorites();
      favorites.current = userFavorites || [];
    } catch (error) {
      Alert.alert("Error", "Failed to fetch bookmarks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleShopClick = (item: ShopList, event: TapGestureHandlerStateChangeEvent): void => {
    router.push(`/customer/${item.userDocId}`);
  };

  const handleFavoriteIconClick = (item: ShopList): void => {
    favorites.current = favorites.current.filter((favorite) => favorite.id !== item.id);
  };

  // Save changes to favorites
  const handleSave = async (): Promise<void> => {
    try {
      setIsUpdating(true);
      await updateUserFavoritesServices(favorites.current);

      if (favorites.current.length === 0) {
        Alert.alert("Success", "All favorites have been removed.");
      } else {
        Alert.alert("Success", "Favorites saved successfully.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update favorites. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading, please wait...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderMain title="Favorites" />

      {favorites.current.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorites Added</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={favorites.current}
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

      <FBASaveButton onPress={handleSave} />

      {isUpdating && (
        <View style={styles.overlay}>
          <View style={styles.updateBox}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.updateText}>Updating...</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
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
    paddingTop: 4,
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  updateBox: {
    width: 200,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  updateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  customButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#007bff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});

export default Favorites;
