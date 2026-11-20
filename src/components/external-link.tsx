import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

export interface ExternalLinkProps {
  href: string;
  label?: string;
  whatsappPrefill?: string;
  variant?: "inline" | "button" | "whatsapp";
  showIcon?: boolean;
  className?: string;
}

function buildTargetUrl(href: string, whatsappPrefill?: string): string {
  const trimmed = href.trim();
  if (
    trimmed.startsWith("https://wa.me/") ||
    trimmed.startsWith("whatsapp://")
  ) {
    if (!whatsappPrefill) return trimmed;
    const separator = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${separator}text=${encodeURIComponent(whatsappPrefill)}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (
    whatsappPrefill &&
    (digits.startsWith("254") ||
      (digits.startsWith("0") && digits.length === 10))
  ) {
    const normalized = digits.startsWith("0")
      ? `254${digits.slice(1)}`
      : digits;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(
      whatsappPrefill,
    )}`;
  }

  return trimmed;
}

export function ExternalLink({
  href,
  label,
  whatsappPrefill,
  variant = "inline",
  showIcon = true,
  className = "",
}: ExternalLinkProps) {
  const targetUrl = buildTargetUrl(href, whatsappPrefill);
  const displayLabel =
    label ?? (variant === "whatsapp" ? "Chat on WhatsApp" : href);

  const handleOpen = async () => {
    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (!supported) {
        Alert.alert(
          "Cannot Open Link",
          "No compatible app is installed to open this link.",
        );
        return;
      }
      await Linking.openURL(targetUrl);
    } catch {
      Alert.alert("Link Error", "Unable to open the requested link right now.");
    }
  };

  if (variant === "whatsapp") {
    return (
      <Pressable
        onPress={handleOpen}
        className={`flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 px-4 py-3 rounded-2xl shadow-xs ${className}`}
      >
        {showIcon && (
          <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
        )}
        <Text className="text-white text-xs font-extrabold">
          {displayLabel}
        </Text>
      </Pressable>
    );
  }

  if (variant === "button") {
    return (
      <Pressable
        onPress={handleOpen}
        className={`flex-row items-center justify-center gap-2 bg-rose-50 border border-rose-200 active:bg-rose-100 px-4 py-3 rounded-2xl ${className}`}
      >
        <Text className="text-rose-800 text-xs font-extrabold">
          {displayLabel}
        </Text>
        {showIcon && <Ionicons name="open-outline" size={16} color="#E11D48" />}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handleOpen}
      className={`flex-row items-center gap-1 active:opacity-75 ${className}`}
    >
      <View className="flex-row items-center gap-1">
        <Text className="text-xs font-extrabold text-rose-600 underline">
          {displayLabel}
        </Text>
        {showIcon && <Ionicons name="open-outline" size={14} color="#E11D48" />}
      </View>
    </Pressable>
  );
}

export default ExternalLink;
