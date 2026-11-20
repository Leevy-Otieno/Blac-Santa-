import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatKenyanE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10)
    return `+254${digits.slice(1)}`;
  if (digits.length === 9) return `+254${digits}`;
  return raw.startsWith("+") ? raw.trim() : `+${digits}`;
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [phoneInput, setPhoneInput] = useState("+254712345678");
  const [emailInput, setEmailInput] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  const googleScale = useSharedValue(1);
  const googleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleScale.value }],
  }));

  const handleGoogleSignIn = () => {
    googleScale.value = withSequence(
      withSpring(0.96, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );
    router.replace("/(auth)/role-gate");
  };

  const handleSendPhoneOtp = () => {
    const formatted = formatKenyanE164(phoneInput);
    const digitsOnly = formatted.replace(/\D/g, "");
    if (digitsOnly.length < 12) {
      Alert.alert(
        "Invalid Kenyan Number",
        "Enter a valid phone number such as +254712345678 or 0712345678.",
      );
      return;
    }

    setIsSendingCode(true);
    setTimeout(() => {
      setIsSendingCode(false);
      router.push({
        pathname: "/(auth)/phone-verify",
        params: { phone: formatted },
      });
    }, 350);
  };

  const handleEmailOrGuestEntry = () => {
    if (emailInput.trim() && !emailInput.includes("@")) {
      Alert.alert(
        "Check Email",
        "Enter a valid email address or leave it blank.",
      );
      return;
    }
    router.replace("/(auth)/role-gate");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-rose-50/70"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
      >
        {/* Crimson Brand Hero */}
        <Animated.View
          entering={FadeIn.duration(350)}
          className="rounded-3xl bg-rose-950 p-5 mb-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <View className="self-start bg-rose-600/30 border border-rose-400/40 px-2.5 py-1 rounded-full mb-2">
                <Text className="text-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
                  Firebase Auth • Google & +254 SMS
                </Text>
              </View>
              <Text
                className={`${
                  isCompact ? "text-2xl" : "text-3xl"
                } font-extrabold text-white`}
              >
                BLAC SANTA
              </Text>
              <Text className="text-rose-200/80 text-xs mt-1 leading-4">
                Sign in to save gift ideas, manage your partner shop, or oversee
                the platform.
              </Text>
            </View>

            <View className="h-14 w-14 rounded-2xl bg-rose-600 items-center justify-center">
              <Ionicons name="gift" size={26} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>

        {/* Google Sign-In Card */}
        <Animated.View
          entering={FadeInDown.delay(90).springify().damping(15)}
          className="bg-white rounded-3xl p-4 border border-rose-100 mb-4 shadow-xs"
        >
          <Animated.View style={googleAnimatedStyle}>
            <Pressable
              onPress={handleGoogleSignIn}
              className="flex-row items-center justify-center gap-2.5 bg-rose-950 active:bg-rose-900 py-3.5 px-4 rounded-2xl"
            >
              <Ionicons name="logo-google" size={18} color="#FFFFFF" />
              <Text className="text-white text-sm font-extrabold">
                Continue with Google
              </Text>
            </Pressable>
          </Animated.View>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-rose-100" />
            <Text className="mx-3 text-[11px] font-extrabold text-rose-500 uppercase">
              Or Phone OTP
            </Text>
            <View className="flex-1 h-px bg-rose-100" />
          </View>

          <Text className="text-xs font-bold text-rose-950 mb-1.5">
            Mobile Number (Kenya +254)
          </Text>
          <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 mb-3">
            <Ionicons name="call-outline" size={18} color="#E11D48" />
            <TextInput
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholder="+254712345678"
              placeholderTextColor="#FDA4AF"
              className="flex-1 ml-2.5 py-3 text-sm font-bold text-rose-950"
            />
          </View>

          <Pressable
            onPress={handleSendPhoneOtp}
            disabled={isSendingCode}
            className="flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text className="text-white text-sm font-extrabold">
              {isSendingCode ? "Sending Code..." : "Send Verification Code"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Optional Email / Quick Buyer Access */}
        <Animated.View
          entering={FadeInDown.delay(160).springify().damping(15)}
          className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs"
        >
          <Text className="text-xs font-bold text-rose-950 mb-1.5">
            Account Email (Optional)
          </Text>
          <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 mb-3">
            <Ionicons name="mail-outline" size={18} color="#E11D48" />
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@domain.co.ke"
              placeholderTextColor="#FDA4AF"
              className="flex-1 ml-2.5 py-3 text-sm text-rose-950"
            />
          </View>

          <Pressable
            onPress={handleEmailOrGuestEntry}
            className="bg-rose-50 border border-rose-200 active:bg-rose-100 py-3.5 rounded-2xl items-center"
          >
            <Text className="text-rose-800 text-xs font-extrabold">
              Continue to Workspace Selector
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
