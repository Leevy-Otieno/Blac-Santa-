import { useCallback, useEffect, useMemo, useState } from "react";
import { shopService } from "../services/shop-service";
import type {
  CreateShopGiftInput,
  ShopGiftListing,
  ShopProfile,
  ShopStatsMetrics,
  UpdateShopGiftInput,
} from "../types/shop.types";

export interface UseShopGiftsReturn {
  shopId: string;
  profile: ShopProfile | null;
  gifts: ShopGiftListing[];
  filteredGifts: ShopGiftListing[];
  stats: ShopStatsMetrics;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stockFilter: "all" | "in-stock" | "sold-out";
  setStockFilter: (filter: "all" | "in-stock" | "sold-out") => void;
  loading: boolean;
  refreshing: boolean;
  mutating: boolean;
  error: string | null;
  clearError: () => void;
  refreshShopData: () => Promise<void>;
  createGift: (
    values: Omit<CreateShopGiftInput, "shopId">,
  ) => Promise<ShopGiftListing | null>;
  updateGift: (
    values: Omit<UpdateShopGiftInput, "shopId">,
  ) => Promise<ShopGiftListing | null>;
  toggleStock: (giftId: string) => Promise<void>;
  deleteGift: (giftId: string) => Promise<void>;
}

const DEFAULT_STATS: ShopStatsMetrics = {
  activeGifts: 0,
  soldOutGifts: 0,
  whatsappClicks: 0,
  averagePriceKsh: 0,
};

export function useShopGifts(
  shopId = "shop-savanna-scents",
): UseShopGiftsReturn {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [gifts, setGifts] = useState<ShopGiftListing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "sold-out"
  >("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [shopProfile, listings] = await Promise.all([
          shopService.getShopProfile(shopId),
          shopService.listShopGifts(shopId),
        ]);

        setProfile(shopProfile);
        setGifts(listings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load shop gifts.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [shopId],
  );

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  const refreshShopData = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createGift = useCallback(
    async (
      values: Omit<CreateShopGiftInput, "shopId">,
    ): Promise<ShopGiftListing | null> => {
      try {
        setError(null);
        setMutating(true);
        const created = await shopService.createGift({
          ...values,
          shopId,
        });
        setGifts((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create gift listing.",
        );
        return null;
      } finally {
        setMutating(false);
      }
    },
    [shopId],
  );

  const updateGift = useCallback(
    async (
      values: Omit<UpdateShopGiftInput, "shopId">,
    ): Promise<ShopGiftListing | null> => {
      try {
        setError(null);
        setMutating(true);
        const updated = await shopService.updateGift({
          ...values,
          shopId,
        });
        setGifts((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update gift listing.",
        );
        return null;
      } finally {
        setMutating(false);
      }
    },
    [shopId],
  );

  const toggleStock = useCallback(
    async (giftId: string): Promise<void> => {
      const snapshot = gifts;
      setError(null);
      setMutating(true);

      setGifts((prev) =>
        prev.map((item) =>
          item.id === giftId
            ? {
                ...item,
                inStock: !item.inStock,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      try {
        await shopService.toggleGiftStock(giftId);
      } catch (err) {
        setGifts(snapshot);
        setError(
          err instanceof Error ? err.message : "Failed to update stock status.",
        );
      } finally {
        setMutating(false);
      }
    },
    [gifts],
  );

  const deleteGift = useCallback(
    async (giftId: string): Promise<void> => {
      const snapshot = gifts;
      setError(null);
      setMutating(true);

      setGifts((prev) => prev.filter((item) => item.id !== giftId));

      try {
        await shopService.deleteGift(giftId);
      } catch (err) {
        setGifts(snapshot);
        setError(
          err instanceof Error ? err.message : "Failed to delete gift listing.",
        );
      } finally {
        setMutating(false);
      }
    },
    [gifts],
  );

  const filteredGifts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return gifts.filter((item) => {
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" ? item.inStock : !item.inStock);

      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.occasion.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesStock && matchesQuery;
    });
  }, [gifts, searchQuery, stockFilter]);

  const stats = useMemo(
    () =>
      gifts.length > 0 ? shopService.computeShopStats(gifts) : DEFAULT_STATS,
    [gifts],
  );

  return {
    shopId,
    profile,
    gifts,
    filteredGifts,
    stats,
    searchQuery,
    setSearchQuery,
    stockFilter,
    setStockFilter,
    loading,
    refreshing,
    mutating,
    error,
    clearError,
    refreshShopData,
    createGift,
    updateGift,
    toggleStock,
    deleteGift,
  };
}
