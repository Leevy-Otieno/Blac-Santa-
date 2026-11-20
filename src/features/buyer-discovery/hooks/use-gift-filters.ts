import { useCallback, useMemo, useState } from "react";
import type { BuyerCategoryId } from "../components/category-grid";
import type {
  BudgetRangePresetId,
  BuyerDiscoveryFilterState,
  GiftSortOption,
} from "../components/filter-drawer";
import type { GiftCardItem } from "../components/gift-card";

export interface UseGiftFiltersOptions {
  initialCategory?: BuyerCategoryId | null;
  initialOccasion?: string | null;
  initialBudgetPreset?: BudgetRangePresetId;
  initialMinKsh?: number;
  initialMaxKsh?: number | null;
  initialAgeGroup?: string | null;
  initialSortBy?: GiftSortOption;
  initialSearchQuery?: string;
}

export interface DiscoverableGift extends GiftCardItem {
  ageGroup?: string;
  popularityScore?: number;
  description?: string;
  whatsappPhone?: string;
  location?: string;
}

export interface UseGiftFiltersReturn {
  filters: BuyerDiscoveryFilterState;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setCategory: (category: BuyerCategoryId | null) => void;
  setOccasion: (occasion: string | null) => void;
  setBudgetPreset: (preset: BudgetRangePresetId) => void;
  setPriceBounds: (minKsh: number, maxKsh: number | null) => void;
  setAgeGroup: (ageGroup: string | null) => void;
  setSortBy: (sortBy: GiftSortOption) => void;
  applyFilters: (next: BuyerDiscoveryFilterState) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  activeFilterSummary: string;
  applyToGifts: <T extends DiscoverableGift>(gifts: readonly T[]) => T[];
}

const MIN_ALLOWED_KSH = 500;
const MAX_ALLOWED_KSH = 250000;

const DEFAULT_FILTERS: BuyerDiscoveryFilterState = {
  category: null,
  occasion: null,
  budgetPreset: "all",
  minKsh: MIN_ALLOWED_KSH,
  maxKsh: null,
  ageGroup: null,
  sortBy: "featured",
};

function getPresetBounds(preset: BudgetRangePresetId): {
  minKsh: number;
  maxKsh: number | null;
} {
  switch (preset) {
    case "under-2500":
      return { minKsh: 500, maxKsh: 2500 };
    case "2500-5000":
      return { minKsh: 2500, maxKsh: 5000 };
    case "5000-10000":
      return { minKsh: 5000, maxKsh: 10000 };
    case "10000-plus":
      return { minKsh: 10001, maxKsh: null };
    case "all":
    default:
      return { minKsh: MIN_ALLOWED_KSH, maxKsh: null };
  }
}

export function useGiftFilters(
  options: UseGiftFiltersOptions = {},
): UseGiftFiltersReturn {
  const initialPreset = options.initialBudgetPreset ?? "all";
  const presetBounds = getPresetBounds(initialPreset);

  const [filters, setFilters] = useState<BuyerDiscoveryFilterState>({
    category: options.initialCategory ?? null,
    occasion: options.initialOccasion ?? null,
    budgetPreset: initialPreset,
    minKsh:
      options.initialMinKsh !== undefined
        ? options.initialMinKsh
        : presetBounds.minKsh,
    maxKsh:
      options.initialMaxKsh !== undefined
        ? options.initialMaxKsh
        : presetBounds.maxKsh,
    ageGroup: options.initialAgeGroup ?? null,
    sortBy: options.initialSortBy ?? "featured",
  });

  const [searchQuery, setSearchQuery] = useState(
    options.initialSearchQuery ?? "",
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const setCategory = useCallback((category: BuyerCategoryId | null) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setOccasion = useCallback((occasion: string | null) => {
    setFilters((prev) => ({ ...prev, occasion }));
  }, []);

  const setBudgetPreset = useCallback((budgetPreset: BudgetRangePresetId) => {
    const bounds = getPresetBounds(budgetPreset);
    setFilters((prev) => ({
      ...prev,
      budgetPreset,
      minKsh: bounds.minKsh,
      maxKsh: bounds.maxKsh,
    }));
  }, []);

  const setPriceBounds = useCallback(
    (rawMin: number, rawMax: number | null) => {
      const clampedMin = Math.max(
        MIN_ALLOWED_KSH,
        Math.min(MAX_ALLOWED_KSH, Math.round(rawMin || MIN_ALLOWED_KSH)),
      );
      const clampedMax =
        rawMax === null
          ? null
          : Math.max(clampedMin, Math.min(MAX_ALLOWED_KSH, Math.round(rawMax)));
      setFilters((prev) => ({
        ...prev,
        budgetPreset: "all",
        minKsh: clampedMin,
        maxKsh: clampedMax,
      }));
    },
    [],
  );

  const setAgeGroup = useCallback((ageGroup: string | null) => {
    setFilters((prev) => ({
      ...prev,
      ageGroup: ageGroup === "All Ages" ? null : ageGroup,
    }));
  }, []);

  const setSortBy = useCallback((sortBy: GiftSortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const applyFilters = useCallback((next: BuyerDiscoveryFilterState) => {
    const minKsh = Math.max(
      MIN_ALLOWED_KSH,
      Math.min(MAX_ALLOWED_KSH, Math.round(next.minKsh || MIN_ALLOWED_KSH)),
    );
    const maxKsh =
      next.maxKsh === null
        ? null
        : Math.max(minKsh, Math.min(MAX_ALLOWED_KSH, Math.round(next.maxKsh)));
    setFilters({
      ...next,
      minKsh,
      maxKsh,
      ageGroup: next.ageGroup === "All Ages" ? null : next.ageGroup,
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearchQuery("");
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count += 1;
    if (filters.occasion) count += 1;
    if (filters.ageGroup) count += 1;
    if (
      filters.budgetPreset !== "all" ||
      filters.minKsh > MIN_ALLOWED_KSH ||
      filters.maxKsh !== null
    ) {
      count += 1;
    }
    if (filters.sortBy !== "featured") count += 1;
    return count;
  }, [filters]);

  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.category) parts.push(filters.category);
    if (filters.occasion) parts.push(filters.occasion);
    if (filters.ageGroup) parts.push(`Age ${filters.ageGroup}`);
    if (filters.budgetPreset === "10000-plus") {
      parts.push("Above Ksh 10,000");
    } else if (filters.minKsh > MIN_ALLOWED_KSH || filters.maxKsh !== null) {
      const upperLabel =
        filters.maxKsh === null
          ? "Any"
          : `Ksh ${filters.maxKsh.toLocaleString("en-KE")}`;
      parts.push(`Ksh ${filters.minKsh.toLocaleString("en-KE")}–${upperLabel}`);
    }
    if (searchQuery.trim()) {
      parts.push(`"${searchQuery.trim()}"`);
    }
    return parts.join(" • ");
  }, [filters, searchQuery]);

  const applyToGifts = useCallback(
    <T extends DiscoverableGift>(gifts: readonly T[]): T[] => {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      const matched = gifts.filter((gift) => {
        const matchesCategory =
          !filters.category ||
          gift.category.toLowerCase() === filters.category.toLowerCase();

        const matchesOccasion =
          !filters.occasion ||
          gift.occasion.toLowerCase() === filters.occasion.toLowerCase();

        const matchesMin = gift.priceKsh >= filters.minKsh;
        const matchesMax =
          filters.maxKsh === null || gift.priceKsh <= filters.maxKsh;
        const matchesBudget = matchesMin && matchesMax;

        const matchesAge =
          !filters.ageGroup ||
          !gift.ageGroup ||
          gift.ageGroup === filters.ageGroup;

        const matchesQuery =
          !normalizedQuery ||
          gift.title.toLowerCase().includes(normalizedQuery) ||
          gift.shopName.toLowerCase().includes(normalizedQuery) ||
          gift.category.toLowerCase().includes(normalizedQuery) ||
          gift.occasion.toLowerCase().includes(normalizedQuery) ||
          (gift.description ?? "").toLowerCase().includes(normalizedQuery) ||
          (gift.location ?? "").toLowerCase().includes(normalizedQuery);

        return (
          matchesCategory &&
          matchesOccasion &&
          matchesBudget &&
          matchesAge &&
          matchesQuery
        );
      });

      const sorted = [...matched];
      if (filters.sortBy === "price-asc") {
        sorted.sort((a, b) => a.priceKsh - b.priceKsh);
      } else if (filters.sortBy === "price-desc") {
        sorted.sort((a, b) => b.priceKsh - a.priceKsh);
      } else if (filters.sortBy === "popular") {
        sorted.sort(
          (a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0),
        );
      } else {
        sorted.sort(
          (a, b) =>
            Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)),
        );
      }

      return sorted;
    },
    [filters, searchQuery],
  );

  return {
    filters,
    searchQuery,
    setSearchQuery,
    clearSearch,
    setCategory,
    setOccasion,
    setBudgetPreset,
    setPriceBounds,
    setAgeGroup,
    setSortBy,
    applyFilters,
    resetFilters,
    activeFilterCount,
    activeFilterSummary,
    applyToGifts,
  };
}
