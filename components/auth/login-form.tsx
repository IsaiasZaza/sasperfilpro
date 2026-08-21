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
import { PlanChoice } from "@/components/billing/plan-choice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, isSubscriptionRequired } from "@/lib/api";
import { authApi, billingApi, profileApi } from "@/lib/api-client";
import { hasWorkspaceAccess, trialUsedFromError } from "@/lib/billing";
import {
  clearPendingEmail,
  readPendingEmail,
  savePendingEmail,
} from "@/lib/claimed-username";
import type { Plan, PlanId } from "@/lib/types/billing";
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
  const { setSession, refresh, ready, user, profile, subscription } = useAuth();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [needsCheckout, setNeedsCheckout] = useState(false);
  const [trialUsed, setTrialUsed] = useState<boolean | undefined>();
  const [plan, setPlan] = useState<PlanId>("PRO");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!initialEmail) {
      const stored = readPendingEmail();
      if (stored) setEmail(stored);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (initialCheckout === "success") {
      setInfo("Pagamento aprovado. Agora é só entrar no editor e criar seu perfil.");
      const sessionId = initialSessionId;
      if (sessionId) {
        void billingApi.confirmSession(sessionId).catch(() => {
          // webhook pode já ter sincronizado
        });
      }
    } else if (initialCheckout === "local-trial") {
      setInfo(
        "Ainda falta o cartão na Stripe. Entre e retome o checkout para liberar a conta.",
      );
      setNeedsCheckout(true);
    } else if (initialCheckout === "canceled") {
      setInfo("Checkout cancelado. Você pode tentar de novo.");
    }
  }, [initialCheckout, initialSessionId]);

  useEffect(() => {
    if (!needsCheckout) return;
    void billingApi
      .plans()
      .then((catalog) => setPlans(catalog.plans))
      .catch(() => undefined);
  }, [needsCheckout]);

  useEffect(() => {
    if (!ready || !user) return;
    if (!hasWorkspaceAccess(subscription)) {
      router.replace("/assinatura");
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
    let nextProfile = null;
    try {
      nextProfile = await profileApi.get();
    } catch {
      nextProfile = null;
    }
    clearPendingEmail();
    setSession(result.user, nextProfile, result.subscription);
    try {
      await refresh();
    } catch {
      // sessão já setada localmente
    }
    const fallback = hasWorkspaceAccess(result.subscription)
      ? needsOnboarding(nextProfile)
        ? "/onboarding"
        : "/app"
      : "/assinatura";
    router.push(safeNext() || fallback);
  }

  async function resumeCheckout() {
    setPending(true);
    setError(null);
    try {
      const data = await billingApi.checkout({
        email,
        password,
        plan,
      });
      if (!data.checkoutUrl) {
        setError(
          "O checkout da Stripe não abriu. Sem cartão a conta não é liberada. Tente de novo.",
        );
        return;
      }
      savePendingEmail(email);
      setRedirecting(true);
      window.location.href = data.checkoutUrl;
    } catch (err) {
      if (err instanceof ApiError && err.code === "ALREADY_SUBSCRIBED") {
        await enterApp().catch(() => router.push("/app"));
        return;
      }
      if (err instanceof ApiError && err.code === "USE_CHANGE_PLAN") {
        setError("Você já tem outro plano. Entre e gerencie em Assinatura.");
        setNeedsCheckout(false);
        return;
      }
      if (err instanceof ApiError && err.status === 401) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      if (err instanceof ApiError && err.status === 429) {
        setError("Muitas tentativas. Aguarde um momento e tente de novo.");
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível abrir o checkout.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (needsCheckout) {
      await resumeCheckout();
      return;
    }
    setPending(true);
    setError(null);
    try {
      await enterApp();
    } catch (err) {
      if (isSubscriptionRequired(err)) {
        setNeedsCheckout(true);
        setTrialUsed(trialUsedFromError(err));
        setError(null);
        setInfo(
          "Sua conta está pronta. Escolha Pro ou Premium para entrar.",
        );
        void billingApi
          .plans()
          .then((catalog) => setPlans(catalog.plans))
          .catch(() => undefined);
        return;
      }
      if (err instanceof ApiError && err.status === 429) {
        setError("Muitas tentativas. Aguarde um momento e tente de novo.");
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
  const checkoutCopy =
    trialUsed === true
      ? "Sua assinatura não está ativa. Assine de novo para entrar."
      : "Escolha um plano. Os 7 primeiros dias são grátis.";

  return (
    <AuthShell
      wide={needsCheckout}
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
        {info ? (
          <p className="rounded-xl bg-lime/40 px-3.5 py-2.5 text-[13px] text-ink">
            {info}
          </p>
        ) : null}
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
        {needsCheckout ? (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-muted">{checkoutCopy}</p>
            <PlanChoice plans={plans} value={plan} onChange={setPlan} />
          </div>
        ) : null}
        {error ? (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="mt-2 w-full"
          size="lg"
          disabled={pending || redirecting}
        >
          {redirecting
            ? "Abrindo o checkout..."
            : pending
              ? needsCheckout
                ? "Abrindo..."
                : "Entrando..."
              : needsCheckout
                ? trialUsed
                  ? "Cadastrar cartão na Stripe"
                  : "Cadastrar cartão e começar grátis"
                : checkoutSuccess
                  ? "Entrar no app"
                  : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
