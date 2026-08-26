"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_INPUT_CLASS, PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authApi, billingApi } from "@/lib/api-client";
import { goToCheckout, planById } from "@/lib/billing";
import type { PaidPlanId, Plan } from "@/lib/types/billing";

export function CheckoutDialog({
  open,
  planId,
  plans,
  defaultEmail,
  onClose,
}: {
  open: boolean;
  planId: PaidPlanId | null;
  plans: Plan[];
  defaultEmail?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError(null);
      setPending(false);
      return;
    }
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, pending]);

  if (!open || !planId) return null;

  const plan = planById(plans, planId);
  const price = plan?.priceFormatted ?? "";

  async function afterLocalActivation() {
    try {
      const me = await authApi.me();
      window.location.assign("/app");
      return;
    } catch {
      router.push("/login");
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!planId) return;
    setPending(true);
    setError(null);
    try {
      const data = await billingApi.checkout({
        email,
        password,
        plan: planId,
      });
      if (goToCheckout(data.checkoutUrl)) return;
      await afterLocalActivation();
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === "ALREADY_SUBSCRIBED" || err.code === "ALREADY_SUBSCRIBED")
      ) {
        router.push("/app");
        return;
      }
      if (
        err instanceof ApiError &&
        (err.code === "USE_CHANGE_PLAN" || err.code === "USE_CHANGE_PLAN")
      ) {
        setError("Você já tem outro plano pago. Gerencie em Assinatura.");
        return;
      }
      if (err instanceof ApiError && (err.status === 401 || err.code === "INVALID_CREDENTIALS")) {
        setError("E-mail ou senha incorretos.");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_-24px_rgba(20,17,14,0.45)] outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <p id={titleId} className="font-serif text-[1.45rem] text-ink">
          Assinar {plan?.name ?? planId}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {price
            ? `${price}/mês. Confirme e-mail e senha para ir ao checkout.`
            : "Confirme e-mail e senha para ir ao checkout."}
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <Label htmlFor="checkout-email">E-mail</Label>
            <Input
              id="checkout-email"
              type="email"
              required
              autoComplete="email"
              disabled={pending}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={AUTH_INPUT_CLASS}
            />
          </div>
          <PasswordInput
            id="checkout-password"
            label="Senha"
            value={password}
            onChange={setPassword}
            placeholder="Sua senha"
            autoComplete="current-password"
            disabled={pending}
          />
          {error ? (
            <p role="alert" className="text-[13px] text-red-700">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Abrindo..." : "Continuar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
