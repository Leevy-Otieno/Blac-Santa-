import { inventoryService } from "../../inventory/services/inventory-service";
import type {
  AdminCommissionReport,
  CreateGiftOrderInput,
  GiftOrder,
  GiftOrderStatus,
  PaymentPromptOutcome,
  ShopSalesSummary,
  UpdateOrderDeliveryInput,
} from "../types/order.types";

const DEFAULT_STATUS_MESSAGES: Record<GiftOrderStatus, string> = {
  "Payment Pending":
    "M-Pesa prompt sent. Enter your M-Pesa PIN to complete this order.",
  "Payment Failed — PIN Not Completed":
    "Order not finished: M-Pesa PIN was not completed. Stock was not deducted.",
  "Order Received":
    "Payment confirmed. Order received by the shop and stock deducted.",
  "To Be Shipped": "Order packed and queued to be shipped.",
  "Out for Delivery": "Order is out for delivery.",
  Delivered: "Order marked as delivered.",
  "Not Received": "Order marked as not received.",
};

function getPinFailureExplanation(outcome: PaymentPromptOutcome): string {
  switch (outcome) {
    case "user_cancelled_pin":
      return "Order not finished: The M-Pesa PIN prompt was cancelled before payment completed.";
    case "wrong_pin_or_insufficient":
      return "Order not finished: M-Pesa PIN or balance check failed.";
    case "timeout_no_pin":
      return "Order not finished: M-Pesa PIN prompt timed out before completion.";
    case "pin_completed":
    default:
      return DEFAULT_STATUS_MESSAGES["Order Received"];
  }
}

let ordersStore: GiftOrder[] = [];

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+254${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) return `+254${digits}`;
  return raw.startsWith("+") ? raw.trim() : `+${digits}`;
}

export const orderService = {
  async listOrders(filter?: {
    shopId?: string;
    buyerPhone?: string;
  }): Promise<GiftOrder[]> {
    let rows = [...ordersStore];

    if (filter?.shopId) {
      rows = rows.filter((o) => o.shopId === filter.shopId);
    }

    if (filter?.buyerPhone) {
      const targetPhone = normalizePhone(filter.buyerPhone);
      rows = rows.filter((o) => normalizePhone(o.buyerPhone) === targetPhone);
    }

    return rows.map((r) => ({ ...r }));
  },

  async createOrder(input: CreateGiftOrderInput): Promise<{
    order: GiftOrder;
    paymentSucceeded: boolean;
    message: string;
  }> {
    const qty = Math.max(1, Math.round(input.quantity ?? 1));
    const grossAmountKsh = Math.max(0, Math.round(input.unitPriceKsh * qty));
    const commissionPercent = Math.max(
      0,
      Math.min(50, Number(input.commissionPercent) || 0),
    );
    const platformCommissionKsh = Math.round(
      (grossAmountKsh * commissionPercent) / 100,
    );
    const merchantNetAmountKsh = Math.max(
      0,
      grossAmountKsh - platformCommissionKsh,
    );

    const formattedBuyerPhone = normalizePhone(input.buyerPhone);
    const buyerDigits = formattedBuyerPhone.replace(/\D/g, "");
    if (buyerDigits.length !== 12 || !buyerDigits.startsWith("254")) {
      throw new Error("Enter a valid Kenyan mobile number (+2547...).");
    }
    if (!input.buyerName.trim()) {
      throw new Error("Enter buyer name.");
    }
    if (!input.deliveryAddress.trim()) {
      throw new Error("Enter delivery address.");
    }

    const invItem = await inventoryService.getItem(input.giftId);
    if (invItem && (!invItem.inStock || invItem.stockQuantity < qty)) {
      throw new Error(
        `Insufficient stock (${invItem.stockQuantity} available).`,
      );
    }

    const pinSucceeded = input.paymentOutcome === "pin_completed";
    const status: GiftOrderStatus = pinSucceeded
      ? "Order Received"
      : "Payment Failed — PIN Not Completed";

    const message = pinSucceeded
      ? DEFAULT_STATUS_MESSAGES["Order Received"]
      : getPinFailureExplanation(input.paymentOutcome);

    if (pinSucceeded && invItem) {
      await inventoryService.deductStockOnPaidOrder({
        giftId: input.giftId,
        quantityOrdered: qty,
      });
    }

    const now = new Date().toISOString();
    const seq = 1000 + ordersStore.length + 1;

    const order: GiftOrder = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      orderNumber: `BS-${seq}`,
      giftId: input.giftId,
      giftTitle: input.giftTitle,
      giftImageUrl: input.giftImageUrl,
      quantity: qty,
      grossAmountKsh,
      commissionPercent,
      platformCommissionKsh,
      merchantNetAmountKsh,
      shopId: input.shopId,
      shopName: input.shopName,
      recipientDestination: input.recipientDestination,
      payoutChannel: input.payoutChannel,
      paybillAccountNumber: input.paybillAccountNumber,
      buyerName: input.buyerName.trim(),
      buyerPhone: formattedBuyerPhone,
      deliveryAddress: input.deliveryAddress.trim(),
      deliveryNotes: input.deliveryNotes?.trim() || undefined,
      status,
      paymentOutcome: input.paymentOutcome,
      isPaidAndConfirmed: pinSucceeded,
      customerUpdateMessage: message,
      paymentReference: pinSucceeded
        ? (input.paymentReference ??
          `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)
        : undefined,
      createdAt: now,
      updatedAt: now,
    };

    ordersStore = [order, ...ordersStore];
    return {
      order: { ...order },
      paymentSucceeded: pinSucceeded,
      message,
    };
  },

  async retryMpesaPin(
    orderId: string,
    outcome: PaymentPromptOutcome,
  ): Promise<{
    order: GiftOrder;
    paymentSucceeded: boolean;
    message: string;
  }> {
    const existing = ordersStore.find((o) => o.id === orderId);
    if (!existing) {
      throw new Error("Order not found.");
    }

    const pinSucceeded = outcome === "pin_completed";
    if (pinSucceeded && !existing.isPaidAndConfirmed) {
      await inventoryService.deductStockOnPaidOrder({
        giftId: existing.giftId,
        quantityOrdered: existing.quantity,
      });
    }

    const nextStatus: GiftOrderStatus = pinSucceeded
      ? "Order Received"
      : "Payment Failed — PIN Not Completed";
    const message = pinSucceeded
      ? DEFAULT_STATUS_MESSAGES["Order Received"]
      : getPinFailureExplanation(outcome);

    const updated: GiftOrder = {
      ...existing,
      paymentOutcome: outcome,
      isPaidAndConfirmed: pinSucceeded || existing.isPaidAndConfirmed,
      status: pinSucceeded ? "Order Received" : nextStatus,
      customerUpdateMessage: message,
      paymentReference: pinSucceeded
        ? (existing.paymentReference ??
          `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)
        : undefined,
      updatedAt: new Date().toISOString(),
    };

    ordersStore = ordersStore.map((o) => (o.id === orderId ? updated : o));
    return {
      order: { ...updated },
      paymentSucceeded: pinSucceeded,
      message,
    };
  },

  async updateDeliveryStatus(
    input: UpdateOrderDeliveryInput,
  ): Promise<GiftOrder> {
    const existing = ordersStore.find((o) => o.id === input.orderId);
    if (!existing) {
      throw new Error("Order not found.");
    }

    if (
      !existing.isPaidAndConfirmed &&
      input.status !== "Payment Failed — PIN Not Completed"
    ) {
      throw new Error(
        "Order payment is not completed yet. Complete M-Pesa PIN first.",
      );
    }

    const message =
      input.customerUpdateMessage?.trim() ||
      DEFAULT_STATUS_MESSAGES[input.status];

    const updated: GiftOrder = {
      ...existing,
      status: input.status,
      customerUpdateMessage: message,
      updatedAt: new Date().toISOString(),
    };

    ordersStore = ordersStore.map((o) =>
      o.id === input.orderId ? updated : o,
    );
    return { ...updated };
  },

  computeShopSalesSummary(
    shopId: string,
    shopName: string,
    orders: readonly GiftOrder[],
  ): ShopSalesSummary {
    const shopOrders = orders.filter((o) => o.shopId === shopId);
    const confirmedOrders = shopOrders.filter((o) => o.isPaidAndConfirmed);
    const failedPinOrders = shopOrders.filter(
      (o) => !o.isPaidAndConfirmed,
    ).length;

    const activeDeliveryOrders = confirmedOrders.filter(
      (o) =>
        o.status === "Order Received" ||
        o.status === "To Be Shipped" ||
        o.status === "Out for Delivery" ||
        o.status === "Payment Pending",
    ).length;

    return {
      shopId,
      shopName,
      totalOrders: confirmedOrders.length,
      failedPinOrders,
      activeDeliveryOrders,
      deliveredOrders: confirmedOrders.filter((o) => o.status === "Delivered")
        .length,
      notReceivedOrders: confirmedOrders.filter(
        (o) => o.status === "Not Received",
      ).length,
      grossSalesKsh: confirmedOrders.reduce((s, o) => s + o.grossAmountKsh, 0),
      platformCommissionKsh: confirmedOrders.reduce(
        (s, o) => s + o.platformCommissionKsh,
        0,
      ),
      merchantEarningsKsh: confirmedOrders.reduce(
        (s, o) => s + o.merchantNetAmountKsh,
        0,
      ),
    };
  },

  computeAdminCommissionReport(
    orders: readonly GiftOrder[],
  ): AdminCommissionReport {
    const confirmed = orders.filter((o) => o.isPaidAndConfirmed);
    const shopMap = new Map<string, ShopSalesSummary>();

    for (const order of orders) {
      const current = shopMap.get(order.shopId) ?? {
        shopId: order.shopId,
        shopName: order.shopName,
        totalOrders: 0,
        failedPinOrders: 0,
        activeDeliveryOrders: 0,
        deliveredOrders: 0,
        notReceivedOrders: 0,
        grossSalesKsh: 0,
        platformCommissionKsh: 0,
        merchantEarningsKsh: 0,
      };

      if (!order.isPaidAndConfirmed) {
        current.failedPinOrders += 1;
      } else {
        current.totalOrders += 1;
        if (order.status === "Delivered") {
          current.deliveredOrders += 1;
        } else if (order.status === "Not Received") {
          current.notReceivedOrders += 1;
        } else {
          current.activeDeliveryOrders += 1;
        }
        current.grossSalesKsh += order.grossAmountKsh;
        current.platformCommissionKsh += order.platformCommissionKsh;
        current.merchantEarningsKsh += order.merchantNetAmountKsh;
      }

      shopMap.set(order.shopId, current);
    }

    return {
      totalGrossSalesKsh: confirmed.reduce((s, o) => s + o.grossAmountKsh, 0),
      totalCommissionEarnedKsh: confirmed.reduce(
        (s, o) => s + o.platformCommissionKsh,
        0,
      ),
      totalMerchantNetPayoutsKsh: confirmed.reduce(
        (s, o) => s + o.merchantNetAmountKsh,
        0,
      ),
      totalOrdersCount: confirmed.length,
      failedPinCount: orders.filter((o) => !o.isPaidAndConfirmed).length,
      deliveredCount: confirmed.filter((o) => o.status === "Delivered").length,
      pendingOrShippingCount: confirmed.filter(
        (o) =>
          o.status === "Order Received" ||
          o.status === "To Be Shipped" ||
          o.status === "Out for Delivery" ||
          o.status === "Payment Pending",
      ).length,
      notReceivedCount: confirmed.filter((o) => o.status === "Not Received")
        .length,
      byShop: Array.from(shopMap.values()).sort(
        (a, b) => b.grossSalesKsh - a.grossSalesKsh,
      ),
    };
  },
};
