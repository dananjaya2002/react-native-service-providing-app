import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Dimensions, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { updateItemList } from "./utilities/updateItemList";
import SearchSection from "@/components/section2/searchSection";
import DevComponent, { Props } from "./DevComponont";

const DevUI: React.FC = () => {
  const cities = {
    "1": { id: "1", name: "New York" },
    "2": { id: "2", name: "London" },
    "3": { id: "3", name: "Tokyo" },
  };

  const onCitySelect = (selectedCity: any) => {
    console.log("Selected city:", selectedCity);
    // Further logic when a city is selected
  };
  const contactOptions: Props[] = [
    { text: "Call", iconName: "call" },
    { text: "Email", iconName: "mail" },
    { text: "Chat", iconName: "chatbubbles" },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="h-12 bg-blue-100">
        <Text>Section 1</Text>
      </View>
      <View className="flex-row bg-blue-300 justify-center items-center">
        {contactOptions.map((option, index) => (
          <DevComponent key={index} props={option} />
        ))}
      </View>
      <View className="h-64 bg-blue-600">
        <Text>Section 3</Text>
      </View>
      <View className="flex-1 bg-blue-900">
        <Text>Section 4</Text>
      </View>
    </View>
  );
};

export default DevUI;
