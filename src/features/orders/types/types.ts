import type { PayoutChannelType } from "../../shop-dashboard/types/payout.types";

export type PaymentPromptOutcome =
  | "pin_completed"
  | "user_cancelled_pin"
  | "wrong_pin_or_insufficient"
  | "timeout_no_pin";

export type GiftOrderStatus =
  | "Payment Pending"
  | "Payment Failed — PIN Not Completed"
  | "Order Received"
  | "To Be Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Not Received";

export interface GiftOrder {
  id: string;
  orderNumber: string;
  giftId: string;
  giftTitle: string;
  giftImageUrl: string;
  quantity: number;
  grossAmountKsh: number;
  commissionPercent: number;
  platformCommissionKsh: number;
  merchantNetAmountKsh: number;
  shopId: string;
  shopName: string;
  recipientDestination: string;
  payoutChannel: PayoutChannelType;
  paybillAccountNumber?: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  status: GiftOrderStatus;
  paymentOutcome: PaymentPromptOutcome;
  /** True only when payment succeeded and stock was deducted */
  isPaidAndConfirmed: boolean;
  /** Clear explanation shown to buyer or shop (especially on PIN failure) */
  customerUpdateMessage: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftOrderInput {
  giftId: string;
  giftTitle: string;
  giftImageUrl: string;
  quantity?: number;
  unitPriceKsh: number;
  commissionPercent: number;
  shopId: string;
  shopName: string;
  recipientDestination: string;
  payoutChannel: PayoutChannelType;
  paybillAccountNumber?: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  /** Simulated or gateway-reported M-Pesa PIN outcome */
  paymentOutcome: PaymentPromptOutcome;
  paymentReference?: string;
}

export interface UpdateOrderDeliveryInput {
  orderId: string;
  status: GiftOrderStatus;
  customerUpdateMessage?: string;
}

export interface ShopSalesSummary {
  shopId: string;
  shopName: string;
  totalOrders: number;
  failedPinOrders: number;
  activeDeliveryOrders: number;
  deliveredOrders: number;
  notReceivedOrders: number;
  grossSalesKsh: number;
  platformCommissionKsh: number;
  merchantEarningsKsh: number;
}

export interface AdminCommissionReport {
  totalGrossSalesKsh: number;
  totalCommissionEarnedKsh: number;
  totalMerchantNetPayoutsKsh: number;
  totalOrdersCount: number;
  failedPinCount: number;
  deliveredCount: number;
  pendingOrShippingCount: number;
  notReceivedCount: number;
  byShop: ShopSalesSummary[];
}
