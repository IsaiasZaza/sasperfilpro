"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authApi, profileApi } from "@/lib/api-client";
import { needsOnboarding } from "@/lib/types/profile";

export function RegisterForm() {
  const router = useRouter();
  const { setSession, refresh, ready, user, profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(needsOnboarding(profile) ? "/onboarding" : "/app");
  }, [ready, user, profile, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setPending(true);
    try {
      const result = await authApi.register({
        name,
        email,
        password,
        confirmPassword,
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
      subtitle="Monte sua página profissional em minutos."
      footer={
        <>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-ink underline-offset-4 hover:underline"
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Maria Oliveira"
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
          />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repita a senha"
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Criando..." : "Criar minha página"}
        </Button>
      </form>
    </AuthShell>
  );
}
