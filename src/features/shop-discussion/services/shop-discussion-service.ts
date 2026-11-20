import { useCallback, useEffect, useMemo, useState } from "react";
import { shopDiscussionService } from "../services/shop-discussion-service";
import type {
  DiscussionParticipantRole,
  ShopDiscussionPost,
  ShopRatingSummary,
  TaggedShopReference,
  ThreadVoteDirection,
} from "../types/shop-discussion.types";

export interface UseShopDiscussionReturn {
  posts: ShopDiscussionPost[];
  summary: ShopRatingSummary;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  publishPost: (params: {
    taggedShops?: TaggedShopReference[];
    giftId?: string;
    giftTitle?: string;
    authorName: string;
    authorRole?: DiscussionParticipantRole;
    title?: string;
    body: string;
    rating?: number;
    parentId?: string | null;
  }) => Promise<ShopDiscussionPost | null>;
  voteOnPost: (postId: string, direction: ThreadVoteDirection) => Promise<void>;
}

export function useShopDiscussion(
  shopId: string,
  shopName = "",
): UseShopDiscussionReturn {
  const [posts, setPosts] = useState<ShopDiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const rows = await shopDiscussionService.listPostsForShop(shopId);
      setPosts(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load shop discussion.",
      );
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearError = useCallback(() => setError(null), []);

  const publishPost = useCallback(
    async (params: {
      taggedShops?: TaggedShopReference[];
      giftId?: string;
      giftTitle?: string;
      authorName: string;
      authorRole?: DiscussionParticipantRole;
      title?: string;
      body: string;
      rating?: number;
      parentId?: string | null;
    }): Promise<ShopDiscussionPost | null> => {
      try {
        setError(null);
        setSubmitting(true);
        const created = await shopDiscussionService.createPost({
          shopId,
          shopName,
          taggedShops: params.taggedShops,
          giftId: params.giftId,
          giftTitle: params.giftTitle,
          authorName: params.authorName,
          authorRole: params.authorRole ?? "buyer",
          title: params.title,
          body: params.body,
          rating: params.rating,
          parentId: params.parentId ?? null,
        });
        setPosts((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not publish post.",
        );
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [shopId, shopName],
  );

  const voteOnPost = useCallback(
    async (postId: string, direction: ThreadVoteDirection): Promise<void> => {
      try {
        setError(null);
        const updated = await shopDiscussionService.votePost(postId, direction);
        if (!updated) return;
        setPosts((prev) =>
          prev.map((item) => (item.id === postId ? updated : item)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not record vote.");
      }
    },
    [],
  );

  const summary = useMemo(
    () => shopDiscussionService.computeSummary(shopId, shopName, posts),
    [shopId, shopName, posts],
  );

  return {
    posts,
    summary,
    loading,
    submitting,
    error,
    clearError,
    refresh: load,
    publishPost,
    voteOnPost,
  };
}
