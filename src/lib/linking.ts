import { Linking } from "react-native";
import type { LiveChatChannelMode } from "../features/shop-discussion/components/live-chat-panel";

export type DiscussionDialogMode = "thread" | "live-chat";

export interface ShopDiscussionDeepLinkParams {
  shopId: string;
  shopName?: string;
  mode?: DiscussionDialogMode;
  channel?: LiveChatChannelMode;
  postId?: string;
}

const DEFAULT_SCHEME = "blacsanta";

export function buildShopRoomKey(
  shopId: string,
  channel: LiveChatChannelMode = "room",
): string {
  const safeShopId = shopId.trim() || "default_shop";
  if (channel === "direct-buyer") {
    return `shop:${safeShopId}:dm:buyer`;
  }
  if (channel === "direct-admin") {
    return `shop:${safeShopId}:dm:admin`;
  }
  return `shop:${safeShopId}:room`;
}

export function buildShopDiscussionUrl(
  params: ShopDiscussionDeepLinkParams,
  scheme: string = DEFAULT_SCHEME,
): string {
  const queryParts: string[] = [`shopId=${encodeURIComponent(params.shopId)}`];

  if (params.shopName) {
    queryParts.push(`shopName=${encodeURIComponent(params.shopName)}`);
  }
  if (params.mode) {
    queryParts.push(`mode=${encodeURIComponent(params.mode)}`);
  }
  if (params.channel) {
    queryParts.push(`channel=${encodeURIComponent(params.channel)}`);
  }
  if (params.postId) {
    queryParts.push(`postId=${encodeURIComponent(params.postId)}`);
  }

  return `${scheme}://shop-discussion?${queryParts.join("&")}`;
}

export function parseShopDiscussionUrl(
  url: string,
): ShopDiscussionDeepLinkParams | null {
  if (!url) return null;

  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return null;

  const queryString = url.slice(queryIndex + 1).split("#")[0] ?? "";
  const pairs = queryString.split("&").filter(Boolean);
  const map = new Map<string, string>();

  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, eqIdx));
    const val = decodeURIComponent(pair.slice(eqIdx + 1));
    map.set(key, val);
  }

  const shopId = map.get("shopId")?.trim();
  if (!shopId) return null;

  const rawMode = map.get("mode");
  const mode: DiscussionDialogMode | undefined =
    rawMode === "live-chat" || rawMode === "thread" ? rawMode : undefined;

  const rawChannel = map.get("channel");
  const channel: LiveChatChannelMode | undefined =
    rawChannel === "room" ||
    rawChannel === "direct-buyer" ||
    rawChannel === "direct-admin"
      ? rawChannel
      : undefined;

  return {
    shopId,
    shopName: map.get("shopName"),
    mode,
    channel,
    postId: map.get("postId"),
  };
}

export async function openShopDiscussionLink(
  params: ShopDiscussionDeepLinkParams,
): Promise<boolean> {
  const url = buildShopDiscussionUrl(params);
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export default {
  buildShopRoomKey,
  buildShopDiscussionUrl,
  parseShopDiscussionUrl,
  openShopDiscussionLink,
};
