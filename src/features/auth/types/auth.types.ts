export type AuthRole = "buyer" | "shop" | "admin";

export type AuthProviderType = "google" | "phone" | "guest";

export interface AuthUser {
  uid: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  provider: AuthProviderType;
  role: AuthRole;
  assignedShopId?: string;
  verifiedAt: string;
}

export interface AuthSessionState {
  user: AuthUser | null;
  activeRole: AuthRole;
  pendingPhone: string | null;
  otpSent: boolean;
  isAuthenticated: boolean;
}

export interface SendPhoneOtpResult {
  phone: string;
  verificationId: string;
  expiresInSeconds: number;
}

export interface VerifyPhoneOtpInput {
  phone: string;
  code: string;
  verificationId?: string;
}
