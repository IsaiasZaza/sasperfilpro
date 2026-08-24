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
import { ApiError, fieldErrorsFromDetails } from "@/lib/api";
import { authApi, billingApi } from "@/lib/api-client";
import { hasWorkspaceAccess, parsePlanId, STRIPE_TRIAL_COPY } from "@/lib/billing";
import {
  readClaimedUsername,
  saveClaimedUsername,
  savePendingEmail,
} from "@/lib/claimed-username";
import { normalizeUsername } from "@/lib/reserved-usernames";
import type { Plan, PlanId } from "@/lib/types/billing";
import { needsOnboarding } from "@/lib/types/profile";

export function RegisterForm({
  initialPlan,
  initialUsername,
}: {
  initialPlan?: string;
  initialUsername?: string;
}) {
  const router = useRouter();
  const { ready, user, profile, subscription } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [plan, setPlan] = useState<PlanId>(parsePlanId(initialPlan));
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansError, setPlansError] = useState(false);
  const [trialDays, setTrialDays] = useState(7);
  const [claimed, setClaimed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("u") || params.get("username") || initialUsername;
    const username = normalizeUsername(fromQuery || readClaimedUsername());
    if (!username) return;
    saveClaimedUsername(username);
    setClaimed(username);
  }, [initialUsername]);

  function loadPlans() {
    setPlansError(false);
    void billingApi
      .plans()
      .then((catalog) => {
        setPlans(catalog.plans);
        setTrialDays(catalog.trialDays);
        setPlansError(false);
      })
      .catch(() => {
        setPlansError(true);
      });
  }

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    if (!hasWorkspaceAccess(subscription)) {
      router.replace("/assinatura");
      return;
    }
    router.replace(needsOnboarding(profile) ? "/onboarding" : "/app");
  }, [ready, user, profile, subscription, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "As senhas não coincidem." });
      return;
    }

    setPending(true);
    try {
      const data = await authApi.register({
        name,
        email,
        password,
        confirmPassword,
        plan,
      });
      if (!data.checkoutUrl) {
        setError(
          "Para liberar a conta, cadastre o cartão na Stripe. O checkout não abriu — tente de novo em instantes.",
        );
        return;
      }
      savePendingEmail(email);
      setRedirecting(true);
      window.location.href = data.checkoutUrl;
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_ALREADY_USED") {
        setError(
          "Esse e-mail já tem conta. Faça login ou retome o checkout.",
        );
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Muitas tentativas. Aguarde um momento e tente de novo.");
      } else if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        setFieldErrors(fieldErrorsFromDetails(err.details));
        setError(err.message);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível criar a conta.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  const busy = pending || redirecting;

  return (
    <AuthShell
      wide
      title="Criar conta"
      subtitle={
        claimed
          ? `Depois você confirma o link /u/${claimed}. ${trialDays} dias grátis.`
          : `Começar ${trialDays} dias grátis. O cartão entra na Stripe agora; a cobrança só depois.`
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
          {/* PlanChoice é um radiogroup com aria-label próprio: um Label com
              htmlFor aqui apontaria para lugar nenhum. */}
          <p className="mb-1.5 text-[13px] font-medium text-ink">Plano</p>
          <PlanChoice plans={plans} value={plan} onChange={setPlan} />
          {plansError ? (
            <p className="mt-2 text-[12px] text-red-700">
              Não foi possível carregar os planos.{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-4"
                onClick={() => loadPlans()}
              >
                Tentar de novo
              </button>
            </p>
          ) : (
            <p className="mt-2 text-[12px] text-muted-soft">
              {STRIPE_TRIAL_COPY}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            required
            autoComplete="name"
            autoFocus
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Maria Oliveira"
            className={AUTH_INPUT_CLASS}
          />
          {fieldErrors.name ? (
            <p id="name-error" className="mt-1 text-[12px] text-red-700">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
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
          {fieldErrors.email ? (
            <p id="email-error" className="mt-1 text-[12px] text-red-700">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div>
          <PasswordInput
            id="password"
            label="Senha"
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
            disabled={busy}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-[12px] text-red-700">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
        <div>
          <PasswordInput
            id="confirmPassword"
            label="Confirmar senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repita a senha"
            autoComplete="new-password"
            minLength={8}
            disabled={busy}
          />
          {fieldErrors.confirmPassword ? (
            <p className="mt-1 text-[12px] text-red-700">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>
        <div aria-live="assertive">
          {error ? (
            <p
              role="alert"
              className="panel-in rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
            >
              {error}{" "}
              {error.includes("já tem conta") ? (
                <Link href="/login" className="font-semibold underline">
                  Ir para o login
                </Link>
              ) : null}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="mt-2 w-full" size="lg" disabled={busy}>
          {redirecting
            ? "Abrindo o checkout..."
            : pending
              ? "Criando..."
              : `Cadastrar cartão e começar ${trialDays} dias grátis`}
        </Button>
      </form>
    </AuthShell>
  );
}
