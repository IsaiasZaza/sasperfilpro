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
import { authApi, billingApi, profileApi } from "@/lib/api-client";
import { hasWorkspaceAccess } from "@/lib/billing";
import { clearPendingEmail, readPendingEmail } from "@/lib/claimed-username";
import { persistSessionCookie } from "@/lib/session";
import { needsOnboarding } from "@/lib/types/profile";

export function LoginForm({
  initialCheckout,
  initialSessionId,
  initialEmail,
  nextPath,
}: {
  initialCheckout?: string;
  initialSessionId?: string;
  initialEmail?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const { setSession, ready, user, profile, subscription } = useAuth();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!initialEmail) {
      const stored = readPendingEmail();
      if (stored) setEmail(stored);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (initialCheckout === "success") {
      setInfo("Pagamento aprovado. Entre para abrir o painel.");
      const sessionId = initialSessionId;
      if (sessionId) {
        void billingApi.confirmSession(sessionId).catch(() => {
          // webhook pode já ter sincronizado
        });
      }
    } else if (initialCheckout === "canceled") {
      setInfo("Checkout cancelado. Você pode tentar de novo em Planos.");
    }
  }, [initialCheckout, initialSessionId]);

  useEffect(() => {
    if (!ready || !user) return;
    if (!hasWorkspaceAccess(subscription)) {
      router.replace("/planos?reason=expired");
      return;
    }
    const fallback = needsOnboarding(profile) ? "/onboarding" : "/app";
    const target =
      nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : fallback;
    router.replace(target);
  }, [ready, user, profile, subscription, router, nextPath]);

  function safeNext() {
    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      return nextPath;
    }
    return null;
  }

  async function enterApp() {
    const result = await authApi.login({ email, password });
    if (result.accessToken) {
      await persistSessionCookie(result.accessToken);
    }
    let nextProfile = null;
    try {
      nextProfile = await profileApi.get();
    } catch {
      nextProfile = null;
    }
    clearPendingEmail();
    setSession(result.user, nextProfile, result.subscription);
    const fallback = hasWorkspaceAccess(result.subscription)
      ? needsOnboarding(nextProfile)
        ? "/onboarding"
        : "/app"
      : "/planos?reason=expired";
    window.location.assign(safeNext() || fallback);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await enterApp();
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Muitas tentativas. Aguarde um momento e tente de novo.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(
          err instanceof ApiError ? err.message : "Não foi possível entrar.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  const checkoutSuccess = initialCheckout === "success";

  return (
    <AuthShell
      title={checkoutSuccess ? "Pagamento ok" : "Entrar"}
      subtitle={
        checkoutSuccess
          ? "Entre para abrir o editor."
          : "Acesse sua página e continue editando."
      }
      action={{ href: "/cadastro", label: "Criar conta" }}
      footer={
        <>
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div aria-live="polite">
          {info ? (
            <p className="panel-in rounded-xl bg-lime/40 px-3.5 py-2.5 text-[13px] text-ink">
              {info}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            disabled={pending}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            className={AUTH_INPUT_CLASS}
            title="Informe um e-mail válido"
            onInvalid={(event) => {
              const input = event.currentTarget;
              if (input.validity.valueMissing) {
                input.setCustomValidity("Informe seu e-mail.");
              } else if (input.validity.typeMismatch) {
                input.setCustomValidity("Informe um e-mail válido.");
              } else {
                input.setCustomValidity("");
              }
            }}
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
        </div>
        <PasswordInput
          id="password"
          label="Senha"
          value={password}
          onChange={setPassword}
          placeholder="Sua senha"
          autoComplete="current-password"
          disabled={pending}
        />
        <div aria-live="assertive">
          {error ? (
            <p
              role="alert"
              className="panel-in rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
            >
              {error}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="mt-2 w-full" size="lg" disabled={pending}>
          {pending
            ? "Entrando..."
            : checkoutSuccess
              ? "Entrar no app"
              : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
