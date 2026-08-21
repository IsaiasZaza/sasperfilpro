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
import { readClaimedUsername, saveClaimedUsername } from "@/lib/claimed-username";
import { normalizeUsername } from "@/lib/reserved-usernames";
import { needsOnboarding } from "@/lib/types/profile";

export function RegisterForm() {
  const router = useRouter();
  const { setSession, refresh, ready, user, profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [claimed, setClaimed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("u") || params.get("username");
    const username = normalizeUsername(fromQuery || readClaimedUsername());
    if (!username) return;
    saveClaimedUsername(username);
    setClaimed(username);
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(needsOnboarding(profile) ? "/onboarding" : "/app");
  }, [ready, user, profile, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await authApi.register({
        name,
        email,
        password,
        confirmPassword: password,
      });
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
        // ok
      }
      router.push("/onboarding");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível criar a conta.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle={
        claimed
          ? `Depois você confirma o link /u/${claimed}.`
          : "Três campos. Depois você monta a página."
      }
      action={{ href: "/login", label: "Entrar" }}
      footer={
        <>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            required
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Maria Oliveira"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
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
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          minLength={8}
        />
        {error ? (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-2 w-full" size="lg" disabled={pending}>
          {pending ? "Criando..." : "Continuar"}
        </Button>
      </form>
    </AuthShell>
  );
}
