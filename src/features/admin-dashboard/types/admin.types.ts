export type AdminShopStatus = "Active" | "Pending" | "Suspended";

export type PlatformUserRole = "buyer" | "shop" | "admin";

export interface AdminShop {
  id: string;
  shopName: string;
  ownerName: string;
  ownerEmail: string;
  whatsappPhone: string;
  location: string;
  categoryFocus: string;
  status: AdminShopStatus;
  giftCount: number;
  whatsappClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardShopInput {
  shopName: string;
  ownerName: string;
  ownerEmail?: string;
  whatsappPhone: string;
  location: string;
  categoryFocus?: string;
  activateImmediately?: boolean;
}

export interface AdminPlatformUser {
  id: string;
  name: string;
  contact: string;
  role: PlatformUserRole;
  active: boolean;
  assignedShopId?: string;
  lastActiveAt: string;
}

export interface AdminTaxonomyCatalog {
  categories: string[];
  occasions: string[];
}

export interface AdminMarketplaceMetrics {
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  suspendedShops: number;
  totalGifts: number;
  totalWhatsappClicks: number;
  budgetMinKsh: number;
  budgetMaxKsh: number;
}
