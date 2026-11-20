import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "dark"
  | "ghost"
  | "whatsapp";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { container: string; text: string; iconColor: string; spinnerColor: string }
> = {
  primary: {
    container: "bg-rose-600 active:bg-rose-700 border border-rose-600",
    text: "text-white",
    iconColor: "#FFFFFF",
    spinnerColor: "#FFFFFF",
  },
  secondary: {
    container: "bg-rose-50 active:bg-rose-100 border border-rose-200",
    text: "text-rose-800",
    iconColor: "#E11D48",
    spinnerColor: "#E11D48",
  },
  dark: {
    container: "bg-rose-950 active:bg-rose-900 border border-rose-900",
    text: "text-white",
    iconColor: "#FFFFFF",
    spinnerColor: "#FFFFFF",
  },
  ghost: {
    container: "bg-transparent active:bg-rose-50 border border-transparent",
    text: "text-rose-700",
    iconColor: "#E11D48",
    spinnerColor: "#E11D48",
  },
  whatsapp: {
    container: "bg-rose-600 active:bg-rose-700 border border-rose-500",
    text: "text-white",
    iconColor: "#FFFFFF",
    spinnerColor: "#FFFFFF",
  },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = true,
}: ButtonProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isInactive = disabled || loading;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isInactive) return;
    scale.value = withSequence(
      withSpring(0.96, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );
    onPress();
  };

  const styles = VARIANT_STYLES[variant];
  const resolvedIcon =
    variant === "whatsapp" ? (icon ?? "logo-whatsapp") : icon;

  const sizeClass =
    size === "sm"
      ? "py-2.5 px-3.5 rounded-xl"
      : size === "lg"
        ? "py-4 px-5 rounded-2xl"
        : "py-3.5 px-4 rounded-2xl";

  const textSizeClass =
    size === "sm"
      ? "text-xs"
      : isCompact && size === "lg"
        ? "text-sm"
        : "text-sm";

  return (
    <Animated.View
      style={animatedStyle}
      className={fullWidth ? "w-full" : "self-start"}
    >
      <Pressable
        onPress={handlePress}
        disabled={isInactive}
        className={`flex-row items-center justify-center gap-2 ${sizeClass} ${
          styles.container
        } ${isInactive ? "opacity-55" : "shadow-xs"}`}
      >
        {loading ? (
          <ActivityIndicator size="small" color={styles.spinnerColor} />
        ) : (
          <View className="flex-row items-center justify-center gap-2">
            {resolvedIcon && iconPosition === "left" && (
              <Ionicons
                name={resolvedIcon}
                size={size === "sm" ? 16 : 18}
                color={styles.iconColor}
              />
            )}
            <Text
              numberOfLines={1}
              className={`${textSizeClass} font-extrabold ${styles.text}`}
            >
              {title}
            </Text>
            {resolvedIcon && iconPosition === "right" && (
              <Ionicons
                name={resolvedIcon}
                size={size === "sm" ? 16 : 18}
                color={styles.iconColor}
              />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default Button;
