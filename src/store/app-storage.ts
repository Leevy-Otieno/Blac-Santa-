import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BlackSantaChatMessage,
  SavedGiftItem,
} from "../types/marketplace.types";

const KEYS = {
  WISHLIST: "@blac_santa_wishlist_v1",
  SANTA_MEMORY: "@blac_santa_chat_memory_v1",
} as const;

const memoryCache: Record<string, string> = {};

async function readItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryCache[key] ?? null;
  }
}

async function writeItem(key: string, value: string): Promise<void> {
  memoryCache[key] = value;
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Fallback to in-memory cache if native storage is unavailable
  }
}

export async function loadPersistedWishlist(): Promise<SavedGiftItem[]> {
  const raw = await readItem(KEYS.WISHLIST);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePersistedWishlist(
  items: SavedGiftItem[],
): Promise<void> {
  await writeItem(KEYS.WISHLIST, JSON.stringify(items));
}

export async function loadBlackSantaMemory(): Promise<BlackSantaChatMessage[]> {
  const raw = await readItem(KEYS.SANTA_MEMORY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveBlackSantaMemory(
  messages: BlackSantaChatMessage[],
): Promise<void> {
  // Keep latest 30 turns so prompt context stays crisp and fast
  const trimmed = messages.slice(-30);
  await writeItem(KEYS.SANTA_MEMORY, JSON.stringify(trimmed));
}

export async function clearBlackSantaMemory(): Promise<void> {
  await writeItem(KEYS.SANTA_MEMORY, JSON.stringify([]));
}
