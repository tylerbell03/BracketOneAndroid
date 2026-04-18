import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshCw } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export function BracketHeader({
  division,
  gradeLabel,
  tournamentName,
  onRefresh,
  spin,
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: "#0b121c" }}>
      <TouchableOpacity onPress={() => router.push("/(tabs)")}>
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
      </TouchableOpacity>

      {/* Tagline */}
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 13, color: "white", textAlign: "center" }}>
          Made for directors.{" "}
          <Text style={{ color: "#f97316" }}>Loved by fans.</Text>
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
            {division} {gradeLabel} Bracket
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 14 }}>
            {tournamentName}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCw size={20} color="#f97316" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
