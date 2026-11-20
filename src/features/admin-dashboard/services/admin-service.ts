import type {
  AdminMarketplaceMetrics,
  AdminPlatformUser,
  AdminShop,
  AdminShopStatus,
  AdminTaxonomyCatalog,
  OnboardShopInput,
  PlatformUserRole,
} from "../types/admin.types";

const INITIAL_SHOPS: AdminShop[] = [
  {
    id: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    ownerName: "Amina Wanjiku",
    ownerEmail: "amina@savannascents.co.ke",
    whatsappPhone: "+254723456789",
    location: "Westlands, Nairobi",
    categoryFocus: "Hampers & Candles",
    status: "Active",
    giftCount: 18,
    whatsappClicks: 140,
    createdAt: "2026-06-12T09:00:00.000Z",
    updatedAt: "2026-11-18T14:20:00.000Z",
  },
  {
    id: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    ownerName: "Brian Kamau",
    ownerEmail: "brian@nairobicraft.co.ke",
    whatsappPhone: "+254712345678",
    location: "Kilimani, Nairobi",
    categoryFocus: "Leather & Men's Gifts",
    status: "Active",
    giftCount: 12,
    whatsappClicks: 96,
    createdAt: "2026-07-04T11:30:00.000Z",
    updatedAt: "2026-11-19T08:45:00.000Z",
  },
  {
    id: "shop-velvet-bloom",
    shopName: "Velvet Bloom Florals & Gifts",
    ownerName: "Faith Njeri",
    ownerEmail: "faith@velvetbloom.co.ke",
    whatsappPhone: "+254798112233",
    location: "CBD / Moi Ave, Nairobi",
    categoryFocus: "Hampers & Candles",
    status: "Pending",
    giftCount: 6,
    whatsappClicks: 0,
    createdAt: "2026-11-19T16:10:00.000Z",
    updatedAt: "2026-11-19T16:10:00.000Z",
  },
];

const INITIAL_USERS: AdminPlatformUser[] = [
  {
    id: "usr-1",
    name: "Amina Wanjiku",
    contact: "+254723456789",
    role: "shop",
    active: true,
    assignedShopId: "shop-savanna-scents",
    lastActiveAt: "2026-11-20T10:15:00.000Z",
  },
  {
    id: "usr-2",
    name: "Brian Kamau",
    contact: "+254712345678",
    role: "shop",
    active: true,
    assignedShopId: "shop-nairobi-craft",
    lastActiveAt: "2026-11-20T09:05:00.000Z",
  },
  {
    id: "usr-3",
    name: "BLAC SANTA Admin",
    contact: "admin@blacsanta.co.ke",
    role: "admin",
    active: true,
    lastActiveAt: "2026-11-20T13:30:00.000Z",
  },
  {
    id: "usr-4",
    name: "Nairobi Gift Buyer",
    contact: "+254700112233",
    role: "buyer",
    active: true,
    lastActiveAt: "2026-11-19T19:40:00.000Z",
  },
];

let shopsStore: AdminShop[] = [...INITIAL_SHOPS];
let usersStore: AdminPlatformUser[] = [...INITIAL_USERS];
let taxonomyStore: AdminTaxonomyCatalog = {
  categories: ["For Him", "For Her", "Kids", "Boss"],
  occasions: ["Valentine's Day", "Birthdays", "Christmas"],
};

function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeKenyanWhatsapp(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("254")) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+254${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) {
    return `+254${digits}`;
  }
  return rawPhone.startsWith("+") ? rawPhone.trim() : `+${digits}`;
}

function slugifyShopId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `shop-${base || "merchant"}-${Date.now().toString().slice(-4)}`;
}

export const adminService = {
  async listShops(): Promise<AdminShop[]> {
    await delay(180);
    return [...shopsStore];
  },

  async onboardShop(input: OnboardShopInput): Promise<AdminShop> {
    await delay(260);

    const shopName = input.shopName.trim();
    const ownerName = input.ownerName.trim();
    const formattedPhone = normalizeKenyanWhatsapp(input.whatsappPhone);
    const digitCount = formattedPhone.replace(/\D/g, "").length;

    if (!shopName) {
      throw new Error("Shop name is required.");
    }
    if (!ownerName) {
      throw new Error("Assigned shop owner name is required.");
    }
    if (digitCount !== 12 || !formattedPhone.startsWith("+254")) {
      throw new Error("Enter a valid Kenyan WhatsApp number (+2547XXXXXXXX).");
    }

    const now = new Date().toISOString();
    const newShop: AdminShop = {
      id: slugifyShopId(shopName),
      shopName,
      ownerName,
      ownerEmail: (input.ownerEmail ?? "").trim(),
      whatsappPhone: formattedPhone,
      location: input.location.trim() || "Nairobi",
      categoryFocus: input.categoryFocus?.trim() || "Hampers & Candles",
      status: input.activateImmediately === false ? "Pending" : "Active",
      giftCount: 0,
      whatsappClicks: 0,
      createdAt: now,
      updatedAt: now,
    };

    shopsStore = [newShop, ...shopsStore];
    return newShop;
  },

  async updateShopStatus(
    shopId: string,
    status: AdminShopStatus,
  ): Promise<AdminShop> {
    await delay(180);
    const target = shopsStore.find((s) => s.id === shopId);
    if (!target) {
      throw new Error("Shop record not found.");
    }

    const updated: AdminShop = {
      ...target,
      status,
      updatedAt: new Date().toISOString(),
    };

    shopsStore = shopsStore.map((s) => (s.id === shopId ? updated : s));
    return updated;
  },

  async listUsers(): Promise<AdminPlatformUser[]> {
    await delay(160);
    return [...usersStore];
  },

  async updateUserRole(
    userId: string,
    role: PlatformUserRole,
  ): Promise<AdminPlatformUser> {
    await delay(160);
    const existing = usersStore.find((u) => u.id === userId);
    if (!existing) {
      throw new Error("User record not found.");
    }

    const updated: AdminPlatformUser = {
      ...existing,
      role,
      lastActiveAt: new Date().toISOString(),
    };
    usersStore = usersStore.map((u) => (u.id === userId ? updated : u));
    return updated;
  },

  async getTaxonomy(): Promise<AdminTaxonomyCatalog> {
    await delay(120);
    return {
      categories: [...taxonomyStore.categories],
      occasions: [...taxonomyStore.occasions],
    };
  },

  async addCategory(category: string): Promise<AdminTaxonomyCatalog> {
    await delay(140);
    const clean = category.trim();
    if (!clean) {
      throw new Error("Category name cannot be empty.");
    }
    if (
      taxonomyStore.categories.some(
        (c) => c.toLowerCase() === clean.toLowerCase(),
      )
    ) {
      throw new Error(`Category "${clean}" already exists.`);
    }
    taxonomyStore = {
      ...taxonomyStore,
      categories: [...taxonomyStore.categories, clean],
    };
    return {
      categories: [...taxonomyStore.categories],
      occasions: [...taxonomyStore.occasions],
    };
  },

  async addOccasion(occasion: string): Promise<AdminTaxonomyCatalog> {
    await delay(140);
    const clean = occasion.trim();
    if (!clean) {
      throw new Error("Occasion name cannot be empty.");
    }
    if (
      taxonomyStore.occasions.some(
        (o) => o.toLowerCase() === clean.toLowerCase(),
      )
    ) {
      throw new Error(`Occasion "${clean}" already exists.`);
    }
    taxonomyStore = {
      ...taxonomyStore,
      occasions: [...taxonomyStore.occasions, clean],
    };
    return {
      categories: [...taxonomyStore.categories],
      occasions: [...taxonomyStore.occasions],
    };
  },

  computeMetrics(shops: AdminShop[]): AdminMarketplaceMetrics {
    return {
      totalShops: shops.length,
      activeShops: shops.filter((s) => s.status === "Active").length,
      pendingShops: shops.filter((s) => s.status === "Pending").length,
      suspendedShops: shops.filter((s) => s.status === "Suspended").length,
      totalGifts: shops.reduce((sum, s) => sum + s.giftCount, 0),
      totalWhatsappClicks: shops.reduce((sum, s) => sum + s.whatsappClicks, 0),
      budgetMinKsh: 500,
      budgetMaxKsh: 10000,
    };
  },
};
