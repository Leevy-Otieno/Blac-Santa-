import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminCategoriesScreen() {
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<string[]>([
    "For Him",
    "For Her",
    "Kids",
    "Boss",
  ]);
  const [occasions, setOccasions] = useState<string[]>([
    "Valentine's Day",
    "Birthdays",
    "Christmas",
  ]);
  const [newOccasion, setNewOccasion] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    const clean = newCategory.trim();
    if (!clean) return;
    if (categories.includes(clean)) {
      Alert.alert("Duplicate", `"${clean}" already exists.`);
      return;
    }
    setCategories((prev) => [...prev, clean]);
    setNewCategory("");
  };

  const addOccasion = () => {
    const clean = newOccasion.trim();
    if (!clean) return;
    if (occasions.includes(clean)) {
      Alert.alert("Duplicate", `"${clean}" already exists.`);
      return;
    }
    setOccasions((prev) => [...prev, clean]);
    setNewOccasion("");
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
        Categories & Occasions
      </Text>

      {/* Curated Categories */}
      <Animated.View
        entering={FadeInDown.delay(70).springify()}
        layout={Layout.springify()}
        className="bg-white rounded-3xl p-4 border border-rose-100 mb-4"
      >
        <Text className="text-sm font-extrabold text-rose-950 mb-2.5">
          Recipient Categories ({categories.length})
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-3.5">
          {categories.map((cat) => (
            <View
              key={cat}
              className="bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-full"
            >
              <Text className="text-xs font-bold text-rose-900">{cat}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center gap-2">
          <TextInput
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="Add category (e.g. Couples)"
            placeholderTextColor="#FDA4AF"
            className="flex-1 bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs text-rose-950"
          />
          <Pressable
            onPress={addCategory}
            className="bg-rose-600 px-4 py-2.5 rounded-2xl"
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Curated Occasions */}
      <Animated.View
        entering={FadeInDown.delay(140).springify()}
        layout={Layout.springify()}
        className="bg-white rounded-3xl p-4 border border-rose-100"
      >
        <Text className="text-sm font-extrabold text-rose-950 mb-2.5">
          Seasonal & Special Occasions ({occasions.length})
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-3.5">
          {occasions.map((occ) => (
            <View key={occ} className="bg-rose-600 px-3.5 py-2 rounded-full">
              <Text className="text-xs font-bold text-white">{occ}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center gap-2">
          <TextInput
            value={newOccasion}
            onChangeText={setNewOccasion}
            placeholder="Add occasion (e.g. Anniversary)"
            placeholderTextColor="#FDA4AF"
            className="flex-1 bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs text-rose-950"
          />
          <Pressable
            onPress={addOccasion}
            className="bg-rose-950 px-4 py-2.5 rounded-2xl"
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
