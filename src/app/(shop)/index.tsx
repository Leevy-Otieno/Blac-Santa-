import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ShopGiftRecord {
  id: string;
  title: string;
  priceKsh: number;
  category: "For Him" | "For Her" | "Kids" | "Boss";
  occasion: "Christmas" | "Birthdays" | "Valentine's Day";
  ageGroup: string;
  imageUrl: string;
  inStock: boolean;
  whatsappClicks: number;
}

export const INITIAL_SHOP_GIFTS: ShopGiftRecord[] = [
  {
    id: "gift-102",
    title: "Crimson Rose & Soy Candle Gift Box",
    priceKsh: 3200,
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "18–24",
    imageUrl:
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=900",
    inStock: true,
    whatsappClicks: 64,
  },
  {
    id: "gift-202",
    title: "Velvet Truffle & Perfume Hamper",
    priceKsh: 5800,
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "25–34",
    imageUrl:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900",
    inStock: true,
    whatsappClicks: 49,
  },
  {
    id: "gift-204",
    title: "Golden Gratitude Desk Hamper",
    priceKsh: 7500,
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    imageUrl:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900",
    inStock: false,
    whatsappClicks: 27,
  },
];

export default function ShopDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const totalClicks = INITIAL_SHOP_GIFTS.reduce(
    (sum, item) => sum + item.whatsappClicks,
    0,
  );
  const activeCount = INITIAL_SHOP_GIFTS.filter((item) => item.inStock).length;

  return (
    <ScrollView
      className="flex-1 bg-rose-50/60"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 14),
        paddingBottom: Math.max(insets.bottom, 24) + 16,
      }}
    >
      {/* Shop Header */}
      <Animated.View
        entering={FadeIn.duration(350)}
        className="mx-4 flex-row items-center justify-between"
      >
        <View className="flex-1 pr-2">
          <Text className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600">
            BLAC SANTA Partner Merchant
          </Text>
          <Text className="text-2xl font-extrabold text-rose-950">
            Savanna Scents & Hampers
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(shop)/add-gift")}
          className="flex-row items-center gap-1.5 bg-rose-600 active:bg-rose-700 px-3.5 py-2.5 rounded-2xl"
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text className="text-white text-xs font-extrabold">New Gift</Text>
        </Pressable>
      </Animated.View>

      {/* Hero Performance Banner */}
      <Animated.View
        entering={FadeInDown.delay(90).springify().damping(15)}
        className="mx-4 mt-4 rounded-3xl bg-rose-950 p-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <View className="self-start bg-rose-600/30 border border-rose-400/40 px-2.5 py-1 rounded-full mb-2">
              <Text className="text-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
                WhatsApp Order Intent
              </Text>
            </View>
            <Text className="text-white text-2xl font-extrabold">
              {totalClicks} Order Clicks
            </Text>
            <Text className="text-rose-200/80 text-xs mt-1 leading-4">
              Buyers tapped Order via WhatsApp on your high-res gift listings.
            </Text>
          </View>

          <View className="h-14 w-14 rounded-2xl bg-rose-600 items-center justify-center">
            <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
          </View>
        </View>
      </Animated.View>

      {/* KPI Grid */}
      <Animated.View
        entering={FadeInDown.delay(150).springify()}
        className={`mx-4 mt-4 ${
          isCompact ? "gap-2.5" : "flex-row justify-between gap-3"
        }`}
      >
        <View className="flex-1 bg-white rounded-3xl p-4 border border-rose-100">
          <Text className="text-[11px] font-bold text-rose-500 uppercase">
            Active Gifts
          </Text>
          <Text className="text-xl font-extrabold text-rose-950 mt-1">
            {activeCount} / {INITIAL_SHOP_GIFTS.length}
          </Text>
          <Text className="text-[11px] text-rose-700/75 mt-0.5">
            In Ksh 500 – 10,000 range
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-3xl p-4 border border-rose-100">
          <Text className="text-[11px] font-bold text-rose-500 uppercase">
            WhatsApp Line
          </Text>
          <Text className="text-sm font-extrabold text-rose-950 mt-1.5">
            +254 723 456 789
          </Text>
          <Pressable onPress={() => router.push("/(shop)/settings")}>
            <Text className="text-[11px] font-bold text-rose-600 mt-1">
              Update number →
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Top Performing Gifts */}
      <View className="mx-4 mt-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-extrabold text-rose-950">
            Top Gift Listings
          </Text>
          <Pressable onPress={() => router.push("/(shop)/listings")}>
            <Text className="text-xs font-bold text-rose-600">
              Manage All →
            </Text>
          </Pressable>
        </View>

        <View className="gap-3">
          {INITIAL_SHOP_GIFTS.map((gift, index) => (
            <Animated.View
              key={gift.id}
              entering={FadeInDown.delay(200 + index * 60).springify()}
            >
              <Pressable
                onPress={() => router.push(`/(shop)/edit-gift/${gift.id}`)}
                className="flex-row items-center bg-white rounded-3xl p-3 border border-rose-100"
              >
                <Image
                  source={{ uri: gift.imageUrl }}
                  className="w-16 h-16 rounded-2xl bg-rose-100"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text
                    numberOfLines={1}
                    className="text-sm font-extrabold text-rose-950"
                  >
                    {gift.title}
                  </Text>
                  <Text className="text-xs font-bold text-rose-600 mt-0.5">
                    Ksh {gift.priceKsh.toLocaleString()} • {gift.whatsappClicks}{" "}
                    clicks
                  </Text>
                </View>
                <Ionicons name="create-outline" size={20} color="#E11D48" />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
