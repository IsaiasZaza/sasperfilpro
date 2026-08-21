"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { ApiError } from "@/lib/api";
import { billingApi } from "@/lib/api-client";
import {
  formatPtDate,
  goToCheckout,
  otherPlanId,
  planById,
  subscriptionStatusLabel,
} from "@/lib/billing";
import type { Plan, PlanId, Subscription } from "@/lib/types/billing";
import { EMPTY_SUBSCRIPTION } from "@/lib/types/billing";

function StatusHero({
  subscription,
  priceFormatted,
}: {
  subscription: Subscription;
  priceFormatted: string | null;
}) {
  const trialEnd = formatPtDate(subscription.trialEndsAt);
  const periodEnd = formatPtDate(subscription.currentPeriodEnd);
  const price = priceFormatted ? `${priceFormatted}/mês` : "a cobrança mensal";

  if (subscription.isTrialing && trialEnd) {
    return (
      <section className="rounded-[1.7rem] bg-lime px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink/70">
          Período grátis
        </p>
        <h2 className="mt-3 font-serif text-[1.85rem] leading-[1.12] text-ink sm:text-[2.25rem]">
          Teste grátis até {trialEnd}.
        </h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink/75">
          Depois vira {price} no cartão. Se cancelar, o editor fecha na hora.
        </p>
      </section>
    );
  }

  if (subscription.cancelAtPeriodEnd && periodEnd) {
    return (
      <section className="rounded-[1.7rem] bg-peach px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink/70">
          Cancelamento agendado
        </p>
        <h2 className="mt-3 font-serif text-[1.85rem] leading-[1.12] text-ink sm:text-[2.25rem]">
          Página no ar até {periodEnd}.
        </h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink/75">
          O editor já foi bloqueado. A página pública segue no ar até essa data.
          Mantenha o plano se quiser voltar a editar.
        </p>
      </section>
    );
  }

  if (subscription.status === "PAST_DUE") {
    return (
      <section className="rounded-[1.7rem] bg-red-50 px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-red-800/70">
          Pagamento atrasado
        </p>
        <h2 className="mt-3 font-serif text-[1.85rem] leading-[1.12] text-ink sm:text-[2.25rem]">
          Atualize o cartão para não perder o acesso.
        </h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-red-900/70">
          Você ainda entra no painel, mas o pagamento precisa ser regularizado.
        </p>
      </section>
    );
  }

  if (subscription.grantsAccess && periodEnd) {
    return (
      <section className="rounded-[1.7rem] border border-line bg-card px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-soft">
          Assinatura ativa
        </p>
        <h2 className="mt-3 font-serif text-[1.85rem] leading-[1.12] text-ink sm:text-[2.25rem]">
          Próxima cobrança em {periodEnd}.
        </h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          {priceFormatted
            ? `${priceFormatted}/mês no cartão cadastrado.`
            : "A cobrança mensal segue no cartão cadastrado."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.7rem] border border-line bg-card px-6 py-8 sm:px-8 sm:py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-soft">
        Sem plano ativo
      </p>
      <h2 className="mt-3 font-serif text-[1.85rem] leading-[1.12] text-ink sm:text-[2.25rem]">
        Escolha um plano para voltar a editar.
      </h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
        Sem assinatura o editor fica bloqueado e a página pública sai do ar.
      </p>
    </section>
  );
}

export function SubscriptionManager() {
  const { setSubscription: setAuthSubscription } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<Subscription>(EMPTY_SUBSCRIPTION);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelTitleId = useId();
  const cancelPanelRef = useRef<HTMLDivElement>(null);

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
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar a assinatura.",
        );
      })
      .finally(() => setReady(true));
  }, []);

  async function run(action: string, fn: () => Promise<unknown>) {
    setPending(action);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.code === "ALREADY_ON_PLAN") {
        setError("Você já está nesse plano.");
      } else {
        setError(
          err instanceof ApiError ? err.message : "Não foi possível concluir.",
        );
      }
    } finally {
      setPending(null);
    }
  }

  async function openPortal() {
    setPending("portal");
    setError(null);
    try {
      const { portalUrl } = await billingApi.portal();
      if (!goToCheckout(portalUrl)) {
        setError("Portal indisponível neste ambiente.");
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível abrir o portal.",
      );
    } finally {
      setPending(null);
    }
  }

  if (!ready) {
    return <PageSkeleton className="px-5 py-16" />;
  }

  const current = planById(plans, subscription.plan);
  const otherId = otherPlanId(subscription.plan);
  const other = planById(plans, otherId);
  const periodEnd = formatPtDate(subscription.currentPeriodEnd);
  const trialEnd = formatPtDate(subscription.trialEndsAt);

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="font-serif text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
        Assinatura
      </h1>
      <p className="mt-2 max-w-xl text-[15px] text-muted">
        Acompanhe o teste, troque de plano ou gerencie o cartão.
      </p>

      <div className="mt-8">
        <StatusHero
          subscription={subscription}
          priceFormatted={current?.priceFormatted ?? null}
        />
      </div>

      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </p>
      ) : null}

      <section className="mt-4 rounded-[1.6rem] border border-line bg-card p-6 sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
          Plano atual
        </p>
        <div className="mt-3">
          <p className="font-serif text-[1.8rem] text-ink">
            {current?.name ?? subscription.plan ?? "Nenhum"}
          </p>
          <p className="mt-1 text-[14px] text-muted">
            {subscriptionStatusLabel(subscription.status)}
            {current?.priceFormatted ? ` · ${current.priceFormatted}/mês` : ""}
          </p>
          {subscription.isTrialing && trialEnd ? (
            <p className="mt-2 text-[14px] text-ink">
              Teste grátis até <strong>{trialEnd}</strong>
              {current?.priceFormatted
                ? `. Depois vira ${current.priceFormatted}/mês no cartão.`
                : "."}
            </p>
          ) : null}
        </div>
      </section>

      {other && !subscription.cancelAtPeriodEnd ? (
        <section className="mt-4 rounded-[1.6rem] border border-line bg-card p-6 sm:p-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
            Trocar plano
          </p>
          <p className="mt-2 text-[15px] text-muted">
            {other.id === "PREMIUM"
              ? `Assine o Premium${other.priceFormatted ? ` (${other.priceFormatted}/mês)` : ""} para tirar a marca PerfilPro e ter suporte prioritário.`
              : `Volte para o Pro${other.priceFormatted ? ` (${other.priceFormatted}/mês)` : ""} se não precisar tirar a marca.`}
          </p>
          <Button
            className="mt-5"
            disabled={pending !== null || subscription.plan === other.id}
            onClick={() =>
              void run("change", () => billingApi.changePlan(other.id as PlanId))
            }
          >
            {pending === "change"
              ? "Atualizando..."
              : other.id === "PREMIUM"
                ? "Assinar Premium"
                : "Voltar para o Pro"}
          </Button>
        </section>
      ) : null}

      <section className="mt-4 rounded-[1.6rem] border border-line bg-card p-6 sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
          Cancelar / retomar
        </p>
        {subscription.cancelAtPeriodEnd ? (
          <>
            <p className="mt-2 text-[15px] text-muted">
              O editor já está bloqueado. A página pública segue no ar
              {periodEnd ? ` até ${periodEnd}` : ""}. Mantenha o plano para
              voltar a editar.
            </p>
            <Button
              className="mt-5"
              disabled={pending !== null}
              onClick={() => void run("resume", () => billingApi.resume())}
            >
              {pending === "resume" ? "Retomando..." : "Manter plano"}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-[15px] text-muted">
              Ao cancelar, o editor fecha na hora. A página pública continua no
              ar até{" "}
              {subscription.isTrialing && trialEnd
                ? trialEnd
                : periodEnd || "o fim do ciclo"}
              .
            </p>
            <Button
              variant="secondary"
              className="mt-5"
              disabled={pending !== null}
              onClick={() => setConfirmCancel(true)}
            >
              Cancelar plano
            </Button>
          </>
        )}
      </section>

      <section className="mt-4 rounded-[1.6rem] border border-line bg-card p-6 sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
          Cartão e faturas
        </p>
        <p className="mt-2 text-[15px] text-muted">
          {subscription.status === "PAST_DUE"
            ? "Atualize o cartão para evitar a perda do acesso."
            : "Abra o portal da Stripe para cartão, faturas e dados de cobrança."}
        </p>
        <Button
          className="mt-5"
          disabled={pending !== null}
          onClick={() => void openPortal()}
        >
          {pending === "portal"
            ? "Abrindo..."
            : subscription.status === "PAST_DUE"
              ? "Atualizar cartão"
              : "Abrir portal"}
        </Button>
      </section>

      {confirmCancel ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
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
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_-24px_rgba(20,17,14,0.45)] outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <p
              id={cancelTitleId}
              className="font-serif text-[1.45rem] text-ink"
            >
              Cancelar plano?
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              O editor fecha agora. A página pública segue no ar
              {periodEnd || trialEnd
                ? ` até ${periodEnd || trialEnd}`
                : " até o fim do período"}
              .
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setConfirmCancel(false)}
                disabled={pending !== null}
              >
                Voltar
              </Button>
              <Button
                disabled={pending !== null}
                onClick={() => {
                  void (async () => {
                    await run("cancel", () => billingApi.cancel());
                    setConfirmCancel(false);
                  })();
                }}
              >
                {pending === "cancel"
                  ? "Cancelando..."
                  : "Confirmar cancelamento"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
