import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export interface HintRowProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tag?: string;
  onPress?: () => void;
  delayMs?: number;
  className?: string;
}

export function HintRow({
  title,
  description,
  icon = "sparkles-outline",
  tag,
  onPress,
  delayMs = 0,
  className = "",
}: HintRowProps) {
  const rowContent = (
    <View
      className={`flex-row items-center justify-between bg-rose-50/80 border border-rose-200/90 rounded-2xl px-3.5 py-3 ${className}`}
    >
      <View className="flex-row items-center gap-3 flex-1 pr-2">
        <View className="h-9 w-9 rounded-xl bg-white border border-rose-200 items-center justify-center">
          <Ionicons name={icon} size={17} color="#E11D48" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center flex-wrap gap-1.5">
            <Text className="text-xs font-extrabold text-rose-950">
              {title}
            </Text>
            {tag && (
              <View className="bg-rose-600 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-extrabold text-white">
                  {tag}
                </Text>
              </View>
            )}
          </View>
          {description && (
            <Text className="text-[11px] text-rose-800/75 mt-0.5 leading-4">
              {description}
            </Text>
          )}
        </View>
      </View>

      {onPress && <Ionicons name="chevron-forward" size={16} color="#E11D48" />}
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(delayMs).springify().damping(15)}>
      {onPress ? (
        <Pressable onPress={onPress} className="active:opacity-85">
          {rowContent}
        </Pressable>
      ) : (
        rowContent
      )}
    </Animated.View>
  );
}

export default HintRow;
