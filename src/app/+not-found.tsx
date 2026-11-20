import { Ionicons } from "@expo/vector-icons";
import { router, Stack, usePathname } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  const missingPath = usePathname();

  return (
    <>
      <Stack.Screen options={{ title: "Route Not Found" }} />
      <View
        className="flex-1 bg-rose-50/70 items-center justify-center px-5"
        style={{
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <Animated.View
          entering={FadeInDown.springify().damping(15)}
          className="w-full bg-white rounded-3xl p-6 border border-rose-100 shadow-xs"
        >
          <View className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center mb-4 self-center">
            <Ionicons name="compass-outline" size={28} color="#E11D48" />
          </View>

          <Text className="text-xl font-extrabold text-rose-950 text-center">
            Screen Unavailable
          </Text>
          <Text className="text-xs text-rose-700/80 text-center mt-1.5 leading-5">
            The requested route could not be matched in BLAC SANTA.
          </Text>

          <View className="bg-rose-50/80 border border-rose-200 rounded-2xl px-3.5 py-2.5 my-4">
            <Text className="text-[10px] font-extrabold text-rose-500 uppercase">
              Attempted Path
            </Text>
            <Text className="text-xs font-bold text-rose-950 mt-0.5">
              {missingPath || "/unknown"}
            </Text>
          </View>

          <View className="gap-2.5">
            <Pressable
              onPress={() => router.replace("/(buyer)")}
              className="bg-rose-600 active:bg-rose-700 py-3.5 rounded-2xl items-center"
            >
              <Text className="text-white text-xs font-extrabold">
                Go to Buyer Gift Discovery
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/")}
              className="bg-rose-50 border border-rose-200 py-3.5 rounded-2xl items-center"
            >
              <Text className="text-rose-800 text-xs font-extrabold">
                Return to Smart Gift Advisor
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </>
  );
}
