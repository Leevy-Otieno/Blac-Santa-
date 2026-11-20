import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export type BadgeTone = "crimson" | "soft" | "dark" | "success" | "warning";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  uppercase?: boolean;
  animated?: boolean;
}

const TONE_STYLES: Record<
  BadgeTone,
  { container: string; text: string; iconColor: string }
> = {
  crimson: {
    container: "bg-rose-600 border-rose-600",
    text: "text-white",
    iconColor: "#FFFFFF",
  },
  soft: {
    container: "bg-rose-50 border-rose-200",
    text: "text-rose-800",
    iconColor: "#E11D48",
  },
  dark: {
    container: "bg-rose-950 border-rose-900",
    text: "text-rose-100",
    iconColor: "#FDA4AF",
  },
  success: {
    container: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    iconColor: "#059669",
  },
  warning: {
    container: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    iconColor: "#D97706",
  },
};

export function Badge({
  label,
  tone = "soft",
  size = "sm",
  icon,
  uppercase = false,
  animated = false,
}: BadgeProps) {
  const styles = TONE_STYLES[tone];
  const paddingClass = size === "md" ? "px-3 py-1.5" : "px-2.5 py-1";
  const textSizeClass = size === "md" ? "text-xs" : "text-[11px]";
  const iconSize = size === "md" ? 13 : 11;

  const content = (
    <View
      className={`self-start flex-row items-center gap-1 rounded-full border ${styles.container} ${paddingClass}`}
    >
      {icon && <Ionicons name={icon} size={iconSize} color={styles.iconColor} />}
      <Text
        numberOfLines={1}
        className={`${textSizeClass} font-extrabold ${styles.text} ${
          uppercase ? "uppercase tracking-wider" : ""
        }`}
      >
        {label}
      </Text>
    </View>
  );

  if (animated) {
    return <Animated.View entering={FadeIn.duration(220)}>{content}</Animated.View>;
  }

  return content;
}

export default Badge;