import React from "react";
import { Platform } from "react-native";
import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { IconSymbol } from "@/components/unUsed/IconSymbol";
import TabBarBackground from "@/components/unUsed/TabBarBackground";

export default function TabLayout() {
  const segments = useSegments();
  const isChatRoute = segments[2] === "chatWindow";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: "#48ACF0",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          display: isChatRoute ? "none" : "flex",
          backgroundColor: "#004887",
          height: Platform.select({ ios: 51, android: 52, default: 51 }),
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          borderTopWidth: 0,
          borderTopColor: "#004887",
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          href: "/(tabs)",
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
          href: "/(tabs)/chat/chatRooms/personalChat",
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
          href: "/(tabs)/shop/userShopPage",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size ?? 28} color={color} />,
        }}
      />

      {/* Favorites Tab */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          href: "/(tabs)/favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size ?? 28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
