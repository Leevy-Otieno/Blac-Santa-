import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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

const CATEGORIES = ["For Him", "For Her", "Kids", "Boss"] as const;
const OCCASIONS = ["Valentine's Day", "Birthdays", "Christmas"] as const;
const AGE_GROUPS = ["6–12", "18–24", "25–34", "35+"] as const;

export default function AddGiftScreen() {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [priceInput, setPriceInput] = useState("2500");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("For Her");
  const [occasion, setOccasion] =
    useState<(typeof OCCASIONS)[number]>("Valentine's Day");
  const [ageGroup, setAgeGroup] =
    useState<(typeof AGE_GROUPS)[number]>("25–34");
  const [imageUri, setImageUri] = useState<string>(
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1000",
  );
  const [description, setDescription] = useState("");

  const pickHighResPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo Access Needed",
        "Allow gallery access to upload high-resolution gift photos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePublishGift = () => {
    const numericPrice = Number(priceInput.replace(/\D/g, ""));
    if (!title.trim()) {
      Alert.alert("Missing Gift Title", "Enter a clear name for the gift.");
      return;
    }
    if (numericPrice < 500 || numericPrice > 10000) {
      Alert.alert(
        "Price Out of Range",
        "BLAC SANTA gift prices must be between Ksh 500 and Ksh 10,000.",
      );
      return;
    }

    Alert.alert(
      "Gift Ready for Catalog",
      `"${title.trim()}" (Ksh ${numericPrice.toLocaleString()}) has been validated for ${category} • ${occasion}.`,
      [
        {
          text: "View Listings",
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
      <Text className="text-xl font-extrabold text-rose-950 mb-3">
        Add New Gift Listing
      </Text>

      {/* High-Res Image Picker Card */}
      <Animated.View
        entering={FadeInDown.delay(60).springify()}
        className="bg-white rounded-3xl p-4 border border-rose-100 mb-4"
      >
        <Text className="text-xs font-extrabold text-rose-950 uppercase mb-2.5">
          High-Res Gift Photo
        </Text>

        <View className="h-48 rounded-2xl overflow-hidden bg-rose-100 mb-3">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <Pressable
          onPress={pickHighResPhoto}
          className="flex-row items-center justify-center gap-2 bg-rose-50 border border-rose-200 py-3 rounded-2xl"
        >
          <Ionicons name="image-outline" size={18} color="#E11D48" />
          <Text className="text-xs font-extrabold text-rose-700">
            Choose Photo from Gallery
          </Text>
        </Pressable>
      </Animated.View>

      {/* Core Gift Details */}
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
            placeholder="e.g. Velvet Rose & Chocolate Gift Box"
            placeholderTextColor="#FDA4AF"
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
            placeholder="2500"
            placeholderTextColor="#FDA4AF"
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

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1.5">
            Recipient Age Group
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {AGE_GROUPS.map((age) => {
              const active = ageGroup === age;
              return (
                <Pressable
                  key={age}
                  onPress={() => setAgeGroup(age)}
                  className={`px-3.5 py-2 rounded-full border ${
                    active
                      ? "bg-rose-950 border-rose-950"
                      : "bg-white border-rose-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      active ? "text-white" : "text-rose-900"
                    }`}
                  >
                    {age}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1">
            Gift Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholder="Describe packaging, dimensions, and why buyers love it..."
            placeholderTextColor="#FDA4AF"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-sm text-rose-950"
          />
        </View>

        <Pressable
          onPress={handlePublishGift}
          className="bg-rose-600 active:bg-rose-700 py-4 rounded-2xl items-center mt-1"
        >
          <Text className="text-white text-sm font-extrabold">
            Publish Gift to BLAC SANTA
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
