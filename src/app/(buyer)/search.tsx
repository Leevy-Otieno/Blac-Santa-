import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SAMPLE_BUYER_GIFTS } from "./index";

const BUDGET_PRESETS = [
  { label: "All (Ksh 500–10k)", min: 500, max: 10000 },
  { label: "Under Ksh 2,500", min: 500, max: 2500 },
  { label: "Ksh 2,500–5,000", min: 2500, max: 5000 },
  { label: "Ksh 5,000–10,000", min: 5000, max: 10000 },
];

const AGE_GROUPS = ["All Ages", "6–12", "18–24", "25–34", "35+"];

export default function BuyerSearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_PRESETS[0]);
  const [selectedAge, setSelectedAge] = useState("All Ages");

  const results = useMemo(() => {
    return SAMPLE_BUYER_GIFTS.filter((gift) => {
      const matchesQuery =
        query.trim().length === 0 ||
        gift.title.toLowerCase().includes(query.toLowerCase()) ||
        gift.shopName.toLowerCase().includes(query.toLowerCase()) ||
        gift.category.toLowerCase().includes(query.toLowerCase());
      const matchesBudget =
        gift.priceKsh >= selectedBudget.min &&
        gift.priceKsh <= selectedBudget.max;
      const matchesAge =
        selectedAge === "All Ages" || gift.ageGroup === selectedAge;
      return matchesQuery && matchesBudget && matchesAge;
    });
  }, [query, selectedBudget, selectedAge]);

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search gifts, categories, or shops..."
        placeholderTextColor="#9CA3AF"
        style={styles.searchInput}
      />

      <Text style={styles.filterLabel}>Budget (Ksh 500 – 10,000)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
      >
        {BUDGET_PRESETS.map((preset) => {
          const active = preset.label === selectedBudget.label;
          return (
            <Pressable
              key={preset.label}
              onPress={() => setSelectedBudget(preset)}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.filterLabel}>Recipient Age</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
      >
        {AGE_GROUPS.map((age) => {
          const active = age === selectedAge;
          return (
            <Pressable
              key={age}
              onPress={() => setSelectedAge(age)}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>
                {age}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No gifts match your current filters.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(buyer)/gift/${item.id}`)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
            <View style={styles.meta}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>
                Ksh {item.priceKsh.toLocaleString()}
              </Text>
              <Text style={styles.sub}>
                {item.shopName} • Age {item.ageGroup}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingTop: 12 },
  searchInput: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    color: "#111827",
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginHorizontal: 16,
    marginBottom: 6,
  },
  row: { paddingHorizontal: 16, maxHeight: 42, marginBottom: 12 },
  chip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipText: { fontSize: 12, fontWeight: "600", color: "#111827" },
  activeChip: { backgroundColor: "#111827", borderColor: "#111827" },
  activeChipText: { color: "#FFFFFF" },
  listContent: { padding: 16 },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 32 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  thumb: { width: 84, height: 84, backgroundColor: "#E5E7EB" },
  meta: { flex: 1, padding: 10, justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "700", color: "#111827" },
  price: { fontSize: 13, fontWeight: "600", color: "#047857", marginTop: 2 },
  sub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});
