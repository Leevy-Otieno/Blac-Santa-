export type DiscussionParticipantRole = "buyer" | "shop" | "admin";

export type ThreadVoteDirection = "up" | "down";

export interface TaggedShopReference {
  shopId: string;
  shopName: string;
}

export interface ShopDiscussionPost {
  id: string;
  /** Primary shop thread context */
  shopId: string;
  shopName: string;
  /** Optional additional shops tagged/mentioned in this post or reply */
  taggedShops?: TaggedShopReference[];
  giftId?: string;
  giftTitle?: string;
  authorName: string;
  authorRole: DiscussionParticipantRole;
  title?: string;
  body: string;
  /** Optional 1-5 star rating for the shop */
  rating?: number;
  /** Parent post/comment ID for nested replies */
  parentId?: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface ShopRatingSummary {
  shopId: string;
  shopName: string;
  averageRating: number;
  totalRatings: number;
  totalPosts: number;
}
