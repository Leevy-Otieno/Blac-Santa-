import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
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

export type ShopGiftCategory = "For Her" | "For Him" | "Kids" | "Boss";
export type ShopGiftOccasion = "Valentine's Day" | "Birthdays" | "Christmas";
export type ShopGiftAgeGroup = "6–12" | "18–24" | "25–34" | "35+";

export interface ShopGiftFormValues {
  title: string;
  priceKsh: number;
  originalPriceKsh?: number;
  category: ShopGiftCategory;
  occasion: ShopGiftOccasion;
  ageGroup: ShopGiftAgeGroup;
  description: string;
  imageUrl: string;
  sameDayNairobi: boolean;
  inStock: boolean;
}

export interface GiftFormProps {
  initialValues?: Partial<ShopGiftFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: ShopGiftFormValues) => void | Promise<void>;
  onCancel?: () => void;
  renderImageUploader?: (params: {
    imageUrl: string;
    onChangeImage: (uri: string) => void;
  }) => React.ReactNode;
}

const CATEGORIES: readonly ShopGiftCategory[] = [
  "For Her",
  "For Him",
  "Kids",
  "Boss",
];

const OCCASIONS: readonly ShopGiftOccasion[] = [
  "Valentine's Day",
  "Birthdays",
  "Christmas",
];

const AGE_GROUPS: readonly ShopGiftAgeGroup[] = [
  "6–12",
  "18–24",
  "25–34",
  "35+",
];

const MIN_GIFT_KSH = 500;
const MAX_ALLOWED_GIFT_KSH = 250000;

export function GiftForm({
  initialValues,
  submitLabel = "Save Gift Listing",
  submitting = false,
  onSubmit,
  onCancel,
  renderImageUploader,
}: GiftFormProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [priceText, setPriceText] = useState(
    initialValues?.priceKsh ? String(initialValues.priceKsh) : "2500",
  );
  const [originalPriceText, setOriginalPriceText] = useState(
    initialValues?.originalPriceKsh
      ? String(initialValues.originalPriceKsh)
      : "",
  );
  const [category, setCategory] = useState<ShopGiftCategory>(
    initialValues?.category ?? "For Her",
  );
  const [occasion, setOccasion] = useState<ShopGiftOccasion>(
    initialValues?.occasion ?? "Valentine's Day",
  );
  const [ageGroup, setAgeGroup] = useState<ShopGiftAgeGroup>(
    initialValues?.ageGroup ?? "25–34",
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [imageUrl, setImageUrl] = useState(
    initialValues?.imageUrl ??
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85",
  );
  const [sameDayNairobi, setSameDayNairobi] = useState(
    initialValues?.sameDayNairobi ?? true,
  );
  const [inStock, setInStock] = useState(initialValues?.inStock ?? true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  useEffect(() => {
    if (!initialValues) return;
    if (typeof initialValues.title === "string") setTitle(initialValues.title);
    if (typeof initialValues.priceKsh === "number") {
      setPriceText(String(initialValues.priceKsh));
    }
    if (typeof initialValues.originalPriceKsh === "number") {
      setOriginalPriceText(String(initialValues.originalPriceKsh));
    }
    if (initialValues.category) setCategory(initialValues.category);
    if (initialValues.occasion) setOccasion(initialValues.occasion);
    if (initialValues.ageGroup) setAgeGroup(initialValues.ageGroup);
    if (typeof initialValues.description === "string") {
      setDescription(initialValues.description);
    }
    if (typeof initialValues.imageUrl === "string") {
      setImageUrl(initialValues.imageUrl);
    }
    if (typeof initialValues.sameDayNairobi === "boolean") {
      setSameDayNairobi(initialValues.sameDayNairobi);
    }
    if (typeof initialValues.inStock === "boolean") {
      setInStock(initialValues.inStock);
    }
  }, [initialValues]);

  const parsedPricePreview = Number(priceText.replace(/\D/g, "")) || 0;
  const isAboveTenThousand = parsedPricePreview > 10000;

  const handleSave = async () => {
    const cleanTitle = title.trim();
    const parsedPrice = Number(priceText.replace(/\D/g, ""));
    const parsedOriginal = originalPriceText.trim()
      ? Number(originalPriceText.replace(/\D/g, ""))
      : undefined;
    const cleanDescription = description.trim();
    const cleanImage = imageUrl.trim();

    if (!cleanTitle) {
      setErrorText("Enter a clear gift title for buyers.");
      return;
    }
    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < MIN_GIFT_KSH ||
      parsedPrice > MAX_ALLOWED_GIFT_KSH
    ) {
      setErrorText(
        `Gift price must be at least Ksh ${MIN_GIFT_KSH.toLocaleString(
          "en-KE",
        )} and up to Ksh ${MAX_ALLOWED_GIFT_KSH.toLocaleString("en-KE")}.`,
      );
      return;
    }
    if (
      typeof parsedOriginal === "number" &&
      parsedOriginal > 0 &&
      parsedOriginal <= parsedPrice
    ) {
      setErrorText(
        "Original price must be higher than the current Ksh price to show a discount.",
      );
      return;
    }
    if (!cleanImage) {
      setErrorText("Add or select a gift photo before saving.");
      return;
    }
    if (!cleanDescription) {
      setErrorText("Add a short gift description including what is included.");
      return;
    }

    setErrorText(null);
    btnScale.value = withSequence(
      withSpring(0.96, { damping: 10, stiffness: 250 }),
      withSpring(1, { damping: 12, stiffness: 210 }),
    );

    await onSubmit({
      title: cleanTitle,
      priceKsh: parsedPrice,
      originalPriceKsh:
        typeof parsedOriginal === "number" && parsedOriginal > parsedPrice
          ? parsedOriginal
          : undefined,
      category,
      occasion,
      ageGroup,
      description: cleanDescription,
      imageUrl: cleanImage,
      sameDayNairobi,
      inStock,
    });
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
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2.5">
            <View className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center">
              <Ionicons name="gift-outline" size={20} color="#E11D48" />
            </View>
            <View>
              <Text className="text-base font-extrabold text-rose-950">
                Gift Listing Editor
              </Text>
              <Text className="text-[11px] text-rose-700/75">
                Ksh 500 – 10,000 & Above Ksh 10,000 Supported
              </Text>
            </View>
          </View>

          <View className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            <Text className="text-[10px] font-extrabold text-rose-700">
              {isAboveTenThousand ? "10k+ Edit" : "Shop Portal"}
            </Text>
          </View>
        </View>

        {errorText ? (
          <View className="flex-row items-center gap-2 bg-rose-50 border border-rose-300 rounded-2xl p-3 mb-3.5">
            <Ionicons name="alert-circle" size={17} color="#E11D48" />
            <Text className="text-xs font-bold text-rose-800 flex-1">
              {errorText}
            </Text>
          </View>
        ) : null}

        <View className="gap-3.5">
          {renderImageUploader ? (
            renderImageUploader({
              imageUrl,
              onChangeImage: (uri) => setImageUrl(uri),
            })
          ) : (
            <View>
              <Text className="text-xs font-bold text-rose-950 mb-1">
                Gift Photo URL *
              </Text>
              <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5">
                <Ionicons name="image-outline" size={17} color="#E11D48" />
                <TextInput
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                  placeholder="https://..."
                  placeholderTextColor="#FDA4AF"
                  className="flex-1 ml-2.5 py-3 text-xs text-rose-950"
                />
              </View>
            </View>
          )}

          {/* Gift Title */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              Gift Title *
            </Text>
            <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5">
              <Ionicons name="sparkles-outline" size={17} color="#E11D48" />
              <TextInput
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errorText) setErrorText(null);
                }}
                placeholder="e.g. Crimson Rose & Vanilla Hamper"
                placeholderTextColor="#FDA4AF"
                className="flex-1 ml-2.5 py-3 text-sm text-rose-950"
              />
            </View>
          </View>

          {/* Price & Optional Original Price */}
          <View className="flex-row items-center gap-2.5">
            <View className="flex-1">
              <Text className="text-xs font-bold text-rose-950 mb-1">
                Price (Ksh) *
              </Text>
              <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3">
                <Text className="text-xs font-extrabold text-rose-600 mr-1.5">
                  Ksh
                </Text>
                <TextInput
                  value={priceText}
                  onChangeText={(t) => {
                    setPriceText(t.replace(/\D/g, ""));
                    if (errorText) setErrorText(null);
                  }}
                  keyboardType="number-pad"
                  placeholder="2500"
                  placeholderTextColor="#FDA4AF"
                  className="flex-1 py-3 text-sm font-extrabold text-rose-950"
                />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-xs font-bold text-rose-950 mb-1">
                Was Price (Optional)
              </Text>
              <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3">
                <Text className="text-xs font-bold text-rose-400 mr-1.5">
                  Ksh
                </Text>
                <TextInput
                  value={originalPriceText}
                  onChangeText={(t) =>
                    setOriginalPriceText(t.replace(/\D/g, ""))
                  }
                  keyboardType="number-pad"
                  placeholder="16000"
                  placeholderTextColor="#FDA4AF"
                  className="flex-1 py-3 text-sm font-bold text-rose-950"
                />
              </View>
            </View>
          </View>

          {isAboveTenThousand && (
            <View className="flex-row items-center gap-2 bg-rose-950 rounded-2xl px-3.5 py-2.5">
              <Ionicons name="diamond-outline" size={16} color="#FDA4AF" />
              <Text className="text-[11px] font-bold text-rose-100 flex-1">
                Listed in the Above Ksh 10,000 tier (up to Ksh 250,000).
              </Text>
            </View>
          )}

          {/* Recipient Category */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1.5">
              Recipient Category
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
                        : "bg-rose-50/70 border-rose-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? "text-white" : "text-rose-950"
                      }`}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Occasion */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1.5">
              Primary Occasion
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
                        ? "bg-rose-950 border-rose-950"
                        : "bg-rose-50/70 border-rose-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? "text-white" : "text-rose-950"
                      }`}
                    >
                      {occ}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Age Group */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1.5">
              Target Age Group
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {AGE_GROUPS.map((age) => {
                const active = ageGroup === age;
                return (
                  <Pressable
                    key={age}
                    onPress={() => setAgeGroup(age)}
                    className={`px-3 py-1.5 rounded-full border ${
                      active
                        ? "bg-rose-600 border-rose-600"
                        : "bg-white border-rose-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? "text-white" : "text-rose-950"
                      }`}
                    >
                      {age}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View>
            <Text className="text-xs font-bold text-rose-950 mb-1">
              Gift Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                if (errorText) setErrorText(null);
              }}
              multiline
              numberOfLines={3}
              placeholder="Describe what's inside the box, packaging style, and gift note option..."
              placeholderTextColor="#FDA4AF"
              className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 py-3 text-xs text-rose-950 leading-5 min-h-[78px]"
            />
          </View>

          {/* Fulfillment & Stock Toggles */}
          <View className="gap-2 pt-1">
            <Pressable
              onPress={() => setSameDayNairobi((prev) => !prev)}
              className="flex-row items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2.5"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="bicycle-outline" size={17} color="#E11D48" />
                <Text className="text-xs font-bold text-rose-950">
                  Same-Day Nairobi Dispatch
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full ${
                  sameDayNairobi ? "bg-rose-600" : "bg-rose-200"
                }`}
              >
                <Text
                  className={`text-[10px] font-extrabold ${
                    sameDayNairobi ? "text-white" : "text-rose-900"
                  }`}
                >
                  {sameDayNairobi ? "Enabled" : "Standard"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setInStock((prev) => !prev)}
              className="flex-row items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2.5"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="checkmark-done-outline"
                  size={17}
                  color="#E11D48"
                />
                <Text className="text-xs font-bold text-rose-950">
                  Available in Stock
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full ${
                  inStock ? "bg-emerald-600" : "bg-amber-500"
                }`}
              >
                <Text className="text-[10px] font-extrabold text-white">
                  {inStock ? "In Stock" : "Sold Out"}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Submit Row */}
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
                onPress={handleSave}
                disabled={submitting}
                className={`flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl ${
                  submitting ? "opacity-60" : "shadow-xs"
                }`}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text className="text-white text-sm font-extrabold">
                  {submitting ? "Saving..." : submitLabel}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

export default GiftForm;
