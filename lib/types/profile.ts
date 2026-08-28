import type { Subscription } from "@/lib/types/billing";

export type ProfileStatus = "DRAFT" | "PUBLISHED";

export type BlockType =
  | "HERO"
  | "CTA_BUTTON"
  | "LINK_BUTTON"
  | "WHATSAPP"
  | "SOCIAL"
  | "SERVICES"
  | "TESTIMONIALS"
  | "LOCATION";

export type SocialNetwork =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "x"
  | "site";

export type CtaStyle = "primary" | "secondary" | "outline";

export type BlockAlign = "left" | "center" | "right";
export type ButtonWidth = "full" | "fit";
export type SocialLayout = "icons" | "buttons";
export type SocialStyle = "brand" | "mono" | "ghost";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "rounded" | "square";
export type BlockRadius = "none" | "sm" | "md" | "lg" | "pill";
export type BlockPadding = "sm" | "md" | "lg";
export type BlockShadow = "none" | "soft" | "hard" | "glow";
export type BlockHover = "none" | "lift" | "scale" | "glow";
export type BlockSurface = "clean" | "card" | "glass" | "neon" | "comic";
export type HeroLayout = "stack" | "split" | "banner";
export type LinkLayout = "row" | "cover" | "minimal";
export type ServicesLayout = "list" | "cards";
export type TestimonialsLayout = "stack" | "quote";
export type LocationLayout = "card" | "map";

export type BlockLook = {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  align?: BlockAlign;
  width?: ButtonWidth;
  pulse?: boolean;
  fontSize?: FontSize;
  titleFontSize?: FontSize;
  headlineFontSize?: FontSize;
  bioFontSize?: FontSize;
  headingFontSize?: FontSize;
  bodyFontSize?: FontSize;
  metaFontSize?: FontSize;
  buttonFontSize?: FontSize;
  priceFontSize?: FontSize;
  avatarSize?: AvatarSize;
  avatarShape?: AvatarShape;
  radius?: BlockRadius;
  padding?: BlockPadding;
  shadow?: BlockShadow;
  hover?: BlockHover;
  surface?: BlockSurface;
};

export type HeroContent = BlockLook & {
  name?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  layout?: HeroLayout;
  bannerUrl?: string;
};

export type CtaButtonContent = BlockLook & {
  label: string;
  url?: string;
  style: CtaStyle;
};

export type LinkButtonContent = BlockLook & {
  label: string;
  url?: string;
  icon?: string;
  subtitle?: string;
  thumbnailUrl?: string;
  layout?: LinkLayout;
  badge?: string;
};

export type WhatsAppContent = BlockLook & {
  phone: string;
  message?: string;
  label?: string;
};

export type SocialContent = BlockLook & {
  items: { network: SocialNetwork; url: string; label?: string }[];
  layout?: SocialLayout;
  style?: SocialStyle;
};

export type ServicesContent = BlockLook & {
  heading?: string;
  layout?: ServicesLayout;
};

export type TestimonialItemStyle = {
  layout?: TestimonialsLayout;
  padding?: BlockPadding;
  spacing?: TestimonialSpacing;
};

export type TestimonialsContent = BlockLook & {
  heading?: string;
  layout?: TestimonialsLayout;
  /** Fallback visual por id enquanto a API não persiste layout/padding/spacing. */
  itemStyles?: Record<string, TestimonialItemStyle>;
};

export type LocationContent = BlockLook & {
  address: string;
  mapsUrl?: string;
  url?: string;
  label?: string;
  layout?: LocationLayout;
};

export type BlockContent =
  | HeroContent
  | CtaButtonContent
  | LinkButtonContent
  | WhatsAppContent
  | SocialContent
  | ServicesContent
  | TestimonialsContent
  | LocationContent;

export type ProfileBlock = {
  id: string;
  type: BlockType;
  title: string | null;
  content: BlockContent;
  sortOrder: number;
  isVisible: boolean;
};

export type ProfileTheme = {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonStyle?: string;
  font?: string;
  background?: string;
  text?: string;
  muted?: string;
  accent?: string;
  card?: string;
  line?: string;
  [key: string]: unknown;
};

export type ServiceItem = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  priceFormatted?: string;
  sortOrder: number;
  isVisible: boolean;
};

export type TestimonialSpacing = "sm" | "md" | "lg";

export type TestimonialItem = {
  id: string;
  authorName: string;
  text: string;
  rating: number;
  sortOrder: number;
  isVisible: boolean;
  /** Sobrescreve o estilo padrão da seção. */
  layout?: TestimonialsLayout;
  padding?: BlockPadding;
  /** Espaço abaixo deste depoimento. */
  spacing?: TestimonialSpacing;
};

export type Profile = {
  id: string;
  username: string | null;
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  theme: ProfileTheme | null;
  status: ProfileStatus;
  publishedAt: string | null;
  canChangeUsername?: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
};

export type AuthPayload = {
  user: AuthUser;
  accessToken?: string;
};

export type MePayload = AuthUser & {
  profile?: Profile | null;
  subscription?: Subscription;
};

export type PublicPage = {
  username: string;
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  theme: ProfileTheme | null;
  status: ProfileStatus;
  publishedAt: string | null;
  blocks: ProfileBlock[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  plan?: "FREE" | "PRO" | "PREMIUM" | null;
  showBranding?: boolean;
};

export type UsernameCheck = {
  available: boolean;
  reason: "INVALID_FORMAT" | "RESERVED" | "TAKEN" | null;
  message: string;
};

export const BLOCK_META: Record<
  BlockType,
  { label: string; description: string }
> = {
  HERO: {
    label: "Cabeçalho",
    description: "Foto, nome e frase de destaque",
  },
  CTA_BUTTON: {
    label: "Botão principal",
    description: "Chamada de ação em destaque",
  },
  LINK_BUTTON: {
    label: "Botão de link",
    description: "Link secundário para qualquer URL",
  },
  WHATSAPP: {
    label: "WhatsApp",
    description: "Contato direto pelo WhatsApp",
  },
  SOCIAL: {
    label: "Redes sociais",
    description: "Instagram, TikTok e outras redes",
  },
  SERVICES: {
    label: "Serviços",
    description: "Lista de serviços e preços",
  },
  TESTIMONIALS: {
    label: "Depoimentos",
    description: "Avaliações de clientes",
  },
  LOCATION: {
    label: "Localização",
    description: "Cidade ou endereço do atendimento",
  },
};

export const DEFAULT_THEME: ProfileTheme = {
  primaryColor: "#2b211c",
  backgroundColor: "#faf6f2",
  textColor: "#2b211c",
  buttonStyle: "pill",
  font: "sans",
  background: "#faf6f2",
  text: "#2b211c",
  muted: "#8a6f66",
  accent: "#2b211c",
  card: "#ffffff",
  line: "#eadfd8",
};

export function isTempUsername(username: string | null | undefined) {
  return !username || username.startsWith("user-");
}

/** Onboarding só enquanto o username ainda é o temporário `user-...`. */
export function needsOnboarding(profile: Profile | null | undefined) {
  if (!profile) return true;
  return isTempUsername(profile.username);
}

export function formatPriceFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function serviceHasPrice(item: Pick<ServiceItem, "priceCents">) {
  return (item.priceCents ?? 0) > 0;
}

export function sortBySortOrder<T extends { id: string; sortOrder: number }>(
  items: T[],
) {
  return [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
  );
}

export function parsePriceToCents(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return 0;
  // Se o usuário digitar "180" ou "180,00" / "R$ 180,00"
  if (value.includes(",") || value.includes(".")) {
    const normalized = value
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const num = Number(normalized);
    if (Number.isFinite(num)) return Math.round(num * 100);
  }
  // Só dígitos: trata como reais inteiros
  return Number(digits) * 100;
}
