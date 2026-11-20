import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export type BuyerCategoryId = "For Him" | "For Her" | "Kids" | "Boss";

export interface BuyerCategoryItem {
  id: BuyerCategoryId;
  label: string;
  tagline: string;
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
}

export interface CategoryGridProps {
  categories?: readonly BuyerCategoryItem[];
  selectedCategory: BuyerCategoryId | null;
  onSelectCategory: (category: BuyerCategoryId | null) => void;
  allowToggleDeselect?: boolean;
  className?: string;
}

const DEFAULT_CATEGORIES: readonly BuyerCategoryItem[] = [
  {
    id: "For Her",
    label: "For Her",
    tagline: "Candles, hampers & rose edits",
    icon: "woman-outline",
  },
  {
    id: "For Him",
    label: "For Him",
    tagline: "Leather, tech & daily carry",
    icon: "man-outline",
  },
  {
    id: "Kids",
    label: "Kids",
    tagline: "STEM toys, art & play sets",
    icon: "balloon-outline",
  },
  {
    id: "Boss",
    label: "Boss",
    tagline: "Desk gear, flasks & appreciation",
    icon: "briefcase-outline",
  },
];

function CategoryTile({
  item,
  selected,
  compact,
  index,
  onPress,
}: {
  item: BuyerCategoryItem;
  selected: boolean;
  compact: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 250 }),
      withSpring(1, { damping: 12, stiffness: 210 }),
    );
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 55)
        .springify()
        .damping(15)}
      style={{ width: "48.5%" }}
    >
      <Animated.View style={animStyle}>
        <Pressable
          onPress={handlePress}
          className={`rounded-3xl border ${compact ? "p-3.5" : "p-4"} ${
            selected
              ? "bg-rose-950 border-rose-900 shadow-xs"
              : "bg-white border-rose-100 active:bg-rose-50/70 shadow-xs"
          }`}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <View
              className={`h-10 w-10 rounded-2xl items-center justify-center ${
                selected ? "bg-rose-600" : "bg-rose-50 border border-rose-200"
              }`}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={selected ? "#FFFFFF" : "#E11D48"}
              />
            </View>

            {typeof item.count === "number" ? (
              <View
                className={`px-2 py-0.5 rounded-full ${
                  selected ? "bg-rose-800" : "bg-rose-50"
                }`}
              >
                <Text
                  className={`text-[10px] font-extrabold ${
                    selected ? "text-rose-100" : "text-rose-700"
                  }`}
                >
                  {item.count}
                </Text>
              </View>
            ) : (
              <Ionicons
                name={selected ? "checkmark-circle" : "chevron-forward"}
                size={16}
                color={selected ? "#FDA4AF" : "#FB7185"}
              />
            )}
          </View>

          <Text
            numberOfLines={1}
            className={`text-sm font-extrabold ${
              selected ? "text-white" : "text-rose-950"
            }`}
          >
            {item.label}
          </Text>

          <Text
            numberOfLines={2}
            className={`text-[11px] mt-0.5 leading-4 ${
              selected ? "text-rose-200/80" : "text-rose-700/75"
            }`}
          >
            {item.tagline}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export function CategoryGrid({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
  allowToggleDeselect = true,
  className = "",
}: CategoryGridProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const handleSelect = (id: BuyerCategoryId) => {
    if (allowToggleDeselect && selectedCategory === id) {
      onSelectCategory(null);
      return;
    }
    onSelectCategory(id);
  };

  return (
    <View className={`flex-row flex-wrap justify-between gap-y-3 ${className}`}>
      {categories.map((cat, idx) => (
        <CategoryTile
          key={cat.id}
          item={cat}
          selected={selectedCategory === cat.id}
          compact={isCompact}
          index={idx}
          onPress={() => handleSelect(cat.id)}
        />
      ))}
    </View>
  );
}

export default CategoryGrid;
