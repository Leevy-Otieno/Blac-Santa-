import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { getStockHealthStatus } from "../../inventory/services/inventory-service";
import type { InventoryGiftItem } from "../../inventory/types/inventory.types";

export interface ShopStockManagerProps {
  items: readonly InventoryGiftItem[];
  mutating?: boolean;
  onAddStock: (giftId: string, quantityToAdd: number) => void | Promise<void>;
  onSetStockQuantity: (
    giftId: string,
    stockQuantity: number,
  ) => void | Promise<void>;
  className?: string;
}

export function ShopStockManager({
  items,
  mutating = false,
  onAddStock,
  onSetStockQuantity,
  className = "",
}: ShopStockManagerProps) {
  const [customQtyByGift, setCustomQtyByGift] = useState<
    Record<string, string>
  >({});

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`gap-3 ${className}`}
    >
      <View className="flex-row items-center justify-between px-0.5">
        <View>
          <Text className="text-sm font-extrabold text-rose-950">
            Product Stock & Restock
          </Text>
          <Text className="text-[11px] text-rose-700/75">
            Stock auto-deducts when buyers complete M-Pesa PIN payment
          </Text>
        </View>
        <View className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
          <Text className="text-[10px] font-extrabold text-rose-700">
            {items.length} SKUs
          </Text>
        </View>
      </View>

      {items.map((item) => {
        const health = getStockHealthStatus(item);
        const customInput = customQtyByGift[item.id] ?? "5";

        const badgeStyle =
          health === "Healthy"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : health === "Low Stock"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-rose-100 border-rose-300 text-rose-800";

        return (
          <View
            key={item.id}
            className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-sm font-extrabold text-rose-950"
                >
                  {item.title}
                </Text>
                <Text className="text-xs font-bold text-rose-700 mt-0.5">
                  Ksh {item.priceKsh.toLocaleString("en-KE")} • Available:{" "}
                  <Text className="font-extrabold text-rose-950">
                    {item.stockQuantity} unit(s)
                  </Text>
                </Text>
              </View>

              <View
                className={`px-2.5 py-1 rounded-full border ${badgeStyle
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")}`}
              >
                <Text
                  className={`text-[10px] font-extrabold ${
                    badgeStyle.split(" ")[2]
                  }`}
                >
                  {health}
                </Text>
              </View>
            </View>

            {/* Quick Restock Buttons */}
            <View className="flex-row items-center gap-2 mt-3">
              {[1, 5, 10].map((inc) => (
                <Pressable
                  key={inc}
                  disabled={mutating}
                  onPress={() => void onAddStock(item.id, inc)}
                  className="bg-rose-50 border border-rose-200 active:bg-rose-100 px-3 py-2 rounded-2xl"
                >
                  <Text className="text-xs font-extrabold text-rose-950">
                    +{inc}
                  </Text>
                </Pressable>
              ))}

              <TextInput
                value={customInput}
                onChangeText={(t) =>
                  setCustomQtyByGift((prev) => ({
                    ...prev,
                    [item.id]: t.replace(/\D/g, ""),
                  }))
                }
                keyboardType="number-pad"
                placeholder="Qty"
                placeholderTextColor="#FDA4AF"
                className="w-16 bg-rose-50/70 border border-rose-200 rounded-2xl px-2.5 py-2 text-center text-xs font-extrabold text-rose-950"
              />

              <Pressable
                disabled={mutating}
                onPress={() => {
                  const qty = Number(customInput) || 0;
                  if (qty > 0) void onAddStock(item.id, qty);
                }}
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-rose-600 active:bg-rose-700 py-2 px-3 rounded-2xl"
              >
                <Ionicons name="add-circle-outline" size={15} color="#FFFFFF" />
                <Text className="text-white text-xs font-extrabold">
                  Add Stock
                </Text>
              </Pressable>

              {item.stockQuantity === 0 && (
                <Pressable
                  disabled={mutating}
                  onPress={() => void onSetStockQuantity(item.id, 5)}
                  className="bg-rose-950 px-2.5 py-2 rounded-2xl"
                >
                  <Text className="text-white text-[10px] font-extrabold">
                    Restock 5
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
}

export default ShopStockManager;
