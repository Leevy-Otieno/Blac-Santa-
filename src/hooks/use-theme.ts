import { useMemo, useState } from "react";
import type { DiscussionParticipantRole } from "../features/shop-discussion/types/shop-discussion.types";
import { useColorScheme, type AppColorScheme } from "./use-color-scheme";

export type ThemePreference = "system" | AppColorScheme;

export interface MarketplaceThemeTokens {
  scheme: AppColorScheme;
  isDark: boolean;
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  roleAccent: string;
  roleBadgeBg: string;
  roleBadgeText: string;
}

export interface UseThemeOptions {
  initialPreference?: ThemePreference;
  role?: DiscussionParticipantRole;
}

const LIGHT_TOKENS: Omit<
  MarketplaceThemeTokens,
  "scheme" | "isDark" | "roleAccent" | "roleBadgeBg" | "roleBadgeText"
> = {
  background: "#FFF1F2",
  surface: "#FFFFFF",
  surfaceMuted: "#FFE4E6",
  text: "#4C0519",
  textMuted: "#9F1239",
  border: "#FECDD3",
  primary: "#E11D48",
  primaryText: "#FFFFFF",
  accent: "#FB7185",
};

const DARK_TOKENS: Omit<
  MarketplaceThemeTokens,
  "scheme" | "isDark" | "roleAccent" | "roleBadgeBg" | "roleBadgeText"
> = {
  background: "#18060B",
  surface: "#260A12",
  surfaceMuted: "#3B0F1C",
  text: "#FFF1F2",
  textMuted: "#FDA4AF",
  border: "#4C1223",
  primary: "#F43F5E",
  primaryText: "#FFFFFF",
  accent: "#FB7185",
};

function getRolePalette(
  role: DiscussionParticipantRole,
  isDark: boolean,
): {
  roleAccent: string;
  roleBadgeBg: string;
  roleBadgeText: string;
} {
  if (role === "admin") {
    return {
      roleAccent: isDark ? "#FBBF24" : "#D97706",
      roleBadgeBg: isDark ? "#451A03" : "#FEF3C7",
      roleBadgeText: isDark ? "#FDE68A" : "#78350F",
    };
  }
  if (role === "shop") {
    return {
      roleAccent: isDark ? "#FB7185" : "#E11D48",
      roleBadgeBg: isDark ? "#4C0519" : "#FFE4E6",
      roleBadgeText: isDark ? "#FECDD3" : "#881337",
    };
  }
  return {
    roleAccent: isDark ? "#38BDF8" : "#0284C7",
    roleBadgeBg: isDark ? "#082F49" : "#E0F2FE",
    roleBadgeText: isDark ? "#BAE6FD" : "#0C4A6E",
  };
}

export function useTheme(options: UseThemeOptions = {}) {
  const { initialPreference = "system", role = "buyer" } = options;

  const systemScheme = useColorScheme();
  const [preference, setPreference] =
    useState<ThemePreference>(initialPreference);

  const activeScheme: AppColorScheme =
    preference === "system" ? systemScheme : preference;
  const isDark = activeScheme === "dark";

  const colors = useMemo<MarketplaceThemeTokens>(() => {
    const base = isDark ? DARK_TOKENS : LIGHT_TOKENS;
    const rolePalette = getRolePalette(role, isDark);

    return {
      scheme: activeScheme,
      isDark,
      ...base,
      ...rolePalette,
    };
  }, [activeScheme, isDark, role]);

  const toggleScheme = () => {
    setPreference((prev) => {
      const current = prev === "system" ? systemScheme : prev;
      return current === "dark" ? "light" : "dark";
    });
  };

  return {
    scheme: activeScheme,
    systemScheme,
    preference,
    setPreference,
    toggleScheme,
    isDark,
    colors,
  };
}

export default useTheme;
