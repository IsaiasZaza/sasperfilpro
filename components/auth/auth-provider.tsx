"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError } from "@/lib/api";
import { authApi, profileApi } from "@/lib/api-client";
import type { AuthUser, Profile } from "@/lib/types/profile";

type AuthContextValue = {
  ready: boolean;
  user: AuthUser | null;
  profile: Profile | null;
  sessionError: string | null;
  refresh: () => Promise<void>;
  setSession: (user: AuthUser, profile?: Profile | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

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
      setSessionError(null);

      try {
        const full = await profileApi.get();
        setProfile(full);
      } catch {
        setProfile(me.profile ?? null);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setProfile(null);
        setSessionError(null);
      } else {
        // Não desloga em erro de rede / 5xx — mantém sessão se já houver.
        setSessionError(
          error instanceof ApiError
            ? error.message
            : "Não foi possível sincronizar a sessão.",
        );
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      profile,
      sessionError,
      refresh,
      setSession: (nextUser, nextProfile) => {
        setUser(nextUser);
        setSessionError(null);
        if (nextProfile !== undefined) setProfile(nextProfile);
      },
      setProfile,
      clearSession: () => {
        setUser(null);
        setProfile(null);
        setSessionError(null);
      },
    }),
    [ready, user, profile, sessionError, refresh],
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
