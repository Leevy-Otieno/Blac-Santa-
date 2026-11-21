import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

export type AppColorScheme = "light" | "dark";

export function syncColorScheme(_scheme: AppColorScheme | "system"): void {
  // Handled via class darkMode on web when toggled
}

export function useColorScheme(): AppColorScheme {
  const rnScheme = useRNColorScheme();
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [mediaIsDark, setMediaIsDark] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);

    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setMediaIsDark(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMediaIsDark(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  if (!hasHydrated) {
    return rnScheme === "dark" ? "dark" : "light";
  }

  if (mediaIsDark || rnScheme === "dark") {
    return "dark";
  }

  return "light";
}

export default useColorScheme;
