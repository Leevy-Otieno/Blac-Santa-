import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export interface OccasionPillOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface OccasionPillsProps {
  occasions?: readonly (string | OccasionPillOption)[];
  selectedOccasion: string | null;
  onSelectOccasion: (occasion: string | null) => void;
  includeAllOption?: boolean;
  allLabel?: string;
  className?: string;
}

const DEFAULT_OCCASIONS: readonly OccasionPillOption[] = [
  { id: "Valentine's Day", label: "Valentine's Day", icon: "heart-outline" },
  { id: "Birthdays", label: "Birthdays", icon: "gift-outline" },
  { id: "Christmas", label: "Christmas", icon: "sparkles-outline" },
];

function normalizeOccasion(
  item: string | OccasionPillOption,
): OccasionPillOption {
  if (typeof item === "string") {
    return { id: item, label: item, icon: "sparkles-outline" };
  }
  return item;
}

function PillItem({
  label,
  icon,
  selected,
  index,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.94, { damping: 10, stiffness: 260 }),
      withSpring(1, { damping: 12, stiffness: 220 }),
    );
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 45)
        .springify()
        .damping(15)}
      className="mr-2"
    >
      <Animated.View style={animStyle}>
        <Pressable
          onPress={handlePress}
          className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${
            selected
              ? "bg-rose-600 border-rose-600 shadow-xs"
              : "bg-white border-rose-200 active:bg-rose-50"
          }`}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={14}
              color={selected ? "#FFFFFF" : "#E11D48"}
            />
          )}
          <Text
            numberOfLines={1}
            className={`text-xs font-extrabold ${
              selected ? "text-white" : "text-rose-950"
            }`}
          >
            {label}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export function OccasionPills({
  occasions = DEFAULT_OCCASIONS,
  selectedOccasion,
  onSelectOccasion,
  includeAllOption = true,
  allLabel = "All Occasions",
  className = "",
}: OccasionPillsProps) {
  const normalizedList = occasions.map(normalizeOccasion);
  const isAllSelected = selectedOccasion === null;

  return (
    <View className={className}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2, paddingRight: 12 }}
      >
        {includeAllOption && (
          <PillItem
            label={allLabel}
            icon="grid-outline"
            selected={isAllSelected}
            index={0}
            onPress={() => onSelectOccasion(null)}
          />
        )}

        {normalizedList.map((occ, idx) => (
          <PillItem
            key={occ.id}
            label={occ.label}
            icon={occ.icon}
            selected={selectedOccasion === occ.id}
            index={includeAllOption ? idx + 1 : idx}
            onPress={() =>
              onSelectOccasion(selectedOccasion === occ.id ? null : occ.id)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default OccasionPills;
