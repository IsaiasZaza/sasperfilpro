"use client";

import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { StatusBar } from "@/components/mockups/phone-frame";
import {
  LinkBrandGlyph,
  SocialIcon,
  SOCIAL_BRAND,
  WhatsAppIcon,
} from "@/components/profile/brand-icons";
import {
  alignStack,
  avatarPixels,
  avatarRadius,
  buttonMetrics,
  buttonShellClass,
  hoverClass,
  justifyAlign,
  coverRadius,
  lookFontPx,
  lookFontSize,
  lookFrom,
  lookPadding,
  lookRadius,
  mediaRadius,
  pulseStyle,
  socialIconPixels,
  surfaceClass,
  surfaceStyle,
  testimonialGap,
  withoutPadding,
} from "@/lib/block-look";
import {
  brandFill,
  guessLinkBrand,
  linkHostname,
  resolveLinkBrand,
} from "@/lib/link-brand";
import { ThemeAtmosphere } from "@/components/profile/theme-atmosphere";
import { pageFontClass } from "@/lib/page-fonts";
import { resolvePaintTheme } from "@/lib/theme";
import {
  BLOCK_META,
  type CtaButtonContent,
  type HeroContent,
  type LinkButtonContent,
  type LocationContent,
  type ProfileBlock,
  type PublicPage,
  type ServiceItem,
  type ServicesContent,
  type SocialContent,
  type SocialNetwork,
  type TestimonialsContent,
  type TestimonialItem,
  type WhatsAppContent,
  serviceHasPrice,
  sortBySortOrder,
} from "@/lib/types/profile";
import { normalizeWhatsAppPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

function whatsappHref(phone: string, message?: string) {
  const digits = normalizeWhatsAppPhone(phone);
  const text = encodeURIComponent(message || "");
  // Só monta link com número quando houver DDI completo (10–15 dígitos).
  if (digits.length >= 10) {
    return `https://wa.me/${digits}?text=${text}`;
  }
  return text ? `https://wa.me/?text=${text}` : "https://wa.me/";
}

function whatsappLabel(label?: string | null) {
  const value = (label || "").trim();
  if (!value || /^whatsapp$/i.test(value)) return "Agendar no WhatsApp";
  return value;
}

function pageWhatsApp(page: PublicPage) {
  const block = (page.blocks || []).find(
    (item) => item.type === "WHATSAPP" && item.isVisible,
  );
  if (!block) return null;
  return block.content as WhatsAppContent;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** Micro-interação de hover/toque. Pulse já anima transform — não empilhar. */
function tapClass(look: { pulse?: boolean; hover?: "none" | "lift" | "scale" | "glow" }) {
  return hoverClass(look);
}

function mapsEmbedSrc(address: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
}

function mapsOpenHref(address: string, explicit?: string | null) {
  const given = (explicit || "").trim();
  if (given) return given;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function BlockView({
  block,
  theme,
  page,
  motion,
}: {
  block: ProfileBlock;
  theme: ReturnType<typeof resolvePaintTheme>;
  page: PublicPage;
  motion?: boolean;
}) {
  if (!block.isVisible) return null;
  const look = lookFrom(block.content);

  switch (block.type) {
    case "HERO": {
      const content = block.content as HeroContent;
      const name =
        content.name !== undefined
          ? content.name.trim() || page.username || "Seu nome"
          : page.displayName || page.username || "Seu nome";
      const headline =
        content.headline !== undefined ? content.headline : page.headline || "";
      const avatarUrl = page.avatarUrl || content.avatarUrl || null;
      const locationText =
        content.location !== undefined ? content.location : page.location || "";
      const bioText =
        content.bio !== undefined ? content.bio : page.bio || "";
      const hasLocationBlock = (page.blocks || []).some(
        (item) => item.type === "LOCATION" && item.isVisible,
      );
      const color = look.textColor || theme.text;
      const photo = avatarPixels(look.avatarSize);
      const radius = avatarRadius(look.avatarShape);
      const layout =
        content.layout ||
        (look.align === "left" || look.align === "right" ? "split" : "stack");
      const stacked = layout !== "split";
      const bannerUrl = (content.bannerUrl || "").trim() || null;
      const ring = look.borderColor || (look.surface === "neon" ? theme.accent : undefined);
      const avatarNode = avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="shrink-0 object-cover"
          style={{
            width: photo,
            height: photo,
            borderRadius: radius,
            border: ring ? `2px solid ${ring}` : undefined,
            boxShadow:
              look.surface === "neon"
                ? `0 0 18px ${theme.accent}80`
                : look.surface === "comic"
                  ? `3px 3px 0 ${theme.text}`
                  : undefined,
          }}
        />
      ) : (
        <div
          className="flex shrink-0 items-center justify-center font-semibold text-white"
          style={{
            width: photo,
            height: photo,
            borderRadius: radius,
            fontSize: Math.max(14, photo * 0.28),
            background: look.backgroundColor
              ? `linear-gradient(145deg, ${theme.muted}, ${look.backgroundColor})`
              : `linear-gradient(145deg, ${theme.muted}, ${theme.accent})`,
            border: ring ? `2px solid ${ring}` : undefined,
            boxShadow:
              look.surface === "neon"
                ? `0 0 18px ${theme.accent}80`
                : look.surface === "comic"
                  ? `3px 3px 0 ${theme.text}`
                  : undefined,
          }}
        >
          {initials(name)}
        </div>
      );
      const avatar = motion ? (
        <span className="pp-avatar shrink-0">{avatarNode}</span>
      ) : (
        avatarNode
      );
      const texts = (
        <div
          className={cn(
            "min-w-0",
            stacked ? "w-full" : "flex-1",
            stacked
              ? "text-center"
              : look.align === "right"
                ? "text-right"
                : "text-left",
          )}
        >
          <h1
            className="break-words leading-[1.15] tracking-tight"
            style={{ color, fontSize: lookFontPx(look, "title") }}
          >
            {name}
          </h1>
          {page.username && !motion ? (
            <p
              className="mt-1 break-all font-medium"
              style={{ color: theme.muted, fontSize: lookFontPx(look, "meta") }}
            >
              @{page.username}
            </p>
          ) : null}
          {headline ? (
            <p
              className="mt-2 break-words font-medium"
              style={{ color, fontSize: lookFontPx(look, "headline") }}
            >
              {headline}
            </p>
          ) : null}
          {bioText ? (
            <p
              className="mt-2.5 w-full break-words whitespace-pre-line leading-relaxed"
              style={{ color: theme.muted, fontSize: lookFontPx(look, "bio") }}
            >
              {bioText}
            </p>
          ) : null}
          {locationText && !hasLocationBlock ? (
            <p
              className={cn(
                "mt-2 flex items-center gap-1",
                stacked
                  ? "justify-center"
                  : look.align === "right"
                    ? "justify-end"
                    : "justify-start",
              )}
              style={{ color: theme.muted, fontSize: lookFontPx(look, "meta") }}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 break-words">{locationText}</span>
            </p>
          ) : null}
        </div>
      );
      if (layout === "banner") {
        const coverH = bannerUrl
          ? Math.min(200, Math.max(160, Math.round(photo * 0.55 + 88)))
          : Math.min(132, Math.max(100, Math.round(photo * 0.35 + 64)));
        const framed =
          look.surface === "card" ||
          look.surface === "glass" ||
          look.surface === "neon" ||
          look.surface === "comic" ||
          Boolean(look.backgroundColor);
        const plate = framed
          ? look.backgroundColor || theme.card
          : theme.background;
        const frameRadius =
          look.surface === "comic"
            ? "0 0 8px 8px"
            : coverRadius(look.radius);
        const padX = framed ? 16 : 8;
        const padBottom = framed ? 18 : 8;
        const portrait = (
          <span
            className="inline-flex shrink-0"
            style={{
              borderRadius: radius,
              boxShadow: `0 0 0 3px ${plate}, 0 12px 28px -10px rgba(0,0,0,0.4)`,
            }}
          >
            {avatar}
          </span>
        );
        return (
          <div
            className={cn("w-full", framed && "overflow-hidden", surfaceClass(look))}
            style={
              framed
                ? {
                    ...withoutPadding(
                      surfaceStyle(look, {
                        background: theme.card,
                        color,
                        radius: frameRadius,
                        border:
                          look.surface === "card" || look.surface === "glass"
                            ? `1px solid ${theme.line}`
                            : undefined,
                        shadowColor: theme.accent,
                      }),
                    ),
                    borderRadius: frameRadius,
                  }
                : undefined
            }
          >
            <div className="relative">
              <div
                className="relative overflow-hidden"
                style={{
                  height: coverH,
                  borderRadius: framed ? undefined : coverRadius(look.radius),
                }}
              >
                {bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bannerUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `radial-gradient(ellipse 80% 70% at 50% 110%, color-mix(in srgb, ${theme.accent} 38%, transparent), transparent 58%), radial-gradient(ellipse 90% 55% at 50% -20%, color-mix(in srgb, ${theme.accent} 32%, transparent), transparent 52%), linear-gradient(180deg, color-mix(in srgb, ${theme.accent} 16%, ${theme.background}) 0%, ${theme.background} 100%)`,
                    }}
                  />
                )}
                <div
                  className="pp-cover-fade"
                  style={{ ["--cover-fade" as string]: plate }}
                />
              </div>
              <div className="absolute bottom-0 left-1/2 z-[1] -translate-x-1/2 translate-y-1/2">
                {portrait}
              </div>
            </div>
            <div
              style={{
                paddingTop: photo / 2 + 16,
                paddingRight: padX,
                paddingBottom: padBottom,
                paddingLeft: padX,
              }}
            >
              {texts}
            </div>
          </div>
        );
      }
      return (
        <div
          className={cn(
            "flex w-full px-3 pb-4 pt-3",
            surfaceClass(look),
            stacked
              ? "flex-col items-center gap-6"
              : look.align === "right"
                ? "flex-row-reverse items-center gap-5"
                : "flex-row items-center gap-5",
          )}
          style={surfaceStyle(look, {
            padding:
              look.backgroundColor ||
              look.borderColor ||
              look.surface === "card" ||
              look.surface === "glass" ||
              look.shadow === "soft" ||
              look.shadow === "hard" ||
              look.shadow === "glow"
                ? "16px 14px"
                : undefined,
            radius:
              look.backgroundColor ||
              look.borderColor ||
              look.surface === "card" ||
              look.surface === "glass" ||
              look.shadow === "soft"
                ? "1.35rem"
                : undefined,
            shadowColor: theme.accent,
          })}
        >
          {avatar}
          {texts}
        </div>
      );
    }
    case "LOCATION": {
      const content = block.content as LocationContent;
      // Só o endereço do bloco — não reutilizar page.location (evita cidade “presa” em 2 fontes).
      const text = (content.address || "").trim();
      if (!text) return null;
      const href = content.mapsUrl || content.url;
      const color = look.textColor || theme.text;
      const sizes = {
        title: lookFontPx(look, "title"),
        headline: lookFontPx(look, "headline"),
        body: lookFontPx(look, "body"),
        meta: lookFontPx(look, "meta"),
        button: lookFontPx(look, "button"),
        label: lookFontPx(look, "heading"),
        price: lookFontPx(look, "price"),
        bio: lookFontPx(look, "bio"),
      };
      const align = look.align || "center";
      const full = look.width !== "fit";
      const withMap = content.layout === "map";
      const openHref = mapsOpenHref(text, href);
      const card = (
        <div
          className={cn(
            "flex items-center gap-3",
            !withMap && surfaceClass(look),
            align === "right" && "flex-row-reverse",
            align === "center" && !full && "justify-center",
            look.pulse && !withMap && "block-pulse",
          )}
          style={
            withMap
              ? { color, padding: "14px" }
              : {
                  ...surfaceStyle(look, {
                    background: theme.card,
                    color,
                    radius: "1rem",
                    border: `1px solid ${theme.line}`,
                    padding: "14px",
                    shadowColor: theme.accent,
                  }),
                  ...pulseStyle(theme.accent),
                }
          }
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${theme.accent}14`, color: theme.accent }}
          >
            <MapPin className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "min-w-0",
              full && "flex-1",
              align === "right"
                ? "text-right"
                : align === "center"
                  ? "text-center"
                  : "text-left",
            )}
          >
            <span
              className="block font-semibold leading-snug"
              style={{ fontSize: sizes.body }}
            >
              {text}
            </span>
            {withMap ? null : (
              <span
                className={cn(
                  "mt-0.5 flex items-center gap-0.5 font-medium",
                  align === "right" && "justify-end flex-row-reverse",
                  align === "center" && "justify-center",
                )}
                style={{ color: theme.muted, fontSize: sizes.meta }}
              >
                {content.label || "Abrir no Maps"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            )}
          </span>
        </div>
      );
      if (withMap) {
        return (
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={content.label || `Abrir ${text} no Google Maps`}
            className={cn(
              "block w-full overflow-hidden",
              surfaceClass(look),
              tapClass(look),
              look.pulse && "block-pulse",
            )}
            style={{
              ...surfaceStyle(look, {
                background: theme.card,
                color,
                radius: mediaRadius(look.radius, "1.25rem"),
                border: `1px solid ${theme.line}`,
                padding: "0",
                shadowColor: theme.accent,
              }),
              borderRadius: mediaRadius(look.radius, "1.25rem"),
              padding: 0,
              ...pulseStyle(theme.accent),
            }}
          >
            <div className="relative h-44 overflow-hidden sm:h-48">
              <iframe
                title={`Mapa de ${text}`}
                src={mapsEmbedSrc(text)}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-[46%] border-0"
                loading="lazy"
                tabIndex={-1}
                aria-hidden
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${theme.card} 0%, color-mix(in srgb, ${theme.card} 72%, transparent) 34%, transparent 62%)`,
                }}
              />
              <span className="pp-map-chip absolute bottom-3 right-3">
                {content.label || "Abrir no Maps"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            {card}
          </a>
        );
      }
      return (
        <div
          className={cn(
            "flex w-full flex-col gap-2",
            justifyAlign(align),
          )}
        >
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              full ? "w-full" : "w-auto max-w-full",
              tapClass(look),
            )}
          >
            {card}
          </a>
        </div>
      );
    }
    case "CTA_BUTTON": {
      const content = block.content as CtaButtonContent;
      const style = content.style || "primary";
      const sizes = {
        title: lookFontPx(look, "title"),
        headline: lookFontPx(look, "headline"),
        body: lookFontPx(look, "body"),
        meta: lookFontPx(look, "meta"),
        button: lookFontPx(look, "button"),
        label: lookFontPx(look, "heading"),
        price: lookFontPx(look, "price"),
        bio: lookFontPx(look, "bio"),
      };
      const fill =
        look.backgroundColor ||
        (style === "outline"
          ? "transparent"
          : style === "secondary"
            ? theme.card
            : theme.accent);
      const lookStyle = {
        ...surfaceStyle(look, {
          background: fill,
          color:
            look.textColor ||
            (style === "outline"
              ? theme.accent
              : style === "secondary"
                ? theme.text
                : "#fff"),
          radius: theme.buttonRadius,
          border:
            style === "outline"
              ? `1.5px solid ${look.borderColor || theme.accent}`
              : style === "secondary"
                ? `1px solid ${look.borderColor || theme.line}`
                : look.borderColor
                  ? `1px solid ${look.borderColor}`
                  : undefined,
          padding: buttonMetrics(lookFontSize(look, "button")).padding,
          shadowColor: theme.accent,
        }),
      };
      const ctaMetrics = buttonMetrics(lookFontSize(look, "button"));
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={content.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonShellClass(
              look,
              cn(
                surfaceClass(look),
                tapClass(look),
                motion && style === "primary" && "pp-sheen",
              ),
            )}
            style={{
              ...lookStyle,
              minHeight: ctaMetrics.minHeight,
              gap: ctaMetrics.gap,
              fontSize: sizes.button,
              ...pulseStyle(
                style === "primary"
                  ? look.backgroundColor || theme.accent
                  : theme.text,
              ),
            }}
          >
            {content.label || "Botão"}
          </a>
        </div>
      );
    }
    case "LINK_BUTTON": {
      const content = block.content as LinkButtonContent;
      const color = look.textColor || theme.text;
      const brand = resolveLinkBrand(content.icon, content.url);
      const fill = brandFill(
        brand === "emoji" ? guessLinkBrand(content.url) : brand,
        theme.accent,
      );
      const host = linkHostname(content.url);
      const subtitle = (content.subtitle || "").trim() || host;
      const sizes = {
        title: lookFontPx(look, "title"),
        headline: lookFontPx(look, "headline"),
        body: lookFontPx(look, "body"),
        meta: lookFontPx(look, "meta"),
        button: lookFontPx(look, "button"),
        label: lookFontPx(look, "heading"),
        price: lookFontPx(look, "price"),
        bio: lookFontPx(look, "bio"),
      };
      const linkMetrics = buttonMetrics(lookFontSize(look, "button"));
      const thumb = (content.thumbnailUrl || "").trim() || null;
      const layout = content.layout || (thumb ? "row" : "row");
      const badge = (content.badge || "").trim();
      const icon = (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{
            background: thumb
              ? undefined
              : brand === "emoji"
                ? `${theme.accent}14`
                : fill.background,
            color: brand === "emoji" ? theme.accent : fill.color,
          }}
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <LinkBrandGlyph
              brand={brand}
              emoji={content.icon}
              className="h-[18px] w-[18px]"
            />
          )}
        </span>
      );
      const copy = (
        <span className="min-w-0 flex-1 text-left">
          <span className="flex items-center gap-1.5">
            <span
              className="block font-semibold leading-tight [overflow-wrap:anywhere]"
              style={{ fontSize: sizes.body }}
            >
              {content.label || "Link"}
            </span>
            {badge ? (
              <span
                className="pp-badge shrink-0"
                style={{
                  background: `${theme.accent}18`,
                  color: theme.accent,
                }}
              >
                {badge}
              </span>
            ) : null}
          </span>
          {subtitle && layout !== "minimal" ? (
            <span
              className="mt-0.5 block truncate font-medium"
              style={{ color: theme.muted, fontSize: sizes.meta }}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
      );
      if (layout === "cover" && thumb) {
        return (
          <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
            <a
              href={content.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative overflow-hidden",
                surfaceClass(look),
                look.width === "fit" ? "w-auto min-w-[220px]" : "w-full",
                look.pulse && "block-pulse",
                tapClass(look),
              )}
              style={{
                ...surfaceStyle(look, {
                  background: theme.card,
                  color: "#fff",
                  radius: mediaRadius(look.radius, "1.25rem"),
                  border: `1px solid ${theme.line}`,
                  padding: "0",
                  shadowColor: theme.accent,
                }),
                borderRadius: mediaRadius(look.radius, "1.25rem"),
                padding: 0,
                ...pulseStyle(fill.background),
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt=""
                className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-44"
              />
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 48%, transparent 100%)",
                }}
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5">
                <span className="min-w-0 text-left">
                  {badge ? (
                    <span
                      className="pp-badge mb-1.5"
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        color: "#fff",
                      }}
                    >
                      {badge}
                    </span>
                  ) : null}
                  <span
                    className="block truncate font-semibold leading-tight text-white"
                    style={{ fontSize: sizes.body }}
                  >
                    {content.label || "Link"}
                  </span>
                  {subtitle ? (
                    <span
                      className="mt-0.5 block truncate font-medium text-white/75"
                      style={{ fontSize: sizes.meta }}
                    >
                      {subtitle}
                    </span>
                  ) : null}
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
        );
      }
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={content.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group flex items-center gap-3",
              surfaceClass(look),
              look.width === "fit" ? "w-auto min-w-[220px]" : "w-full",
              look.pulse && "block-pulse",
              tapClass(look),
            )}
            style={{
              ...surfaceStyle(look, {
                background: theme.card,
                color,
                radius: theme.buttonRadius,
                border: `1px solid ${theme.line}`,
                padding: layout === "minimal" ? "10px 14px" : "8px 10px",
                shadow: "0 1px 2px rgba(20,17,14,0.05)",
                shadowColor: theme.accent,
              }),
              minHeight: linkMetrics.minHeight + 8,
              ...pulseStyle(fill.background),
            }}
          >
            {layout === "minimal" ? null : icon}
            {copy}
            <ArrowUpRight
              className="h-4 w-4 shrink-0 opacity-45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      );
    }
    case "WHATSAPP": {
      const content = block.content as WhatsAppContent;
      const color = look.textColor || "#fff";
      const fill = look.backgroundColor || "#25D366";
      const metrics = buttonMetrics(lookFontSize(look, "button"));
      const iconBox = Math.max(32, metrics.minHeight - 6);
      const iconPx = Math.max(14, Math.round(iconBox * 0.46));
      const label = whatsappLabel(content.label);
      const showHint = !/whatsapp/i.test(label);
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={whatsappHref(content.phone || "", content.message)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group flex items-center gap-3.5",
              surfaceClass(look),
              look.width === "fit" ? "w-auto min-w-[220px]" : "w-full",
              look.pulse && "block-pulse",
              tapClass(look),
            )}
            style={{
              ...surfaceStyle(look, {
                background: fill,
                color,
                radius: "1.15rem",
                padding: "8px 12px 8px 8px",
                shadow: "0 10px 24px -12px rgba(20, 140, 70, 0.55)",
                shadowColor: fill,
              }),
              minHeight: Math.max(48, metrics.minHeight + 8),
              ...pulseStyle(fill),
            }}
          >
            <span
              className="flex shrink-0 items-center justify-center rounded-full"
              style={{
                width: iconBox,
                height: iconBox,
                background: "rgba(255,255,255,0.22)",
                color,
              }}
            >
              <span
                className="inline-flex"
                style={{ width: iconPx, height: iconPx }}
              >
                <WhatsAppIcon className="h-full w-full" />
              </span>
            </span>
            <span className="min-w-0 flex-1 text-left leading-tight">
              <span
                className="block font-semibold [overflow-wrap:anywhere]"
                style={{ fontSize: lookFontPx(look, "button") }}
              >
                {label}
              </span>
              {showHint ? (
                <span
                  className="mt-0.5 block font-medium"
                  style={{
                    fontSize: lookFontPx(look, "meta"),
                    opacity: 0.78,
                  }}
                >
                  WhatsApp
                </span>
              ) : null}
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 opacity-55 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      );
    }
    case "SOCIAL": {
      const content = block.content as SocialContent;
      const items = content.items || [];
      if (items.length === 0) return null;
      const layout = content.layout || "icons";
      const socialStyle = content.style || "brand";
      const sizes = {
        title: lookFontPx(look, "title"),
        headline: lookFontPx(look, "headline"),
        body: lookFontPx(look, "body"),
        meta: lookFontPx(look, "meta"),
        button: lookFontPx(look, "button"),
        label: lookFontPx(look, "heading"),
        price: lookFontPx(look, "price"),
        bio: lookFontPx(look, "bio"),
      };
      const iconBox = Math.max(44, socialIconPixels(look.fontSize));
      const paintSocial = (brand: (typeof SOCIAL_BRAND)[keyof typeof SOCIAL_BRAND]) => {
        if (socialStyle === "mono") {
          return {
            background: theme.accent,
            color: look.textColor || "#fff",
            border: undefined as string | undefined,
            glow: theme.accent,
          };
        }
        if (socialStyle === "ghost") {
          return {
            background: "transparent",
            color: look.textColor || brand.ink,
            border: `1.5px solid ${look.borderColor || brand.ink}`,
            glow: brand.glow,
          };
        }
        return {
          background: look.backgroundColor || brand.background,
          color: look.textColor || brand.color,
          border: look.borderColor ? `1px solid ${look.borderColor}` : undefined,
          glow: brand.glow,
        };
      };
      if (layout === "buttons") {
        return (
          <div className="space-y-2">
            {items.map((item, index) => {
              const brand = SOCIAL_BRAND[item.network] || SOCIAL_BRAND.site;
              const paint = paintSocial(brand);
              return (
                <div
                  key={`${item.network}-${item.url}-${index}`}
                  className={cn(
                    "flex",
                    look.width === "fit" && justifyAlign(look.align),
                  )}
                >
                  <a
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonShellClass(
                      look,
                      cn(
                        "group min-h-12 gap-3 overflow-hidden font-medium",
                        surfaceClass(look),
                        look.pulse ? undefined : "pp-social",
                      ),
                    )}
                    style={{
                      ...surfaceStyle(look, {
                        background: paint.background,
                        color: paint.color,
                        radius: theme.buttonRadius,
                        padding: "8px 14px 8px 8px",
                        shadowColor: paint.glow,
                      }),
                      border: paint.border,
                      fontSize: sizes.body,
                      ["--social-glow" as string]: paint.glow,
                      ...pulseStyle(look.backgroundColor || paint.glow),
                    }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background:
                          socialStyle === "ghost"
                            ? `${brand.ink}14`
                            : "rgba(255,255,255,0.2)",
                        color: paint.color,
                      }}
                    >
                      <SocialIcon network={item.network} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-left">
                      {item.label || networkFallback(item.network)}
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 opacity-55 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </a>
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <div
          className={cn("flex flex-wrap gap-3", justifyAlign(look.align))}
          style={surfaceStyle(look, {
            radius: look.backgroundColor ? "1.25rem" : undefined,
            padding: look.backgroundColor ? "12px" : undefined,
          })}
        >
          {items.map((item, index) => {
            const brand = SOCIAL_BRAND[item.network] || SOCIAL_BRAND.site;
            const paint = paintSocial(brand);
            const tiktokRing =
              item.network === "tiktok" &&
              socialStyle === "brand" &&
              !look.backgroundColor;
            return (
              <a
                key={`${item.network}-${item.url}-${index}`}
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label || networkFallback(item.network)}
                className={cn(
                  "flex items-center justify-center",
                  look.pulse && items.length === 1
                    ? "block-pulse"
                    : "pp-social",
                )}
                style={{
                  width: iconBox,
                  height: iconBox,
                  background: paint.background,
                  color: paint.color,
                  borderRadius: lookRadius(look.radius, "9999px"),
                  border: paint.border,
                  boxShadow: tiktokRing
                    ? "0 0 0 1.5px #25f4ee99, 0 0 0 3px #fe2c5588"
                    : socialStyle === "brand"
                      ? "0 8px 18px -12px rgba(20,17,14,0.55)"
                      : undefined,
                  ["--social-glow" as string]: paint.glow,
                  ...pulseStyle(paint.glow),
                }}
              >
                <SocialIcon
                  network={item.network}
                  className={
                    iconBox >= 56 ? "h-6 w-6" : iconBox <= 44 ? "h-4 w-4" : "h-5 w-5"
                  }
                />
              </a>
            );
          })}
        </div>
      );
    }
    case "SERVICES": {
      const content = block.content as ServicesContent;
      const items = sortBySortOrder(page.services || []).filter(
        (s) => s.isVisible !== false,
      );
      if (items.length === 0) return null;
      const whatsapp = pageWhatsApp(page);
      const headingColor = look.textColor || theme.muted;
      const asCards = content.layout === "cards";
      const sizes = {
        title: lookFontPx(look, "title"),
        headline: lookFontPx(look, "headline"),
        body: lookFontPx(look, "body"),
        meta: lookFontPx(look, "meta"),
        button: lookFontPx(look, "button"),
        label: lookFontPx(look, "heading"),
        price: lookFontPx(look, "price"),
        bio: lookFontPx(look, "bio"),
      };
      return (
        <div
          className={cn("flex flex-col", alignStack(look.align), surfaceClass(look))}
          style={surfaceStyle(look, {
            radius: look.backgroundColor || look.surface === "card" || look.surface === "glass" ? "1.35rem" : undefined,
            padding: look.backgroundColor || look.surface === "card" || look.surface === "glass" ? "14px" : undefined,
            shadowColor: theme.accent,
          })}
        >
          <p
            className="mb-2 w-full font-semibold uppercase tracking-[0.16em]"
            style={{ color: headingColor, fontSize: sizes.label }}
          >
            {content.heading || "Serviços"}
          </p>
          <div className={cn("w-full", asCards ? "grid grid-cols-1 gap-2.5" : "space-y-2")}>
            {items.map((item: ServiceItem) => {
              const showPrice = serviceHasPrice(item);
              const price = showPrice
                ? item.priceFormatted ||
                  (item.priceCents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "";
              const inner = asCards ? (
                <>
                  <span
                    className="block font-medium"
                    style={{
                      color: look.textColor || theme.text,
                      fontSize: sizes.body,
                    }}
                  >
                    {item.name}
                  </span>
                  {item.description ? (
                    <span
                      className="mt-1 block leading-snug"
                      style={{ color: theme.muted, fontSize: sizes.meta }}
                    >
                      {item.description}
                    </span>
                  ) : null}
                  {showPrice ? (
                    <span
                      className="pp-badge mt-2"
                      style={{
                        background: `${theme.accent}18`,
                        color: theme.accent,
                        fontSize: sizes.price,
                      }}
                    >
                      {price}
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="min-w-0 text-left">
                    <span
                      className="block font-medium"
                      style={{
                        color: look.textColor || theme.text,
                        fontSize: sizes.body,
                      }}
                    >
                      {item.name}
                    </span>
                    {item.description ? (
                      <span
                        className="mt-0.5 block leading-snug"
                        style={{ color: theme.muted, fontSize: sizes.meta }}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  {showPrice ? (
                    <span
                      className="shrink-0 font-semibold"
                      style={{ fontSize: sizes.price }}
                    >
                      {price}
                    </span>
                  ) : null}
                </>
              );
              const className = asCards
                ? cn(
                    "flex min-h-24 w-full flex-col items-start",
                    tapClass(look),
                  )
                : cn(
                    "flex min-h-12 w-full items-start justify-between gap-2",
                    tapClass(look),
                  );
              const style = {
                background: look.backgroundColor
                  ? "transparent"
                  : `color-mix(in srgb, ${theme.text} 12%, ${theme.card})`,
                border: `1px solid ${look.borderColor || `color-mix(in srgb, ${theme.text} 22%, ${theme.line})`}`,
                borderRadius: lookRadius(look.radius, asCards ? "1.1rem" : "1rem"),
                padding: asCards ? "14px" : "12px 14px",
                color: theme.text,
              };
              if (whatsapp?.phone) {
                const message = [
                  whatsapp.message || "Oi! Vi seu perfil no PerfilPro",
                  `Quero: ${item.name}`,
                ]
                  .filter(Boolean)
                  .join("\n");
                return (
                  <a
                    key={item.id}
                    href={whatsappHref(whatsapp.phone, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(className)}
                    style={style}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <div key={item.id} className={className} style={style}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case "TESTIMONIALS": {
      const content = block.content as TestimonialsContent;
      const items = (page.testimonials || []).filter(
        (t) => t.isVisible !== false,
      );
      if (items.length === 0) return null;
      const defaultLayout = content.layout || "stack";
      const headingColor = look.textColor || theme.muted;
      const sizes = {
        title: lookFontPx(look, "title"),
        headline: lookFontPx(look, "headline"),
        body: lookFontPx(look, "body"),
        meta: lookFontPx(look, "meta"),
        button: lookFontPx(look, "button"),
        label: lookFontPx(look, "heading"),
        price: lookFontPx(look, "price"),
        bio: lookFontPx(look, "bio"),
      };
      return (
        <div
          className={cn("flex flex-col", alignStack(look.align), surfaceClass(look))}
          style={surfaceStyle(look, {
            radius: look.backgroundColor || look.surface === "card" || look.surface === "glass" ? "1.35rem" : undefined,
            padding: look.backgroundColor || look.surface === "card" || look.surface === "glass" ? "14px" : undefined,
            shadowColor: theme.accent,
          })}
        >
          <p
            className="mb-2 w-full font-semibold uppercase tracking-[0.16em]"
            style={{ color: headingColor, fontSize: sizes.label }}
          >
            {content.heading || "Depoimentos"}
          </p>
          <div className="w-full">
            {items.map((item: TestimonialItem, index) => {
              const itemLayout = item.layout ?? defaultLayout;
              const asQuote = itemLayout === "quote";
              const cardPadding =
                lookPadding(item.padding) ||
                lookPadding(look.padding) ||
                "14px";
              return (
                <div
                  key={item.id}
                  className={asQuote ? "relative px-1 py-2" : undefined}
                  style={{
                    marginBottom:
                      index < items.length - 1
                        ? testimonialGap(item.spacing)
                        : undefined,
                    ...(asQuote
                      ? undefined
                      : {
                          background: look.backgroundColor
                            ? "transparent"
                            : `color-mix(in srgb, ${theme.text} 12%, ${theme.card})`,
                          border: `1px solid ${look.borderColor || `color-mix(in srgb, ${theme.text} 22%, ${theme.line})`}`,
                          borderRadius: lookRadius(look.radius, "1rem"),
                          padding: cardPadding,
                        }),
                  }}
                >
                  {asQuote ? (
                    <span
                      aria-hidden="true"
                      className="absolute -left-1 -top-3 font-serif leading-none"
                      style={{
                        color: theme.accent,
                        fontSize: "2.6rem",
                        opacity: 0.35,
                      }}
                    >
                      “
                    </span>
                  ) : (
                    <div
                      className="mb-1.5 flex gap-0.5"
                      style={{ color: theme.accent }}
                    >
                      {Array.from({
                        length: Math.max(1, Math.min(5, item.rating || 5)),
                      }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="h-3.5 w-3.5 fill-current"
                        />
                      ))}
                    </div>
                  )}
                  <p
                    className="leading-relaxed"
                    style={{
                      color: look.textColor || theme.text,
                      fontSize: asQuote ? sizes.headline : sizes.body,
                    }}
                  >
                    {asQuote ? item.text : `“${item.text}”`}
                  </p>
                  <p
                    className="mt-2 font-semibold"
                    style={{ color: theme.muted, fontSize: sizes.meta }}
                  >
                    {item.authorName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

function networkFallback(network: SocialNetwork) {
  const labels: Record<SocialNetwork, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    x: "X",
    site: "Site",
  };
  return labels[network] || network;
}

/** Atraso da cascata de entrada, com teto pra páginas com muitos blocos. */
function riseDelay(index: number) {
  return { ["--pp-delay" as string]: `${Math.min(index * 70, 700)}ms` };
}

export function ProfilePreview({
  page,
  className,
  showStatusBar = true,
  showHidden = false,
  selectedId,
  onSelectBlock,
  variant = "device",
}: {
  page: PublicPage;
  className?: string;
  showStatusBar?: boolean;
  showHidden?: boolean;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
  /**
   * `device` roda dentro da moldura do editor (scroll próprio).
   * `page` é a bio pública: rola com o documento e ganha a animação de entrada.
   */
  variant?: "device" | "page";
}) {
  const theme = resolvePaintTheme(page.theme);
  const editable = Boolean(onSelectBlock);
  const asPage = variant === "page";
  const blocks = [...(page.blocks || [])]
    .filter((block) => editable || showHidden || block.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hero = blocks.find((block) => block.type === "HERO");
  const heroIsBanner =
    Boolean(hero) && (hero?.content as HeroContent | undefined)?.layout === "banner";
  const hasLocationBlock = blocks.some((block) => block.type === "LOCATION");
  const rest = blocks.filter((block) => block.type !== "HERO");

  return (
    <div
      className={cn(
        "relative",
        asPage ? "w-full" : "h-full overflow-y-auto no-scrollbar",
        pageFontClass(theme.font),
        className,
      )}
      style={
        {
          background: theme.wash,
          color: theme.text,
          ["--preview-canvas"]: theme.background,
          ["--theme-accent"]: theme.accent,
        } as CSSProperties
      }
    >
      {theme.backgroundImage ? (
        <>
          <div
            className="pp-page-photo"
            style={{ backgroundImage: `url("${theme.backgroundImage}")` }}
          />
          {theme.overlay > 0 ? (
            <div
              className="pp-page-overlay"
              style={{ opacity: theme.overlay / 100 }}
            />
          ) : null}
        </>
      ) : null}
      <ThemeAtmosphere atmosphere={theme.atmosphere} accent={theme.accent} />
      <div
        className={cn(
          "relative z-[1]",
          asPage
            ? cn(
                "mx-auto w-full max-w-[30rem] px-5 pb-28",
                heroIsBanner ? "pt-0" : "pt-10 sm:pt-16",
              )
            : cn("px-3.5 pb-16", heroIsBanner ? "pt-0" : "pt-1"),
        )}
      >
        {showStatusBar ? <StatusBar color={theme.text} /> : null}
        <div className={asPage ? "pp-rise" : undefined}>
          {hero ? (
            <div
              className={
                heroIsBanner
                  ? asPage
                    ? "-mx-5"
                    : "-mx-3.5"
                  : undefined
              }
            >
              <SelectableBlock
                id={hero.id}
                label={BLOCK_META[hero.type].label}
                selected={selectedId === hero.id}
                hidden={!hero.isVisible}
                onSelect={onSelectBlock}
                padded={!heroIsBanner}
                flushTop={heroIsBanner}
              >
                <BlockView
                  block={hero}
                  theme={theme}
                  page={page}
                  motion={asPage}
                />
              </SelectableBlock>
            </div>
          ) : (
            <div className="flex flex-col items-center px-3 pt-3 text-center">
              <span className={asPage ? "pp-avatar" : undefined}>
                <span
                  className="flex h-[88px] w-[88px] items-center justify-center rounded-full text-xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(145deg, ${theme.muted}, ${theme.accent})`,
                  }}
                >
                  {initials(page.displayName || page.username || "PP")}
                </span>
              </span>
              <h1 className="mt-6 font-serif text-[1.75rem] leading-tight">
                {page.displayName || page.username}
              </h1>
              {page.username && !asPage ? (
                <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
                  @{page.username}
                </p>
              ) : null}
              {page.headline ? (
                <p className="mt-2 text-[15px] font-medium">{page.headline}</p>
              ) : null}
              {!hasLocationBlock && page.location ? (
                <p
                  className="mt-2 flex items-center justify-center gap-1 text-[13px]"
                  style={{ color: theme.muted }}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {page.location}
                </p>
              ) : null}
            </div>
          )}
        </div>
        <div className={cn(asPage ? "mt-7 space-y-3.5" : "mt-3 space-y-2.5")}>
          {rest.map((block, index) => (
            <div
              key={block.id}
              className={asPage ? "pp-rise" : undefined}
              style={asPage ? riseDelay(index + 1) : undefined}
            >
              <SelectableBlock
                id={block.id}
                label={BLOCK_META[block.type].label}
                selected={selectedId === block.id}
                hidden={!block.isVisible}
                onSelect={onSelectBlock}
              >
                <BlockView
                  block={block}
                  theme={theme}
                  page={page}
                  motion={asPage}
                />
              </SelectableBlock>
            </div>
          ))}
        </div>
        {blocks.length === 0 ? (
          <p
            className="mt-10 text-center text-[13px]"
            style={{ color: theme.muted }}
          >
            Adicione blocos para montar sua página.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SelectableBlock({
  id,
  label,
  selected,
  hidden,
  onSelect,
  padded,
  flushTop,
  children,
}: {
  id: string;
  label: string;
  selected: boolean;
  hidden: boolean;
  onSelect?: (id: string) => void;
  padded?: boolean;
  flushTop?: boolean;
  children: ReactNode;
}) {
  if (!onSelect) return children;
  return (
    <div
      className={cn(
        "relative transition",
        flushTop
          ? "rounded-none rounded-b-[1.35rem]"
          : "rounded-[1.35rem]",
        padded && "px-1 py-1",
        selected &&
          (flushTop
            ? "ring-2 ring-inset ring-lime"
            : "ring-2 ring-lime ring-offset-2 ring-offset-[var(--preview-canvas,#fff)]"),
        hidden && "opacity-45",
      )}
    >
      <div className="pointer-events-none">{children}</div>
      <button
        type="button"
        className={cn(
          "absolute inset-0 z-10 min-h-7",
          flushTop ? "rounded-none rounded-b-[1.35rem]" : "rounded-2xl",
        )}
        aria-label={`Editar ${label}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSelect(id);
        }}
      />
      {hidden ? (
        <span className="pointer-events-none absolute right-1 top-1 z-20 rounded-full bg-ink/80 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
          Oculto
        </span>
      ) : null}
    </div>
  );
}
