import type {
  AddStockInput,
  DeductStockInput,
  InventoryGiftItem,
  SetStockQuantityInput,
  StockHealthStatus,
} from "../types/inventory.types";

let inventoryStore: InventoryGiftItem[] = [];

export function getStockHealthStatus(
  item: Pick<InventoryGiftItem, "stockQuantity" | "lowStockThreshold">,
): StockHealthStatus {
  if (item.stockQuantity <= 0) return "Out of Stock";
  if (item.stockQuantity <= item.lowStockThreshold) return "Low Stock";
  return "Healthy";
}

export const inventoryService = {
  async listInventory(shopId?: string): Promise<InventoryGiftItem[]> {
    const rows = shopId
      ? inventoryStore.filter((item) => item.shopId === shopId)
      : inventoryStore;
    return rows.map((r) => ({ ...r }));
  },

  async getItem(giftId: string): Promise<InventoryGiftItem | null> {
    const found = inventoryStore.find((item) => item.id === giftId);
    return found ? { ...found } : null;
  },

  async upsertGiftItem(
    item: Omit<InventoryGiftItem, "createdAt" | "updatedAt"> & {
      createdAt?: string;
      updatedAt?: string;
    },
  ): Promise<InventoryGiftItem> {
    const now = new Date().toISOString();
    const stockQuantity = Math.max(0, Math.round(item.stockQuantity));
    const lowStockThreshold = Math.max(0, Math.round(item.lowStockThreshold));

    const normalized: InventoryGiftItem = {
      ...item,
      stockQuantity,
      lowStockThreshold,
      inStock: stockQuantity > 0,
      createdAt: item.createdAt ?? now,
      updatedAt: now,
    };

    const exists = inventoryStore.some((row) => row.id === normalized.id);
    inventoryStore = exists
      ? inventoryStore.map((row) =>
          row.id === normalized.id ? normalized : row,
        )
      : [normalized, ...inventoryStore];

    return { ...normalized };
  },

  async addStock(input: AddStockInput): Promise<InventoryGiftItem> {
    const qtyToAdd = Math.round(input.quantityToAdd);
    if (!Number.isFinite(qtyToAdd) || qtyToAdd <= 0) {
      throw new Error("Enter a positive stock quantity to add.");
    }

    const existing = inventoryStore.find((item) => item.id === input.giftId);
    if (!existing) {
      throw new Error("Gift item not found.");
    }

    const nextQty = existing.stockQuantity + qtyToAdd;
    const updated: InventoryGiftItem = {
      ...existing,
      stockQuantity: nextQty,
      inStock: nextQty > 0,
      updatedAt: new Date().toISOString(),
    };

    inventoryStore = inventoryStore.map((item) =>
      item.id === input.giftId ? updated : item,
    );
    return { ...updated };
  },

  async setStockQuantity(
    input: SetStockQuantityInput,
  ): Promise<InventoryGiftItem> {
    const nextQty = Math.max(0, Math.round(input.stockQuantity));
    const existing = inventoryStore.find((item) => item.id === input.giftId);
    if (!existing) {
      throw new Error("Gift item not found.");
    }

    const nextThreshold =
      typeof input.lowStockThreshold === "number"
        ? Math.max(0, Math.round(input.lowStockThreshold))
        : existing.lowStockThreshold;

    const updated: InventoryGiftItem = {
      ...existing,
      stockQuantity: nextQty,
      lowStockThreshold: nextThreshold,
      inStock: nextQty > 0,
      updatedAt: new Date().toISOString(),
    };

    inventoryStore = inventoryStore.map((item) =>
      item.id === input.giftId ? updated : item,
    );
    return { ...updated };
  },

  async deductStockOnPaidOrder(
    input: DeductStockInput,
  ): Promise<InventoryGiftItem> {
    const qtyOrdered = Math.max(1, Math.round(input.quantityOrdered));
    const existing = inventoryStore.find((item) => item.id === input.giftId);
    if (!existing) {
      throw new Error("Gift item not found.");
    }

    if (existing.stockQuantity < qtyOrdered) {
      throw new Error(
        `Only ${existing.stockQuantity} unit(s) available for "${existing.title}".`,
      );
    }

    const remaining = existing.stockQuantity - qtyOrdered;
    const updated: InventoryGiftItem = {
      ...existing,
      stockQuantity: remaining,
      inStock: remaining > 0,
      updatedAt: new Date().toISOString(),
    };

    inventoryStore = inventoryStore.map((item) =>
      item.id === input.giftId ? updated : item,
    );
    return { ...updated };
  },
};
