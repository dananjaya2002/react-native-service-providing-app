import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen name="chatRooms" options={{ headerShown: false }} />
      <Stack.Screen name="chatWindow" options={{ headerShown: false }} />
    </Stack>
  );
}
