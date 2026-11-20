import { useCallback, useEffect, useMemo, useState } from "react";
import { inventoryService } from "../../inventory/services/inventory-service";
import type { InventoryGiftItem } from "../../inventory/types/inventory.types";
import { orderService } from "../services/order-service";
import type {
  AdminCommissionReport,
  CreateGiftOrderInput,
  GiftOrder,
  GiftOrderStatus,
  PaymentPromptOutcome,
  ShopSalesSummary,
} from "../types/order.types";

export interface UseGiftOrdersOptions {
  shopId?: string;
  shopName?: string;
  buyerPhone?: string;
}

export interface UseGiftOrdersReturn {
  orders: GiftOrder[];
  inventory: InventoryGiftItem[];
  loading: boolean;
  mutating: boolean;
  error: string | null;
  lastPaymentFeedback: {
    succeeded: boolean;
    message: string;
    orderNumber: string;
  } | null;
  clearError: () => void;
  clearPaymentFeedback: () => void;
  refreshAll: () => Promise<void>;
  registerInventoryItem: (
    item: Omit<InventoryGiftItem, "createdAt" | "updatedAt">,
  ) => Promise<InventoryGiftItem | null>;
  placeOrder: (input: CreateGiftOrderInput) => Promise<GiftOrder | null>;
  retryMpesaPin: (
    orderId: string,
    outcome: PaymentPromptOutcome,
  ) => Promise<GiftOrder | null>;
  setOrderDeliveryStatus: (
    orderId: string,
    status: GiftOrderStatus,
    customerUpdateMessage?: string,
  ) => Promise<GiftOrder | null>;
  addProductStock: (giftId: string, quantityToAdd: number) => Promise<void>;
  setProductStockQuantity: (
    giftId: string,
    stockQuantity: number,
  ) => Promise<void>;
  shopSummary: ShopSalesSummary | null;
  adminReport: AdminCommissionReport;
}

export function useGiftOrders(
  options: UseGiftOrdersOptions = {},
): UseGiftOrdersReturn {
  const { shopId, shopName = "", buyerPhone } = options;

  const [orders, setOrders] = useState<GiftOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryGiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPaymentFeedback, setLastPaymentFeedback] = useState<{
    succeeded: boolean;
    message: string;
    orderNumber: string;
  } | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [orderRows, stockRows] = await Promise.all([
        orderService.listOrders({ shopId, buyerPhone }),
        inventoryService.listInventory(shopId),
      ]);
      setOrders(orderRows);
      setInventory(stockRows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load orders and stock.",
      );
    } finally {
      setLoading(false);
    }
  }, [shopId, buyerPhone]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const clearError = useCallback(() => setError(null), []);
  const clearPaymentFeedback = useCallback(
    () => setLastPaymentFeedback(null),
    [],
  );

  const registerInventoryItem = useCallback(
    async (
      item: Omit<InventoryGiftItem, "createdAt" | "updatedAt">,
    ): Promise<InventoryGiftItem | null> => {
      try {
        setError(null);
        setMutating(true);
        const saved = await inventoryService.upsertGiftItem(item);
        const refreshed = await inventoryService.listInventory(shopId);
        setInventory(refreshed);
        return saved;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save inventory item.",
        );
        return null;
      } finally {
        setMutating(false);
      }
    },
    [shopId],
  );

  const placeOrder = useCallback(
    async (input: CreateGiftOrderInput): Promise<GiftOrder | null> => {
      try {
        setError(null);
        setMutating(true);
        const result = await orderService.createOrder(input);
        setOrders((prev) => [result.order, ...prev]);

        const refreshedStock = await inventoryService.listInventory(shopId);
        setInventory(refreshedStock);

        setLastPaymentFeedback({
          succeeded: result.paymentSucceeded,
          message: result.message,
          orderNumber: result.order.orderNumber,
        });

        return result.order;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not submit order.",
        );
        return null;
      } finally {
        setMutating(false);
      }
    },
    [shopId],
  );

  const retryMpesaPin = useCallback(
    async (
      orderId: string,
      outcome: PaymentPromptOutcome,
    ): Promise<GiftOrder | null> => {
      try {
        setError(null);
        setMutating(true);
        const result = await orderService.retryMpesaPin(orderId, outcome);
        setOrders((prev) =>
          prev.map((item) => (item.id === orderId ? result.order : item)),
        );

        const refreshedStock = await inventoryService.listInventory(shopId);
        setInventory(refreshedStock);

        setLastPaymentFeedback({
          succeeded: result.paymentSucceeded,
          message: result.message,
          orderNumber: result.order.orderNumber,
        });

        return result.order;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to retry M-Pesa PIN.",
        );
        return null;
      } finally {
        setMutating(false);
      }
    },
    [shopId],
  );

  const setOrderDeliveryStatus = useCallback(
    async (
      orderId: string,
      status: GiftOrderStatus,
      customerUpdateMessage?: string,
    ): Promise<GiftOrder | null> => {
      try {
        setError(null);
        setMutating(true);
        const updated = await orderService.updateDeliveryStatus({
          orderId,
          status,
          customerUpdateMessage,
        });
        setOrders((prev) =>
          prev.map((item) => (item.id === orderId ? updated : item)),
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update delivery status.",
        );
        return null;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const addProductStock = useCallback(
    async (giftId: string, quantityToAdd: number): Promise<void> => {
      try {
        setError(null);
        setMutating(true);
        const updated = await inventoryService.addStock({
          giftId,
          quantityToAdd,
        });
        setInventory((prev) =>
          prev.map((item) => (item.id === giftId ? updated : item)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add stock.");
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const setProductStockQuantity = useCallback(
    async (giftId: string, stockQuantity: number): Promise<void> => {
      try {
        setError(null);
        setMutating(true);
        const updated = await inventoryService.setStockQuantity({
          giftId,
          stockQuantity,
        });
        setInventory((prev) =>
          prev.map((item) => (item.id === giftId ? updated : item)),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update stock.",
        );
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const shopSummary = useMemo(() => {
    if (!shopId) return null;
    return orderService.computeShopSalesSummary(shopId, shopName, orders);
  }, [shopId, shopName, orders]);

  const adminReport = useMemo(
    () => orderService.computeAdminCommissionReport(orders),
    [orders],
  );

  return {
    orders,
    inventory,
    loading,
    mutating,
    error,
    lastPaymentFeedback,
    clearError,
    clearPaymentFeedback,
    refreshAll: loadAll,
    registerInventoryItem,
    placeOrder,
    retryMpesaPin,
    setOrderDeliveryStatus,
    addProductStock,
    setProductStockQuantity,
    shopSummary,
    adminReport,
  };
}
