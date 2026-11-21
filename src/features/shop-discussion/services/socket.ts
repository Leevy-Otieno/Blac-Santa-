import type {
  ShopDiscussionPost,
  ThreadVoteDirection,
} from "../types/shop-discussion.types";

export interface LiveChatMessagePayload {
  id: string;
  shopId: string;
  roomKey: string;
  senderName: string;
  senderRole: "buyer" | "shop" | "admin";
  body: string;
  createdAt: string;
  taggedShopNames?: string[];
}

export type SocketIncomingEvent =
  | { type: "post:created"; post: ShopDiscussionPost }
  | {
      type: "post:voted";
      postId: string;
      direction: ThreadVoteDirection;
      upvotes?: number;
      downvotes?: number;
    }
  | {
      type: "chat:message";
      message: LiveChatMessagePayload;
    }
  | {
      type: "chat:typing";
      roomKey: string;
      senderName: string;
      senderRole: "buyer" | "shop" | "admin";
      isTyping: boolean;
    }
  | {
      type: "chat:presence";
      roomKey: string;
      onlineCount: number;
      activeUsers?: string[];
    }
  | { type: "socket:status"; connected: boolean };

type EventHandler = (event: SocketIncomingEvent) => void;

class FrontendSocketClient {
  private ws: WebSocket | null = null;
  private url: string | null = null;
  private currentRoom: string | null = null;
  private handlers = new Set<EventHandler>();

  /** Connect to your backend WebSocket URL when ready; safe to call with undefined now */
  connect(url?: string, roomId?: string): void {
    if (roomId) {
      this.currentRoom = roomId;
    }

    if (!url) {
      return;
    }

    if (this.url === url && this.ws && this.ws.readyState <= WebSocket.OPEN) {
      if (this.currentRoom) {
        this.joinRoom(this.currentRoom);
      }
      return;
    }

    this.disconnect();
    this.url = url;

    const socket = new WebSocket(url);
    this.ws = socket;

    socket.onopen = () => {
      this.emitLocal({ type: "socket:status", connected: true });
      if (this.currentRoom) {
        this.joinRoom(this.currentRoom);
      }
    };

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(String(message.data)) as {
          event?: string;
          payload?: Record<string, unknown>;
        };

        if (data.event === "post:created" && data.payload) {
          this.emitLocal({
            type: "post:created",
            post: data.payload as unknown as ShopDiscussionPost,
          });
        } else if (data.event === "post:voted" && data.payload) {
          this.emitLocal({
            type: "post:voted",
            postId: String(data.payload.postId ?? ""),
            direction: data.payload.direction === "down" ? "down" : "up",
            upvotes:
              typeof data.payload.upvotes === "number"
                ? data.payload.upvotes
                : undefined,
            downvotes:
              typeof data.payload.downvotes === "number"
                ? data.payload.downvotes
                : undefined,
          });
        } else if (data.event === "chat:message" && data.payload) {
          this.emitLocal({
            type: "chat:message",
            message: data.payload as unknown as LiveChatMessagePayload,
          });
        } else if (data.event === "chat:typing" && data.payload) {
          const role =
            data.payload.senderRole === "shop" ||
            data.payload.senderRole === "admin"
              ? data.payload.senderRole
              : "buyer";
          this.emitLocal({
            type: "chat:typing",
            roomKey: String(data.payload.roomKey ?? ""),
            senderName: String(data.payload.senderName ?? "Someone"),
            senderRole: role,
            isTyping: Boolean(data.payload.isTyping),
          });
        } else if (data.event === "chat:presence" && data.payload) {
          this.emitLocal({
            type: "chat:presence",
            roomKey: String(data.payload.roomKey ?? ""),
            onlineCount:
              typeof data.payload.onlineCount === "number"
                ? data.payload.onlineCount
                : 1,
            activeUsers: Array.isArray(data.payload.activeUsers)
              ? data.payload.activeUsers.map(String)
              : undefined,
          });
        }
      } catch {
        // Ignore non-JSON or malformed frames
      }
    };

    socket.onclose = () => {
      if (this.ws === socket) {
        this.ws = null;
      }
      this.emitLocal({ type: "socket:status", connected: false });
    };

    socket.onerror = () => {
      this.emitLocal({ type: "socket:status", connected: false });
    };
  }

  disconnect(): void {
    if (this.ws && this.currentRoom) {
      this.leaveRoom(this.currentRoom);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.url = null;
  }

  joinRoom(roomId: string): void {
    this.currentRoom = roomId;
    this.send({ event: "thread:join", payload: { roomId } });
  }

  leaveRoom(roomId: string): void {
    this.send({ event: "thread:leave", payload: { roomId } });
    if (this.currentRoom === roomId) {
      this.currentRoom = null;
    }
  }

  sendChatMessage(message: LiveChatMessagePayload): void {
    this.send({ event: "chat:message", payload: message });
  }

  sendTypingStatus(params: {
    roomKey: string;
    senderName: string;
    senderRole: "buyer" | "shop" | "admin";
    isTyping: boolean;
  }): void {
    this.send({ event: "chat:typing", payload: params });
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  send(data: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify(data));
  }

  private emitLocal(event: SocketIncomingEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}

export const socketClient = new FrontendSocketClient();
export default socketClient;
