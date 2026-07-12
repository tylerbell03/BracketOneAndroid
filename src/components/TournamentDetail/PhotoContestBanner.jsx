import { TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";

export function PhotoContestBanner({ tournamentId }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/tournament/${tournamentId}/contest`)}
      activeOpacity={0.7}
      style={{
        marginTop: 32,
        alignItems: "center",
        backgroundColor: "rgba(120, 53, 15, 0.25)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(249, 115, 22, 0.3)",
        padding: 20,
      }}
    >
      <Image
        source={{
          uri: "https://ucarecdn.com/5a7f04fd-b1e3-4628-954a-1f65d18eb9c9/-/format/auto/",
        }}
        style={{ width: 120, height: 120, marginBottom: 12 }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#f97316",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Makayla Epps "Built Different" Contest
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#9ca3af",
          textAlign: "center",
        }}
      >
        Tap to vote or submit photos
      </Text>
    </TouchableOpacity>
  );
}
