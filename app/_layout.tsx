import React, { useEffect } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ShopProvider } from "../context/ShopContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../context/ThemeContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { colors } = useTheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <ThemeProvider>
              <ShopProvider>
                <KeyboardProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="check" />
                    <Stack.Screen name="(auth)/login" />
                    <Stack.Screen name="(auth)/signin" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="chat/chatUi" />
                    <Stack.Screen name="Test/Test_ImageUpload" />
                    <Stack.Screen name="Test/Test_TextEditor" />
                    <Stack.Screen name="shopSection" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </KeyboardProvider>
              </ShopProvider>

              <StatusBar style="dark" backgroundColor={colors.background} />
            </ThemeProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
