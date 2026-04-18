import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  MapPin,
  Trophy,
  Search,
  User,
  Star,
} from "lucide-react-native";
import { Image } from "expo-image";
import useUser from "../../utils/auth/useUser";
import { apiCall } from "../../utils/api";
import { useFavoriteTournaments } from "../../utils/useFavoriteTournaments";

export default function TournamentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { data: user } = useUser();
  const { isFavorite, toggleFavorite } = useFavoriteTournaments();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => apiCall("/api/tournaments"),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const tournaments = data?.tournaments || [];

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Separate my tournaments from public tournaments
  const myTournaments = user
    ? filteredTournaments.filter((t) => t.owner_id === user.id && !t.archived)
    : [];
  const publicTournaments = filteredTournaments.filter(
    (t) => !user || t.owner_id !== user.id,
  );

  // Split public tournaments into favorited and non-favorited
  const favoritedTournaments = publicTournaments.filter((t) =>
    isFavorite(t.id),
  );
  const nonFavoritedTournaments = publicTournaments.filter(
    (t) => !isFavorite(t.id),
  );

  const TournamentCard = ({ tournament, showOwnerBadge = false }) => (
    <TouchableOpacity
      onPress={() => router.push(`/tournament/${tournament.id}`)}
      style={{
        backgroundColor: "#1f2937",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: showOwnerBadge
          ? "#f97316"
          : isFavorite(tournament.id)
            ? "#facc15"
            : "#374151",
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Top row: badges + star */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          {showOwnerBadge && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: "rgba(249, 115, 22, 0.2)",
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "rgba(249, 115, 22, 0.3)",
                alignSelf: "flex-start",
                marginBottom: 8,
              }}
            >
              <User size={12} color="#fdba74" />
              <Text
                style={{ fontSize: 10, fontWeight: "600", color: "#fdba74" }}
              >
                MY TOURNAMENT
              </Text>
            </View>
          )}
        </View>
        {!showOwnerBadge && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation && e.stopPropagation();
              toggleFavorite(tournament.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4 }}
          >
            <Star
              size={22}
              color={isFavorite(tournament.id) ? "#facc15" : "#6b7280"}
              fill={isFavorite(tournament.id) ? "#facc15" : "transparent"}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "white",
          marginBottom: 8,
        }}
      >
        {tournament.name}
      </Text>

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
        <Text
          style={{ fontSize: 14, color: "#9ca3af", marginBottom: 12 }}
          numberOfLines={2}
        >
          {tournament.description}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "rgba(249, 115, 22, 0.3)",
          }}
        >
          <Trophy size={14} color="#fdba74" />
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#fdba74" }}>
            View Tournament
          </Text>
        </View>

        {tournament.logo_url && (
          <Image
            source={{ uri: tournament.logo_url }}
            style={{
              width: 96,
              height: 96,
              borderRadius: 21.5, // iOS-style app icon rounded corners (22.37% of size)
            }}
            contentFit="cover"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: "#0b121c",
          borderBottomWidth: 1,
          borderBottomColor: "#1f2937",
        }}
      >
        {/* BracketOne Logo */}
        <Image
          source={{
            uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
          }}
          style={{
            width: 360,
            height: 160,
            alignSelf: "center",
            marginBottom: -20,
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

        <Text style={{ fontSize: 14, color: "#9ca3af", textAlign: "center" }}>
          Follow your favorite teams and tournaments
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1f2937",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#374151",
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Search size={20} color="#9ca3af" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tournaments..."
            placeholderTextColor="#9ca3af"
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 16,
              color: "white",
            }}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {isLoading && (
          <View style={{ paddingVertical: 48, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={{ color: "#9ca3af", marginTop: 16 }}>
              Loading tournaments...
            </Text>
          </View>
        )}

        {error && (
          <View
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.2)",
              borderWidth: 1,
              borderColor: "#b91c1c",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <Text
              style={{ color: "#fca5a5", fontWeight: "600", marginBottom: 8 }}
            >
              Failed to load tournaments
            </Text>
            <Text style={{ color: "#fca5a5", fontSize: 12, marginBottom: 12 }}>
              {error?.message || "Unknown error"}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={{
                backgroundColor: "#f97316",
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && tournaments.length === 0 && (
          <View
            style={{
              paddingVertical: 48,
              alignItems: "center",
              backgroundColor: "#1f2937",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#374151",
            }}
          >
            <Trophy size={48} color="#4b5563" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "white",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No tournaments yet
            </Text>
            <Text style={{ color: "#9ca3af" }}>
              Check back soon for upcoming tournaments
            </Text>
          </View>
        )}

        {!isLoading &&
          !error &&
          tournaments.length > 0 &&
          filteredTournaments.length === 0 && (
            <View
              style={{
                paddingVertical: 48,
                alignItems: "center",
                backgroundColor: "#1f2937",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#374151",
              }}
            >
              <Search size={48} color="#4b5563" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "white",
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                No tournaments found
              </Text>
              <Text style={{ color: "#9ca3af" }}>
                Try adjusting your search
              </Text>
            </View>
          )}

        {!isLoading && !error && filteredTournaments.length > 0 && (
          <>
            {/* Favorite Tournaments Section */}
            {favoritedTournaments.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Star size={20} color="#facc15" />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#facc15",
                    }}
                  >
                    Favorite Tournaments ({favoritedTournaments.length})
                  </Text>
                </View>
                {favoritedTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    showOwnerBadge={false}
                  />
                ))}
              </View>
            )}

            {/* My Tournaments Section */}
            {myTournaments.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <User size={20} color="#f97316" />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#f97316",
                    }}
                  >
                    My Active Tournaments ({myTournaments.length})
                  </Text>
                </View>
                {myTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    showOwnerBadge={true}
                  />
                ))}
              </View>
            )}

            {/* All Public Tournaments Section */}
            {nonFavoritedTournaments.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: 12,
                  }}
                >
                  {myTournaments.length > 0
                    ? "Other Tournaments"
                    : "All Tournaments"}{" "}
                  ({nonFavoritedTournaments.length})
                </Text>
                {nonFavoritedTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
