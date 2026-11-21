import { colorScheme as nativeWindColorScheme } from "nativewind";
import { Appearance, useColorScheme as useRNColorScheme } from "react-native";

export type AppColorScheme = "light" | "dark";

export function syncColorScheme(scheme: AppColorScheme | "system"): void {
  try {
    nativeWindColorScheme.set(scheme);
  } catch {
    if (typeof Appearance.setColorScheme === "function") {
      Appearance.setColorScheme(scheme === "system" ? null : scheme);
    }
  }
}

export function useColorScheme(): AppColorScheme {
  const scheme = useRNColorScheme();
  return scheme === "dark" ? "dark" : "light";
}

export default useColorScheme;
