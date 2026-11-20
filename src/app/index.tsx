import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RECIPIENTS = ["For Her", "For Him", "Kids", "Boss"] as const;
const OCCASIONS = ["Valentine's Day", "Birthdays", "Christmas"] as const;
const BUDGET_TIERS = [
  { id: "under-2500", label: "Ksh 500 – 2,500" },
  { id: "2500-5000", label: "Ksh 2,500 – 5,000" },
  { id: "5000-10000", label: "Ksh 5,000 – 10,000" },
] as const;

export default function AppEntryGatewayScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [selectedRecipient, setSelectedRecipient] =
    useState<(typeof RECIPIENTS)[number]>("For Her");
  const [selectedOccasion, setSelectedOccasion] =
    useState<(typeof OCCASIONS)[number]>("Valentine's Day");
  const [selectedBudget, setSelectedBudget] =
    useState<(typeof BUDGET_TIERS)[number]["id"]>("2500-5000");

  const ctaScale = useSharedValue(1);
  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const handleLaunchAdvisor = () => {
    ctaScale.value = withSequence(
      withSpring(0.96, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );
    router.push({
      pathname: "/(buyer)/search",
      params: {
        category: selectedRecipient,
        occasion: selectedOccasion,
        budget: selectedBudget,
      },
    });
  };

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
      {/* Top Navigation Header */}
      <Animated.View
        entering={FadeIn.duration(350)}
        className="flex-row items-center justify-between mb-4"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="h-10 w-10 rounded-2xl bg-rose-600 items-center justify-center shadow-xs">
            <Ionicons name="gift" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-lg font-extrabold text-rose-950 leading-5">
              BLAC SANTA
            </Text>
            <Text className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Kenya Gift Concierge
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push("/explore")}
            className="bg-white border border-rose-200 px-3 py-2 rounded-full"
          >
            <Text className="text-xs font-bold text-rose-900">Hub</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(auth)/sign-in")}
            className="bg-rose-950 px-3.5 py-2 rounded-full"
          >
            <Text className="text-xs font-extrabold text-white">Sign In</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Hero Value Proposition */}
      <Animated.View
        entering={FadeInDown.delay(70).springify().damping(15)}
        className="rounded-3xl bg-rose-950 p-5 mb-4"
      >
        <View className="self-start flex-row items-center gap-1.5 bg-rose-600/30 border border-rose-400/40 px-2.5 py-1 rounded-full mb-2.5">
          <Ionicons name="logo-whatsapp" size={12} color="#FECDD3" />
          <Text className="text-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
            Direct +254 Merchant Ordering
          </Text>
        </View>

        <Text
          className={`${
            isCompact ? "text-2xl" : "text-3xl"
          } font-extrabold text-white leading-8`}
        >
          Thoughtful Gifting in Under 60 Seconds
        </Text>
        <Text className="text-rose-200/80 text-xs mt-2 leading-5">
          Answer three quick preferences below to match with verified Nairobi
          gift shops within your exact Ksh budget.
        </Text>
      </Animated.View>

      {/* Interactive 3-Step Gift Advisor Card */}
      <Animated.View
        entering={FadeInDown.delay(140).springify().damping(15)}
        className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs mb-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-extrabold text-rose-950">
            Smart Gift Advisor
          </Text>
          <View className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            <Text className="text-[10px] font-extrabold text-rose-600">
              3-Step Match
            </Text>
          </View>
        </View>

        {/* Step 1: Recipient */}
        <Text className="text-xs font-bold text-rose-900 mb-2">
          1. Who is receiving the gift?
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {RECIPIENTS.map((person) => {
            const active = selectedRecipient === person;
            return (
              <Pressable
                key={person}
                onPress={() => setSelectedRecipient(person)}
                className={`px-3.5 py-2 rounded-full border ${
                  active
                    ? "bg-rose-600 border-rose-600"
                    : "bg-rose-50/60 border-rose-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-white" : "text-rose-900"
                  }`}
                >
                  {person}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Step 2: Occasion */}
        <Text className="text-xs font-bold text-rose-900 mb-2">
          2. What is the occasion?
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {OCCASIONS.map((occ) => {
            const active = selectedOccasion === occ;
            return (
              <Pressable
                key={occ}
                onPress={() => setSelectedOccasion(occ)}
                className={`px-3.5 py-2 rounded-full border ${
                  active
                    ? "bg-rose-600 border-rose-600"
                    : "bg-rose-50/60 border-rose-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-white" : "text-rose-900"
                  }`}
                >
                  {occ}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Step 3: Budget */}
        <Text className="text-xs font-bold text-rose-900 mb-2">
          3. Choose your budget range
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {BUDGET_TIERS.map((tier) => {
            const active = selectedBudget === tier.id;
            return (
              <Pressable
                key={tier.id}
                onPress={() => setSelectedBudget(tier.id)}
                className={`px-3.5 py-2 rounded-full border ${
                  active
                    ? "bg-rose-950 border-rose-950"
                    : "bg-rose-50/60 border-rose-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-white" : "text-rose-900"
                  }`}
                >
                  {tier.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.View style={ctaAnimatedStyle}>
          <Pressable
            onPress={handleLaunchAdvisor}
            className="flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-4 rounded-2xl shadow-xs"
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text className="text-white text-sm font-extrabold">
              Match Gifts Now
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Role & Workspace Quick Launchers */}
      <Animated.View
        entering={FadeInDown.delay(210).springify().damping(15)}
        className="gap-2.5"
      >
        <Pressable
          onPress={() => router.replace("/(buyer)")}
          className="flex-row items-center justify-between bg-white p-4 rounded-3xl border border-rose-100"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-2xl bg-rose-50 items-center justify-center">
              <Ionicons name="compass-outline" size={20} color="#E11D48" />
            </View>
            <View>
              <Text className="text-sm font-extrabold text-rose-950">
                Browse Full Buyer Catalog
              </Text>
              <Text className="text-xs text-rose-700/75">
                Explore all categories, shops & saved wishlists
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FB7185" />
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/role-gate")}
          className="flex-row items-center justify-between bg-white p-4 rounded-3xl border border-rose-100"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-2xl bg-rose-50 items-center justify-center">
              <Ionicons name="storefront-outline" size={20} color="#E11D48" />
            </View>
            <View>
              <Text className="text-sm font-extrabold text-rose-950">
                Merchant & Admin Workspaces
              </Text>
              <Text className="text-xs text-rose-700/75">
                Manage shop listings, WhatsApp leads & approvals
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FB7185" />
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
