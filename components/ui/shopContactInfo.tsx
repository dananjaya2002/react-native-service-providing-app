import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Define the shape of each contact option
export interface ContactOption {
  text: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

interface ShopContactInfoProps {
  // Callback to "return" the clicked button's string value
  onOptionSelect?: (option: string) => void;
}

const ShopContactInfo: React.FC<ShopContactInfoProps> = ({
  onOptionSelect = (option) => console.log(option),
}) => {
  const contactOptions: ContactOption[] = [
    { text: "Call", iconName: "call" },
    { text: "Chat", iconName: "chatbubbles" },
    { text: "Save", iconName: "bookmark" },
    { text: "Share", iconName: "share" },
  ];

  const handlePress = (option: ContactOption) => {
    onOptionSelect(option.text);
  };
  return (
    <View style={styles.container}>
      {contactOptions.map((option, index) => (
        <Pressable key={index} style={styles.button} onPress={() => handlePress(option)}>
          <Ionicons name={option.iconName} size={28} color="#333" />
          <Text style={styles.buttonText}>{option.text}</Text>
        </Pressable>
      ))}
    </View>
  );
};

export default ShopContactInfo;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 2,
    paddingVertical: 8,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 5,
  },
  buttonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
});
