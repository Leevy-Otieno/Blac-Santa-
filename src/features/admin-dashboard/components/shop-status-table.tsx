import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import type { ShopAccountStatus } from "./shop-onboard-form";

export interface ShopStatusRecord {
  id: string;
  shopName: string;
  ownerName: string;
  whatsappPhone: string;
  location: string;
  status: ShopAccountStatus;
  giftCount: number;
  whatsappClicks: number;
}

export interface ShopStatusTableProps {
  shops: ShopStatusRecord[];
  onApprove?: (shop: ShopStatusRecord) => void;
  onToggleSuspend?: (shop: ShopStatusRecord) => void;
  onInspectShop?: (shop: ShopStatusRecord) => void;
  searchable?: boolean;
}

const FILTER_OPTIONS: ("All" | ShopAccountStatus)[] = [
  "All",
  "Active",
  "Pending",
  "Suspended",
];

function StatusBadge({ status }: { status: ShopAccountStatus }) {
  const config =
    status === "Active"
      ? {
          bg: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-700",
          dot: "#059669",
        }
      : status === "Pending"
        ? {
            bg: "bg-amber-50 border-amber-200",
            text: "text-amber-800",
            dot: "#D97706",
          }
        : {
            bg: "bg-rose-50 border-rose-300",
            text: "text-rose-700",
            dot: "#E11D48",
          };

  return (
    <View
      className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bg}`}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: config.dot,
        }}
      />
      <Text className={`text-[10px] font-extrabold ${config.text}`}>
        {status}
      </Text>
    </View>
  );
}

export function ShopStatusTable({
  shops,
  onApprove,
  onToggleSuspend,
  onInspectShop,
  searchable = true,
}: ShopStatusTableProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | ShopAccountStatus
  >("All");

  const filteredShops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops.filter((shop) => {
      const matchesStatus =
        selectedFilter === "All" || shop.status === selectedFilter;
      const matchesQuery =
        !q ||
        shop.shopName.toLowerCase().includes(q) ||
        shop.ownerName.toLowerCase().includes(q) ||
        shop.location.toLowerCase().includes(q) ||
        shop.whatsappPhone.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [shops, query, selectedFilter]);

  return (
    <View className="w-full">
      {searchable && (
        <View className="flex-row items-center bg-white border border-rose-200 rounded-2xl px-3.5 mb-3">
          <Ionicons name="search" size={17} color="#E11D48" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Filter by shop, owner, location, or +254..."
            placeholderTextColor="#FDA4AF"
            className="flex-1 ml-2 py-2.5 text-xs text-rose-950"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color="#FB7185" />
            </Pressable>
          )}
        </View>
      )}

      {/* Status Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3"
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {FILTER_OPTIONS.map((option) => {
          const active = selectedFilter === option;
          const count =
            option === "All"
              ? shops.length
              : shops.filter((s) => s.status === option).length;

          return (
            <Pressable
              key={option}
              onPress={() => setSelectedFilter(option)}
              className={`mr-2 flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${
                active
                  ? "bg-rose-600 border-rose-600"
                  : "bg-white border-rose-200"
              }`}
            >
              <Text
                className={`text-xs font-extrabold ${
                  active ? "text-white" : "text-rose-950"
                }`}
              >
                {option}
              </Text>
              <View
                className={`px-1.5 py-0.5 rounded-full ${
                  active ? "bg-white/25" : "bg-rose-50"
                }`}
              >
                <Text
                  className={`text-[10px] font-extrabold ${
                    active ? "text-white" : "text-rose-700"
                  }`}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Rows */}
      {filteredShops.length === 0 ? (
        <View className="bg-white rounded-3xl p-6 border border-rose-100 items-center">
          <Ionicons name="storefront-outline" size={26} color="#E11D48" />
          <Text className="text-sm font-extrabold text-rose-950 mt-2">
            No Matching Shops
          </Text>
          <Text className="text-xs text-rose-700/75 text-center mt-1">
            Try clearing your search filter or switching status tabs.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {filteredShops.map((shop, index) => (
            <Animated.View
              key={shop.id}
              entering={FadeInDown.delay(index * 45)
                .springify()
                .damping(15)}
              layout={Layout.springify()}
            >
              <View
                className={`bg-white rounded-3xl border border-rose-100 shadow-xs ${
                  isCompact ? "p-3.5" : "p-4"
                }`}
              >
                {/* Row Header */}
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-sm font-extrabold text-rose-950"
                    >
                      {shop.shopName}
                    </Text>
                    <Text className="text-xs text-rose-700/80 mt-0.5">
                      Owner: {shop.ownerName} • {shop.location}
                    </Text>
                  </View>
                  <StatusBadge status={shop.status} />
                </View>

                {/* Metrics Strip */}
                <View className="flex-row flex-wrap items-center gap-2 mt-3 bg-rose-50/70 border border-rose-100 rounded-2xl px-3 py-2">
                  <View className="flex-row items-center gap-1 mr-2">
                    <Ionicons name="gift-outline" size={13} color="#E11D48" />
                    <Text className="text-[11px] font-bold text-rose-900">
                      {shop.giftCount} gifts
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1 mr-2">
                    <Ionicons name="logo-whatsapp" size={13} color="#E11D48" />
                    <Text className="text-[11px] font-bold text-rose-900">
                      {shop.whatsappClicks} clicks
                    </Text>
                  </View>
                  <Text className="text-[11px] font-semibold text-rose-700/80">
                    {shop.whatsappPhone}
                  </Text>
                </View>

                {/* Row Actions */}
                <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-rose-100">
                  {shop.status === "Pending" && onApprove && (
                    <Pressable
                      onPress={() => onApprove(shop)}
                      className="flex-1 bg-rose-600 active:bg-rose-700 py-2 px-3 rounded-xl items-center"
                    >
                      <Text className="text-white text-xs font-extrabold">
                        Approve
                      </Text>
                    </Pressable>
                  )}

                  {shop.status !== "Pending" && onToggleSuspend && (
                    <Pressable
                      onPress={() => onToggleSuspend(shop)}
                      className="flex-1 bg-rose-50 border border-rose-200 active:bg-rose-100 py-2 px-3 rounded-xl items-center"
                    >
                      <Text className="text-rose-800 text-xs font-bold">
                        {shop.status === "Active" ? "Suspend" : "Reactivate"}
                      </Text>
                    </Pressable>
                  )}

                  {onInspectShop && (
                    <Pressable
                      onPress={() => onInspectShop(shop)}
                      className="bg-rose-950 active:bg-rose-900 py-2 px-3.5 rounded-xl items-center"
                    >
                      <Text className="text-white text-xs font-extrabold">
                        Storefront
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}

export default ShopStatusTable;
