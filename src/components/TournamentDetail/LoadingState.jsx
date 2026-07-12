import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";

export function LoadingState() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0b121c",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" />
      <ActivityIndicator size="large" color="#f97316" />
      <Text style={{ color: "#9ca3af", marginTop: 16 }}>
        Loading tournament...
      </Text>
    </View>
  );
}
