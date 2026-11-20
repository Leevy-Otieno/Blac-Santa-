import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiscoverableGift } from "./use-gift-filters";

export interface UseGiftsReturn {
  gifts: DiscoverableGift[];
  featuredGifts: DiscoverableGift[];
  sameDayNairobiGifts: DiscoverableGift[];
  wishlistIds: string[];
  wishlistGifts: DiscoverableGift[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  clearError: () => void;
  refreshGifts: () => Promise<void>;
  getGiftById: (giftId: string) => DiscoverableGift | undefined;
  isWishlisted: (giftId: string) => boolean;
  toggleWishlist: (giftId: string) => void;
  recordWhatsappClick: (giftId: string) => void;
}

const CATALOG_GIFTS: DiscoverableGift[] = [
  {
    id: "gift-velvet-candle-box",
    title: "Crimson Rose & Vanilla Soy Candle Hamper",
    priceKsh: 2800,
    originalPriceKsh: 3400,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    category: "For Her",
    occasion: "Valentine's Day",
    ageGroup: "25–34",
    popularityScore: 148,
    isFeatured: true,
    sameDayNairobi: true,
    location: "Westlands, Nairobi",
    whatsappPhone: "+254723456789",
    description:
      "Hand-poured coconut-soy candle paired with preserved crimson roses and artisanal truffles.",
    imageUrl:
      "https://images.unsplash.com/photo-1603006905393-c8849bb012c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "gift-leather-folio",
    title: "Hand-Stitched Leather Wallet & Key Keeper",
    priceKsh: 3600,
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    category: "For Him",
    occasion: "Birthdays",
    ageGroup: "25–34",
    popularityScore: 121,
    isFeatured: true,
    sameDayNairobi: true,
    location: "Kilimani, Nairobi",
    whatsappPhone: "+254712345678",
    description:
      "Full-grain Kenyan leather bifold wallet with matching brass key loop in gift box.",
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "gift-stem-building-kit",
    title: "Junior Solar & Gear STEM Discovery Kit",
    priceKsh: 1850,
    shopId: "shop-nairobi-craft",
    shopName: "Nairobi Craft Hub",
    category: "Kids",
    occasion: "Birthdays",
    ageGroup: "6–12",
    popularityScore: 94,
    isFeatured: false,
    sameDayNairobi: true,
    location: "Kilimani, Nairobi",
    whatsappPhone: "+254712345678",
    description:
      "Hands-on mechanical engineering puzzle kit designed for curious young builders.",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "gift-executive-flask-set",
    title: "Matte Crimson Thermal Flask & Desk Set",
    priceKsh: 5400,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    category: "Boss",
    occasion: "Christmas",
    ageGroup: "35+",
    popularityScore: 112,
    isFeatured: true,
    sameDayNairobi: false,
    location: "Westlands, Nairobi",
    whatsappPhone: "+254723456789",
    description:
      "Double-wall insulated flask with leather coaster and structured keepsake presentation.",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "gift-festive-treat-hamper",
    title: "Holiday Cocoa, Shortbread & Gift Card Edit",
    priceKsh: 4200,
    shopId: "shop-savanna-scents",
    shopName: "Savanna Scents & Hampers",
    category: "For Her",
    occasion: "Christmas",
    ageGroup: "18–24",
    popularityScore: 87,
    isFeatured: false,
    sameDayNairobi: true,
    location: "Westlands, Nairobi",
    whatsappPhone: "+254723456789",
    description:
      "Festive keepsake crate stocked with spiced cocoa, gourmet biscuits, and ribbon finish.",
    imageUrl:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80",
  },
];

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useGifts(): UseGiftsReturn {
  const [gifts, setGifts] = useState<DiscoverableGift[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([
    "gift-velvet-candle-box",
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      await delay(180);
      setGifts(CATALOG_GIFTS.map((item) => ({ ...item })));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load gift catalog.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog(false);
  }, [loadCatalog]);

  const refreshGifts = useCallback(async () => {
    await loadCatalog(true);
  }, [loadCatalog]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getGiftById = useCallback(
    (giftId: string) => gifts.find((gift) => gift.id === giftId),
    [gifts],
  );

  const isWishlisted = useCallback(
    (giftId: string) => wishlistIds.includes(giftId),
    [wishlistIds],
  );

  const toggleWishlist = useCallback((giftId: string) => {
    setWishlistIds((prev) =>
      prev.includes(giftId)
        ? prev.filter((id) => id !== giftId)
        : [...prev, giftId],
    );
  }, []);

  const recordWhatsappClick = useCallback((giftId: string) => {
    setGifts((prev) =>
      prev.map((item) =>
        item.id === giftId
          ? { ...item, popularityScore: (item.popularityScore ?? 0) + 1 }
          : item,
      ),
    );
  }, []);

  const featuredGifts = useMemo(
    () => gifts.filter((gift) => Boolean(gift.isFeatured)),
    [gifts],
  );

  const sameDayNairobiGifts = useMemo(
    () => gifts.filter((gift) => Boolean(gift.sameDayNairobi)),
    [gifts],
  );

  const wishlistGifts = useMemo(
    () => gifts.filter((gift) => wishlistIds.includes(gift.id)),
    [gifts, wishlistIds],
  );

  return {
    gifts,
    featuredGifts,
    sameDayNairobiGifts,
    wishlistIds,
    wishlistGifts,
    loading,
    refreshing,
    error,
    clearError,
    refreshGifts,
    getGiftById,
    isWishlisted,
    toggleWishlist,
    recordWhatsappClick,
  };
}
