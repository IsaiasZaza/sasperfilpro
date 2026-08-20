import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2.5 rounded-full bg-whatsapp py-2.5 pl-2.5 pr-4 text-white shadow-[0_12px_32px_-8px_rgba(18,140,75,0.75)] transition-transform hover:scale-[1.03] active:scale-[0.98] sm:bottom-6 sm:left-6 sm:pr-5"
      aria-label="Chamar no WhatsApp"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/25" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
          <MessageCircle className="h-5 w-5 fill-current" />
        </span>
      </span>
      <span className="flex flex-col pr-1 leading-tight">
        <span className="text-[11px] font-medium text-white/80">Clique rápido</span>
      </span>
    </a>
  );
}
