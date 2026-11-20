import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface AppTabItem {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badgeCount?: number;
}

export interface AppTabsProps {
  tabs: AppTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  scrollable?: boolean;
  variant?: "pills" | "underline" | "bottomBar";
  className?: string;
}

function TabButton({
  tab,
  active,
  variant,
  compact,
  onPress,
}: {
  tab: AppTabItem;
  active: boolean;
  variant: "pills" | "underline" | "bottomBar";
  compact: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    onPress();
  };

  if (variant === "underline") {
    return (
      <Animated.View style={animStyle} className="mr-5">
        <Pressable
          onPress={handlePress}
          className={`pb-2.5 pt-1 border-b-2 flex-row items-center gap-1.5 ${
            active ? "border-rose-600" : "border-transparent"
          }`}
        >
          {tab.icon && (
            <Ionicons
              name={tab.icon}
              size={16}
              color={active ? "#E11D48" : "#9F1239"}
            />
          )}
          <Text
            className={`text-xs font-extrabold ${
              active ? "text-rose-700" : "text-rose-900/70"
            }`}
          >
            {tab.label}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={animStyle}
      className={variant === "bottomBar" ? "flex-1" : "mr-2"}
    >
      <Pressable
        onPress={handlePress}
        className={`flex-row items-center justify-center gap-1.5 rounded-2xl border ${
          compact ? "px-3 py-2" : "px-3.5 py-2.5"
        } ${
          active
            ? "bg-rose-600 border-rose-600"
            : "bg-white border-rose-200 active:bg-rose-50"
        }`}
      >
        {tab.icon && (
          <Ionicons
            name={tab.icon}
            size={15}
            color={active ? "#FFFFFF" : "#E11D48"}
          />
        )}
        <Text
          numberOfLines={1}
          className={`text-xs font-extrabold ${
            active ? "text-white" : "text-rose-950"
          }`}
        >
          {tab.label}
        </Text>
        {typeof tab.badgeCount === "number" && tab.badgeCount > 0 && (
          <View
            className={`px-1.5 py-0.5 rounded-full ${
              active ? "bg-white/25" : "bg-rose-100"
            }`}
          >
            <Text
              className={`text-[10px] font-extrabold ${
                active ? "text-white" : "text-rose-700"
              }`}
            >
              {tab.badgeCount}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function AppTabs({
  tabs,
  activeKey,
  onChange,
  scrollable = true,
  variant = "pills",
  className = "",
}: AppTabsProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = width < 380;

  if (variant === "bottomBar") {
    return (
      <Animated.View
        entering={FadeIn.duration(220)}
        style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        className={`flex-row items-center gap-2 bg-rose-50 border-t border-rose-200 px-3 pt-2.5 ${className}`}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            active={tab.key === activeKey}
            variant={variant}
            compact={isCompact}
            onPress={() => onChange(tab.key)}
          />
        ))}
      </Animated.View>
    );
  }

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={className}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            active={tab.key === activeKey}
            variant={variant}
            compact={isCompact}
            onPress={() => onChange(tab.key)}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.key}
          tab={tab}
          active={tab.key === activeKey}
          variant={variant}
          compact={isCompact}
          onPress={() => onChange(tab.key)}
        />
      ))}
    </View>
  );
}

export default AppTabs;
