"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AUTH_INPUT_CLASS,
  PasswordInput,
} from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authApi, profileApi } from "@/lib/api-client";
import { needsOnboarding } from "@/lib/types/profile";

export function LoginForm() {
  const router = useRouter();
  const { setSession, refresh, ready, user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(needsOnboarding(profile) ? "/onboarding" : "/app");
  }, [ready, user, profile, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await authApi.login({ email, password });
      let nextProfile = null;
      try {
        nextProfile = await profileApi.get();
      } catch {
        nextProfile = null;
      }
      setSession(result.user, nextProfile);
      try {
        await refresh();
      } catch {
        // sessão já setada localmente
      }
      router.push(needsOnboarding(nextProfile) ? "/onboarding" : "/app");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível entrar.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua página e continue editando."
      action={{ href: "/cadastro", label: "Criar página" }}
      footer={
        <>
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Criar página
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <PasswordInput
          id="password"
          label="Senha"
          value={password}
          onChange={setPassword}
          placeholder="Sua senha"
          autoComplete="current-password"
          extra={
            <Link
              href="/recuperar-senha"
              className="text-[12px] font-medium text-muted hover:text-ink"
            >
              Esqueci
            </Link>
          }
        />
        {error ? (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-2 w-full" size="lg" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
        {process.env.NODE_ENV === "development" ? (
          <button
            type="button"
            className="w-full text-center text-[12px] text-muted-soft hover:text-ink"
            onClick={() => {
              setEmail("maria@demo.com");
              setPassword("Demo1234!");
            }}
          >
            Conta demo
          </button>
        ) : null}
      </form>
    </AuthShell>
  );
}
