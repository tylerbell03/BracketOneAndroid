import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";

export function NotFoundState({ insets }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <ChevronLeft size={24} color="#f97316" />
          <Text style={{ fontSize: 16, color: "#f97316" }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, color: "white", textAlign: "center" }}>
          Tournament not found
        </Text>
      </View>
    </View>
  );
}
