import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Image } from "expo-image";
import { RefreshCw } from "lucide-react-native";
import { useRef, useEffect } from "react";
import { useRouter } from "expo-router";

export function DivisionHeader({
  division,
  gradeLabel,
  tournamentName,
  onRefresh,
  insets,
  isRefreshing = false,
}) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isRefreshing) {
      animationRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      animationRef.current.start();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      spinValue.setValue(0);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isRefreshing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: "#0b121c" }}>
      {/* BracketOne Logo */}
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
            marginBottom: -30,
          }}
          contentFit="contain"
        />
      </TouchableOpacity>

      {/* Tagline */}
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text style={{ fontSize: 13, color: "white", textAlign: "center" }}>
          Made for directors.{" "}
          <Text style={{ color: "#f97316" }}>Loved by fans.</Text>
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
            {division} {gradeLabel}
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
