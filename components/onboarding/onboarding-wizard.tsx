"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { normalizeUsername } from "@/lib/reserved-usernames";
import {
  isTempUsername,
  parsePriceToCents,
  type Profile,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Username", text: "Escolha o link da sua página" },
  { id: 2, title: "Perfil", text: "Nome, headline e cidade" },
  { id: 3, title: "WhatsApp", text: "Como o cliente fala com você" },
  { id: 4, title: "Serviços", text: "O que você oferece" },
] as const;

export function OnboardingWizard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { setProfile } = useAuth();
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

  const progress = useMemo(() => (step / STEPS.length) * 100, [step]);

  async function persistUsername(raw: string) {
    const normalized = normalizeUsername(raw);
    if (!normalized) {
      throw new ApiError("Escolha um username.", "VALIDATION_ERROR", 422);
    }
    const check = await publicApi.checkUsername(normalized);
    if (!check.available && normalized !== profile.username) {
      throw new ApiError(
        check.message || "Username indisponível.",
        "USERNAME_TAKEN",
        409,
      );
    }
    const updated = await profileApi.update({ username: normalized });
    setProfile(updated);
    setUsername(normalized);
    return updated;
  }

  async function goToEditor() {
    const full = await profileApi.get();
    setProfile(full);
    router.replace("/app/editor");
  }

  async function next() {
    setError(null);
    setPending(true);
    try {
      if (step === 1) {
        await persistUsername(username);
        setStep(2);
        return;
      }

      if (step === 2) {
        if (!displayName.trim()) {
          setError("Informe o nome que aparece no perfil.");
          return;
        }
        const updated = await profileApi.update({
          displayName: displayName.trim(),
          headline: headline.trim() || undefined,
          location: location.trim() || undefined,
        });
        setProfile(updated);

        const blocks = await blocksApi.list();
        const hero = blocks.find((b) => b.type === "HERO");
        if (hero) {
          await blocksApi.update(hero.id, {
            content: {
              name: displayName.trim(),
              headline: headline.trim(),
              location: location.trim(),
            },
          });
        } else {
          await blocksApi.create({
            type: "HERO",
            content: {
              name: displayName.trim(),
              headline: headline.trim(),
              location: location.trim(),
            },
          });
        }

        if (location.trim()) {
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

        setStep(3);
        return;
      }

      if (step === 3) {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 10) {
          setError("Informe o WhatsApp com DDI (ex.: 5561999999999).");
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
        setStep(4);
        return;
      }

      const priceCents = parsePriceToCents(servicePrice);
      if (!serviceName.trim() || priceCents < 0) {
        setError("Informe um serviço e um preço válido.");
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

      if (displayName.trim()) {
        const updated = await profileApi.update({
          displayName: displayName.trim(),
          headline: headline.trim() || undefined,
          location: location.trim() || undefined,
        });
        setProfile(updated);
      }

      try {
        await profileApi.publish();
      } catch {
        // ainda libera o editor
      }

      await goToEditor();
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
        setError("Escolha um username antes de abrir o editor.");
        setStep(1);
        return;
      }
      if (username.trim()) {
        await persistUsername(username);
      }
      if (displayName.trim()) {
        const updated = await profileApi.update({
          displayName: displayName.trim(),
          headline: headline.trim() || undefined,
          location: location.trim() || undefined,
        });
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
            {step}/{STEPS.length}
          </span>
        </div>
        <p className="mt-1 text-[14px] text-muted">{STEPS[step - 1].text}</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-ink transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-[#fffcf8] p-5 sm:p-7">
        {step === 1 ? (
          <div>
            <Label htmlFor="username">Seu link</Label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[14px] text-muted">/u/</span>
              <Input
                id="username"
                value={username}
                onChange={(event) =>
                  setUsername(normalizeUsername(event.target.value))
                }
                placeholder="maria-oliveira"
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div>
              <Label>Nome no perfil</Label>
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
            <div>
              <Label>Headline</Label>
              <Input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="Lash Designer"
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Brasília - DF"
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div>
              <Label>WhatsApp (com DDI)</Label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="5561999999999"
              />
            </div>
            <div>
              <Label>Mensagem automática</Label>
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Serviço</Label>
              <Input
                value={serviceName}
                onChange={(event) => setServiceName(event.target.value)}
              />
            </div>
            <div>
              <Label>Preço (R$)</Label>
              <Input
                value={servicePrice}
                onChange={(event) => setServicePrice(event.target.value)}
                placeholder="180"
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className={cn(
              "text-[13px] font-medium text-muted hover:text-ink",
              step === 1 && "invisible",
            )}
            onClick={() => setStep((value) => Math.max(1, value - 1))}
            disabled={pending}
          >
            Voltar
          </button>
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
            <Button type="button" onClick={() => void next()} disabled={pending}>
              {pending
                ? "Salvando..."
                : step === 4
                  ? "Abrir editor"
                  : "Continuar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
