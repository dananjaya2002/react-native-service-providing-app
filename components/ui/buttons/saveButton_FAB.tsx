import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, StyleProp, ViewStyle, Platform } from "react-native";
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
  color = "white",
  style,
  disabled = false,
  accessibilityLabel = "Save",
}) => {
  // Track pressed state manually
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    // Ensuring the onPress handler is called only once
    if (!disabled) {
      onPress();
    }
  };

  return (
    <Pressable
      ref={buttonRef}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, isPressed && styles.pressed, disabled && styles.disabled, style]}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      android_ripple={{
        color: "#1565C0",
        borderless: true, // This makes the ripple respect the container shape
        radius: 28, // Same as our border radius
      }}
    >
      <Ionicons name="save-outline" size={size} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3", // Material Design blue
    borderWidth: 0, // Remove border for cleaner look
    overflow: "hidden", // This helps contain the ripple effect
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  pressed: {
    backgroundColor: "#1976D2", // Darker blue when pressed
    transform: [{ scale: 0.98 }], // Slight scale effect when pressed (reduced from 0.95)
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabled: {
    backgroundColor: "#BBDEFB", // Light blue when disabled
    opacity: 0.7,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default FBASaveButton;
