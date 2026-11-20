import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export interface ImageUploaderProps {
  value: string;
  onChange: (uri: string) => void;
  label?: string;
  helperText?: string;
  presets?: readonly { id: string; label: string; uri: string }[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_GIFT_PRESETS = [
  {
    id: "hamper",
    label: "Rose Hamper",
    uri: "https://images.unsplash.com/photo-1603006905393-c8849bb012c0?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "leather",
    label: "Leather Edit",
    uri: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "festive",
    label: "Festive Box",
    uri: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "keepsake",
    label: "Keepsake Set",
    uri: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85",
  },
] as const;

export function ImageUploader({
  value,
  onChange,
  label = "Gift Showcase Photo",
  helperText = "Pick from your gallery, snap a photo, or paste a direct image link.",
  presets = DEFAULT_GIFT_PRESETS,
  disabled = false,
  className = "",
}: ImageUploaderProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [picking, setPicking] = useState(false);
  const [urlExpanded, setUrlExpanded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const handlePickFromLibrary = async () => {
    if (disabled || picking) return;
    try {
      setPicking(true);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission Needed",
          "Allow photo library access in settings to upload gift images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setLoadFailed(false);
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        "Upload Error",
        "Unable to open your photo library right now.",
      );
    } finally {
      setPicking(false);
    }
  };

  const handleTakePhoto = async () => {
    if (disabled || picking) return;
    try {
      setPicking(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Needed",
          "Allow camera access in settings to capture a gift photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setLoadFailed(false);
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Camera Error", "Unable to launch camera right now.");
    } finally {
      setPicking(false);
    }
  };

  const hasValidPreview = Boolean(value?.trim()) && !loadFailed;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`w-full ${className}`}
    >
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-xs font-extrabold text-rose-950">{label}</Text>
        <Pressable onPress={() => setUrlExpanded((prev) => !prev)} hitSlop={8}>
          <Text className="text-[11px] font-bold text-rose-600">
            {urlExpanded ? "Hide URL" : "Paste URL"}
          </Text>
        </Pressable>
      </View>

      {/* Preview Frame */}
      <View
        className={`w-full rounded-3xl overflow-hidden border border-rose-200 bg-rose-50/80 mb-2.5 ${
          isCompact ? "h-40" : "h-48"
        }`}
      >
        {hasValidPreview ? (
          <Animated.View entering={FadeIn.duration(200)} className="flex-1">
            <Image
              source={{ uri: value }}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setLoadFailed(true)}
            />

            <View className="absolute top-2.5 left-2.5 bg-rose-950/85 px-2.5 py-1 rounded-full">
              <Text className="text-[10px] font-extrabold text-rose-100">
                Preview Ready
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setLoadFailed(false);
                onChange("");
              }}
              hitSlop={8}
              className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/95 border border-rose-200 items-center justify-center shadow-xs"
            >
              <Ionicons name="trash-outline" size={15} color="#E11D48" />
            </Pressable>
          </Animated.View>
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <View className="h-11 w-11 rounded-2xl bg-white border border-rose-200 items-center justify-center mb-2">
              <Ionicons name="camera-outline" size={22} color="#E11D48" />
            </View>
            <Text className="text-xs font-extrabold text-rose-950">
              {loadFailed ? "Image Could Not Load" : "No Gift Image Selected"}
            </Text>
            <Text className="text-[11px] text-rose-700/75 text-center mt-0.5">
              {helperText}
            </Text>
          </View>
        )}
      </View>

      {/* Gallery & Camera Buttons */}
      <View className="flex-row items-center gap-2 mb-2.5">
        <Pressable
          onPress={handlePickFromLibrary}
          disabled={disabled || picking}
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-rose-600 active:bg-rose-700 py-3 px-3 rounded-2xl shadow-xs"
        >
          {picking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="images-outline" size={16} color="#FFFFFF" />
          )}
          <Text className="text-white text-xs font-extrabold">
            {picking ? "Opening..." : "Gallery"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleTakePhoto}
          disabled={disabled || picking}
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-rose-950 active:bg-rose-900 py-3 px-3 rounded-2xl"
        >
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text className="text-white text-xs font-extrabold">Camera</Text>
        </Pressable>
      </View>

      {/* Optional Direct URL Input */}
      {urlExpanded && (
        <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3 mb-2.5">
          <Ionicons name="link-outline" size={16} color="#E11D48" />
          <TextInput
            value={value}
            onChangeText={(text) => {
              setLoadFailed(false);
              onChange(text);
            }}
            autoCapitalize="none"
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor="#FDA4AF"
            className="flex-1 ml-2 py-2.5 text-xs text-rose-950"
          />
        </View>
      )}

      {/* Quick Studio Presets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {presets.map((preset) => {
          const active = value === preset.uri;
          return (
            <Pressable
              key={preset.id}
              onPress={() => {
                setLoadFailed(false);
                onChange(preset.uri);
              }}
              className={`mr-2 px-3 py-1.5 rounded-full border ${
                active
                  ? "bg-rose-600 border-rose-600"
                  : "bg-white border-rose-200"
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  active ? "text-white" : "text-rose-950"
                }`}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

export default ImageUploader;
