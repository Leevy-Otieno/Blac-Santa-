import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "../services/admin-service";
import type {
  AdminMarketplaceMetrics,
  AdminShop,
  AdminShopStatus,
  OnboardShopInput,
} from "../types/admin.types";

export type ShopStatusFilter = "All" | AdminShopStatus;

export interface UseAdminShopsReturn {
  shops: AdminShop[];
  filteredShops: AdminShop[];
  pendingShops: AdminShop[];
  metrics: AdminMarketplaceMetrics;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: ShopStatusFilter;
  setStatusFilter: (filter: ShopStatusFilter) => void;
  loading: boolean;
  refreshing: boolean;
  mutating: boolean;
  error: string | null;
  clearError: () => void;
  refreshShops: () => Promise<void>;
  onboardShop: (input: OnboardShopInput) => Promise<AdminShop | null>;
  approveShop: (shopId: string) => Promise<void>;
  toggleShopSuspension: (shopId: string) => Promise<void>;
  setShopStatus: (shopId: string, status: AdminShopStatus) => Promise<void>;
}

export function useAdminShops(): UseAdminShopsReturn {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShopStatusFilter>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await adminService.listShops();
      setShops(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load partner shops.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial(false);
  }, [loadInitial]);

  const refreshShops = useCallback(async () => {
    await loadInitial(true);
  }, [loadInitial]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const onboardShop = useCallback(
    async (input: OnboardShopInput): Promise<AdminShop | null> => {
      try {
        setError(null);
        setMutating(true);
        const created = await adminService.onboardShop(input);
        setShops((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to onboard shop.",
        );
        return null;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const setShopStatus = useCallback(
    async (shopId: string, nextStatus: AdminShopStatus): Promise<void> => {
      const previousShops = shops;
      setError(null);
      setMutating(true);

      setShops((prev) =>
        prev.map((item) =>
          item.id === shopId
            ? {
                ...item,
                status: nextStatus,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      try {
        await adminService.updateShopStatus(shopId, nextStatus);
      } catch (err) {
        setShops(previousShops);
        setError(
          err instanceof Error ? err.message : "Failed to update shop status.",
        );
      } finally {
        setMutating(false);
      }
    },
    [shops],
  );

  const approveShop = useCallback(
    async (shopId: string): Promise<void> => {
      await setShopStatus(shopId, "Active");
    },
    [setShopStatus],
  );

  const toggleShopSuspension = useCallback(
    async (shopId: string): Promise<void> => {
      const target = shops.find((s) => s.id === shopId);
      if (!target) return;
      const nextStatus: AdminShopStatus =
        target.status === "Active" ? "Suspended" : "Active";
      await setShopStatus(shopId, nextStatus);
    },
    [shops, setShopStatus],
  );

  const pendingShops = useMemo(
    () => shops.filter((shop) => shop.status === "Pending"),
    [shops],
  );

  const filteredShops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return shops.filter((shop) => {
      const matchesStatus =
        statusFilter === "All" || shop.status === statusFilter;
      const matchesQuery =
        !q ||
        shop.shopName.toLowerCase().includes(q) ||
        shop.ownerName.toLowerCase().includes(q) ||
        shop.location.toLowerCase().includes(q) ||
        shop.whatsappPhone.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [shops, searchQuery, statusFilter]);

  const metrics = useMemo(() => adminService.computeMetrics(shops), [shops]);

  return {
    shops,
    filteredShops,
    pendingShops,
    metrics,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    loading,
    refreshing,
    mutating,
    error,
    clearError,
    refreshShops,
    onboardShop,
    approveShop,
    toggleShopSuspension,
    setShopStatus,
  };
}
