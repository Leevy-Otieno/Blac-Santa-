export type StockHealthStatus = "Healthy" | "Low Stock" | "Out of Stock";

export interface InventoryGiftItem {
  id: string;
  shopId: string;
  shopName: string;
  title: string;
  priceKsh: number;
  originalPriceKsh?: number;
  category: string;
  occasion: string;
  ageGroup: string;
  description: string;
  imageUrl: string;
  sameDayNairobi: boolean;
  /** Exact available units in merchant stock */
  stockQuantity: number;
  /** Low-stock threshold warning level */
  lowStockThreshold: number;
  /** Derived from stockQuantity > 0 */
  inStock: boolean;
  whatsappClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddStockInput {
  giftId: string;
  quantityToAdd: number;
}

export interface SetStockQuantityInput {
  giftId: string;
  stockQuantity: number;
  lowStockThreshold?: number;
}

export interface DeductStockInput {
  giftId: string;
  quantityOrdered: number;
}
