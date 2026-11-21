import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminRevenueSummary,
  MarketplaceOrder,
  MarketplaceShop,
  ShopRevenueSummary,
} from "../types/marketplace.types";

interface UseAdminRevenueOptions {
  initialShops?: MarketplaceShop[];
  initialOrders?: MarketplaceOrder[];
  defaultCommissionRate?: number; // e.g., 0.1 for 10%
}

export function useAdminRevenue(options: UseAdminRevenueOptions = {}) {
  const {
    initialShops = [],
    initialOrders = [],
    defaultCommissionRate = 0.1,
  } = options;

  const [shops, setShops] = useState<MarketplaceShop[]>(initialShops);
  const [orders, setOrders] = useState<MarketplaceOrder[]>(initialOrders);
  const [commissionRate, setCommissionRate] = useState<number>(
    defaultCommissionRate,
  );

  useEffect(() => {
    setShops(initialShops);
  }, [initialShops]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const setCommissionPercent = useCallback((percent: number) => {
    const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
    setCommissionRate(clamped / 100);
  }, []);

  const toggleShopAvailability = useCallback((shopId: string) => {
    setShops((prev) =>
      prev.map((shop) =>
        shop.id === shopId ? { ...shop, isAvailable: !shop.isAvailable } : shop,
      ),
    );
  }, []);

  const adminSummary: AdminRevenueSummary = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled");

    const shopMap = new Map<string, ShopRevenueSummary>();

    for (const shop of shops) {
      shopMap.set(shop.id, {
        shopId: shop.id,
        shopName: shop.name,
        totalOrders: 0,
        completedOrders: 0,
        grossSalesKsh: 0,
        commissionDeductedKsh: 0,
        netRevenueKsh: 0,
      });
    }

    let grossMarketplaceVolumeKsh = 0;
    let totalPlatformCommissionKsh = 0;
    let totalShopPayoutsKsh = 0;

    for (const order of orders) {
      const existing = shopMap.get(order.shopId) ?? {
        shopId: order.shopId,
        shopName: order.shopName || order.shopId,
        totalOrders: 0,
        completedOrders: 0,
        grossSalesKsh: 0,
        commissionDeductedKsh: 0,
        netRevenueKsh: 0,
      };

      existing.totalOrders += 1;
      if (order.status === "completed") {
        existing.completedOrders += 1;
      }

      if (order.status !== "cancelled") {
        const rate =
          typeof order.commissionRate === "number" && order.commissionRate >= 0
            ? order.commissionRate
            : commissionRate;
        const gross = Number(order.grossAmountKsh) || 0;
        const commission =
          typeof order.commissionAmountKsh === "number"
            ? order.commissionAmountKsh
            : Math.round(gross * rate);
        const net =
          typeof order.netShopRevenueKsh === "number"
            ? order.netShopRevenueKsh
            : Math.max(0, gross - commission);

        existing.grossSalesKsh += gross;
        existing.commissionDeductedKsh += commission;
        existing.netRevenueKsh += net;

        grossMarketplaceVolumeKsh += gross;
        totalPlatformCommissionKsh += commission;
        totalShopPayoutsKsh += net;
      }

      shopMap.set(order.shopId, existing);
    }

    const byShop = Array.from(shopMap.values()).sort(
      (a, b) => b.grossSalesKsh - a.grossSalesKsh,
    );

    return {
      totalOrders: activeOrders.length,
      grossMarketplaceVolumeKsh,
      totalPlatformCommissionKsh,
      totalShopPayoutsKsh,
      byShop,
    };
  }, [commissionRate, orders, shops]);

  return {
    shops,
    orders,
    commissionRate,
    commissionPercent: Math.round(commissionRate * 1000) / 10,
    adminSummary,
    setCommissionPercent,
    toggleShopAvailability,
  };
}

export default useAdminRevenue;
