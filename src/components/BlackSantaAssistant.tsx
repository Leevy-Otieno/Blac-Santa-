import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBlackSanta } from "../hooks/use-black-santa";
import {
  BlackSantaPinpointedShop,
  GiftProduct,
  MarketplaceShop,
  SavedGiftItem,
} from "../types/marketplace.types";
import { formatKsh } from "../utils/format-ksh";

interface BlackSantaAssistantProps {
  availableShops?: MarketplaceShop[];
  availableGifts?: GiftProduct[];
  recipient?: string;
  occasion?: string;
  budgetLabel?: string;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onSaveGift: (item: Omit<SavedGiftItem, "savedAt">) => Promise<void> | void;
  isGiftSaved: (id: string) => boolean;
  onPinpointShop?: (shop: BlackSantaPinpointedShop) => void;
}

const QUICK_STARTERS = [
  "I don't have a gift idea yet—help me figure out what to buy",
  "Guide me on gifts & pinpoint available shops",
  "Help me narrow down a gift by budget & vibe",
];

export const BlackSantaAssistant: React.FC<BlackSantaAssistantProps> = ({
  availableShops = [],
  availableGifts = [],
  recipient,
  occasion,
  budgetLabel,
  wishlistCount,
  onOpenWishlist,
  onSaveGift,
  isGiftSaved,
  onPinpointShop,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView | null>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const { messages, sending, sendMessage, resetMemory } = useBlackSanta({
    availableShops,
    availableGifts,
    recipient,
    occasion,
    budgetLabel,
  });

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages.length, sending, open]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || sending) return;
    if (!overrideText) {
      setInput("");
    }
    await sendMessage(textToSend);
  };

  const isWideScreen = width >= 768;
  const sheetMaxHeight = Math.round(height * (isWideScreen ? 0.82 : 0.88));

  return (
    <>
      {/* Floating Black Santa & Wishlist Controls Visible to All */}
      {!open && (
        <View
          style={{ bottom: Math.max(insets.bottom + 14, 18) }}
          className="absolute right-4 z-40 items-end gap-2 max-w-[92%]"
        >
          <Pressable
            onPress={onOpenWishlist}
            className="flex-row items-center gap-1.5 rounded-full bg-brand-surface px-3.5 py-2 border border-brand-border shadow"
          >
            <Ionicons name="heart" size={15} color="#E11D48" />
            <Text className="text-xs font-bold text-brand-text">
              Wishlist ({wishlistCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setOpen(true)}
            className="flex-row items-center gap-2 rounded-full bg-brand-primary px-4 py-3 shadow-lg"
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">
              Ask Black Santa
            </Text>
          </Pressable>
        </View>
      )}

      {/* Interactive Black Santa Chat Modal */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View
            style={{ maxHeight: sheetMaxHeight }}
            className={`w-full rounded-t-3xl bg-brand-bg border-t border-brand-border overflow-hidden ${
              isWideScreen ? "max-w-2xl self-center rounded-b-3xl mb-4" : ""
            }`}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between bg-brand-surface px-4 py-3.5 border-b border-brand-border">
              <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-primary shrink-0">
                  <Ionicons name="gift" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-base font-bold text-brand-text"
                  >
                    Black Santa
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs text-brand-textMuted"
                  >
                    Gift guidance, chat memory & shop pinpointing
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-1.5">
                <Pressable
                  onPress={resetMemory}
                  accessibilityLabel="Reset chat memory"
                  className="h-9 w-9 items-center justify-center rounded-full bg-brand-surfaceMuted border border-brand-border"
                >
                  <Ionicons name="refresh" size={17} color="#9F1239" />
                </Pressable>

                <Pressable
                  onPress={() => {
                    setOpen(false);
                    onOpenWishlist();
                  }}
                  className="rounded-full bg-brand-surfaceMuted px-3 py-1.5 border border-brand-border"
                >
                  <Text className="text-xs font-bold text-brand-text">
                    Saved ({wishlistCount})
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setOpen(false)}
                  accessibilityLabel="Close Black Santa"
                  className="h-9 w-9 items-center justify-center rounded-full bg-brand-surfaceMuted"
                >
                  <Ionicons name="close" size={20} color="#4C0519" />
                </Pressable>
              </View>
            </View>

            {/* Quick Starter Prompts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="max-h-12 bg-brand-bg px-4 pt-2.5"
              contentContainerStyle={{ gap: 8, paddingRight: 16 }}
            >
              {QUICK_STARTERS.map((starter) => (
                <Pressable
                  key={starter}
                  onPress={() => handleSend(starter)}
                  className="rounded-full bg-brand-surface px-3.5 py-1.5 border border-brand-border justify-center"
                >
                  <Text className="text-xs font-medium text-brand-text">
                    {starter}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Conversation Feed */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 py-3"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <View
                    key={msg.id}
                    className={`mb-3 ${isUser ? "items-end" : "items-start"}`}
                  >
                    <View
                      className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? "bg-brand-primary"
                          : "bg-brand-surface border border-brand-border"
                      }`}
                    >
                      <Text
                        className={`text-sm leading-5 ${
                          isUser ? "text-white" : "text-brand-text"
                        }`}
                      >
                        {msg.text}
                      </Text>
                    </View>

                    {/* Pinpointed Available Shops */}
                    {!isUser &&
                      msg.pinpointedShops &&
                      msg.pinpointedShops.length > 0 && (
                        <View className="mt-2 w-full gap-2">
                          <Text className="text-[11px] font-bold uppercase tracking-wider text-brand-textMuted px-1">
                            Pinpointed Shops in App
                          </Text>
                          {msg.pinpointedShops.map((shop) => (
                            <View
                              key={shop.shopId}
                              className="rounded-2xl bg-brand-surface p-3 border border-brand-border"
                            >
                              <View className="flex-row items-center justify-between gap-2">
                                <View className="flex-1">
                                  <Text className="text-sm font-bold text-brand-text">
                                    {shop.shopName}
                                  </Text>
                                  <Text className="text-xs text-brand-textMuted">
                                    {shop.neighborhood}
                                  </Text>
                                </View>
                                <Pressable
                                  onPress={() => {
                                    setOpen(false);
                                    onPinpointShop?.(shop);
                                  }}
                                  className="flex-row items-center gap-1 rounded-xl bg-brand-primary px-3 py-2"
                                >
                                  <Ionicons
                                    name="location"
                                    size={14}
                                    color="#FFFFFF"
                                  />
                                  <Text className="text-xs font-bold text-white">
                                    Pinpoint
                                  </Text>
                                </Pressable>
                              </View>
                              <Text className="mt-1.5 text-xs text-brand-text">
                                {shop.reason}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {/* Suggested Gifts From Live Catalog */}
                    {!isUser &&
                      msg.suggestedGifts &&
                      msg.suggestedGifts.length > 0 && (
                        <View className="mt-2 w-full gap-2">
                          {msg.suggestedGifts.map((gift) => {
                            const saved = isGiftSaved(gift.id);
                            return (
                              <View
                                key={gift.id}
                                className="rounded-2xl bg-brand-surface p-3.5 border border-brand-border"
                              >
                                <View className="flex-row items-start justify-between gap-2">
                                  <Text className="flex-1 text-sm font-bold text-brand-text">
                                    {gift.title}
                                  </Text>
                                  <Text className="text-xs font-bold text-brand-primary">
                                    {formatKsh(gift.priceKsh)}
                                  </Text>
                                </View>
                                <Text className="mt-1 text-xs text-brand-textMuted">
                                  {gift.reason}
                                </Text>
                                <Text className="mt-1.5 text-xs font-semibold text-brand-text">
                                  {gift.shopName} ({gift.neighborhood})
                                </Text>

                                <Pressable
                                  onPress={() =>
                                    onSaveGift({
                                      id: gift.id,
                                      giftId: gift.giftId,
                                      shopId: gift.shopId,
                                      title: gift.title,
                                      recipient,
                                      occasion,
                                      priceKsh: gift.priceKsh,
                                      shopName: gift.shopName,
                                      neighborhood: gift.neighborhood,
                                      phone: gift.shopPhone,
                                      notes: gift.reason,
                                    })
                                  }
                                  className={`mt-2.5 flex-row items-center justify-center gap-1.5 rounded-xl py-2 px-3 ${
                                    saved
                                      ? "bg-brand-surfaceMuted border border-brand-border"
                                      : "bg-brand-primary"
                                  }`}
                                >
                                  <Ionicons
                                    name={saved ? "heart" : "heart-outline"}
                                    size={15}
                                    color={saved ? "#E11D48" : "#FFFFFF"}
                                  />
                                  <Text
                                    className={`text-xs font-bold ${
                                      saved
                                        ? "text-brand-primary"
                                        : "text-white"
                                    }`}
                                  >
                                    {saved ? "Saved to Wishlist" : "Save Gift"}
                                  </Text>
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      )}
                  </View>
                );
              })}

              {sending && (
                <View className="flex-row items-center gap-2 py-2">
                  <ActivityIndicator size="small" color="#E11D48" />
                  <Text className="text-xs text-brand-textMuted">
                    Black Santa is thinking & checking shops...
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View
              style={{ paddingBottom: Math.max(insets.bottom, 10) }}
              className="flex-row items-center gap-2 bg-brand-surface px-4 pt-2.5 border-t border-brand-border"
            >
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Tell Black Santa who it's for or ask for shop ideas..."
                placeholderTextColor="#9F1239"
                multiline
                maxLength={600}
                className="flex-1 max-h-24 rounded-2xl bg-brand-bg px-4 py-2.5 text-sm text-brand-text border border-brand-border"
                onSubmitEditing={() => handleSend()}
                blurOnSubmit={false}
              />
              <Pressable
                onPress={() => handleSend()}
                disabled={sending || !input.trim()}
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  sending || !input.trim()
                    ? "bg-brand-surfaceMuted"
                    : "bg-brand-primary"
                }`}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={sending || !input.trim() ? "#9F1239" : "#FFFFFF"}
                />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
