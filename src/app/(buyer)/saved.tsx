import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SAMPLE_BUYER_GIFTS } from "./index";

export default function BuyerSavedScreen() {
  const [savedIds, setSavedIds] = useState<string[]>(["gift-101", "gift-102"]);
  const savedGifts = SAMPLE_BUYER_GIFTS.filter((gift) =>
    savedIds.includes(gift.id),
  );

  const removeSaved = (id: string) => {
    setSavedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={savedGifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No saved gifts yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap any gift to view details or save ideas for upcoming occasions.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(buyer)/gift/${item.id}`)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>
                Ksh {item.priceKsh.toLocaleString()}
              </Text>
              <Text style={styles.shop}>{item.shopName}</Text>
            </View>
            <Pressable
              style={styles.removeBtn}
              onPress={() => removeSaved(item.id)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  list: { padding: 16 },
  emptyBox: { alignItems: "center", marginTop: 60, paddingHorizontal: 24 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptySubtitle: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: "#E5E7EB" },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#111827" },
  price: { fontSize: 13, fontWeight: "600", color: "#047857", marginTop: 2 },
  shop: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  removeText: { fontSize: 12, fontWeight: "600", color: "#DC2626" },
});
