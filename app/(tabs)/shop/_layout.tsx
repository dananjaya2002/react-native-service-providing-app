// app/(tabs)/userShop/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function UserShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Remove headers from all screens
        animation: "slide_from_right",
      }}
      initialRouteName="userShopPage"
    >
      {/* Main shop page */}
      <Stack.Screen name="userShopPage" />

      {/* Shop edit screen */}
      <Stack.Screen name="sp_ShopEdit" />

      {/* Shop create screen */}
      <Stack.Screen name="shop_Create" />
    </Stack>
  );
}
