import type { BuyerCategoryId } from "../components/category-grid";
import type {
  BudgetRangePresetId,
  BuyerDiscoveryFilterState,
  GiftSortOption,
} from "../components/filter-drawer";
import type { GiftCardItem } from "../components/gift-card";

export type {
  BuyerCategoryId,
  BudgetRangePresetId,
  BuyerDiscoveryFilterState,
  GiftSortOption,
  GiftCardItem,
};

export type GiftOccasionId = "Valentine's Day" | "Birthdays" | "Christmas";

export type GiftAgeGroupId = "All Ages" | "6–12" | "18–24" | "25–34" | "35+";

export interface GiftItem extends GiftCardItem {
  description: string;
  ageGroup: Exclude<GiftAgeGroupId, "All Ages">;
  shopPhone: string;
  shopLocation: string;
  popularityScore: number;
  inStock: boolean;
  tags: string[];
  createdAt: string;
}

export interface GiftQueryParams {
  searchQuery?: string;
  category?: BuyerCategoryId | null;
  occasion?: string | null;
  budgetPreset?: BudgetRangePresetId;
  minKsh?: number;
  maxKsh?: number;
  ageGroup?: string | null;
  sameDayOnly?: boolean;
  sortBy?: GiftSortOption;
}

export interface GiftQueryResult {
  items: GiftItem[];
  totalCount: number;
  featuredCount: number;
  sameDayCount: number;
  priceRangeKsh: {
    min: number;
    max: number;
  };
}

export interface GiftAdvisorMatchInput {
  recipient: BuyerCategoryId;
  occasion: GiftOccasionId;
  budgetPreset: BudgetRangePresetId;
}
