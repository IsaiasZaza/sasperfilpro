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
  buttonShellClass,
  fontScale,
  justifyAlign,
  lookFrom,
  lookRadius,
  pulseStyle,
  socialIconPixels,
  surfaceStyle,
} from "@/lib/block-look";
import {
  brandFill,
  guessLinkBrand,
  linkHostname,
  resolveLinkBrand,
} from "@/lib/link-brand";
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
} from "@/lib/types/profile";
import { normalizeWhatsAppPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

function whatsappHref(phone: string, message?: string) {
  const digits = normalizeWhatsAppPhone(phone);
  const text = encodeURIComponent(message || "");
  return digits
    ? `https://wa.me/${digits}?text=${text}`
    : `https://wa.me/?text=${text}`;
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

function BlockView({
  block,
  theme,
  page,
}: {
  block: ProfileBlock;
  theme: ReturnType<typeof resolvePaintTheme>;
  page: PublicPage;
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
      const avatarUrl =
        content.avatarUrl !== undefined ? content.avatarUrl : page.avatarUrl;
      const locationText =
        content.location !== undefined ? content.location : page.location || "";
      const bioText =
        content.bio !== undefined ? content.bio : page.bio || "";
      const hasLocationBlock = (page.blocks || []).some(
        (item) => item.type === "LOCATION" && item.isVisible,
      );
      const color = look.textColor || theme.text;
      const sizes = fontScale(look.fontSize);
      const photo = avatarPixels(look.avatarSize);
      const radius = avatarRadius(look.avatarShape);
      const stacked = !look.align || look.align === "center";
      const avatar = avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="shrink-0 object-cover"
          style={{
            width: photo,
            height: photo,
            borderRadius: radius,
            border: look.borderColor ? `2px solid ${look.borderColor}` : undefined,
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
            border: look.borderColor ? `2px solid ${look.borderColor}` : undefined,
          }}
        >
          {initials(name)}
        </div>
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
            className="break-words font-serif leading-[1.15] tracking-tight"
            style={{ color, fontSize: sizes.title }}
          >
            {name}
          </h1>
          {page.username ? (
            <p
              className="mt-1 break-all font-medium"
              style={{ color: theme.muted, fontSize: sizes.meta }}
            >
              @{page.username}
            </p>
          ) : null}
          {headline ? (
            <p
              className="mt-2 break-words font-medium"
              style={{ color, fontSize: sizes.headline }}
            >
              {headline}
            </p>
          ) : null}
          {bioText ? (
            <p
              className="mt-2.5 max-w-[280px] break-words leading-relaxed"
              style={{ color: theme.muted, fontSize: sizes.body }}
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
              style={{ color: theme.muted, fontSize: sizes.meta }}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 break-words">{locationText}</span>
            </p>
          ) : null}
        </div>
      );
      return (
        <div
          className={cn(
            "flex px-3 pb-4 pt-3",
            stacked
              ? "flex-col items-center gap-4"
              : look.align === "right"
                ? "flex-row-reverse items-center gap-3.5"
                : "flex-row items-center gap-3.5",
          )}
          style={surfaceStyle(look, {
            padding:
              look.backgroundColor || look.borderColor || look.shadow === "soft"
                ? "16px 14px"
                : undefined,
            radius:
              look.backgroundColor || look.borderColor || look.shadow === "soft"
                ? "1.35rem"
                : undefined,
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
      const sizes = fontScale(look.fontSize);
      const align = look.align || "center";
      const full = look.width !== "fit";
      const card = (
        <div
          className={cn(
            "flex items-center gap-3",
            align === "right" && "flex-row-reverse",
            align === "center" && !full && "justify-center",
            look.pulse && "block-pulse",
          )}
          style={{
            ...surfaceStyle(look, {
              background: theme.card,
              color,
              radius: "1rem",
              border: `1px solid ${theme.line}`,
              padding: "14px",
            }),
            ...pulseStyle(theme.accent),
          }}
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
            <span
              className={cn(
                "mt-0.5 flex items-center gap-0.5 font-medium",
                align === "right" && "justify-end flex-row-reverse",
                align === "center" && "justify-center",
              )}
              style={{ color: theme.muted, fontSize: sizes.meta }}
            >
              {content.label || "Ver no mapa"}
              {href ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
            </span>
          </span>
        </div>
      );
      return (
        <div className={cn("flex w-full", justifyAlign(align))}>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={full ? "w-full" : "w-auto max-w-full"}
            >
              {card}
            </a>
          ) : (
            <div className={full ? "w-full" : "w-auto max-w-full"}>{card}</div>
          )}
        </div>
      );
    }
    case "CTA_BUTTON": {
      const content = block.content as CtaButtonContent;
      const style = content.style || "primary";
      const sizes = fontScale(look.fontSize);
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
          padding: "12px 16px",
        }),
      };
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={content.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonShellClass(look)}
            style={{
              ...lookStyle,
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
      const sizes = fontScale(look.fontSize);
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={content.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex min-h-14 items-center gap-3 px-2.5 py-2",
              look.width === "fit" ? "w-auto min-w-[220px]" : "w-full",
              look.pulse && "block-pulse",
            )}
            style={{
              ...surfaceStyle(look, {
                background: theme.card,
                color,
                radius: theme.buttonRadius,
                border: `1px solid ${theme.line}`,
                padding: "8px 10px",
                shadow: "0 1px 2px rgba(20,17,14,0.05)",
              }),
              ...pulseStyle(fill.background),
            }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background: brand === "emoji" ? `${theme.accent}14` : fill.background,
                color: brand === "emoji" ? theme.accent : fill.color,
              }}
            >
              <LinkBrandGlyph
                brand={brand}
                emoji={content.icon}
                className="h-[18px] w-[18px]"
              />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span
                className="block truncate font-semibold leading-tight"
                style={{ fontSize: sizes.body }}
              >
                {content.label || "Link"}
              </span>
              {subtitle ? (
                <span
                  className="mt-0.5 block truncate font-medium"
                  style={{ color: theme.muted, fontSize: sizes.meta }}
                >
                  {subtitle}
                </span>
              ) : null}
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 opacity-45"
              aria-hidden="true"
            />
          </a>
        </div>
      );
    }
    case "WHATSAPP": {
      const content = block.content as WhatsAppContent;
      const color = look.textColor || "#fff";
      const sizes = fontScale(look.fontSize);
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={whatsappHref(content.phone || "", content.message)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonShellClass(look)}
            style={{
              ...surfaceStyle(look, {
                background: "#128c4b",
                color,
                radius: theme.buttonRadius,
                padding: "12px 16px",
              }),
              fontSize: sizes.button,
              ...pulseStyle(look.backgroundColor || "#128c4b"),
            }}
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            {whatsappLabel(content.label)}
          </a>
        </div>
      );
    }
    case "SOCIAL": {
      const content = block.content as SocialContent;
      const items = content.items || [];
      if (items.length === 0) return null;
      const layout = content.layout || "icons";
      const sizes = fontScale(look.fontSize);
      const iconBox = socialIconPixels(look.fontSize);
      if (layout === "buttons") {
        return (
          <div className="space-y-2">
            {items.map((item, index) => {
              const brand = SOCIAL_BRAND[item.network] || SOCIAL_BRAND.site;
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
                    className={buttonShellClass(look, "min-h-11 font-medium")}
                    style={{
                      ...surfaceStyle(look, {
                        background: brand.background,
                        color: look.textColor || brand.color,
                        radius: theme.buttonRadius,
                        padding: "10px 14px",
                      }),
                      fontSize: sizes.body,
                      ...pulseStyle(look.backgroundColor || brand.background),
                    }}
                  >
                    <SocialIcon
                      network={item.network}
                      className="h-4 w-4"
                    />
                    {item.label || networkFallback(item.network)}
                  </a>
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <div
          className={cn("flex flex-wrap gap-2.5", justifyAlign(look.align))}
          style={surfaceStyle(look, {
            radius: look.backgroundColor ? "1.25rem" : undefined,
            padding: look.backgroundColor ? "12px" : undefined,
          })}
        >
          {items.map((item, index) => {
            const brand = SOCIAL_BRAND[item.network] || SOCIAL_BRAND.site;
            return (
              <a
                key={`${item.network}-${item.url}-${index}`}
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label || networkFallback(item.network)}
                className={cn(
                  "flex items-center justify-center",
                  look.pulse && "block-pulse",
                )}
                style={{
                  width: iconBox,
                  height: iconBox,
                  background: brand.background,
                  color: look.textColor || brand.color,
                  borderRadius: lookRadius(look.radius, "9999px"),
                  border: look.borderColor
                    ? `1px solid ${look.borderColor}`
                    : undefined,
                  ...pulseStyle(brand.background),
                }}
              >
                <SocialIcon
                  network={item.network}
                  className={
                    iconBox >= 56 ? "h-6 w-6" : iconBox <= 40 ? "h-4 w-4" : "h-5 w-5"
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
      const items = (page.services || []).filter((s) => s.isVisible !== false);
      if (items.length === 0) return null;
      const whatsapp = pageWhatsApp(page);
      const headingColor = look.textColor || theme.muted;
      const sizes = fontScale(look.fontSize);
      return (
        <div
          className={cn("flex flex-col", alignStack(look.align))}
          style={surfaceStyle(look, {
            radius: look.backgroundColor ? "1.35rem" : undefined,
            padding: look.backgroundColor ? "14px" : undefined,
          })}
        >
          <p
            className="mb-2 w-full font-semibold uppercase tracking-[0.16em]"
            style={{ color: headingColor, fontSize: sizes.label }}
          >
            {content.heading || "Serviços"}
          </p>
          <div className="w-full space-y-1.5">
            {items.map((item: ServiceItem) => {
              const price =
                item.priceFormatted ||
                (item.priceCents / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });
              const inner = (
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
                  <span
                    className="shrink-0 font-semibold"
                    style={{ fontSize: sizes.body }}
                  >
                    {price}
                  </span>
                </>
              );
              const className =
                "flex min-h-12 w-full items-start justify-between gap-2";
              const style = {
                background: look.backgroundColor ? "transparent" : theme.card,
                border: `1px solid ${look.borderColor || theme.line}`,
                borderRadius: lookRadius(look.radius, "1rem"),
                padding: "12px 14px",
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
                    className={className}
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
      const headingColor = look.textColor || theme.muted;
      const sizes = fontScale(look.fontSize);
      return (
        <div
          className={cn("flex flex-col", alignStack(look.align))}
          style={surfaceStyle(look, {
            radius: look.backgroundColor ? "1.35rem" : undefined,
            padding: look.backgroundColor ? "14px" : undefined,
          })}
        >
          <p
            className="mb-2 w-full font-semibold uppercase tracking-[0.16em]"
            style={{ color: headingColor, fontSize: sizes.label }}
          >
            {content.heading || "Depoimentos"}
          </p>
          <div className="w-full space-y-2">
            {items.map((item: TestimonialItem) => (
              <div
                key={item.id}
                style={{
                  background: look.backgroundColor ? "transparent" : theme.card,
                  border: `1px solid ${look.borderColor || theme.line}`,
                  borderRadius: lookRadius(look.radius, "1rem"),
                  padding: "14px",
                }}
              >
                <div className="mb-1.5 flex gap-0.5 text-amber-500">
                  {Array.from({
                    length: Math.max(1, Math.min(5, item.rating || 5)),
                  }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p
                  className="leading-relaxed"
                  style={{
                    color: look.textColor || theme.text,
                    fontSize: sizes.body,
                  }}
                >
                  “{item.text}”
                </p>
                <p
                  className="mt-2 font-semibold"
                  style={{ color: theme.text, fontSize: sizes.meta }}
                >
                  {item.authorName}
                </p>
              </div>
            ))}
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

export function ProfilePreview({
  page,
  className,
  showStatusBar = true,
  showHidden = false,
  selectedId,
  onSelectBlock,
}: {
  page: PublicPage;
  className?: string;
  showStatusBar?: boolean;
  showHidden?: boolean;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
}) {
  const theme = resolvePaintTheme(page.theme);
  const editable = Boolean(onSelectBlock);
  const blocks = [...(page.blocks || [])]
    .filter((block) => editable || showHidden || block.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hero = blocks.find((block) => block.type === "HERO");
  const hasLocationBlock = blocks.some((block) => block.type === "LOCATION");
  const rest = blocks.filter((block) => block.type !== "HERO");

  return (
    <div
      className={cn(
        "h-full overflow-y-auto no-scrollbar",
        theme.font === "serif" && "font-serif",
        theme.font === "mono" && "font-mono",
        theme.font === "sans" && "font-sans",
        className,
      )}
      style={
        {
          background: theme.background,
          color: theme.text,
          ["--preview-canvas"]: theme.background,
        } as CSSProperties
      }
    >
      {showStatusBar ? <StatusBar color={theme.text} /> : null}
      <div className="px-3.5 pb-16 pt-1">
        {hero ? (
          <SelectableBlock
            id={hero.id}
            label={BLOCK_META[hero.type].label}
            selected={selectedId === hero.id}
            hidden={!hero.isVisible}
            onSelect={onSelectBlock}
            padded
          >
            <BlockView block={hero} theme={theme} page={page} />
          </SelectableBlock>
        ) : (
          <div className="flex flex-col items-center px-3 pt-3 text-center">
            <div
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full text-xl font-semibold text-white"
              style={{
                background: `linear-gradient(145deg, ${theme.muted}, ${theme.accent})`,
              }}
            >
              {initials(page.displayName || page.username || "PP")}
            </div>
            <h1 className="mt-4 font-serif text-[1.75rem] leading-tight">
              {page.displayName || page.username}
            </h1>
            {page.username ? (
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
        <div className="mt-3 space-y-2.5">
          {rest.map((block) => (
            <SelectableBlock
              key={block.id}
              id={block.id}
              label={BLOCK_META[block.type].label}
              selected={selectedId === block.id}
              hidden={!block.isVisible}
              onSelect={onSelectBlock}
            >
              <BlockView block={block} theme={theme} page={page} />
            </SelectableBlock>
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
  children,
}: {
  id: string;
  label: string;
  selected: boolean;
  hidden: boolean;
  onSelect?: (id: string) => void;
  padded?: boolean;
  children: ReactNode;
}) {
  if (!onSelect) return children;
  return (
    <div
      className={cn(
        "relative rounded-[1.35rem] transition",
        padded && "px-1 py-1",
        selected &&
          "ring-2 ring-lime ring-offset-2 ring-offset-[var(--preview-canvas,#fff)]",
        hidden && "opacity-45",
      )}
    >
      <div className="pointer-events-none">{children}</div>
      <button
        type="button"
        className="absolute inset-0 z-10 min-h-7 rounded-2xl"
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
