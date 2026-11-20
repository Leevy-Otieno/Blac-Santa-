import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dismissOnBackdrop?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  dismissOnBackdrop = true,
}: ModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-rose-950/60"
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          className="flex-1 justify-end"
        >
          {dismissOnBackdrop && (
            <Pressable className="flex-1" onPress={onClose} />
          )}

          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={{
              maxHeight: Math.round(height * 0.85),
              paddingBottom: Math.max(insets.bottom, 20),
            }}
            className="bg-white rounded-t-3xl border-t border-rose-100 pt-3 px-4 shadow-lg"
          >
            {/* Sheet Drag Handle */}
            <View className="w-10 h-1.5 rounded-full bg-rose-200 self-center mb-3" />

            {/* Modal Header */}
            <View className="flex-row items-start justify-between pb-3 border-b border-rose-100">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-extrabold text-rose-950">
                  {title}
                </Text>
                {subtitle ? (
                  <Text className="text-xs text-rose-700/80 mt-0.5">
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="h-9 w-9 rounded-full bg-rose-50 border border-rose-200 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#881337" />
              </Pressable>
            </View>

            {/* Scrollable Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 14 }}
            >
              {children}
            </ScrollView>

            {/* Optional Action Footer */}
            {footer ? (
              <View className="pt-3 border-t border-rose-100">{footer}</View>
            ) : null}
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

export default Modal;
