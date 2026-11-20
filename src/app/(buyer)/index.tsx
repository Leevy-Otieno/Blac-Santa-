import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BuyerGiftProduct {
  id: string;
  title: string;
  priceKsh: number;
  shopId: string;
  shopName: string;
  shopPhone: string;
  category: "For Him" | "For Her" | "Kids" | "Boss";
  occasion: "Christmas" | "Birthdays" | "Valentine's Day";
  ageGroup: string;
  imageUrl: string;
  badge?: string;
}

export const BUYER_GIFTS: BuyerGiftProduct[] = [
  {
    id: "gift-102",
    title: "Crimson Rose & Soy Candle Gift Box",
    priceKsh: 3200,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    shopPhone: "254723456789",
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "18–24",
    imageUrl:
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=900",
    badge: "Valentine Pick",
  },
  {
    id: "gift-101",
    title: "Minimalist Engraved Leather Wallet",
    priceKsh: 2400,
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    shopPhone: "254712345678",
    category: "For Him",
    occasion: "Birthdays",
    ageGroup: "25–34",
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900",
    badge: "Bestseller",
  },
  {
    id: "gift-103",
    title: "Wooden STEM Building Blocks",
    priceKsh: 1850,
    shopId: "shop-little-minds",
    shopName: "Little Minds KE",
    shopPhone: "254734567890",
    category: "Kids",
    occasion: "Christmas",
    ageGroup: "6–12",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=900",
    badge: "Fun & Creative",
  },
  {
    id: "gift-104",
    title: "Executive Desk Flask & Gift Set",
    priceKsh: 4500,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    shopPhone: "254723456789",
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    imageUrl:
      "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=900",
    badge: "Executive",
  },
];

const CATEGORIES: {
  label: BuyerGiftProduct["category"];
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "For Him", icon: "man-outline" },
  { label: "For Her", icon: "woman-outline" },
  { label: "Kids", icon: "balloon-outline" },
  { label: "Boss", icon: "briefcase-outline" },
];

const OCCASIONS: BuyerGiftProduct["occasion"][] = [
  "Valentine's Day",
  "Birthdays",
  "Christmas",
];

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0") && digits.length === 10)
    return `254${digits.slice(1)}`;
  return digits;
}

export default function BuyerDiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(["gift-102"]);

  const filteredGifts = useMemo(() => {
    return BUYER_GIFTS.filter((item) => {
      const catMatch = selectedCategory
        ? item.category === selectedCategory
        : true;
      const occMatch = selectedOccasion
        ? item.occasion === selectedOccasion
        : true;
      return catMatch && occMatch;
    });
  }, [selectedCategory, selectedOccasion]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const quickOrderWhatsApp = async (gift: BuyerGiftProduct) => {
    const phone = normalizePhone(gift.shopPhone);
    const msg = `Hi ${gift.shopName}, I found "${gift.title}" (Ksh ${gift.priceKsh.toLocaleString()}) on BLAC SANTA and would like to order it.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        "WhatsApp Unavailable",
        "Unable to open WhatsApp on this device.",
      );
      return;
    }
    await Linking.openURL(url);
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
      {/* Top Brand Header */}
      <Animated.View
        entering={FadeIn.duration(350)}
        className="mx-4 flex-row items-center justify-between"
      >
        <View>
          <Text className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600">
            Nairobi • Ksh 500 – 10,000
          </Text>
          <Text className="text-2xl font-extrabold text-rose-950">
            BLAC SANTA
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(buyer)/search")}
          className="flex-row items-center gap-1.5 bg-white border border-rose-200 px-3.5 py-2 rounded-full shadow-xs"
        >
          <Ionicons name="options-outline" size={16} color="#E11D48" />
          <Text className="text-xs font-bold text-rose-900">Filter</Text>
        </Pressable>
      </Animated.View>

      {/* Crimson Gifty Hero Banner */}
      <Animated.View
        entering={FadeInDown.delay(90).springify().damping(15)}
        className="mx-4 mt-4 rounded-3xl bg-rose-950 p-5 overflow-hidden"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <View className="self-start bg-rose-600/30 border border-rose-400/40 px-2.5 py-1 rounded-full mb-2">
              <Text className="text-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
                Curated Gifting Concierge
              </Text>
            </View>
            <Text className="text-white text-xl font-extrabold leading-6">
              Find Thoughtful Gifts That Spark Joy
            </Text>
            <Text className="text-rose-200/80 text-xs mt-1.5 leading-4">
              Browse verified shops and order directly via WhatsApp in one tap.
            </Text>
          </View>

          <View className="h-14 w-14 rounded-2xl bg-rose-600 items-center justify-center">
            <Ionicons name="sparkles" size={26} color="#FFFFFF" />
          </View>
        </View>
      </Animated.View>

      {/* Recipient Categories */}
      <View className="mx-4 mt-5">
        <View className="flex-row items-center justify-between mb-2.5">
          <Text className="text-base font-extrabold text-rose-950">
            Who Are You Gifting?
          </Text>
          {selectedCategory && (
            <Pressable onPress={() => setSelectedCategory(null)}>
              <Text className="text-xs font-bold text-rose-600">Clear</Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-2.5">
          {CATEGORIES.map((cat, idx) => {
            const active = selectedCategory === cat.label;
            return (
              <Animated.View
                key={cat.label}
                entering={FadeInDown.delay(130 + idx * 50).springify()}
                style={{ width: isCompact ? "100%" : "48.5%" }}
              >
                <Pressable
                  onPress={() => setSelectedCategory(active ? null : cat.label)}
                  className={`flex-row items-center gap-2.5 p-3.5 rounded-2xl border ${
                    active
                      ? "bg-rose-600 border-rose-600"
                      : "bg-white border-rose-100"
                  }`}
                >
                  <Ionicons
                    name={cat.icon}
                    size={18}
                    color={active ? "#FFFFFF" : "#E11D48"}
                  />
                  <Text
                    className={`text-xs font-extrabold ${
                      active ? "text-white" : "text-rose-950"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Occasion Pills */}
      <View className="mt-5">
        <Text className="mx-4 text-base font-extrabold text-rose-950 mb-2.5">
          Shop by Occasion
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {OCCASIONS.map((occasion, idx) => {
            const active = selectedOccasion === occasion;
            return (
              <Animated.View
                key={occasion}
                entering={FadeInRight.delay(180 + idx * 55).springify()}
              >
                <Pressable
                  onPress={() => setSelectedOccasion(active ? null : occasion)}
                  className={`mr-2.5 px-4 py-2 rounded-full border ${
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
                    {occasion}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>

      {/* Featured Gift Cards */}
      <View className="mx-4 mt-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-extrabold text-rose-950">
            Featured Gifts ({filteredGifts.length})
          </Text>
          <Pressable onPress={() => router.push("/(buyer)/search")}>
            <Text className="text-xs font-bold text-rose-600">See All →</Text>
          </Pressable>
        </View>

        <View className="gap-3.5">
          {filteredGifts.map((gift, index) => {
            const saved = savedIds.includes(gift.id);
            return (
              <Animated.View
                key={gift.id}
                entering={FadeInDown.delay(220 + index * 65).springify()}
                layout={Layout.springify()}
              >
                <Pressable
                  onPress={() => router.push(`/(buyer)/gift/${gift.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-xs"
                >
                  <View className={isCompact ? "flex-col" : "flex-row"}>
                    <View
                      className={
                        isCompact
                          ? "w-full h-44 bg-rose-100"
                          : "w-32 h-36 bg-rose-100"
                      }
                    >
                      <Image
                        source={{ uri: gift.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {gift.badge && (
                        <View className="absolute top-2 left-2 bg-rose-600 px-2.5 py-0.5 rounded-full">
                          <Text className="text-[10px] font-extrabold text-white">
                            {gift.badge}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-1 p-3.5 justify-between">
                      <View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-[11px] font-bold text-rose-600 uppercase">
                            {gift.category} • {gift.occasion}
                          </Text>
                          <Pressable
                            onPress={() => toggleSaved(gift.id)}
                            hitSlop={8}
                          >
                            <Ionicons
                              name={saved ? "heart" : "heart-outline"}
                              size={19}
                              color={saved ? "#E11D48" : "#FDA4AF"}
                            />
                          </Pressable>
                        </View>

                        <Text
                          numberOfLines={2}
                          className="text-sm font-extrabold text-rose-950 mt-1"
                        >
                          {gift.title}
                        </Text>

                        <Pressable
                          onPress={() =>
                            router.push(`/(buyer)/shop/${gift.shopId}`)
                          }
                          className="mt-1"
                        >
                          <Text className="text-xs font-medium text-rose-700/80 underline">
                            {gift.shopName}
                          </Text>
                        </Pressable>
                      </View>

                      <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-rose-100">
                        <Text className="text-sm font-extrabold text-rose-700">
                          Ksh {gift.priceKsh.toLocaleString()}
                        </Text>

                        <Pressable
                          onPress={() => quickOrderWhatsApp(gift)}
                          className="flex-row items-center gap-1 bg-rose-600 active:bg-rose-700 px-3 py-1.5 rounded-xl"
                        >
                          <Ionicons
                            name="logo-whatsapp"
                            size={14}
                            color="#FFFFFF"
                          />
                          <Text className="text-white text-xs font-bold">
                            Order
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
