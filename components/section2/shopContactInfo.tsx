import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Props {
  text: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const ShopContactInfo: React.FC<{ props: Props }> = ({ props }) => {
  return (
    <Pressable style={styles.button} onPress={() => console.log("Pressed")}>
      <Ionicons name={props.iconName} size={28} color="#333" />
      <Text style={styles.buttonText}>{props.text}</Text>
    </Pressable>
  );
};

export default ShopContactInfo;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    flex: 1, // makes the component flexible in a row container
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
    fontSize: 12, // equivalent to text-sm
    marginTop: 4,
    color: "#333",
  },
});
