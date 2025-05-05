// (tab)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/unUsed/IconSymbol";
import TabBarBackground from "@/components/unUsed/TabBarBackground";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: TabBarBackground,

        // Static colors: inactive = white, active = dark blue
        tabBarActiveTintColor: "#48ACF0", // dark blue
        tabBarInactiveTintColor: "#FFFFFF", // white

        tabBarStyle: {
          backgroundColor: "#004887", // your bright blue
          height: Platform.select({ ios: 51, android: 52, default: 51 }),
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          borderTopWidth: 0, // remove default border
          borderTopColor: "#004887",
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size ?? 28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* Chat Tab */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size ?? 28} color={color} />
          ),
        }}
      />

      {/* Shop Page Tab */}
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size ?? 28} color={color} />,
        }}
      />

      {/* Favorites Tab */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size ?? 28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
