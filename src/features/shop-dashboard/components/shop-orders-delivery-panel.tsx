import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type {
  GiftOrder,
  GiftOrderStatus,
  ShopSalesSummary,
} from "../../orders/types/order.types";

export interface ShopOrdersDeliveryPanelProps {
  summary: ShopSalesSummary;
  orders: readonly GiftOrder[];
  mutating?: boolean;
  onUpdateStatus: (
    orderId: string,
    status: GiftOrderStatus,
    customerUpdateMessage?: string,
  ) => void | Promise<void>;
  className?: string;
}

const DELIVERY_ACTIONS: readonly GiftOrderStatus[] = [
  "Order Received",
  "To Be Shipped",
  "Out for Delivery",
  "Delivered",
  "Not Received",
];

function statusBadgeClasses(status: GiftOrderStatus): string {
  switch (status) {
    case "Delivered":
      return "bg-emerald-50 border-emerald-200 text-emerald-700";
    case "Not Received":
      return "bg-rose-100 border-rose-300 text-rose-800";
    case "To Be Shipped":
    case "Out for Delivery":
      return "bg-amber-50 border-amber-200 text-amber-800";
    default:
      return "bg-rose-50 border-rose-200 text-rose-700";
  }
}

export function ShopOrdersDeliveryPanel({
  summary,
  orders,
  mutating = false,
  onUpdateStatus,
  className = "",
}: ShopOrdersDeliveryPanelProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders[0]?.id ?? null,
  );
  const [noteDraft, setNoteDraft] = useState("");

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`gap-3.5 ${className}`}
    >
      {/* Shop Sales & Earnings Strip */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs">
        <Text className="text-sm font-extrabold text-rose-950 mb-2.5">
          {summary.shopName} • Sales & Deliveries
        </Text>

        <View className="flex-row gap-2">
          <View className="flex-1 bg-rose-50/80 border border-rose-200 rounded-2xl p-3">
            <Text className="text-[10px] font-bold text-rose-700">
              Gross Sales
            </Text>
            <Text className="text-sm font-extrabold text-rose-950 mt-0.5">
              Ksh {summary.grossSalesKsh.toLocaleString("en-KE")}
            </Text>
          </View>

          <View className="flex-1 bg-rose-50/80 border border-rose-200 rounded-2xl p-3">
            <Text className="text-[10px] font-bold text-rose-700">
              Your Net (After Fee)
            </Text>
            <Text className="text-sm font-extrabold text-emerald-700 mt-0.5">
              Ksh {summary.merchantEarningsKsh.toLocaleString("en-KE")}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2.5 pt-2.5 border-t border-rose-100">
          <Text className="text-[11px] font-bold text-rose-800">
            Delivered: {summary.deliveredOrders} • Shipping:{" "}
            {summary.activeDeliveryOrders}
          </Text>
          <Text className="text-[11px] font-extrabold text-rose-600">
            Not Received: {summary.notReceivedOrders}
          </Text>
        </View>
      </View>

      {/* Orders & Delivery Controls */}
      {orders.length === 0 ? (
        <View className="bg-white rounded-3xl p-5 border border-rose-100 items-center">
          <Ionicons name="receipt-outline" size={26} color="#E11D48" />
          <Text className="text-xs font-extrabold text-rose-950 mt-2">
            No Gift Orders Yet
          </Text>
          <Text className="text-[11px] text-rose-700/75 text-center mt-0.5">
            Paid buyer orders will appear here for dispatch and delivery
            updates.
          </Text>
        </View>
      ) : (
        orders.map((order) => {
          const isEditing = selectedOrderId === order.id;
          const badge = statusBadgeClasses(order.status);

          return (
            <View
              key={order.id}
              className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs"
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                    {order.orderNumber} • {order.buyerName}
                  </Text>
                  <Text className="text-sm font-extrabold text-rose-950 mt-0.5">
                    {order.giftTitle}
                  </Text>
                  <Text className="text-[11px] text-rose-700/80 mt-0.5">
                    Deliver to: {order.deliveryAddress} • Buyer:{" "}
                    {order.buyerPhone}
                  </Text>
                </View>

                <View
                  className={`px-2.5 py-1 rounded-full border ${badge
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")}`}
                >
                  <Text
                    className={`text-[10px] font-extrabold ${
                      badge.split(" ")[2]
                    }`}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              {/* Financials */}
              <View className="flex-row items-center justify-between bg-rose-50/70 border border-rose-100 rounded-2xl px-3 py-2 mt-2.5">
                <Text className="text-xs font-bold text-rose-950">
                  Paid: Ksh {order.grossAmountKsh.toLocaleString("en-KE")}
                </Text>
                <Text className="text-[11px] font-bold text-rose-700">
                  Fee ({order.commissionPercent}%): Ksh{" "}
                  {order.platformCommissionKsh.toLocaleString("en-KE")}
                </Text>
                <Text className="text-xs font-extrabold text-emerald-700">
                  Net: Ksh {order.merchantNetAmountKsh.toLocaleString("en-KE")}
                </Text>
              </View>

              {/* Customer Status Note */}
              <Text className="text-[11px] text-rose-800/85 mt-2">
                Customer notice: {order.customerUpdateMessage}
              </Text>

              {/* Delivery Status Action Buttons */}
              <View className="flex-row flex-wrap gap-1.5 mt-3">
                {DELIVERY_ACTIONS.map((nextStatus) => {
                  const active = order.status === nextStatus;
                  return (
                    <Pressable
                      key={nextStatus}
                      disabled={mutating}
                      onPress={() => {
                        setSelectedOrderId(order.id);
                        void onUpdateStatus(
                          order.id,
                          nextStatus,
                          isEditing && noteDraft.trim()
                            ? noteDraft.trim()
                            : undefined,
                        );
                        if (isEditing) setNoteDraft("");
                      }}
                      className={`px-2.5 py-1.5 rounded-full border ${
                        active
                          ? "bg-rose-600 border-rose-600"
                          : "bg-rose-50/70 border-rose-200"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-extrabold ${
                          active ? "text-white" : "text-rose-950"
                        }`}
                      >
                        {nextStatus}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Custom Message to Buyer */}
              <View className="mt-2.5">
                <TextInput
                  value={isEditing ? noteDraft : ""}
                  onFocus={() => setSelectedOrderId(order.id)}
                  onChangeText={setNoteDraft}
                  placeholder="Optional update note for buyer (e.g. rider at gate)..."
                  placeholderTextColor="#FDA4AF"
                  className="bg-rose-50/60 border border-rose-200 rounded-2xl px-3 py-2 text-xs text-rose-950"
                />
              </View>
            </View>
          );
        })
      )}
    </Animated.View>
  );
}

export default ShopOrdersDeliveryPanel;
