import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GiftProduct,
  MarketplaceOrder,
  OrderStatus,
  ShopRevenueSummary,
} from "../types/marketplace.types";

export interface NewGiftListingInput {
  shopId: string;
  shopName: string;
  neighborhood: string;
  shopPhone: string;
  title: string;
  description?: string;
  category?: string;
  recipientTag?: string;
  occasionTag?: string;
  priceKsh: number;
  inStock?: boolean;
}

interface UseShopOperationsOptions {
  shopId?: string;
  shopName?: string;
  initialProducts?: GiftProduct[];
  initialOrders?: MarketplaceOrder[];
  defaultCommissionRate?: number;
}

export function useShopOperations(options: UseShopOperationsOptions = {}) {
  const {
    shopId = "",
    shopName = "",
    initialProducts = [],
    initialOrders = [],
    defaultCommissionRate = 0.1,
  } = options;

  const [products, setProducts] = useState<GiftProduct[]>(initialProducts);
  const [orders, setOrders] = useState<MarketplaceOrder[]>(initialOrders);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const addListing = useCallback(
    (input: NewGiftListingInput) => {
      const cleanTitle = input.title.trim();
      const price = Number(input.priceKsh);
      if (!cleanTitle || Number.isNaN(price) || price <= 0) {
        return null;
      }

      const created: GiftProduct = {
        id: `listing-${Date.now()}`,
        shopId: input.shopId || shopId || "shop-pending",
        shopName: input.shopName || shopName || "Shop",
        neighborhood: input.neighborhood.trim() || "Nairobi",
        shopPhone: input.shopPhone.trim(),
        title: cleanTitle,
        description: input.description?.trim() || undefined,
        category: input.category?.trim() || undefined,
        recipientTag: input.recipientTag?.trim() || undefined,
        occasionTag: input.occasionTag?.trim() || undefined,
        priceKsh: price,
        inStock: input.inStock ?? true,
      };

      setProducts((prev) => [created, ...prev]);
      return created;
    },
    [shopId, shopName],
  );

  const toggleProductStock = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, inStock: !item.inStock } : item,
      ),
    );
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, nextStatus: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          const rate =
            typeof order.commissionRate === "number" &&
            order.commissionRate >= 0
              ? order.commissionRate
              : defaultCommissionRate;
          const gross = Number(order.grossAmountKsh) || 0;
          const commissionAmountKsh = Math.round(gross * rate);
          const netShopRevenueKsh = Math.max(0, gross - commissionAmountKsh);

          return {
            ...order,
            status: nextStatus,
            commissionRate: rate,
            commissionAmountKsh,
            netShopRevenueKsh,
          };
        }),
      );
    },
    [defaultCommissionRate],
  );

  const revenueSummary: ShopRevenueSummary = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    const completed = orders.filter((o) => o.status === "completed");

    let grossSalesKsh = 0;
    let commissionDeductedKsh = 0;
    let netRevenueKsh = 0;

    for (const order of activeOrders) {
      const rate =
        typeof order.commissionRate === "number" && order.commissionRate >= 0
          ? order.commissionRate
          : defaultCommissionRate;
      const gross = Number(order.grossAmountKsh) || 0;
      const commission =
        typeof order.commissionAmountKsh === "number"
          ? order.commissionAmountKsh
          : Math.round(gross * rate);
      const net =
        typeof order.netShopRevenueKsh === "number"
          ? order.netShopRevenueKsh
          : Math.max(0, gross - commission);

      grossSalesKsh += gross;
      commissionDeductedKsh += commission;
      netRevenueKsh += net;
    }

    return {
      shopId: shopId || "shop",
      shopName: shopName || "Shop",
      totalOrders: orders.length,
      completedOrders: completed.length,
      grossSalesKsh,
      commissionDeductedKsh,
      netRevenueKsh,
    };
  }, [defaultCommissionRate, orders, shopId, shopName]);

  return {
    products,
    orders,
    revenueSummary,
    addListing,
    toggleProductStock,
    removeProduct,
    updateOrderStatus,
  };
}

export default useShopOperations;
