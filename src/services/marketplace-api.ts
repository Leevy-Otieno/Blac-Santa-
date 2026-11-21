import {
  GiftProduct,
  MarketplaceOrder,
  MarketplaceShop,
  OrderStatus,
} from "../types/marketplace.types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") || "";

export function isBackendConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Backend API URL is not configured yet.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status}) for ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchMarketplaceShops(): Promise<MarketplaceShop[]> {
  if (!isBackendConfigured()) return [];
  const data = await requestJson<
    MarketplaceShop[] | { shops?: MarketplaceShop[] }
  >("/shops");
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.shops) ? data.shops : [];
}

export async function fetchMarketplaceGifts(params?: {
  shopId?: string;
  neighborhood?: string;
}): Promise<GiftProduct[]> {
  if (!isBackendConfigured()) return [];
  const query = new URLSearchParams();
  if (params?.shopId) query.set("shopId", params.shopId);
  if (params?.neighborhood) query.set("neighborhood", params.neighborhood);
  const qs = query.toString() ? `?${query.toString()}` : "";

  const data = await requestJson<GiftProduct[] | { gifts?: GiftProduct[] }>(
    `/gifts${qs}`,
  );
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.gifts) ? data.gifts : [];
}

export async function fetchMarketplaceOrders(params?: {
  shopId?: string;
}): Promise<MarketplaceOrder[]> {
  if (!isBackendConfigured()) return [];
  const qs = params?.shopId
    ? `?shopId=${encodeURIComponent(params.shopId)}`
    : "";
  const data = await requestJson<
    MarketplaceOrder[] | { orders?: MarketplaceOrder[] }
  >(`/orders${qs}`);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.orders) ? data.orders : [];
}

export async function updateOrderStatusRemote(
  orderId: string,
  status: OrderStatus,
): Promise<boolean> {
  if (!isBackendConfigured()) return false;
  await requestJson(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return true;
}
