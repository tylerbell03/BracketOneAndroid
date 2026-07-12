import { Stack } from "expo-router";

export default function TournamentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="division/[division]" />
      <Stack.Screen name="bracket/[division]" />
      <Stack.Screen name="teams" />
      <Stack.Screen name="court-schedules" />
      <Stack.Screen name="contest/index" />
      <Stack.Screen name="contest/submit" />
    </Stack>
  );
}
