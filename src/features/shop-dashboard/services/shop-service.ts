import type {
  CreateShopGiftInput,
  ShopGiftListing,
  ShopProfile,
  ShopStatsMetrics,
  UpdateShopGiftInput,
} from "../types/shop.types";

const MIN_GIFT_PRICE_KSH = 500;
const MAX_ALLOWED_GIFT_PRICE_KSH = 250000;

const SHOP_PROFILES: Record<string, ShopProfile> = {
  "shop-savanna-scents": {
    id: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    ownerName: "Amina Wanjiku",
    whatsappPhone: "+254723456789",
    location: "Westlands, Nairobi",
    categoryFocus: "Hampers & Candles",
    status: "Active",
    totalWhatsappClicks: 140,
  },
  "shop-nairobi-craft": {
    id: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    ownerName: "Brian Kamau",
    whatsappPhone: "+254712345678",
    location: "Kilimani, Nairobi",
    categoryFocus: "Leather & Men's Gifts",
    status: "Active",
    totalWhatsappClicks: 96,
  },
};

let shopGiftsStore: ShopGiftListing[] = [
  {
    id: "gift-velvet-candle-box",
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    title: "Crimson Rose & Vanilla Soy Candle Hamper",
    priceKsh: 2800,
    originalPriceKsh: 3400,
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "25–34",
    description:
      "Hand-poured coconut-soy candle paired with preserved crimson roses and artisanal truffles.",
    imageUrl:
      "https://images.unsplash.com/photo-1603006905393-c8849bb012c0?auto=format&fit=crop&w=900&q=85",
    sameDayNairobi: true,
    inStock: true,
    whatsappClicks: 68,
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-11-18T14:20:00.000Z",
  },
  {
    id: "gift-executive-flask-set",
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    title: "Matte Crimson Thermal Flask & Desk Set",
    priceKsh: 5400,
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    description:
      "Double-wall insulated flask with leather coaster and structured keepsake presentation.",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    sameDayNairobi: false,
    inStock: true,
    whatsappClicks: 42,
    createdAt: "2026-10-14T15:00:00.000Z",
    updatedAt: "2026-11-19T08:45:00.000Z",
  },
  {
    id: "gift-festive-treat-hamper",
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    title: "Holiday Cocoa, Shortbread & Gift Card Edit",
    priceKsh: 4200,
    category: "For Her",
    occasion: "Christmas",
    ageGroup: "18–24",
    description:
      "Festive keepsake crate stocked with spiced cocoa, gourmet biscuits, and ribbon finish.",
    imageUrl:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85",
    sameDayNairobi: true,
    inStock: false,
    whatsappClicks: 30,
    createdAt: "2026-10-18T17:20:00.000Z",
    updatedAt: "2026-11-19T12:00:00.000Z",
  },
  {
    id: "gift-royal-executive-hamper",
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    title: "Grand Crimson Executive & Celebration Hamper",
    priceKsh: 14500,
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    description:
      "High-tier celebration hamper featuring artisanal sweets, keepsake decanter, and custom note.",
    imageUrl:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85",
    sameDayNairobi: true,
    inStock: true,
    whatsappClicks: 52,
    createdAt: "2026-10-28T11:00:00.000Z",
    updatedAt: "2026-11-19T15:00:00.000Z",
  },
  {
    id: "gift-leather-folio",
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    title: "Hand-Stitched Leather Wallet & Key Keeper",
    priceKsh: 3600,
    category: "For Him",
    occasion: "Birthdays",
    ageGroup: "25–34",
    description:
      "Full-grain Kenyan leather bifold wallet with matching brass key loop in gift box.",
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    sameDayNairobi: true,
    inStock: true,
    whatsappClicks: 58,
    createdAt: "2026-10-04T10:15:00.000Z",
    updatedAt: "2026-11-19T08:45:00.000Z",
  },
  {
    id: "gift-stem-building-kit",
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    title: "Junior Solar & Gear STEM Discovery Kit",
    priceKsh: 1850,
    category: "Kids",
    occasion: "Birthdays",
    ageGroup: "6–12",
    description:
      "Hands-on mechanical engineering puzzle kit designed for curious young builders.",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=85",
    sameDayNairobi: true,
    inStock: true,
    whatsappClicks: 38,
    createdAt: "2026-10-09T12:30:00.000Z",
    updatedAt: "2026-11-19T08:45:00.000Z",
  },
];

function delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateGiftPrice(priceKsh: number): number {
  const rounded = Math.round(priceKsh);
  if (
    !Number.isFinite(rounded) ||
    rounded < MIN_GIFT_PRICE_KSH ||
    rounded > MAX_ALLOWED_GIFT_PRICE_KSH
  ) {
    throw new Error(
      `Price must be between Ksh ${MIN_GIFT_PRICE_KSH.toLocaleString(
        "en-KE",
      )} and Ksh ${MAX_ALLOWED_GIFT_PRICE_KSH.toLocaleString("en-KE")}.`,
    );
  }
  return rounded;
}

export const shopService = {
  async getShopProfile(shopId: string): Promise<ShopProfile> {
    await delay(140);
    const known = SHOP_PROFILES[shopId];
    if (known) {
      return { ...known };
    }
    return {
      id: shopId,
      shopName: "BLAC SANTA Partner Shop",
      ownerName: "Merchant Partner",
      whatsappPhone: "+254712345678",
      location: "Nairobi",
      categoryFocus: "Curated Gifts",
      status: "Active",
      totalWhatsappClicks: 0,
    };
  },

  async listShopGifts(shopId: string): Promise<ShopGiftListing[]> {
    await delay(180);
    return shopGiftsStore
      .filter((item) => item.shopId === shopId)
      .map((item) => ({ ...item }));
  },

  async createGift(input: CreateShopGiftInput): Promise<ShopGiftListing> {
    await delay(240);
    const title = input.title.trim();
    const description = input.description.trim();
    const imageUrl = input.imageUrl.trim();

    if (!title) {
      throw new Error("Gift title is required.");
    }
    const priceKsh = validateGiftPrice(input.priceKsh);
    if (!imageUrl) {
      throw new Error("Gift photo URL or image URI is required.");
    }
    if (!description) {
      throw new Error("Gift description is required.");
    }

    const profile = await this.getShopProfile(input.shopId);
    const now = new Date().toISOString();

    const created: ShopGiftListing = {
      id: `gift-${Date.now().toString().slice(-6)}`,
      shopId: input.shopId,
      shopName: profile.shopName,
      title,
      priceKsh,
      originalPriceKsh:
        typeof input.originalPriceKsh === "number" &&
        input.originalPriceKsh > priceKsh
          ? Math.round(input.originalPriceKsh)
          : undefined,
      category: input.category,
      occasion: input.occasion,
      ageGroup: input.ageGroup,
      description,
      imageUrl,
      sameDayNairobi: input.sameDayNairobi,
      inStock: input.inStock,
      whatsappClicks: 0,
      createdAt: now,
      updatedAt: now,
    };

    shopGiftsStore = [created, ...shopGiftsStore];
    return { ...created };
  },

  async updateGift(input: UpdateShopGiftInput): Promise<ShopGiftListing> {
    await delay(200);
    const existing = shopGiftsStore.find((item) => item.id === input.id);
    if (!existing) {
      throw new Error("Gift listing not found.");
    }

    const nextPrice =
      typeof input.priceKsh === "number"
        ? validateGiftPrice(input.priceKsh)
        : existing.priceKsh;

    const updated: ShopGiftListing = {
      ...existing,
      ...input,
      title:
        typeof input.title === "string" ? input.title.trim() : existing.title,
      description:
        typeof input.description === "string"
          ? input.description.trim()
          : existing.description,
      imageUrl:
        typeof input.imageUrl === "string"
          ? input.imageUrl.trim()
          : existing.imageUrl,
      priceKsh: nextPrice,
      updatedAt: new Date().toISOString(),
    };

    shopGiftsStore = shopGiftsStore.map((item) =>
      item.id === input.id ? updated : item,
    );
    return { ...updated };
  },

  async toggleGiftStock(giftId: string): Promise<ShopGiftListing> {
    await delay(140);
    const existing = shopGiftsStore.find((item) => item.id === giftId);
    if (!existing) {
      throw new Error("Gift listing not found.");
    }

    const updated: ShopGiftListing = {
      ...existing,
      inStock: !existing.inStock,
      updatedAt: new Date().toISOString(),
    };

    shopGiftsStore = shopGiftsStore.map((item) =>
      item.id === giftId ? updated : item,
    );
    return { ...updated };
  },

  async deleteGift(giftId: string): Promise<void> {
    await delay(160);
    const exists = shopGiftsStore.some((item) => item.id === giftId);
    if (!exists) {
      throw new Error("Gift listing not found.");
    }
    shopGiftsStore = shopGiftsStore.filter((item) => item.id !== giftId);
  },

  computeShopStats(gifts: readonly ShopGiftListing[]): ShopStatsMetrics {
    const activeGifts = gifts.filter((g) => g.inStock).length;
    const soldOutGifts = gifts.filter((g) => !g.inStock).length;
    const whatsappClicks = gifts.reduce(
      (sum, g) => sum + (g.whatsappClicks || 0),
      0,
    );
    const averagePriceKsh =
      gifts.length > 0
        ? gifts.reduce((sum, g) => sum + g.priceKsh, 0) / gifts.length
        : 0;

    return {
      activeGifts,
      soldOutGifts,
      whatsappClicks,
      averagePriceKsh,
    };
  },
};
