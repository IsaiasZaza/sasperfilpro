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
  HERO: "Foto, nome, headline e bio no topo da página.",
  CTA_BUTTON: "Botão principal — agendar, orçamento ou site.",
  LINK_BUTTON: "Link secundário para qualquer URL.",
  WHATSAPP: "Número com DDI, ex.: 5561999999999.",
  SOCIAL: "Instagram, TikTok e outras redes.",
  SERVICES: "Nome, descrição e preço de cada serviço.",
  TESTIMONIALS: "Nome, texto e nota de cada cliente.",
  LOCATION: "Cidade, texto do link e URL do Maps.",
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
