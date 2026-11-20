import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ShopAccountStatus = "Active" | "Pending" | "Suspended";

export interface OnboardShopPayload {
  shopName: string;
  ownerName: string;
  ownerEmail: string;
  whatsappPhone: string;
  location: string;
  categoryFocus: string;
  status: ShopAccountStatus;
}

export interface ShopOnboardFormProps {
  onSubmit?: (payload: OnboardShopPayload) => void | Promise<void>;
  onCancel?: () => void;
  defaultLocation?: string;
  submitting?: boolean;
}

const NAIROBI_ZONES = [
  "Westlands, Nairobi",
  "Kilimani, Nairobi",
  "CBD / Moi Ave, Nairobi",
  "Karen, Nairobi",
  "Lavington, Nairobi",
] as const;

const FOCUS_TAGS = [
  "Hampers & Candles",
  "Leather & Men's Gifts",
  "Kids & STEM",
  "Corporate & Boss",
] as const;

function normalizeKenyanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+254${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) return `+254${digits}`;
  return raw.startsWith("+") ? raw.trim() : `+${digits}`;
}

export function ShopOnboardForm({
  onSubmit,
  onCancel,
  defaultLocation = "Westlands, Nairobi",
  submitting = false,
}: ShopOnboardFormProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("+2547");
  const [location, setLocation] = useState(defaultLocation);
  const [categoryFocus, setCategoryFocus] = useState<string>(FOCUS_TAGS[0]);
  const [activateImmediately, setActivateImmediately] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleCreate = async () => {
    const cleanShop = shopName.trim();
    const cleanOwner = ownerName.trim();
    const cleanEmail = ownerEmail.trim();
    const formattedPhone = normalizeKenyanPhone(whatsappPhone);
    const phoneDigits = formattedPhone.replace(/\D/g, "");

    if (!cleanShop) {
      setErrorMessage("Enter a partner shop name before submitting.");
      return;
    }
    if (!cleanOwner) {
      setErrorMessage("Assign a shop owner full name.");
      return;
    }
    if (
      cleanEmail &&
      (!cleanEmail.includes("@") || !cleanEmail.includes("."))
    ) {
      setErrorMessage("Enter a valid shop owner email address.");
      return;
    }
    if (phoneDigits.length !== 12 || !phoneDigits.startsWith("254")) {
      setErrorMessage(
        "Enter a valid Kenyan WhatsApp number (e.g., +254712345678).",
      );
      return;
    }

    setErrorMessage(null);
    btnScale.value = withSequence(
      withSpring(0.96, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );

    const payload: OnboardShopPayload = {
      shopName: cleanShop,
      ownerName: cleanOwner,
      ownerEmail: cleanEmail,
      whatsappPhone: formattedPhone,
      location: location.trim() || "Nairobi",
      categoryFocus,
      status: activateImmediately ? "Active" : "Pending",
    };

    if (onSubmit) {
      await onSubmit(payload);
      return;
    }

    Alert.alert(
      "Shop Onboarded",
      `${payload.shopName} assigned to ${payload.ownerName} (${payload.status}) on ${payload.whatsappPhone}.`,
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 20) + 12,
      }}
    >
      <Animated.View
        entering={FadeInDown.springify().damping(15)}
        className={`bg-white rounded-3xl border border-rose-100 shadow-xs ${
          isCompact ? "p-3.5" : "p-5"
        }`}
      >
        {/* Header Badge */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2.5">
            <View className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center">
              <Ionicons name="storefront" size={20} color="#E11D48" />
            </View>
            <View>
              <Text className="text-base font-extrabold text-rose-950">
                Merchant Onboarding
              </Text>
              <Text className="text-[11px] text-rose-700/75">
                BLAC SANTA • Ksh 500 – 10,000 Catalog
              </Text>
            </View>
          </View>

          <View className="bg-rose-950 px-2.5 py-1 rounded-full">
            <Text className="text-[10px] font-extrabold text-rose-200 uppercase">
              Admin
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View className="bg-rose-50 border border-rose-300 rounded-2xl p-3 mb-3.5 flex-row items-center gap-2">
            <Ionicons name="alert-circle" size={17} color="#E11D48" />
            <Text className="text-xs font-bold text-rose-800 flex-1">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <View className="gap-3.5">
          {/* Shop Name */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              Partner Shop Name *
            </Text>
            <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5">
              <Ionicons name="bag-handle-outline" size={17} color="#E11D48" />
              <TextInput
                value={shopName}
                onChangeText={setShopName}
                placeholder="e.g. Velvet Rose & Hampers KE"
                placeholderTextColor="#FDA4AF"
                className="flex-1 ml-2.5 py-3 text-sm text-rose-950"
              />
            </View>
          </View>

          {/* Owner Name */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              Shop Owner Full Name *
            </Text>
            <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5">
              <Ionicons name="person-outline" size={17} color="#E11D48" />
              <TextInput
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="e.g. Wanjiku Mwangi"
                placeholderTextColor="#FDA4AF"
                className="flex-1 ml-2.5 py-3 text-sm text-rose-950"
              />
            </View>
          </View>

          {/* Owner Email */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              Owner Email Address
            </Text>
            <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5">
              <Ionicons name="mail-outline" size={17} color="#E11D48" />
              <TextInput
                value={ownerEmail}
                onChangeText={setOwnerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="owner@blacsantashop.co.ke"
                placeholderTextColor="#FDA4AF"
                className="flex-1 ml-2.5 py-3 text-sm text-rose-950"
              />
            </View>
          </View>

          {/* WhatsApp Number */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              WhatsApp Order Number (+254) *
            </Text>
            <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5">
              <Ionicons name="logo-whatsapp" size={18} color="#E11D48" />
              <TextInput
                value={whatsappPhone}
                onChangeText={setWhatsappPhone}
                keyboardType="phone-pad"
                placeholder="+254712345678"
                placeholderTextColor="#FDA4AF"
                className="flex-1 ml-2.5 py-3 text-sm font-bold text-rose-950"
              />
            </View>
          </View>

          {/* Location */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              Dispatch / Store Location
            </Text>
            <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 mb-2">
              <Ionicons name="location-outline" size={17} color="#E11D48" />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Westlands, Nairobi"
                placeholderTextColor="#FDA4AF"
                className="flex-1 ml-2.5 py-3 text-sm text-rose-950"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 12 }}
            >
              {NAIROBI_ZONES.map((zone) => {
                const selected = location === zone;
                return (
                  <Pressable
                    key={zone}
                    onPress={() => setLocation(zone)}
                    className={`mr-2 px-3 py-1.5 rounded-full border ${
                      selected
                        ? "bg-rose-950 border-rose-950"
                        : "bg-rose-50 border-rose-200"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        selected ? "text-white" : "text-rose-900"
                      }`}
                    >
                      {zone.replace(", Nairobi", "")}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Gifting Specialty */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1.5">
              Primary Gift Specialty
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {FOCUS_TAGS.map((tag) => {
                const active = categoryFocus === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setCategoryFocus(tag)}
                    className={`px-3 py-2 rounded-full border ${
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
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Initial Status Switch */}
          <Pressable
            onPress={() => setActivateImmediately((prev) => !prev)}
            className="flex-row items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 mt-1"
          >
            <View className="flex-1 pr-2">
              <Text className="text-xs font-extrabold text-rose-950">
                Publish Storefront Immediately
              </Text>
              <Text className="text-[11px] text-rose-700/75">
                {activateImmediately
                  ? "Shop will be marked Active for buyers"
                  : "Shop will be queued as Pending approval"}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                activateImmediately ? "bg-emerald-600" : "bg-amber-500"
              }`}
            >
              <Text className="text-[10px] font-extrabold text-white">
                {activateImmediately ? "Active" : "Pending"}
              </Text>
            </View>
          </Pressable>

          {/* Actions */}
          <View className="flex-row items-center gap-2.5 mt-2">
            {onCancel && (
              <Pressable
                onPress={onCancel}
                disabled={submitting}
                className="bg-rose-50 border border-rose-200 active:bg-rose-100 py-3.5 px-4 rounded-2xl items-center"
              >
                <Text className="text-xs font-extrabold text-rose-800">
                  Cancel
                </Text>
              </Pressable>
            )}

            <Animated.View style={btnStyle} className="flex-1">
              <Pressable
                onPress={handleCreate}
                disabled={submitting}
                className="flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl shadow-xs"
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text className="text-white text-sm font-extrabold">
                  {submitting ? "Onboarding..." : "Onboard Shop"}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

export default ShopOnboardForm;
