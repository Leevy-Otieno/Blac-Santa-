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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatKsh } from "../../utils/format-ksh";

type WorkspaceRole = "buyer" | "shop" | "admin";

interface RoleOption {
  role: WorkspaceRole;
  title: string;
  badge: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: "/(buyer)" | "/(shop)" | "/(admin)";
  accentDark?: boolean;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "buyer",
    title: "Buyer Gift Advisor",
    badge: `${formatKsh(500)} – ${formatKsh(10000)} • +254`,
    description:
      "Browse Nairobi gifts for Him, Her, Kids, and Boss, pinpoint shops in-app, save favorites to your wishlist, and order directly on WhatsApp.",
    icon: "gift",
    route: "/(buyer)",
  },
  {
    role: "shop",
    title: "Shop Owner Dashboard",
    badge: "Listings • Orders • Net Ksh",
    description:
      "Publish gifts in Ksh, toggle stock availability, update order statuses, and view your gross sales, commission cut, and net revenue.",
    icon: "storefront",
    route: "/(shop)",
  },
  {
    role: "admin",
    title: "Platform Admin Console",
    badge: "Commissions • Oversight",
    description:
      "Track marketplace-wide gross volume, admin commission earned, shop payouts, commission rates, and partner shop status.",
    icon: "shield-checkmark",
    route: "/(admin)",
    accentDark: true,
  },
];

export default function RoleGateScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>("buyer");

  const activeOption =
    ROLE_OPTIONS.find((item) => item.role === selectedRole) ?? ROLE_OPTIONS[0];

  return (
    <ScrollView
      className="flex-1 bg-rose-50/70"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: Math.max(insets.top, 14),
        paddingBottom: Math.max(insets.bottom, 24) + 115,
      }}
    >
      <View className={isWide ? "w-full max-w-3xl self-center" : "w-full"}>
        {/* Top Navigation Row */}
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-row items-center justify-between mb-3"
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            className="h-10 w-10 rounded-full bg-white border border-rose-200 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={18} color="#881337" />
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            className="bg-white border border-rose-200 px-3.5 py-2 rounded-full"
          >
            <Text className="text-xs font-bold text-rose-900">Home</Text>
          </Pressable>
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(60).springify().damping(15)}
          className="mb-4"
        >
          <Text className="text-2xl font-extrabold text-rose-950">
            Choose Your Workspace
          </Text>
          <Text className="text-xs text-rose-700/80 mt-1 leading-4">
            Select how you want to use BLAC SANTA across Nairobi gifting, shop
            orders, and commission tracking.
          </Text>
        </Animated.View>

        {/* Role Selection Cards */}
        <View className="gap-3.5 mb-5">
          {ROLE_OPTIONS.map((item, idx) => {
            const isSelected = item.role === selectedRole;
            return (
              <Animated.View
                key={item.role}
                entering={FadeInDown.delay(110 + idx * 70)
                  .springify()
                  .damping(15)}
              >
                <Pressable
                  onPress={() => setSelectedRole(item.role)}
                  onLongPress={() => router.replace(item.route)}
                  className={`rounded-3xl p-4 border ${
                    item.accentDark
                      ? `bg-rose-950 ${
                          isSelected ? "border-rose-400" : "border-rose-900"
                        }`
                      : `bg-white ${
                          isSelected ? "border-rose-600" : "border-rose-100"
                        }`
                  }`}
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View
                        className={`h-11 w-11 rounded-2xl items-center justify-center shrink-0 ${
                          item.accentDark ? "bg-rose-600" : "bg-rose-50"
                        }`}
                      >
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={item.accentDark ? "#FFFFFF" : "#E11D48"}
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className={`text-base font-extrabold ${
                            item.accentDark ? "text-white" : "text-rose-950"
                          }`}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className={`text-[11px] font-bold mt-0.5 ${
                            item.accentDark ? "text-rose-300" : "text-rose-600"
                          }`}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "chevron-forward"}
                      size={22}
                      color={item.accentDark ? "#FDA4AF" : "#E11D48"}
                    />
                  </View>

                  <Text
                    className={`text-xs mt-3 leading-4 ${
                      item.accentDark ? "text-rose-200/80" : "text-rose-800/75"
                    }`}
                  >
                    {item.description}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Enter Selected Workspace Button */}
        <Pressable
          onPress={() => router.replace(activeOption.route)}
          className="flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-4 px-5 rounded-2xl"
        >
          <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
          <Text className="text-white text-sm font-extrabold">
            Continue to {activeOption.title}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
