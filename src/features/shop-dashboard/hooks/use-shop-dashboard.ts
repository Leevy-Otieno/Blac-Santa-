import { useCallback, useMemo } from "react";
import { useGiftOrders } from "../../orders/hooks/use-gift-orders";
import type {
  GiftOrderStatus,
  PaymentPromptOutcome,
} from "../../orders/types/order.types";
import type { ShopGiftFormValues } from "../components/gift-form";
import type { SaveMerchantPayoutInput } from "../types/payout.types";
import { useMerchantPayout } from "./use-merchant-payout";
import { useShopGifts } from "./use-shop-gifts";

export interface UseShopDashboardOptions {
  shopId: string;
  shopName?: string;
}

export function useShopDashboard({
  shopId,
  shopName = "",
}: UseShopDashboardOptions) {
  const giftsHook = useShopGifts(shopId);
  const payoutHook = useMerchantPayout(shopId);
  const ordersHook = useGiftOrders({
    shopId,
    shopName: giftsHook.profile?.shopName || shopName,
  });

  const createGiftWithInventory = useCallback(
    async (
      values: ShopGiftFormValues,
      options?: { stockQuantity?: number; lowStockThreshold?: number },
    ) => {
      const created = await giftsHook.createGift(values);
      if (!created) return null;

      const stockQuantity = Math.max(
        0,
        Math.round(options?.stockQuantity ?? (values.inStock ? 1 : 0)),
      );
      const lowStockThreshold = Math.max(
        0,
        Math.round(options?.lowStockThreshold ?? 2),
      );

      await ordersHook.registerInventoryItem({
        id: created.id,
        shopId: created.shopId,
        shopName: created.shopName,
        title: created.title,
        priceKsh: created.priceKsh,
        originalPriceKsh: created.originalPriceKsh,
        category: created.category,
        occasion: created.occasion,
        ageGroup: created.ageGroup,
        description: created.description,
        imageUrl: created.imageUrl,
        sameDayNairobi: created.sameDayNairobi,
        stockQuantity,
        lowStockThreshold,
        inStock: stockQuantity > 0,
        whatsappClicks: created.whatsappClicks,
      });

      return created;
    },
    [giftsHook, ordersHook],
  );

  const savePayout = useCallback(
    async (input: Omit<SaveMerchantPayoutInput, "shopId">) =>
      payoutHook.savePayoutSettings(input),
    [payoutHook],
  );

  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      status: GiftOrderStatus,
      customerUpdateMessage?: string,
    ) =>
      ordersHook.setOrderDeliveryStatus(orderId, status, customerUpdateMessage),
    [ordersHook],
  );

  const retryPaymentPin = useCallback(
    async (orderId: string, outcome: PaymentPromptOutcome) =>
      ordersHook.retryMpesaPin(orderId, outcome),
    [ordersHook],
  );

  const combinedError = useMemo(
    () => giftsHook.error || payoutHook.error || ordersHook.error || null,
    [giftsHook.error, payoutHook.error, ordersHook.error],
  );

  const clearAllErrors = useCallback(() => {
    giftsHook.clearError();
    payoutHook.clearError();
    ordersHook.clearError();
  }, [giftsHook, payoutHook, ordersHook]);

  return {
    shopId,
    profile: giftsHook.profile,
    gifts: giftsHook.gifts,
    filteredGifts: giftsHook.filteredGifts,
    stats: giftsHook.stats,
    searchQuery: giftsHook.searchQuery,
    setSearchQuery: giftsHook.setSearchQuery,
    stockFilter: giftsHook.stockFilter,
    setStockFilter: giftsHook.setStockFilter,
    createGiftWithInventory,
    updateGift: giftsHook.updateGift,
    toggleStock: giftsHook.toggleStock,
    deleteGift: giftsHook.deleteGift,
    payoutSettings: payoutHook.settings,
    payoutSaving: payoutHook.saving,
    savePayout,
    setCommissionRate: payoutHook.setCommissionRate,
    previewGiftSplit: payoutHook.previewGiftSplit,
    inventory: ordersHook.inventory,
    addProductStock: ordersHook.addProductStock,
    setProductStockQuantity: ordersHook.setProductStockQuantity,
    orders: ordersHook.orders,
    shopSummary: ordersHook.shopSummary,
    adminReport: ordersHook.adminReport,
    updateOrderStatus,
    retryPaymentPin,
    loading: giftsHook.loading || payoutHook.loading || ordersHook.loading,
    mutating: giftsHook.mutating || payoutHook.saving || ordersHook.mutating,
    error: combinedError,
    clearAllErrors,
  };
}
