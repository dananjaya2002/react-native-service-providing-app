// app/DevSection/DevUI.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import SearchSection from "../../components/ui/searchSection";
import { ShopItem } from "../../hooks/useSearchShopList";

const DevUI: React.FC = () => {
  const handleSearchSubmit = (results: ShopItem[]) => {
    console.log("Submitted search results:", results);
  };

  return (
    <View style={styles.container}>
      <SearchSection
        onSearchSubmit={handleSearchSubmit}
        placeholder="Search items..."
      />
    </View>
  );
};

export default DevUI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ebebeb",
  },
});
