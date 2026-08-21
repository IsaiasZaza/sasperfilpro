import type { LucideIcon } from "lucide-react";
import {
  Crosshair,
  Link2,
  ListOrdered,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  UserRound,
} from "lucide-react";
import type { BlockType, SocialNetwork } from "@/lib/types/profile";

export const INSERTABLE_BLOCKS: BlockType[] = [
  "HERO",
  "CTA_BUTTON",
  "LINK_BUTTON",
  "WHATSAPP",
  "SOCIAL",
  "SERVICES",
  "TESTIMONIALS",
  "LOCATION",
];

export const UNIQUE_BLOCKS: BlockType[] = ["HERO", "SERVICES", "TESTIMONIALS"];

export const BLOCK_ICONS: Record<BlockType, LucideIcon> = {
  HERO: UserRound,
  CTA_BUTTON: Crosshair,
  LINK_BUTTON: Link2,
  WHATSAPP: MessageCircle,
  SOCIAL: Share2,
  SERVICES: ListOrdered,
  TESTIMONIALS: Star,
  LOCATION: MapPin,
};

export const BLOCK_TIPS: Record<BlockType, string> = {
  HERO: "Foto, nome, frase de destaque e tamanho da foto.",
  CTA_BUTTON: "Texto, link e cor do botão.",
  LINK_BUTTON: "Texto, link e ícone da rede.",
  WHATSAPP: "Só números com DDI (10–15 dígitos). Ex.: 5511999999999.",
  SOCIAL: "Ícones das redes ou botões com texto.",
  SERVICES: "Itens e preços. Aparência no fim da lista.",
  TESTIMONIALS: "Depoimentos e nota. Aparência no fim da lista.",
  LOCATION: "Cidade ou endereço e link do mapa.",
};

export const SOCIAL_NETWORKS: { id: SocialNetwork; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "site", label: "Site" },
];

export const SOCIAL_BASE_URL: Record<SocialNetwork, string> = {
  instagram: "https://instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  youtube: "https://youtube.com/@",
  facebook: "https://facebook.com/",
  linkedin: "https://linkedin.com/in/",
  x: "https://x.com/",
  site: "https://",
};

const SOCIAL_HOST: Record<SocialNetwork, RegExp> = {
  instagram: /instagram\.com/i,
  tiktok: /tiktok\.com/i,
  youtube: /youtube\.com|youtu\.be/i,
  facebook: /facebook\.com|fb\.com|fb\.me/i,
  linkedin: /linkedin\.com/i,
  x: /(^|\.)x\.com|twitter\.com/i,
  site: /$^/,
};

function socialHandle(url: string): string {
  const value = url.trim();
  if (!value) return "";
  try {
    const parsed = new URL(value.includes("://") ? value : `https://${value}`);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    return last.replace(/^@/, "");
  } catch {
    return "";
  }
}

function isSocialPresetUrl(url: string): boolean {
  const value = url.trim();
  if (!value || value === "https://" || value === "http://") return true;
  return Object.values(SOCIAL_BASE_URL).some(
    (base) => value === base || value === base.replace(/\/$/, ""),
  );
}

export function urlForSocialNetwork(
  network: SocialNetwork,
  currentUrl = "",
): string {
  const base = SOCIAL_BASE_URL[network];
  if (network === "site") {
    if (!currentUrl.trim() || isSocialPresetUrl(currentUrl)) return base;
    if (Object.entries(SOCIAL_HOST).some(
      ([id, pattern]) => id !== "site" && pattern.test(currentUrl),
    )) {
      return base;
    }
    return currentUrl;
  }
  const handle = isSocialPresetUrl(currentUrl) ? "" : socialHandle(currentUrl);
  return handle ? `${base}${handle}` : base;
}

export function socialUrlPlaceholder(network: SocialNetwork): string {
  if (network === "site") return "https://seusite.com";
  return `${SOCIAL_BASE_URL[network]}seuuser`;
}
