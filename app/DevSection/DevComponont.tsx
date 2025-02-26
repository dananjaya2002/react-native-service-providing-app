import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export interface Props {
  text: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const shopContactInfo: React.FC<{ props: Props }> = ({ props }) => {
  return (
    <Pressable
      className="bg-white justify-center items-center rounded-lg m-2 px-4 py-2"
      onPress={() => console.log("Pressed")}
    >
      <Ionicons name={props.iconName} size={42} color="#333" />
      <Text>{props.text}</Text>
    </Pressable>
  );
};

export default shopContactInfo;
