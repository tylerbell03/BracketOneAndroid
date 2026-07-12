import { TouchableOpacity, Text } from "react-native";
import { Star } from "lucide-react-native";

export function AddFavoritesPrompt({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(249, 115, 22, 0.15)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(249, 115, 22, 0.3)",
        paddingVertical: 14,
        marginBottom: 24,
      }}
    >
      <Star size={18} color="#f97316" />
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#f97316" }}>
        Select Favorite Teams
      </Text>
    </TouchableOpacity>
  );
}
