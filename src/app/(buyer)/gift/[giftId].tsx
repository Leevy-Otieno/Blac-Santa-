import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SAMPLE_BUYER_GIFTS } from "../index";

function formatWhatsAppPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0") && digits.length === 10)
    return `254${digits.slice(1)}`;
  return digits;
}

export default function GiftDetailScreen() {
  const { giftId } = useLocalSearchParams<{ giftId: string }>();
  const gift =
    SAMPLE_BUYER_GIFTS.find((item) => item.id === giftId) ??
    SAMPLE_BUYER_GIFTS[0];

  const handleWhatsAppOrder = async () => {
    const phone = formatWhatsAppPhone(gift.shopPhone);
    const text = encodeURIComponent(
      `Hi ${gift.shopName}, I found "${gift.title}" (Ksh ${gift.priceKsh.toLocaleString()}) on BLAC SANTA and would like to order it.`,
    );
    const url = `https://wa.me/${phone}?text=${text}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        "WhatsApp Unavailable",
        "Could not open WhatsApp on this device.",
      );
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: gift.imageUrl }} style={styles.heroImage} />

      <View style={styles.body}>
        <Text style={styles.badge}>
          {gift.category} • {gift.occasion} • Age {gift.ageGroup}
        </Text>
        <Text style={styles.title}>{gift.title}</Text>
        <Text style={styles.price}>Ksh {gift.priceKsh.toLocaleString()}</Text>

        <Pressable
          style={styles.shopBox}
          onPress={() => router.push(`/(buyer)/shop/${gift.shopId}`)}
        >
          <View>
            <Text style={styles.shopLabel}>Sold by</Text>
            <Text style={styles.shopName}>{gift.shopName}</Text>
          </View>
          <Text style={styles.viewShop}>View Shop →</Text>
        </Pressable>

        <Pressable style={styles.whatsappBtn} onPress={handleWhatsAppOrder}>
          <Text style={styles.whatsappBtnText}>Order via WhatsApp</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 32 },
  heroImage: { width: "100%", height: 300, backgroundColor: "#E5E7EB" },
  body: { padding: 16 },
  badge: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#047857",
    marginTop: 6,
    marginBottom: 16,
  },
  shopBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  shopLabel: { fontSize: 11, color: "#6B7280" },
  shopName: { fontSize: 15, fontWeight: "700", color: "#111827", marginTop: 2 },
  viewShop: { fontSize: 13, fontWeight: "600", color: "#111827" },
  whatsappBtn: {
    backgroundColor: "#15803D",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  whatsappBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
