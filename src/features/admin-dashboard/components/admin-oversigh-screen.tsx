import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGiftOrders } from "../../orders/hooks/use-gift-orders";
import { ShopDiscussionDialog } from "../../shop-discussion/components/shop-discussion-dialog";
import { useShopDiscussion } from "../../shop-discussion/hooks/use-shop-discussion";
import type { TaggedShopReference } from "../../shop-discussion/types/shop-discussion.types";
import type { MerchantPayoutSettings } from "../../shop-dashboard/types/payout.types";

export interface AdminOversightScreenProps {
  defaultShopId: string;
  defaultShopName?: string;
  payoutSettings?: MerchantPayoutSettings | null;
  className?: string;
}

export function AdminOversightScreen({
  defaultShopId,
  defaultShopName = "",
  payoutSettings = null,
  className = "",
}: AdminOversightScreenProps) {
  const insets = useSafeAreaInsets();

  const { orders, inventory } = useGiftOrders({
    shopId: defaultShopId,
    shopName: defaultShopName,
  });

  const availableShops = useMemo<TaggedShopReference[]>(() => {
    const map = new Map<string, TaggedShopReference>();
    for (const item of inventory) {
      if (item.shopId && item.shopName && !map.has(item.shopId)) {
        map.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
        });
      }
    }
    for (const order of orders) {
      if (order.shopId && order.shopName && !map.has(order.shopId)) {
        map.set(order.shopId, {
          shopId: order.shopId,
          shopName: order.shopName,
        });
      }
    }
    if (defaultShopId && !map.has(defaultShopId)) {
      map.set(defaultShopId, {
        shopId: defaultShopId,
        shopName: defaultShopName || "Primary Shop",
      });
    }
    return Array.from(map.values());
  }, [inventory, orders, defaultShopId, defaultShopName]);

  const [selectedShopId, setSelectedShopId] = useState<string>(defaultShopId);

  const activeShop = useMemo<TaggedShopReference>(() => {
    const found = availableShops.find((s) => s.shopId === selectedShopId);
    if (found) return found;
    if (availableShops.length > 0) return availableShops[0];
    return {
      shopId: defaultShopId,
      shopName: defaultShopName || "Shop",
    };
  }, [availableShops, selectedShopId, defaultShopId, defaultShopName]);

  const { summary } = useShopDiscussion(activeShop.shopId, activeShop.shopName);

  const totalGrossKsh = useMemo(
    () =>
      orders
        .filter((o) => o.isPaidAndConfirmed)
        .reduce((acc, o) => acc + o.totalKsh, 0),
    [orders],
  );

  const totalCommissionKsh = useMemo(
    () =>
      orders
        .filter((o) => o.isPaidAndConfirmed)
        .reduce((acc, o) => acc + o.commissionKsh, 0),
    [orders],
  );

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
      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-1">
        <Text className="text-lg font-extrabold text-rose-950">
          Admin Oversight & Thread Moderation
        </Text>
        <Text className="text-[11px] text-rose-700/75">
          Monitor orders, commission splits, shop ratings, and join any shop
          discussion as Admin.
        </Text>
      </View>

      {/* Platform Summary */}
      <View className="flex-row gap-2.5">
        <View className="flex-1 bg-white rounded-2xl p-3.5 border border-rose-100">
          <Text className="text-[10px] font-extrabold uppercase text-rose-600">
            Confirmed GMV
          </Text>
          <Text className="text-sm font-extrabold text-rose-950 mt-1">
            Ksh {totalGrossKsh.toLocaleString("en-KE")}
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-2xl p-3.5 border border-rose-100">
          <Text className="text-[10px] font-extrabold uppercase text-rose-600">
            Platform Fee ({payoutSettings?.platformFeePercent ?? 5}%)
          </Text>
          <Text className="text-sm font-extrabold text-rose-950 mt-1">
            Ksh {totalCommissionKsh.toLocaleString("en-KE")}
          </Text>
        </View>
      </View>

      {/* Shop Selector + Admin Thread Access */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-rose-950">
              Active Shop Thread: {activeShop.shopName}
            </Text>
            <Text className="text-[11px] text-rose-700/75 mt-0.5">
              {summary.totalRatings > 0
                ? `${summary.averageRating} ★ (${summary.totalRatings} ratings) • ${summary.totalPosts} posts`
                : `${summary.totalPosts} posts • Select a shop below to inspect`}
            </Text>
          </View>
        </View>

        {availableShops.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {availableShops.map((shop) => {
              const selected = shop.shopId === activeShop.shopId;
              return (
                <Pressable
                  key={shop.shopId}
                  onPress={() => setSelectedShopId(shop.shopId)}
                  className={`px-3 py-1.5 rounded-full border ${
                    selected
                      ? "bg-rose-950 border-rose-950"
                      : "bg-rose-50 border-rose-200"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-extrabold ${
                      selected ? "text-white" : "text-rose-900"
                    }`}
                  >
                    {shop.shopName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <ShopDiscussionDialog
          shopId={activeShop.shopId}
          shopName={activeShop.shopName}
          availableShops={availableShops}
          defaultRole="admin"
          buttonLabel={`Join ${activeShop.shopName} Thread as Admin`}
        />
      </View>

      {/* Recent Orders Log */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-2.5">
        <Text className="text-sm font-extrabold text-rose-950">
          Recent Orders ({orders.length})
        </Text>

        {orders.length === 0 ? (
          <Text className="text-xs text-rose-700/75">
            No orders recorded yet.
          </Text>
        ) : (
          orders.map((order) => (
            <View
              key={order.id}
              className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 gap-1"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-extrabold text-rose-950">
                  {order.orderNumber} • {order.shopName}
                </Text>
                <Text className="text-[10px] font-extrabold uppercase text-rose-700">
                  {order.status}
                </Text>
              </View>
              <Text className="text-[11px] text-rose-700/80">
                {order.giftTitle} × {order.quantity} — Ksh{" "}
                {order.totalKsh.toLocaleString("en-KE")} (Fee: Ksh{" "}
                {order.commissionKsh.toLocaleString("en-KE")})
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default AdminOversightScreen;
