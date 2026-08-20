import { MapPin, MessageCircle, Star } from "lucide-react";
import { StatusBar } from "@/components/mockups/phone-frame";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ProfileMaria({ extended = false }: { extended?: boolean }) {
  return (
    <div className="h-full overflow-hidden bg-[#faf6f2] text-[#2b211c]">
      <StatusBar />
      <div className="px-4 pb-6 pt-5">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(145deg,#e8c4b8,#c98978)] text-lg font-semibold text-white shadow-sm">
              MO
            </div>
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#faf6f2] bg-emerald-500 animate-pulse-dot" />
          </div>
          <h3 className="mt-3 text-[15px] font-semibold tracking-tight">
            Maria Oliveira
          </h3>
          <p className="mt-0.5 text-[11px] text-[#8a6f66]">✨ Lash Designer</p>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#9a857c]">
            <MapPin className="h-3 w-3" />
            Brasília - DF
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center rounded-full bg-[#2b211c] text-[11px] font-medium text-white"
          >
            Agendar horário
          </button>
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center rounded-full border border-[#eadfd8] bg-white text-[11px] font-medium"
          >
            Conheça meu trabalho
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#25d366]/10 text-[11px] font-medium text-[#128c4b]"
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </button>
            <button
              type="button"
              className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#2b211c]/5 text-[11px] font-medium"
            >
              <InstagramIcon className="h-3 w-3" />
              Instagram
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a857c]">
            Serviços
          </p>
          <div className="space-y-1.5">
            {[
              ["Alongamento de cílios", "R$ 150"],
              ["Manutenção", "R$ 90"],
              ["Design de sobrancelhas", "R$ 60"],
            ].map(([name, price]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-[#eadfd8] bg-white px-3 py-2"
              >
                <span className="text-[11px]">{name}</span>
                <span className="text-[11px] font-semibold">{price}</span>
              </div>
            ))}
          </div>
        </div>

        {extended ? (
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a857c]">
              Depoimentos
            </p>
            <div className="rounded-xl border border-[#eadfd8] bg-white px-3 py-2.5">
              <div className="mb-1 flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-current" />
                ))}
              </div>
              <p className="text-[10px] leading-relaxed text-[#6b5750]">
                “Saí apaixonada. Atendimento impecável e o resultado ficou
                natural.”
              </p>
              <p className="mt-1 text-[9px] text-[#9a857c]">Ana, Asa Norte</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileJoao() {
  return (
    <div className="h-full overflow-hidden bg-[#111111] text-white">
      <StatusBar dark />
      <div className="px-4 pb-6 pt-5">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(145deg,#4a5560,#1f2428)] text-lg font-semibold">
            JS
          </div>
          <h3 className="mt-3 text-[15px] font-semibold tracking-tight">
            João Silva
          </h3>
          <p className="mt-0.5 text-[11px] text-zinc-400">Fotógrafo</p>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500">
            <MapPin className="h-3 w-3" />
            São Paulo - SP
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {["#d6c3ae", "#3d4650", "#c4b8a8", "#2c3338", "#ead9c6", "#4f433b"].map(
            (color) => (
              <div
                key={color}
                className="aspect-square rounded-lg"
                style={{ background: color }}
              />
            ),
          )}
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center rounded-full bg-white text-[11px] font-medium text-black"
          >
            Ver portfólio
          </button>
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#25d366] text-[11px] font-medium text-white"
          >
            <MessageCircle className="h-3 w-3" />
            Pedir orçamento
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Serviços
          </p>
          <div className="space-y-1.5">
            {[
              ["Ensaio editorial", "A partir de R$ 650"],
              ["Casamento", "Sob consulta"],
              ["Retrato corporativo", "R$ 480"],
            ].map(([name, price]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <span className="text-[11px] text-zinc-200">{name}</span>
                <span className="text-[10px] text-zinc-400">{price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileCarlos() {
  return (
    <div className="h-full overflow-hidden bg-[#f4f1ea] text-[#1a2330]">
      <StatusBar />
      <div className="px-4 pb-6 pt-5">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1e3a5f,#0f2744)] text-lg font-semibold text-white">
            CI
          </div>
          <h3 className="mt-3 text-[15px] font-semibold tracking-tight">
            Carlos Imóveis
          </h3>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">
            Corretor de imóveis
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#8a8f98]">
            <MapPin className="h-3 w-3" />
            Curitiba - PR
          </p>
        </div>

        <button
          type="button"
          className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#1e3a5f] text-[11px] font-medium text-white"
        >
          <MessageCircle className="h-3 w-3" />
          Falar no WhatsApp
        </button>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8f98]">
            Imóveis em destaque
          </p>
          <div className="space-y-2">
            {[
              ["Apartamento 2 quartos", "Água Verde", "R$ 420 mil"],
              ["Casa com jardim", "Ecoville", "R$ 890 mil"],
              ["Sala comercial", "Batel", "R$ 3.200/mês"],
            ].map(([title, area, price]) => (
              <div
                key={title}
                className="rounded-xl border border-[#e4ddd0] bg-white p-2.5"
              >
                <div className="mb-2 h-12 rounded-lg bg-[linear-gradient(90deg,#d9cbb8,#c3b39a)]" />
                <p className="text-[11px] font-medium">{title}</p>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-[10px] text-[#8a8f98]">{area}</span>
                  <span className="text-[10px] font-semibold text-[#1e3a5f]">
                    {price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
