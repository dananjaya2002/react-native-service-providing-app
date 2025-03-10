import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
    <View className="px-3 py-2 flex-row flex-wrap gap-1">
      {/* Render a chip for each selected location */}
      {selectedLocations.map((location) => (
        <TouchableOpacity
          key={location.id}
          className="bg-green-300 rounded-2xl flex-row gap-2 px-3 py-2"
          onPress={() => onRemoveLocation(location)}
        >
          <Text className="text-sm">{location.locationName}</Text>
          <Ionicons name="close-circle-outline" size={22} color="#c31111" />
        </TouchableOpacity>
      ))}

      {/* Render a chip for selected category, if any */}
      {selectedCategory && (
        <TouchableOpacity
          className="bg-blue-300 rounded-2xl flex-row gap-2 px-3 py-2"
          onPress={onRemoveCategory}
        >
          <Text className="text-sm font-medium ml-1">{selectedCategory.categoryName}</Text>
          <Ionicons name="close-circle-outline" size={22} color="#c31111" style={{}} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DisplaySelectedChip;
