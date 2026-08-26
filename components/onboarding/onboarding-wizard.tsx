"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import {
  blocksApi,
  profileApi,
  publicApi,
  servicesApi,
} from "@/lib/api-client";
import {
  entitlementsOf,
  isBlockTypeAllowed,
} from "@/lib/billing";
import { formatWhatsAppPhone, isValidWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/phone";
import { readClaimedUsername } from "@/lib/claimed-username";
import { normalizeUsername } from "@/lib/reserved-usernames";
import {
  isTempUsername,
  parsePriceToCents,
  type HeroContent,
  type Profile,
} from "@/lib/types/profile";

type StepKey = "link" | "profile" | "whatsapp" | "services";

function buildSteps(canLocation: boolean, canServices: boolean) {
  const steps: { key: StepKey; title: string; text: string }[] = [
    { key: "link", title: "Link", text: "Escolha o endereço da sua página" },
    {
      key: "profile",
      title: "Perfil",
      text: canLocation
        ? "Nome, frase de destaque e cidade"
        : "Nome e frase de destaque",
    },
    { key: "whatsapp", title: "WhatsApp", text: "Como o cliente fala com você" },
  ];
  if (canServices) {
    steps.push({
      key: "services",
      title: "Serviços",
      text: "O que você oferece",
    });
  }
  return steps;
}

export function OnboardingWizard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { setProfile, subscription } = useAuth();
  const entitlements = entitlementsOf(subscription);
  const canLocation = isBlockTypeAllowed(entitlements, "LOCATION");
  const canServices = isBlockTypeAllowed(entitlements, "SERVICES");
  const steps = useMemo(
    () => buildSteps(canLocation, canServices),
    [canLocation, canServices],
  );
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(
    profile.username && !profile.username.startsWith("user-")
      ? profile.username
      : "",
  );
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("Oi! Vi seu perfil no PerfilPro");
  const [serviceName, setServiceName] = useState("Serviço principal");
  const [servicePrice, setServicePrice] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const current = steps[Math.min(step, steps.length) - 1];

  useEffect(() => {
    if (profile.username && !profile.username.startsWith("user-")) return;
    const claimed = readClaimedUsername();
    if (claimed) setUsername(claimed);
  }, [profile.username]);

  const progress = useMemo(
    () => (Math.min(step, steps.length) / steps.length) * 100,
    [step, steps.length],
  );

  async function persistUsername(raw: string) {
    const normalized = normalizeUsername(raw);
    if (!normalized) {
      throw new ApiError("Escolha um username.", "VALIDATION_ERROR", 422);
    }
    const check = await publicApi.checkUsername(normalized);
    if (!check.available && normalized !== profile.username) {
      throw new ApiError(
        check.message || "Nome de usuário indisponível.",
        "USERNAME_TAKEN",
        409,
      );
    }
    const updated = await profileApi.update({ username: normalized });
    setProfile(updated);
    setUsername(normalized);
    return updated;
  }

  function profilePatch() {
    return {
      displayName: displayName.trim(),
      headline: headline.trim() || undefined,
      ...(canLocation ? { location: location.trim() || undefined } : {}),
    };
  }

  async function goToEditor() {
    const full = await profileApi.get();
    setProfile(full);
    router.replace("/app/editor");
  }

  async function finishOnboarding() {
    if (displayName.trim()) {
      const updated = await profileApi.update(profilePatch());
      setProfile(updated);
    }

    try {
      await profileApi.publish();
    } catch {
      try {
        sessionStorage.setItem(
          "perfilpro:publish-warn",
          "Perfil salvo, mas a página ainda não foi publicada. Publique no editor quando quiser.",
        );
      } catch {
        // ignore
      }
    }

    await goToEditor();
  }

  async function next() {
    setError(null);
    setPending(true);
    try {
      if (current.key === "link") {
        await persistUsername(username);
        setStep(2);
        return;
      }

      if (current.key === "profile") {
        if (!displayName.trim()) {
          setError("Informe o nome que aparece no perfil.");
          return;
        }
        const updated = await profileApi.update(profilePatch());
        setProfile(updated);

        const blocks = await blocksApi.list();
        const heroContent: HeroContent = {
          name: displayName.trim(),
          headline: headline.trim(),
        };
        if (canLocation) {
          heroContent.location = location.trim();
        }
        const hero = blocks.find((b) => b.type === "HERO");
        if (hero) {
          await blocksApi.update(hero.id, { content: heroContent });
        } else {
          await blocksApi.create({
            type: "HERO",
            content: heroContent,
          });
        }

        if (canLocation && location.trim()) {
          const loc = blocks.find((b) => b.type === "LOCATION");
          if (loc) {
            await blocksApi.update(loc.id, {
              content: { address: location.trim() },
            });
          } else {
            await blocksApi.create({
              type: "LOCATION",
              content: { address: location.trim() },
            });
          }
        }

        setStep((value) => value + 1);
        return;
      }

      if (current.key === "whatsapp") {
        const digits = normalizeWhatsAppPhone(phone);
        if (!isValidWhatsAppPhone(digits)) {
          setError(
            "Informe o WhatsApp só com números e DDI (10 a 15 dígitos). Ex.: 5511999999999",
          );
          return;
        }
        const blocks = await blocksApi.list();
        const existing = blocks.find((b) => b.type === "WHATSAPP");
        if (existing) {
          await blocksApi.update(existing.id, {
            content: { phone: digits, message, label: "WhatsApp" },
          });
        } else {
          await blocksApi.create({
            type: "WHATSAPP",
            content: { phone: digits, message, label: "WhatsApp" },
          });
        }
        if (canServices) {
          setStep((value) => value + 1);
          return;
        }
        await finishOnboarding();
        return;
      }

      const priceCents = parsePriceToCents(servicePrice);
      if (!serviceName.trim() || priceCents < 0) {
        setError("Informe um serviço e um preço válido.");
        return;
      }

      if (!canServices) {
        await finishOnboarding();
        return;
      }

      const blocks = await blocksApi.list();
      if (!blocks.some((b) => b.type === "SERVICES")) {
        await blocksApi.create({
          type: "SERVICES",
          content: { heading: "Serviços" },
        });
      }

      const services = await servicesApi.list();
      if (services.length === 0) {
        await servicesApi.create({
          name: serviceName.trim(),
          priceCents,
        });
      }

      await finishOnboarding();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível continuar.",
      );
    } finally {
      setPending(false);
    }
  }

  async function skipToEditor() {
    setError(null);
    setPending(true);
    try {
      // Garante username definitivo antes de sair (senão o AppShell te devolve).
      if (isTempUsername(username) && !username.trim()) {
        setError("Escolha um nome de usuário antes de abrir o editor.");
        setStep(1);
        return;
      }
      if (username.trim()) {
        await persistUsername(username);
      }
      if (displayName.trim()) {
        const updated = await profileApi.update(profilePatch());
        setProfile(updated);
      }
      await goToEditor();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível abrir o editor.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-5 py-8 sm:py-12">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-[1.75rem] leading-tight text-ink">
            Configure sua página
          </h1>
          <span className="shrink-0 text-[12px] font-medium text-muted">
            {Math.min(step, steps.length)}/{steps.length}
          </span>
        </div>
        <p className="mt-1 text-[14px] text-muted">{current.text}</p>
        <div
          role="progressbar"
          aria-label="Progresso da configuração"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={Math.min(step, steps.length)}
          aria-valuetext={`Passo ${Math.min(step, steps.length)} de ${steps.length}: ${current.title}`}
          className="mt-4 h-1 overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-ink transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form de verdade para o Enter avançar o passo em vez de não fazer nada. */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!pending) void next();
        }}
        className="rounded-2xl border border-line bg-[#fffcf8] p-5 sm:p-7"
      >
        {current.key === "link" ? (
          <div>
            <Label htmlFor="username">Seu link</Label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[14px] text-muted">/u/</span>
              <Input
                id="username"
                value={username}
                autoFocus
                autoCapitalize="none"
                spellCheck={false}
                disabled={pending}
                onChange={(event) =>
                  setUsername(normalizeUsername(event.target.value))
                }
                placeholder="maria-oliveira"
              />
            </div>
          </div>
        ) : null}

        {current.key === "profile" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Nome no perfil</Label>
              <Input
                id="displayName"
                value={displayName}
                autoFocus
                autoComplete="name"
                disabled={pending}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="headline">Frase de destaque</Label>
              <Input
                id="headline"
                value={headline}
                disabled={pending}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="Lash Designer"
              />
            </div>
            {canLocation ? (
              <div>
                <Label htmlFor="location">Cidade</Label>
                <Input
                  id="location"
                  value={location}
                  disabled={pending}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Brasília - DF"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {current.key === "whatsapp" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                value={formatWhatsAppPhone(phone)}
                inputMode="numeric"
                autoComplete="tel"
                autoFocus
                disabled={pending}
                aria-describedby="phone-hint"
                onChange={(event) =>
                  setPhone(normalizeWhatsAppPhone(event.target.value))
                }
                placeholder="5511999999999"
              />
              <p id="phone-hint" className="mt-1.5 text-[12px] text-muted">
                Só números com código do país (DDI). Ex.: 5511999999999 (BR),
                351912345678 (PT).
              </p>
            </div>
            <div>
              <Label htmlFor="message">Mensagem automática</Label>
              <Input
                id="message"
                value={message}
                disabled={pending}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        {current.key === "services" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="serviceName">Serviço</Label>
              <Input
                id="serviceName"
                value={serviceName}
                autoFocus
                disabled={pending}
                onChange={(event) => setServiceName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="servicePrice">Preço (R$)</Label>
              <Input
                id="servicePrice"
                value={servicePrice}
                inputMode="decimal"
                disabled={pending}
                onChange={(event) => setServicePrice(event.target.value)}
                placeholder="180"
              />
            </div>
          </div>
        ) : null}

        <div aria-live="assertive">
          {error ? (
            <p
              role="alert"
              className="panel-in mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-lg px-1 text-[13px] font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 disabled:opacity-50"
              onClick={() => setStep((value) => Math.max(1, value - 1))}
              disabled={pending}
            >
              Voltar
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void skipToEditor()}
              disabled={pending}
            >
              Ir para o editor
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando
                </>
              ) : current.key === "services" ||
                (current.key === "whatsapp" && !canServices) ? (
                "Abrir editor"
              ) : (
                "Continuar"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
