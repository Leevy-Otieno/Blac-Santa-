import { useCallback, useEffect, useMemo, useState } from "react";
import { loadWishlist, saveWishlist } from "../store/wishlist-store";
import { SavedGiftItem } from "../types/wishlist.types";

export function useWishlist() {
  const [items, setItems] = useState<SavedGiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadWishlist().then((loaded) => {
      if (active) {
        setItems(loaded);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: SavedGiftItem[]) => {
    setItems(next);
    await saveWishlist(next);
  }, []);

  const addToWishlist = useCallback(
    async (gift: Omit<SavedGiftItem, "savedAt">) => {
      const exists = items.some((item) => item.id === gift.id);
      if (exists) return;
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

  const isSaved = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const totalKsh = useMemo(
    () => items.reduce((sum, item) => sum + item.priceKsh, 0),
    [items],
  );

  return {
    items,
    loading,
    count: items.length,
    totalKsh,
    addToWishlist,
    removeFromWishlist,
    isSaved,
  };
}
