"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api-client";

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Link inválido. Solicite uma nova recuperação de senha.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setPending(true);
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Nova senha"
      subtitle="Escolha uma senha forte para proteger sua conta."
      action={{ href: "/login", label: "Entrar" }}
      footer={
        <Link
          href="/login"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Voltar ao login
        </Link>
      }
    >
      {done ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] text-muted">
            Senha atualizada. Você já pode entrar com a nova senha.
          </p>
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={() => router.push("/login")}
          >
            Ir para o login
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <PasswordInput
            id="password"
            label="Nova senha"
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirmar senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repita a senha"
            autoComplete="new-password"
            minLength={8}
          />
          {error ? (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Nova senha" subtitle="Carregando...">
          <div className="h-40 animate-pulse rounded-xl bg-line/50" />
        </AuthShell>
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
