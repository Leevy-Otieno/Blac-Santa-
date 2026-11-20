import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { AppTabItem, AppTabsProps } from "./app-tabs";

export type { AppTabItem, AppTabsProps };

export function AppTabsWeb({
  tabs,
  activeKey,
  onChange,
  variant = "pills",
  className = "",
}: AppTabsProps) {
  return (
    <View
      role="tablist"
      className={`flex-row flex-wrap items-center gap-2 ${
        variant === "underline" ? "border-b border-rose-200 pb-1" : ""
      } ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            role="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.key)}
            className={`flex-row items-center gap-1.5 px-4 py-2 rounded-2xl border transition-colors ${
              variant === "underline"
                ? active
                  ? "bg-rose-50 border-rose-600"
                  : "bg-transparent border-transparent hover:bg-rose-50/70"
                : active
                  ? "bg-rose-600 border-rose-600"
                  : "bg-white border-rose-200 hover:bg-rose-50"
            }`}
          >
            {tab.icon && (
              <Ionicons
                name={tab.icon}
                size={15}
                color={
                  active && variant !== "underline" ? "#FFFFFF" : "#E11D48"
                }
              />
            )}
            <Text
              className={`text-xs font-extrabold ${
                active && variant !== "underline"
                  ? "text-white"
                  : active
                    ? "text-rose-700"
                    : "text-rose-950"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default AppTabsWeb;
