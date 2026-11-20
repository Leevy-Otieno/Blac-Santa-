import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShopDiscussion } from "../hooks/use-shop-discussion";
import type {
  DiscussionParticipantRole,
  ShopDiscussionPost,
  TaggedShopReference,
} from "../types/shop-discussion.types";

export interface ShopDiscussionDialogProps {
  shopId: string;
  shopName: string;
  giftId?: string;
  giftTitle?: string;
  availableShops?: readonly TaggedShopReference[];
  defaultRole?: DiscussionParticipantRole;
  buttonLabel?: string;
  className?: string;
}

const ROLES: readonly { id: DiscussionParticipantRole; label: string }[] = [
  { id: "buyer", label: "Buyer" },
  { id: "shop", label: "Shop Owner" },
  { id: "admin", label: "Admin" },
];

export function ShopDiscussionDialog({
  shopId,
  shopName,
  giftId,
  giftTitle,
  availableShops = [],
  defaultRole = "buyer",
  buttonLabel = "Open Shop Thread",
  className = "",
}: ShopDiscussionDialogProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const {
    posts,
    summary,
    submitting,
    error,
    clearError,
    publishPost,
    voteOnPost,
  } = useShopDiscussion(shopId, shopName);

  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"top" | "new">("top");
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<ShopDiscussionPost | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] =
    useState<DiscussionParticipantRole>(defaultRole);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [selectedTaggedIds, setSelectedTaggedIds] = useState<string[]>([]);
  const [includeRating, setIncludeRating] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);

  const taggableShops = useMemo(
    () => availableShops.filter((s) => s.shopId !== shopId),
    [availableShops, shopId],
  );

  const toggleTagShop = (targetShopId: string) => {
    setSelectedTaggedIds((prev) =>
      prev.includes(targetShopId)
        ? prev.filter((id) => id !== targetShopId)
        : [...prev, targetShopId],
    );
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const childrenByParent = useMemo(() => {
    const map: Record<string, ShopDiscussionPost[]> = {};
    for (const post of posts) {
      if (post.parentId) {
        if (!map[post.parentId]) map[post.parentId] = [];
        map[post.parentId].push(post);
      }
    }
    return map;
  }, [posts]);

  const topLevelPosts = useMemo(() => {
    const roots = posts.filter((p) => !p.parentId);
    if (sortBy === "new") {
      return [...roots].reverse();
    }
    return [...roots].sort(
      (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
    );
  }, [posts, sortBy]);

  const handlePublish = async () => {
    const chosenTags = taggableShops.filter((s) =>
      selectedTaggedIds.includes(s.shopId),
    );

    const created = await publishPost({
      taggedShops: chosenTags,
      giftId,
      giftTitle,
      authorName,
      authorRole,
      title: replyingTo ? undefined : postTitle,
      body: postBody,
      rating: replyingTo ? undefined : includeRating ? ratingStars : undefined,
      parentId: replyingTo ? replyingTo.id : null,
    });

    if (created) {
      setPostBody("");
      setPostTitle("");
      setReplyingTo(null);
      setSelectedTaggedIds([]);
      setIncludeRating(false);
    }
  };

  const roleBadgeStyle = (role: DiscussionParticipantRole) => {
    if (role === "admin") {
      return { bg: "bg-rose-950", text: "text-rose-100", label: "Admin" };
    }
    if (role === "shop") {
      return { bg: "bg-rose-600", text: "text-white", label: "Shop Owner" };
    }
    return { bg: "bg-rose-200", text: "text-rose-950", label: "Buyer" };
  };

  const renderThreadNode = (post: ShopDiscussionPost, depth = 0) => {
    const replies = childrenByParent[post.id] ?? [];
    const isCollapsed = Boolean(collapsedIds[post.id]);
    const score = post.upvotes - post.downvotes;
    const badge = roleBadgeStyle(post.authorRole);

    return (
      <View
        key={post.id}
        style={{ marginLeft: Math.min(depth * 12, 36) }}
        className={
          depth > 0 ? "border-l-2 border-rose-200 pl-2.5 mt-2" : "mt-2.5"
        }
      >
        <View className="bg-rose-50/75 border border-rose-100 rounded-2xl p-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5 flex-wrap flex-1">
              <Text className="text-[11px] font-extrabold text-rose-950">
                u/{post.authorName}
              </Text>

              <View className={`px-2 py-0.5 rounded-full ${badge.bg}`}>
                <Text className={`text-[9px] font-extrabold ${badge.text}`}>
                  {badge.label}
                </Text>
              </View>

              {typeof post.rating === "number" && (
                <View className="bg-rose-950 px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-extrabold text-rose-100">
                    {post.rating} ★ Shop Rating
                  </Text>
                </View>
              )}
            </View>

            {replies.length > 0 && (
              <Pressable
                onPress={() => toggleCollapse(post.id)}
                hitSlop={6}
                className="px-2 py-0.5 rounded-full bg-white border border-rose-200"
              >
                <Text className="text-[10px] font-extrabold text-rose-800">
                  {isCollapsed ? `+ Expand (${replies.length})` : "− Hide"}
                </Text>
              </Pressable>
            )}
          </View>

          {post.taggedShops && post.taggedShops.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mt-1.5">
              {post.taggedShops.map((tag) => (
                <View
                  key={tag.shopId}
                  className="bg-white border border-rose-200 px-2 py-0.5 rounded-full"
                >
                  <Text className="text-[9px] font-extrabold text-rose-700">
                    Tagged: @{tag.shopName}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {post.title ? (
            <Text className="text-xs font-extrabold text-rose-950 mt-1.5">
              {post.title}
            </Text>
          ) : null}

          <Text className="text-xs text-rose-900 mt-1 leading-4">
            {post.body}
          </Text>

          <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-rose-100">
            <View className="flex-row items-center gap-1.5">
              <Pressable
                onPress={() => void voteOnPost(post.id, "up")}
                hitSlop={6}
                className="flex-row items-center gap-0.5 bg-white border border-rose-200 px-2 py-1 rounded-xl"
              >
                <Ionicons name="arrow-up" size={14} color="#E11D48" />
                <Text className="text-[11px] font-extrabold text-rose-950">
                  {score}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => void voteOnPost(post.id, "down")}
                hitSlop={6}
                className="bg-white border border-rose-200 p-1 rounded-xl"
              >
                <Ionicons name="arrow-down" size={14} color="#881337" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                clearError();
                setReplyingTo(post);
              }}
              hitSlop={6}
              className="flex-row items-center gap-1 bg-white border border-rose-200 px-2.5 py-1 rounded-xl"
            >
              <Ionicons
                name="return-down-forward-outline"
                size={13}
                color="#881337"
              />
              <Text className="text-[11px] font-extrabold text-rose-900">
                Reply
              </Text>
            </Pressable>
          </View>
        </View>

        {!isCollapsed &&
          replies.map((child) => renderThreadNode(child, depth + 1))}
      </View>
    );
  };

  return (
    <View className={className}>
      <Pressable
        onPress={() => {
          clearError();
          setOpen(true);
        }}
        className={`flex-row items-center justify-center gap-1.5 bg-rose-50 active:bg-rose-100 border border-rose-200 rounded-2xl ${
          isCompact ? "py-2.5 px-3" : "py-3 px-3.5"
        }`}
      >
        <Ionicons name="chatbubbles-outline" size={16} color="#881337" />
        <Text
          numberOfLines={1}
          className="text-rose-950 text-xs font-extrabold"
        >
          {buttonLabel}
          {summary.totalRatings > 0
            ? ` • ${summary.averageRating}★`
            : summary.totalPosts > 0
              ? ` • ${summary.totalPosts}`
              : ""}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 justify-end bg-rose-950/60">
          <Animated.View
            entering={FadeIn.duration(160)}
            className="flex-1 justify-end"
          >
            <Pressable className="flex-1" onPress={() => setOpen(false)} />

            <Animated.View
              entering={FadeInDown.springify().damping(18)}
              style={{
                paddingBottom: Math.max(insets.bottom, 20),
                maxHeight: "92%",
              }}
              className={`bg-white rounded-t-3xl border-t border-rose-100 pt-3 ${
                isCompact ? "px-3.5" : "px-4"
              }`}
            >
              <View className="w-10 h-1.5 rounded-full bg-rose-200 self-center mb-2.5" />

              {/* Header */}
              <View className="flex-row items-center justify-between pb-2.5 border-b border-rose-100">
                <View className="flex-1 pr-2">
                  <Text
                    numberOfLines={1}
                    className="text-base font-extrabold text-rose-950"
                  >
                    r/{(shopName || "Shop").replace(/\s+/g, "")} Open Thread
                  </Text>
                  <Text className="text-[11px] text-rose-700/75">
                    Buyers, tagged shops & admins •{" "}
                    {summary.totalRatings > 0
                      ? `${summary.averageRating}★ (${summary.totalRatings} ratings)`
                      : `${summary.totalPosts} posts`}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <Pressable
                    onPress={() =>
                      setSortBy((prev) => (prev === "top" ? "new" : "top"))
                    }
                    className="bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl"
                  >
                    <Text className="text-[10px] font-extrabold text-rose-950">
                      {sortBy === "top" ? "Top" : "New"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setOpen(false)}
                    hitSlop={8}
                    className="h-8 w-8 rounded-full bg-rose-50 items-center justify-center"
                  >
                    <Ionicons name="close" size={18} color="#881337" />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View className="flex-row items-center gap-2 bg-rose-50 border border-rose-300 rounded-2xl p-2.5 mt-2.5">
                  <Ionicons name="alert-circle" size={16} color="#E11D48" />
                  <Text className="text-xs font-bold text-rose-800 flex-1">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Composer */}
              <View className="bg-rose-50/50 border border-rose-200 rounded-2xl p-3 mt-2.5 gap-2">
                {replyingTo ? (
                  <View className="flex-row items-center justify-between bg-rose-100 px-2.5 py-1.5 rounded-xl">
                    <Text
                      numberOfLines={1}
                      className="text-[11px] font-extrabold text-rose-950 flex-1 pr-2"
                    >
                      Replying to u/{replyingTo.authorName}
                    </Text>
                    <Pressable onPress={() => setReplyingTo(null)}>
                      <Text className="text-[11px] font-extrabold text-rose-700">
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-between gap-2">
                    <TextInput
                      value={postTitle}
                      onChangeText={setPostTitle}
                      placeholder="Topic title (optional)"
                      placeholderTextColor="#FDA4AF"
                      className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-950"
                    />

                    <Pressable
                      onPress={() => setIncludeRating((prev) => !prev)}
                      className={`px-2.5 py-2 rounded-xl border ${
                        includeRating
                          ? "bg-rose-600 border-rose-600"
                          : "bg-white border-rose-200"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-extrabold ${
                          includeRating ? "text-white" : "text-rose-900"
                        }`}
                      >
                        {includeRating ? `${ratingStars}★ Rating` : "+ Rate"}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {!replyingTo && includeRating && (
                  <View className="flex-row items-center justify-between bg-white border border-rose-200 rounded-xl px-3 py-2">
                    <Text className="text-[11px] font-bold text-rose-950">
                      Rate {shopName || "Shop"}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Pressable
                          key={star}
                          onPress={() => setRatingStars(star)}
                          hitSlop={4}
                        >
                          <Ionicons
                            name={star <= ratingStars ? "star" : "star-outline"}
                            size={19}
                            color="#E11D48"
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Role selector (Buyer, Shop Owner, Admin) */}
                <View className="flex-row gap-1.5">
                  {ROLES.map((r) => {
                    const active = authorRole === r.id;
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => setAuthorRole(r.id)}
                        className={`flex-1 py-1.5 rounded-xl border items-center ${
                          active
                            ? "bg-rose-950 border-rose-950"
                            : "bg-white border-rose-200"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-extrabold ${
                            active ? "text-white" : "text-rose-900"
                          }`}
                        >
                          {r.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Optional Tag Shops */}
                {taggableShops.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 6 }}
                  >
                    {taggableShops.map((tagShop) => {
                      const tagged = selectedTaggedIds.includes(tagShop.shopId);
                      return (
                        <Pressable
                          key={tagShop.shopId}
                          onPress={() => toggleTagShop(tagShop.shopId)}
                          className={`px-2.5 py-1 rounded-full border ${
                            tagged
                              ? "bg-rose-600 border-rose-600"
                              : "bg-white border-rose-200"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-extrabold ${
                              tagged ? "text-white" : "text-rose-900"
                            }`}
                          >
                            {tagged
                              ? `✓ @${tagShop.shopName}`
                              : `+ Tag @${tagShop.shopName}`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}

                <TextInput
                  value={authorName}
                  onChangeText={setAuthorName}
                  placeholder="Your Name (Buyer, Shop Owner, or Admin)"
                  placeholderTextColor="#FDA4AF"
                  className="bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-950"
                />

                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={postBody}
                    onChangeText={setPostBody}
                    placeholder={
                      replyingTo
                        ? `Reply to u/${replyingTo.authorName}...`
                        : "Post a message, review, or tag a shop..."
                    }
                    placeholderTextColor="#FDA4AF"
                    className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950"
                  />

                  <Pressable
                    onPress={handlePublish}
                    disabled={submitting}
                    className="bg-rose-600 active:bg-rose-700 px-3.5 h-9 rounded-xl items-center justify-center"
                  >
                    <Text className="text-white text-xs font-extrabold">
                      {submitting ? "..." : replyingTo ? "Reply" : "Post"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Thread Feed */}
              <ScrollView
                style={{ maxHeight: 310 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {topLevelPosts.length === 0 ? (
                  <View className="bg-rose-50/60 border border-rose-100 rounded-2xl p-5 mt-3 items-center">
                    <Text className="text-xs font-extrabold text-rose-950">
                      No posts yet in this thread
                    </Text>
                    <Text className="text-[11px] text-rose-700/75 mt-1 text-center">
                      Buyers, tagged shops, and admins can start the discussion
                      above.
                    </Text>
                  </View>
                ) : (
                  topLevelPosts.map((rootPost) => renderThreadNode(rootPost, 0))
                )}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

export default ShopDiscussionDialog;
