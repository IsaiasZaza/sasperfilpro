"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AUTH_INPUT_CLASS } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api-client";

function RecoveryAside() {
  return (
    <div className="max-w-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">
        Acesso
      </p>
      <h2 className="mt-4 font-serif text-[2.35rem] leading-[1.08] text-ink sm:text-[2.7rem]">
        Recupere o acesso à sua página.
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-ink/70">
        Enviamos um link no e-mail da conta. Sem cartão, sem suporte, sem
        espera.
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resent, setResent] = useState(false);

  const sent = Boolean(sentTo);

  async function sendLink(target: string) {
    setPending(true);
    setError(null);
    setResent(false);
    try {
      await authApi.forgotPassword(target);
      setSentTo(target);
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

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await sendLink(email);
  }

  async function resend() {
    if (!sentTo || pending) return;
    await sendLink(sentTo);
    setResent(true);
  }

  return (
    <AuthShell
      title={sent ? "Confira seu e-mail" : "Recuperar senha"}
      subtitle={
        sent
          ? `Se ${sentTo} existir na PerfilPro, o link chega em instantes.`
          : "Informe o e-mail da conta. Se ele existir, enviamos o link para redefinir a senha."
      }
      action={sent ? undefined : { href: "/login", label: "Entrar" }}
      aside={<RecoveryAside />}
      footer={
        sent ? undefined : (
          <>
            Não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              Criar conta
            </Link>
          </>
        )
      }
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink">
            <Mail className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <p className="text-[14px] leading-relaxed text-muted">
            Verifique também a caixa de spam. O link expira.
            {resent ? " Enviamos de novo." : ""}
          </p>
          {error ? (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </p>
          ) : null}
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Voltar ao login</Link>
          </Button>
          <p className="text-center text-[13px] text-muted">
            Não chegou?{" "}
            <button
              type="button"
              className="font-semibold text-ink underline-offset-4 hover:underline disabled:opacity-50"
              onClick={() => void resend()}
              disabled={pending}
            >
              {pending ? "Enviando..." : "Reenviar link"}
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              className={AUTH_INPUT_CLASS}
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
