import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BuyerProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>BLAC SANTA Buyer</Text>
        <Text style={styles.sub}>Nairobi, Kenya • Role: Buyer</Text>
      </View>

      <Pressable
        style={styles.actionRow}
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text style={styles.actionText}>Sign In / Switch Account</Text>
      </Pressable>

      <Pressable
        style={styles.actionRow}
        onPress={() => router.push("/(auth)/role-gate")}
      >
        <Text style={styles.actionText}>
          Role Switcher (Buyer / Shop / Admin)
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  name: { fontSize: 18, fontWeight: "700", color: "#111827" },
  sub: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  actionRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionText: { fontSize: 14, fontWeight: "600", color: "#111827" },
});
