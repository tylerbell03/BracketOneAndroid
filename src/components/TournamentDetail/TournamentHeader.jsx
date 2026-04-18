import { View, Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";
import { MapPin, Calendar, Users, RefreshCw } from "lucide-react-native";
import { Image } from "expo-image";
import { useRef, useEffect } from "react";

export function TournamentHeader({
  tournament,
  tournamentId,
  insets,
  teams = [],
  onRefresh,
  isRefreshing = false,
  scrollY,
}) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

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

  // Animate the header height from 420 to 200
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [420, 200],
    extrapolate: "clamp",
  });

  // GPU-accelerated animations only - no layout changes
  const expandedOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const collapsedOpacity = scrollY.interpolate({
    inputRange: [30, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const expandedTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -240],
    extrapolate: "clamp",
  });

  const collapsedTranslateY = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [200, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0b121c",
        borderBottomWidth: 1,
        borderBottomColor: "#1f2937",
        height: headerHeight,
        paddingTop: insets.top,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Collapsed compact header - slides in */}
      <Animated.View
        style={{
          opacity: collapsedOpacity,
          transform: [{ translateY: collapsedTranslateY }],
          paddingHorizontal: 16,
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
        pointerEvents={scrollY._value > 40 ? "auto" : "none"}
      >
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <Image
            source={{
              uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
            }}
            style={{
              width: 360,
              height: 160,
              marginTop: 8,
              marginBottom: 0,
            }}
            contentFit="contain"
          />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "white",
            }}
            numberOfLines={1}
          >
            {tournament.name}
          </Text>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw size={20} color="#f97316" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Expanded full header - slides out */}
      <Animated.View
        style={{
          opacity: expandedOpacity,
          transform: [{ translateY: expandedTranslateY }],
          position: "absolute",
          top: insets.top + 8,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
        pointerEvents={scrollY._value < 40 ? "auto" : "none"}
      >
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <Image
            source={{
              uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
            }}
            style={{
              width: 360,
              height: 160,
              alignSelf: "center",
              marginBottom: -30,
            }}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Tagline */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 13, color: "white", textAlign: "center" }}>
            Made for directors.{" "}
            <Text style={{ color: "#f97316" }}>Loved by fans.</Text>
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "white",
              marginBottom: 12,
              flex: 1,
            }}
          >
            {tournament.name}
          </Text>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} style={{ marginLeft: 8 }}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw size={20} color="#f97316" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        {tournament.location && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <MapPin size={16} color="#9ca3af" />
            <Text style={{ fontSize: 14, color: "#9ca3af" }}>
              {tournament.location}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Calendar size={16} color="#9ca3af" />
          <Text style={{ fontSize: 14, color: "#9ca3af" }}>
            {new Date(tournament.start_date).toLocaleDateString("en-US", {
              timeZone: "UTC",
            })}{" "}
            -{" "}
            {new Date(tournament.end_date).toLocaleDateString("en-US", {
              timeZone: "UTC",
            })}
          </Text>
        </View>

        {tournament.description && (
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>
            {tournament.description}
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => router.push(`/tournament/${tournamentId}/teams`)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1f2937",
              borderRadius: 8,
              paddingVertical: 10,
              gap: 6,
            }}
          >
            <Users size={16} color="#f97316" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#f97316" }}>
              All Teams ({teams.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push(`/tournament/${tournamentId}/court-schedules`)
            }
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1f2937",
              borderRadius: 8,
              paddingVertical: 10,
              gap: 6,
            }}
          >
            <Calendar size={16} color="#f97316" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#f97316" }}>
              Court Schedules
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
