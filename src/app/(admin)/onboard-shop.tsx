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

export default function OnboardShopScreen() {
  const insets = useSafeAreaInsets();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("+254");
  const [location, setLocation] = useState("Westlands, Nairobi");
  const [autoActivate, setAutoActivate] = useState(true);

  const handleOnboard = () => {
    const digits = whatsappPhone.replace(/\D/g, "");
    if (!shopName.trim() || !ownerName.trim()) {
      Alert.alert(
        "Required Fields",
        "Enter both the shop name and assigned shop owner name.",
      );
      return;
    }
    if (digits.length < 9) {
      Alert.alert(
        "Invalid WhatsApp Number",
        "Enter a valid Kenyan WhatsApp number (e.g., +254712345678).",
      );
      return;
    }

    Alert.alert(
      "Shop Onboarded",
      `${shopName.trim()} assigned to ${ownerName.trim()} (${
        autoActivate ? "Active" : "Pending"
      }).`,
      [
        {
          text: "View All Shops",
          onPress: () => router.replace("/(admin)/shops"),
        },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-rose-50/60"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 14),
        paddingHorizontal: 16,
        paddingBottom: Math.max(insets.bottom, 28) + 16,
      }}
    >
      <Text className="text-xl font-extrabold text-rose-950 mb-1">
        Onboard Partner Shop
      </Text>
      <Text className="text-xs text-rose-700/80 mb-4">
        Create a new merchant storefront and assign a shop owner role.
      </Text>

      <Animated.View
        entering={FadeInDown.delay(80).springify()}
        className="bg-white rounded-3xl p-4 border border-rose-100 gap-3.5"
      >
        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Shop Name
          </Text>
          <TextInput
            value={shopName}
            onChangeText={setShopName}
            placeholder="e.g. Crimson Petal Gift Studio"
            placeholderTextColor="#FDA4AF"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Assigned Shop Owner Name
          </Text>
          <TextInput
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="e.g. Grace Muthoni"
            placeholderTextColor="#FDA4AF"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Shop Owner Email
          </Text>
          <TextInput
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="owner@shop.co.ke"
            placeholderTextColor="#FDA4AF"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            WhatsApp Order Number (+254)
          </Text>
          <TextInput
            value={whatsappPhone}
            onChangeText={setWhatsappPhone}
            keyboardType="phone-pad"
            placeholder="+254712345678"
            placeholderTextColor="#FDA4AF"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm font-bold text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Location / Neighborhood
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Westlands, Nairobi"
            placeholderTextColor="#FDA4AF"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <Pressable
          onPress={() => setAutoActivate((prev) => !prev)}
          className="flex-row items-center justify-between bg-rose-50 p-3.5 rounded-2xl border border-rose-200"
        >
          <Text className="text-xs font-extrabold text-rose-950">
            Activate Storefront Immediately
          </Text>
          <Text className="text-xs font-extrabold text-rose-600">
            {autoActivate ? "Active" : "Pending"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleOnboard}
          className="bg-rose-600 active:bg-rose-700 py-4 rounded-2xl items-center mt-1"
        >
          <Text className="text-white text-sm font-extrabold">
            Create Shop & Assign Owner
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
