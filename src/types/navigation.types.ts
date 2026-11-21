import type { LiveChatChannelMode } from "../features/shop-discussion/components/live-chat-panel";
import type { DiscussionViewMode } from "../features/shop-discussion/components/shop-discussion-dialog";
import type { DiscussionParticipantRole } from "../features/shop-discussion/types/shop-discussion.types";

export type AppRouteName =
  | "MarketplaceHome"
  | "ShopDiscussion"
  | "ShopDashboard"
  | "AdminOversight"
  | "Auth";

export interface ShopDiscussionRouteParams {
  shopId: string;
  shopName?: string;
  initialMode?: DiscussionViewMode;
  initialChannel?: LiveChatChannelMode;
  defaultRole?: DiscussionParticipantRole;
  giftId?: string;
  giftTitle?: string;
  focusPostId?: string;
}

export interface ShopDashboardRouteParams {
  shopId: string;
  shopName?: string;
}

export interface AdminOversightRouteParams {
  initialShopId?: string;
}

export interface AuthRouteParams {
  redirectTo?: AppRouteName;
  suggestedRole?: DiscussionParticipantRole;
  reason?: string;
}

export type RootNavigationParamList = {
  MarketplaceHome: undefined;
  ShopDiscussion: ShopDiscussionRouteParams;
  ShopDashboard: ShopDashboardRouteParams;
  AdminOversight: AdminOversightRouteParams | undefined;
  Auth: AuthRouteParams | undefined;
};
