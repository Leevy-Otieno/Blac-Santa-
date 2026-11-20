import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type {
  GiftOrder,
  PaymentPromptOutcome,
} from "../../orders/types/order.types";

export interface BuyerOrderTrackerProps {
  orders: readonly GiftOrder[];
  mutating?: boolean;
  onRetryPin: (
    orderId: string,
    outcome: PaymentPromptOutcome,
  ) => void | Promise<void>;
  className?: string;
}

export function BuyerOrderTracker({
  orders,
  mutating = false,
  onRetryPin,
  className = "",
}: BuyerOrderTrackerProps) {
  if (orders.length === 0) {
    return (
      <View
        className={`bg-white rounded-3xl p-5 border border-rose-100 items-center ${className}`}
      >
        <Ionicons name="bag-handle-outline" size={26} color="#E11D48" />
        <Text className="text-xs font-extrabold text-rose-950 mt-2">
          No Orders Yet
        </Text>
        <Text className="text-[11px] text-rose-700/75 text-center mt-0.5">
          Complete an M-Pesa PIN prompt on a gift to track your delivery here.
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`gap-3 ${className}`}
    >
      {orders.map((order) => {
        const failedPin = !order.isPaidAndConfirmed;

        return (
          <View
            key={order.id}
            className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Text className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                  {order.orderNumber} • {order.shopName}
                </Text>
                <Text className="text-sm font-extrabold text-rose-950 mt-0.5">
                  {order.giftTitle} × {order.quantity}
                </Text>
                <Text className="text-xs font-bold text-rose-800 mt-0.5">
                  Ksh {order.grossAmountKsh.toLocaleString("en-KE")} •{" "}
                  {order.deliveryAddress}
                </Text>
              </View>

              <View
                className={`px-2.5 py-1 rounded-full border ${
                  failedPin
                    ? "bg-rose-100 border-rose-300"
                    : order.status === "Delivered"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-amber-50 border-amber-200"
                }`}
              >
                <Text
                  className={`text-[10px] font-extrabold ${
                    failedPin
                      ? "text-rose-800"
                      : order.status === "Delivered"
                        ? "text-emerald-700"
                        : "text-amber-800"
                  }`}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <View className="bg-rose-50/75 border border-rose-100 rounded-2xl p-3 mt-2.5">
              <Text className="text-[11px] font-bold text-rose-900 leading-4">
                {order.customerUpdateMessage}
              </Text>
            </View>

            {failedPin && (
              <Pressable
                disabled={mutating}
                onPress={() => void onRetryPin(order.id, "pin_completed")}
                className="flex-row items-center justify-center gap-1.5 bg-rose-600 active:bg-rose-700 py-2.5 px-3.5 rounded-2xl mt-3"
              >
                <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                <Text className="text-white text-xs font-extrabold">
                  {mutating
                    ? "Retrying PIN..."
                    : "Retry M-Pesa PIN to Finish Order"}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </Animated.View>
  );
}

export default BuyerOrderTracker;
