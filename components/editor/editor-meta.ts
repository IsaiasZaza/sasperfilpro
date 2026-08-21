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
  HERO: "Foto, textos, cor e alinhamento do topo.",
  CTA_BUTTON: "Texto, link, estilo, posição e pulso.",
  LINK_BUTTON: "Link secundário, cor, largura e pulso.",
  WHATSAPP: "Número com DDI. Ícone, pulso e posição.",
  SOCIAL: "Ícones das redes, ou botões com texto.",
  SERVICES: "Nome, descrição, preço, cor e alinhamento.",
  TESTIMONIALS: "Nome, texto, nota, cor e alinhamento.",
  LOCATION: "Endereço em card, com link do Maps.",
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
