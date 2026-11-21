import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadPersistedWishlist,
  savePersistedWishlist,
} from "../store/app-storage";
import { SavedGiftItem } from "../types/marketplace.types";

export function useWishlist() {
  const [items, setItems] = useState<SavedGiftItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    loadPersistedWishlist()
      .then((loaded) => {
        if (active) {
          setItems(loaded);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: SavedGiftItem[]) => {
    setItems(next);
    await savePersistedWishlist(next);
  }, []);

  const addToWishlist = useCallback(
    async (gift: Omit<SavedGiftItem, "savedAt">) => {
      if (items.some((item) => item.id === gift.id)) return;

      const next: SavedGiftItem[] = [
        { ...gift, savedAt: new Date().toISOString() },
        ...items,
      ];
      await persist(next);
    },
    [items, persist],
  );

  const removeFromWishlist = useCallback(
    async (id: string) => {
      const next = items.filter((item) => item.id !== id);
      await persist(next);
    },
    [items, persist],
  );

  const toggleWishlist = useCallback(
    async (gift: Omit<SavedGiftItem, "savedAt">) => {
      const exists = items.some((item) => item.id === gift.id);
      if (exists) {
        await persist(items.filter((item) => item.id !== gift.id));
        return false;
      }

      const next: SavedGiftItem[] = [
        { ...gift, savedAt: new Date().toISOString() },
        ...items,
      ];
      await persist(next);
      return true;
    },
    [items, persist],
  );

  const clearWishlist = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const isSaved = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const totalKsh = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.priceKsh) || 0), 0),
    [items],
  );

  return {
    items,
    loading,
    count: items.length,
    totalKsh,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isSaved,
  };
}

export default useWishlist;
