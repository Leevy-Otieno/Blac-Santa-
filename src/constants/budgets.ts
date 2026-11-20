export type BudgetTierId =
  | "all"
  | "under-2500"
  | "2500-5000"
  | "5000-10000"
  | "10000-plus";

export interface BudgetTier {
  id: BudgetTierId;
  label: string;
  shortLabel: string;
  minKsh: number;
  maxKsh: number | null; // null means no upper cap (e.g. Ksh 10,000+)
  description: string;
}

export const PLATFORM_GIFT_BUDGET = {
  currency: "Ksh" as const,
  minKsh: 500,
  standardMaxKsh: 10000,
  maxAllowedKsh: 250000,
  stepKsh: 250,
};

export const BUDGET_TIERS: readonly BudgetTier[] = [
  {
    id: "all",
    label: "All Budgets (Ksh 500+)",
    shortLabel: "All Budgets",
    minKsh: 500,
    maxKsh: null,
    description: "Browse every gift across all price tiers.",
  },
  {
    id: "under-2500",
    label: "Ksh 500 – 2,500",
    shortLabel: "Under 2.5k",
    minKsh: 500,
    maxKsh: 2500,
    description: "Thoughtful everyday picks, keepsakes & small treats.",
  },
  {
    id: "2500-5000",
    label: "Ksh 2,500 – 5,000",
    shortLabel: "2.5k – 5k",
    minKsh: 2500,
    maxKsh: 5000,
    description: "Popular mid-range gifts for birthdays, dates & celebrations.",
  },
  {
    id: "5000-10000",
    label: "Ksh 5,000 – 10,000",
    shortLabel: "5k – 10k",
    minKsh: 5000,
    maxKsh: 10000,
    description: "Premium hampers, fragrance sets & executive picks.",
  },
  {
    id: "10000-plus",
    label: "Above Ksh 10,000",
    shortLabel: "Ksh 10k+",
    minKsh: 10001,
    maxKsh: null,
    description: "Luxury hampers, statement gifts & high-value bundles.",
  },
] as const;

export function formatKsh(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `Ksh ${safe.toLocaleString("en-KE")}`;
}

export function isWithinAllowedGiftPrice(amountKsh: number): boolean {
  return (
    Number.isFinite(amountKsh) &&
    amountKsh >= PLATFORM_GIFT_BUDGET.minKsh &&
    amountKsh <= PLATFORM_GIFT_BUDGET.maxAllowedKsh
  );
}

export function getBudgetTierById(id?: string | null): BudgetTier {
  return BUDGET_TIERS.find((tier) => tier.id === id) ?? BUDGET_TIERS[0];
}
