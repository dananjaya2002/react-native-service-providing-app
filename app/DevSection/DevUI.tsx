// app/DevSection/DevUI.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import useLocalShopList, { ShopListItem } from "../../hooks/useLocalShopList";
import * as SQLite from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import useFirestoreShopListSync from "@/hooks/useFirestoreShopListSync";
import { fullSyncFirestoreToLocalDB } from "@/db/dev_fullSync";

const db = SQLite.openDatabaseSync("app_database.db");

const DevUI = () => {
  const { shopList, loading, error } = useLocalShopList();

  useDrizzleStudio(db);

  useFirestoreShopListSync(); // Call the sync function to start syncing with Firestore

  // useEffect(() => {
  //   fullSyncFirestoreToLocalDB();
  //   console.log("Full sync triggered.");
  // }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Error loading data: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { marginBottom: 20 }]}>Shop List</Text>
      <FlatList
        data={shopList}
        keyExtractor={(item: ShopListItem) => item.id.toString()}
        renderItem={({ item }: { item: ShopListItem }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.shopTitle}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemContainer: {
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginVertical: 6,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
  },
});

export default DevUI;
