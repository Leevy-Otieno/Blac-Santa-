import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface GiftDetailItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  priceKsh: number;
  shopId: string;
  shopName: string;
  shopLocation: string;
  shopRating: number;
  shopPhone: string;
  category: "For Him" | "For Her" | "Kids" | "Boss";
  occasion: "Christmas" | "Birthdays" | "Valentine's Day";
  ageGroup: string;
  deliveryEstimate: string;
  inStock: boolean;
  highlights: string[];
  gallery: string[];
}

const GIFT_CATALOG: Record<string, GiftDetailItem> = {
  "gift-102": {
    id: "gift-102",
    title: "Crimson Rose & Soy Candle Gift Box",
    subtitle: "Hand-poured botanical wax with velvet ribbon keepsake packaging",
    description:
      "Crafted in small batches for romantic evenings, birthdays, and festive celebrations. Blends damask rose, warm amber, and cedarwood with a clean 45-hour burn time.",
    priceKsh: 3200,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    shopLocation: "Westlands, Nairobi",
    shopRating: 4.9,
    shopPhone: "254723456789",
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "18–24",
    deliveryEstimate: "Same-day dispatch in Nairobi",
    inStock: true,
    highlights: [
      "100% natural soy & coconut wax blend",
      "Complimentary handwritten gift card included",
      "Reusable luxury crimson presentation box",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=1000",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1000",
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1000",
    ],
  },
  "gift-101": {
    id: "gift-101",
    title: "Minimalist Engraved Leather Wallet",
    subtitle: "Full-grain bifold wallet with slim card slots & gift wrap",
    description:
      "Designed for everyday carry with 6 card slots, flat bill compartment, and reinforced stitching that ages with character.",
    priceKsh: 2400,
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    shopLocation: "Kilimani, Nairobi",
    shopRating: 4.8,
    shopPhone: "254712345678",
    category: "For Him",
    occasion: "Birthdays",
    ageGroup: "25–34",
    deliveryEstimate: "Next-day delivery across Nairobi",
    inStock: true,
    highlights: [
      "Slim profile fits front or jacket pockets",
      "Custom gift note option on WhatsApp",
      "Tested for durability and clean edges",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000",
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1000",
    ],
  },
};

const WRAP_OPTIONS = [
  { id: "classic-crimson", label: "Crimson Ribbon Wrap", extraKsh: 0 },
  { id: "velvet-keepsake", label: "Velvet Keepsake Box", extraKsh: 500 },
  { id: "card-bundle", label: "Rose + Handwritten Note", extraKsh: 250 },
] as const;

function normalizeKenyanPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0") && digits.length === 10)
    return `254${digits.slice(1)}`;
  return digits;
}

export default function GiftDetailScreen() {
  const { giftId } = useLocalSearchParams<{ giftId: string }>();
  const gift = (giftId && GIFT_CATALOG[giftId]) || GIFT_CATALOG["gift-102"];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedWrapId, setSelectedWrapId] =
    useState<string>("classic-crimson");
  const [giftNote, setGiftNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const heartScale = useSharedValue(1);
  const ctaScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const selectedWrap = useMemo(
    () => WRAP_OPTIONS.find((w) => w.id === selectedWrapId) ?? WRAP_OPTIONS[0],
    [selectedWrapId],
  );

  const totalPriceKsh = gift.priceKsh + selectedWrap.extraKsh;

  const handleToggleSave = () => {
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 12 }),
    );
    setIsSaved((prev) => !prev);
  };

  const handleShareGift = async () => {
    try {
      await Share.share({
        message: `Check out "${gift.title}" (Ksh ${totalPriceKsh.toLocaleString()}) from ${gift.shopName} on BLAC SANTA!`,
      });
    } catch {
      Alert.alert("Share Cancelled", "Could not open the share sheet.");
    }
  };

  const handleWhatsAppOrder = async () => {
    ctaScale.value = withSequence(
      withSpring(0.96, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );

    const phone = normalizeKenyanPhone(gift.shopPhone);
    const noteLine = giftNote.trim()
      ? `\nGift Card Note: "${giftNote.trim()}"`
      : "";
    const message =
      `Hi ${gift.shopName}, I found "${gift.title}" on BLAC SANTA and would like to order it.\n` +
      `• Item Price: Ksh ${gift.priceKsh.toLocaleString()}\n` +
      `• Packaging: ${selectedWrap.label} (${
        selectedWrap.extraKsh > 0
          ? `+Ksh ${selectedWrap.extraKsh.toLocaleString()}`
          : "Included"
      })\n` +
      `• Total: Ksh ${totalPriceKsh.toLocaleString()}` +
      noteLine;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        "WhatsApp Unavailable",
        "Please install WhatsApp to place your order.",
      );
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-rose-50/60">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* High-Resolution Image Gallery */}
        <Animated.View
          entering={FadeIn.duration(350)}
          className="relative bg-rose-950"
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
          >
            {gift.gallery.map((uri, idx) => (
              <Image
                key={`${gift.id}-img-${idx}`}
                source={{ uri }}
                style={{ width, height: 340 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <View className="absolute inset-0 pointer-events-none bg-rose-950/15" />

          {/* Floating Top Header Controls */}
          <View className="absolute top-12 left-4 right-4 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 rounded-full bg-white/95 items-center justify-center shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#881337" />
            </Pressable>

            <View className="flex-row items-center gap-2.5">
              <Pressable
                onPress={handleShareGift}
                className="h-10 w-10 rounded-full bg-white/95 items-center justify-center shadow-sm"
              >
                <Ionicons
                  name="share-social-outline"
                  size={19}
                  color="#881337"
                />
              </Pressable>

              <Animated.View style={heartAnimatedStyle}>
                <Pressable
                  onPress={handleToggleSave}
                  className="h-10 w-10 rounded-full bg-white/95 items-center justify-center shadow-sm"
                >
                  <Ionicons
                    name={isSaved ? "heart" : "heart-outline"}
                    size={20}
                    color="#E11D48"
                  />
                </Pressable>
              </Animated.View>
            </View>
          </View>

          {/* Gallery Pagination Dots */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {gift.gallery.map((_, idx) => {
              const active = idx === activeImageIndex;
              return (
                <View
                  key={`dot-${idx}`}
                  className={`h-2 rounded-full ${
                    active ? "w-6 bg-rose-500" : "w-2 bg-white/70"
                  }`}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Main Gift Details Sheet */}
        <Animated.View
          entering={FadeInDown.delay(100).springify().damping(15)}
          className="mx-4 mt-4 rounded-3xl bg-white p-5 border border-rose-100 shadow-xs"
        >
          {/* Occasion & Recipient Tags */}
          <View className="flex-row flex-wrap items-center gap-2 mb-2.5">
            <View className="bg-rose-600 px-3 py-1 rounded-full">
              <Text className="text-white text-[11px] font-bold">
                {gift.occasion}
              </Text>
            </View>
            <View className="bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              <Text className="text-rose-800 text-[11px] font-bold">
                {gift.category}
              </Text>
            </View>
            <View className="bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              <Text className="text-rose-800 text-[11px] font-semibold">
                Age {gift.ageGroup}
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-extrabold text-rose-950 leading-7">
            {gift.title}
          </Text>
          <Text className="text-xs text-rose-700/80 mt-1 leading-4">
            {gift.subtitle}
          </Text>

          {/* Price & Availability Row */}
          <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-rose-100">
            <View>
              <Text className="text-[11px] font-semibold text-rose-500 uppercase">
                Gift Price
              </Text>
              <Text className="text-2xl font-extrabold text-rose-600">
                Ksh {gift.priceKsh.toLocaleString()}
              </Text>
            </View>

            <View className="items-end">
              <View className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <View className="h-2 w-2 rounded-full bg-emerald-600" />
                <Text className="text-xs font-bold text-emerald-700">
                  {gift.inStock ? "Ready to Gift" : "Out of Stock"}
                </Text>
              </View>
              <Text className="text-[11px] text-rose-800/70 mt-1">
                {gift.deliveryEstimate}
              </Text>
            </View>
          </View>

          <Text className="text-sm text-rose-950/85 mt-4 leading-5">
            {gift.description}
          </Text>

          {/* Gift Highlights */}
          <View className="mt-4 pt-4 border-t border-rose-100 gap-2">
            {gift.highlights.map((point) => (
              <View key={point} className="flex-row items-center gap-2">
                <Ionicons name="sparkles" size={14} color="#E11D48" />
                <Text className="text-xs font-medium text-rose-950 flex-1">
                  {point}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Gifting Personalization & Gift Wrap Selector */}
        <Animated.View
          entering={FadeInDown.delay(180).springify().damping(15)}
          className="mx-4 mt-4 rounded-3xl bg-white p-5 border border-rose-100 shadow-xs"
        >
          <Text className="text-base font-extrabold text-rose-950 mb-1">
            Gift Wrap & Personal Touch
          </Text>
          <Text className="text-xs text-rose-700/75 mb-3">
            Customize your presentation before sending the order on WhatsApp.
          </Text>

          <View className="gap-2.5">
            {WRAP_OPTIONS.map((option, idx) => {
              const selected = option.id === selectedWrapId;
              return (
                <Animated.View
                  key={option.id}
                  entering={FadeInRight.delay(200 + idx * 50)}
                >
                  <Pressable
                    onPress={() => setSelectedWrapId(option.id)}
                    className={`flex-row items-center justify-between p-3.5 rounded-2xl border ${
                      selected
                        ? "bg-rose-50 border-rose-600"
                        : "bg-white border-rose-100"
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <Ionicons
                        name={selected ? "radio-button-on" : "radio-button-off"}
                        size={18}
                        color={selected ? "#E11D48" : "#FDA4AF"}
                      />
                      <Text className="text-xs font-bold text-rose-950">
                        {option.label}
                      </Text>
                    </View>
                    <Text className="text-xs font-extrabold text-rose-600">
                      {option.extraKsh > 0
                        ? `+Ksh ${option.extraKsh.toLocaleString()}`
                        : "FREE"}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <Text className="text-xs font-bold text-rose-950 mt-4 mb-1.5">
            Optional Gift Card Message
          </Text>
          <TextInput
            value={giftNote}
            onChangeText={setGiftNote}
            placeholder="e.g. Happy Valentine's Day! Wishing you joy always."
            placeholderTextColor="#FDA4AF"
            multiline
            numberOfLines={2}
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs text-rose-950"
          />
        </Animated.View>

        {/* Partner Shop Card */}
        <Animated.View
          entering={FadeInDown.delay(250).springify().damping(15)}
          className="mx-4 mt-4 rounded-3xl bg-white p-4 border border-rose-100 flex-row items-center justify-between shadow-xs"
        >
          <View className="flex-1 pr-3">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
              Verified Shop
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Text className="text-base font-extrabold text-rose-950">
                {gift.shopName}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color="#E11D48" />
            </View>
            <Text className="text-xs text-rose-700/80 mt-0.5">
              ★ {gift.shopRating} • {gift.shopLocation}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push(`/(buyer)/shop/${gift.shopId}`)}
            className="bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-2xl active:bg-rose-100"
          >
            <Text className="text-xs font-bold text-rose-700">Visit Shop</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom WhatsApp Order Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-rose-100 px-4 pt-3 pb-7 flex-row items-center justify-between gap-3">
        <View>
          <Text className="text-[11px] font-semibold text-rose-500">
            Estimated Total
          </Text>
          <Text className="text-lg font-extrabold text-rose-950">
            Ksh {totalPriceKsh.toLocaleString()}
          </Text>
        </View>

        <Animated.View style={ctaAnimatedStyle} className="flex-1">
          <Pressable
            onPress={handleWhatsAppOrder}
            className="flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl shadow-sm"
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text className="text-white text-sm font-extrabold">
              Order via WhatsApp
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
