import React from "react";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PersonalChat from "./personalChat";
import ShopChat from "./shopChat";
import { useTheme } from "@/context/ThemeContext";

const TopTab = createMaterialTopTabNavigator();

export default function ChatTopTabLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#F7FAFC",
          tabBarInactiveTintColor: "#A0AEC0",
          tabBarIndicatorStyle: {
            backgroundColor: "#F9C80E",
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: colors.primary,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
          },
          tabBarPressColor: "#F9C80E33",
          tabBarScrollEnabled: false,
          swipeEnabled: true,
          lazy: false,
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
