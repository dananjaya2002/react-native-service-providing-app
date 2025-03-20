import React from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Custom header component accepting a title and an optional back button handler.
const CustomHeader = ({ title, onBackPress }: { title: string; onBackPress?: () => void }) => (
  <View
    className="h-[80px] bg-white flex flex-row items-center px-4"
    style={styles.headerContainer}
  >
    {/* Left side: Back button or placeholder */}
    {onBackPress ? (
      <Pressable
        onPress={onBackPress}
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
        style={({ pressed }) => [styles.pressableButton, pressed && styles.pressableButtonPressed]}
      >
        <Ionicons name="arrow-back" size={36} color="black" />
      </Pressable>
    ) : (
      // Ensure consistent spacing if no back button is shown.
      <View style={{ width: 24 }} />
    )}

    {/* Center: Header Title */}
    <View className="flex-1 items-center">
      <Text className="text-2xl font-bold text-black">{title}</Text>
    </View>

    {/* Right side: Empty placeholder to center the title */}
    <View style={{ width: 24 }} />
  </View>
);

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        // Customize the header using a custom component.
        header: ({ back, options, navigation }) => {
          // Use headerTitle from options or fallback to "Shop"
          const title = options.headerTitle || "Shop";
          // Define what happens when the back button is pressed.
          const handleBack = () => navigation.goBack();
          return (
            <CustomHeader title={title as string} onBackPress={back ? handleBack : undefined} />
          );
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Edit Services",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
  pressableButton: {
    padding: 8, // Increase touch area
    borderRadius: 4,
  },
  pressableButtonPressed: {
    opacity: 0.6,
  },
});
