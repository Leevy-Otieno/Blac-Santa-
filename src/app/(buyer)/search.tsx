import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
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
import { PinpointedShopBanner } from "../../components/PinpointedShopBanner";
import { useWishlist } from "../../hooks/use-wishlist";
import {
  BlackSantaPinpointedShop,
  GiftProduct,
} from "../../types/marketplace.types";
import { buildWhatsAppUrl } from "../../utils/build-whatsapp-url";
import { formatKsh } from "../../utils/format-ksh";

const BUDGET_RANGES = [
  {
    id: "all",
    label: `${formatKsh(500)} – ${formatKsh(10000)}`,
    min: 500,
    max: 10000,
  },
  {
    id: "500-2500",
    label: `${formatKsh(500)} – ${formatKsh(2500)}`,
    min: 500,
    max: 2500,
  },
  {
    id: "2500-5000",
    label: `${formatKsh(2500)} – ${formatKsh(5000)}`,
    min: 2500,
    max: 5000,
  },
  {
    id: "5000-10000",
    label: `${formatKsh(5000)} – ${formatKsh(10000)}`,
    min: 5000,
    max: 10000,
  },
];

const AGE_GROUPS = ["All Ages", "6–12", "18–24", "25–34", "35+"];

interface BuyerSearchScreenProps {
  catalogItems?: GiftProduct[];
}

export default function BuyerSearchScreen({
  catalogItems = [],
}: BuyerSearchScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const params = useLocalSearchParams<{
    shopId?: string;
    shopName?: string;
    neighborhood?: string;
    occasion?: string;
    category?: string;
    budget?: string;
    minKsh?: string;
    maxKsh?: string;
  }>();

  const { isSaved, toggleWishlist } = useWishlist();

  const [query, setQuery] = useState("");
  const [selectedBudgetId, setSelectedBudgetId] = useState("all");
  const [selectedAge, setSelectedAge] = useState("All Ages");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pinpointedShop, setPinpointedShop] =
    useState<BlackSantaPinpointedShop | null>(null);

  useEffect(() => {
    if (params.budget && BUDGET_RANGES.some((b) => b.id === params.budget)) {
      setSelectedBudgetId(params.budget);
    }
    if (params.neighborhood) {
      setSelectedNeighborhood(params.neighborhood);
    }
    if (params.occasion) {
      setSelectedOccasion(params.occasion);
    }
    if (params.category) {
      setSelectedCategory(params.category);
    }
    if (params.shopName || params.shopId) {
      setPinpointedShop({
        shopId: params.shopId || params.shopName || "pinpointed-shop",
        shopName: params.shopName || "Selected Shop",
        neighborhood: params.neighborhood || "Nairobi",
        phone: "",
        reason: `Filtering catalog for ${params.shopName || params.shopId} in ${params.neighborhood || "Nairobi"}.`,
      });
    }
  }, [
    params.budget,
    params.category,
    params.neighborhood,
    params.occasion,
    params.shopId,
    params.shopName,
  ]);

  const activeBudget = useMemo(() => {
    const base =
      BUDGET_RANGES.find((b) => b.id === selectedBudgetId) ?? BUDGET_RANGES[0];
    const min = params.minKsh ? Number(params.minKsh) || base.min : base.min;
    const max = params.maxKsh ? Number(params.maxKsh) || base.max : base.max;
    return { ...base, min, max };
  }, [params.maxKsh, params.minKsh, selectedBudgetId]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hood = selectedNeighborhood.trim().toLowerCase();
    const occ = selectedOccasion.trim().toLowerCase();
    const cat = selectedCategory.trim().toLowerCase();

    return catalogItems.filter((gift) => {
      if (pinpointedShop?.shopId && gift.shopId !== pinpointedShop.shopId) {
        return false;
      }
      if (hood && !gift.neighborhood.toLowerCase().includes(hood)) {
        return false;
      }
      if (occ && !(gift.occasionTag || "").toLowerCase().includes(occ)) {
        return false;
      }
      if (
        cat &&
        !(gift.recipientTag || gift.category || "").toLowerCase().includes(cat)
      ) {
        return false;
      }

      const matchesQuery =
        !q ||
        gift.title.toLowerCase().includes(q) ||
        gift.shopName.toLowerCase().includes(q) ||
        gift.neighborhood.toLowerCase().includes(q) ||
        (gift.category || "").toLowerCase().includes(q) ||
        (gift.occasionTag || "").toLowerCase().includes(q);

      const matchesBudget =
        gift.priceKsh >= activeBudget.min && gift.priceKsh <= activeBudget.max;

      const matchesAge =
        selectedAge === "All Ages" ||
        (gift.description || "").includes(selectedAge);

      return matchesQuery && matchesBudget && matchesAge;
    });
  }, [
    activeBudget.max,
    activeBudget.min,
    catalogItems,
    pinpointedShop?.shopId,
    query,
    selectedAge,
    selectedCategory,
    selectedNeighborhood,
    selectedOccasion,
  ]);

  const resetFilters = () => {
    setQuery("");
    setSelectedBudgetId("all");
    setSelectedAge("All Ages");
    setSelectedNeighborhood("");
    setSelectedOccasion("");
    setSelectedCategory("");
    setPinpointedShop(null);
  };

  const handleToggleSave = async (gift: GiftProduct) => {
    await toggleWishlist({
      id: gift.id,
      shopId: gift.shopId,
      title: gift.title,
      priceKsh: gift.priceKsh,
      shopName: gift.shopName,
      neighborhood: gift.neighborhood,
      phone: gift.shopPhone,
      recipient: gift.recipientTag || gift.category,
      occasion: gift.occasionTag,
      notes: gift.description,
    });
  };

  const handleWhatsAppOrder = async (gift: GiftProduct) => {
    const msg = `Hi ${gift.shopName}, I found "${gift.title}" (${formatKsh(
      gift.priceKsh,
    )}) on BLAC SANTA and would like to order in ${gift.neighborhood}.`;
    const url = buildWhatsAppUrl(gift.shopPhone, msg);
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore if external scheme cannot be opened
    }
  };

  return (
    <View
      className="flex-1 bg-rose-50/60"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      {/* Header & Reset */}
      <View className="mx-4 flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            className="h-9 w-9 rounded-full bg-white border border-rose-200 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={18} color="#881337" />
          </Pressable>
          <Text className="text-xl font-extrabold text-rose-950">
            Smart Gift Search
          </Text>
        </View>
        <Pressable onPress={resetFilters}>
          <Text className="text-xs font-bold text-rose-600">Reset All</Text>
        </Pressable>
      </View>

      {/* Pinpointed Shop Banner */}
      <PinpointedShopBanner
        shop={pinpointedShop}
        onClear={() => setPinpointedShop(null)}
      />

      {/* Search Input */}
      <View className="mx-4 mt-3 flex-row items-center bg-white rounded-2xl px-4 py-2.5 border border-rose-200 mb-3">
        <Ionicons name="search" size={18} color="#E11D48" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search gifts, Nairobi areas, or shops..."
          placeholderTextColor="#9F1239"
          className="flex-1 ml-2.5 text-sm text-rose-950"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#FB7185" />
          </Pressable>
        )}
      </View>

      {/* Active Filter Chips */}
      {(selectedNeighborhood || selectedOccasion || selectedCategory) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 max-h-10 mb-2.5"
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
          {selectedCategory ? (
            <Pressable
              onPress={() => setSelectedCategory("")}
              className="flex-row items-center gap-1 bg-rose-100 border border-rose-300 px-3 py-1.5 rounded-full"
            >
              <Text className="text-xs font-bold text-rose-900">
                {selectedCategory}
              </Text>
              <Ionicons name="close" size={13} color="#9F1239" />
            </Pressable>
          ) : null}
          {selectedOccasion ? (
            <Pressable
              onPress={() => setSelectedOccasion("")}
              className="flex-row items-center gap-1 bg-rose-100 border border-rose-300 px-3 py-1.5 rounded-full"
            >
              <Text className="text-xs font-bold text-rose-900">
                {selectedOccasion}
              </Text>
              <Ionicons name="close" size={13} color="#9F1239" />
            </Pressable>
          ) : null}
          {selectedNeighborhood ? (
            <Pressable
              onPress={() => setSelectedNeighborhood("")}
              className="flex-row items-center gap-1 bg-rose-100 border border-rose-300 px-3 py-1.5 rounded-full"
            >
              <Text className="text-xs font-bold text-rose-900">
                {selectedNeighborhood}
              </Text>
              <Ionicons name="close" size={13} color="#9F1239" />
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {/* Budget Filter Row */}
      <Text className="mx-4 text-xs font-extrabold text-rose-950 uppercase tracking-wide mb-1.5">
        Budget ({formatKsh(500)} – {formatKsh(10000)})
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
          paddingBottom: Math.max(insets.bottom, 20) + 115,
        }}
        ListEmptyComponent={
          <View className="bg-white rounded-3xl p-8 mt-4 items-center border border-rose-100">
            <Ionicons name="gift-outline" size={32} color="#E11D48" />
            <Text className="text-base font-extrabold text-rose-950 mt-2">
              No Gifts in Catalog Yet
            </Text>
            <Text className="text-xs text-rose-700/75 text-center mt-1 leading-5">
              Connect your backend API or ask Black Santa for tailored gift
              recommendations and Nairobi shop pinpoints.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const saved = isSaved(item.id);
          return (
            <Animated.View
              entering={FadeInDown.delay(index * 55).springify()}
              layout={Layout.springify()}
            >
              <View className="bg-white rounded-3xl p-3 mb-3 border border-rose-100">
                <Pressable
                  onPress={() => router.push(`/(buyer)/gift/${item.id}`)}
                  className="flex-row items-center"
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      className={
                        isCompact
                          ? "w-20 h-20 rounded-2xl bg-rose-100"
                          : "w-24 h-24 rounded-2xl bg-rose-100"
                      }
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={
                        isCompact
                          ? "w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center"
                          : "w-24 h-24 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center"
                      }
                    >
                      <Ionicons name="gift" size={26} color="#E11D48" />
                    </View>
                  )}

                  <View className="flex-1 ml-3">
                    <Text className="text-[10px] font-bold text-rose-600 uppercase">
                      {item.category || "Gift"} • {item.neighborhood}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-sm font-extrabold text-rose-950 mt-0.5"
                    >
                      {item.title}
                    </Text>
                    <Text className="text-sm font-extrabold text-rose-700 mt-1">
                      {formatKsh(item.priceKsh)}
                    </Text>
                    <Text className="text-xs text-rose-800/70 mt-0.5">
                      {item.shopName}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#FB7185" />
                </Pressable>

                <View className="mt-3 pt-2.5 border-t border-rose-100 flex-row items-center gap-2">
                  <Pressable
                    onPress={() => handleToggleSave(item)}
                    className={`flex-row items-center justify-center gap-1 px-3 py-2 rounded-xl border ${
                      saved
                        ? "bg-rose-100 border-rose-300"
                        : "bg-rose-50/70 border-rose-200"
                    }`}
                  >
                    <Ionicons
                      name={saved ? "heart" : "heart-outline"}
                      size={15}
                      color="#E11D48"
                    />
                    <Text className="text-xs font-bold text-rose-950">
                      {saved ? "Saved" : "Save"}
                    </Text>
                  </Pressable>

                  {item.shopPhone ? (
                    <Pressable
                      onPress={() => handleWhatsAppOrder(item)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 bg-rose-600 active:bg-rose-700 px-3 py-2 rounded-xl"
                    >
                      <Ionicons
                        name="logo-whatsapp"
                        size={15}
                        color="#FFFFFF"
                      />
                      <Text className="text-xs font-extrabold text-white">
                        Order via +254
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}
