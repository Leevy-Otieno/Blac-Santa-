import AsyncStorage from "@react-native-async-storage/async-storage";
import { GiftShopSuggestion, SavedGiftItem } from "../types/wishlist.types";

const WISHLIST_STORAGE_KEY = "@blac_santa_wishlist_v1";
const memoryFallback: Record<string, string> = {};

export const NAIROBI_GIFT_SHOPS: GiftShopSuggestion[] = [
  {
    id: "shop-kilimani-scents",
    shopName: "Aroma & Co. Nairobi",
    neighborhood: "Kilimani",
    phone: "+254712000111",
    specialty: "Luxury perfumes, diffusers & gift boxes",
    priceRangeKsh: "Ksh 1,500 – 8,500",
  },
  {
    id: "shop-westlands-craft",
    shopName: "Savanna Craft & Curio",
    neighborhood: "Westlands",
    phone: "+254722000222",
    specialty: "Artisanal hampers, leather journals & decor",
    priceRangeKsh: "Ksh 1,000 – 10,000",
  },
  {
    id: "shop-cbd-tech",
    shopName: "Nairobi Desk & Tech Hub",
    neighborhood: "CBD / Ngong Rd",
    phone: "+254733000333",
    specialty: "Audio gear, desk accessories & boss gifts",
    priceRangeKsh: "Ksh 1,800 – 15,000",
  },
  {
    id: "shop-karen-kids",
    shopName: "Little Wonders Kenya",
    neighborhood: "Karen / Westlands",
    phone: "+254744000444",
    specialty: "Educational toys, puzzles & birthday bundles",
    priceRangeKsh: "Ksh 800 – 6,000",
  },
];

async function readRaw(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryFallback[key] ?? null;
  }
}

async function writeRaw(key: string, value: string): Promise<void> {
  memoryFallback[key] = value;
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Keep in-memory fallback when storage is unavailable
  }
}

export async function loadWishlist(): Promise<SavedGiftItem[]> {
  const raw = await readRaw(WISHLIST_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveWishlist(items: SavedGiftItem[]): Promise<void> {
  await writeRaw(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}
