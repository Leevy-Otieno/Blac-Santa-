import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export interface LoadingSpinnerProps {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  size?: "small" | "large";
}

export function LoadingSpinner({
  label = "Curating gifts for you...",
  sublabel,
  fullScreen = false,
  size = "large",
}: LoadingSpinnerProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      className={
        fullScreen
          ? "flex-1 bg-rose-50/80 items-center justify-center px-6"
          : "w-full py-10 px-4 items-center justify-center"
      }
    >
      <View className="bg-white rounded-3xl px-7 py-6 border border-rose-100 items-center shadow-xs">
        <Animated.View
          style={pulseStyle}
          className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center mb-3 relative"
        >
          <Ionicons name="gift" size={24} color="#E11D48" />
        </Animated.View>

        <ActivityIndicator size={size} color="#E11D48" />

        {label ? (
          <Text className="text-sm font-extrabold text-rose-950 text-center mt-3">
            {label}
          </Text>
        ) : null}

        {sublabel ? (
          <Text className="text-xs text-rose-700/75 text-center mt-1 max-w-[230px]">
            {sublabel}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default LoadingSpinner;
