import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Pressable,
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

export interface PhoneOtpFormProps {
  initialPhone?: string;
  initialStep?: "phone" | "otp";
  resendCooldownSeconds?: number;
  submitting?: boolean;
  externalError?: string | null;
  onSendCode?: (formattedPhone: string) => void | Promise<void>;
  onVerifyOtp?: (payload: {
    phone: string;
    code: string;
  }) => void | Promise<void>;
  onResendCode?: (formattedPhone: string) => void | Promise<void>;
  className?: string;
}

export function formatKenyanPhoneE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("254")) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+254${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) {
    return `+254${digits}`;
  }
  return rawPhone.startsWith("+") ? rawPhone.trim() : `+${digits}`;
}

export function isValidKenyanPhone(formattedPhone: string): boolean {
  const digits = formattedPhone.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("254");
}

export function PhoneOtpForm({
  initialPhone = "+2547",
  initialStep = "phone",
  resendCooldownSeconds = 30,
  submitting = false,
  externalError = null,
  onSendCode,
  onVerifyOtp,
  onResendCode,
  className = "",
}: PhoneOtpFormProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [step, setStep] = useState<"phone" | "otp">(initialStep);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [otpCode, setOtpCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (initialPhone) {
      setPhoneInput(initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const pulseButton = () => {
    btnScale.value = withSequence(
      withSpring(0.96, { damping: 10, stiffness: 260 }),
      withSpring(1, { damping: 12, stiffness: 220 }),
    );
  };

  const handleRequestOtp = async () => {
    const normalized = formatKenyanPhoneE164(phoneInput);
    if (!isValidKenyanPhone(normalized)) {
      setLocalError(
        "Enter a valid Kenyan mobile number (e.g., +254712345678 or 0712345678).",
      );
      return;
    }

    setLocalError(null);
    setPhoneInput(normalized);
    pulseButton();
    setStep("otp");
    setCooldown(resendCooldownSeconds);

    if (onSendCode) {
      await onSendCode(normalized);
    }
  };

  const handleConfirmOtp = async () => {
    const cleanCode = otpCode.replace(/\D/g, "").slice(0, 6);
    const normalized = formatKenyanPhoneE164(phoneInput);

    if (cleanCode.length !== 6) {
      setLocalError("Enter the 6-digit verification code sent to your phone.");
      return;
    }

    setLocalError(null);
    pulseButton();

    if (onVerifyOtp) {
      await onVerifyOtp({ phone: normalized, code: cleanCode });
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || submitting) return;
    const normalized = formatKenyanPhoneE164(phoneInput);
    if (!isValidKenyanPhone(normalized)) {
      setLocalError("Check your Kenyan phone number before resending.");
      return;
    }

    setLocalError(null);
    setCooldown(resendCooldownSeconds);
    if (onResendCode) {
      await onResendCode(normalized);
    } else if (onSendCode) {
      await onSendCode(normalized);
    }
  };

  const displayedError = localError || externalError;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`bg-white rounded-3xl border border-rose-100 shadow-xs ${
        isCompact ? "p-3.5" : "p-5"
      } ${className}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3.5">
        <View className="flex-row items-center gap-2.5">
          <View className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center">
            <Ionicons
              name={
                step === "phone" ? "call-outline" : "shield-checkmark-outline"
              }
              size={19}
              color="#E11D48"
            />
          </View>
          <View>
            <Text className="text-sm font-extrabold text-rose-950">
              {step === "phone" ? "Phone Sign-In (+254)" : "Verify SMS Code"}
            </Text>
            <Text className="text-[11px] text-rose-700/75">
              {step === "phone"
                ? "Instant OTP verification for Kenya"
                : `Sent to ${formatKenyanPhoneE164(phoneInput)}`}
            </Text>
          </View>
        </View>

        <View className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
          <Text className="text-[10px] font-extrabold text-rose-700">
            {step === "phone" ? "Step 1/2" : "Step 2/2"}
          </Text>
        </View>
      </View>

      {/* Error Alert */}
      {displayedError ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          className="flex-row items-center gap-2 bg-rose-50 border border-rose-300 rounded-2xl p-3 mb-3.5"
        >
          <Ionicons name="alert-circle" size={16} color="#E11D48" />
          <Text className="text-xs font-bold text-rose-800 flex-1">
            {displayedError}
          </Text>
        </Animated.View>
      ) : null}

      {step === "phone" ? (
        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1.5">
            Kenyan Mobile Number
          </Text>
          <View className="flex-row items-center bg-rose-50/70 border border-rose-200 rounded-2xl px-3.5 mb-3.5">
            <Text className="text-xs font-extrabold text-rose-700 mr-2">
              KE
            </Text>
            <TextInput
              value={phoneInput}
              onChangeText={(text) => {
                setPhoneInput(text);
                if (localError) setLocalError(null);
              }}
              keyboardType="phone-pad"
              placeholder="+254712345678"
              placeholderTextColor="#FDA4AF"
              editable={!submitting}
              className="flex-1 py-3 text-sm font-bold text-rose-950"
            />
            {phoneInput.length > 0 && (
              <Pressable onPress={() => setPhoneInput("+2547")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#FB7185" />
              </Pressable>
            )}
          </View>

          <Animated.View style={btnStyle}>
            <Pressable
              onPress={handleRequestOtp}
              disabled={submitting}
              className={`flex-row items-center justify-center gap-2 bg-rose-600 active:bg-rose-700 py-3.5 px-4 rounded-2xl ${
                submitting ? "opacity-60" : "shadow-xs"
              }`}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text className="text-white text-sm font-extrabold">
                {submitting ? "Sending Code..." : "Send Verification Code"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <View>
          <Text className="text-xs font-bold text-rose-950 mb-1.5">
            6-Digit Verification Code
          </Text>
          <TextInput
            value={otpCode}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/\D/g, "").slice(0, 6);
              setOtpCode(digitsOnly);
              if (localError) setLocalError(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#FDA4AF"
            editable={!submitting}
            className={`bg-rose-50/70 border border-rose-200 rounded-2xl px-4 py-3.5 text-center font-extrabold text-rose-950 mb-3.5 ${
              isCompact ? "text-xl tracking-[7px]" : "text-2xl tracking-[10px]"
            }`}
          />

          <Animated.View style={btnStyle}>
            <Pressable
              onPress={handleConfirmOtp}
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
                {submitting ? "Verifying..." : "Verify & Continue"}
              </Text>
            </Pressable>
          </Animated.View>

          <View className="flex-row items-center justify-between mt-3.5 pt-3 border-t border-rose-100">
            <Pressable
              onPress={() => {
                setLocalError(null);
                setOtpCode("");
                setStep("phone");
              }}
              disabled={submitting}
            >
              <Text className="text-xs font-bold text-rose-800">
                Change Number
              </Text>
            </Pressable>

            <Pressable
              onPress={handleResend}
              disabled={cooldown > 0 || submitting}
            >
              <Text
                className={`text-xs font-extrabold ${
                  cooldown > 0 ? "text-rose-400" : "text-rose-600"
                }`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

export default PhoneOtpForm;
