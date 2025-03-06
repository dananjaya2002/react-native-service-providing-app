import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export interface City {
  id: string;
  name: string;
}
export interface SearchSection {
  // Data coming as a map (keyed by city id)
  data: Record<string, City>;
  // Callback returns the selected city's name
  onSelect: (selectedCity: string) => void;
}

const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.7;

const searchSection: React.FC<SearchSection> = ({ data, onSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuPosition = useSharedValue(MENU_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    //updateItemList("your-document-id");
  }, []);

  /**
   * Toggles the menu with animations for open and closed.
   */
  const toggleMenu = () => {
    const targetPosition = menuPosition.value === MENU_WIDTH ? 0 : MENU_WIDTH;
    const targetOpacity = backdropOpacity.value === 0 ? 1 : 0;

    menuPosition.value = withTiming(targetPosition, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });

    backdropOpacity.value = withTiming(targetOpacity, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });

    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Animated styles for the menu and backdrop.
   */
  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: menuPosition.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  /**
   * Handles the search button press event.
   */
  const onSearchButtonPressed = () => {
    console.log("Search button pressed");
  };

  return (
    <View className="flex-row h-[50] justify-center rounded-lg overflow-hidden w-full bg-yellow-500">
      <TextInput
        className="flex-1 border border-gray-300 bg-white text-lg px-4"
        placeholder="Search"
      />
      {/* Search Button */}
      <TouchableOpacity
        className="w-[60]  items-center justify-center bg-white"
        onPress={onSearchButtonPressed}
      >
        <Ionicons name="search-sharp" size={36} />
      </TouchableOpacity>
    </View>
  );
};

export default searchSection;
