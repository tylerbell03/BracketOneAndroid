import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

export function EmptyBracketState({
  division,
  gradeLabel,
  tournamentName,
  isOwner,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top, backgroundColor: "#0b121c" }}>
        <Image
          source={{
            uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
          }}
          style={{
            width: 360,
            height: 160,
            alignSelf: "center",
            marginTop: 8,
            marginBottom: 0,
          }}
          contentFit="contain"
        />

        {/* Tagline */}
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "white", textAlign: "center" }}>
            Made for directors.{" "}
            <Text style={{ color: "#f97316" }}>Loved by fans.</Text>
          </Text>
        </View>

        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              {division} {gradeLabel} Bracket
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
              {tournamentName}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          {isOwner ? "No bracket generated yet" : "Bracket not available"}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6b7280",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {isOwner
            ? "Use the web app to generate the bracket"
            : "Check back later"}
        </Text>
      </View>
    </View>
  );
}
