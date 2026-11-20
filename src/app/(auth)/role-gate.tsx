import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    badge: "Ksh 500 – 10,000",
    description:
      "Browse gifts for Him, Her, Kids, and Boss across occasions, save favorites, and order directly on WhatsApp.",
    icon: "gift",
    route: "/(buyer)",
  },
  {
    role: "shop",
    title: "Shop Owner Dashboard",
    badge: "Merchant Portal",
    description:
      "Add and edit gift listings, upload high-res photos, update your WhatsApp number, and track order clicks.",
    icon: "storefront",
    route: "/(shop)",
  },
  {
    role: "admin",
    title: "Platform Admin Console",
    badge: "Admin Control",
    description:
      "Approve or onboard shops, assign shop owners, manage categories & occasions, and oversee platform users.",
    icon: "shield-checkmark",
    route: "/(admin)",
    accentDark: true,
  },
];

export default function RoleGateScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-rose-50/70"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 24) + 16,
      }}
    >
      <Animated.View
        entering={FadeInDown.delay(60).springify().damping(15)}
        className="mb-4"
      >
        <Text className="text-2xl font-extrabold text-rose-950">
          Choose Your Workspace
        </Text>
        <Text className="text-xs text-rose-700/80 mt-1 leading-4">
          Select how you want to use BLAC SANTA right now.
        </Text>
      </Animated.View>

      <View className="gap-3.5">
        {ROLE_OPTIONS.map((item, idx) => (
          <Animated.View
            key={item.role}
            entering={FadeInDown.delay(110 + idx * 70)
              .springify()
              .damping(15)}
          >
            <Pressable
              onPress={() => router.replace(item.route)}
              className={`rounded-3xl p-4 border ${
                item.accentDark
                  ? "bg-rose-950 border-rose-900"
                  : "bg-white border-rose-100"
              } shadow-xs`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View
                    className={`h-11 w-11 rounded-2xl items-center justify-center ${
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
                  name="chevron-forward"
                  size={20}
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
        ))}
      </View>
    </ScrollView>
  );
}
