import { Tabs } from "expo-router";
import { Home, Settings } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0b121c",
          borderTopWidth: 1,
          borderColor: "#1f2937",
          paddingTop: 4,
        },
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 12,
        },
        animation: "none",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tournaments",
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
