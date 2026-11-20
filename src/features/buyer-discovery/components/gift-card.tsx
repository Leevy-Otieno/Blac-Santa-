import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export interface GiftCardItem {
  id: string;
  title: string;
  priceKsh: number;
  originalPriceKsh?: number;
  shopId: string;
  shopName: string;
  category: string;
  occasion: string;
  imageUrl: string;
  isFeatured?: boolean;
  sameDayNairobi?: boolean;
  stockQuantity?: number;
  inStock?: boolean;
}

export interface GiftCardProps {
  gift: GiftCardItem;
  onPress: (gift: GiftCardItem) => void;
  onOrderGift?: (gift: GiftCardItem) => void;
  onToggleWishlist?: (gift: GiftCardItem) => void;
  isWishlisted?: boolean;
  layout?: "grid" | "horizontal" | "full";
  index?: number;
  className?: string;
}

export function GiftCard({
  gift,
  onPress,
  onOrderGift,
  onToggleWishlist,
  isWishlisted = false,
  layout = "grid",
  index = 0,
  className = "",
}: GiftCardProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const hasStockInfo = typeof gift.stockQuantity === "number";
  const isAvailable = hasStockInfo
    ? (gift.stockQuantity ?? 0) > 0 && (gift.inStock ?? true)
    : gift.inStock ?? true;

  const cardScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleCardPress = () => {
    cardScale.value = withSequence(
      withSpring(0.97, { damping: 11, stiffness: 250 }),
      withSpring(1, { damping: 13, stiffness: 220 })
    );
    onPress(gift);
  };

  const handleHeartPress = () => {
    if (!onToggleWishlist) return;
    heartScale.value = withSequence(
      withSpring(1.28, { damping: 8, stiffness: 280 }),
      withSpring(1, { damping: 11, stiffness: 220 })
    );
    onToggleWishlist(gift);
  };

  const handleOrderPress = () => {
    if (!onOrderGift || !isAvailable) return;
    cardScale.value = withSequence(
      withSpring(0.97, { damping: 11, stiffness: 250 }),
      withSpring(1, { damping: 13, stiffness: 220 })
    );
    onOrderGift(gift);
  };

  const imageHeightClass =
    layout === "horizontal"
      ? isCompact
        ? "h-28"
        : "h-32"
      : layout === "full"
        ? "h-44"
        : isCompact
          ? "h-28"
          : "h-32";

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 45, 260))
        .springify()
        .damping(15)}
      style={
        layout === "horizontal"
          ? { width: isCompact ? width - 64 : 220 }
          : layout === "grid"
            ? { width: "48.5%" }
            : { width: "100%" }
      }
      className={className}
    >
      <Animated.View style={cardStyle}>
        <Pressable
          onPress={handleCardPress}
          className="bg-white rounded-3xl overflow-hidden border border-rose-100 active:bg-rose-50/40 shadow-xs"
        >
          {/* Image + Wishlist Button */}
          <View className="relative bg-rose-100">
            <Image
              source={{ uri: gift.imageUrl }}
              className={`w-full ${imageHeightClass}`}
              resizeMode="cover"
            />

            {gift.isFeatured && (
              <View className="absolute top-2.5 left-2.5 bg-rose-950/90 px-2.5 py-1 rounded-full">
                <Text className="text-[9px] font-extrabold uppercase tracking-wider text-rose-100">
                  Featured
                </Text>
              </View>
            )}

            {onToggleWishlist && (
              <Animated.View
                style={heartStyle}
                className="absolute top-2.5 right-2.5"
              >
                <Pressable
                  onPress={handleHeartPress}
                  hitSlop={8}
                  className="h-8 w-8 rounded-full bg-white/95 border border-rose-200 items-center justify-center shadow-xs"
                >
                  <Ionicons
                    name={isWishlisted ? "heart" : "heart-outline"}
                    size={16}
                    color="#E11D48"
                  />
                </Pressable>
              </Animated.View>
            )}
          </View>

          {/* Details */}
          <View className={isCompact ? "p-3" : "p-3.5"}>
            <Text
              numberOfLines={1}
              className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600"
            >
              {gift.category} • {gift.occasion}
            </Text>

            <Text
              numberOfLines={2}
              className="text-xs font-extrabold text-rose-950 mt-1 leading-4"
            >
              {gift.title}
            </Text>

            <Text
              numberOfLines={1}
              className="text-[11px] text-rose-700/75 mt-1"
            >
              {gift.shopName}
            </Text>

            {hasStockInfo && (
              <Text
                className={`text-[10px] font-extrabold mt-1 ${
                  isAvailable ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {isAvailable
                  ? `${gift.stockQuantity} in stock`
                  : "Out of stock"}
              </Text>
            )}

            <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-rose-100">
              <Text className="text-sm font-extrabold text-rose-700">
                Ksh {gift.priceKsh.toLocaleString("en-KE")}
              </Text>

              {gift.sameDayNairobi && (
                <View className="bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-extrabold text-rose-700">
                    Same-Day
                  </Text>
                </View>
              )}
            </View>

            {onOrderGift && (
              <Pressable
                onPress={handleOrderPress}
                disabled={!isAvailable}
                className={`flex-row items-center justify-center gap-1.5 rounded-2xl py-2 px-3 mt-2.5 ${
                  isAvailable
                    ? "bg-rose-600 active:bg-rose-700"
                    : "bg-rose-200"
                }`}
              >
                <Ionicons name="card-outline" size={14} color="#FFFFFF" />
                <Text className="text-white text-[11px] font-extrabold">
                  {isAvailable ? "Order in App" : "Sold Out"}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default GiftCard;