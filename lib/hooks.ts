"use client";

import { useAuth } from "@/components/auth/auth-provider";

export function useAuthGate() {
  const { ready, user, profile } = useAuth();
  return {
    ready,
    session: user
      ? { userId: user.id, email: user.email, name: user.name }
      : null,
    profile,
    user,
  };
}

export function useHydrated() {
  const { ready } = useAuth();
  return ready;
}
