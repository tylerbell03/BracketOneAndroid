import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X, Star, Users } from "lucide-react-native";

function getGradeLabel(grade) {
  const g = parseInt(grade);
  if (g === 0) return "JV";
  if (g === 14) return "Varsity";
  if (g === 15) return "Middle School";
  if (g === 16) return "High School";
  return `Grade ${g}`;
}

function formatDivisionGrade(division, grade) {
  const g = parseInt(grade);
  if (g === 0) return `${division} JV`;
  if (g === 14) return `${division} Varsity`;
  if (g === 15) return `${division} Middle School`;
  if (g === 16) return `${division} High School`;
  // Split grades
  if (g === 100) return `${division} 1st/2nd Grade`;
  if (g === 101) return `${division} 2nd/3rd Grade`;
  if (g === 102) return `${division} 3rd/4th Grade`;
  if (g === 103) return `${division} 4th/5th Grade`;
  if (g === 104) return `${division} 5th/6th Grade`;
  if (g === 105) return `${division} 6th/7th Grade`;
  if (g === 106) return `${division} 7th/8th Grade`;
  if (g === 107) return `${division} 8th/9th Grade`;
  return `${division} Grade ${g}`;
}

export default function TeamSelectionModal({
  visible,
  teams,
  selectedTeams,
  onToggleTeam,
  onSave,
  onSkip,
  onClose,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const filteredTeams = teams
    .filter(
      (team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.coach_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) return nameCompare;
      return Number(a.grade || 0) - Number(b.grade || 0);
    });

  const renderTeamItem = ({ item: team }) => {
    const isSelected = selectedTeams.includes(team.id);
    return (
      <TouchableOpacity
        onPress={() => onToggleTeam(team.id)}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isSelected ? "rgba(249, 115, 22, 0.2)" : "#374151",
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: isSelected ? "#f97316" : "#4b5563",
          padding: 14,
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "white",
              marginBottom: 3,
            }}
          >
            {team.name}
          </Text>
          <Text style={{ fontSize: 13, color: "#9ca3af" }}>
            {formatDivisionGrade(team.division, team.grade)}
            {team.pool ? ` • Pool ${team.pool}` : ""}
            {team.coach_name ? ` • Coach: ${team.coach_name}` : ""}
          </Text>
        </View>
        {isSelected && <Star size={22} color="#facc15" fill="#facc15" />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#0b121c",
          paddingTop: insets.top + 8,
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#1f2937",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Star size={24} color="#facc15" fill="#facc15" />
              <Text
                style={{ fontSize: 22, fontWeight: "bold", color: "white" }}
              >
                Favorite Teams
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#374151",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#9ca3af",
              marginBottom: 14,
            }}
          >
            Choose teams to follow throughout the tournament
          </Text>

          {/* Search */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1f2937",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#374151",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Search size={18} color="#9ca3af" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search teams..."
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

        {/* Team List */}
        <FlatList
          data={filteredTeams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 16,
          }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 48, alignItems: "center" }}>
              <Users size={40} color="#4b5563" />
              <Text
                style={{
                  fontSize: 16,
                  color: "#9ca3af",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {searchQuery
                  ? `No teams found matching "${searchQuery}"`
                  : "No teams available"}
              </Text>
            </View>
          }
        />

        {/* Bottom Actions */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: "#1f2937",
            backgroundColor: "#0b121c",
          }}
        >
          <TouchableOpacity
            onPress={onSkip}
            activeOpacity={0.7}
            style={{
              flex: 1,
              backgroundColor: "#374151",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
              Skip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            activeOpacity={0.7}
            disabled={selectedTeams.length === 0}
            style={{
              flex: 1,
              backgroundColor:
                selectedTeams.length === 0 ? "#92400e" : "#f97316",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              opacity: selectedTeams.length === 0 ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
              Save{selectedTeams.length > 0 ? ` (${selectedTeams.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
