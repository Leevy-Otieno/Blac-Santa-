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

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon = "gift-outline",
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
}: EmptyStateProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380 || compact;

  const ctaScale = useSharedValue(1);
  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const handlePrimaryPress = () => {
    if (!onAction) return;
    ctaScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );
    onAction();
  };

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`w-full bg-white rounded-3xl border border-rose-100 items-center shadow-xs ${
        isSmallScreen ? "p-6" : "p-8"
      }`}
    >
      <View className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center mb-3.5">
        <Ionicons name={icon} size={28} color="#E11D48" />
      </View>

      <Text
        className={`${
          isSmallScreen ? "text-base" : "text-lg"
        } font-extrabold text-rose-950 text-center`}
      >
        {title}
      </Text>

      <Text className="text-xs text-rose-700/80 text-center mt-1.5 leading-5 max-w-xs">
        {description}
      </Text>

      {(actionLabel || secondaryActionLabel) && (
        <View className="w-full mt-5 gap-2.5">
          {actionLabel && onAction && (
            <Animated.View style={ctaAnimatedStyle}>
              <Pressable
                onPress={handlePrimaryPress}
                className="bg-rose-600 active:bg-rose-700 py-3.5 px-5 rounded-2xl items-center"
              >
                <Text className="text-white text-xs font-extrabold">
                  {actionLabel}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Pressable
              onPress={onSecondaryAction}
              className="bg-rose-50 border border-rose-200 active:bg-rose-100 py-3 px-5 rounded-2xl items-center"
            >
              <Text className="text-rose-800 text-xs font-bold">
                {secondaryActionLabel}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

export default EmptyState;
