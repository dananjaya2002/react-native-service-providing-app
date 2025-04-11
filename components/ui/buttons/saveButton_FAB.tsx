import React from "react";
import { Pressable, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FBASaveButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const FBASaveButton: React.FC<FBASaveButtonProps> = ({
  onPress,
  size = 24,
  color = "black",
  style,
  disabled = false,
  accessibilityLabel = "Save",
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Ionicons name="save-outline" size={size} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    borderWidth: 1,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0", // Default background color
  },
  pressed: {
    backgroundColor: "#e0e0e0", // Change background color when pressed
    opacity: 0.7, // Reduce opacity when pressed
  },
  disabled: {
    backgroundColor: "#d3d3d3", // Change background color when disabled
    opacity: 0.5, // Indicate disabled state
  },
});

export default FBASaveButton;
