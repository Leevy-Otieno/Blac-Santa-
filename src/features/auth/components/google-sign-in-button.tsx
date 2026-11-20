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
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export type GoogleButtonVariant = "dark" | "light" | "outline";

export interface GoogleSignInButtonProps {
  onPress: () => void | Promise<void>;
  label?: string;
  subtitle?: string;
  variant?: GoogleButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  errorText?: string | null;
  className?: string;
}

const VARIANT_CONFIG: Record<
  GoogleButtonVariant,
  {
    container: string;
    title: string;
    subtitle: string;
    badgeBg: string;
    iconColor: string;
    spinnerColor: string;
  }
> = {
  dark: {
    container: "bg-rose-950 active:bg-rose-900 border border-rose-800",
    title: "text-white",
    subtitle: "text-rose-200/80",
    badgeBg: "bg-white",
    iconColor: "#E11D48",
    spinnerColor: "#FFFFFF",
  },
  light: {
    container: "bg-white active:bg-rose-50 border border-rose-200 shadow-xs",
    title: "text-rose-950",
    subtitle: "text-rose-700/75",
    badgeBg: "bg-rose-50",
    iconColor: "#E11D48",
    spinnerColor: "#E11D48",
  },
  outline: {
    container: "bg-rose-50/70 active:bg-rose-100 border border-rose-300",
    title: "text-rose-950",
    subtitle: "text-rose-800/75",
    badgeBg: "bg-white",
    iconColor: "#BE123C",
    spinnerColor: "#BE123C",
  },
};

export function GoogleSignInButton({
  onPress,
  label = "Continue with Google",
  subtitle,
  variant = "dark",
  loading = false,
  disabled = false,
  errorText = null,
  className = "",
}: GoogleSignInButtonProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isInactive = disabled || loading;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    if (isInactive) return;
    scale.value = withSequence(
      withSpring(0.96, { damping: 10, stiffness: 260 }),
      withSpring(1, { damping: 12, stiffness: 220 }),
    );
    await onPress();
  };

  const cfg = VARIANT_CONFIG[variant];

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`w-full ${className}`}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          disabled={isInactive}
          className={`flex-row items-center justify-between rounded-2xl ${
            isCompact ? "px-3.5 py-3" : "px-4 py-3.5"
          } ${cfg.container} ${isInactive ? "opacity-55" : ""}`}
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View
              className={`h-9 w-9 rounded-xl ${cfg.badgeBg} items-center justify-center`}
            >
              <Ionicons name="logo-google" size={18} color={cfg.iconColor} />
            </View>

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className={`${
                  isCompact ? "text-xs" : "text-sm"
                } font-extrabold ${cfg.title}`}
              >
                {loading ? "Connecting Google..." : label}
              </Text>
              {subtitle ? (
                <Text
                  numberOfLines={1}
                  className={`text-[11px] mt-0.5 ${cfg.subtitle}`}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={cfg.spinnerColor} />
          ) : (
            <Ionicons
              name="arrow-forward"
              size={17}
              color={variant === "dark" ? "#FDA4AF" : "#E11D48"}
            />
          )}
        </Pressable>
      </Animated.View>

      {errorText ? (
        <View className="flex-row items-center gap-1.5 mt-1.5 px-1">
          <Ionicons name="alert-circle" size={14} color="#E11D48" />
          <Text className="text-[11px] font-bold text-rose-700 flex-1">
            {errorText}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

export default GoogleSignInButton;
