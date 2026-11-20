import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BuyerCategoryId } from "./category-grid";

export type BudgetRangePresetId =
  | "all"
  | "under-2500"
  | "2500-5000"
  | "5000-10000"
  | "10000-plus";

export type GiftSortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "popular";

export interface BuyerDiscoveryFilterState {
  category: BuyerCategoryId | null;
  occasion: string | null;
  budgetPreset: BudgetRangePresetId;
  minKsh: number;
  maxKsh: number | null;
  ageGroup: string | null;
  sortBy: GiftSortOption;
}

export interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  value: BuyerDiscoveryFilterState;
  onApply: (next: BuyerDiscoveryFilterState) => void;
  occasions?: readonly string[];
  ageGroups?: readonly string[];
}

const DEFAULT_OCCASIONS = [
  "Valentine's Day",
  "Birthdays",
  "Christmas",
] as const;

const DEFAULT_AGE_GROUPS = [
  "All Ages",
  "6–12",
  "18–24",
  "25–34",
  "35+",
] as const;

const BUDGET_PRESETS: readonly {
  id: BudgetRangePresetId;
  label: string;
  minKsh: number;
  maxKsh: number | null;
}[] = [
  { id: "all", label: "All Budgets (Ksh 500+)", minKsh: 500, maxKsh: null },
  { id: "under-2500", label: "Under Ksh 2,500", minKsh: 500, maxKsh: 2500 },
  { id: "2500-5000", label: "Ksh 2,500 – 5,000", minKsh: 2500, maxKsh: 5000 },
  {
    id: "5000-10000",
    label: "Ksh 5,000 – 10,000",
    minKsh: 5000,
    maxKsh: 10000,
  },
  {
    id: "10000-plus",
    label: "Above Ksh 10,000",
    minKsh: 10001,
    maxKsh: null,
  },
];

const SORT_OPTIONS: readonly { id: GiftSortOption; label: string }[] = [
  { id: "featured", label: "Curated Pick" },
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
  { id: "popular", label: "Most Ordered" },
];

const CATEGORIES: readonly BuyerCategoryId[] = [
  "For Her",
  "For Him",
  "Kids",
  "Boss",
];

const MIN_ALLOWED_KSH = 500;
const MAX_ALLOWED_KSH = 250000;

export function FilterDrawer({
  visible,
  onClose,
  value,
  onApply,
  occasions = DEFAULT_OCCASIONS,
  ageGroups = DEFAULT_AGE_GROUPS,
}: FilterDrawerProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [draft, setDraft] = useState<BuyerDiscoveryFilterState>(value);
  const [minText, setMinText] = useState(
    String(value.minKsh ?? MIN_ALLOWED_KSH),
  );
  const [maxText, setMaxText] = useState(
    value.maxKsh === null ? "" : String(value.maxKsh),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setMinText(String(value.minKsh ?? MIN_ALLOWED_KSH));
      setMaxText(value.maxKsh === null ? "" : String(value.maxKsh));
      setValidationError(null);
    }
  }, [visible, value]);

  const handleSelectBudgetPreset = (
    preset: (typeof BUDGET_PRESETS)[number],
  ) => {
    setValidationError(null);
    setDraft((prev) => ({
      ...prev,
      budgetPreset: preset.id,
      minKsh: preset.minKsh,
      maxKsh: preset.maxKsh,
    }));
    setMinText(String(preset.minKsh));
    setMaxText(preset.maxKsh === null ? "" : String(preset.maxKsh));
  };

  const handleReset = () => {
    const resetState: BuyerDiscoveryFilterState = {
      category: null,
      occasion: null,
      budgetPreset: "all",
      minKsh: MIN_ALLOWED_KSH,
      maxKsh: null,
      ageGroup: null,
      sortBy: "featured",
    };
    setDraft(resetState);
    setMinText(String(MIN_ALLOWED_KSH));
    setMaxText("");
    setValidationError(null);
  };

  const handleApply = () => {
    const cleanMinDigits = minText.replace(/\D/g, "");
    const cleanMaxDigits = maxText.replace(/\D/g, "");

    const parsedMin = cleanMinDigits ? Number(cleanMinDigits) : MIN_ALLOWED_KSH;
    const parsedMax = cleanMaxDigits ? Number(cleanMaxDigits) : null;

    if (parsedMin < MIN_ALLOWED_KSH || parsedMin > MAX_ALLOWED_KSH) {
      setValidationError(
        `Minimum budget must be between Ksh ${MIN_ALLOWED_KSH.toLocaleString(
          "en-KE",
        )} and Ksh ${MAX_ALLOWED_KSH.toLocaleString("en-KE")}.`,
      );
      return;
    }

    if (parsedMax !== null) {
      if (parsedMax < MIN_ALLOWED_KSH || parsedMax > MAX_ALLOWED_KSH) {
        setValidationError(
          `Maximum budget must be between Ksh ${MIN_ALLOWED_KSH.toLocaleString(
            "en-KE",
          )} and Ksh ${MAX_ALLOWED_KSH.toLocaleString("en-KE")}.`,
        );
        return;
      }
      if (parsedMin > parsedMax) {
        setValidationError("Minimum budget cannot exceed maximum budget.");
        return;
      }
    }

    setValidationError(null);
    onApply({
      ...draft,
      minKsh: parsedMin,
      maxKsh: parsedMax,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-rose-950/60"
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          className="flex-1 justify-end"
        >
          <Pressable className="flex-1" onPress={onClose} />

          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={{
              maxHeight: Math.round(height * 0.88),
              paddingBottom: Math.max(insets.bottom, 20),
            }}
            className="bg-white rounded-t-3xl border-t border-rose-100 pt-3 px-4 shadow-lg"
          >
            {/* Drag Handle */}
            <View className="w-10 h-1.5 rounded-full bg-rose-200 self-center mb-3" />

            {/* Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-rose-100">
              <View>
                <Text className="text-lg font-extrabold text-rose-950">
                  Filter Gift Catalog
                </Text>
                <Text className="text-xs text-rose-700/75">
                  Recipient, occasion, Ksh budget (including 10k+) & sorting
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="h-9 w-9 rounded-full bg-rose-50 border border-rose-200 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#881337" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 14, gap: 16 }}
            >
              {validationError ? (
                <View className="flex-row items-center gap-2 bg-rose-50 border border-rose-300 rounded-2xl p-3">
                  <Ionicons name="alert-circle" size={17} color="#E11D48" />
                  <Text className="text-xs font-bold text-rose-800 flex-1">
                    {validationError}
                  </Text>
                </View>
              ) : null}

              {/* Recipient Category */}
              <View>
                <Text className="text-xs font-extrabold text-rose-950 uppercase tracking-wider mb-2">
                  Recipient
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = draft.category === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() =>
                          setDraft((prev) => ({
                            ...prev,
                            category: prev.category === cat ? null : cat,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-full border ${
                          active
                            ? "bg-rose-600 border-rose-600"
                            : "bg-rose-50/70 border-rose-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-rose-950"
                          }`}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Occasion */}
              <View>
                <Text className="text-xs font-extrabold text-rose-950 uppercase tracking-wider mb-2">
                  Occasion
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {occasions.map((occ) => {
                    const active = draft.occasion === occ;
                    return (
                      <Pressable
                        key={occ}
                        onPress={() =>
                          setDraft((prev) => ({
                            ...prev,
                            occasion: prev.occasion === occ ? null : occ,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-full border ${
                          active
                            ? "bg-rose-950 border-rose-950"
                            : "bg-rose-50/70 border-rose-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-rose-950"
                          }`}
                        >
                          {occ}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Budget Presets + Custom Ksh Bounds */}
              <View>
                <Text className="text-xs font-extrabold text-rose-950 uppercase tracking-wider mb-2">
                  Budget (Ksh 500 – 10,000 & 10,000+)
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {BUDGET_PRESETS.map((preset) => {
                    const active = draft.budgetPreset === preset.id;
                    return (
                      <Pressable
                        key={preset.id}
                        onPress={() => handleSelectBudgetPreset(preset)}
                        className={`px-3 py-2 rounded-full border ${
                          active
                            ? "bg-rose-600 border-rose-600"
                            : "bg-white border-rose-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-rose-950"
                          }`}
                        >
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="flex-row items-center gap-2.5">
                  <View className="flex-1 bg-rose-50/70 border border-rose-200 rounded-2xl px-3 py-2">
                    <Text className="text-[10px] font-bold text-rose-600">
                      Min (Ksh)
                    </Text>
                    <TextInput
                      value={minText}
                      onChangeText={(t) => {
                        setMinText(t);
                        setDraft((prev) => ({ ...prev, budgetPreset: "all" }));
                      }}
                      keyboardType="number-pad"
                      placeholder="500"
                      placeholderTextColor="#FDA4AF"
                      className="text-sm font-extrabold text-rose-950 pt-0.5"
                    />
                  </View>

                  <Text className="text-xs font-bold text-rose-400">to</Text>

                  <View className="flex-1 bg-rose-50/70 border border-rose-200 rounded-2xl px-3 py-2">
                    <Text className="text-[10px] font-bold text-rose-600">
                      Max (Ksh • blank = No Cap)
                    </Text>
                    <TextInput
                      value={maxText}
                      onChangeText={(t) => {
                        setMaxText(t);
                        setDraft((prev) => ({ ...prev, budgetPreset: "all" }));
                      }}
                      keyboardType="number-pad"
                      placeholder="Any (10,000+)"
                      placeholderTextColor="#FDA4AF"
                      className="text-sm font-extrabold text-rose-950 pt-0.5"
                    />
                  </View>
                </View>
              </View>

              {/* Age Group */}
              <View>
                <Text className="text-xs font-extrabold text-rose-950 uppercase tracking-wider mb-2">
                  Recipient Age Group
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {ageGroups.map((age) => {
                    const active = draft.ageGroup === age;
                    return (
                      <Pressable
                        key={age}
                        onPress={() =>
                          setDraft((prev) => ({
                            ...prev,
                            ageGroup: prev.ageGroup === age ? null : age,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-full border ${
                          active
                            ? "bg-rose-600 border-rose-600"
                            : "bg-rose-50/60 border-rose-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-rose-950"
                          }`}
                        >
                          {age}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Sort Order */}
              <View>
                <Text className="text-xs font-extrabold text-rose-950 uppercase tracking-wider mb-2">
                  Sort Results
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const active = draft.sortBy === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() =>
                          setDraft((prev) => ({ ...prev, sortBy: opt.id }))
                        }
                        className={`px-3 py-2 rounded-2xl border ${
                          active
                            ? "bg-rose-950 border-rose-950"
                            : "bg-white border-rose-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-rose-950"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="flex-row items-center gap-2.5 pt-3 border-t border-rose-100">
              <Pressable
                onPress={handleReset}
                className="bg-rose-50 border border-rose-200 active:bg-rose-100 py-3.5 px-4 rounded-2xl items-center"
              >
                <Text className="text-xs font-extrabold text-rose-800">
                  Reset
                </Text>
              </Pressable>

              <Pressable
                onPress={handleApply}
                className="flex-1 flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl shadow-xs"
              >
                <Ionicons name="options-outline" size={17} color="#FFFFFF" />
                <Text className="text-white text-sm font-extrabold">
                  Apply Filters
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default FilterDrawer;
