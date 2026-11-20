import "../utils/global.css";
import { Ionicons } from "@expo/vector-icons";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 bg-rose-50 items-center justify-center px-6">
      <View className="w-full bg-white rounded-3xl p-6 border border-rose-200 items-center shadow-sm">
        <View className="h-14 w-14 rounded-2xl bg-rose-100 items-center justify-center mb-3">
          <Ionicons name="alert-circle" size={30} color="#E11D48" />
        </View>
        <Text className="text-lg font-extrabold text-rose-950 text-center">
          Something Went Wrong
        </Text>
        <Text className="text-xs text-rose-700/80 text-center mt-1.5 mb-5 leading-5">
          {error.message || "An unexpected error occurred in BLAC SANTA."}
        </Text>
        <Pressable
          onPress={retry}
          className="bg-rose-600 active:bg-rose-700 px-6 py-3.5 rounded-2xl"
        >
          <Text className="text-white text-xs font-extrabold">
            Reload Screen
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#FFF1F2" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
            contentStyle: { backgroundColor: "#FFF1F2" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="explore" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(buyer)" />
          <Stack.Screen name="(shop)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen
            name="+not-found"
            options={{
              headerShown: true,
              title: "Route Recovery",
              headerStyle: { backgroundColor: "#FFF1F2" },
              headerTintColor: "#881337",
              headerTitleStyle: { fontWeight: "800" },
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
