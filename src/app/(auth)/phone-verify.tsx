import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PhoneVerifyScreen() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    const cleanCode = otpCode.replace(/\D/g, "");
    if (cleanCode.length < 6) {
      Alert.alert("Incomplete Code", "Enter the 6-digit verification code.");
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      router.replace("/(auth)/role-gate");
    }, 350);
  };

  const handleResend = () => {
    Alert.alert(
      "Code Resent",
      `A fresh 6-digit verification code was sent to ${phone ?? "your phone"}.`,
    );
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
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
      >
        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(15)}
          className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs"
        >
          <View className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center mb-3">
            <Ionicons name="shield-checkmark" size={24} color="#E11D48" />
          </View>

          <Text className="text-xl font-extrabold text-rose-950">
            Verify Your Phone
          </Text>
          <Text className="text-xs text-rose-700/80 mt-1 leading-4">
            We sent a 6-digit code to{" "}
            <Text className="font-extrabold text-rose-950">
              {phone ?? "+254 7XX XXX XXX"}
            </Text>
            .
          </Text>

          <Text className="text-xs font-bold text-rose-950 mt-4 mb-1.5">
            6-Digit OTP Code
          </Text>
          <TextInput
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#FDA4AF"
            className="bg-rose-50/70 border border-rose-200 rounded-2xl px-4 py-3.5 text-center text-2xl font-extrabold tracking-[10px] text-rose-950 mb-4"
          />

          <Pressable
            onPress={handleVerify}
            disabled={verifying}
            className="bg-rose-600 active:bg-rose-700 py-4 rounded-2xl items-center"
          >
            <Text className="text-white text-sm font-extrabold">
              {verifying ? "Verifying..." : "Verify & Continue"}
            </Text>
          </Pressable>

          <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-rose-100">
            <Pressable onPress={() => router.back()}>
              <Text className="text-xs font-bold text-rose-700">
                Change Number
              </Text>
            </Pressable>

            <Pressable onPress={handleResend}>
              <Text className="text-xs font-extrabold text-rose-600">
                Resend Code
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
