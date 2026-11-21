import type { LiveChatMessagePayload } from "../features/shop-discussion/services/socket";
import type { ShopDiscussionPost } from "../features/shop-discussion/types/shop-discussion.types";

const memoryStore = new Map<string, string>();

function getWebLocalStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Ignore storage access errors in restricted web contexts
  }
  return null;
}

export const appStorage = {
  getItem(key: string): string | null {
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      try {
        return webStorage.getItem(key);
      } catch {
        // Fallback to memory store
      }
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      try {
        webStorage.setItem(key, value);
      } catch {
        // Fallback to memory store
      }
    }
    memoryStore.set(key, value);
  },

  removeItem(key: string): void {
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      try {
        webStorage.removeItem(key);
      } catch {
        // Fallback to memory store
      }
    }
    memoryStore.delete(key);
  },

  getJSON<T>(key: string, fallback: T): T {
    const raw = this.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJSON<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore serialization errors
    }
  },
};

const STORAGE_KEYS = {
  threadPostsPrefix: "blacsanta:discussion:posts:",
  chatRoomPrefix: "blacsanta:livechat:room:",
  authSession: "blacsanta:auth:session",
} as const;

export function loadCachedShopPosts(shopId: string): ShopDiscussionPost[] {
  if (!shopId) return [];
  return appStorage.getJSON<ShopDiscussionPost[]>(
    `${STORAGE_KEYS.threadPostsPrefix}${shopId}`,
    [],
  );
}

export function saveCachedShopPosts(
  shopId: string,
  posts: ShopDiscussionPost[],
): void {
  if (!shopId) return;
  appStorage.setJSON(`${STORAGE_KEYS.threadPostsPrefix}${shopId}`, posts);
}

export function loadCachedRoomMessages(
  roomKey: string,
): LiveChatMessagePayload[] {
  if (!roomKey) return [];
  return appStorage.getJSON<LiveChatMessagePayload[]>(
    `${STORAGE_KEYS.chatRoomPrefix}${roomKey}`,
    [],
  );
}

export function saveCachedRoomMessages(
  roomKey: string,
  messages: LiveChatMessagePayload[],
): void {
  if (!roomKey) return;
  appStorage.setJSON(
    `${STORAGE_KEYS.chatRoomPrefix}${roomKey}`,
    messages.slice(-100),
  );
}

export interface PersistedAuthSession {
  id: string;
  name: string;
  role: "buyer" | "shop" | "admin";
  isAuthenticated: boolean;
  ownedShopId?: string;
}

export function loadPersistedAuthSession(): PersistedAuthSession | null {
  return appStorage.getJSON<PersistedAuthSession | null>(
    STORAGE_KEYS.authSession,
    null,
  );
}

export function savePersistedAuthSession(
  session: PersistedAuthSession | null,
): void {
  if (!session) {
    appStorage.removeItem(STORAGE_KEYS.authSession);
    return;
  }
  appStorage.setJSON(STORAGE_KEYS.authSession, session);
}

export default appStorage;
