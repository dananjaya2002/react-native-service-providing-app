// (tab)/chat/_layout.tsx
import React from "react";
import { View, useColorScheme } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PersonalChat from "./personalChat";
import ShopChat from "./shopChat";
import { useTheme } from "@/context/ThemeContext";

const TopTab = createMaterialTopTabNavigator();

export default function ChatTopTabLayout() {
  const { colors, theme, setTheme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopTab.Navigator
        screenOptions={{
          // 3. Force static colors
          tabBarActiveTintColor: "#F7FAFC", // e.g. white-ish
          tabBarInactiveTintColor: "#A0AEC0", // gray-ish
          tabBarIndicatorStyle: {
            backgroundColor: "#F9C80E",
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: colors.primary,
            elevation: 4, // shadow on Android
            shadowColor: "#000", // shadow on iOS
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
          },
          tabBarPressColor: "#F9C80E" + "33", // translucent ripple
          tabBarScrollEnabled: false, // fixed tabs
          swipeEnabled: true, // enable swipe gestures
          lazy: false, // only render tabs on demand
        }}
      >
        <TopTab.Screen
          name="PersonalChat"
          component={PersonalChat}
          options={{ title: "Personal" }}
        />
        <TopTab.Screen name="ShopChat" component={ShopChat} options={{ title: "Shop" }} />
      </TopTab.Navigator>
    </View>
  );
}
