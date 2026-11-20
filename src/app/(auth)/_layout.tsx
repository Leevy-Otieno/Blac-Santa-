import { Stack } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: "#FFF1F2" },
        headerTintColor: "#881337",
        headerTitleStyle: { fontWeight: "800", fontSize: 16 },
        contentStyle: {
          backgroundColor: "#FFF1F2",
          paddingBottom: Math.max(insets.bottom, 12),
        },
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{ title: "Sign In • BLAC SANTA" }}
      />
      <Stack.Screen
        name="phone-verify"
        options={{ title: "Verify Phone (+254)" }}
      />
      <Stack.Screen
        name="role-gate"
        options={{ title: "Select Workspace", headerLeft: () => null }}
      />
    </Stack>
  );
}
