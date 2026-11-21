import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../../hooks/use-theme";
import { signInDemoUser, signOutCurrentUser } from "../../../lib/firebase";
import { buildShopRoomKey } from "../../../lib/linking";
import type { LiveChatMessagePayload } from "../services/socket";
import type { DiscussionParticipantRole } from "../types/shop-discussion.types";

export type LiveChatChannelMode = "room" | "direct-buyer" | "direct-admin";

export interface LiveChatPanelProps {
  shopId: string;
  shopName?: string;
  activeChannel?: LiveChatChannelMode;
  onChannelChange?: (channel: LiveChatChannelMode) => void;
  currentRole?: DiscussionParticipantRole;
  currentUserName?: string;
  isAuthenticated: boolean;
  authNotice?: string | null;
  onClearAuthNotice?: () => void;
  onRequireAuth?: () => void;
  onSessionChange?: () => void;
  messagesByRoom: Record<string, LiveChatMessagePayload[]>;
  remoteTypingByRoom: Record<string, string | null>;
  onlineCountByRoom: Record<string, number>;
  socketConnected?: boolean;
  joinChatRoom: (roomKey: string) => void;
  leaveChatRoom: (roomKey: string) => void;
  sendChatMessage: (params: {
    roomKey: string;
    body: string;
    senderName?: string;
    senderRole?: DiscussionParticipantRole;
    taggedShopNames?: string[];
  }) => LiveChatMessagePayload | null;
  setTyping: (params: {
    roomKey: string;
    isTyping: boolean;
    senderName?: string;
    senderRole?: DiscussionParticipantRole;
  }) => void;
}

const CHANNELS: { key: LiveChatChannelMode; label: string; desc: string }[] = [
  { key: "room", label: "Shop Room", desc: "Shared live room for this shop" },
  {
    key: "direct-buyer",
    label: "Buyer ↔ Shop",
    desc: "Direct buyer-to-shop channel",
  },
  {
    key: "direct-admin",
    label: "Admin ↔ Shop",
    desc: "Direct admin-to-shop channel",
  },
];

const ROLE_LABELS: Record<DiscussionParticipantRole, string> = {
  admin: "ADMIN",
  shop: "SHOP OWNER",
  buyer: "BUYER",
};

function formatClock(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function LiveChatPanel({
  shopId,
  shopName = "Shop",
  activeChannel = "room",
  onChannelChange,
  currentRole = "buyer",
  currentUserName = "Buyer",
  isAuthenticated,
  authNotice,
  onClearAuthNotice,
  onRequireAuth,
  onSessionChange,
  messagesByRoom,
  remoteTypingByRoom,
  onlineCountByRoom,
  socketConnected = false,
  joinChatRoom,
  leaveChatRoom,
  sendChatMessage,
  setTyping,
}: LiveChatPanelProps) {
  const { colors } = useTheme({ role: currentRole });
  const [draft, setDraft] = useState("");

  const roomKey = useMemo(
    () => buildShopRoomKey(shopId, activeChannel),
    [shopId, activeChannel],
  );

  useEffect(() => {
    joinChatRoom(roomKey);
    return () => {
      setTyping({
        roomKey,
        isTyping: false,
        senderName: currentUserName,
        senderRole: currentRole,
      });
      leaveChatRoom(roomKey);
    };
  }, [
    roomKey,
    joinChatRoom,
    leaveChatRoom,
    setTyping,
    currentUserName,
    currentRole,
  ]);

  const messages = messagesByRoom[roomKey] ?? [];
  const typingText = remoteTypingByRoom[roomKey] ?? null;
  const onlineCount = onlineCountByRoom[roomKey] ?? 1;
  const channelInfo =
    CHANNELS.find((c) => c.key === activeChannel) ?? CHANNELS[0];

  const handleDraftChange = (text: string) => {
    setDraft(text);
    if (!isAuthenticated) return;
    setTyping({
      roomKey,
      isTyping: text.trim().length > 0,
      senderName: currentUserName,
      senderRole: currentRole,
    });
  };

  const handleSend = () => {
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
    const body = draft.trim();
    if (!body) return;
    const sent = sendChatMessage({
      roomKey,
      body,
      senderName: currentUserName,
      senderRole: currentRole,
    });
    if (sent) {
      setDraft("");
      onClearAuthNotice?.();
    }
  };

  const handleSignIn = () => {
    signInDemoUser({ name: currentUserName || "Member", role: currentRole });
    onClearAuthNotice?.();
    onSessionChange?.();
  };

  const handleSignOut = () => {
    signOutCurrentUser();
    onSessionChange?.();
  };

  const canSend = isAuthenticated && draft.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surfaceMuted,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.flex1}>
            <Text style={[styles.title, { color: colors.text }]}>
              {shopName} • {channelInfo.label}
            </Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>
              {channelInfo.desc} ({roomKey})
            </Text>
          </View>
          <View style={styles.presenceRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: socketConnected ? "#16A34A" : colors.accent,
                },
              ]}
            />
            <Text style={[styles.presenceText, { color: colors.textMuted }]}>
              {onlineCount} online
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.channelRow}
        >
          {CHANNELS.map((ch) => {
            const selected = ch.key === activeChannel;
            return (
              <Pressable
                key={ch.key}
                onPress={() => onChannelChange?.(ch.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selected ? colors.primaryText : colors.text },
                  ]}
                >
                  {ch.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {(!isAuthenticated || authNotice) && (
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
              "Anonymous chatting is disabled. Sign in to send messages in this shop."}
          </Text>
          <View style={styles.rowGap8}>
            <Pressable
              onPress={handleSignIn}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[styles.primaryBtnText, { color: colors.primaryText }]}
              >
                Sign In ({ROLE_LABELS[currentRole]})
              </Text>
            </Pressable>
            {onRequireAuth && (
              <Pressable
                onPress={onRequireAuth}
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                  Auth Screen
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.listContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No live messages in {channelInfo.label} yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              {isAuthenticated
                ? `Start the conversation for ${shopName}.`
                : `Sign in first to chat in ${shopName}'s ${channelInfo.label}.`}
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isMine =
              isAuthenticated &&
              msg.senderName.trim().toLowerCase() ===
                currentUserName.trim().toLowerCase();

            return (
              <View
                key={msg.id}
                style={[
                  styles.bubbleWrap,
                  isMine ? styles.mineAlign : styles.otherAlign,
                ]}
              >
                <View style={styles.metaRow}>
                  <Text style={[styles.sender, { color: colors.text }]}>
                    {msg.senderName}
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
                      {ROLE_LABELS[msg.senderRole]}
                    </Text>
                  </View>
                  <Text style={[styles.time, { color: colors.textMuted }]}>
                    {formatClock(msg.createdAt)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: isMine
                        ? colors.primary
                        : colors.surfaceMuted,
                      borderColor: isMine ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: isMine ? colors.primaryText : colors.text },
                    ]}
                  >
                    {msg.body}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footerMeta}>
        <Text style={[styles.typingText, { color: colors.textMuted }]}>
          {typingText ?? " "}
        </Text>
        {isAuthenticated && (
          <Pressable onPress={handleSignOut}>
            <Text style={[styles.signOutText, { color: colors.textMuted }]}>
              {currentUserName} • Sign out
            </Text>
          </Pressable>
        )}
      </View>

      <View
        style={[
          styles.composer,
          { borderTopColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={handleDraftChange}
          editable={isAuthenticated}
          multiline
          maxLength={600}
          onSubmitEditing={handleSend}
          placeholder={
            isAuthenticated
              ? `Message ${shopName} (${channelInfo.label})...`
              : "Sign in to send live chat messages..."
          }
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
              opacity: isAuthenticated ? 1 : 0.65,
            },
          ]}
        />
        <Pressable
          disabled={!canSend}
          onPress={handleSend}
          style={[
            styles.sendBtn,
            {
              backgroundColor: canSend ? colors.primary : colors.surfaceMuted,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sendText,
              { color: canSend ? colors.primaryText : colors.textMuted },
            ]}
          >
            Send
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  rowGap8: { flexDirection: "row", gap: 8, alignItems: "center" },
  container: { flex: 1, borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  header: { padding: 12, borderBottomWidth: 1, gap: 10 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 11 },
  presenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 999 },
  presenceText: { fontSize: 11, fontWeight: "600" },
  channelRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
  authBox: {
    margin: 10,
    marginBottom: 0,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  authText: { fontSize: 12, fontWeight: "600" },
  primaryBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  primaryBtnText: { fontSize: 12, fontWeight: "700" },
  secondaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 12, fontWeight: "600" },
  listContent: { padding: 12, gap: 10, flexGrow: 1 },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    gap: 4,
  },
  emptyTitle: { fontSize: 14, fontWeight: "700" },
  emptySub: { fontSize: 12, textAlign: "center" },
  bubbleWrap: { maxWidth: "85%", gap: 4 },
  mineAlign: { alignSelf: "flex-end" },
  otherAlign: { alignSelf: "flex-start" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  sender: { fontSize: 11, fontWeight: "700" },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: "800" },
  time: { fontSize: 10 },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  footerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 22,
  },
  typingText: { fontSize: 11, fontStyle: "italic" },
  signOutText: { fontSize: 11, textDecorationLine: "underline" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 96,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  sendBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { fontSize: 13, fontWeight: "700" },
});

export default LiveChatPanel;
