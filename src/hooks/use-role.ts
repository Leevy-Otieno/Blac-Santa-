import { useCallback, useMemo, useState } from "react";
import type { DiscussionParticipantRole } from "../features/shop-discussion/types/shop-discussion.types";

export type MarketplaceRole = DiscussionParticipantRole;

export interface ActiveRoleSession {
  userId: string;
  userName: string;
  role: MarketplaceRole;
  isAuthenticated: boolean;
  ownedShopId?: string;
}

export interface UseRoleOptions {
  initialRole?: MarketplaceRole;
  initialUserName?: string;
  initialAuthenticated?: boolean;
  ownedShopId?: string;
}

export function normalizeMarketplaceRole(
  rawRole: unknown,
  fallback: MarketplaceRole = "buyer",
): MarketplaceRole {
  if (typeof rawRole !== "string") return fallback;
  const cleaned = rawRole.trim().toLowerCase();
  if (cleaned === "admin" || cleaned === "administrator") return "admin";
  if (
    cleaned === "shop" ||
    cleaned === "shop_owner" ||
    cleaned === "shop-owner" ||
    cleaned === "vendor" ||
    cleaned === "merchant"
  ) {
    return "shop";
  }
  if (cleaned === "buyer" || cleaned === "customer" || cleaned === "user") {
    return "buyer";
  }
  return fallback;
}

export function useRole(options: UseRoleOptions = {}) {
  const {
    initialRole = "buyer",
    initialUserName = "",
    initialAuthenticated = true,
    ownedShopId,
  } = options;

  const [role, setRoleState] = useState<MarketplaceRole>(() =>
    normalizeMarketplaceRole(initialRole, "buyer"),
  );
  const [userName, setUserName] = useState<string>(initialUserName);
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(initialAuthenticated);

  const setRole = useCallback((nextRole: unknown) => {
    setRoleState(normalizeMarketplaceRole(nextRole, "buyer"));
  }, []);

  const canModerate = role === "admin";
  const canManageShop = role === "shop" || role === "admin";
  const canPostOrChat = isAuthenticated;

  const authUser = useMemo<ActiveRoleSession>(
    () => ({
      userId: isAuthenticated ? `user_${role}` : "guest",
      userName:
        userName.trim() ||
        (role === "admin"
          ? "BLAC SANTA Admin"
          : role === "shop"
            ? "Shop Owner"
            : "Buyer"),
      role,
      isAuthenticated,
      ownedShopId,
    }),
    [isAuthenticated, userName, role, ownedShopId],
  );

  return {
    role,
    setRole,
    userName,
    setUserName,
    isAuthenticated,
    setIsAuthenticated,
    canModerate,
    canManageShop,
    canPostOrChat,
    authUser,
  };
}

export default useRole;
