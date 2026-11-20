import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { INITIAL_SHOP_GIFTS, ShopGiftRecord } from "./index";

export default function ShopListingsScreen() {
  const insets = useSafeAreaInsets();
  const [gifts, setGifts] = useState<ShopGiftRecord[]>(INITIAL_SHOP_GIFTS);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return gifts;
    return gifts.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.occasion.toLowerCase().includes(q),
    );
  }, [gifts, search]);

  const toggleStock = (id: string) => {
    setGifts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: !item.inStock } : item,
      ),
    );
  };

  const confirmDelete = (item: ShopGiftRecord) => {
    Alert.alert(
      "Delete Gift Listing",
      `Remove "${item.title}" from your shop catalog?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setGifts((prev) => prev.filter((gift) => gift.id !== item.id)),
        },
      ],
    );
  };

  return (
    <View
      className="flex-1 bg-rose-50/60"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className="mx-4 flex-row items-center justify-between mb-3">
        <Text className="text-xl font-extrabold text-rose-950">
          Gift Listings ({filtered.length})
        </Text>
        <Pressable
          onPress={() => router.push("/(shop)/add-gift")}
          className="flex-row items-center gap-1 bg-rose-600 px-3.5 py-2 rounded-2xl"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-white text-xs font-extrabold">Add Gift</Text>
        </Pressable>
      </View>

      <View className="mx-4 flex-row items-center bg-white rounded-2xl px-4 py-2.5 border border-rose-200 mb-3">
        <Ionicons name="search" size={18} color="#E11D48" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search your gifts by title, category, or occasion..."
          placeholderTextColor="#FDA4AF"
          className="flex-1 ml-2.5 text-sm text-rose-950"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 55).springify()}
            layout={Layout.springify()}
          >
            <View className="bg-white rounded-3xl p-3.5 mb-3.5 border border-rose-100">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-20 h-20 rounded-2xl bg-rose-100"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[10px] font-bold text-rose-600 uppercase">
                      {item.category} • {item.occasion}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        item.inStock ? "bg-emerald-50" : "bg-rose-50"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-extrabold ${
                          item.inStock ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {item.inStock ? "In Stock" : "Paused"}
                      </Text>
                    </View>
                  </View>

                  <Text
                    numberOfLines={1}
                    className="text-sm font-extrabold text-rose-950 mt-0.5"
                  >
                    {item.title}
                  </Text>
                  <Text className="text-sm font-extrabold text-rose-700 mt-1">
                    Ksh {item.priceKsh.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-rose-800/70">
                    {item.whatsappClicks} WhatsApp clicks • Age {item.ageGroup}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-2 mt-3 pt-3 border-t border-rose-100">
                <Pressable
                  onPress={() => toggleStock(item.id)}
                  className="flex-1 bg-rose-50 border border-rose-200 py-2 rounded-xl items-center"
                >
                  <Text className="text-xs font-bold text-rose-800">
                    {item.inStock ? "Pause Listing" : "Set In Stock"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push(`/(shop)/edit-gift/${item.id}`)}
                  className="flex-1 bg-rose-600 py-2 rounded-xl items-center"
                >
                  <Text className="text-xs font-extrabold text-white">
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => confirmDelete(item)}
                  className="bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={16} color="#E11D48" />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
      />
    </View>
  );
}
