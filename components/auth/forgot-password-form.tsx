"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar o link.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir sua senha, se o e-mail existir."
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
      {sent ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] leading-relaxed text-muted">
            Se este e-mail existir na PerfilPro, você receberá o link em breve.
            Verifique também a caixa de spam.
          </p>
          <Button asChild variant="secondary" className="w-full" size="lg">
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
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
              className="h-12 rounded-xl border-line/80 bg-[#f7f4ef] shadow-none focus:bg-white"
            />
          </div>
          {error ? (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
