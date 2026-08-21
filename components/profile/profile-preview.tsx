"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { StatusBar } from "@/components/mockups/phone-frame";
import {
  SocialIcon,
  SOCIAL_BRAND,
  WhatsAppIcon,
} from "@/components/profile/brand-icons";
import {
  alignStack,
  buttonShellClass,
  justifyAlign,
  lookFrom,
  pulseStyle,
} from "@/lib/block-look";
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
import { cn } from "@/lib/utils";

function whatsappHref(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
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
        content.name || page.displayName || page.username || "Seu nome";
      const headline = content.headline || page.headline || "";
      const avatarUrl = content.avatarUrl || page.avatarUrl;
      const locationText = content.location || page.location || "";
      const hasLocationBlock = (page.blocks || []).some(
        (item) => item.type === "LOCATION" && item.isVisible,
      );
      const color = look.textColor || theme.text;
      return (
        <div
          className={cn(
            "flex flex-col px-5 pb-5 pt-8",
            alignStack(look.align),
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="h-[88px] w-[88px] rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full text-xl font-semibold text-white"
              style={{
                background: `linear-gradient(145deg, ${theme.muted}, ${theme.accent})`,
              }}
            >
              {initials(name)}
            </div>
          )}
          <h1
            className="mt-4 font-serif text-[1.75rem] leading-tight tracking-tight"
            style={{ color }}
          >
            {name}
          </h1>
          {page.username ? (
            <p
              className="mt-1 text-[13px] font-medium"
              style={{ color: theme.muted }}
            >
              @{page.username}
            </p>
          ) : null}
          {headline ? (
            <p
              className="mt-2 text-[15px] font-medium"
              style={{ color }}
            >
              {headline}
            </p>
          ) : null}
          {content.bio || page.bio ? (
            <p
              className="mt-2.5 max-w-[280px] text-[14px] leading-relaxed"
              style={{ color: theme.muted }}
            >
              {content.bio || page.bio}
            </p>
          ) : null}
          {locationText && !hasLocationBlock ? (
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-[13px]",
                justifyAlign(look.align),
              )}
              style={{ color: theme.muted }}
            >
              <MapPin className="h-3.5 w-3.5" />
              {locationText}
            </p>
          ) : null}
        </div>
      );
    }
    case "LOCATION": {
      const content = block.content as LocationContent;
      const text = content.address || page.location || "";
      if (!text.trim()) return null;
      const href = content.mapsUrl || content.url;
      const color = look.textColor || theme.text;
      const card = (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3.5 py-3.5",
            look.pulse && "block-pulse",
          )}
          style={{
            background: theme.card,
            border: `1px solid ${theme.line}`,
            color,
            ...pulseStyle(theme.accent),
          }}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${theme.accent}14`, color: theme.accent }}
          >
            <MapPin className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[14px] font-semibold leading-snug">
              {text}
            </span>
            <span
              className="mt-0.5 flex items-center gap-0.5 text-[12px] font-medium"
              style={{ color: theme.muted }}
            >
              {content.label || "Ver no mapa"}
              {href ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
            </span>
          </span>
        </div>
      );
      return (
        <div className={cn("flex", justifyAlign(look.align))}>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={look.width === "fit" ? "w-auto max-w-full" : "w-full"}
            >
              {card}
            </a>
          ) : (
            <div className={look.width === "fit" ? "w-auto max-w-full" : "w-full"}>
              {card}
            </div>
          )}
        </div>
      );
    }
    case "CTA_BUTTON": {
      const content = block.content as CtaButtonContent;
      const style = content.style || "primary";
      const radius = theme.buttonRadius;
      const lookStyle =
        style === "outline"
          ? {
              background: "transparent",
              color: look.textColor || theme.accent,
              border: `1.5px solid ${theme.accent}`,
              borderRadius: radius,
            }
          : style === "secondary"
            ? {
                background: theme.card,
                color: look.textColor || theme.text,
                border: `1px solid ${theme.line}`,
                borderRadius: radius,
              }
            : {
                background: theme.accent,
                color: look.textColor || "#fff",
                borderRadius: radius,
              };
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={content.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonShellClass(look, "text-[15px]")}
            style={{
              ...lookStyle,
              ...pulseStyle(
                style === "primary" ? theme.accent : theme.text,
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
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={content.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonShellClass(look, "min-h-11 text-[14px] font-medium")}
            style={{
              background: theme.card,
              color,
              border: `1px solid ${theme.line}`,
              borderRadius: theme.buttonRadius,
              ...pulseStyle(theme.text),
            }}
          >
            {content.icon ? <span>{content.icon}</span> : null}
            {content.label || "Link"}
          </a>
        </div>
      );
    }
    case "WHATSAPP": {
      const content = block.content as WhatsAppContent;
      const color = look.textColor || "#fff";
      return (
        <div className={cn("flex", look.width === "fit" && justifyAlign(look.align))}>
          <a
            href={whatsappHref(content.phone || "", content.message)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonShellClass(look, "text-[15px]")}
            style={{
              background: "#128c4b",
              color,
              borderRadius: theme.buttonRadius,
              ...pulseStyle("#128c4b"),
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
                    className={buttonShellClass(
                      look,
                      "min-h-11 text-[13px] font-medium",
                    )}
                    style={{
                      background: brand.background,
                      color: look.textColor || brand.color,
                      borderRadius: theme.buttonRadius,
                      ...pulseStyle(brand.background),
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
        <div className={cn("flex flex-wrap gap-2.5", justifyAlign(look.align))}>
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
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  look.pulse && "block-pulse",
                )}
                style={{
                  background: brand.background,
                  color: look.textColor || brand.color,
                  ...pulseStyle(brand.background),
                }}
              >
                <SocialIcon network={item.network} className="h-5 w-5" />
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
      return (
        <div className={cn("flex flex-col", alignStack(look.align))}>
          <p
            className="mb-2 w-full text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: headingColor }}
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
                      className="block text-[14px] font-medium"
                      style={{ color: look.textColor || theme.text }}
                    >
                      {item.name}
                    </span>
                    {item.description ? (
                      <span
                        className="mt-0.5 block text-[12px] leading-snug"
                        style={{ color: theme.muted }}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-semibold">
                    {price}
                    {whatsapp?.phone ? (
                      <WhatsAppIcon className="h-3.5 w-3.5 text-[#128c4b]" />
                    ) : null}
                  </span>
                </>
              );
              const className =
                "flex min-h-12 w-full items-start justify-between gap-2 rounded-2xl px-3.5 py-3";
              const style = {
                background: theme.card,
                border: `1px solid ${theme.line}`,
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
      return (
        <div className={cn("flex flex-col", alignStack(look.align))}>
          <p
            className="mb-2 w-full text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: headingColor }}
          >
            {content.heading || "Depoimentos"}
          </p>
          <div className="w-full space-y-2">
            {items.map((item: TestimonialItem) => (
              <div
                key={item.id}
                className="rounded-2xl px-3.5 py-3.5"
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.line}`,
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
                  className="text-[14px] leading-relaxed"
                  style={{ color: look.textColor || theme.text }}
                >
                  “{item.text}”
                </p>
                <p
                  className="mt-2 text-[13px] font-semibold"
                  style={{ color: theme.text }}
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
  selectedId,
  onSelectBlock,
}: {
  page: PublicPage;
  className?: string;
  showStatusBar?: boolean;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
}) {
  const theme = resolvePaintTheme(page.theme);
  const editable = Boolean(onSelectBlock);
  const blocks = [...(page.blocks || [])]
    .filter((block) => editable || block.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hero = blocks.find((block) => block.type === "HERO");
  const location = blocks.find((block) => block.type === "LOCATION");
  const rest = blocks.filter(
    (block) => block.type !== "HERO" && block.type !== "LOCATION",
  );

  return (
    <div
      className={cn(
        "h-full overflow-y-auto no-scrollbar",
        theme.font === "serif" && "font-serif",
        theme.font === "mono" && "font-mono",
        theme.font === "sans" && "font-sans",
        className,
      )}
      style={{ background: theme.background, color: theme.text }}
    >
      {showStatusBar ? <StatusBar /> : null}
      <div className="px-4 pb-24 pt-8">
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
          <div className="flex flex-col items-center px-5 pt-4 text-center">
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
          </div>
        )}
        {location ? (
          <div className="mt-2">
            <SelectableBlock
              id={location.id}
              label={BLOCK_META[location.type].label}
              selected={selectedId === location.id}
              hidden={!location.isVisible}
              onSelect={onSelectBlock}
            >
              <BlockView block={location} theme={theme} page={page} />
            </SelectableBlock>
          </div>
        ) : page.location ? (
          <p
            className="mt-2 flex items-center justify-center gap-1 text-[13px]"
            style={{ color: theme.muted }}
          >
            <MapPin className="h-3.5 w-3.5" />
            {page.location}
          </p>
        ) : null}
        <div className="mt-4 space-y-2.5">
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
        selected && "shadow-[inset_0_0_0_2px_rgba(20,17,14,0.85)]",
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
