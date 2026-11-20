import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  MerchantPayoutSettings,
  PayoutChannelType,
  SaveMerchantPayoutInput,
} from "../types/payout.types";

export interface MerchantPayoutFormProps {
  initialSettings?: MerchantPayoutSettings | null;
  saving?: boolean;
  externalError?: string | null;
  onSave: (
    payload: Omit<SaveMerchantPayoutInput, "shopId">,
  ) => void | Promise<void>;
  className?: string;
}

const CHANNELS: readonly {
  id: PayoutChannelType;
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "till",
    label: "M-Pesa Till",
    placeholder: "Enter Till number",
    icon: "storefront-outline",
  },
  {
    id: "paybill",
    label: "PayBill",
    placeholder: "Enter PayBill number",
    icon: "business-outline",
  },
  {
    id: "phone",
    label: "Phone (+254)",
    placeholder: "+2547...",
    icon: "call-outline",
  },
];

export function MerchantPayoutForm({
  initialSettings,
  saving = false,
  externalError = null,
  onSave,
  className = "",
}: MerchantPayoutFormProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [idOrRegistrationNumber, setIdOrRegistrationNumber] = useState(
    initialSettings?.idOrRegistrationNumber ?? "",
  );
  const [legalAccountName, setLegalAccountName] = useState(
    initialSettings?.legalAccountName ?? "",
  );
  const [payoutChannel, setPayoutChannel] = useState<PayoutChannelType>(
    initialSettings?.payoutChannel ?? "till",
  );
  const [recipientDestination, setRecipientDestination] = useState(
    initialSettings?.recipientDestination ?? "",
  );
  const [paybillAccountNumber, setPaybillAccountNumber] = useState(
    initialSettings?.paybillAccountNumber ?? "",
  );
  const [submitForVerification, setSubmitForVerification] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialSettings) return;
    setIdOrRegistrationNumber(initialSettings.idOrRegistrationNumber);
    setLegalAccountName(initialSettings.legalAccountName);
    setPayoutChannel(initialSettings.payoutChannel);
    setRecipientDestination(initialSettings.recipientDestination);
    setPaybillAccountNumber(initialSettings.paybillAccountNumber ?? "");
  }, [initialSettings]);

  const commissionPercent = initialSettings?.platformFeePercent ?? 5;
  const sampleGiftPriceKsh = 5000;
  const sampleFeeKsh = Math.round(
    (sampleGiftPriceKsh * commissionPercent) / 100,
  );
  const sampleNetKsh = sampleGiftPriceKsh - sampleFeeKsh;

  const activeChannelMeta =
    CHANNELS.find((c) => c.id === payoutChannel) ?? CHANNELS[0];

  const handleSubmit = async () => {
    if (!idOrRegistrationNumber.trim()) {
      setLocalError("Enter your National ID or Business Registration number.");
      return;
    }
    if (!legalAccountName.trim()) {
      setLocalError("Enter the name on your ID or Till/PayBill.");
      return;
    }
    if (!recipientDestination.trim()) {
      setLocalError("Enter where buyers should send payments.");
      return;
    }
    if (payoutChannel === "paybill" && !paybillAccountNumber.trim()) {
      setLocalError("Enter your PayBill Account Number.");
      return;
    }

    setLocalError(null);
    await onSave({
      idOrRegistrationNumber: idOrRegistrationNumber.trim(),
      legalAccountName: legalAccountName.trim(),
      payoutChannel,
      recipientDestination: recipientDestination.trim(),
      paybillAccountNumber:
        payoutChannel === "paybill" ? paybillAccountNumber.trim() : undefined,
      submitForVerification,
    });
  };

  const displayedError = localError || externalError;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 20) + 12,
      }}
    >
      <Animated.View
        entering={FadeInDown.springify().damping(15)}
        className={`bg-white rounded-3xl border border-rose-100 shadow-xs ${
          isCompact ? "p-3.5" : "p-5"
        } ${className}`}
      >
        <View className="flex-row items-center justify-between mb-3.5">
          <View className="flex-row items-center gap-2.5">
            <View className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center">
              <Ionicons name="card-outline" size={20} color="#E11D48" />
            </View>
            <View>
              <Text className="text-base font-extrabold text-rose-950">
                Shop ID & Payment Target
              </Text>
              <Text className="text-[11px] text-rose-700/75">
                Where buyer gift payments route & {commissionPercent}% fee rule
              </Text>
            </View>
          </View>

          <View className="bg-rose-950 px-2.5 py-1 rounded-full">
            <Text className="text-[10px] font-extrabold text-rose-200">
              {initialSettings?.verificationStatus ?? "Unverified"}
            </Text>
          </View>
        </View>

        <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4">
          <Text className="text-[11px] font-extrabold text-rose-950">
            Platform Commission ({commissionPercent}% per gift sale)
          </Text>
          <Text className="text-[11px] text-rose-800/85 mt-0.5">
            Sample Ksh {sampleGiftPriceKsh.toLocaleString("en-KE")} gift: fee
            Ksh {sampleFeeKsh.toLocaleString("en-KE")} • net Ksh{" "}
            {sampleNetKsh.toLocaleString("en-KE")}.
          </Text>
        </View>

        {displayedError ? (
          <View className="flex-row items-center gap-2 bg-rose-50 border border-rose-300 rounded-2xl p-3 mb-3.5">
            <Ionicons name="alert-circle" size={17} color="#E11D48" />
            <Text className="text-xs font-bold text-rose-800 flex-1">
              {displayedError}
            </Text>
          </View>
        ) : null}

        <View className="gap-3.5">
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              National ID or Business Reg. No. *
            </Text>
            <TextInput
              value={idOrRegistrationNumber}
              onChangeText={(t) => {
                setIdOrRegistrationNumber(t);
                if (localError) setLocalError(null);
              }}
              placeholder="National ID or Business Reg. No."
              placeholderTextColor="#FDA4AF"
              className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm font-bold text-rose-950"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              Account / Shop Owner Name *
            </Text>
            <TextInput
              value={legalAccountName}
              onChangeText={(t) => {
                setLegalAccountName(t);
                if (localError) setLocalError(null);
              }}
              placeholder="Name matching ID or Till"
              placeholderTextColor="#FDA4AF"
              className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1.5">
              Buyer Payment Destination Type
            </Text>
            <View className="flex-row gap-2">
              {CHANNELS.map((ch) => {
                const active = payoutChannel === ch.id;
                return (
                  <Pressable
                    key={ch.id}
                    onPress={() => {
                      setPayoutChannel(ch.id);
                      if (localError) setLocalError(null);
                    }}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border ${
                      active
                        ? "bg-rose-600 border-rose-600"
                        : "bg-white border-rose-200"
                    }`}
                  >
                    <Ionicons
                      name={ch.icon}
                      size={15}
                      color={active ? "#FFFFFF" : "#E11D48"}
                    />
                    <Text
                      numberOfLines={1}
                      className={`text-[11px] font-extrabold ${
                        active ? "text-white" : "text-rose-950"
                      }`}
                    >
                      {ch.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              {activeChannelMeta.label} Number *
            </Text>
            <TextInput
              value={recipientDestination}
              onChangeText={(t) => {
                setRecipientDestination(t);
                if (localError) setLocalError(null);
              }}
              keyboardType={
                payoutChannel === "phone" ? "phone-pad" : "number-pad"
              }
              placeholder={activeChannelMeta.placeholder}
              placeholderTextColor="#FDA4AF"
              className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm font-extrabold text-rose-950"
            />
          </View>

          {payoutChannel === "paybill" && (
            <View>
              <Text className="text-xs font-bold text-rose-950 mb-1">
                PayBill Account Number *
              </Text>
              <TextInput
                value={paybillAccountNumber}
                onChangeText={(t) => {
                  setPaybillAccountNumber(t);
                  if (localError) setLocalError(null);
                }}
                placeholder="Account reference"
                placeholderTextColor="#FDA4AF"
                className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm font-bold text-rose-950"
              />
            </View>
          )}

          <Pressable
            onPress={() => setSubmitForVerification((prev) => !prev)}
            className="flex-row items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-3"
          >
            <Text className="text-xs font-bold text-rose-950 flex-1 pr-2">
              Submit ID & recipient details for verification
            </Text>
            <View
              className={`px-2.5 py-1 rounded-full ${
                submitForVerification ? "bg-rose-600" : "bg-rose-200"
              }`}
            >
              <Text
                className={`text-[10px] font-extrabold ${
                  submitForVerification ? "text-white" : "text-rose-900"
                }`}
              >
                {submitForVerification ? "Yes" : "Draft"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={saving}
            className={`flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl mt-1 ${
              saving ? "opacity-60" : "shadow-xs"
            }`}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text className="text-white text-sm font-extrabold">
              {saving ? "Saving..." : "Save ID & Payment Recipient"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

export default MerchantPayoutForm;
