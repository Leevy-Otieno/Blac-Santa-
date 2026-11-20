import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ShopSettingsScreen() {
  const insets = useSafeAreaInsets();

  const [shopName, setShopName] = useState("Savanna Scents & Hampers");
  const [whatsappNumber, setWhatsappNumber] = useState("+254723456789");
  const [location, setLocation] = useState("Westlands, Nairobi");
  const [deliveryNote, setDeliveryNote] = useState(
    "Same-day dispatch across Nairobi; custom gift notes included.",
  );

  const handleSaveSettings = () => {
    const digits = whatsappNumber.replace(/\D/g, "");
    if (!shopName.trim() || digits.length < 9) {
      Alert.alert(
        "Check Shop Details",
        "Provide a valid shop name and WhatsApp contact number.",
      );
      return;
    }

    Alert.alert(
      "Shop Profile Updated",
      "Your WhatsApp order number and storefront profile details have been saved.",
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-rose-50/60"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 14),
        paddingHorizontal: 16,
        paddingBottom: Math.max(insets.bottom, 24) + 16,
      }}
    >
      <Text className="text-xl font-extrabold text-rose-950 mb-4">
        Shop Profile & WhatsApp Settings
      </Text>

      <Animated.View
        entering={FadeInDown.delay(80).springify()}
        className="bg-white rounded-3xl p-4 border border-rose-100 gap-3.5 mb-4"
      >
        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Shop Name
          </Text>
          <TextInput
            value={shopName}
            onChangeText={setShopName}
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            WhatsApp Order Number (Kenya +254)
          </Text>
          <TextInput
            value={whatsappNumber}
            onChangeText={setWhatsappNumber}
            keyboardType="phone-pad"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm font-bold text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Pickup / Dispatch Area
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Gifting & Delivery Note
          </Text>
          <TextInput
            value={deliveryNote}
            onChangeText={setDeliveryNote}
            multiline
            numberOfLines={3}
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <Pressable
          onPress={handleSaveSettings}
          className="bg-rose-600 active:bg-rose-700 py-4 rounded-2xl items-center mt-1"
        >
          <Text className="text-white text-sm font-extrabold">
            Save Shop Settings
          </Text>
        </Pressable>
      </Animated.View>

      <Pressable
        onPress={() => router.replace("/(auth)/role-gate")}
        className="flex-row items-center justify-between bg-white p-4 rounded-3xl border border-rose-100"
      >
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="swap-horizontal-outline" size={20} color="#E11D48" />
          <Text className="text-sm font-extrabold text-rose-950">
            Switch Workspace Role
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#FB7185" />
      </Pressable>
    </ScrollView>
  );
}
