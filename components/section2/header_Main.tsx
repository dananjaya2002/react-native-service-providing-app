import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  onPressBack?: () => void;
  onPressUser?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onPressBack, onPressUser }) => {
  return (
    <View
      style={styles.headerContainer}
      className="flex-row items-center h-[56px] bg-primary px-4 border-b border-gray-200"
    >
      {onPressBack ? (
        <TouchableOpacity onPress={onPressBack} className="mr-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <View className="w-6" />
      )}
      <Text className="text-xl font-bold flex-1 text-center text-gray-800">{title}</Text>
      <TouchableOpacity onPress={onPressUser} className="ml-2">
        <FontAwesome name="user-circle" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
});

export default Header;
