import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BlackSantaPinpointedShop,
  SavedGiftItem,
} from "../types/marketplace.types";
import { buildWhatsAppUrl } from "../utils/build-whatsapp-url";
import { formatKsh } from "../utils/format-ksh";

interface WishlistModalProps {
  visible: boolean;
  onClose: () => void;
  items: SavedGiftItem[];
  totalKsh: number;
  loading?: boolean;
  onRemove: (id: string) => void | Promise<void>;
  onClearAll?: () => void | Promise<void>;
  onPinpointShop?: (shop: BlackSantaPinpointedShop) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  visible,
  onClose,
  items,
  totalKsh,
  loading = false,
  onRemove,
  onClearAll,
  onPinpointShop,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isWideScreen = width >= 768;
  const maxSheetHeight = Math.round(height * (isWideScreen ? 0.8 : 0.86));

  useEffect(() => {
    if (!visible || items.length === 0) {
      setConfirmClear(false);
    }
  }, [visible, items.length]);

  const handleOrderWhatsApp = async (item: SavedGiftItem) => {
    const message = `Hi ${item.shopName}, I saved "${item.title}" (${formatKsh(
      item.priceKsh,
    )}) on BLAC SANTA and would like to check availability and Nairobi delivery.`;
    const url = buildWhatsAppUrl(item.phone, message);
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore if external URL scheme cannot be opened
    }
  };

  const handlePinpoint = (item: SavedGiftItem) => {
    if (!onPinpointShop) return;
    onClose();
    onPinpointShop({
      shopId: item.shopId || item.id,
      shopName: item.shopName,
      neighborhood: item.neighborhood,
      phone: item.phone,
      reason: item.notes || `Saved gift: ${item.title}`,
    });
  };

  const handleClearPress = async () => {
    if (!onClearAll) return;
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    await onClearAll();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View
          style={{
            maxHeight: maxSheetHeight,
            paddingBottom: Math.max(insets.bottom + 12, 20),
          }}
          className={`w-full rounded-t-3xl bg-brand-bg px-4 pt-4 border-t border-brand-border ${
            isWideScreen ? "max-w-2xl self-center rounded-b-3xl mb-4" : ""
          }`}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-brand-border">
            <View className="flex-1 pr-2">
              <Text
                numberOfLines={1}
                className="text-lg font-extrabold text-brand-text"
              >
                Saved Wishlist ({items.length})
              </Text>
              <Text
                numberOfLines={1}
                className="text-xs font-medium text-brand-textMuted"
              >
                Estimated total: {formatKsh(totalKsh)}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              {items.length > 0 && onClearAll && (
                <Pressable
                  onPress={handleClearPress}
                  className={`rounded-full px-3 py-1.5 border ${
                    confirmClear
                      ? "bg-brand-primary border-brand-primary"
                      : "bg-brand-surface border-brand-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      confirmClear ? "text-white" : "text-brand-textMuted"
                    }`}
                  >
                    {confirmClear ? "Confirm Clear" : "Clear"}
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={onClose}
                accessibilityLabel="Close wishlist"
                className="h-9 w-9 items-center justify-center rounded-full bg-brand-surface border border-brand-border"
              >
                <Ionicons name="close" size={20} color="#4C0519" />
              </Pressable>
            </View>
          </View>

          {/* Saved Gifts Feed */}
          <ScrollView
            className="mt-3"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {loading ? (
              <View className="items-center justify-center py-10 px-4 rounded-2xl bg-brand-surface border border-brand-border">
                <Text className="text-sm font-semibold text-brand-textMuted">
                  Loading saved gifts...
                </Text>
              </View>
            ) : items.length === 0 ? (
              <View className="items-center justify-center py-12 px-4 rounded-2xl bg-brand-surface border border-brand-border">
                <Ionicons name="heart-outline" size={32} color="#E11D48" />
                <Text className="mt-2 text-base font-bold text-brand-text">
                  No saved gifts yet
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-brand-textMuted">
                  Save gift recommendations from Black Santa or your catalog to
                  track Ksh totals, pinpoint shops, or inquire on WhatsApp.
                </Text>
              </View>
            ) : (
              items.map((item) => (
                <View
                  key={item.id}
                  className="mb-3 rounded-2xl bg-brand-surface p-4 border border-brand-border"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-brand-text">
                        {item.title}
                      </Text>
                      <Text className="mt-0.5 text-xs font-semibold text-brand-textMuted">
                        {item.shopName} • {item.neighborhood}
                      </Text>
                    </View>
                    <Text className="text-sm font-extrabold text-brand-primary">
                      {formatKsh(item.priceKsh)}
                    </Text>
                  </View>

                  {(item.recipient || item.occasion) && (
                    <Text className="mt-1.5 text-xs text-brand-textMuted">
                      {[
                        item.recipient ? `For: ${item.recipient}` : null,
                        item.occasion ? `Occasion: ${item.occasion}` : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </Text>
                  )}

                  {item.notes ? (
                    <Text className="mt-1 text-xs leading-4 text-brand-text">
                      {item.notes}
                    </Text>
                  ) : null}

                  <View className="mt-3 flex-row flex-wrap items-center gap-2">
                    {onPinpointShop && (
                      <Pressable
                        onPress={() => handlePinpoint(item)}
                        className="flex-row items-center justify-center gap-1 rounded-xl bg-brand-surfaceMuted py-2.5 px-3 border border-brand-border"
                      >
                        <Ionicons name="location" size={15} color="#E11D48" />
                        <Text className="text-xs font-bold text-brand-text">
                          Pinpoint Shop
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => handleOrderWhatsApp(item)}
                      className="flex-1 min-w-[130px] flex-row items-center justify-center gap-1.5 rounded-xl bg-brand-primary py-2.5 px-3"
                    >
                      <Ionicons
                        name="logo-whatsapp"
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text className="text-xs font-bold text-white">
                        Order via +254
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => onRemove(item.id)}
                      accessibilityLabel={`Remove ${item.title}`}
                      className="items-center justify-center rounded-xl bg-brand-surfaceMuted py-2.5 px-3 border border-brand-border"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#9F1239"
                      />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default WishlistModal;
