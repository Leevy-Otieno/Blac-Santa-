import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PinpointedShopBanner } from "../components/PinpointedShopBanner";
import { BlackSantaPinpointedShop } from "../types/marketplace.types";
import { formatKsh } from "../utils/format-ksh";

interface OccasionGuide {
  id: string;
  title: string;
  subtitle: string;
  occasionParam: string;
  minKsh: number;
  maxKsh: number;
  icon: "heart" | "balloon" | "briefcase" | "sparkles";
}

const OCCASION_GUIDES: OccasionGuide[] = [
  {
    id: "valentine",
    title: "Valentine's Day Romantic Edit",
    subtitle: "Rose boxes, soy candles, perfumes & keepsake hampers",
    occasionParam: "Valentine's Day",
    minKsh: 1500,
    maxKsh: 8500,
    icon: "heart",
  },
  {
    id: "birthday",
    title: "Last-Minute Same-Day Birthdays",
    subtitle: "Ready-to-dispatch Nairobi gifts with handwritten cards",
    occasionParam: "Birthdays",
    minKsh: 1000,
    maxKsh: 6000,
    icon: "balloon",
  },
  {
    id: "corporate",
    title: "Executive & Boss Appreciation",
    subtitle: "Leather desk organizers, insulated flasks & gourmet sets",
    occasionParam: "Corporate",
    minKsh: 3500,
    maxKsh: 10000,
    icon: "briefcase",
  },
  {
    id: "kids",
    title: "Creative Kids & STEM Play",
    subtitle: "Educational wooden sets, plush companions & art kits",
    occasionParam: "Kids",
    minKsh: 500,
    maxKsh: 4000,
    icon: "sparkles",
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
  const isWide = width >= 768;

  const params = useLocalSearchParams<{
    shopId?: string;
    shopName?: string;
    neighborhood?: string;
    phone?: string;
    reason?: string;
  }>();

  const [pinpointedShop, setPinpointedShop] =
    useState<BlackSantaPinpointedShop | null>(null);

  useEffect(() => {
    if (params.shopName || params.shopId) {
      setPinpointedShop({
        shopId: params.shopId || params.shopName || "pinpointed-shop",
        shopName: params.shopName || "Selected Shop",
        neighborhood: params.neighborhood || "Nairobi",
        phone: params.phone || "",
        reason:
          params.reason ||
          `Pinpointed from Black Santa / Wishlist in ${params.neighborhood || "Nairobi"}.`,
      });
    }
  }, [
    params.neighborhood,
    params.phone,
    params.reason,
    params.shopId,
    params.shopName,
  ]);

  const openSearchWithGuide = (guide: OccasionGuide) => {
    router.push({
      pathname: "/(buyer)/search",
      params: {
        occasion: guide.occasionParam,
        minKsh: String(guide.minKsh),
        maxKsh: String(guide.maxKsh),
        ...(pinpointedShop ? { shopId: pinpointedShop.shopId } : {}),
      },
    });
  };

  const openSearchWithZone = (zone: string) => {
    router.push({
      pathname: "/(buyer)/search",
      params: {
        neighborhood: zone,
        ...(pinpointedShop ? { shopId: pinpointedShop.shopId } : {}),
      },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-rose-50/70"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 14),
        paddingBottom: Math.max(insets.bottom, 24) + 110,
      }}
    >
      <View className={isWide ? "w-full max-w-4xl self-center" : "w-full"}>
        {/* Top Bar */}
        <View className="px-4 flex-row items-center justify-between mb-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            className="h-10 w-10 rounded-full bg-white border border-rose-200 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={18} color="#881337" />
          </Pressable>

          <Text
            numberOfLines={1}
            className="text-base font-extrabold text-rose-950"
          >
            Gifting Inspiration Hub
          </Text>

          <Pressable
            onPress={() => router.replace("/(buyer)/search")}
            accessibilityLabel="Search gifts and shops"
            className="h-10 w-10 rounded-full bg-rose-600 items-center justify-center"
          >
            <Ionicons name="search" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Active Pinpointed Shop Banner (when navigated via handlePinpointShop) */}
        <PinpointedShopBanner
          shop={pinpointedShop}
          onClear={() => setPinpointedShop(null)}
        />

        {/* Curated Occasion Guides */}
        <View className="px-4 mt-4">
          <Text className="text-sm font-extrabold text-rose-950 uppercase tracking-wide mb-2.5">
            Curated Gift Guides
          </Text>

          <View className={isWide ? "flex-row flex-wrap gap-3" : "gap-3"}>
            {OCCASION_GUIDES.map((guide, index) => (
              <Animated.View
                key={guide.id}
                entering={FadeInDown.delay(70 + index * 60).springify()}
                className={isWide ? "w-[48.8%]" : "w-full"}
              >
                <Pressable
                  onPress={() => openSearchWithGuide(guide)}
                  className="bg-white rounded-3xl p-4 border border-rose-100"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center shrink-0">
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

                  <View className="mt-3 pt-2.5 border-t border-rose-100 flex-row items-center justify-between gap-2">
                    <Text className="text-[11px] font-bold text-rose-600">
                      {formatKsh(guide.minKsh)} – {formatKsh(guide.maxKsh)}
                    </Text>
                    <Text className="text-[11px] font-semibold text-emerald-700">
                      +254 WhatsApp Shops
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Fast Dispatch Zones */}
        <View className="px-4 mt-5">
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
                  onPress={() => openSearchWithZone(zone)}
                  className="flex-row items-center gap-1.5 bg-white border border-rose-200 px-3.5 py-2 rounded-full"
                >
                  <Ionicons name="location" size={13} color="#E11D48" />
                  <Text className="text-xs font-bold text-rose-950">
                    {zone}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Merchant CTA Banner */}
        <View className="px-4">
          <View
            className={`rounded-3xl bg-rose-950 p-5 ${
              isCompact
                ? "flex-col gap-3"
                : "flex-row items-center justify-between gap-3"
            }`}
          >
            <View className="flex-1">
              <Text className="text-white text-base font-extrabold">
                Own a Gift Shop in Kenya?
              </Text>
              <Text className="text-rose-200/80 text-xs mt-1 leading-4">
                List gifts between {formatKsh(500)} and {formatKsh(10000)} and
                receive direct buyer orders on WhatsApp.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/sign-in")}
              className="bg-rose-600 active:bg-rose-700 px-4 py-3 rounded-2xl items-center shrink-0"
            >
              <Text className="text-white text-xs font-extrabold">
                Partner Portal
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
