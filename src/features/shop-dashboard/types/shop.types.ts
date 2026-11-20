import type {
  ShopGiftAgeGroup,
  ShopGiftCategory,
  ShopGiftFormValues,
  ShopGiftOccasion,
} from "../components/gift-form";
import type { ShopStatsMetrics } from "../components/shop-stats-bar";

export type {
  ShopGiftAgeGroup,
  ShopGiftCategory,
  ShopGiftFormValues,
  ShopGiftOccasion,
  ShopStatsMetrics,
};

export type MerchantShopStatus = "Active" | "Pending" | "Suspended";

export interface ShopProfile {
  id: string;
  shopName: string;
  ownerName: string;
  whatsappPhone: string;
  location: string;
  categoryFocus: string;
  status: MerchantShopStatus;
  totalWhatsappClicks: number;
}

export interface ShopGiftListing extends ShopGiftFormValues {
  id: string;
  shopId: string;
  shopName: string;
  whatsappClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShopGiftInput {
  shopId: string;
  title: string;
  priceKsh: number;
  originalPriceKsh?: number;
  category: ShopGiftCategory;
  occasion: ShopGiftOccasion;
  ageGroup: ShopGiftAgeGroup;
  description: string;
  imageUrl: string;
  sameDayNairobi: boolean;
  inStock: boolean;
}

export interface UpdateShopGiftInput extends Partial<CreateShopGiftInput> {
  id: string;
}
