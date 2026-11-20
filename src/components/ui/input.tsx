import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  clearable?: boolean;
  onClear?: () => void;
}

export function Input({
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  clearable = false,
  onClear,
  value,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);
  const hasValue = typeof value === "string" && value.length > 0;

  const borderClass = hasError
    ? "border-red-500 bg-red-50/40"
    : focused
      ? "border-rose-600 bg-white"
      : "border-rose-200 bg-rose-50/60";

  return (
    <View className="w-full">
      {label ? (
        <Text className="text-xs font-bold text-rose-950 mb-1.5">{label}</Text>
      ) : null}

      <View
        className={`flex-row items-center rounded-2xl border px-3.5 ${borderClass}`}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={hasError ? "#DC2626" : focused ? "#E11D48" : "#FB7185"}
          />
        )}

        <TextInput
          value={value}
          placeholderTextColor="#FDA4AF"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`flex-1 py-3 text-sm text-rose-950 ${
            leftIcon ? "ml-2.5" : ""
          }`}
          {...rest}
        />

        {clearable && hasValue && onClear ? (
          <Pressable onPress={onClear} hitSlop={8} className="ml-1.5">
            <Ionicons name="close-circle" size={18} color="#FB7185" />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={8}
            className="ml-1.5"
          >
            <Ionicons name={rightIcon} size={18} color="#E11D48" />
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text className="text-[11px] font-bold text-red-600 mt-1">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text className="text-[11px] text-rose-700/75 mt-1">{helperText}</Text>
      ) : null}
    </View>
  );
}

export default Input;
