import type {
  BudgetRangePresetId,
  GiftAdvisorMatchInput,
  GiftItem,
  GiftQueryParams,
  GiftQueryResult,
} from "../types/gift.types";

const MIN_ALLOWED_KSH = 500;
const MAX_ALLOWED_KSH = 250000;

const SEED_GIFTS: GiftItem[] = [
  {
    id: "gift-velvet-candle-box",
    title: "Crimson Rose & Vanilla Soy Candle Hamper",
    priceKsh: 2800,
    originalPriceKsh: 3400,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    shopPhone: "+254723456789",
    shopLocation: "Westlands, Nairobi",
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "25–34",
    popularityScore: 148,
    isFeatured: true,
    sameDayNairobi: true,
    inStock: true,
    tags: ["valentine", "candles", "roses", "hamper", "nairobi"],
    description:
      "Hand-poured coconut-soy candle paired with preserved crimson roses and artisanal truffles.",
    imageUrl:
      "https://images.unsplash.com/photo-1603006905393-c8849bb012c0?auto=format&fit=crop&w=900&q=85",
    createdAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "gift-leather-folio",
    title: "Hand-Stitched Leather Wallet & Key Keeper",
    priceKsh: 3600,
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    shopPhone: "+254712345678",
    shopLocation: "Kilimani, Nairobi",
    category: "For Him",
    occasion: "Birthdays",
    ageGroup: "25–34",
    popularityScore: 121,
    isFeatured: true,
    sameDayNairobi: true,
    inStock: true,
    tags: ["leather", "wallet", "birthday", "mens", "kilimani"],
    description:
      "Full-grain Kenyan leather bifold wallet with matching brass key loop in gift box.",
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    createdAt: "2026-10-04T10:15:00.000Z",
  },
  {
    id: "gift-stem-building-kit",
    title: "Junior Solar & Gear STEM Discovery Kit",
    priceKsh: 1850,
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    shopPhone: "+254712345678",
    shopLocation: "Kilimani, Nairobi",
    category: "Kids",
    occasion: "Birthdays",
    ageGroup: "6–12",
    popularityScore: 94,
    isFeatured: false,
    sameDayNairobi: true,
    inStock: true,
    tags: ["kids", "stem", "learning", "birthday", "puzzle"],
    description:
      "Hands-on mechanical engineering puzzle kit designed for curious young builders.",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=85",
    createdAt: "2026-10-09T12:30:00.000Z",
  },
  {
    id: "gift-executive-flask-set",
    title: "Matte Crimson Thermal Flask & Desk Set",
    priceKsh: 5400,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    shopPhone: "+254723456789",
    shopLocation: "Westlands, Nairobi",
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    popularityScore: 112,
    isFeatured: true,
    sameDayNairobi: false,
    inStock: true,
    tags: ["boss", "executive", "flask", "christmas", "office"],
    description:
      "Double-wall insulated flask with leather coaster and structured keepsake presentation.",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    createdAt: "2026-10-14T15:00:00.000Z",
  },
  {
    id: "gift-festive-treat-hamper",
    title: "Holiday Cocoa, Shortbread & Gift Card Edit",
    priceKsh: 4200,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    shopPhone: "+254723456789",
    shopLocation: "Westlands, Nairobi",
    category: "For Her",
    occasion: "Christmas",
    ageGroup: "18–24",
    popularityScore: 87,
    isFeatured: false,
    sameDayNairobi: true,
    inStock: true,
    tags: ["christmas", "cocoa", "shortbread", "hamper", "festive"],
    description:
      "Festive keepsake crate stocked with spiced cocoa, gourmet biscuits, and ribbon finish.",
    imageUrl:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85",
    createdAt: "2026-10-18T17:20:00.000Z",
  },
  {
    id: "gift-velvet-bouquet-box",
    title: "Signature Rose & Chocolates Keepsake Box",
    priceKsh: 2200,
    shopId: "shop-velvet-bloom",
    shopName: "Velvet Bloom Florals & Gifts",
    shopPhone: "+254798112233",
    shopLocation: "CBD / Moi Ave, Nairobi",
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "18–24",
    popularityScore: 103,
    isFeatured: true,
    sameDayNairobi: true,
    inStock: true,
    tags: ["roses", "chocolates", "valentine", "cbd", "bouquet"],
    description:
      "Curated floral and chocolate keepsake box ready for same-day Nairobi courier dispatch.",
    imageUrl:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85",
    createdAt: "2026-10-22T09:10:00.000Z",
  },
  {
    id: "gift-royal-executive-hamper",
    title: "Grand Crimson Executive & Celebration Hamper",
    priceKsh: 14500,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    shopPhone: "+254723456789",
    shopLocation: "Westlands, Nairobi",
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    popularityScore: 134,
    isFeatured: true,
    sameDayNairobi: true,
    inStock: true,
    tags: ["10000-plus", "luxury", "executive", "hamper", "corporate", "boss"],
    description:
      "High-tier celebration hamper featuring artisanal sweets, keepsake decanter, and custom note.",
    imageUrl:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85",
    createdAt: "2026-10-28T11:00:00.000Z",
  },
];

let giftsCatalog: GiftItem[] = SEED_GIFTS.map((g) => ({ ...g }));

function delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveBudgetPresetRange(preset: BudgetRangePresetId): {
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

function normalizeQueryParams(params: GiftQueryParams) {
  const presetBounds = resolveBudgetPresetRange(params.budgetPreset ?? "all");
  const rawMin = params.minKsh ?? presetBounds.minKsh;
  const rawMax =
    params.maxKsh !== undefined ? params.maxKsh : presetBounds.maxKsh;

  const minKsh = Math.max(
    MIN_ALLOWED_KSH,
    Math.min(MAX_ALLOWED_KSH, Math.round(rawMin)),
  );
  const maxKsh =
    rawMax === null
      ? null
      : Math.max(minKsh, Math.min(MAX_ALLOWED_KSH, Math.round(rawMax)));

  return {
    searchQuery: (params.searchQuery ?? "").trim().toLowerCase(),
    category: params.category ?? null,
    occasion: params.occasion ?? null,
    minKsh,
    maxKsh,
    ageGroup:
      params.ageGroup && params.ageGroup !== "All Ages"
        ? params.ageGroup
        : null,
    sameDayOnly: Boolean(params.sameDayOnly),
    sortBy: params.sortBy ?? "featured",
  };
}

export const giftQueryService = {
  async queryGifts(params: GiftQueryParams = {}): Promise<GiftQueryResult> {
    await delay(160);
    const norm = normalizeQueryParams(params);

    const matched = giftsCatalog.filter((gift) => {
      if (!gift.inStock) return false;

      if (
        norm.category &&
        gift.category.toLowerCase() !== norm.category.toLowerCase()
      ) {
        return false;
      }

      if (
        norm.occasion &&
        gift.occasion.toLowerCase() !== norm.occasion.toLowerCase()
      ) {
        return false;
      }

      if (gift.priceKsh < norm.minKsh) {
        return false;
      }

      if (norm.maxKsh !== null && gift.priceKsh > norm.maxKsh) {
        return false;
      }

      if (norm.ageGroup && gift.ageGroup !== norm.ageGroup) {
        return false;
      }

      if (norm.sameDayOnly && !gift.sameDayNairobi) {
        return false;
      }

      if (norm.searchQuery) {
        const haystacks = [
          gift.title,
          gift.description,
          gift.shopName,
          gift.shopLocation,
          gift.category,
          gift.occasion,
          ...gift.tags,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystacks.includes(norm.searchQuery)) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...matched];
    if (norm.sortBy === "price-asc") {
      sorted.sort((a, b) => a.priceKsh - b.priceKsh);
    } else if (norm.sortBy === "price-desc") {
      sorted.sort((a, b) => b.priceKsh - a.priceKsh);
    } else if (norm.sortBy === "popular") {
      sorted.sort((a, b) => b.popularityScore - a.popularityScore);
    } else {
      sorted.sort(
        (a, b) =>
          Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
          b.popularityScore - a.popularityScore,
      );
    }

    const prices = sorted.map((g) => g.priceKsh);
    const min = prices.length ? Math.min(...prices) : MIN_ALLOWED_KSH;
    const max = prices.length ? Math.max(...prices) : MAX_ALLOWED_KSH;

    return {
      items: sorted,
      totalCount: sorted.length,
      featuredCount: sorted.filter((g) => g.isFeatured).length,
      sameDayCount: sorted.filter((g) => g.sameDayNairobi).length,
      priceRangeKsh: { min, max },
    };
  },

  async getGiftById(giftId: string): Promise<GiftItem | null> {
    await delay(120);
    const found = giftsCatalog.find((g) => g.id === giftId);
    return found ? { ...found } : null;
  },

  async getRelatedGifts(giftId: string, limit = 4): Promise<GiftItem[]> {
    await delay(120);
    const target = giftsCatalog.find((g) => g.id === giftId);
    if (!target) {
      return giftsCatalog.slice(0, limit).map((g) => ({ ...g }));
    }

    const scored = giftsCatalog
      .filter((g) => g.id !== giftId && g.inStock)
      .map((item) => {
        let score = 0;
        if (item.category === target.category) score += 3;
        if (item.occasion === target.occasion) score += 2;
        if (Math.abs(item.priceKsh - target.priceKsh) <= 2500) score += 1;
        return { item, score };
      })
      .sort(
        (a, b) =>
          b.score - a.score || b.item.popularityScore - a.item.popularityScore,
      );

    return scored.slice(0, limit).map((entry) => ({ ...entry.item }));
  },

  async matchAdvisorGifts(input: GiftAdvisorMatchInput): Promise<GiftItem[]> {
    const bounds = resolveBudgetPresetRange(input.budgetPreset);
    const primary = await this.queryGifts({
      category: input.recipient,
      occasion: input.occasion,
      minKsh: bounds.minKsh,
      maxKsh: bounds.maxKsh,
      sortBy: "popular",
    });

    if (primary.items.length > 0) {
      return primary.items;
    }

    const fallback = await this.queryGifts({
      category: input.recipient,
      minKsh: bounds.minKsh,
      maxKsh: bounds.maxKsh,
      sortBy: "featured",
    });

    return fallback.items;
  },

  async incrementWhatsappInterest(giftId: string): Promise<number> {
    await delay(100);
    const target = giftsCatalog.find((g) => g.id === giftId);
    if (!target) return 0;
    target.popularityScore += 1;
    return target.popularityScore;
  },

  buildWhatsappOrderUrl(
    gift: Pick<
      GiftItem,
      "id" | "title" | "priceKsh" | "shopPhone" | "shopName"
    >,
    buyerNote?: string,
  ): string {
    const digits = gift.shopPhone.replace(/\D/g, "");
    const normalizedPhone = digits.startsWith("0")
      ? `254${digits.slice(1)}`
      : digits.startsWith("254")
        ? digits
        : `254${digits}`;

    const message = [
      `Hello ${gift.shopName} (via BLAC SANTA),`,
      `I'm interested in "${gift.title}" (Ksh ${gift.priceKsh.toLocaleString("en-KE")}).`,
      buyerNote?.trim() ? `Note: ${buyerNote.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  },
};
