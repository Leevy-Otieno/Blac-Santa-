import React from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export type CardSurface = "elevated" | "tinted" | "dark";

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  surface?: CardSurface;
  padded?: boolean;
  delayMs?: number;
  animateEnter?: boolean;
  className?: string;
}

const SURFACE_CLASSES: Record<CardSurface, string> = {
  elevated: "bg-white border border-rose-100 shadow-xs",
  tinted: "bg-rose-50/80 border border-rose-200",
  dark: "bg-rose-950 border border-rose-900",
};

export function Card({
  children,
  onPress,
  surface = "elevated",
  padded = true,
  delayMs = 0,
  animateEnter = true,
  className = "",
}: CardProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePress = () => {
    if (!onPress) return;
    pressScale.value = withSequence(
      withSpring(0.98, { damping: 12 }),
      withSpring(1, { damping: 14 }),
    );
    onPress();
  };

  const paddingClass = padded ? (isCompact ? "p-3.5" : "p-4") : "";
  const baseCardClass = `rounded-3xl overflow-hidden ${SURFACE_CLASSES[surface]} ${paddingClass} ${className}`;

  const body = onPress ? (
    <Animated.View style={pressStyle}>
      <Pressable
        onPress={handlePress}
        className={`${baseCardClass} ${
          surface === "dark" ? "active:bg-rose-900" : "active:bg-rose-50/40"
        }`}
      >
        {children}
      </Pressable>
    </Animated.View>
  ) : (
    <View className={baseCardClass}>{children}</View>
  );

  if (!animateEnter) {
    return body;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(delayMs).springify().damping(15)}
      layout={Layout.springify()}
    >
      {body}
    </Animated.View>
  );
}

export default Card;
