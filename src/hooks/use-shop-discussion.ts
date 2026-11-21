import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  socketClient,
  type LiveChatMessagePayload,
} from "../features/shop-discussion/services/socket";
import type {
  DiscussionParticipantRole,
  ShopDiscussionPost,
  ShopDiscussionSummary,
  TaggedShopReference,
  ThreadSortMode,
  ThreadVoteDirection,
} from "../features/shop-discussion/types/shop-discussion.types";
import { getActiveAuthUser } from "../lib/firebase";
import {
  loadCachedRoomMessages,
  loadCachedShopPosts,
  saveCachedRoomMessages,
  saveCachedShopPosts,
} from "../lib/storage";

export interface DiscussionAuthUser {
  id: string;
  name: string;
  role: DiscussionParticipantRole;
  isAuthenticated: boolean;
}

export interface CreateDiscussionPostInput {
  authorName: string;
  authorRole: DiscussionParticipantRole;
  body: string;
  title?: string;
  parentId?: string | null;
  rating?: number | null;
  giftId?: string;
  giftTitle?: string;
  taggedShops?: TaggedShopReference[];
}

export interface UseShopDiscussionOptions {
  shopId: string;
  shopName?: string;
  currentUser?: DiscussionAuthUser | null;
  initialPosts?: ShopDiscussionPost[];
}

const DEFAULT_SHOP_POSTS: ShopDiscussionPost[] = [
  {
    id: "seed_post_1",
    shopId: "default_shop",
    shopName: "Featured Shop",
    parentId: null,
    authorName: "Wanjiku Kamau",
    authorRole: "buyer",
    title: "Fast delivery & neat gift wrapping",
    body: "Ordered a gift box in Nairobi and got prompt confirmation plus clean packaging. Open to hearing if others had similar turnaround times.",
    rating: 5,
    upvotes: 6,
    downvotes: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    taggedShops: [],
  },
];

function computeDiscussionSummary(
  posts: ShopDiscussionPost[],
): ShopDiscussionSummary {
  const topLevelPosts = posts.filter((post) => !post.parentId);
  const ratedPosts = topLevelPosts.filter(
    (post): post is ShopDiscussionPost & { rating: number } =>
      typeof post.rating === "number" && post.rating >= 1 && post.rating <= 5,
  );

  const totalRatings = ratedPosts.length;
  const averageRating =
    totalRatings > 0
      ? Number(
          (
            ratedPosts.reduce((sum, item) => sum + item.rating, 0) /
            totalRatings
          ).toFixed(1),
        )
      : 0;

  return {
    averageRating,
    totalRatings,
    totalPosts: posts.length,
  };
}

function hydrateRoomMessages(
  shopId: string,
): Record<string, LiveChatMessagePayload[]> {
  const safeId = shopId.trim() || "default_shop";
  const roomKeys = [
    `shop:${safeId}:room`,
    `shop:${safeId}:dm:buyer`,
    `shop:${safeId}:dm:admin`,
  ];

  const hydrated: Record<string, LiveChatMessagePayload[]> = {};
  for (const key of roomKeys) {
    const cached = loadCachedRoomMessages(key);
    if (cached.length > 0) {
      hydrated[key] = cached;
    }
  }
  return hydrated;
}

export function useShopDiscussion(
  shopIdOrOptions: string | UseShopDiscussionOptions,
  legacyShopName = "",
) {
  const options: UseShopDiscussionOptions =
    typeof shopIdOrOptions === "string"
      ? { shopId: shopIdOrOptions, shopName: legacyShopName }
      : shopIdOrOptions;

  const { shopId, shopName = "", currentUser, initialPosts } = options;

  const effectiveUser: DiscussionAuthUser | null = useMemo(() => {
    if (currentUser !== undefined) {
      return currentUser;
    }
    const active = getActiveAuthUser();
    return {
      id: active.id,
      name: active.name,
      role: active.role,
      isAuthenticated: active.isAuthenticated,
    };
  }, [currentUser]);

  const [allPosts, setAllPosts] = useState<ShopDiscussionPost[]>(() => {
    if (initialPosts && initialPosts.length > 0) {
      return initialPosts;
    }
    const cached = loadCachedShopPosts(shopId);
    if (cached.length > 0) {
      return cached;
    }
    return DEFAULT_SHOP_POSTS.map((p) => ({
      ...p,
      shopId: shopId || p.shopId,
      shopName: shopName || p.shopName,
    }));
  });

  const [votesByPostId, setVotesByPostId] = useState<
    Record<string, ThreadVoteDirection | null>
  >({});
  const [sortMode, setSortMode] = useState<ThreadSortMode>("top");
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [collapsedPostIds, setCollapsedPostIds] = useState<
    Record<string, boolean>
  >({});

  const [messagesByRoom, setMessagesByRoom] = useState<
    Record<string, LiveChatMessagePayload[]>
  >(() => hydrateRoomMessages(shopId));
  const [remoteTypingByRoom, setRemoteTypingByRoom] = useState<
    Record<string, string | null>
  >({});
  const [onlineCountByRoom, setOnlineCountByRoom] = useState<
    Record<string, number>
  >({});
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shopId) {
      saveCachedShopPosts(shopId, allPosts);
    }
  }, [shopId, allPosts]);

  useEffect(() => {
    const entries = Object.entries(messagesByRoom);
    for (const [roomKey, msgs] of entries) {
      saveCachedRoomMessages(roomKey, msgs);
    }
  }, [messagesByRoom]);

  const isAuthenticated = Boolean(effectiveUser?.isAuthenticated);

  const requireAuth = useCallback((): boolean => {
    if (!effectiveUser || !effectiveUser.isAuthenticated) {
      setAuthNotice(
        "Please sign in to post, reply, vote, or send live chat messages.",
      );
      return false;
    }
    setAuthNotice(null);
    return true;
  }, [effectiveUser]);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  useEffect(() => {
    const threadRoom = `shop:${shopId}:thread`;
    socketClient.joinRoom(threadRoom);

    const unsubscribe = socketClient.subscribe((event) => {
      if (event.type === "socket:status") {
        setSocketConnected(event.connected);
      } else if (event.type === "post:created") {
        const incoming = event.post;
        if (!incoming?.id) return;
        setAllPosts((prev) => {
          if (prev.some((item) => item.id === incoming.id)) return prev;
          return [incoming, ...prev];
        });
      } else if (event.type === "post:voted") {
        setAllPosts((prev) =>
          prev.map((post) => {
            if (post.id !== event.postId) return post;
            if (
              typeof event.upvotes === "number" &&
              typeof event.downvotes === "number"
            ) {
              return {
                ...post,
                upvotes: event.upvotes,
                downvotes: event.downvotes,
              };
            }
            return {
              ...post,
              upvotes:
                event.direction === "up" ? post.upvotes + 1 : post.upvotes,
              downvotes:
                event.direction === "down"
                  ? post.downvotes + 1
                  : post.downvotes,
            };
          }),
        );
      } else if (event.type === "chat:message") {
        const msg = event.message;
        if (!msg?.roomKey) return;
        setMessagesByRoom((prev) => {
          const existing = prev[msg.roomKey] ?? [];
          if (existing.some((item) => item.id === msg.id)) return prev;
          const updated = [...existing, msg];
          saveCachedRoomMessages(msg.roomKey, updated);
          return {
            ...prev,
            [msg.roomKey]: updated,
          };
        });
      } else if (event.type === "chat:typing") {
        if (!event.roomKey) return;
        const roleLabel =
          event.senderRole === "admin"
            ? "Admin"
            : event.senderRole === "shop"
              ? "Shop Owner"
              : "Buyer";
        setRemoteTypingByRoom((prev) => ({
          ...prev,
          [event.roomKey]: event.isTyping
            ? `${event.senderName} (${roleLabel}) is typing...`
            : null,
        }));
      } else if (event.type === "chat:presence") {
        if (!event.roomKey) return;
        setOnlineCountByRoom((prev) => ({
          ...prev,
          [event.roomKey]: Math.max(1, event.onlineCount),
        }));
      }
    });

    return () => {
      unsubscribe();
      socketClient.leaveRoom(threadRoom);
    };
  }, [shopId]);

  const shopPosts = useMemo(() => {
    const relevant = allPosts.filter((post) => {
      if (!shopId) return true;
      if (post.shopId === shopId) return true;
      return Boolean(post.taggedShops?.some((tag) => tag.shopId === shopId));
    });

    const topLevel = relevant.filter((post) => !post.parentId);
    const repliesByParent = new Map<string, ShopDiscussionPost[]>();

    for (const post of relevant) {
      if (!post.parentId) continue;
      const list = repliesByParent.get(post.parentId) ?? [];
      list.push(post);
      repliesByParent.set(post.parentId, list);
    }

    const sortedTopLevel = [...topLevel].sort((a, b) => {
      if (sortMode === "new") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      const scoreA = a.upvotes - a.downvotes;
      const scoreB = b.upvotes - b.downvotes;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const ordered: ShopDiscussionPost[] = [];
    const appendWithReplies = (node: ShopDiscussionPost) => {
      ordered.push(node);
      if (collapsedPostIds[node.id]) return;
      const children = repliesByParent.get(node.id) ?? [];
      for (const child of children) {
        appendWithReplies(child);
      }
    };

    for (const parent of sortedTopLevel) {
      appendWithReplies(parent);
    }

    return ordered;
  }, [allPosts, shopId, sortMode, collapsedPostIds]);

  const repliesCountByPostId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of allPosts) {
      if (post.parentId) {
        counts[post.parentId] = (counts[post.parentId] ?? 0) + 1;
      }
    }
    return counts;
  }, [allPosts]);

  const summary = useMemo(
    () =>
      computeDiscussionSummary(
        allPosts.filter((post) => !shopId || post.shopId === shopId),
      ),
    [allPosts, shopId],
  );

  const createPost = useCallback(
    (input: CreateDiscussionPostInput): ShopDiscussionPost | null => {
      if (!requireAuth()) return null;

      const trimmedBody = input.body.trim();
      if (!trimmedBody) return null;

      const resolvedRole: DiscussionParticipantRole =
        effectiveUser?.isAuthenticated ? effectiveUser.role : input.authorRole;

      const resolvedAuthor =
        (effectiveUser?.isAuthenticated
          ? effectiveUser.name
          : input.authorName
        ).trim() ||
        (resolvedRole === "admin"
          ? "BLAC SANTA Admin"
          : resolvedRole === "shop"
            ? `${shopName || "Shop"} Owner`
            : "Buyer");

      const created: ShopDiscussionPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        shopId: shopId || "default_shop",
        shopName: shopName || "Shop",
        parentId: input.parentId ?? null,
        authorName: resolvedAuthor,
        authorRole: resolvedRole,
        title: input.parentId ? undefined : input.title?.trim() || undefined,
        body: trimmedBody,
        rating:
          !input.parentId &&
          typeof input.rating === "number" &&
          input.rating >= 1 &&
          input.rating <= 5
            ? input.rating
            : null,
        upvotes: 1,
        downvotes: 0,
        createdAt: new Date().toISOString(),
        giftId: input.giftId,
        giftTitle: input.giftTitle,
        taggedShops: input.taggedShops ?? [],
      };

      setAllPosts((prev) => {
        const next = [created, ...prev];
        if (shopId) saveCachedShopPosts(shopId, next);
        return next;
      });
      setVotesByPostId((prev) => ({ ...prev, [created.id]: "up" }));
      if (input.parentId) {
        setReplyingToPostId(null);
      }

      socketClient.send({
        event: "post:created",
        payload: created,
      });

      return created;
    },
    [requireAuth, effectiveUser, shopId, shopName],
  );

  const votePost = useCallback(
    (postId: string, direction: ThreadVoteDirection): void => {
      if (!requireAuth()) return;

      const currentVote = votesByPostId[postId] ?? null;
      const nextVote: ThreadVoteDirection | null =
        currentVote === direction ? null : direction;

      setVotesByPostId((prev) => ({
        ...prev,
        [postId]: nextVote,
      }));

      setAllPosts((prev) => {
        const next = prev.map((post) => {
          if (post.id !== postId) return post;

          let upDelta = 0;
          let downDelta = 0;

          if (currentVote === "up") upDelta -= 1;
          if (currentVote === "down") downDelta -= 1;

          if (nextVote === "up") upDelta += 1;
          if (nextVote === "down") downDelta += 1;

          return {
            ...post,
            upvotes: Math.max(0, post.upvotes + upDelta),
            downvotes: Math.max(0, post.downvotes + downDelta),
          };
        });
        if (shopId) saveCachedShopPosts(shopId, next);
        return next;
      });

      socketClient.send({
        event: "post:voted",
        payload: {
          postId,
          direction,
          voteState: nextVote,
        },
      });
    },
    [requireAuth, votesByPostId, shopId],
  );

  const toggleCollapsePost = useCallback((postId: string): void => {
    setCollapsedPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  }, []);

  const joinChatRoom = useCallback((roomKey: string): void => {
    if (!roomKey) return;
    setMessagesByRoom((prev) => {
      if (prev[roomKey]?.length) return prev;
      const cached = loadCachedRoomMessages(roomKey);
      if (!cached.length) return prev;
      return { ...prev, [roomKey]: cached };
    });
    socketClient.joinRoom(roomKey);
  }, []);

  const leaveChatRoom = useCallback((roomKey: string): void => {
    if (!roomKey) return;
    socketClient.leaveRoom(roomKey);
  }, []);

  const sendChatMessage = useCallback(
    (params: {
      roomKey: string;
      body: string;
      senderName?: string;
      senderRole?: DiscussionParticipantRole;
      taggedShopNames?: string[];
    }): LiveChatMessagePayload | null => {
      if (!requireAuth()) return null;

      const trimmed = params.body.trim();
      if (!trimmed || !params.roomKey) return null;

      const resolvedRole: DiscussionParticipantRole =
        effectiveUser?.isAuthenticated
          ? effectiveUser.role
          : (params.senderRole ?? "buyer");

      const resolvedSender =
        (effectiveUser?.isAuthenticated
          ? effectiveUser.name
          : params.senderName
        )?.trim() ||
        (resolvedRole === "admin"
          ? "BLAC SANTA Admin"
          : resolvedRole === "shop"
            ? `${shopName || "Shop"} Owner`
            : "Buyer");

      const message: LiveChatMessagePayload = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        shopId: shopId || "default_shop",
        roomKey: params.roomKey,
        senderName: resolvedSender,
        senderRole: resolvedRole,
        body: trimmed,
        createdAt: new Date().toISOString(),
        taggedShopNames: params.taggedShopNames,
      };

      setMessagesByRoom((prev) => {
        const updated = [...(prev[params.roomKey] ?? []), message];
        saveCachedRoomMessages(params.roomKey, updated);
        return {
          ...prev,
          [params.roomKey]: updated,
        };
      });

      socketClient.sendChatMessage(message);
      socketClient.sendTypingStatus({
        roomKey: params.roomKey,
        senderName: resolvedSender,
        senderRole: resolvedRole,
        isTyping: false,
      });

      return message;
    },
    [requireAuth, effectiveUser, shopId, shopName],
  );

  const setTyping = useCallback(
    (params: {
      roomKey: string;
      isTyping: boolean;
      senderName?: string;
      senderRole?: DiscussionParticipantRole;
    }): void => {
      if (!params.roomKey) return;
      if (!effectiveUser?.isAuthenticated) return;

      const resolvedRole: DiscussionParticipantRole = effectiveUser.role;
      const resolvedSender =
        effectiveUser.name.trim() ||
        (resolvedRole === "admin"
          ? "BLAC SANTA Admin"
          : resolvedRole === "shop"
            ? `${shopName || "Shop"} Owner`
            : "Buyer");

      socketClient.sendTypingStatus({
        roomKey: params.roomKey,
        senderName: resolvedSender,
        senderRole: resolvedRole,
        isTyping: params.isTyping,
      });

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      if (params.isTyping) {
        typingTimerRef.current = setTimeout(() => {
          socketClient.sendTypingStatus({
            roomKey: params.roomKey,
            senderName: resolvedSender,
            senderRole: resolvedRole,
            isTyping: false,
          });
        }, 1200);
      }
    },
    [effectiveUser, shopName],
  );

  return {
    posts: shopPosts,
    allPosts,
    summary,
    sortMode,
    setSortMode,
    votesByPostId,
    repliesCountByPostId,
    replyingToPostId,
    setReplyingToPostId,
    collapsedPostIds,
    toggleCollapsePost,
    createPost,
    votePost,
    messagesByRoom,
    remoteTypingByRoom,
    onlineCountByRoom,
    socketConnected,
    joinChatRoom,
    leaveChatRoom,
    sendChatMessage,
    setTyping,
    isAuthenticated,
    authNotice,
    clearAuthNotice,
    requireAuth,
  };
}

export default useShopDiscussion;
