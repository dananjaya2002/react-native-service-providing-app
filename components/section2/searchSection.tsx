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
    <View className="w-full h-auto justify-center items-center bg-yellow-500 my-1">
      {/* Searching section */}
      <View className="flex-row h-[50] justify-center ml-3 mr-2 rounded-lg overflow-hidden">
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
        {/* Filter Button */}
        <TouchableOpacity
          className="w-[60] items-center justify-center bg-blue-400"
          onPress={toggleMenu}
        >
          <Ionicons name="filter-sharp" size={36} />
        </TouchableOpacity>
      </View>

      {/* Backdrop (only interactive when menu is open) */}
      <Animated.View
        className="absolute inset-0 bg-black/50 z-[20] h-screen"
        style={[backdropStyle]}
        pointerEvents={isMenuOpen ? "auto" : "none"}
      >
        <TouchableOpacity className="flex-1" onPress={toggleMenu} disabled={!isMenuOpen} />
      </Animated.View>

      {/* Side Menu */}
      <Animated.View
        className="absolute right-0 top-0 h-screen z-[30] bg-white"
        style={[
          menuStyle,
          { width: MENU_WIDTH },
          {
            shadowColor: "#000",
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
        ]}
      >
        <View className="p-5 bg-green-400">
          <Text className="text-xl font-bold mb-4">Menu</Text>
          <TouchableOpacity className="py-3 bg-pink-400">
            <Text>Option 1</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 bg-pink-400">
            <Text>Option 2</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 bg-pink-400">
            <Text>Option 3</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default searchSection;
