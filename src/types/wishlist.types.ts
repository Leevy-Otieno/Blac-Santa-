export interface GiftShopSuggestion {
  id: string;
  shopName: string;
  neighborhood: string; // e.g., Kilimani, Westlands, CBD, Karen
  phone: string; // +254 format
  specialty: string;
  priceRangeKsh: string;
}

export interface SavedGiftItem {
  id: string;
  title: string;
  recipient?: string;
  occasion?: string;
  priceKsh: number;
  shopName: string;
  neighborhood: string;
  phone: string;
  notes?: string;
  savedAt: string;
}

export interface BlackSantaMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  suggestedGifts?: {
    id: string;
    title: string;
    priceKsh: number;
    reason: string;
    shop: GiftShopSuggestion;
  }[];
  createdAt: string;
}
