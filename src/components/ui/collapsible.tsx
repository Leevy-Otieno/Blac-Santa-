import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface CollapsibleProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Collapsible({
  title,
  subtitle,
  badgeText,
  defaultOpen = false,
  children,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 180 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    rotation.value = withTiming(next ? 180 : 0, { duration: 220 });
  };

  return (
    <Animated.View
      layout={Layout.springify()}
      className="bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-xs"
    >
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between p-4 active:bg-rose-50/60"
      >
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-extrabold text-rose-950 flex-shrink">
              {title}
            </Text>
            {badgeText ? (
              <View className="bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-extrabold text-rose-600">
                  {badgeText}
                </Text>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <Text className="text-xs text-rose-700/75 mt-0.5 leading-4">
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Animated.View
          style={chevronStyle}
          className="h-8 w-8 rounded-full bg-rose-50 border border-rose-200 items-center justify-center"
        >
          <Ionicons name="chevron-down" size={16} color="#E11D48" />
        </Animated.View>
      </Pressable>

      {open && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="px-4 pb-4 pt-2 border-t border-rose-100"
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

export default Collapsible;
