import { Stack } from "expo-router";

export default function ChatWindowLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="chatUi"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="shopRatingPage"
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: "#f9f9f9" },
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          headerTintColor: "#333",
          animation: "slide_from_right", // Retain the animation
          animationDuration: 150,
          headerTitle: "Rate the Service",
        }}
      />
    </Stack>
  );
}
