import type { DiscussionParticipantRole } from "../features/shop-discussion/types/shop-discussion.types";
import {
  loadPersistedAuthSession,
  savePersistedAuthSession,
  type PersistedAuthSession,
} from "./storage";

export interface FirebaseEnvConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseEnvConfig {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

export function isFirebaseConfigured(): boolean {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.projectId && cfg.appId);
}

export function getActiveAuthUser(): PersistedAuthSession {
  const saved = loadPersistedAuthSession();
  if (saved) {
    return saved;
  }
  return {
    id: "guest",
    name: "Guest",
    role: "buyer",
    isAuthenticated: false,
  };
}

export function signInDemoUser(params: {
  id?: string;
  name: string;
  role: DiscussionParticipantRole;
  ownedShopId?: string;
}): PersistedAuthSession {
  const session: PersistedAuthSession = {
    id: params.id ?? `user_${Date.now()}`,
    name: params.name.trim() || "Member",
    role: params.role,
    isAuthenticated: true,
    ownedShopId: params.ownedShopId,
  };
  savePersistedAuthSession(session);
  return session;
}

export function signOutCurrentUser(): void {
  savePersistedAuthSession(null);
}

export default {
  getFirebaseConfig,
  isFirebaseConfigured,
  getActiveAuthUser,
  signInDemoUser,
  signOutCurrentUser,
};
