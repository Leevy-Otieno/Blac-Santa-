import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { INITIAL_SHOP_GIFTS } from "../index";

const CATEGORIES = ["For Him", "For Her", "Kids", "Boss"] as const;
const OCCASIONS = ["Valentine's Day", "Birthdays", "Christmas"] as const;

export default function EditGiftScreen() {
  const insets = useSafeAreaInsets();
  const { giftId } = useLocalSearchParams<{ giftId: string }>();

  const existingGift =
    INITIAL_SHOP_GIFTS.find((g) => g.id === giftId) ?? INITIAL_SHOP_GIFTS[0];

  const [title, setTitle] = useState(existingGift.title);
  const [priceInput, setPriceInput] = useState(String(existingGift.priceKsh));
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
    existingGift.category,
  );
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>(
    existingGift.occasion,
  );
  const [imageUri, setImageUri] = useState(existingGift.imageUrl);
  const [inStock, setInStock] = useState(existingGift.inStock);

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission Required",
        "Allow photo access to update gift images.",
      );
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (!res.canceled && res.assets[0]?.uri) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSaveChanges = () => {
    const price = Number(priceInput.replace(/\D/g, ""));
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a gift title.");
      return;
    }
    if (price < 500 || price > 10000) {
      Alert.alert(
        "Invalid Price",
        "Price must stay within Ksh 500 and Ksh 10,000.",
      );
      return;
    }

    Alert.alert(
      "Gift Updated",
      `Saved updates for "${title.trim()}" (Ksh ${price.toLocaleString()}).`,
      [
        {
          text: "Back to Listings",
          onPress: () => router.replace("/(shop)/listings"),
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
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 bg-white border border-rose-200 px-3 py-2 rounded-2xl"
        >
          <Ionicons name="arrow-back" size={16} color="#881337" />
          <Text className="text-xs font-bold text-rose-950">Back</Text>
        </Pressable>

        <Text className="text-xs font-bold text-rose-600">
          ID: {existingGift.id}
        </Text>
      </View>

      <Text className="text-xl font-extrabold text-rose-950 mb-3">
        Edit Gift Listing
      </Text>

      <Animated.View
        entering={FadeInDown.delay(60).springify()}
        className="bg-white rounded-3xl p-4 border border-rose-100 mb-4"
      >
        <View className="h-48 rounded-2xl overflow-hidden bg-rose-100 mb-3">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <Pressable
          onPress={handlePickPhoto}
          className="flex-row items-center justify-center gap-2 bg-rose-50 border border-rose-200 py-3 rounded-2xl"
        >
          <Ionicons name="camera-outline" size={18} color="#E11D48" />
          <Text className="text-xs font-extrabold text-rose-700">
            Replace Gift Photo
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(120).springify()}
        className="bg-white rounded-3xl p-4 border border-rose-100 gap-3.5"
      >
        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Gift Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Price in Ksh (500 – 10,000)
          </Text>
          <TextInput
            value={priceInput}
            onChangeText={setPriceInput}
            keyboardType="number-pad"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm font-bold text-rose-950"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1.5">
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-3.5 py-2 rounded-full border ${
                    active
                      ? "bg-rose-600 border-rose-600"
                      : "bg-white border-rose-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      active ? "text-white" : "text-rose-900"
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1.5">
            Occasion
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {OCCASIONS.map((occ) => {
              const active = occasion === occ;
              return (
                <Pressable
                  key={occ}
                  onPress={() => setOccasion(occ)}
                  className={`px-3.5 py-2 rounded-full border ${
                    active
                      ? "bg-rose-600 border-rose-600"
                      : "bg-white border-rose-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      active ? "text-white" : "text-rose-900"
                    }`}
                  >
                    {occ}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => setInStock((prev) => !prev)}
          className="flex-row items-center justify-between bg-rose-50 p-3.5 rounded-2xl border border-rose-200"
        >
          <Text className="text-xs font-extrabold text-rose-950">
            Listing Availability
          </Text>
          <Text className="text-xs font-extrabold text-rose-600">
            {inStock ? "Active / In Stock" : "Paused"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSaveChanges}
          className="bg-rose-600 active:bg-rose-700 py-4 rounded-2xl items-center mt-1"
        >
          <Text className="text-white text-sm font-extrabold">
            Save Gift Changes
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
