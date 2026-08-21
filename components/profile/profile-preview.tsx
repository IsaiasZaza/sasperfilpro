"use client";

import { MapPin, MessageCircle, Star } from "lucide-react";
import { StatusBar } from "@/components/mockups/phone-frame";
import {
  DEFAULT_THEME,
  type CtaButtonContent,
  type HeroContent,
  type LinkButtonContent,
  type LocationContent,
  type ProfileBlock,
  type ProfileTheme,
  type PublicPage,
  type ServiceItem,
  type ServicesContent,
  type SocialContent,
  type TestimonialsContent,
  type TestimonialItem,
  type WhatsAppContent,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function whatsappHref(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(message || "");
  return digits
    ? `https://wa.me/${digits}?text=${text}`
    : `https://wa.me/?text=${text}`;
}

function resolveTheme(theme: ProfileTheme | null | undefined): Required<
  Pick<
    ProfileTheme,
    "background" | "text" | "muted" | "accent" | "card" | "line"
  >
> & { buttonRadius: string } {
  const buttonStyle = (theme?.buttonStyle as string) || "pill";
  return {
    background:
      (theme?.background as string) ||
      DEFAULT_THEME.background ||
      "#faf6f2",
    text: (theme?.text as string) || DEFAULT_THEME.text || "#2b211c",
    muted: (theme?.muted as string) || DEFAULT_THEME.muted || "#8a6f66",
    accent:
      (theme?.accent as string) ||
      (theme?.primaryColor as string) ||
      DEFAULT_THEME.accent ||
      "#2b211c",
    card: (theme?.card as string) || DEFAULT_THEME.card || "#ffffff",
    line: (theme?.line as string) || DEFAULT_THEME.line || "#eadfd8",
    buttonRadius:
      buttonStyle === "square"
        ? "0.5rem"
        : buttonStyle === "rounded"
          ? "0.75rem"
          : "9999px",
  };
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
  theme: ReturnType<typeof resolveTheme>;
  page: PublicPage;
}) {
  if (!block.isVisible) return null;

  switch (block.type) {
    case "HERO": {
      const content = block.content as HeroContent;
      const name =
        content.name || page.displayName || page.username || "Seu nome";
      const headline = content.headline || page.headline || "";
      const avatarUrl = content.avatarUrl || page.avatarUrl;
      return (
        <div className="flex flex-col items-center text-center">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="h-16 w-16 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white shadow-sm"
              style={{
                background: `linear-gradient(145deg, ${theme.muted}, ${theme.accent})`,
              }}
            >
              {initials(name)}
            </div>
          )}
          <h3 className="mt-3 text-[15px] font-semibold tracking-tight">
            {name}
          </h3>
          {headline ? (
            <p className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
              {headline}
            </p>
          ) : null}
          {content.bio || page.bio ? (
            <p
              className="mt-2 max-w-[220px] text-[10px] leading-relaxed"
              style={{ color: theme.muted }}
            >
              {content.bio || page.bio}
            </p>
          ) : null}
          {content.location ? (
            <p
              className="mt-1.5 flex items-center justify-center gap-1 text-[10px]"
              style={{ color: theme.muted }}
            >
              <MapPin className="h-3 w-3" />
              {content.location}
            </p>
          ) : null}
        </div>
      );
    }
    case "LOCATION": {
      const content = block.content as LocationContent;
      const text = content.address || page.location || "";
      if (!text.trim()) return null;
      const inner = (
        <span className="flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3" />
          {content.label || text}
        </span>
      );
      return content.mapsUrl ? (
        <a
          href={content.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 block text-[10px] underline-offset-2 hover:underline"
          style={{ color: theme.muted }}
        >
          {inner}
        </a>
      ) : (
        <p
          className="mt-1.5 text-[10px]"
          style={{ color: theme.muted }}
        >
          {inner}
        </p>
      );
    }
    case "CTA_BUTTON": {
      const content = block.content as CtaButtonContent;
      const style = content.style || "primary";
      const radius = theme.buttonRadius;
      const look =
        style === "outline"
          ? {
              background: "transparent",
              color: theme.accent,
              border: `1.5px solid ${theme.accent}`,
              borderRadius: radius,
            }
          : style === "secondary"
            ? {
                background: theme.card,
                color: theme.text,
                border: `1px solid ${theme.line}`,
                borderRadius: radius,
              }
            : {
                background: theme.accent,
                color: "#fff",
                borderRadius: radius,
              };
      return (
        <a
          href={content.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-full items-center justify-center text-[11px] font-medium"
          style={look}
        >
          {content.label || "Botão"}
        </a>
      );
    }
    case "LINK_BUTTON": {
      const content = block.content as LinkButtonContent;
      return (
        <a
          href={content.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-full items-center justify-center text-[11px] font-medium"
          style={{
            background: theme.card,
            color: theme.text,
            border: `1px solid ${theme.line}`,
            borderRadius: theme.buttonRadius,
          }}
        >
          {content.icon ? `${content.icon} ` : null}
          {content.label || "Link"}
        </a>
      );
    }
    case "WHATSAPP": {
      const content = block.content as WhatsAppContent;
      return (
        <a
          href={whatsappHref(content.phone || "", content.message)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-full items-center justify-center gap-1.5 text-[11px] font-medium text-[#128c4b]"
          style={{
            background: "rgba(37, 211, 102, 0.12)",
            borderRadius: theme.buttonRadius,
          }}
        >
          <MessageCircle className="h-3 w-3" />
          {content.label || "WhatsApp"}
        </a>
      );
    }
    case "SOCIAL": {
      const content = block.content as SocialContent;
      return (
        <div className="grid grid-cols-2 gap-2">
          {(content.items || []).map((item) => (
            <a
              key={`${item.network}-${item.url}`}
              href={item.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center justify-center gap-1.5 text-[11px] font-medium"
              style={{
                background: `${theme.accent}0d`,
                color: theme.text,
                borderRadius: theme.buttonRadius,
              }}
            >
              {item.network === "instagram" ? (
                <InstagramIcon className="h-3 w-3" />
              ) : null}
              {item.label || item.network}
            </a>
          ))}
        </div>
      );
    }
    case "SERVICES": {
      const content = block.content as ServicesContent;
      const items = (page.services || []).filter((s) => s.isVisible !== false);
      if (items.length === 0) return null;
      return (
        <div>
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: theme.muted }}
          >
            {content.heading || "Serviços"}
          </p>
          <div className="space-y-1.5">
            {items.map((item: ServiceItem) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2 rounded-xl px-3 py-2"
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.line}`,
                }}
              >
                <span className="min-w-0">
                  <span className="block text-[11px]">{item.name}</span>
                  {item.description ? (
                    <span
                      className="mt-0.5 block text-[9px] leading-snug"
                      style={{ color: theme.muted }}
                    >
                      {item.description}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px] font-semibold">
                  {item.priceFormatted ||
                    (item.priceCents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </span>
              </div>
            ))}
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
      return (
        <div>
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: theme.muted }}
          >
            {content.heading || "Depoimentos"}
          </p>
          <div className="space-y-2">
            {items.map((item: TestimonialItem) => (
              <div
                key={item.id}
                className="rounded-xl px-3 py-2.5"
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.line}`,
                }}
              >
                <div className="mb-1 flex gap-0.5 text-amber-500">
                  {Array.from({
                    length: Math.max(1, Math.min(5, item.rating || 5)),
                  }).map((_, index) => (
                    <Star key={index} className="h-2.5 w-2.5 fill-current" />
                  ))}
                </div>
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: theme.muted }}
                >
                  “{item.text}”
                </p>
                <p className="mt-1 text-[9px]" style={{ color: theme.muted }}>
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

export function ProfilePreview({
  page,
  className,
  showStatusBar = true,
  selectedId,
  onSelectBlock,
  onSelectBackground,
}: {
  page: PublicPage;
  className?: string;
  showStatusBar?: boolean;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
  onSelectBackground?: () => void;
}) {
  const theme = resolveTheme(page.theme);
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
      className={cn("h-full overflow-y-auto no-scrollbar", className)}
      style={{ background: theme.background, color: theme.text }}
      onClick={
        onSelectBackground
          ? (event) => {
              if (event.target === event.currentTarget) onSelectBackground();
            }
          : undefined
      }
    >
      {showStatusBar ? <StatusBar /> : null}
      <div
        className="px-4 pb-8 pt-5"
        onClick={
          onSelectBackground
            ? (event) => {
                if (event.target === event.currentTarget) onSelectBackground();
              }
            : undefined
        }
      >
        {hero ? (
          <SelectableBlock
            id={hero.id}
            selected={selectedId === hero.id}
            hidden={!hero.isVisible}
            onSelect={onSelectBlock}
          >
            <BlockView block={hero} theme={theme} page={page} />
          </SelectableBlock>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white"
              style={{
                background: `linear-gradient(145deg, ${theme.muted}, ${theme.accent})`,
              }}
            >
              {initials(page.displayName || page.username || "PP")}
            </div>
            <h3 className="mt-3 text-[15px] font-semibold">
              {page.displayName || page.username}
            </h3>
            {page.headline ? (
              <p className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
                {page.headline}
              </p>
            ) : null}
          </div>
        )}
        {location ? (
          <div className="mt-1.5">
            <SelectableBlock
              id={location.id}
              selected={selectedId === location.id}
              hidden={!location.isVisible}
              onSelect={onSelectBlock}
            >
              <BlockView block={location} theme={theme} page={page} />
            </SelectableBlock>
          </div>
        ) : page.location ? (
          <p
            className="mt-1.5 flex items-center justify-center gap-1 text-[10px]"
            style={{ color: theme.muted }}
          >
            <MapPin className="h-3 w-3" />
            {page.location}
          </p>
        ) : null}
        <div className="mt-4 space-y-2">
          {rest.map((block) => (
            <SelectableBlock
              key={block.id}
              id={block.id}
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
            className="mt-10 text-center text-[12px]"
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
  selected,
  hidden,
  onSelect,
  children,
}: {
  id: string;
  selected: boolean;
  hidden: boolean;
  onSelect?: (id: string) => void;
  children: React.ReactNode;
}) {
  if (!onSelect) return children;
  return (
    <div
      className={cn(
        "relative rounded-2xl transition",
        selected && "ring-2 ring-ink/80 ring-offset-2 ring-offset-transparent",
        hidden && "opacity-45",
      )}
    >
      <div className="pointer-events-none">{children}</div>
      <button
        type="button"
        className="absolute inset-0 z-10 min-h-[28px] rounded-2xl"
        aria-label="Editar esta estrutura"
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
