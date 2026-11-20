import type {
  AuthRole,
  AuthSessionState,
  AuthUser,
  SendPhoneOtpResult,
  VerifyPhoneOtpInput,
} from "../types/auth.types";

const DEFAULT_SESSION: AuthSessionState = {
  user: null,
  activeRole: "buyer",
  pendingPhone: null,
  otpSent: false,
  isAuthenticated: false,
};

let currentSession: AuthSessionState = { ...DEFAULT_SESSION };
let activeVerificationId: string | null = null;

function delay(ms = 240): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeKenyanPhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("254")) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+254${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) {
    return `+254${digits}`;
  }
  return rawPhone.startsWith("+") ? rawPhone.trim() : `+${digits}`;
}

export function isValidKenyanPhoneNumber(formattedPhone: string): boolean {
  const digits = formattedPhone.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("254");
}

export const authService = {
  async getSession(): Promise<AuthSessionState> {
    await delay(120);
    return {
      ...currentSession,
      user: currentSession.user ? { ...currentSession.user } : null,
    };
  },

  async signInWithGoogle(preferredRole: AuthRole = "buyer"): Promise<AuthUser> {
    await delay(300);
    const now = new Date().toISOString();
    const user: AuthUser = {
      uid: "google-blacsanta-user",
      displayName: "Nairobi Gift Member",
      email: "member@blacsanta.co.ke",
      provider: "google",
      role: preferredRole,
      verifiedAt: now,
    };

    currentSession = {
      user,
      activeRole: preferredRole,
      pendingPhone: null,
      otpSent: false,
      isAuthenticated: true,
    };

    return { ...user };
  },

  async sendPhoneOtp(rawPhone: string): Promise<SendPhoneOtpResult> {
    await delay(260);
    const formattedPhone = normalizeKenyanPhoneNumber(rawPhone);
    if (!isValidKenyanPhoneNumber(formattedPhone)) {
      throw new Error(
        "Enter a valid Kenyan mobile number (e.g., +254712345678 or 0712345678).",
      );
    }

    const verificationId = `ver-${Date.now()}`;
    activeVerificationId = verificationId;

    currentSession = {
      ...currentSession,
      pendingPhone: formattedPhone,
      otpSent: true,
    };

    return {
      phone: formattedPhone,
      verificationId,
      expiresInSeconds: 120,
    };
  },

  async verifyPhoneOtp(
    input: VerifyPhoneOtpInput,
    preferredRole: AuthRole = "buyer",
  ): Promise<AuthUser> {
    await delay(280);
    const formattedPhone = normalizeKenyanPhoneNumber(input.phone);
    const cleanCode = input.code.replace(/\D/g, "").slice(0, 6);

    if (!isValidKenyanPhoneNumber(formattedPhone)) {
      throw new Error("Invalid Kenyan phone number.");
    }
    if (cleanCode.length !== 6) {
      throw new Error("Enter a valid 6-digit SMS verification code.");
    }

    const now = new Date().toISOString();
    const user: AuthUser = {
      uid: `phone-${formattedPhone.replace(/\D/g, "")}`,
      displayName: `BLAC SANTA (${formattedPhone})`,
      phoneNumber: formattedPhone,
      provider: "phone",
      role: preferredRole,
      verifiedAt: now,
    };

    activeVerificationId = null;
    currentSession = {
      user,
      activeRole: preferredRole,
      pendingPhone: null,
      otpSent: false,
      isAuthenticated: true,
    };

    return { ...user };
  },

  async selectRole(role: AuthRole): Promise<AuthUser> {
    await delay(140);
    const now = new Date().toISOString();
    const updatedUser: AuthUser = currentSession.user
      ? {
          ...currentSession.user,
          role,
          assignedShopId: role === "shop" ? "shop-savanna-scents" : undefined,
        }
      : {
          uid: `guest-${role}`,
          displayName:
            role === "admin"
              ? "BLAC SANTA Admin"
              : role === "shop"
                ? "Partner Shop Owner"
                : "Gift Buyer",
          provider: "guest",
          role,
          assignedShopId: role === "shop" ? "shop-savanna-scents" : undefined,
          verifiedAt: now,
        };

    currentSession = {
      ...currentSession,
      user: updatedUser,
      activeRole: role,
      isAuthenticated: true,
    };

    return { ...updatedUser };
  },

  async signOut(): Promise<void> {
    await delay(150);
    activeVerificationId = null;
    currentSession = { ...DEFAULT_SESSION };
  },

  getPendingVerificationId(): string | null {
    return activeVerificationId;
  },
};
