import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface BuyerGiftItem {
  id: string;
  title: string;
  priceKsh: number;
  shopId: string;
  shopName: string;
  shopPhone: string;
  category: "For Him" | "For Her" | "Kids" | "Boss";
  occasion: "Christmas" | "Birthdays" | "Valentine's Day";
  ageGroup: string;
  imageUrl: string;
}

const CATEGORIES = ["For Him", "For Her", "Kids", "Boss"] as const;
const OCCASIONS = ["Christmas", "Birthdays", "Valentine's Day"] as const;

export const SAMPLE_BUYER_GIFTS: BuyerGiftItem[] = [
  {
    id: "gift-101",
    title: "Minimalist Leather Wallet",
    priceKsh: 2400,
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    shopPhone: "254712345678",
    category: "For Him",
    occasion: "Birthdays",
    ageGroup: "25–34",
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
  },
  {
    id: "gift-102",
    title: "Aromatherapy Candle Gift Set",
    priceKsh: 3200,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents",
    shopPhone: "254723456789",
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "18–24",
    imageUrl:
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800",
  },
  {
    id: "gift-103",
    title: "Wooden STEM Building Blocks",
    priceKsh: 1850,
    shopId: "shop-little-minds",
    shopName: "Little Minds KE",
    shopPhone: "254734567890",
    category: "Kids",
    occasion: "Christmas",
    ageGroup: "6–12",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
  },
  {
    id: "gift-104",
    title: "Insulated Executive Desk Flask",
    priceKsh: 4500,
    shopId: "shop-urban-desk",
    shopName: "Urban Executive KE",
    shopPhone: "254745678901",
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    imageUrl:
      "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=800",
  },
];

export default function BuyerHomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const filteredGifts = SAMPLE_BUYER_GIFTS.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesOccasion = selectedOccasion
      ? item.occasion === selectedOccasion
      : true;
    return matchesCategory && matchesOccasion;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>BLAC SANTA Gift Advisor</Text>
        <Text style={styles.bannerSubtitle}>
          Curated gifts from Ksh 500 to Ksh 10,000 with direct WhatsApp
          ordering.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(active ? null : category)}
              style={[styles.categoryCard, active && styles.activeChip]}
            >
              <Text
                style={[styles.categoryText, active && styles.activeChipText]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Occasions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rowScroll}
      >
        {OCCASIONS.map((occasion) => {
          const active = selectedOccasion === occasion;
          return (
            <Pressable
              key={occasion}
              onPress={() => setSelectedOccasion(active ? null : occasion)}
              style={[styles.occasionPill, active && styles.activeChip]}
            >
              <Text
                style={[styles.occasionText, active && styles.activeChipText]}
              >
                {occasion}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Featured Gifts</Text>
      <FlatList
        data={filteredGifts}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable
            style={styles.giftCard}
            onPress={() => router.push(`/(buyer)/gift/${item.id}`)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.giftImage} />
            <View style={styles.giftInfo}>
              <Text style={styles.giftTitle}>{item.title}</Text>
              <Text style={styles.giftPrice}>
                Ksh {item.priceKsh.toLocaleString()}
              </Text>
              <Text style={styles.giftShop}>{item.shopName}</Text>
            </View>
          </Pressable>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, paddingBottom: 32 },
  banner: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  bannerSubtitle: { color: "#D1D5DB", fontSize: 13 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  rowScroll: { marginBottom: 20 },
  occasionPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  occasionText: { fontSize: 13, fontWeight: "600", color: "#111827" },
  activeChip: { backgroundColor: "#111827", borderColor: "#111827" },
  activeChipText: { color: "#FFFFFF" },
  giftCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  giftImage: { width: 96, height: 96, backgroundColor: "#E5E7EB" },
  giftInfo: { flex: 1, padding: 12, justifyContent: "center" },
  giftTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  giftPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
    marginTop: 4,
  },
  giftShop: { fontSize: 12, color: "#6B7280", marginTop: 4 },
});
