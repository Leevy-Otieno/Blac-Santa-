import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SAMPLE_BUYER_GIFTS } from "../index";

export default function BuyerShopScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const shopGifts = SAMPLE_BUYER_GIFTS.filter((item) => item.shopId === shopId);
  const displayGifts = shopGifts.length > 0 ? shopGifts : SAMPLE_BUYER_GIFTS;
  const shopName = displayGifts[0]?.shopName ?? "BLAC SANTA Partner Shop";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.shopTitle}>{shopName}</Text>
        <Text style={styles.shopMeta}>
          {displayGifts.length} gifts available
        </Text>
      </View>

      <FlatList
        data={displayGifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  shopTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  shopMeta: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  list: { padding: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  image: { width: 80, height: 80, backgroundColor: "#E5E7EB" },
  info: { flex: 1, padding: 12, justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700", color: "#111827" },
  price: { fontSize: 13, fontWeight: "600", color: "#047857", marginTop: 4 },
});
