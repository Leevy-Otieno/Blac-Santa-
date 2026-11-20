import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ShopGiftItem {
  id: string;
  title: string;
  priceKsh: number;
  category: "For Him" | "For Her" | "Kids" | "Boss";
  occasion: "Christmas" | "Birthdays" | "Valentine's Day";
  ageGroup: string;
  imageUrl: string;
  inStock: boolean;
  isBestseller?: boolean;
}

interface PartnerShop {
  id: string;
  name: string;
  tagline: string;
  location: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  whatsappPhone: string;
  verified: boolean;
  bannerUrl: string;
  gifts: ShopGiftItem[];
}

const PARTNER_SHOPS: Record<string, PartnerShop> = {
  "shop-savanna-scents": {
    id: "shop-savanna-scents",
    name: "Savanna Scents & Hampers",
    tagline:
      "Luxury Valentine hampers, soy candles & bespoke gift boxes in Nairobi.",
    location: "Westlands, Nairobi",
    rating: 4.9,
    reviewCount: 148,
    responseTime: "Replies in ~5 mins",
    whatsappPhone: "254723456789",
    verified: true,
    bannerUrl:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1000",
    gifts: [
      {
        id: "gift-102",
        title: "Crimson Rose & Soy Candle Gift Box",
        priceKsh: 3200,
        category: "For Her",
        occasion: "Valentine's Day",
        ageGroup: "18–24",
        imageUrl:
          "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800",
        inStock: true,
        isBestseller: true,
      },
      {
        id: "gift-202",
        title: "Velvet Truffle & Perfume Hamper",
        priceKsh: 5800,
        category: "For Her",
        occasion: "Valentine's Day",
        ageGroup: "25–34",
        imageUrl:
          "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800",
        inStock: true,
        isBestseller: true,
      },
      {
        id: "gift-203",
        title: "Executive Oud & Leather Set",
        priceKsh: 4900,
        category: "For Him",
        occasion: "Birthdays",
        ageGroup: "25–34",
        imageUrl:
          "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
        inStock: true,
      },
      {
        id: "gift-204",
        title: "Golden Gratitude Desk Hamper",
        priceKsh: 7500,
        category: "Boss",
        occasion: "Christmas",
        ageGroup: "35+",
        imageUrl:
          "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
        inStock: true,
      },
    ],
  },
  "shop-nairobi-craft": {
    id: "shop-nairobi-craft",
    name: "Nairobi Craft Hub",
    tagline:
      "Handcrafted leather keepsakes, engraved wallets & corporate gifts.",
    location: "Kilimani, Nairobi",
    rating: 4.8,
    reviewCount: 96,
    responseTime: "Replies in ~10 mins",
    whatsappPhone: "254712345678",
    verified: true,
    bannerUrl:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1000",
    gifts: [
      {
        id: "gift-101",
        title: "Minimalist Engraved Leather Wallet",
        priceKsh: 2400,
        category: "For Him",
        occasion: "Birthdays",
        ageGroup: "25–34",
        imageUrl:
          "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
        inStock: true,
        isBestseller: true,
      },
      {
        id: "gift-302",
        title: "Monogrammed Travel Organizer",
        priceKsh: 3900,
        category: "Boss",
        occasion: "Christmas",
        ageGroup: "35+",
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
        inStock: true,
      },
    ],
  },
};

const FILTER_TABS = ["All", "For Her", "For Him", "Boss", "Kids"] as const;

function normalizeKenyanPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0") && digits.length === 10)
    return `254${digits.slice(1)}`;
  return digits;
}

export default function BuyerShopStorefrontScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shop =
    (shopId && PARTNER_SHOPS[shopId]) || PARTNER_SHOPS["shop-savanna-scents"];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedGiftIds, setSavedGiftIds] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const followScale = useSharedValue(1);
  const followAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: followScale.value }],
  }));

  const handleToggleFollow = () => {
    followScale.value = withSpring(0.92, { damping: 10 }, () => {
      followScale.value = withSpring(1);
    });
    setIsFollowing((prev) => !prev);
  };

  const toggleSaveGift = (giftId: string) => {
    setSavedGiftIds((prev) =>
      prev.includes(giftId)
        ? prev.filter((id) => id !== giftId)
        : [...prev, giftId],
    );
  };

  const openWhatsApp = async (customMessage: string) => {
    const phone = normalizeKenyanPhone(shop.whatsappPhone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        "WhatsApp Unavailable",
        "Please install WhatsApp to message this shop.",
      );
      return;
    }
    await Linking.openURL(url);
  };

  const visibleGifts = useMemo(() => {
    return shop.gifts.filter((gift) => {
      const matchesTab =
        selectedCategory === "All" || gift.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        gift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gift.occasion.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [shop.gifts, selectedCategory, searchQuery]);

  return (
    <ScrollView
      className="flex-1 bg-rose-50/60"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Banner & Crimson Gradient Overlay */}
      <Animated.View
        entering={FadeIn.duration(400)}
        className="relative h-52 w-full bg-rose-950"
      >
        <Image
          source={{ uri: shop.bannerUrl }}
          className="h-full w-full opacity-70"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-rose-950/45" />

        {/* Top Floating Navigation Bar */}
        <View className="absolute top-4 left-4 right-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={20} color="#881337" />
          </Pressable>

          <View className="flex-row items-center gap-2 bg-rose-600/95 px-3 py-1.5 rounded-full">
            <Ionicons name="gift" size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-bold tracking-wide">
              BLAC SANTA PARTNER
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Shop Profile Card */}
      <Animated.View
        entering={FadeInDown.delay(100).springify().damping(15)}
        className="mx-4 -mt-12 rounded-3xl bg-white p-5 shadow-md border border-rose-100"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xl font-extrabold text-rose-950">
                {shop.name}
              </Text>
              {shop.verified && (
                <Ionicons name="checkmark-circle" size={18} color="#E11D48" />
              )}
            </View>
            <Text className="text-xs text-rose-800/80 mt-1 leading-4">
              {shop.tagline}
            </Text>
          </View>

          <Animated.View style={followAnimatedStyle}>
            <Pressable
              onPress={handleToggleFollow}
              className={`px-4 py-2 rounded-full border ${
                isFollowing
                  ? "bg-rose-50 border-rose-300"
                  : "bg-rose-600 border-rose-600"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isFollowing ? "text-rose-700" : "text-white"
                }`}
              >
                {isFollowing ? "Following" : "+ Follow"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Shop Metrics Row */}
        <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-rose-100">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={15} color="#E11D48" />
            <Text className="text-xs font-bold text-rose-950">
              {shop.rating} ({shop.reviewCount})
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={15} color="#9F1239" />
            <Text className="text-xs font-medium text-rose-900">
              {shop.location}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={15} color="#059669" />
            <Text className="text-xs font-semibold text-emerald-700">
              {shop.responseTime}
            </Text>
          </View>
        </View>

        {/* Direct Shop Concierge WhatsApp CTA */}
        <Pressable
          onPress={() =>
            openWhatsApp(
              `Hi ${shop.name}, I'm browsing your gift storefront on BLAC SANTA and would love a custom gift recommendation!`,
            )
          }
          className="mt-4 flex-row items-center justify-center gap-2 bg-rose-50 border border-rose-200 py-3 rounded-2xl active:bg-rose-100"
        >
          <Ionicons name="logo-whatsapp" size={18} color="#E11D48" />
          <Text className="text-rose-700 text-xs font-bold">
            Ask Shop Advisor for Custom Gift Wrapping
          </Text>
        </Pressable>
      </Animated.View>

      {/* In-Shop Search Bar */}
      <Animated.View
        entering={FadeInDown.delay(180).duration(350)}
        className="mx-4 mt-4 flex-row items-center bg-white rounded-2xl px-4 py-2.5 border border-rose-200 shadow-xs"
      >
        <Ionicons name="search" size={18} color="#E11D48" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search inside ${shop.name}...`}
          placeholderTextColor="#FDA4AF"
          className="flex-1 ml-2.5 text-sm text-rose-950"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#FB7185" />
          </Pressable>
        )}
      </Animated.View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4 px-4"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {FILTER_TABS.map((tab, idx) => {
          const active = selectedCategory === tab;
          return (
            <Animated.View
              key={tab}
              entering={FadeInRight.delay(200 + idx * 50).springify()}
            >
              <Pressable
                onPress={() => setSelectedCategory(tab)}
                className={`mr-2 px-4 py-2 rounded-full border ${
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
                  {tab}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Catalog Header */}
      <View className="mx-4 mt-5 mb-3 flex-row items-center justify-between">
        <Text className="text-base font-extrabold text-rose-950">
          Curated Gift Catalog ({visibleGifts.length})
        </Text>
        <Text className="text-xs font-semibold text-rose-600">
          Ksh 500 – 10,000
        </Text>
      </View>

      {/* Gift Listings */}
      <View className="px-4 gap-3.5">
        {visibleGifts.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-rose-100">
            <Ionicons name="heart-dislike-outline" size={32} color="#FB7185" />
            <Text className="text-base font-bold text-rose-950 mt-2">
              No matching gifts found
            </Text>
            <Text className="text-xs text-rose-700/70 text-center mt-1">
              Try clearing your search or switching recipient categories above.
            </Text>
          </View>
        ) : (
          visibleGifts.map((gift, index) => {
            const isSaved = savedGiftIds.includes(gift.id);
            return (
              <Animated.View
                key={gift.id}
                entering={FadeInDown.delay(220 + index * 70).springify()}
                layout={Layout.springify()}
              >
                <Pressable
                  onPress={() => router.push(`/(buyer)/gift/${gift.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-xs"
                >
                  <View className="flex-row">
                    {/* Gift Image */}
                    <View className="relative w-32 h-36 bg-rose-100">
                      <Image
                        source={{ uri: gift.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {gift.isBestseller && (
                        <View className="absolute top-2 left-2 bg-rose-600 px-2 py-0.5 rounded-full">
                          <Text className="text-[10px] font-extrabold text-white uppercase">
                            Top Pick
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Gift Details & Direct WhatsApp Action */}
                    <View className="flex-1 p-3.5 justify-between">
                      <View>
                        <View className="flex-row items-start justify-between">
                          <Text className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">
                            {gift.category} • {gift.occasion}
                          </Text>
                          <Pressable
                            onPress={() => toggleSaveGift(gift.id)}
                            hitSlop={8}
                          >
                            <Ionicons
                              name={isSaved ? "heart" : "heart-outline"}
                              size={20}
                              color={isSaved ? "#E11D48" : "#FDA4AF"}
                            />
                          </Pressable>
                        </View>

                        <Text
                          numberOfLines={2}
                          className="text-sm font-extrabold text-rose-950 mt-1"
                        >
                          {gift.title}
                        </Text>

                        <Text className="text-base font-extrabold text-rose-700 mt-1">
                          Ksh {gift.priceKsh.toLocaleString()}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          openWhatsApp(
                            `Hi ${shop.name}, I found "${gift.title}" (Ksh ${gift.priceKsh.toLocaleString()}) on BLAC SANTA and would like to order it.`,
                          )
                        }
                        className="mt-2 flex-row items-center justify-center gap-1.5 bg-rose-600 active:bg-rose-700 py-2 px-3 rounded-xl"
                      >
                        <Ionicons
                          name="logo-whatsapp"
                          size={15}
                          color="#FFFFFF"
                        />
                        <Text className="text-white text-xs font-bold">
                          Order on WhatsApp
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
