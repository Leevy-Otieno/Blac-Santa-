import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdminShopItem, INITIAL_ADMIN_SHOPS } from "./index";

const STATUS_FILTERS = ["All", "Active", "Pending", "Suspended"] as const;

export default function AdminShopsScreen() {
  const insets = useSafeAreaInsets();
  const [shops, setShops] = useState<AdminShopItem[]>(INITIAL_ADMIN_SHOPS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");

  const filteredShops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops.filter((shop) => {
      const matchesStatus =
        statusFilter === "All" || shop.status === statusFilter;
      const matchesQuery =
        !q ||
        shop.name.toLowerCase().includes(q) ||
        shop.ownerName.toLowerCase().includes(q) ||
        shop.location.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [shops, query, statusFilter]);

  const cycleShopStatus = (shop: AdminShopItem) => {
    const nextStatus: AdminShopItem["status"] =
      shop.status === "Active" ? "Suspended" : "Active";
    setShops((prev) =>
      prev.map((item) =>
        item.id === shop.id ? { ...item, status: nextStatus } : item,
      ),
    );
    Alert.alert("Status Updated", `${shop.name} is now ${nextStatus}.`);
  };

  return (
    <View
      className="flex-1 bg-rose-50/60"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className="mx-4 flex-row items-center justify-between mb-3">
        <Text className="text-xl font-extrabold text-rose-950">
          Partner Shops ({filteredShops.length})
        </Text>
        <Pressable
          onPress={() => router.push("/(admin)/onboard-shop")}
          className="flex-row items-center gap-1 bg-rose-600 px-3.5 py-2 rounded-2xl"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-white text-xs font-extrabold">Add Shop</Text>
        </Pressable>
      </View>

      <View className="mx-4 flex-row items-center bg-white rounded-2xl px-4 py-2.5 border border-rose-200 mb-3">
        <Ionicons name="search" size={18} color="#E11D48" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search shop, owner, or Nairobi area..."
          placeholderTextColor="#FDA4AF"
          className="flex-1 ml-2.5 text-sm text-rose-950"
        />
      </View>

      <View className="mx-4 flex-row flex-wrap gap-2 mb-3">
        {STATUS_FILTERS.map((status) => {
          const active = statusFilter === status;
          return (
            <Pressable
              key={status}
              onPress={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full border ${
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
                {status}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredShops}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 55).springify()}
            layout={Layout.springify()}
          >
            <View className="bg-white rounded-3xl p-4 mb-3 border border-rose-100">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-extrabold text-rose-950">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-rose-700/80 mt-0.5">
                    {item.ownerName} • {item.ownerPhone}
                  </Text>
                  <Text className="text-xs text-rose-800/70 mt-0.5">
                    {item.location} • {item.giftCount} gifts •{" "}
                    {item.whatsappClicks} clicks
                  </Text>
                </View>

                <View
                  className={`px-2.5 py-1 rounded-full ${
                    item.status === "Active"
                      ? "bg-emerald-50 border border-emerald-200"
                      : item.status === "Pending"
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-extrabold ${
                      item.status === "Active"
                        ? "text-emerald-700"
                        : item.status === "Pending"
                          ? "text-amber-800"
                          : "text-rose-600"
                    }`}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-rose-100">
                <Pressable
                  onPress={() => cycleShopStatus(item)}
                  className="flex-1 bg-rose-50 border border-rose-200 py-2 rounded-xl items-center"
                >
                  <Text className="text-xs font-bold text-rose-800">
                    {item.status === "Active"
                      ? "Suspend Shop"
                      : "Activate Shop"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(buyer)/shop/[shopId]",
                      params: { shopId: item.id },
                    })
                  }
                  className="bg-rose-600 px-3.5 py-2 rounded-xl"
                >
                  <Text className="text-xs font-extrabold text-white">
                    Preview Storefront
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
      />
    </View>
  );
}
