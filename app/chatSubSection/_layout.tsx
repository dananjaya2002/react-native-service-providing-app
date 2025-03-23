// chatSubSection/_layout.tsx
import { Stack } from "expo-router";

export default function ChatSubSectionLayout() {
  return (
    <Stack>
      {/* Chat UI: header hidden */}
      <Stack.Screen
        name="chatUi"
        options={{
          headerShown: false,
        }}
      />
      {/* Shop Rating Page: header visible and styled */}
      <Stack.Screen
        name="shopRatingPage"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#f9f9f9" },
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          headerTintColor: "#333",
          animation: "slide_from_right", // This gives you a smooth transition
          animationDuration: 150,
          headerTitle: "Rate the Service",
        }}
      />
    </Stack>
  );
}
