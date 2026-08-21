"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ApiError,
  isSubscriptionRequired,
  setSubscriptionRequiredHandler,
} from "@/lib/api";
import { authApi, profileApi } from "@/lib/api-client";
import { EMPTY_SUBSCRIPTION } from "@/lib/types/billing";
import type { Subscription } from "@/lib/types/billing";
import type { AuthUser, Profile } from "@/lib/types/profile";

type AuthContextValue = {
  ready: boolean;
  user: AuthUser | null;
  profile: Profile | null;
  subscription: Subscription;
  sessionError: string | null;
  refresh: () => Promise<void>;
  setSession: (
    user: AuthUser,
    profile?: Profile | null,
    subscription?: Subscription | null,
  ) => void;
  setProfile: (profile: Profile | null) => void;
  setSubscription: (subscription: Subscription) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function dropToPlansIfInApp() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
    if (path.startsWith("/app") || path.startsWith("/onboarding") || path.startsWith("/assinatura")) {
    window.location.replace("/planos?reason=expired");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] =
    useState<Subscription>(EMPTY_SUBSCRIPTION);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const clearLocalSession = useCallback(() => {
    setUser(null);
    setProfile(null);
    setSubscription(EMPTY_SUBSCRIPTION);
    setSessionError(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser({
        id: me.id,
        name: me.name,
        email: me.email,
        emailVerifiedAt: me.emailVerifiedAt,
        createdAt: me.createdAt,
      });
      setSubscription(me.subscription ?? EMPTY_SUBSCRIPTION);
      setSessionError(null);

      if (me.subscription && !me.subscription.grantsAccess) {
        clearLocalSession();
        dropToPlansIfInApp();
        return;
      }

      try {
        const full = await profileApi.get();
        setProfile(full);
      } catch {
        setProfile(me.profile ?? null);
      }
    } catch (error) {
      if (
        (error instanceof ApiError && error.status === 401) ||
        isSubscriptionRequired(error)
      ) {
        clearLocalSession();
        if (isSubscriptionRequired(error)) dropToPlansIfInApp();
      } else {
        setSessionError(
          error instanceof ApiError
            ? error.message
            : "Não foi possível sincronizar a sessão.",
        );
      }
    } finally {
      setReady(true);
    }
  }, [clearLocalSession]);

  useEffect(() => {
    setSubscriptionRequiredHandler(() => {
      clearLocalSession();
      dropToPlansIfInApp();
    });
    return () => setSubscriptionRequiredHandler(null);
  }, [clearLocalSession]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      profile,
      subscription,
      sessionError,
      refresh,
      setSession: (nextUser, nextProfile, nextSubscription) => {
        setUser(nextUser);
        setSessionError(null);
        if (nextProfile !== undefined) setProfile(nextProfile);
        if (nextSubscription) setSubscription(nextSubscription);
      },
      setProfile,
      setSubscription,
      clearSession: clearLocalSession,
    }),
    [ready, user, profile, subscription, sessionError, refresh, clearLocalSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
