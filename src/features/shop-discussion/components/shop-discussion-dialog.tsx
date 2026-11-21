import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useShopDiscussion,
  type DiscussionAuthUser,
} from "../../../hooks/use-shop-discussion";
import { useTheme } from "../../../hooks/use-theme";
import { signInDemoUser, signOutCurrentUser } from "../../../lib/firebase";
import type {
  DiscussionParticipantRole,
  ShopDiscussionPost,
  TaggedShopReference,
} from "../types/shop-discussion.types";
import { LiveChatPanel, type LiveChatChannelMode } from "./live-chat-panel";

export type DiscussionViewMode = "thread" | "live-chat";

export interface ShopDiscussionDialogProps {
  visible: boolean;
  onClose: () => void;
  shopId: string;
  shopName?: string;
  defaultRole?: DiscussionParticipantRole;
  defaultMode?: DiscussionViewMode;
  defaultChannel?: LiveChatChannelMode;
  currentUser?: DiscussionAuthUser | null;
  giftId?: string;
  giftTitle?: string;
  availableShops?: TaggedShopReference[];
  onRequireAuth?: () => void;
}

const ROLES: DiscussionParticipantRole[] = ["buyer", "shop", "admin"];
const STARS = [1, 2, 3, 4, 5];

export function ShopDiscussionDialog({
  visible,
  onClose,
  shopId,
  shopName = "Shop",
  defaultRole = "buyer",
  defaultMode = "thread",
  defaultChannel = "room",
  currentUser,
  giftId,
  giftTitle,
  availableShops = [],
  onRequireAuth,
}: ShopDiscussionDialogProps) {
  const [viewMode, setViewMode] = useState<DiscussionViewMode>(defaultMode);
  const [activeChannel, setActiveChannel] =
    useState<LiveChatChannelMode>(defaultChannel);
  const [activeRole, setActiveRole] =
    useState<DiscussionParticipantRole>(defaultRole);
  const [sessionTick, setSessionTick] = useState(0);

  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(5);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => setViewMode(defaultMode), [defaultMode, shopId]);
  useEffect(() => setActiveChannel(defaultChannel), [defaultChannel, shopId]);
  useEffect(() => setActiveRole(defaultRole), [defaultRole]);

  const effectiveRole: DiscussionParticipantRole = currentUser?.isAuthenticated
    ? currentUser.role
    : activeRole;

  const effectiveUserName =
    currentUser?.name?.trim() ||
    (effectiveRole === "admin"
      ? "BLAC SANTA Admin"
      : effectiveRole === "shop"
        ? `${shopName} Owner`
        : "Buyer");

  const discussion = useShopDiscussion({ shopId, shopName, currentUser });
  const {
    posts,
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
  } = discussion;

  const { colors } = useTheme({ role: effectiveRole });

  const depthByPostId = useMemo(() => {
    const map = new Map<string, number>();
    for (const post of posts) {
      const depth = !post.parentId
        ? 0
        : Math.min((map.get(post.parentId) ?? 0) + 1, 5);
      map.set(post.id, depth);
    }
    return map;
  }, [posts]);

  const taggedShopObjects = useMemo(
    () => availableShops.filter((s) => selectedTagIds.includes(s.shopId)),
    [availableShops, selectedTagIds],
  );

  const guardAuth = (): boolean => {
    if (requireAuth()) return true;
    onRequireAuth?.();
    return false;
  };

  const toggleShopTag = (id: string) =>
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const handlePublish = () => {
    if (!guardAuth()) return;
    const created = createPost({
      authorName: effectiveUserName,
      authorRole: effectiveRole,
      title: postTitle,
      body: postBody,
      parentId: null,
      rating: selectedRating,
      giftId,
      giftTitle,
      taggedShops: taggedShopObjects,
    });
    if (created) {
      setPostTitle("");
      setPostBody("");
      setSelectedRating(5);
      setSelectedTagIds([]);
      clearAuthNotice();
    }
  };

  const handleReply = (parentId: string) => {
    if (!guardAuth()) return;
    const draft = (replyDrafts[parentId] ?? "").trim();
    if (!draft) return;
    const created = createPost({
      authorName: effectiveUserName,
      authorRole: effectiveRole,
      body: draft,
      parentId,
      giftId,
      giftTitle,
    });
    if (created) {
      setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
      clearAuthNotice();
    }
  };

  const handleQuickSignIn = () => {
    signInDemoUser({ name: effectiveUserName, role: effectiveRole });
    clearAuthNotice();
    setSessionTick((n) => n + 1);
  };

  const handleSignOut = () => {
    signOutCurrentUser();
    setSessionTick((n) => n + 1);
  };

  const canSubmitPost = isAuthenticated && postBody.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
            <View style={styles.flex1}>
              <Text style={[styles.title, { color: colors.text }]}>
                {shopName}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {summary.totalRatings > 0
                  ? `${summary.averageRating}★ (${summary.totalRatings} ratings)`
                  : "No ratings yet"}{" "}
                • {summary.totalPosts} posts
                {sessionTick < 0 ? "" : ""}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[
                styles.smallBtn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.smallBtnText, { color: colors.text }]}>
                Close
              </Text>
            </Pressable>
          </View>

          <View style={styles.rowGap8}>
            {(["thread", "live-chat"] as const).map((mode) => {
              const active = viewMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeText,
                      { color: active ? colors.primaryText : colors.text },
                    ]}
                  >
                    {mode === "thread" ? "Discussion Thread" : "Live Chat"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!currentUser?.isAuthenticated && (
            <View style={styles.inlineRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Role:
              </Text>
              {ROLES.map((r) => {
                const selected = activeRole === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setActiveRole(r)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? colors.surfaceMuted
                          : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {r.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {(!isAuthenticated || authNotice) && viewMode === "thread" && (
            <View
              style={[
                styles.authBox,
                {
                  backgroundColor: colors.roleBadgeBg,
                  borderColor: colors.roleAccent,
                },
              ]}
            >
              <Text style={[styles.authText, { color: colors.roleBadgeText }]}>
                {authNotice ||
                  "Sign in required to create posts, replies, votes, or ratings."}
              </Text>
              <View style={styles.rowGap8}>
                <Pressable
                  onPress={handleQuickSignIn}
                  style={[
                    styles.authPrimary,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.authPrimaryText,
                      { color: colors.primaryText },
                    ]}
                  >
                    Sign In
                  </Text>
                </Pressable>
                {onRequireAuth && (
                  <Pressable
                    onPress={onRequireAuth}
                    style={[
                      styles.smallBtn,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.smallBtnText, { color: colors.text }]}>
                      Open Login
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {viewMode === "live-chat" ? (
            <View style={styles.flex1}>
              <LiveChatPanel
                shopId={shopId}
                shopName={shopName}
                activeChannel={activeChannel}
                onChannelChange={setActiveChannel}
                currentRole={effectiveRole}
                currentUserName={effectiveUserName}
                isAuthenticated={isAuthenticated}
                authNotice={authNotice}
                onClearAuthNotice={clearAuthNotice}
                onRequireAuth={onRequireAuth}
                onSessionChange={() => setSessionTick((n) => n + 1)}
                messagesByRoom={messagesByRoom}
                remoteTypingByRoom={remoteTypingByRoom}
                onlineCountByRoom={onlineCountByRoom}
                socketConnected={socketConnected}
                joinChatRoom={joinChatRoom}
                leaveChatRoom={leaveChatRoom}
                sendChatMessage={sendChatMessage}
                setTyping={setTyping}
              />
            </View>
          ) : (
            <ScrollView
              style={styles.flex1}
              contentContainerStyle={styles.scrollContent}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: isAuthenticated ? 1 : 0.72,
                  },
                ]}
              >
                <View style={styles.spaceBetween}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Start a Thread in {shopName}
                  </Text>
                  {isAuthenticated && (
                    <Pressable onPress={handleSignOut}>
                      <Text style={[styles.link, { color: colors.textMuted }]}>
                        {effectiveUserName} • Sign out
                      </Text>
                    </Pressable>
                  )}
                </View>

                {giftTitle && (
                  <Text
                    style={[styles.contextNote, { color: colors.textMuted }]}
                  >
                    Context: {giftTitle}
                  </Text>
                )}

                <TextInput
                  value={postTitle}
                  onChangeText={setPostTitle}
                  editable={isAuthenticated}
                  placeholder="Headline (optional)"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.border,
                    },
                  ]}
                />

                <TextInput
                  value={postBody}
                  onChangeText={setPostBody}
                  editable={isAuthenticated}
                  multiline
                  placeholder={
                    isAuthenticated
                      ? "Share feedback, ask a question, or tag another shop..."
                      : "Sign in to write a post..."
                  }
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    styles.bodyInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.border,
                    },
                  ]}
                />

                <View style={styles.inlineRow}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    Rating:
                  </Text>
                  {STARS.map((star) => {
                    const active = selectedRating === star;
                    return (
                      <Pressable
                        key={star}
                        disabled={!isAuthenticated}
                        onPress={() =>
                          setSelectedRating((prev) =>
                            prev === star ? null : star,
                          )
                        }
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active
                              ? colors.primary
                              : colors.surfaceMuted,
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: active ? colors.primaryText : colors.text,
                            },
                          ]}
                        >
                          {star}★
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {availableShops.length > 0 && (
                  <View style={styles.inlineRow}>
                    {availableShops.map((shop) => {
                      const tagged = selectedTagIds.includes(shop.shopId);
                      return (
                        <Pressable
                          key={shop.shopId}
                          disabled={!isAuthenticated}
                          onPress={() => toggleShopTag(shop.shopId)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: tagged
                                ? colors.roleBadgeBg
                                : colors.surfaceMuted,
                              borderColor: tagged
                                ? colors.roleAccent
                                : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: tagged
                                  ? colors.roleBadgeText
                                  : colors.text,
                              },
                            ]}
                          >
                            @{shop.shopName}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <Pressable
                  disabled={!canSubmitPost}
                  onPress={handlePublish}
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor: canSubmitPost
                        ? colors.primary
                        : colors.surfaceMuted,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.submitText,
                      {
                        color: canSubmitPost
                          ? colors.primaryText
                          : colors.textMuted,
                      },
                    ]}
                  >
                    Publish Post
                  </Text>
                </Pressable>
              </View>

              <View style={styles.inlineRow}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Sort:
                </Text>
                {(["top", "new"] as const).map((mode) => {
                  const selected = sortMode === mode;
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setSortMode(mode)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected
                            ? colors.primary
                            : colors.surface,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: selected ? colors.primaryText : colors.text,
                          },
                        ]}
                      >
                        {mode === "top" ? "Top" : "New"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {posts.map((post: ShopDiscussionPost) => {
                const depth = depthByPostId.get(post.id) ?? 0;
                const score = post.upvotes - post.downvotes;
                const userVote = votesByPostId[post.id] ?? null;
                const childCount = repliesCountByPostId[post.id] ?? 0;
                const isCollapsed = Boolean(collapsedPostIds[post.id]);
                const isReplying = replyingToPostId === post.id;

                return (
                  <View
                    key={post.id}
                    style={[
                      styles.card,
                      {
                        marginLeft: depth * 14,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.inlineRow}>
                      <Text style={[styles.author, { color: colors.text }]}>
                        {post.authorName}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: colors.roleBadgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: colors.roleBadgeText },
                          ]}
                        >
                          {post.authorRole.toUpperCase()}
                        </Text>
                      </View>
                      {typeof post.rating === "number" && (
                        <Text
                          style={[styles.ratingText, { color: colors.primary }]}
                        >
                          {post.rating}★
                        </Text>
                      )}
                    </View>

                    {post.title && (
                      <Text style={[styles.postTitle, { color: colors.text }]}>
                        {post.title}
                      </Text>
                    )}

                    <Text style={[styles.postBody, { color: colors.text }]}>
                      {post.body}
                    </Text>

                    {post.taggedShops && post.taggedShops.length > 0 && (
                      <View style={styles.inlineRow}>
                        {post.taggedShops.map((tag) => (
                          <Text
                            key={tag.shopId}
                            style={[
                              styles.tagMention,
                              { color: colors.roleAccent },
                            ]}
                          >
                            @{tag.shopName}
                          </Text>
                        ))}
                      </View>
                    )}

                    <View style={styles.inlineRow}>
                      {(["up", "down"] as const).map((dir) => {
                        const active = userVote === dir;
                        return (
                          <Pressable
                            key={dir}
                            disabled={!isAuthenticated}
                            onPress={() => votePost(post.id, dir)}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active
                                  ? colors.primary
                                  : colors.surfaceMuted,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                {
                                  color: active
                                    ? colors.primaryText
                                    : colors.text,
                                },
                              ]}
                            >
                              {dir === "up" ? `▲ ${score}` : "▼"}
                            </Text>
                          </Pressable>
                        );
                      })}

                      <Pressable
                        onPress={() => {
                          if (!guardAuth()) return;
                          setReplyingToPostId(isReplying ? null : post.id);
                        }}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: colors.surfaceMuted,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: colors.text }]}>
                          Reply
                        </Text>
                      </Pressable>

                      {childCount > 0 && (
                        <Pressable
                          onPress={() => toggleCollapsePost(post.id)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: colors.surfaceMuted,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: colors.textMuted },
                            ]}
                          >
                            {isCollapsed
                              ? `Show ${childCount}`
                              : `Hide (${childCount})`}
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {isReplying && isAuthenticated && (
                      <View style={styles.replyRow}>
                        <TextInput
                          value={replyDrafts[post.id] ?? ""}
                          onChangeText={(txt) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [post.id]: txt,
                            }))
                          }
                          placeholder={`Reply to ${post.authorName}...`}
                          placeholderTextColor={colors.textMuted}
                          style={[
                            styles.input,
                            styles.flex1,
                            {
                              color: colors.text,
                              backgroundColor: colors.surfaceMuted,
                              borderColor: colors.border,
                            },
                          ]}
                        />
                        <Pressable
                          onPress={() => handleReply(post.id)}
                          style={[
                            styles.replyBtn,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.replyBtnText,
                              { color: colors.primaryText },
                            ]}
                          >
                            Send
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  rowGap8: { flexDirection: "row", gap: 8 },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12, fontWeight: "600" },
  smallBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  smallBtnText: { fontSize: 12, fontWeight: "700" },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  modeText: { fontSize: 13, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "600" },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: "700" },
  authBox: { padding: 10, borderRadius: 10, borderWidth: 1, gap: 8 },
  authText: { fontSize: 12, fontWeight: "600" },
  authPrimary: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  authPrimaryText: { fontSize: 12, fontWeight: "700" },
  scrollContent: { gap: 10, paddingBottom: 24 },
  card: { padding: 11, borderRadius: 12, borderWidth: 1, gap: 7 },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  link: { fontSize: 11, textDecorationLine: "underline" },
  contextNote: { fontSize: 11, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  bodyInput: { minHeight: 64, textAlignVertical: "top" },
  submitBtn: {
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
  },
  submitText: { fontSize: 13, fontWeight: "700" },
  author: { fontSize: 12, fontWeight: "700" },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  badgeText: { fontSize: 9, fontWeight: "800" },
  ratingText: { fontSize: 12, fontWeight: "800" },
  postTitle: { fontSize: 14, fontWeight: "700" },
  postBody: { fontSize: 13, lineHeight: 18 },
  tagMention: { fontSize: 11, fontWeight: "700" },
  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  replyBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  replyBtnText: { fontSize: 12, fontWeight: "700" },
});

export default ShopDiscussionDialog;
