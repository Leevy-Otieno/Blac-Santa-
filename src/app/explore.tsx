import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CURATED_GUIDES = [
  {
    id: "valentine",
    title: "Valentine's Day Romantic Edit",
    subtitle: "Rose boxes, soy candles, perfumes & keepsake hampers",
    budgetTag: "Ksh 1,500 – 8,500",
    icon: "heart" as const,
  },
  {
    id: "birthday",
    title: "Last-Minute Same-Day Birthdays",
    subtitle: "Ready-to-dispatch Nairobi gifts with handwritten cards",
    budgetTag: "Ksh 1,000 – 6,000",
    icon: "balloon" as const,
  },
  {
    id: "corporate",
    title: "Executive & Boss Appreciation",
    subtitle: "Leather desk organizers, insulated flasks & gourmet sets",
    budgetTag: "Ksh 3,500 – 10,000",
    icon: "briefcase" as const,
  },
  {
    id: "kids",
    title: "Creative Kids & STEM Play",
    subtitle: "Educational wooden sets, plush companions & art kits",
    budgetTag: "Ksh 500 – 4,000",
    icon: "sparkles" as const,
  },
];

const NAIROBI_ZONES = [
  "Westlands",
  "Kilimani",
  "CBD",
  "Karen",
  "Lavington",
  "Kileleshwa",
];

export default function ExploreHubScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  return (
    <ScrollView
      className="flex-1 bg-rose-50/70"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 14),
        paddingHorizontal: 16,
        paddingBottom: Math.max(insets.bottom, 24) + 16,
      }}
    >
      {/* Top Bar */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-white border border-rose-200 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={18} color="#881337" />
        </Pressable>

        <Text className="text-base font-extrabold text-rose-950">
          Gifting Inspiration Hub
        </Text>

        <Pressable
          onPress={() => router.replace("/(buyer)/search")}
          className="h-10 w-10 rounded-full bg-rose-600 items-center justify-center"
        >
          <Ionicons name="search" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Curated Occasion Guides */}
      <Text className="text-sm font-extrabold text-rose-950 uppercase tracking-wide mb-2.5">
        Curated Gift Guides
      </Text>

      <View className="gap-3 mb-5">
        {CURATED_GUIDES.map((guide, index) => (
          <Animated.View
            key={guide.id}
            entering={FadeInDown.delay(70 + index * 60).springify()}
          >
            <Pressable
              onPress={() => router.push("/(buyer)/search")}
              className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center">
                    <Ionicons name={guide.icon} size={20} color="#E11D48" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-rose-950">
                      {guide.title}
                    </Text>
                    <Text className="text-xs text-rose-700/80 mt-0.5 leading-4">
                      {guide.subtitle}
                    </Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#E11D48" />
              </View>

              <View className="mt-3 pt-2.5 border-t border-rose-100 flex-row items-center justify-between">
                <Text className="text-[11px] font-bold text-rose-600">
                  {guide.budgetTag}
                </Text>
                <Text className="text-[11px] font-semibold text-emerald-700">
                  • Verified WhatsApp Shops
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* Fast Dispatch Zones */}
      <Text className="text-sm font-extrabold text-rose-950 uppercase tracking-wide mb-2.5">
        Same-Day Nairobi Dispatch Hubs
      </Text>

      <View className="flex-row flex-wrap gap-2 mb-5">
        {NAIROBI_ZONES.map((zone, idx) => (
          <Animated.View
            key={zone}
            entering={FadeInRight.delay(200 + idx * 45).springify()}
          >
            <Pressable
              onPress={() => router.push("/(buyer)/search")}
              className="flex-row items-center gap-1.5 bg-white border border-rose-200 px-3.5 py-2 rounded-full"
            >
              <Ionicons name="location" size={13} color="#E11D48" />
              <Text className="text-xs font-bold text-rose-950">{zone}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* Merchant CTA Banner */}
      <View
        className={`rounded-3xl bg-rose-950 p-5 ${
          isCompact ? "flex-col gap-3" : "flex-row items-center justify-between"
        }`}
      >
        <View className="flex-1 pr-2">
          <Text className="text-white text-base font-extrabold">
            Own a Gift Shop in Kenya?
          </Text>
          <Text className="text-rose-200/80 text-xs mt-1 leading-4">
            List gifts between Ksh 500 and Ksh 10,000 and receive direct buyer
            orders on WhatsApp.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          className="bg-rose-600 active:bg-rose-700 px-4 py-3 rounded-2xl items-center"
        >
          <Text className="text-white text-xs font-extrabold">
            Partner Portal
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
