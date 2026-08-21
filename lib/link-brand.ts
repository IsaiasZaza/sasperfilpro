import type { SocialNetwork } from "@/lib/types/profile";

export type LinkBrand = SocialNetwork | "whatsapp" | "link";

const HOST_BRAND: Array<[RegExp, LinkBrand]> = [
  [/instagram\.com/i, "instagram"],
  [/tiktok\.com/i, "tiktok"],
  [/youtube\.com|youtu\.be/i, "youtube"],
  [/facebook\.com|fb\.com|fb\.me/i, "facebook"],
  [/linkedin\.com/i, "linkedin"],
  [/(^|\.)x\.com|twitter\.com/i, "x"],
  [/wa\.me|whatsapp\.com/i, "whatsapp"],
];

const BRAND_FILL: Record<LinkBrand, { background: string; color: string }> = {
  instagram: {
    color: "#fff",
    background:
      "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
  },
  tiktok: { color: "#fff", background: "#111111" },
  youtube: { color: "#fff", background: "#ff0000" },
  facebook: { color: "#fff", background: "#1877f2" },
  linkedin: { color: "#fff", background: "#0a66c2" },
  x: { color: "#fff", background: "#111111" },
  site: { color: "#fff", background: "#14110e" },
  whatsapp: { color: "#fff", background: "#128c4b" },
  link: { color: "#fff", background: "#14110e" },
};

function hostFromUrl(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function linkHostname(url?: string) {
  return hostFromUrl(url);
}

export function guessLinkBrand(url?: string): LinkBrand {
  const host = hostFromUrl(url);
  if (!host) return "link";
  const match = HOST_BRAND.find(([pattern]) => pattern.test(host));
  return match?.[1] || "link";
}

export function resolveLinkBrand(
  icon: string | undefined,
  url?: string,
): LinkBrand | "emoji" {
  const value = (icon || "").trim();
  if (!value || value === "auto") return guessLinkBrand(url);
  const known: LinkBrand[] = [
    "instagram",
    "tiktok",
    "youtube",
    "facebook",
    "linkedin",
    "x",
    "site",
    "whatsapp",
    "link",
  ];
  if (known.includes(value as LinkBrand)) return value as LinkBrand;
  return "emoji";
}

export function brandFill(
  brand: LinkBrand,
  accent = "#14110e",
): { background: string; color: string } {
  if (brand === "link") return { background: accent, color: "#fff" };
  return BRAND_FILL[brand];
}
