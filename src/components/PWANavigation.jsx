import { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname, useGlobalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Home,
  Users,
  Calendar,
  Trophy,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { apiCall } from "@/utils/api";

export default function PWANavigation() {
  const { data: user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();
  const insets = useSafeAreaInsets();

  const [tournamentId, setTournamentId] = useState(null);
  const [division, setDivision] = useState(null);
  const [grade, setGrade] = useState(null);
  const [isMainTournamentPage, setIsMainTournamentPage] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const updateNavigationState = async () => {
      // Parse current path to get tournament context
      // Patterns: /tournament/[id]/...
      const tournamentMatch = pathname.match(/\/tournament\/(\d+)/);
      const divisionMatch = pathname.match(/\/(?:division|bracket)\/([^\/]+)/);

      if (tournamentMatch) {
        const tid = tournamentMatch[1];
        setTournamentId(tid);

        // Check if we're on the main tournament page
        const isMain = pathname === `/tournament/${tid}`;
        setIsMainTournamentPage(isMain);

        // Fetch tournament to check ownership
        if (user) {
          try {
            const data = await apiCall(`/api/tournaments/${tid}`);
            const tournament = data.tournament;
            const isUserOwner =
              Number(tournament.owner_id) === Number(user.id) ||
              user.is_admin === true;
            setIsOwner(isUserOwner);
          } catch (error) {
            console.error("Error checking tournament ownership:", error);
          }
        }
      } else {
        setTournamentId(null);
        setIsMainTournamentPage(false);
        setIsOwner(false);
      }

      // Get division from URL path or query parameter
      if (divisionMatch) {
        const divValue = divisionMatch[1];
        const decoded = decodeURIComponent(divValue);
        setDivision(decoded);
      } else if (searchParams.division) {
        const decoded = decodeURIComponent(String(searchParams.division));
        setDivision(decoded);
      } else {
        setDivision(null);
      }

      // Get grade from query parameter
      if (searchParams.grade) {
        const gradeValue = String(searchParams.grade);
        setGrade(gradeValue);
      } else {
        setGrade(null);
      }
    };

    updateNavigationState();
  }, [pathname, searchParams, user]);

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    if (tournamentId) {
      router.replace(`/tournament/${tournamentId}`);
    }
  };

  const handleTeams = () => {
    // Only navigate if we have all required context
    if (!tournamentId || !division || !grade) {
      return;
    }

    const targetPath = `/tournament/${tournamentId}/teams?division=${division}&grade=${grade}`;
    router.replace(targetPath);
  };

  const handleGames = () => {
    // Only navigate if we have all required context
    if (!tournamentId || !division || !grade) {
      return;
    }

    // URL encode the division parameter to handle special characters
    const encodedDivision = encodeURIComponent(division);
    const targetPath = `/tournament/${tournamentId}/division/${encodedDivision}?grade=${grade}`;
    router.push(targetPath);
  };

  const handleBracket = () => {
    // Only navigate if we have all required context
    if (!tournamentId || !division || !grade) {
      return;
    }

    const targetPath = `/tournament/${tournamentId}/bracket/${division}?grade=${grade}`;
    router.replace(targetPath);
  };

  // Determine active button based on current path
  const isHomeActive = pathname === `/tournament/${tournamentId}`;
  const isTeamsActive = pathname.includes("/teams");
  const isGamesActive = pathname.includes("/division/");
  const isBracketActive = pathname.includes("/bracket/");

  // Don't show on root tournaments page or non-tournament pages
  if (
    pathname === "/" ||
    (!tournamentId && !pathname.includes("/tournament/"))
  ) {
    return null;
  }

  const showNavigationButtons =
    tournamentId && division && grade && !isMainTournamentPage;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(11, 18, 28, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        paddingBottom: insets.bottom,
        paddingTop: 12,
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <ChevronLeft size={20} color="white" />
          <Text style={{ fontSize: 10, fontWeight: "500", color: "white" }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Home Button */}
        {tournamentId && (
          <TouchableOpacity
            onPress={handleHome}
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: isHomeActive
                ? "rgba(249, 115, 22, 0.2)"
                : "transparent",
            }}
          >
            <Home size={20} color={isHomeActive ? "#f97316" : "white"} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: isHomeActive ? "#f97316" : "white",
              }}
            >
              Home
            </Text>
          </TouchableOpacity>
        )}

        {/* Teams Button - Only show with division and grade context and NOT on main page */}
        {showNavigationButtons && (
          <TouchableOpacity
            onPress={handleTeams}
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: isTeamsActive
                ? "rgba(249, 115, 22, 0.2)"
                : "transparent",
            }}
          >
            <Users size={20} color={isTeamsActive ? "#f97316" : "white"} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: isTeamsActive ? "#f97316" : "white",
              }}
            >
              Teams
            </Text>
          </TouchableOpacity>
        )}

        {/* Games Button - Only show with division and grade context and NOT on main page */}
        {showNavigationButtons && (
          <TouchableOpacity
            onPress={handleGames}
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: isGamesActive
                ? "rgba(249, 115, 22, 0.2)"
                : "transparent",
            }}
          >
            <Calendar size={20} color={isGamesActive ? "#f97316" : "white"} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: isGamesActive ? "#f97316" : "white",
              }}
            >
              Games
            </Text>
          </TouchableOpacity>
        )}

        {/* Bracket Button - Only show with division and grade context and NOT on main page */}
        {showNavigationButtons && (
          <TouchableOpacity
            onPress={handleBracket}
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: isBracketActive
                ? "rgba(249, 115, 22, 0.2)"
                : "transparent",
            }}
          >
            <Trophy size={20} color={isBracketActive ? "#f97316" : "white"} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: isBracketActive ? "#f97316" : "white",
              }}
            >
              Bracket
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
