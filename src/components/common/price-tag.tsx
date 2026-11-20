import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export interface PriceTagProps {
  amountKsh: number;
  originalAmountKsh?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pill" | "dark";
  showBudgetBadge?: boolean;
}

const MIN_BUDGET_KSH = 500;
const MAX_BUDGET_KSH = 10000;

export function formatKsh(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `Ksh ${safe.toLocaleString()}`;
}

export function PriceTag({
  amountKsh,
  originalAmountKsh,
  size = "md",
  variant = "default",
  showBudgetBadge = false,
}: PriceTagProps) {
  const formatted = formatKsh(amountKsh);
  const hasDiscount =
    typeof originalAmountKsh === "number" && originalAmountKsh > amountKsh;
  const discountPercent = hasDiscount
    ? Math.round(((originalAmountKsh - amountKsh) / originalAmountKsh) * 100)
    : 0;

  const isInPlatformRange =
    amountKsh >= MIN_BUDGET_KSH && amountKsh <= MAX_BUDGET_KSH;

  const textSizeClass =
    size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-base";

  if (variant === "pill") {
    return (
      <View className="self-start flex-row items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
        <Ionicons name="pricetag" size={12} color="#E11D48" />
        <Text className={`${textSizeClass} font-extrabold text-rose-700`}>
          {formatted}
        </Text>
      </View>
    );
  }

  if (variant === "dark") {
    return (
      <View className="self-start flex-row items-center gap-2 bg-rose-950 px-3.5 py-1.5 rounded-2xl">
        <Text className={`${textSizeClass} font-extrabold text-white`}>
          {formatted}
        </Text>
        {hasDiscount && (
          <View className="bg-rose-600 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] font-extrabold text-white">
              -{discountPercent}%
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Text className={`${textSizeClass} font-extrabold text-rose-700`}>
        {formatted}
      </Text>

      {hasDiscount && (
        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs font-semibold text-rose-400 line-through">
            {formatKsh(originalAmountKsh)}
          </Text>
          <View className="bg-rose-600 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] font-extrabold text-white">
              Save {discountPercent}%
            </Text>
          </View>
        </View>
      )}

      {showBudgetBadge && isInPlatformRange && (
        <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <Text className="text-[10px] font-bold text-emerald-700">
            In Budget
          </Text>
        </View>
      )}
    </View>
  );
}

export default PriceTag;
