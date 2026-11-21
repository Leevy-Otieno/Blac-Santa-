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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdminRevenuePanel } from "../../components/AdminRevenuePanel";
import { useAdminRevenue } from "../../hooks/use-admin-revenue";
import { formatKsh } from "../../utils/format-ksh";

export default function AdminOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const {
    shops,
    commissionPercent,
    adminSummary,
    setCommissionPercent,
    toggleShopAvailability,
  } = useAdminRevenue({
    initialShops: [],
    initialOrders: [],
    defaultCommissionRate: 0.1,
  });

  const activeShopsCount = shops.filter((s) => s.isAvailable).length;

  return (
    <ScrollView
      className="flex-1 bg-rose-50/60"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 14),
        paddingBottom: Math.max(insets.bottom, 24) + 110,
      }}
    >
      {/* Top Header */}
      <Animated.View
        entering={FadeIn.duration(350)}
        className="mx-4 flex-row items-center justify-between gap-2"
      >
        <View className="flex-1 pr-2">
          <Text className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600">
            BLAC SANTA Control Tower
          </Text>
          <Text
            numberOfLines={1}
            className="text-2xl font-extrabold text-rose-950"
          >
            Platform Admin
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(admin)/onboard-shop")}
          className="flex-row items-center gap-1.5 bg-rose-600 active:bg-rose-700 px-3.5 py-2.5 rounded-2xl"
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text className="text-white text-xs font-extrabold">
            Onboard Shop
          </Text>
        </Pressable>
      </Animated.View>

      {/* Dark Crimson Admin Commission Banner */}
      <Animated.View
        entering={FadeInDown.delay(85).springify().damping(15)}
        className="mx-4 mt-4 rounded-3xl bg-rose-950 p-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <View className="self-start bg-rose-600/30 border border-rose-400/40 px-2.5 py-1 rounded-full mb-2">
              <Text className="text-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
                Admin Commission Earned
              </Text>
            </View>
            <Text className="text-white text-2xl font-extrabold">
              {formatKsh(adminSummary.totalPlatformCommissionKsh)}
            </Text>
            <Text className="text-rose-200/80 text-xs mt-1 leading-4">
              {shops.length} shops ({activeShopsCount} active) •{" "}
              {adminSummary.totalOrders} orders • Gross{" "}
              {formatKsh(adminSummary.grossMarketplaceVolumeKsh)}
            </Text>
          </View>

          <View className="h-14 w-14 rounded-2xl bg-rose-600 items-center justify-center">
            <Ionicons name="ribbon" size={26} color="#FFFFFF" />
          </View>
        </View>
      </Animated.View>

      {/* KPI Cards */}
      <Animated.View
        entering={FadeInDown.delay(140).springify()}
        className={`mx-4 mt-4 ${
          isCompact ? "gap-2.5" : "flex-row justify-between gap-3"
        }`}
      >
        <View className="flex-1 bg-white rounded-3xl p-4 border border-rose-100">
          <Text className="text-[11px] font-bold text-rose-500 uppercase">
            Shop Payouts
          </Text>
          <Text
            numberOfLines={1}
            className="text-base font-extrabold text-rose-950 mt-1"
          >
            {formatKsh(adminSummary.totalShopPayoutsKsh)}
          </Text>
          <Text className="text-[11px] text-rose-700/75 mt-0.5">
            Net revenue across shops
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-3xl p-4 border border-rose-100">
          <Text className="text-[11px] font-bold text-rose-500 uppercase">
            Commission Rate
          </Text>
          <Text className="text-base font-extrabold text-rose-950 mt-1">
            {commissionPercent}%
          </Text>
          <Pressable onPress={() => router.push("/(admin)/shops")}>
            <Text className="text-[11px] font-bold text-rose-600 mt-0.5">
              View all shops →
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Full Admin Commission, Commission Presets & Per-Shop Breakdown */}
      <View className="mt-2">
        <AdminRevenuePanel
          shops={shops}
          summary={adminSummary}
          commissionPercent={commissionPercent}
          onChangeCommissionPercent={setCommissionPercent}
          onToggleShopAvailability={toggleShopAvailability}
        />
      </View>
    </ScrollView>
  );
}