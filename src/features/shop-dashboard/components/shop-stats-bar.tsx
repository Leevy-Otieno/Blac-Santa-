import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export interface ShopStatsMetrics {
  activeGifts: number;
  soldOutGifts: number;
  whatsappClicks: number;
  averagePriceKsh: number;
}

export interface ShopStatsBarProps {
  stats: ShopStatsMetrics;
  shopName?: string;
  shopStatus?: "Active" | "Pending" | "Suspended";
  className?: string;
}

interface StatCardConfig {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentBg: string;
  iconColor: string;
}

export function ShopStatsBar({
  stats,
  shopName,
  shopStatus = "Active",
  className = "",
}: ShopStatsBarProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const items: StatCardConfig[] = [
    {
      id: "active",
      label: "Active Gifts",
      value: String(stats.activeGifts),
      icon: "gift-outline",
      accentBg: "bg-rose-50 border-rose-200",
      iconColor: "#E11D48",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Leads",
      value: stats.whatsappClicks.toLocaleString("en-KE"),
      icon: "logo-whatsapp",
      accentBg: "bg-rose-50 border-rose-200",
      iconColor: "#BE123C",
    },
    {
      id: "avg",
      label: "Avg. Gift Price",
      value: `Ksh ${Math.round(stats.averagePriceKsh).toLocaleString("en-KE")}`,
      icon: "pricetag-outline",
      accentBg: "bg-rose-50 border-rose-200",
      iconColor: "#E11D48",
    },
    {
      id: "stock",
      label: "Sold Out",
      value: String(stats.soldOutGifts),
      icon: "alert-circle-outline",
      accentBg: "bg-rose-50 border-rose-200",
      iconColor: "#881337",
    },
  ];

  const statusBadgeStyle =
    shopStatus === "Active"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : shopStatus === "Pending"
        ? "bg-amber-50 border-amber-200 text-amber-800"
        : "bg-rose-100 border-rose-300 text-rose-800";

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`w-full ${className}`}
    >
      {shopName ? (
        <View className="flex-row items-center justify-between mb-2.5 px-0.5">
          <View className="flex-1 pr-2">
            <Text
              numberOfLines={1}
              className="text-sm font-extrabold text-rose-950"
            >
              {shopName}
            </Text>
            <Text className="text-[11px] text-rose-700/75">
              Live Merchant Performance • Ksh 500 – 10,000
            </Text>
          </View>

          <View
            className={`px-2.5 py-1 rounded-full border ${statusBadgeStyle
              .split(" ")
              .slice(0, 2)
              .join(" ")}`}
          >
            <Text
              className={`text-[10px] font-extrabold ${
                statusBadgeStyle.split(" ")[2]
              }`}
            >
              {shopStatus}
            </Text>
          </View>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {items.map((item, idx) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(idx * 50)
              .springify()
              .damping(15)}
            style={{ width: isCompact ? 132 : 148 }}
            className="mr-2.5 bg-white rounded-3xl p-3.5 border border-rose-100 shadow-xs"
          >
            <View
              className={`h-8 w-8 rounded-xl border items-center justify-center mb-2 ${item.accentBg}`}
            >
              <Ionicons name={item.icon} size={16} color={item.iconColor} />
            </View>

            <Text
              numberOfLines={1}
              className="text-base font-extrabold text-rose-950"
            >
              {item.value}
            </Text>

            <Text
              numberOfLines={1}
              className="text-[11px] font-semibold text-rose-700/75 mt-0.5"
            >
              {item.label}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

export default ShopStatsBar;
