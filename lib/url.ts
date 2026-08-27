import type { BlockType } from "@/lib/types/profile";
import { digitsOnly } from "@/lib/phone";

const DEFAULT_URL: Record<"CTA_BUTTON" | "LINK_BUTTON" | "LOCATION" | "SOCIAL", string> =
  {
    CTA_BUTTON: "https://wa.me/",
    LINK_BUTTON: "https://instagram.com/",
    LOCATION: "https://maps.google.com/",
    SOCIAL: "https://instagram.com/",
  };

export function isCompleteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export function normalizeHttpUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    return isCompleteHttpUrl(value) ? value : null;
  }
  const withProtocol = `https://${value}`;
  return isCompleteHttpUrl(withProtocol) ? withProtocol : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function urlOrFallback(
  raw: unknown,
  fallback: unknown,
  preset: string,
): string {
  return (
    normalizeHttpUrl(asString(raw)) ||
    normalizeHttpUrl(asString(fallback)) ||
    preset
  );
}

export function prepareBlockContent(
  type: BlockType,
  content: Record<string, unknown>,
  fallback?: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...content };
  const prev = fallback || {};

  if (type === "CTA_BUTTON") {
    next.label = asString(next.label, asString(prev.label, "Agendar horário"));
    next.style = asString(next.style, asString(prev.style, "primary"));
    next.url = urlOrFallback(next.url, prev.url, DEFAULT_URL.CTA_BUTTON);
  }

  if (type === "LINK_BUTTON") {
    next.label = asString(
      next.label,
      asString(prev.label, "Conheça meu trabalho"),
    );
    next.url = urlOrFallback(next.url, prev.url, DEFAULT_URL.LINK_BUTTON);
    next.icon = asString(next.icon, asString(prev.icon, "auto"));
    next.subtitle = asString(next.subtitle, asString(prev.subtitle));
  }

  if (type === "LOCATION") {
    next.address = asString(next.address);
    next.label = asString(next.label, asString(prev.label, "Ver no mapa"));
    const maps = urlOrFallback(
      next.mapsUrl ?? next.url,
      prev.mapsUrl ?? prev.url,
      DEFAULT_URL.LOCATION,
    );
    next.url = maps;
    next.mapsUrl = maps;
  }

  if (type === "SOCIAL" && Array.isArray(next.items)) {
    next.layout = asString(next.layout, asString(prev.layout, "icons"));
    next.items = (next.items as Array<Record<string, unknown>>).map(
      (item, index) => {
        const prevItems = Array.isArray(prev.items)
          ? (prev.items as Array<Record<string, unknown>>)
          : [];
        return {
          ...item,
          network: asString(item.network, "instagram"),
          url: urlOrFallback(
            item.url,
            prevItems[index]?.url,
            DEFAULT_URL.SOCIAL,
          ),
          label: asString(item.label),
        };
      },
    );
  }

  if (type === "HERO" && "avatarUrl" in next) {
    const avatar =
      normalizeHttpUrl(asString(next.avatarUrl)) ||
      normalizeHttpUrl(asString(prev.avatarUrl));
    if (avatar) next.avatarUrl = avatar;
    else delete next.avatarUrl;
  }

  if (type === "HERO" && "bannerUrl" in next) {
    const banner = normalizeHttpUrl(asString(next.bannerUrl));
    next.bannerUrl = banner || "";
  }

  if (type === "WHATSAPP") {
    next.phone = digitsOnly(asString(next.phone, asString(prev.phone))).slice(
      0,
      15,
    );
    next.message = asString(next.message, asString(prev.message));
    next.label = asString(next.label, asString(prev.label, "WhatsApp"));
  }

  return next;
}
