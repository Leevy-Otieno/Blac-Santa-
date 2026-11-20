import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export interface GiftAdvisorBannerProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  budgetRangeLabel?: string;
  activeFilterSummary?: string;
  onPressAdvisor: () => void;
  onPressClearFilter?: () => void;
  className?: string;
}

export function GiftAdvisorBanner({
  title = "BLAC SANTA Gift Advisor",
  subtitle = "Match thoughtful gifts for Him, Her, Kids & Boss by occasion and Ksh budget.",
  ctaLabel = "Find Match",
  budgetRangeLabel = "Ksh 500 – 10,000",
  activeFilterSummary,
  onPressAdvisor,
  onPressClearFilter,
  className = "",
}: GiftAdvisorBannerProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const ctaScale = useSharedValue(1);
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const handlePress = () => {
    ctaScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );
    onPressAdvisor();
  };

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`rounded-3xl bg-rose-950 border border-rose-900 ${
        isCompact ? "p-4" : "p-5"
      } ${className}`}
    >
      <View className="flex-row items-center justify-between gap-2 mb-2.5">
        <View className="flex-row items-center gap-1.5 bg-rose-600/30 border border-rose-400/40 px-2.5 py-1 rounded-full">
          <Ionicons name="sparkles" size={12} color="#FECDD3" />
          <Text className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100">
            {budgetRangeLabel}
          </Text>
        </View>

        <View className="h-9 w-9 rounded-2xl bg-rose-600 items-center justify-center">
          <Ionicons name="gift" size={18} color="#FFFFFF" />
        </View>
      </View>

      <Text
        className={`${
          isCompact ? "text-lg" : "text-xl"
        } font-extrabold text-white leading-6`}
      >
        {title}
      </Text>

      <Text className="text-xs text-rose-200/80 mt-1 leading-4">
        {subtitle}
      </Text>

      {activeFilterSummary ? (
        <View className="flex-row items-center justify-between bg-rose-900/90 border border-rose-800 rounded-2xl px-3 py-2 mt-3">
          <Text
            numberOfLines={1}
            className="text-[11px] font-bold text-rose-100 flex-1 pr-2"
          >
            Active: {activeFilterSummary}
          </Text>
          {onPressClearFilter && (
            <Pressable onPress={onPressClearFilter} hitSlop={8}>
              <Text className="text-[11px] font-extrabold text-rose-300">
                Clear
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <View className="mt-4">
        <Animated.View style={ctaStyle} className="self-start">
          <Pressable
            onPress={handlePress}
            className="flex-row items-center gap-2 bg-rose-600 active:bg-rose-700 px-4 py-3 rounded-2xl shadow-xs"
          >
            <Ionicons name="wand-sparkles-outline" size={16} color="#FFFFFF" />
            <Text className="text-white text-xs font-extrabold">
              {ctaLabel}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export default GiftAdvisorBanner;
