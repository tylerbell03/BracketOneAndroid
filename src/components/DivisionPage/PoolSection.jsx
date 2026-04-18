import { View, Text } from "react-native";
import { PoolStandings } from "./PoolStandings";
import { GameCard } from "./GameCard";

export function PoolSection({
  pool,
  poolTeams, // Already sorted from server API
  poolGames,
  teams,
  courts,
  tournament,
  isLastPool,
}) {
  // poolTeams are already sorted by the server using the exact same logic as web app
  // No need to sort locally - this ensures 100% consistency

  return (
    <View>
      {/* Pool Header - styled like Bracket Games header */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 12,
          color: "#fb923c",
        }}
      >
        Pool {pool}
      </Text>

      {/* Games Section (above standings) */}
      {poolGames.length > 0 && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 8,
            color: "#9ca3af",
          }}
        >
          Games ({poolGames.length})
        </Text>
      )}

      {/* Pool Games */}
      {poolGames.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          teams={teams}
          courts={courts}
          isBracket={false}
        />
      ))}

      {/* Pool Standings (below games) */}
      <View style={{ marginTop: poolGames.length > 0 ? 8 : 0 }}>
        <PoolStandings sortedTeams={poolTeams} />
      </View>

      {/* Divider between pools */}
      {!isLastPool && (
        <View
          style={{
            height: 1,
            backgroundColor: "#374151",
            marginTop: 12,
          }}
        />
      )}
    </View>
  );
}
