import React from "react";
import { View, type ViewProps, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ThemedSurfaceVariant = "canvas" | "card" | "crimson" | "soft";

export interface ThemedViewProps extends Omit<ViewProps, "style"> {
  variant?: ThemedSurfaceVariant;
  padded?: boolean;
  safeTop?: boolean;
  safeBottom?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<ThemedSurfaceVariant, string> = {
  canvas: "bg-rose-50/70",
  card: "bg-white border border-rose-100 rounded-3xl shadow-xs",
  crimson: "bg-rose-950 border border-rose-900 rounded-3xl",
  soft: "bg-rose-50 border border-rose-200 rounded-3xl",
};

export function ThemedView({
  variant = "canvas",
  padded = false,
  safeTop = false,
  safeBottom = false,
  className = "",
  children,
  ...rest
}: ThemedViewProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const paddingClass = padded ? (isCompact ? "p-3.5" : "p-4") : "";

  return (
    <View
      style={{
        paddingTop: safeTop ? Math.max(insets.top, 12) : undefined,
        paddingBottom: safeBottom ? Math.max(insets.bottom, 16) : undefined,
      }}
      className={`${VARIANT_CLASSES[variant]} ${paddingClass} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}

export default ThemedView;
