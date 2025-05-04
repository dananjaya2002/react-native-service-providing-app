// app/(tabs)/bookmarks.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import {
  getUserFavoritesServices,
  updateUserFavoritesServices,
} from "@/utility/u_handleUserFavorites";

import { ShopList } from "@/interfaces/iShop";
import ShopCard from "@/components/ui/shopCard";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { router } from "expo-router";
import HeaderMain from "@/components/ui/header_Main";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import FBASaveButton from "@/components/ui/buttons/saveButton_FAB";
import { UserStorageService } from "@/storage/functions/userStorageService";

const favorites = () => {
  const navigation = useNavigation();

  const favorites = useRef<ShopList[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const userFavorites = await UserStorageService.getUserFavorites(); // Fetch data from local storage
        favorites.current = userFavorites || [];
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        Alert.alert("Error", "Failed to fetch bookmarks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handleShopClick = (item: ShopList, event: TapGestureHandlerStateChangeEvent): void => {
    router.push(`/customer/${item.userDocId}`);
  };

  const handleFavoriteIconClick = (item: ShopList): void => {
    console.log(`Favorite icon clicked for shop with ID ${item.id}`);
    favorites.current = favorites.current.filter((favorite) => favorite.id !== item.id);
  };

  useEffect(() => {
    console.log("---------- Favorites updated:", favorites.current.length);
  }, [favorites]);

  // loading indicator
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-lg font-semibold text-gray-600">Loading, please wait...</Text>
      </View>
    );
  }

  async function handleSave(): Promise<void> {
    if (favorites.current.length === 0) {
      Alert.alert("Info", "No favorites to save.");
      return;
    }
    try {
      setIsUpdating(true);
      await updateUserFavoritesServices(favorites.current);
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Failed to update favorites. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  }

  // if (isUpdating) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-white m-14">
  //       <ActivityIndicator size="large" color="#007bff" />
  //       <Text className="mt-4 text-lg font-semibold text-gray-600">
  //         Updating favorites, please wait...
  //       </Text>
  //     </View>
  //   );
  // }

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
      {isUpdating ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 200,
              padding: 20,
              backgroundColor: "#fff", // White background for the box
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5, // Shadow for Android
            }}
          >
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={{ marginTop: 16, fontSize: 16, fontWeight: "600", color: "#333" }}>
              Updating...
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  customButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
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

export default favorites;
