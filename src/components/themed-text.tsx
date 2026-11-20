import React from "react";
import { Text, type TextProps, useWindowDimensions } from "react-native";

export type ThemedTextRole =
  | "hero"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "accent";

export interface ThemedTextProps extends Omit<TextProps, "style"> {
  role?: ThemedTextRole;
  muted?: boolean;
  className?: string;
}

export function ThemedText({
  role = "body",
  muted = false,
  className = "",
  children,
  ...rest
}: ThemedTextProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const roleClass =
    role === "hero"
      ? `${isCompact ? "text-2xl leading-7" : "text-3xl leading-9"} font-extrabold ${
          muted ? "text-rose-200/80" : "text-rose-950"
        }`
      : role === "title"
        ? `${isCompact ? "text-lg" : "text-xl"} font-extrabold ${
            muted ? "text-rose-800/80" : "text-rose-950"
          }`
        : role === "subtitle"
          ? `text-sm font-bold ${muted ? "text-rose-700/70" : "text-rose-900"}`
          : role === "caption"
            ? `text-xs font-medium leading-4 ${
                muted ? "text-rose-700/70" : "text-rose-800/85"
              }`
            : role === "accent"
              ? "text-xs font-extrabold uppercase tracking-wider text-rose-600"
              : `text-sm leading-5 ${muted ? "text-rose-800/75" : "text-rose-950"}`;

  return (
    <Text className={`${roleClass} ${className}`} {...rest}>
      {children}
    </Text>
  );
}

export default ThemedText;
