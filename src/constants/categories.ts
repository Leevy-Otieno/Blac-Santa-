import type { Ionicons } from "@expo/vector-icons";

export type RecipientCategory = "For Him" | "For Her" | "Kids" | "Boss";
export type GiftOccasion = "Valentine's Day" | "Birthdays" | "Christmas";
export type RecipientAgeGroup = "All Ages" | "6–12" | "18–24" | "25–34" | "35+";

export interface RecipientCategoryMeta {
  id: RecipientCategory;
  label: RecipientCategory;
  icon: keyof typeof Ionicons.glyphMap;
  tagline: string;
  suggestedAgeGroups: readonly Exclude<RecipientAgeGroup, "All Ages">[];
}

export interface GiftOccasionMeta {
  id: GiftOccasion;
  label: GiftOccasion;
  icon: keyof typeof Ionicons.glyphMap;
  badgeText: string;
  description: string;
}

export const RECIPIENT_CATEGORIES: readonly RecipientCategoryMeta[] = [
  {
    id: "For Her",
    label: "For Her",
    icon: "woman-outline",
    tagline: "Candles, rose hampers, fragrances & keepsakes",
    suggestedAgeGroups: ["18–24", "25–34", "35+"],
  },
  {
    id: "For Him",
    label: "For Him",
    icon: "man-outline",
    tagline: "Leather goods, grooming sets & smart accessories",
    suggestedAgeGroups: ["18–24", "25–34", "35+"],
  },
  {
    id: "Kids",
    label: "Kids",
    icon: "balloon-outline",
    tagline: "STEM toys, creative kits & playful bundles",
    suggestedAgeGroups: ["6–12"],
  },
  {
    id: "Boss",
    label: "Boss",
    icon: "briefcase-outline",
    tagline: "Desk organizers, flasks & refined appreciation gifts",
    suggestedAgeGroups: ["25–34", "35+"],
  },
] as const;

export const GIFT_OCCASIONS: readonly GiftOccasionMeta[] = [
  {
    id: "Valentine's Day",
    label: "Valentine's Day",
    icon: "heart-outline",
    badgeText: "Romantic Edit",
    description: "Crimson wraps, florals, sweet treats & date-night hampers.",
  },
  {
    id: "Birthdays",
    label: "Birthdays",
    icon: "gift-outline",
    badgeText: "Celebrate",
    description: "Personal notes, same-day Nairobi options & crowd-pleasers.",
  },
  {
    id: "Christmas",
    label: "Christmas",
    icon: "sparkles-outline",
    badgeText: "Festive Season",
    description: "Holiday gift boxes, family treats & year-end appreciation.",
  },
] as const;

export const AGE_GROUPS: readonly RecipientAgeGroup[] = [
  "All Ages",
  "6–12",
  "18–24",
  "25–34",
  "35+",
] as const;

export const NAIROBI_DISPATCH_ZONES: readonly string[] = [
  "Westlands",
  "Kilimani",
  "CBD",
  "Karen",
  "Lavington",
  "Kileleshwa",
] as const;
