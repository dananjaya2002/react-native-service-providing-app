// (tab)/chat/_layout.tsx
import React from "react";
import { View, useColorScheme } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PersonalChat from "./personalChat";
import ShopChat from "./shopChat";

const TopTab = createMaterialTopTabNavigator();

export default function ChatTopTabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#1A202C" }}>
      <TopTab.Navigator
        screenOptions={{
          // 3. Force static colors
          tabBarActiveTintColor: "#F7FAFC", // e.g. white-ish
          tabBarInactiveTintColor: "#A0AEC0", // gray-ish
          tabBarIndicatorStyle: {
            backgroundColor: "#E53E3E",
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: "#2D3748",
            elevation: 4, // shadow on Android
            shadowColor: "#000", // shadow on iOS
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
          },
          tabBarPressColor: "#E53E3E" + "33", // translucent ripple
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
