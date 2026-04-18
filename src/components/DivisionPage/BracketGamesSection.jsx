import { View, Text } from "react-native";
import { GameCard } from "./GameCard";

export function BracketGamesSection({ bracketGames, teams, courts }) {
  if (bracketGames.length === 0) return null;

  return (
    <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 12,
          color: "#c084fc",
        }}
      >
        Bracket Games
      </Text>
      {bracketGames.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          teams={teams}
          courts={courts}
          isBracket={true}
        />
      ))}
    </View>
  );
}
