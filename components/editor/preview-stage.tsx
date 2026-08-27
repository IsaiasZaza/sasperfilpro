"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfilePreview } from "@/components/profile/profile-preview";
import type { PublicPage } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export type PreviewDevice = "phone" | "tablet" | "desktop";

const STORAGE_KEY = "pp-preview-device";

const DEVICES: {
  id: PreviewDevice;
  label: string;
  hint: string;
}[] = [
  { id: "phone", label: "Celular", hint: "A maioria abre pelo Instagram" },
  { id: "tablet", label: "Tablet", hint: "Tela média, como um iPad" },
  { id: "desktop", label: "Computador", hint: "Como no navegador do computador" },
];

function readStoredDevice(): PreviewDevice {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "phone" || stored === "tablet" || stored === "desktop") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "phone";
}

export function PreviewStage({
  page,
  selectedId,
  onSelectBlock,
}: {
  page: PublicPage;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
}) {
  const [device, setDevice] = useState<PreviewDevice>("phone");
  const username = page.username || "seu-usuario";

  useEffect(() => {
    setDevice(readStoredDevice());
  }, []);

  const changeDevice = (next: PreviewDevice) => {
    setDevice(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex w-full flex-col items-center px-3 py-6 sm:px-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-soft">
        Prévia ao vivo
      </p>
      <p className="mt-1 max-w-[18rem] text-center text-[12px] leading-snug text-muted">
        O que você muda à direita aparece aqui na hora — é assim que as
        pessoas veem o seu site.
      </p>
      <div
        className="mt-4 inline-flex rounded-full border border-line bg-white p-1"
        role="tablist"
        aria-label="Tamanho da tela na prévia"
      >
        {DEVICES.map((item) => {
          const selected = device === item.id;
          const Icon =
            item.id === "phone"
              ? Smartphone
              : item.id === "tablet"
                ? Tablet
                : Monitor;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              title={item.hint}
              onClick={() => changeDevice(item.id)}
              className={cn(
                "inline-flex h-10 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition",
                selected
                  ? "bg-ink text-white shadow-sm"
                  : "text-muted hover:bg-background hover:text-ink",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden min-[420px]:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted" aria-live="polite">
        {DEVICES.find((item) => item.id === device)?.hint}
      </p>

      <div className="mt-5 flex w-full justify-center">
        {device === "phone" ? (
          <PhoneFrame>
            <ProfilePreview
              page={page}
              selectedId={selectedId}
              onSelectBlock={onSelectBlock}
            />
          </PhoneFrame>
        ) : null}

        {device === "tablet" ? (
          <div className="w-full max-w-[26rem] overflow-hidden rounded-[1.85rem] border-[10px] border-[#1c1814] bg-[#1c1814] shadow-[0_30px_70px_-24px_rgba(20,17,14,0.45)]">
            <div className="mx-auto mb-1.5 mt-1 h-1.5 w-16 rounded-full bg-white/20" />
            <div className="h-[32rem] overflow-y-auto rounded-[1.2rem] bg-white">
              <ProfilePreview
                page={page}
                variant="page"
                showStatusBar={false}
                selectedId={selectedId}
                onSelectBlock={onSelectBlock}
              />
            </div>
          </div>
        ) : null}

        {device === "desktop" ? (
          <div className="w-full max-w-[34rem] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-28px_rgba(20,17,14,0.45)]">
            <div className="flex items-center gap-1.5 border-b border-line bg-[#f4f1ec] px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-muted">
                perfilpro.com/u/{username}
              </span>
            </div>
            <div className="h-[32rem] overflow-y-auto">
              <ProfilePreview
                page={page}
                variant="page"
                showStatusBar={false}
                selectedId={selectedId}
                onSelectBlock={onSelectBlock}
                className="min-h-full"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
