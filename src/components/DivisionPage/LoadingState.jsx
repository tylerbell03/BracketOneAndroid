import { View, ActivityIndicator } from "react-native";

export function LoadingState() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0b121c",
      }}
    >
      <ActivityIndicator size="large" color="#f97316" />
    </View>
  );
}
