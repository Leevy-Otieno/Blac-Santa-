import { useCallback, useEffect, useState } from "react";
import { authService } from "../services/auth-service";
import type {
  AuthRole,
  AuthSessionState,
  AuthUser,
  SendPhoneOtpResult,
} from "../types/auth.types";

export interface UseAuthReturn {
  user: AuthUser | null;
  activeRole: AuthRole;
  pendingPhone: string | null;
  otpSent: boolean;
  isAuthenticated: boolean;
  initializing: boolean;
  submitting: boolean;
  error: string | null;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  signInWithGoogle: (preferredRole?: AuthRole) => Promise<AuthUser | null>;
  sendPhoneOtp: (phone: string) => Promise<SendPhoneOtpResult | null>;
  verifyPhoneOtp: (
    phone: string,
    code: string,
    preferredRole?: AuthRole,
  ) => Promise<AuthUser | null>;
  selectRole: (role: AuthRole) => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSessionState>({
    user: null,
    activeRole: "buyer",
    pendingPhone: null,
    otpSent: false,
    isAuthenticated: false,
  });
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      const current = await authService.getSession();
      setSession(current);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to restore session.",
      );
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(
    async (preferredRole: AuthRole = "buyer"): Promise<AuthUser | null> => {
      try {
        setError(null);
        setSubmitting(true);
        const signedInUser = await authService.signInWithGoogle(preferredRole);
        setSession((prev) => ({
          ...prev,
          user: signedInUser,
          activeRole: signedInUser.role,
          pendingPhone: null,
          otpSent: false,
          isAuthenticated: true,
        }));
        return signedInUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed.");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const sendPhoneOtp = useCallback(
    async (phone: string): Promise<SendPhoneOtpResult | null> => {
      try {
        setError(null);
        setSubmitting(true);
        const result = await authService.sendPhoneOtp(phone);
        setSession((prev) => ({
          ...prev,
          pendingPhone: result.phone,
          otpSent: true,
        }));
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send OTP code.",
        );
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const verifyPhoneOtp = useCallback(
    async (
      phone: string,
      code: string,
      preferredRole: AuthRole = "buyer",
    ): Promise<AuthUser | null> => {
      try {
        setError(null);
        setSubmitting(true);
        const verifiedUser = await authService.verifyPhoneOtp(
          { phone, code },
          preferredRole,
        );
        setSession((prev) => ({
          ...prev,
          user: verifiedUser,
          activeRole: verifiedUser.role,
          pendingPhone: null,
          otpSent: false,
          isAuthenticated: true,
        }));
        return verifiedUser;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "OTP verification failed.",
        );
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const selectRole = useCallback(
    async (role: AuthRole): Promise<AuthUser | null> => {
      try {
        setError(null);
        setSubmitting(true);
        const updatedUser = await authService.selectRole(role);
        setSession((prev) => ({
          ...prev,
          user: updatedUser,
          activeRole: role,
          isAuthenticated: true,
        }));
        return updatedUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to switch role.");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setSubmitting(true);
      await authService.signOut();
      setSession({
        user: null,
        activeRole: "buyer",
        pendingPhone: null,
        otpSent: false,
        isAuthenticated: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    user: session.user,
    activeRole: session.activeRole,
    pendingPhone: session.pendingPhone,
    otpSent: session.otpSent,
    isAuthenticated: session.isAuthenticated,
    initializing,
    submitting,
    error,
    clearError,
    refreshSession,
    signInWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    selectRole,
    signOut,
  };
}
