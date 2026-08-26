"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { CheckoutDialog } from "@/components/billing/checkout-dialog";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { billingApi } from "@/lib/api-client";
import {
  CANCEL_TO_FREE_COPY,
  entitlementsOf,
  formatPtDate,
  goToCheckout,
  isPaidPlanId,
  otherPaidPlanId,
  planById,
  subscriptionStatusLabel,
} from "@/lib/billing";
import type {
  Entitlements,
  PaidPlanId,
  Plan,
  Subscription,
} from "@/lib/types/billing";
import { EMPTY_SUBSCRIPTION } from "@/lib/types/billing";
import { cn } from "@/lib/utils";

type ToastState = { text: string; variant: ToastVariant };

function capLabel(limit: number | null, singular: string, plural: string) {
  if (limit == null) {
    const word = plural.charAt(0).toUpperCase() + plural.slice(1);
    return `${word} ilimitados`;
  }
  return `${limit} ${limit === 1 ? singular : plural}`;
}

function includedLines(entitlements: Entitlements) {
  return [
    capLabel(entitlements.maxBlocks, "bloco", "blocos"),
    capLabel(entitlements.maxServices, "serviço", "serviços"),
    capLabel(entitlements.maxTestimonials, "depoimento", "depoimentos"),
    entitlements.customTheme ? "Temas e cores" : "Tema padrão do Free",
    entitlements.removeBranding ? "Sem marca PerfilPro na página" : null,
    entitlements.prioritySupport ? "Suporte prioritário" : null,
  ].filter((line): line is string => Boolean(line));
}

function statusTone(subscription: Subscription) {
  if (subscription.status === "PAST_DUE") {
    return {
      label: "Pagamento atrasado",
      className: "bg-red-100 text-red-800",
      card: "border-red-200/80 bg-red-50/80",
    };
  }
  if (subscription.cancelAtPeriodEnd) {
    return {
      label: "Cancelamento marcado",
      className: "bg-peach text-ink",
      card: "border-transparent bg-peach/70",
    };
  }
  if (subscription.plan === "FREE") {
    return {
      label: "Plano Free",
      className: "bg-white/70 text-ink",
      card: "border-transparent bg-lime",
    };
  }
  if (subscription.grantsAccess) {
    return {
      label: "Assinatura ativa",
      className: "bg-lime/80 text-ink",
      card: "border-line bg-card",
    };
  }
  return {
    label: subscriptionStatusLabel(subscription.status),
    className: "bg-ink/5 text-ink",
    card: "border-line bg-card",
  };
}

function statusCopy(subscription: Subscription, planName: string, periodEnd: string) {
  if (subscription.plan === "FREE" && subscription.grantsAccess) {
    return {
      title: "Sua página está no ar.",
      body: "Sem cobrança. Assine quando quiser mais blocos, temas e tirar os limites.",
    };
  }
  if (subscription.cancelAtPeriodEnd && periodEnd) {
    return {
      title: `Acesso pago até ${periodEnd}.`,
      body: `${CANCEL_TO_FREE_COPY} Até lá, o ${planName} segue normal.`,
    };
  }
  if (subscription.status === "PAST_DUE") {
    return {
      title: "O pagamento não passou.",
      body: "Atualize o cartão para não perder o que o plano libera. A página continua no ar por enquanto.",
    };
  }
  if (subscription.grantsAccess && periodEnd) {
    return {
      title: `Próxima cobrança em ${periodEnd}.`,
      body: `O ${planName} segue ativo no cartão cadastrado.`,
    };
  }
  return {
    title: "Não há acesso ao painel neste momento.",
    body: "Entre de novo ou fale com o suporte. A página pública só some se a conta perder o plano de verdade.",
  };
}

function PageLoader() {
  return (
    <Container className="py-10 sm:py-14" aria-busy="true">
      <div className="mx-auto max-w-3xl animate-pulse space-y-4">
        <div className="h-4 w-24 rounded-full bg-ink/10" />
        <div className="h-9 w-48 rounded-full bg-ink/10" />
        <div className="h-44 rounded-[1.8rem] bg-ink/8" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 rounded-[1.6rem] bg-ink/8" />
          <div className="h-40 rounded-[1.6rem] bg-ink/8" />
        </div>
      </div>
      <span className="sr-only">Carregando assinatura</span>
    </Container>
  );
}

export function SubscriptionManager() {
  const { setSubscription: setAuthSubscription, user } = useAuth();
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlanId | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<Subscription>(EMPTY_SUBSCRIPTION);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const cancelTitleId = useId();
  const cancelPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!confirmCancel) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelPanelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && pending === null) {
        setConfirmCancel(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [confirmCancel, pending]);

  async function load() {
    const data = await billingApi.subscription();
    setPlans(data.plans);
    setSubscription(data.subscription);
    setAuthSubscription(data.subscription);
  }

  useEffect(() => {
    void load()
      .catch((err) => {
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar a assinatura.",
        );
      })
      .finally(() => setReady(true));
  }, []);

  async function retryLoad() {
    setPending("reload");
    setLoadError(null);
    try {
      await load();
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar a assinatura.",
      );
    } finally {
      setPending(null);
    }
  }

  async function run(action: string, fn: () => Promise<unknown>, ok?: string) {
    setPending(action);
    setError(null);
    try {
      await fn();
      await load();
      if (ok) setToast({ text: ok, variant: "success" });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.code === "ALREADY_ON_PLAN") {
        setError("Você já está nesse plano.");
      } else if (err instanceof ApiError && err.code === "CHECKOUT_REQUIRED") {
        setError("No Free, o upgrade é pelo checkout.");
      } else if (err instanceof ApiError && err.code === "FREE_CANNOT_CANCEL") {
        setError("O Free não tem cobrança para cancelar.");
      } else {
        setError(
          err instanceof ApiError ? err.message : "Não foi possível concluir.",
        );
      }
      return false;
    } finally {
      setPending(null);
    }
  }

  async function openPortal() {
    setPending("portal");
    setError(null);
    setToast({ text: "Abrindo o portal de pagamento…", variant: "info" });
    try {
      const { portalUrl } = await billingApi.portal();
      if (!goToCheckout(portalUrl)) {
        setError("Portal indisponível neste ambiente.");
        setToast(null);
      }
    } catch (err) {
      setToast(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível abrir o portal.",
      );
    } finally {
      setPending(null);
    }
  }

  if (!ready) return <PageLoader />;

  if (loadError) {
    return (
      <Container className="py-16 sm:py-20">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-[1.7rem] leading-tight text-ink">
            Não conseguimos abrir sua assinatura
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            {loadError} Nada foi alterado no seu plano — é só tentar de novo.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              disabled={pending !== null}
              onClick={() => void retryLoad()}
            >
              {pending === "reload" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando
                </>
              ) : (
                "Tentar de novo"
              )}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/app">Voltar ao painel</Link>
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  const current = planById(plans, subscription.plan);
  const otherId = otherPaidPlanId(subscription.plan);
  const other = otherId ? planById(plans, otherId) : null;
  const periodEnd = formatPtDate(subscription.currentPeriodEnd);
  const paid = isPaidPlanId(subscription.plan);
  const pro = planById(plans, "PRO");
  const premium = planById(plans, "PREMIUM");
  const entitlements = entitlementsOf(subscription);
  const planName = current?.name ?? subscription.plan ?? "Free";
  const tone = statusTone(subscription);
  const copy = statusCopy(subscription, planName, periodEnd);
  const busy = pending !== null;
  const includes = includedLines(entitlements);

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Painel
        </Link>
        <h1 className="mt-4 font-serif text-[2rem] leading-tight text-ink sm:text-[2.45rem]">
          Assinatura
        </h1>
        <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted">
          Plano, cobrança e o que a sua página pode usar hoje.
        </p>

        <div aria-live="assertive">
          {error ? (
            <p
              role="alert"
              className="panel-in mt-6 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-800"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>

        <section
          className={cn(
            "panel-in mt-8 overflow-hidden rounded-[1.85rem] border p-6 sm:p-8",
            tone.card,
          )}
        >
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              tone.className,
            )}
          >
            {tone.label}
          </span>
          <h2 className="mt-4 font-serif text-[1.75rem] leading-[1.12] text-ink sm:text-[2.05rem]">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink/70">
            {copy.body}
          </p>

          <dl className="mt-7 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                Plano
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-ink">
                {planName}
                {current?.priceFormatted
                  ? ` · ${current.priceFormatted}/mês`
                  : " · grátis"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                Situação
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-ink">
                {subscriptionStatusLabel(subscription.status)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                {subscription.cancelAtPeriodEnd
                  ? "Acesso pago até"
                  : "Próxima data"}
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-ink">
                {periodEnd || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[1.7rem] border border-line bg-card p-6 sm:p-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
              O que está incluso
            </p>
            <ul className="mt-4 space-y-2.5">
              {includes.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 text-[14px] leading-snug text-ink"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink/70" />
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col rounded-[1.7rem] border border-line bg-card p-6 sm:p-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
              {subscription.status === "PAST_DUE"
                ? "Resolver agora"
                : paid
                  ? "Gerenciar"
                  : "Subir de plano"}
            </p>

            {subscription.plan === "FREE" ? (
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                Escolha Pro ou Premium abaixo. O checkout pede e-mail e senha;
                o cartão fica com a Stripe.
              </p>
            ) : null}

            {paid && other && !subscription.cancelAtPeriodEnd ? (
              <>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  {other.id === "PREMIUM"
                    ? `Passe para o Premium${other.priceFormatted ? ` (${other.priceFormatted}/mês)` : ""} e tire a marca da página.`
                    : `Volte para o Pro${other.priceFormatted ? ` (${other.priceFormatted}/mês)` : ""} se a marca não for um problema.`}
                </p>
                <Button
                  className="mt-5"
                  disabled={busy || subscription.plan === other.id}
                  onClick={() =>
                    void run(
                      "change",
                      () => billingApi.changePlan(other.id as PaidPlanId),
                      `Pronto. Você está no ${other.name}.`,
                    )
                  }
                >
                  {pending === "change" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Atualizando
                    </>
                  ) : other.id === "PREMIUM" ? (
                    "Assinar Premium"
                  ) : (
                    "Voltar para o Pro"
                  )}
                </Button>
              </>
            ) : null}

            {paid && subscription.cancelAtPeriodEnd ? (
              <>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  Sem cobrança nova. No fim do período você volta ao Free, com
                  a página no ar.
                </p>
                <Button
                  className="mt-5"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      "resume",
                      () => billingApi.resume(),
                      "Plano retomado. A cobrança segue no cartão.",
                    )
                  }
                >
                  {pending === "resume" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retomando
                    </>
                  ) : (
                    "Retomar plano"
                  )}
                </Button>
              </>
            ) : null}

            {paid ? (
              <div
                className={cn(
                  "mt-auto",
                  subscription.plan === "FREE" ? "mt-5" : "mt-6",
                )}
              >
                <Button
                  variant={
                    subscription.status === "PAST_DUE" ? "primary" : "secondary"
                  }
                  className="w-full"
                  disabled={busy}
                  onClick={() => void openPortal()}
                >
                  {pending === "portal" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Abrindo
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      {subscription.status === "PAST_DUE"
                        ? "Atualizar cartão"
                        : "Cartão e faturas"}
                    </>
                  )}
                </Button>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-soft">
                  Abre o portal da Stripe. Você volta para cá depois.
                </p>
              </div>
            ) : null}
          </section>
        </div>

        {subscription.plan === "FREE" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["PRO", pro, "Blocos, temas e limites bem mais folgados."],
                [
                  "PREMIUM",
                  premium,
                  "Tudo do Pro, sem a marca PerfilPro na página.",
                ],
              ] as const
            ).map(([id, plan, pitch]) => (
              <button
                key={id}
                type="button"
                disabled={busy}
                onClick={() => setCheckoutPlan(id)}
                className="rounded-[1.6rem] border border-line bg-card p-5 text-left transition hover:border-ink/20 hover:bg-white disabled:opacity-60"
              >
                <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
                  <Sparkles className="h-3.5 w-3.5" />
                  {plan?.name ?? id}
                </p>
                <p className="mt-2 font-serif text-[1.55rem] text-ink">
                  {plan?.priceFormatted ?? "—"}
                  <span className="ml-1 font-sans text-[14px] font-medium text-muted">
                    /mês
                  </span>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {pitch}
                </p>
              </button>
            ))}
          </div>
        ) : null}

        {paid && !subscription.cancelAtPeriodEnd ? (
          <section className="mt-8 border-t border-line pt-6">
            <p className="text-[13px] font-medium text-ink">Cancelar plano</p>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
              {CANCEL_TO_FREE_COPY}
              {periodEnd ? ` Acesso pago até ${periodEnd}.` : ""}
            </p>
            <Button
              variant="ghost"
              className="mt-3 -ml-2 text-muted hover:text-ink"
              disabled={busy}
              onClick={() => setConfirmCancel(true)}
            >
              Cancelar no fim do período
            </Button>
          </section>
        ) : null}
      </div>

      {confirmCancel ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5 backdrop-blur-[2px]"
          onClick={() => {
            if (pending === null) setConfirmCancel(false);
          }}
        >
          <div
            ref={cancelPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={cancelTitleId}
            tabIndex={-1}
            className="panel-in w-full max-w-md rounded-[1.6rem] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(20,17,14,0.45)] outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <p
              id={cancelTitleId}
              className="font-serif text-[1.45rem] text-ink"
            >
              Cancelar no fim do período?
            </p>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted">
              <li>A página continua no ar.</li>
              <li>
                {periodEnd
                  ? `O ${planName} vale até ${periodEnd}.`
                  : "O plano vale até o fim do ciclo pago."}
              </li>
              <li>{CANCEL_TO_FREE_COPY}</li>
            </ul>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  void (async () => {
                    const ok = await run(
                      "cancel",
                      () => billingApi.cancel(),
                      periodEnd
                        ? `Cancelamento marcado. Você fica no ${planName} até ${periodEnd}.`
                        : "Cancelamento marcado. Você volta ao Free no fim do período.",
                    );
                    if (ok) setConfirmCancel(false);
                  })();
                }}
              >
                {pending === "cancel" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelando
                  </>
                ) : (
                  "Confirmar cancelamento"
                )}
              </Button>
              <Button
                onClick={() => setConfirmCancel(false)}
                disabled={busy}
              >
                Manter plano
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <CheckoutDialog
        open={checkoutPlan !== null}
        planId={checkoutPlan}
        plans={plans}
        defaultEmail={user?.email}
        onClose={() => setCheckoutPlan(null)}
      />

      <Toast
        message={toast?.text || ""}
        variant={toast?.variant}
        show={Boolean(toast)}
        onDismiss={() => setToast(null)}
      />
    </Container>
  );
}
