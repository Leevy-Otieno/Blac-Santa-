import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface AdminShopItem {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  location: string;
  status: "Active" | "Pending" | "Suspended";
  giftCount: number;
  whatsappClicks: number;
}

export const INITIAL_ADMIN_SHOPS: AdminShopItem[] = [
  {
    id: "shop-savanna-scents",
    name: "Savanna Scents & Hampers",
    ownerName: "Amina Wanjiku",
    ownerPhone: "+254723456789",
    location: "Westlands, Nairobi",
    status: "Active",
    giftCount: 18,
    whatsappClicks: 140,
  },
  {
    id: "shop-nairobi-craft",
    name: "Nairobi Craft Hub",
    ownerName: "Brian Kamau",
    ownerPhone: "+254712345678",
    location: "Kilimani, Nairobi",
    status: "Active",
    giftCount: 12,
    whatsappClicks: 96,
  },
  {
    id: "shop-velvet-bloom",
    name: "Velvet Bloom Florals & Gifts",
    ownerName: "Faith Njeri",
    ownerPhone: "+254798112233",
    location: "CBD / Moi Ave, Nairobi",
    status: "Pending",
    giftCount: 6,
    whatsappClicks: 0,
  },
];

export default function AdminOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [shops, setShops] = useState<AdminShopItem[]>(INITIAL_ADMIN_SHOPS);

  const pendingShops = shops.filter((s) => s.status === "Pending");
  const totalClicks = shops.reduce((sum, s) => sum + s.whatsappClicks, 0);

  const approveShop = (shopId: string, shopName: string) => {
    setShops((prev) =>
      prev.map((item) =>
        item.id === shopId ? { ...item, status: "Active" } : item,
      ),
    );
    Alert.alert("Shop Approved", `${shopName} is now live on BLAC SANTA.`);
  };

  return (
    <ScrollView
      className="flex-1 bg-rose-50/60"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 14),
        paddingBottom: Math.max(insets.bottom, 24) + 16,
      }}
    >
      {/* Top Header */}
      <Animated.View
        entering={FadeIn.duration(350)}
        className="mx-4 flex-row items-center justify-between"
      >
        <View>
          <Text className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600">
            BLAC SANTA Control Tower
          </Text>
          <Text className="text-2xl font-extrabold text-rose-950">
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

      {/* Dark Crimson Platform Banner */}
      <Animated.View
        entering={FadeInDown.delay(85).springify().damping(15)}
        className="mx-4 mt-4 rounded-3xl bg-rose-950 p-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <View className="self-start bg-rose-600/30 border border-rose-400/40 px-2.5 py-1 rounded-full mb-2">
              <Text className="text-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
                Marketplace Pulse
              </Text>
            </View>
            <Text className="text-white text-2xl font-extrabold">
              {totalClicks} WhatsApp Leads
            </Text>
            <Text className="text-rose-200/80 text-xs mt-1 leading-4">
              {shops.length} registered shops • {pendingShops.length} awaiting
              approval
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
            Pending Shops
          </Text>
          <Text className="text-xl font-extrabold text-rose-950 mt-1">
            {pendingShops.length}
          </Text>
          <Text className="text-[11px] text-rose-700/75 mt-0.5">
            Requires review
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-3xl p-4 border border-rose-100">
          <Text className="text-[11px] font-bold text-rose-500 uppercase">
            Budget Window
          </Text>
          <Text className="text-sm font-extrabold text-rose-950 mt-1.5">
            Ksh 500 – 10,000
          </Text>
          <Text className="text-[11px] text-rose-700/75 mt-0.5">
            Enforced across catalog
          </Text>
        </View>
      </Animated.View>

      {/* Pending Approvals Queue */}
      <View className="mx-4 mt-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-extrabold text-rose-950">
            Pending Shop Approvals
          </Text>
          <Pressable onPress={() => router.push("/(admin)/shops")}>
            <Text className="text-xs font-bold text-rose-600">All Shops →</Text>
          </Pressable>
        </View>

        {pendingShops.length === 0 ? (
          <View className="bg-white rounded-3xl p-6 items-center border border-rose-100">
            <Ionicons name="checkmark-done-circle" size={30} color="#E11D48" />
            <Text className="text-sm font-extrabold text-rose-950 mt-2">
              All Shop Applications Reviewed
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {pendingShops.map((shop, idx) => (
              <Animated.View
                key={shop.id}
                entering={FadeInDown.delay(190 + idx * 60).springify()}
              >
                <View className="bg-white rounded-3xl p-4 border border-rose-100">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-extrabold text-rose-950">
                        {shop.name}
                      </Text>
                      <Text className="text-xs text-rose-700/80 mt-0.5">
                        Owner: {shop.ownerName} • {shop.location}
                      </Text>
                      <Text className="text-xs text-rose-600 font-semibold mt-0.5">
                        {shop.ownerPhone} • {shop.giftCount} starter gifts
                      </Text>
                    </View>

                    <View className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Text className="text-[10px] font-extrabold text-amber-800">
                        Pending
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2.5 mt-3.5 pt-3 border-t border-rose-100">
                    <Pressable
                      onPress={() => approveShop(shop.id, shop.name)}
                      className="flex-1 bg-rose-600 active:bg-rose-700 py-2.5 rounded-xl items-center"
                    >
                      <Text className="text-white text-xs font-extrabold">
                        Approve & Go Live
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push("/(admin)/shops")}
                      className="bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl"
                    >
                      <Text className="text-rose-800 text-xs font-bold">
                        Inspect
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
