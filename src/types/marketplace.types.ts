export type UserRole = "buyer" | "shop" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface MarketplaceShop {
  id: string;
  name: string;
  neighborhood: string;
  address?: string;
  phone: string;
  specialty: string;
  isAvailable: boolean;
  commissionRate: number; // e.g., 0.1 for 10% platform cut
}

export interface GiftProduct {
  id: string;
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
  inStock: boolean;
}

export interface SavedGiftItem {
  id: string;
  giftId?: string;
  shopId?: string;
  title: string;
  recipient?: string;
  occasion?: string;
  priceKsh: number;
  shopName: string;
  neighborhood: string;
  phone: string;
  notes?: string;
  savedAt: string;
}

export interface MarketplaceOrder {
  id: string;
  shopId: string;
  shopName: string;
  buyerName: string;
  buyerPhone: string;
  itemTitle: string;
  quantity: number;
  grossAmountKsh: number;
  commissionRate: number;
  commissionAmountKsh: number;
  netShopRevenueKsh: number;
  status: OrderStatus;
  deliveryNeighborhood?: string;
  createdAt: string;
}

export interface ShopRevenueSummary {
  shopId: string;
  shopName: string;
  totalOrders: number;
  completedOrders: number;
  grossSalesKsh: number;
  commissionDeductedKsh: number;
  netRevenueKsh: number;
}

export interface AdminRevenueSummary {
  totalOrders: number;
  grossMarketplaceVolumeKsh: number;
  totalPlatformCommissionKsh: number;
  totalShopPayoutsKsh: number;
  byShop: ShopRevenueSummary[];
}

export interface BlackSantaPinpointedShop {
  shopId: string;
  shopName: string;
  neighborhood: string;
  phone: string;
  reason: string;
}

export interface BlackSantaSuggestedGift {
  id: string;
  giftId?: string;
  shopId?: string;
  title: string;
  priceKsh: number;
  reason: string;
  shopName: string;
  neighborhood: string;
  shopPhone: string;
}

export interface BlackSantaChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  pinpointedShops?: BlackSantaPinpointedShop[];
  suggestedGifts?: BlackSantaSuggestedGift[];
  createdAt: string;
}
