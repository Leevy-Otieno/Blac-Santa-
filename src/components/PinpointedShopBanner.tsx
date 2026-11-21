import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlackSantaPinpointedShop } from "../types/marketplace.types";
import { buildWhatsAppUrl } from "../utils/build-whatsapp-url";

interface PinpointedShopBannerProps {
  shop: BlackSantaPinpointedShop | null;
  onClear: () => void;
}

export const PinpointedShopBanner: React.FC<PinpointedShopBannerProps> = ({
  shop,
  onClear,
}) => {
  if (!shop) return null;

  const handleWhatsApp = async () => {
    const message = `Hi ${shop.shopName} (${shop.neighborhood}), I found your shop via Black Santa on BLAC SANTA.`;
    const url = buildWhatsAppUrl(shop.phone, message);
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore if device cannot open external URL scheme
    }
  };

  return (
    <View className="mx-4 mt-3 rounded-3xl bg-rose-950 p-4 border border-rose-800">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="h-9 w-9 rounded-2xl bg-rose-600 items-center justify-center shrink-0">
            <Ionicons name="location" size={18} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-extrabold uppercase tracking-wider text-rose-200">
              Pinpointed Shop in App
            </Text>
            <Text
              numberOfLines={1}
              className="text-base font-extrabold text-white"
            >
              {shop.shopName}
            </Text>
            <Text numberOfLines={1} className="text-xs text-rose-200/85">
              {shop.neighborhood}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onClear}
          accessibilityLabel="Clear pinpointed shop"
          className="h-8 w-8 items-center justify-center rounded-full bg-rose-900 border border-rose-700"
        >
          <Ionicons name="close" size={16} color="#FFE4E6" />
        </Pressable>
      </View>

      {shop.reason ? (
        <Text className="mt-2 text-xs leading-4 text-rose-100/90">
          {shop.reason}
        </Text>
      ) : null}

      {shop.phone ? (
        <Pressable
          onPress={handleWhatsApp}
          className="mt-3 flex-row items-center justify-center gap-1.5 rounded-2xl bg-rose-600 py-2.5 px-3"
        >
          <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
          <Text className="text-xs font-extrabold text-white">
            Chat with {shop.shopName} via +254
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default PinpointedShopBanner;
