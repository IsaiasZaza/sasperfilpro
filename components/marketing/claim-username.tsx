"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicApi } from "@/lib/api-client";
import { saveClaimedUsername } from "@/lib/claimed-username";
import { isValidUsername, normalizeUsername } from "@/lib/reserved-usernames";
import { cn } from "@/lib/utils";

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

function friendlyUsernameMessage(message?: string) {
  if (!message) return "Esse link já está em uso.";
  const normalized = message
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  if (normalized.includes("ja esta em uso") || normalized.includes("taken")) {
    return "Esse link já está em uso.";
  }
  if (normalized.includes("minimo 3") || normalized.includes("invalid")) {
    return "Use 3 a 30 caracteres, só letras, números e hífen.";
  }
  return message;
}

export function ClaimUsername({
  size = "lg",
  buttonLabel = "Pegar meu link",
  className,
}: {
  size?: "md" | "lg";
  buttonLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [hint, setHint] = useState("");

  useEffect(() => {
    const username = normalizeUsername(value);
    if (!username) {
      setStatus("idle");
      setHint("");
      return;
    }

    if (!isValidUsername(username)) {
      setStatus("invalid");
      setHint("Use 3 a 30 caracteres, só letras, números e hífen.");
      return;
    }

    setStatus("checking");
    setHint("Verificando...");
    const timer = window.setTimeout(() => {
      void publicApi
        .checkUsername(username)
        .then((result) => {
          setStatus(result.available ? "available" : "taken");
          setHint(
            result.available
              ? "Esse link está livre."
              : friendlyUsernameMessage(result.message),
          );
        })
        .catch(() => {
          setStatus("invalid");
          setHint("Não foi possível verificar agora. Tente de novo.");
        });
    }, 420);

    return () => window.clearTimeout(timer);
  }, [value]);

  function claim(event: React.FormEvent) {
    event.preventDefault();
    if (status === "checking" || status === "taken" || status === "invalid") {
      return;
    }
    const username = normalizeUsername(value);
    if (username) saveClaimedUsername(username);
    const href = username
      ? `/cadastro?u=${encodeURIComponent(username)}`
      : "/cadastro";
    router.push(href);
  }

  const ready = status === "idle" || status === "available";

  return (
    <form onSubmit={claim} className={cn("w-full max-w-xl", className)}>
      <div
        className={cn(
          "flex items-center overflow-hidden rounded-full border border-ink/10 bg-white shadow-[0_18px_40px_-24px_rgba(20,17,14,0.45)]",
          size === "lg" ? "p-1.5 pl-4 sm:pl-5" : "p-1 pl-3.5 sm:pl-4",
        )}
      >
        <label className="flex min-w-0 flex-1 items-center">
          <span className="shrink-0 text-[13px] font-medium text-muted-soft sm:text-[15px]">
            <span className="sm:hidden">/u/</span>
            <span className="hidden sm:inline">perfilpro.app/u/</span>
          </span>
          <input
            value={value}
            onChange={(event) =>
              setValue(normalizeUsername(event.target.value))
            }
            placeholder="seunome"
            autoComplete="off"
            spellCheck={false}
            aria-label="Escolha o username da sua página"
            className={cn(
              "min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted-soft/70",
              size === "lg" ? "h-11 sm:h-12" : "h-10",
            )}
          />
        </label>
        <Button
          type="submit"
          size={size === "lg" ? "lg" : "md"}
          disabled={!ready}
          className="shrink-0 px-4 sm:px-6"
        >
          <span className="sm:hidden">Pegar</span>
          <span className="hidden sm:inline">{buttonLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <p
        className={cn(
          "mt-3 flex min-h-5 items-center gap-1.5 px-2 text-[13px]",
          status === "available" && "text-emerald-700",
          status === "taken" && "text-red-700",
          status === "invalid" && "text-red-700",
          (status === "idle" || status === "checking") && "text-muted",
        )}
      >
        {status === "checking" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        {status === "available" ? <Check className="h-3.5 w-3.5" /> : null}
        {hint || "Reserve o link que vai na bio do Instagram."}
      </p>
    </form>
  );
}
