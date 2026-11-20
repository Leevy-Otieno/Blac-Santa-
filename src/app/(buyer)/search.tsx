import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BUYER_GIFTS } from "./index";

const BUDGET_RANGES = [
  { id: "all", label: "Ksh 500 – 10,000", min: 500, max: 10000 },
  { id: "under-2500", label: "Under Ksh 2,500", min: 500, max: 2500 },
  { id: "2500-5000", label: "Ksh 2,500 – 5,000", min: 2500, max: 5000 },
  { id: "5000-10000", label: "Ksh 5,000 – 10,000", min: 5000, max: 10000 },
];

const AGE_GROUPS = ["All Ages", "6–12", "18–24", "25–34", "35+"];

export default function BuyerSearchScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [query, setQuery] = useState("");
  const [selectedBudgetId, setSelectedBudgetId] = useState("all");
  const [selectedAge, setSelectedAge] = useState("All Ages");

  const activeBudget = useMemo(
    () =>
      BUDGET_RANGES.find((b) => b.id === selectedBudgetId) ?? BUDGET_RANGES[0],
    [selectedBudgetId],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BUYER_GIFTS.filter((gift) => {
      const matchesQuery =
        !q ||
        gift.title.toLowerCase().includes(q) ||
        gift.shopName.toLowerCase().includes(q) ||
        gift.category.toLowerCase().includes(q) ||
        gift.occasion.toLowerCase().includes(q);
      const matchesBudget =
        gift.priceKsh >= activeBudget.min && gift.priceKsh <= activeBudget.max;
      const matchesAge =
        selectedAge === "All Ages" || gift.ageGroup === selectedAge;
      return matchesQuery && matchesBudget && matchesAge;
    });
  }, [query, activeBudget, selectedAge]);

  const resetFilters = () => {
    setQuery("");
    setSelectedBudgetId("all");
    setSelectedAge("All Ages");
  };

  return (
    <View
      className="flex-1 bg-rose-50/60"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      {/* Header & Reset */}
      <View className="mx-4 flex-row items-center justify-between mb-3">
        <Text className="text-xl font-extrabold text-rose-950">
          Smart Gift Search
        </Text>
        <Pressable onPress={resetFilters}>
          <Text className="text-xs font-bold text-rose-600">Reset All</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="mx-4 flex-row items-center bg-white rounded-2xl px-4 py-2.5 border border-rose-200 mb-3">
        <Ionicons name="search" size={18} color="#E11D48" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search gifts, occasions, or shops..."
          placeholderTextColor="#FDA4AF"
          className="flex-1 ml-2.5 text-sm text-rose-950"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#FB7185" />
          </Pressable>
        )}
      </View>

      {/* Budget Filter Row */}
      <Text className="mx-4 text-xs font-extrabold text-rose-950 uppercase tracking-wide mb-1.5">
        Budget (Ksh 500 – 10,000)
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 max-h-11 mb-3"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {BUDGET_RANGES.map((range, idx) => {
          const active = range.id === selectedBudgetId;
          return (
            <Animated.View
              key={range.id}
              entering={FadeInRight.delay(idx * 45).springify()}
            >
              <Pressable
                onPress={() => setSelectedBudgetId(range.id)}
                className={`mr-2 px-3.5 py-2 rounded-full border ${
                  active
                    ? "bg-rose-600 border-rose-600"
                    : "bg-white border-rose-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-white" : "text-rose-900"
                  }`}
                >
                  {range.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Age Group Filter Row */}
      <Text className="mx-4 text-xs font-extrabold text-rose-950 uppercase tracking-wide mb-1.5">
        Recipient Age Group
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 max-h-11 mb-3"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {AGE_GROUPS.map((age, idx) => {
          const active = age === selectedAge;
          return (
            <Animated.View
              key={age}
              entering={FadeInRight.delay(100 + idx * 45).springify()}
            >
              <Pressable
                onPress={() => setSelectedAge(age)}
                className={`mr-2 px-3.5 py-2 rounded-full border ${
                  active
                    ? "bg-rose-950 border-rose-950"
                    : "bg-white border-rose-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-white" : "text-rose-900"
                  }`}
                >
                  {age}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        }}
        ListEmptyComponent={
          <View className="bg-white rounded-3xl p-8 mt-4 items-center border border-rose-100">
            <Ionicons name="gift-outline" size={32} color="#E11D48" />
            <Text className="text-base font-extrabold text-rose-950 mt-2">
              No Gifts Match Filters
            </Text>
            <Text className="text-xs text-rose-700/75 text-center mt-1">
              Adjust your Ksh budget, age group, or search keywords.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 55).springify()}
            layout={Layout.springify()}
          >
            <Pressable
              onPress={() => router.push(`/(buyer)/gift/${item.id}`)}
              className="flex-row items-center bg-white rounded-3xl p-3 mb-3 border border-rose-100 shadow-xs"
            >
              <Image
                source={{ uri: item.imageUrl }}
                className={
                  isCompact
                    ? "w-20 h-20 rounded-2xl bg-rose-100"
                    : "w-24 h-24 rounded-2xl bg-rose-100"
                }
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-[10px] font-bold text-rose-600 uppercase">
                  {item.category} • Age {item.ageGroup}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm font-extrabold text-rose-950 mt-0.5"
                >
                  {item.title}
                </Text>
                <Text className="text-sm font-extrabold text-rose-700 mt-1">
                  Ksh {item.priceKsh.toLocaleString()}
                </Text>
                <Text className="text-xs text-rose-800/70 mt-0.5">
                  {item.shopName}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FB7185" />
            </Pressable>
          </Animated.View>
        )}
      />
    </View>
  );
}
