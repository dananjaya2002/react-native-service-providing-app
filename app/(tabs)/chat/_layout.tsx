// (tab)/chat/_layout.tsx
import React from "react";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PersonalChat from "./personalChat";
import ShopChat from "./shopChat";

const TopTab = createMaterialTopTabNavigator();

export default function ChatTopTabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#ececec",
          tabBarIndicatorStyle: { backgroundColor: "#ececec" },
          // You can add additional styling or options here.
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
