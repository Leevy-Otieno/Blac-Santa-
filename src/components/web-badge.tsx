import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Text, View } from "react-native";

export interface WebBadgeProps {
  label?: string;
  platformTag?: string;
  showOnlyOnWeb?: boolean;
  className?: string;
}

export function WebBadge({
  label = "Web Preview",
  platformTag = "BLAC SANTA",
  showOnlyOnWeb = false,
  className = "",
}: WebBadgeProps) {
  if (showOnlyOnWeb && Platform.OS !== "web") {
    return null;
  }

  return (
    <View
      className={`self-start flex-row items-center gap-1.5 bg-rose-950 border border-rose-800 px-3 py-1 rounded-full ${className}`}
    >
      <Ionicons name="globe-outline" size={12} color="#FDA4AF" />
      <Text className="text-[10px] font-extrabold uppercase tracking-wider text-rose-200">
        {platformTag}
      </Text>
      <Text className="text-[10px] font-bold text-rose-400">•</Text>
      <Text className="text-[10px] font-extrabold text-white">{label}</Text>
    </View>
  );
}

export default WebBadge;
