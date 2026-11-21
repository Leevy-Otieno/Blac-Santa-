import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { InventoryGiftItem } from "../../inventory/types/inventory.types";
import { useGiftOrders } from "../../orders/hooks/use-gift-orders";
import { ShopDiscussionDialog } from "../../shop-discussion/components/shop-discussion-dialog";
import { useShopDiscussion } from "../../shop-discussion/hooks/use-shop-discussion";
import type { TaggedShopReference } from "../../shop-discussion/types/shop-discussion.types";
import type { MerchantPayoutSettings } from "../types/payout.types";

export interface ShopOwnerDashboardScreenProps {
  shopId: string;
  shopName: string;
  payoutSettings?: MerchantPayoutSettings | null;
  onSavePayoutSettings?: (
    settings: MerchantPayoutSettings,
  ) => Promise<void> | void;
  onSelectGift?: (gift: InventoryGiftItem) => void;
  className?: string;
}

export function ShopOwnerDashboardScreen({
  shopId,
  shopName,
  payoutSettings = null,
  onSavePayoutSettings,
  onSelectGift,
  className = "",
}: ShopOwnerDashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payoutDestination, setPayoutDestination] = useState(
    payoutSettings?.recipientDestination ?? "",
  );
  const [savingPayout, setSavingPayout] = useState(false);

  const {
    orders,
    inventory,
    mutating,
    error,
    clearError,
    advanceOrderStatus,
    adjustGiftStock,
  } = useGiftOrders({
    shopId,
    shopName,
  });

  const { posts, summary } = useShopDiscussion(shopId, shopName);

  const availableShops = useMemo<TaggedShopReference[]>(() => {
    const map = new Map<string, TaggedShopReference>();
    if (shopId && shopName) {
      map.set(shopId, { shopId, shopName });
    }
    for (const item of inventory) {
      if (item.shopId && item.shopName && !map.has(item.shopId)) {
        map.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
        });
      }
    }
    return Array.from(map.values());
  }, [inventory, shopId, shopName]);

  const taggedMentionsCount = useMemo(
    () =>
      posts.filter((post) =>
        post.taggedShops?.some((tag) => tag.shopId === shopId),
      ).length,
    [posts, shopId],
  );

  const shopInventory = useMemo(
    () => inventory.filter((item) => item.shopId === shopId),
    [inventory, shopId],
  );

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const totalRevenueKsh = useMemo(
    () =>
      orders
        .filter((order) => order.isPaidAndConfirmed)
        .reduce((sum, order) => sum + order.totalKsh, 0),
    [orders],
  );

  const handleSavePayout = async () => {
    if (!onSavePayoutSettings) return;
    try {
      setSavingPayout(true);
      await onSavePayoutSettings({
        shopId,
        shopName,
        payoutChannel: payoutSettings?.payoutChannel ?? "till",
        recipientDestination: payoutDestination.trim(),
        paybillAccountNumber: payoutSettings?.paybillAccountNumber,
        platformFeePercent: payoutSettings?.platformFeePercent ?? 5,
      });
    } finally {
      setSavingPayout(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: Math.max(insets.bottom, 24),
        gap: 16,
      }}
      className={className}
    >
      {/* Header */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1">
            <Text className="text-lg font-extrabold text-rose-950">
              {shopName || "Shop Owner Dashboard"}
            </Text>
            <Text className="text-[11px] text-rose-700/75 mt-0.5">
              Manage stock, orders, payout destination, and open buyer threads.
            </Text>
          </View>

          <View className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl items-end">
            <Text className="text-xs font-extrabold text-rose-950">
              {summary.totalRatings > 0
                ? `${summary.averageRating} ★`
                : "No Ratings"}
            </Text>
            <Text className="text-[10px] text-rose-700/75">
              {summary.totalRatings} rating
              {summary.totalRatings === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
      </View>

      {error ? (
        <View className="flex-row items-center justify-between gap-2 bg-rose-100 border border-rose-300 rounded-2xl p-3">
          <Text className="text-xs font-bold text-rose-900 flex-1">
            {error}
          </Text>
          <Pressable onPress={clearError}>
            <Text className="text-[11px] font-extrabold text-rose-700">
              Dismiss
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Metrics Row */}
      <View className="flex-row gap-2.5">
        <View className="flex-1 bg-white rounded-2xl p-3.5 border border-rose-100">
          <Text className="text-[10px] font-extrabold uppercase text-rose-600">
            Confirmed Sales
          </Text>
          <Text className="text-sm font-extrabold text-rose-950 mt-1">
            Ksh {totalRevenueKsh.toLocaleString("en-KE")}
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-2xl p-3.5 border border-rose-100">
          <Text className="text-[10px] font-extrabold uppercase text-rose-600">
            Thread Posts
          </Text>
          <Text className="text-sm font-extrabold text-rose-950 mt-1">
            {summary.totalPosts} ({taggedMentionsCount} tagged)
          </Text>
        </View>
      </View>

      {/* Open Shop Discussion & Tagging Card */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-rose-950">
              Shop Thread, Ratings & Cross-Shop Tags
            </Text>
            <Text className="text-[11px] text-rose-700/75 mt-0.5">
              Reply publicly as Shop Owner, tag partner shops, or address buyer
              feedback.
            </Text>
          </View>

          {taggedMentionsCount > 0 && (
            <View className="bg-rose-600 px-2.5 py-1 rounded-full">
              <Text className="text-[10px] font-extrabold text-white">
                {taggedMentionsCount} Tag{taggedMentionsCount === 1 ? "" : "s"}
              </Text>
            </View>
          )}
        </View>

        <ShopDiscussionDialog
          shopId={shopId}
          shopName={shopName}
          availableShops={availableShops}
          defaultRole="shop"
          buttonLabel="Reply & Moderate Shop Thread"
        />
      </View>

      {/* Payout Destination Card */}
      {onSavePayoutSettings && (
        <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-2.5">
          <Text className="text-sm font-extrabold text-rose-950">
            M-Pesa Payout Destination
          </Text>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={payoutDestination}
              onChangeText={setPayoutDestination}
              placeholder="Till / Paybill / Phone"
              placeholderTextColor="#FDA4AF"
              className="flex-1 bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-rose-950"
            />
            <Pressable
              onPress={() => void handleSavePayout()}
              disabled={savingPayout}
              className="bg-rose-600 active:bg-rose-700 px-4 py-2.5 rounded-2xl"
            >
              <Text className="text-white text-xs font-extrabold">
                {savingPayout ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Inventory & Stock Controls */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-3">
        <Text className="text-sm font-extrabold text-rose-950">
          Shop Inventory & Stock ({shopInventory.length})
        </Text>

        {shopInventory.length === 0 ? (
          <Text className="text-xs text-rose-700/75">
            No items listed under {shopName || "this shop"} yet.
          </Text>
        ) : (
          shopInventory.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between gap-2 bg-rose-50/60 border border-rose-100 rounded-2xl p-3"
            >
              <Pressable
                onPress={() => onSelectGift?.(item)}
                className="flex-1 pr-2"
              >
                <Text
                  numberOfLines={1}
                  className="text-xs font-extrabold text-rose-950"
                >
                  {item.title}
                </Text>
                <Text className="text-[11px] text-rose-700/75 mt-0.5">
                  Ksh {item.priceKsh.toLocaleString("en-KE")} • Stock:{" "}
                  {item.stockQuantity}
                </Text>
              </Pressable>

              <View className="flex-row items-center gap-1.5">
                <Pressable
                  onPress={() => void adjustGiftStock(item.id, -1)}
                  disabled={mutating || item.stockQuantity <= 0}
                  className="h-8 w-8 rounded-xl bg-white border border-rose-200 items-center justify-center"
                >
                  <Ionicons name="remove" size={15} color="#881337" />
                </Pressable>

                <Pressable
                  onPress={() => void adjustGiftStock(item.id, 1)}
                  disabled={mutating}
                  className="h-8 w-8 rounded-xl bg-white border border-rose-200 items-center justify-center"
                >
                  <Ionicons name="add" size={15} color="#881337" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Orders Queue */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-sm font-extrabold text-rose-950">
            Orders ({filteredOrders.length})
          </Text>

          <View className="flex-row gap-1.5">
            {["all", "paid", "dispatched", "delivered"].map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded-full border ${
                  statusFilter === filter
                    ? "bg-rose-950 border-rose-950"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                <Text
                  className={`text-[10px] font-extrabold capitalize ${
                    statusFilter === filter ? "text-white" : "text-rose-900"
                  }`}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {filteredOrders.length === 0 ? (
          <Text className="text-xs text-rose-700/75">
            No orders matching this filter.
          </Text>
        ) : (
          filteredOrders.map((order) => (
            <View
              key={order.id}
              className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 gap-2"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-extrabold text-rose-950">
                  {order.orderNumber} • {order.giftTitle}
                </Text>
                <Text className="text-[10px] font-extrabold uppercase text-rose-700">
                  {order.status}
                </Text>
              </View>

              <Text className="text-[11px] text-rose-700/80">
                Buyer: {order.buyerName} ({order.buyerPhone}) • Ksh{" "}
                {order.totalKsh.toLocaleString("en-KE")}
              </Text>

              {order.status !== "delivered" && (
                <Pressable
                  onPress={() => void advanceOrderStatus(order.id)}
                  disabled={mutating}
                  className="self-start bg-rose-600 active:bg-rose-700 px-3 py-1.5 rounded-xl mt-1"
                >
                  <Text className="text-white text-[11px] font-extrabold">
                    Advance Status
                  </Text>
                </Pressable>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default ShopOwnerDashboardScreen;
