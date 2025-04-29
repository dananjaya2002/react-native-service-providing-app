import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Location {
  id: string;
  locationName: string;
}

interface Category {
  categoryID: string;
  categoryName: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

interface DisplaySelectedChipProps {
  selectedLocations: Location[];
  selectedCategory: Category | null;
  onRemoveLocation: (location: Location) => void;
  onRemoveCategory: () => void;
}

const DisplaySelectedChip: React.FC<DisplaySelectedChipProps> = ({
  selectedLocations,
  selectedCategory,
  onRemoveLocation,
  onRemoveCategory,
}) => {
  return (
    <View style={styles.container}>
      {/* Location Chips */}
      {selectedLocations.map((location) => (
        <TouchableOpacity
          key={location.id}
          style={[styles.chip, styles.locationChip]}
          onPress={() => onRemoveLocation(location)}
        >
          <Text style={styles.chipText}>{location.locationName}</Text>
          <Ionicons name="close-circle-outline" size={22} color="#c31111" />
        </TouchableOpacity>
      ))}

      {/* Category Chip */}
      {selectedCategory && (
        <TouchableOpacity style={[styles.chip, styles.categoryChip]} onPress={onRemoveCategory}>
          <Text style={styles.categoryChipText}>{selectedCategory.categoryName}</Text>
          <Ionicons name="close-circle-outline" size={22} color="#c31111" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 14,
    marginRight: 6,
  },
  locationChip: {
    backgroundColor: "#86efac",
  },
  categoryChip: {
    backgroundColor: "#93c5fd",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
    marginLeft: 4,
  },
});

export default DisplaySelectedChip;
