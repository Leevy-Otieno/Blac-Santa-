import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { PaymentPromptOutcome } from "../../orders/types/order.types";

export interface MpesaOrderCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  giftTitle: string;
  unitPriceKsh: number;
  commissionPercent: number;
  availableStock: number;
  shopName: string;
  recipientDestination: string;
  submitting?: boolean;
  failureNotice?: string | null;
  onSubmitOrderWithMpesa: (payload: {
    buyerName: string;
    buyerPhone: string;
    deliveryAddress: string;
    quantity: number;
    simulatedOutcome: PaymentPromptOutcome;
  }) => void | Promise<void>;
}

export function MpesaOrderCheckoutModal({
  visible,
  onClose,
  giftTitle,
  unitPriceKsh,
  commissionPercent,
  availableStock,
  shopName,
  recipientDestination,
  submitting = false,
  failureNotice = null,
  onSubmitOrderWithMpesa,
}: MpesaOrderCheckoutModalProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("+2547");
  const [deliveryAddress, setDeliveryAddress] = useState("Nairobi");
  const [quantity, setQuantity] = useState(1);
  const [simulatedOutcome, setSimulatedOutcome] =
    useState<PaymentPromptOutcome>("pin_completed");
  const [localError, setLocalError] = useState<string | null>(null);

  const safeMaxQty = Math.max(1, availableStock);
  const grossKsh = unitPriceKsh * quantity;
  const feeKsh = Math.round((grossKsh * commissionPercent) / 100);
  const netKsh = grossKsh - feeKsh;

  const handleTriggerMpesa = async () => {
    if (availableStock <= 0) {
      setLocalError("This gift is currently out of stock.");
      return;
    }
    if (!buyerName.trim()) {
      setLocalError("Enter your name for the order.");
      return;
    }
    const digits = buyerPhone.replace(/\D/g, "");
    const normalized = digits.startsWith("0")
      ? `254${digits.slice(1)}`
      : digits.startsWith("254")
        ? digits
        : `254${digits}`;
    if (normalized.length !== 12) {
      setLocalError("Enter a valid Kenyan M-Pesa number (+254712345678).");
      return;
    }
    if (!deliveryAddress.trim()) {
      setLocalError("Enter where the gift should be delivered.");
      return;
    }

    setLocalError(null);
    await onSubmitOrderWithMpesa({
      buyerName: buyerName.trim(),
      buyerPhone: `+${normalized.slice(0, 12)}`,
      deliveryAddress: deliveryAddress.trim(),
      quantity,
      simulatedOutcome,
    });
  };

  const displayedError = localError || failureNotice;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-rose-950/60">
        <Animated.View
          entering={FadeIn.duration(180)}
          className="flex-1 justify-end"
        >
          <Pressable className="flex-1" onPress={onClose} />

          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            className={`bg-white rounded-t-3xl border-t border-rose-100 pt-3 ${
              isCompact ? "px-3.5" : "px-4"
            }`}
          >
            <View className="w-10 h-1.5 rounded-full bg-rose-200 self-center mb-3" />

            <View className="flex-row items-center justify-between pb-3 border-b border-rose-100">
              <View className="flex-1 pr-2">
                <Text className="text-base font-extrabold text-rose-950">
                  M-Pesa Gift Order
                </Text>
                <Text numberOfLines={1} className="text-xs text-rose-700/75">
                  {giftTitle} • {shopName} ({availableStock} in stock)
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={20} color="#881337" />
              </Pressable>
            </View>

            {displayedError ? (
              <View className="flex-row items-start gap-2 bg-rose-50 border border-rose-300 rounded-2xl p-3 mt-3">
                <Ionicons name="alert-circle" size={18} color="#E11D48" />
                <Text className="text-xs font-bold text-rose-800 flex-1 leading-4">
                  {displayedError}
                </Text>
              </View>
            ) : null}

            <View className="gap-2.5 mt-3">
              {/* Quantity */}
              <View className="flex-row items-center justify-between bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2">
                <Text className="text-xs font-bold text-rose-950">
                  Quantity (Max {safeMaxQty})
                </Text>
                <View className="flex-row items-center gap-3">
                  <Pressable
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-7 w-7 rounded-full bg-white border border-rose-200 items-center justify-center"
                  >
                    <Ionicons name="remove" size={15} color="#881337" />
                  </Pressable>
                  <Text className="text-sm font-extrabold text-rose-950">
                    {quantity}
                  </Text>
                  <Pressable
                    onPress={() =>
                      setQuantity((q) => Math.min(safeMaxQty, q + 1))
                    }
                    className="h-7 w-7 rounded-full bg-white border border-rose-200 items-center justify-center"
                  >
                    <Ionicons name="add" size={15} color="#881337" />
                  </Pressable>
                </View>
              </View>

              <TextInput
                value={buyerName}
                onChangeText={setBuyerName}
                placeholder="Your Full Name"
                placeholderTextColor="#FDA4AF"
                className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-rose-950"
              />

              <TextInput
                value={buyerPhone}
                onChangeText={setBuyerPhone}
                keyboardType="phone-pad"
                placeholder="M-Pesa Number (+254712345678)"
                placeholderTextColor="#FDA4AF"
                className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-rose-950"
              />

              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Delivery Location (e.g. Westlands, Nairobi)"
                placeholderTextColor="#FDA4AF"
                className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs text-rose-950"
              />

              {/* Test/Gateway PIN Outcome Selector */}
              <View>
                <Text className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 mb-1">
                  M-Pesa PIN Prompt Result
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {(
                    [
                      ["pin_completed", "PIN Entered"],
                      ["user_cancelled_pin", "PIN Cancelled"],
                      ["wrong_pin_or_insufficient", "Wrong PIN / Balance"],
                      ["timeout_no_pin", "PIN Timed Out"],
                    ] as const
                  ).map(([val, label]) => {
                    const active = simulatedOutcome === val;
                    return (
                      <Pressable
                        key={val}
                        onPress={() => setSimulatedOutcome(val)}
                        className={`px-2.5 py-1.5 rounded-full border ${
                          active
                            ? "bg-rose-950 border-rose-950"
                            : "bg-rose-50 border-rose-200"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-extrabold ${
                            active ? "text-white" : "text-rose-950"
                          }`}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Breakdown */}
              <View className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3 mt-0.5">
                <Text className="text-[11px] font-extrabold text-rose-950">
                  Total: Ksh {grossKsh.toLocaleString("en-KE")} → Vendor Target:{" "}
                  {recipientDestination || "Pending Setup"}
                </Text>
                <Text className="text-[10px] text-rose-700 mt-0.5">
                  Platform Fee ({commissionPercent}%): Ksh{" "}
                  {feeKsh.toLocaleString("en-KE")} • Vendor Net: Ksh{" "}
                  {netKsh.toLocaleString("en-KE")}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleTriggerMpesa}
              disabled={submitting || availableStock <= 0}
              className={`flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl mt-3.5 ${
                submitting || availableStock <= 0 ? "opacity-60" : "shadow-xs"
              }`}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={17}
                color="#FFFFFF"
              />
              <Text className="text-white text-sm font-extrabold">
                {submitting
                  ? "Waiting for M-Pesa PIN..."
                  : `Send M-Pesa Prompt • Ksh ${grossKsh.toLocaleString("en-KE")}`}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default MpesaOrderCheckoutModal;
