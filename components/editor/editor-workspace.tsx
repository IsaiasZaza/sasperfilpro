"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  LayoutTemplate,
  Loader2,
  Palette,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { CheckoutDialog } from "@/components/billing/checkout-dialog";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { Logo } from "@/components/brand/logo";
import { AppearancePanel } from "@/components/editor/appearance-panel";
import { BlockInspector } from "@/components/editor/block-inspector";
import {
  BLOCK_GROUPS,
  BLOCK_ICONS,
  BLOCK_KEYWORDS,
  BLOCK_TIPS,
  UNIQUE_BLOCKS,
} from "@/components/editor/editor-meta";
import { TemplateGallery } from "@/components/editor/template-gallery";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { Button } from "@/components/ui/button";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import type { PageTemplate, TemplateBlock } from "@/lib/page-templates";
import {
  billingApi,
  blocksApi,
  profileApi,
  servicesApi,
  testimonialsApi,
} from "@/lib/api-client";
import {
  canAddBlock,
  canAddCountedItem,
  entitlementsOf,
  isBlockTypeAllowed,
  isPlanGateError,
} from "@/lib/billing";
import type { PaidPlanId, Plan } from "@/lib/types/billing";
import {
  mergeThemeResponse,
  themeFromApi,
  themeSnapshot,
  themeToApi,
} from "@/lib/theme";
import { normalizeHttpUrl, prepareBlockContent } from "@/lib/url";
import {
  hydrateBlockLook,
  lookFrom,
  packLookTitle,
} from "@/lib/block-look";
import {
  BLOCK_META,
  type BlockType,
  type Profile,
  type ProfileBlock,
  type PublicPage,
  type ServiceItem,
  type TestimonialItem,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

type MobileTab = "blocks" | "edit" | "preview";
type EditorPanel = "block" | "appearance" | "templates";

const SAVE_WAIT_MS = 1200;

type SaveState = "saved" | "pending" | "saving" | "error";

type ToastState = { text: string; variant: ToastVariant } | null;

/** Busca sem acento e sem caixa: "serviços" acha "servicos". */
function foldText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function snapshotBlock(block: ProfileBlock) {
  return JSON.stringify({
    content: block.content,
    isVisible: block.isVisible,
    title: block.title,
  });
}

function withHeroFromProfile(block: ProfileBlock, profile: Profile): ProfileBlock {
  if (block.type !== "HERO") return block;
  const content = { ...(block.content as Record<string, unknown>) };
  if (!("name" in content)) content.name = profile.displayName ?? "";
  if (!("headline" in content)) content.headline = profile.headline ?? "";
  if (!("bio" in content)) content.bio = profile.bio ?? "";
  if (!("location" in content)) content.location = profile.location ?? "";
  if (!("avatarUrl" in content)) content.avatarUrl = profile.avatarUrl ?? "";
  return { ...block, content };
}

function pickHeroText(
  content: Record<string, unknown> | undefined,
  key: string,
  fallback: string | null | undefined,
) {
  if (content && key in content) {
    return emptyToNull(content[key] as string | null | undefined);
  }
  return emptyToNull(fallback);
}

function profileSnapshot(profile: Profile) {
  return JSON.stringify({
    username: profile.username,
    displayName: profile.displayName,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    avatarUrl: profile.avatarUrl,
    theme: themeSnapshot(profile.theme),
  });
}

function withPersistedTheme(
  updated: Profile,
  local: Profile | null | undefined,
): { profile: Profile; lost: boolean } {
  const merged = mergeThemeResponse(updated.theme, local?.theme);
  return { profile: { ...updated, theme: merged.theme }, lost: merged.lost };
}

function applySavedProfile(
  profileRef: { current: Profile | null },
  lastSavedProfile: { current: string },
  setProfile: (profile: Profile) => void,
  setAuthProfile: (profile: Profile) => void,
  merged: Profile,
) {
  // Atualiza o ref na hora — o useEffect atrasa e o autosave entra em loop.
  profileRef.current = merged;
  lastSavedProfile.current = profileSnapshot(merged);
  setProfile(merged);
  setAuthProfile(merged);
}

function sortBlocks(blocks: ProfileBlock[]) {
  return [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
}

function blockSummary(block: ProfileBlock): string {
  const c = block.content as Record<string, unknown>;
  if (typeof c.name === "string" && c.name) return c.name;
  if (typeof c.label === "string" && c.label) return c.label;
  if (typeof c.heading === "string" && c.heading) return c.heading;
  if (typeof c.address === "string" && c.address) return c.address;
  if (typeof c.phone === "string" && c.phone) return c.phone;
  return BLOCK_META[block.type].description;
}

function defaultContent(
  type: BlockType,
  location?: string | null,
): ProfileBlock["content"] {
  switch (type) {
    case "HERO":
      return { name: "", headline: "" };
    case "CTA_BUTTON":
      return {
        label: "Agendar horário",
        url: "https://wa.me/",
        style: "primary",
      };
    case "LINK_BUTTON":
      return {
        label: "Conheça meu trabalho",
        url: "https://instagram.com/",
        icon: "auto",
      };
    case "WHATSAPP":
      return {
        phone: "",
        message: "Oi! Vi seu perfil no PerfilPro",
        label: "WhatsApp",
        pulse: true,
      };
    case "SOCIAL":
      return {
        layout: "icons",
        items: [{ network: "instagram", url: "https://instagram.com/" }],
      };
    case "SERVICES":
      return { heading: "Serviços" };
    case "TESTIMONIALS":
      return { heading: "Depoimentos" };
    case "LOCATION": {
      const address =
        location && location.trim().length >= 3
          ? location.trim()
          : "Minha cidade";
      return {
        address,
        label: "Ver no mapa",
        url: "https://maps.google.com/",
        mapsUrl: "https://maps.google.com/",
      };
    }
  }
}

/**
 * Modelo não apaga o que o usuário já preencheu: nome, foto, bio, telefone e
 * cidade vêm do perfil atual e só caem no texto de exemplo quando estão vazios.
 */
function templateBlockContent(
  item: TemplateBlock,
  profile: Profile | null,
  previousPhone: string,
): Record<string, unknown> {
  const content: Record<string, unknown> = { ...item.content };

  if (item.type === "HERO") {
    content.name = profile?.displayName || (content.name as string) || "";
    if (profile?.headline) content.headline = profile.headline;
    if (profile?.bio) content.bio = profile.bio;
    if (profile?.avatarUrl) content.avatarUrl = profile.avatarUrl;
    return content;
  }

  if (item.type === "WHATSAPP") {
    content.phone = previousPhone;
    return content;
  }

  if (item.type === "LOCATION") {
    const city = profile?.location?.trim();
    content.address = city || "Minha cidade";
    return content;
  }

  return content;
}

function SortableBlockRow({
  block,
  selected,
  onSelect,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  block: ProfileBlock;
  selected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const Icon = BLOCK_ICONS[block.type];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-1 rounded-xl px-1 py-1.5 transition-colors",
        selected ? "bg-background" : "hover:bg-background/80",
        isDragging && "z-10 bg-white opacity-95 shadow-sm",
        !block.isVisible && "opacity-50",
      )}
    >
      <span
        className={cn(
          "h-10 w-0.5 shrink-0 rounded-full",
          selected ? "bg-lime" : "bg-transparent",
        )}
      />
      <button
        type="button"
        className="inline-flex h-11 w-10 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg text-muted-soft active:cursor-grabbing"
        style={{ touchAction: "none" }}
        aria-label="Segure e arraste para reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5 text-left"
        onClick={onSelect}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            selected ? "bg-ink text-white" : "bg-background text-ink",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-ink">
            {BLOCK_META[block.type].label}
          </span>
          <span className="block truncate text-[11px] text-muted">
            {blockSummary(block)}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 flex-col lg:hidden">
        <button
          type="button"
          className="inline-flex h-6 w-9 items-center justify-center rounded-t-md text-muted disabled:opacity-25"
          aria-label="Subir bloco"
          disabled={!canMoveUp}
          onClick={onMoveUp}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-6 w-9 items-center justify-center rounded-b-md text-muted disabled:opacity-25"
          aria-label="Descer bloco"
          disabled={!canMoveDown}
          onClick={onMoveDown}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        className="inline-flex h-11 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
        aria-label={block.isVisible ? "Ocultar bloco" : "Mostrar bloco"}
        onClick={onToggleVisible}
      >
        {block.isVisible ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function EditorWorkspace() {
  const { refresh, setProfile: setAuthProfile, subscription, user } = useAuth();
  const entitlements = entitlementsOf(subscription);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>();
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlanId | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<ProfileBlock[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [toast, setToast] = useState<ToastState>(null);
  const [inserterOpen, setInserterOpen] = useState(false);
  const [inserterQuery, setInserterQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");
  const [editorPanel, setEditorPanel] = useState<EditorPanel>("block");
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  const notify = useCallback(
    (text: string, variant: ToastVariant = "info") => {
      setToast({ text, variant });
    },
    [],
  );

  const saveTimer = useRef<number | null>(null);
  const saveInFlight = useRef<Promise<void> | null>(null);
  const saveAgain = useRef(false);
  const lastSavedBlock = useRef<Record<string, string>>({});
  const lastSavedServices = useRef("");
  const lastSavedTestimonials = useRef("");
  const lastSavedProfile = useRef("");
  const profileRef = useRef<Profile | null>(null);
  const profileSaveGen = useRef(0);
  const blocksRef = useRef<ProfileBlock[]>([]);
  const servicesRef = useRef<ServiceItem[]>([]);
  const testimonialsRef = useRef<TestimonialItem[]>([]);
  const loadingRef = useRef(true);
  const loadErrorRef = useRef<string | null>(null);

  const orderedBlocks = useMemo(() => sortBlocks(blocks), [blocks]);
  const selected = orderedBlocks.find((b) => b.id === selectedId) ?? null;
  const blockIds = useMemo(() => orderedBlocks.map((b) => b.id), [orderedBlocks]);

  const inserterGroups = useMemo(() => {
    const query = foldText(inserterQuery);
    return BLOCK_GROUPS.map((group) => ({
      label: group.label,
      types: group.types.filter((type) => {
        if (!query) return true;
        const haystack = foldText(
          `${BLOCK_META[type].label} ${BLOCK_META[type].description} ${BLOCK_KEYWORDS[type]}`,
        );
        return haystack.includes(query);
      }),
    })).filter((group) => group.types.length > 0);
  }, [inserterQuery]);

  const previewPage: PublicPage | null = useMemo(() => {
    if (!profile) return null;
    return {
      username: profile.username || "preview",
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      theme: profile.theme,
      status: profile.status,
      publishedAt: profile.publishedAt,
      blocks: orderedBlocks,
      services,
      testimonials,
    };
  }, [profile, orderedBlocks, services, testimonials]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [p, b, s, t] = await Promise.all([
        profileApi.get(),
        blocksApi.list(),
        servicesApi.list(),
        testimonialsApi.list(),
      ]);
      const loaded = { ...p, theme: themeFromApi(p.theme) };
      const ordered = sortBlocks(b)
        .map((block) => hydrateBlockLook(block))
        .map((block) => withHeroFromProfile(block, loaded));
      setProfile(loaded);
      setAuthProfile(loaded);
      setBlocks(ordered);
      setServices(s);
      setTestimonials(t);
      setSelectedId(ordered[0]?.id ?? null);
      lastSavedBlock.current = {};
      for (const block of ordered) {
        lastSavedBlock.current[block.id] = snapshotBlock(block);
      }
      lastSavedServices.current = JSON.stringify(s);
      lastSavedTestimonials.current = JSON.stringify(t);
      lastSavedProfile.current = profileSnapshot(loaded);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar o editor.",
      );
    } finally {
      setLoading(false);
    }
  }, [setAuthProfile]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void billingApi
      .plans()
      .then((catalog) => setPlans(catalog.plans))
      .catch(() => undefined);
  }, []);

  function requestUpgrade(message?: string) {
    setUpgradeMessage(message);
    setUpgradeOpen(true);
  }

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  useEffect(() => {
    testimonialsRef.current = testimonials;
  }, [testimonials]);

  useEffect(() => {
    loadingRef.current = loading;
    loadErrorRef.current = loadError;
  }, [loading, loadError]);

  useEffect(() => {
    if (!toast) return;
    // Erro fica mais tempo na tela: quem errou precisa ler.
    const timer = window.setTimeout(
      () => setToast(null),
      toast.variant === "error" ? 6000 : 3200,
    );
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    try {
      const warn = sessionStorage.getItem("perfilpro:publish-warn");
      if (!warn) return;
      sessionStorage.removeItem("perfilpro:publish-warn");
      setToast({ text: warn, variant: "info" });
    } catch {
      // ignore
    }
  }, []);

  const hasUnsavedChanges = useCallback(() => {
    if (loadingRef.current || loadErrorRef.current) return false;
    const dirtyBlocks = blocksRef.current.some(
      (block) => lastSavedBlock.current[block.id] !== snapshotBlock(block),
    );
    if (dirtyBlocks) return true;
    if (JSON.stringify(servicesRef.current) !== lastSavedServices.current) {
      return true;
    }
    if (
      JSON.stringify(testimonialsRef.current) !== lastSavedTestimonials.current
    ) {
      return true;
    }
    const pending = profileRef.current;
    if (pending && profileSnapshot(pending) !== lastSavedProfile.current) {
      return true;
    }
    return false;
  }, []);

  const persistDirtyBlocks = useCallback(async () => {
    const dirty = blocksRef.current.filter(
      (block) => lastSavedBlock.current[block.id] !== snapshotBlock(block),
    );
    for (const block of dirty) {
      const payload = snapshotBlock(block);
      let previousContent: Record<string, unknown> | undefined;
      try {
        previousContent = JSON.parse(
          lastSavedBlock.current[block.id] || "{}",
        ).content;
      } catch {
        previousContent = undefined;
      }
      await blocksApi.update(block.id, {
        content: prepareBlockContent(
          block.type,
          block.content as Record<string, unknown>,
          previousContent,
        ),
        isVisible: block.isVisible,
        title: packLookTitle(block.title, lookFrom(block.content)),
      });
      lastSavedBlock.current[block.id] = payload;

      if (block.type === "LOCATION") {
        const address = emptyToNull(
          (block.content as { address?: string }).address,
        );
        const current = profileRef.current;
        if (current && current.location !== address) {
          const updatedProfile = await profileApi.update({
            location: address,
            theme: themeToApi(current.theme),
          });
          const { profile: merged, lost } = withPersistedTheme(
            updatedProfile,
            current,
          );
          applySavedProfile(
            profileRef,
            lastSavedProfile,
            setProfile,
            setAuthProfile,
            merged,
          );
          if (lost) {
            throw new Error("Não foi possível gravar o tema. Tente de novo.");
          }
        }
        // Mantém o HERO alinhado para não “voltar” a cidade antiga se o bloco sumir.
        const nextBlocks = blocksRef.current.map((item) => {
          if (item.type !== "HERO") return item;
          const heroContent = {
            ...(item.content as Record<string, unknown>),
            location: address ?? "",
          };
          const next = { ...item, content: heroContent };
          lastSavedBlock.current[item.id] = snapshotBlock(next);
          return next;
        });
        blocksRef.current = nextBlocks;
        setBlocks(nextBlocks);
        continue;
      }

      if (block.type !== "HERO") continue;
      const hero = block.content as {
        name?: string;
        headline?: string;
        bio?: string;
        location?: string;
        avatarUrl?: string;
      };
      const current = profileRef.current;
      const locationOwnedByBlock = blocksRef.current.some(
        (item) => item.type === "LOCATION" && item.isVisible,
      );
      const updatedProfile = await profileApi.update({
        displayName:
          hero.name !== undefined
            ? emptyToNull(hero.name)
            : emptyToNull(current?.displayName),
        headline:
          hero.headline !== undefined
            ? emptyToNull(hero.headline)
            : emptyToNull(current?.headline),
        bio:
          hero.bio !== undefined
            ? emptyToNull(hero.bio)
            : emptyToNull(current?.bio),
        location: locationOwnedByBlock
          ? emptyToNull(current?.location)
          : hero.location !== undefined
            ? emptyToNull(hero.location)
            : emptyToNull(current?.location),
        avatarUrl:
          normalizeHttpUrl(hero.avatarUrl || "") ||
          (hero.avatarUrl !== undefined
            ? null
            : normalizeHttpUrl(current?.avatarUrl || "") || null),
        theme: themeToApi(current?.theme),
      });
      const { profile: merged, lost } = withPersistedTheme(
        updatedProfile,
        current,
      );
      applySavedProfile(
        profileRef,
        lastSavedProfile,
        setProfile,
        setAuthProfile,
        merged,
      );
      if (lost) {
        throw new Error("Não foi possível gravar o tema. Tente de novo.");
      }
    }
  }, [setAuthProfile]);

  const persistDirtyServices = useCallback(async () => {
    const list = servicesRef.current;
    if (JSON.stringify(list) === lastSavedServices.current) return;
    const resolved: ServiceItem[] = [];
    for (const local of list) {
      if (local.id.startsWith("tmp_")) {
        resolved.push(
          await servicesApi.create({
            name: local.name,
            description: local.description,
            priceCents: local.priceCents,
            isVisible: local.isVisible,
          }),
        );
      } else {
        resolved.push(
          await servicesApi.update(local.id, {
            name: local.name,
            description: local.description,
            priceCents: local.priceCents,
            isVisible: local.isVisible,
          }),
        );
      }
    }
    lastSavedServices.current = JSON.stringify(resolved);
    setServices(resolved);
  }, []);

  const persistDirtyTestimonials = useCallback(async () => {
    const list = testimonialsRef.current;
    if (JSON.stringify(list) === lastSavedTestimonials.current) return;
    const resolved: TestimonialItem[] = [];
    for (const local of list) {
      if (local.id.startsWith("tmp_")) {
        resolved.push(
          await testimonialsApi.create({
            authorName: local.authorName,
            text: local.text,
            rating: local.rating,
            isVisible: local.isVisible,
          }),
        );
      } else {
        resolved.push(
          await testimonialsApi.update(local.id, {
            authorName: local.authorName,
            text: local.text,
            rating: local.rating,
            isVisible: local.isVisible,
          }),
        );
      }
    }
    lastSavedTestimonials.current = JSON.stringify(resolved);
    setTestimonials(resolved);
  }, []);

  const persistDirtyProfile = useCallback(async () => {
    const pending = profileRef.current;
    if (!pending) return;
    const hero = blocksRef.current.find((block) => block.type === "HERO");
    const heroContent = hero?.content as Record<string, unknown> | undefined;
    const snapshot = profileSnapshot(pending);
    if (snapshot === lastSavedProfile.current) return;
    const gen = ++profileSaveGen.current;
    const locationOwnedByBlock = blocksRef.current.some(
      (item) => item.type === "LOCATION" && item.isVisible,
    );
    const updated = await profileApi.update({
      username: pending.username || undefined,
      displayName: pickHeroText(heroContent, "name", pending.displayName),
      headline: pickHeroText(heroContent, "headline", pending.headline),
      bio: pickHeroText(heroContent, "bio", pending.bio),
      location: locationOwnedByBlock
        ? emptyToNull(pending.location)
        : pickHeroText(heroContent, "location", pending.location),
      avatarUrl: pickHeroText(heroContent, "avatarUrl", pending.avatarUrl),
      theme: themeToApi(pending.theme),
    });
    if (gen !== profileSaveGen.current) return;
    const { profile: merged, lost } = withPersistedTheme(updated, pending);
    applySavedProfile(
      profileRef,
      lastSavedProfile,
      setProfile,
      setAuthProfile,
      merged,
    );
    if (lost) {
      throw new Error("Não foi possível gravar o tema. Tente de novo.");
    }
  }, [setAuthProfile]);

  const flushPendingSaves = useCallback(async () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    if (saveInFlight.current) {
      saveAgain.current = true;
      await saveInFlight.current;
      if (!hasUnsavedChanges()) return;
    }

    const run = async () => {
      setSaveState("saving");
      try {
        let passes = 0;
        do {
          saveAgain.current = false;
          await persistDirtyBlocks();
          await persistDirtyServices();
          await persistDirtyTestimonials();
          await persistDirtyProfile();
          passes += 1;
        } while (
          passes < 3 &&
          (saveAgain.current || hasUnsavedChanges())
        );
        if (hasUnsavedChanges()) {
          // Evita loop infinito de "Salvando..." quando o dirty não estabiliza.
          if (passes >= 3) {
            setSaveState("error");
            notify(
              "Não estabilizou o salvamento do tema. Confira se o backend aceita o campo atmosphere.",
              "error",
            );
            return;
          }
          setSaveState("pending");
          if (saveTimer.current) window.clearTimeout(saveTimer.current);
          saveTimer.current = window.setTimeout(() => {
            saveTimer.current = null;
            void flushPendingSaves().catch(() => undefined);
          }, SAVE_WAIT_MS);
          return;
        }
        setSaveState("saved");
      } catch (err) {
        setSaveState("error");
        notify(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Não salvou. Tente de novo.",
          "error",
        );
        throw err;
      } finally {
        saveInFlight.current = null;
      }
    };

    const promise = run();
    saveInFlight.current = promise;
    await promise;
  }, [
    hasUnsavedChanges,
    notify,
    persistDirtyBlocks,
    persistDirtyProfile,
    persistDirtyServices,
    persistDirtyTestimonials,
  ]);

  const scheduleAutosave = useCallback(() => {
    if (loadingRef.current || loadErrorRef.current) return;
    if (!hasUnsavedChanges()) return;
    setSaveState((current) => (current === "saving" ? current : "pending"));
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      void flushPendingSaves().catch(() => undefined);
    }, SAVE_WAIT_MS);
  }, [flushPendingSaves, hasUnsavedChanges]);

  useEffect(() => {
    scheduleAutosave();
  }, [blocks, services, testimonials, profile, scheduleAutosave]);

  useEffect(() => {
    const flushIfNeeded = () => {
      if (!hasUnsavedChanges() && saveState !== "saving") return;
      void flushPendingSaves().catch(() => undefined);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushIfNeeded();
    };
    window.addEventListener("pagehide", flushIfNeeded);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flushIfNeeded);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [flushPendingSaves, hasUnsavedChanges, saveState]);

  const isDirty =
    !loading &&
    !loadError &&
    (blocks.some(
      (block) => lastSavedBlock.current[block.id] !== snapshotBlock(block),
    ) ||
      JSON.stringify(services) !== lastSavedServices.current ||
      JSON.stringify(testimonials) !== lastSavedTestimonials.current ||
      (profile != null &&
        profileSnapshot(profile) !== lastSavedProfile.current));

  const saveUi: SaveState =
    saveState === "saving" || saveState === "error"
      ? saveState
      : isDirty || saveState === "pending"
        ? "pending"
        : "saved";

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isDirty && saveState !== "saving") return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [isDirty, saveState]);

  async function addBlock(type: BlockType) {
    if (!canAddBlock(entitlements, blocks.length, type)) {
      requestUpgrade(
        isBlockTypeAllowed(entitlements, type)
          ? "O Free chega no limite de blocos. Assine Pro ou Premium para adicionar mais."
          : "Esse tipo de bloco não entra no Free. Assine Pro ou Premium para liberar.",
      );
      return;
    }
    try {
      setSaveState("saving");
      const created = await blocksApi.create({
        type,
        content: prepareBlockContent(
          type,
          defaultContent(type, profile?.location) as Record<string, unknown>,
        ),
        sortOrder: blocks.length,
      });
      setBlocks((prev) => [...prev, created]);
      setSelectedId(created.id);
      setEditorPanel("block");
      lastSavedBlock.current[created.id] = snapshotBlock(created);
      setInserterOpen(false);
      setInserterQuery("");
      setMobileTab("edit");
      setSaveState("saved");
      notify(`${BLOCK_META[type].label} adicionado.`, "success");
    } catch (err) {
      if (isPlanGateError(err)) {
        requestUpgrade();
        setSaveState("saved");
        return;
      }
      const detail =
        err instanceof ApiError && Array.isArray(err.details)
          ? (err.details[0] as { message?: string } | undefined)?.message
          : null;
      notify(
        detail ||
          (err instanceof ApiError ? err.message : "Erro ao criar bloco"),
        "error",
      );
      setSaveState("error");
    }
  }

  async function removeBlock(id: string) {
    const label = blocks.find((b) => b.id === id)?.type;
    try {
      await blocksApi.remove(id);
      const next = blocks
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, sortOrder: i }));
      setBlocks(next);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      if (next.length) {
        await blocksApi.reorder(
          next.map((b) => ({ id: b.id, sortOrder: b.sortOrder })),
        );
      }
      notify(
        label ? `${BLOCK_META[label].label} removido.` : "Bloco removido.",
        "info",
      );
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Erro ao remover", "error");
    }
  }

  async function applyTemplate(template: PageTemplate) {
    if (!entitlements.customTheme) {
      requestUpgrade(
        "Os modelos prontos são do Pro e do Premium. Eles montam tema, serviços e depoimentos.",
      );
      return;
    }
    const current = profileRef.current;
    const previousPhone =
      (
        blocksRef.current.find((block) => block.type === "WHATSAPP")
          ?.content as { phone?: string } | undefined
      )?.phone || "";

    setApplyingTemplate(template.id);
    setSaveState("saving");
    try {
      for (const block of blocksRef.current) {
        await blocksApi.remove(block.id);
      }
      lastSavedBlock.current = {};

      const created: ProfileBlock[] = [];
      for (const [index, item] of template.blocks.entries()) {
        created.push(
          await blocksApi.create({
            type: item.type,
            content: prepareBlockContent(
              item.type,
              templateBlockContent(item, current, previousPhone),
            ),
            sortOrder: index,
          }),
        );
      }
      blocksRef.current = created;
      setBlocks(created);
      for (const block of created) {
        lastSavedBlock.current[block.id] = snapshotBlock(block);
      }
      setSelectedId(created[0]?.id ?? null);

      if (template.services?.length && servicesRef.current.length === 0) {
        const nextServices: ServiceItem[] = [];
        for (const item of template.services) {
          nextServices.push(
            await servicesApi.create({
              name: item.name,
              description: item.description ?? null,
              priceCents: item.priceCents,
            }),
          );
        }
        servicesRef.current = nextServices;
        setServices(nextServices);
        lastSavedServices.current = JSON.stringify(nextServices);
      }

      if (
        template.testimonials?.length &&
        testimonialsRef.current.length === 0
      ) {
        const nextTestimonials: TestimonialItem[] = [];
        for (const item of template.testimonials) {
          nextTestimonials.push(
            await testimonialsApi.create({
              authorName: item.authorName,
              text: item.text,
              rating: item.rating,
            }),
          );
        }
        testimonialsRef.current = nextTestimonials;
        setTestimonials(nextTestimonials);
        lastSavedTestimonials.current = JSON.stringify(nextTestimonials);
      }

      const heroContent = created.find((block) => block.type === "HERO")
        ?.content as Record<string, unknown> | undefined;
      const locationBlock = created.find((block) => block.type === "LOCATION");
      const updated = await profileApi.update({
        displayName: pickHeroText(heroContent, "name", current?.displayName),
        headline: pickHeroText(heroContent, "headline", current?.headline),
        bio: pickHeroText(heroContent, "bio", current?.bio),
        location: locationBlock
          ? emptyToNull(
              (locationBlock.content as { address?: string }).address,
            )
          : pickHeroText(heroContent, "location", current?.location),
        avatarUrl: pickHeroText(heroContent, "avatarUrl", current?.avatarUrl),
        theme: template.theme,
      });
      const { profile: merged } = withPersistedTheme(
        updated,
        current ? { ...current, theme: template.theme } : current,
      );
      applySavedProfile(
        profileRef,
        lastSavedProfile,
        setProfile,
        setAuthProfile,
        merged,
      );

      setEditorPanel("block");
      setMobileTab("preview");
      setSaveState("saved");
      notify(
        `Modelo ${template.label} aplicado. Agora troque os textos.`,
        "success",
      );
    } catch (err) {
      setSaveState("error");
      notify(
        err instanceof ApiError
          ? err.message
          : "Não foi possível aplicar o modelo.",
        "error",
      );
      // A troca mexe em vários registros: recarrega para não deixar a tela
      // divergindo do backend.
      await load();
    } finally {
      setApplyingTemplate(null);
    }
  }

  async function persistOrder(reordered: ProfileBlock[]) {
    setBlocks(reordered);
    try {
      const saved = await blocksApi.reorder(
        reordered.map((b) => ({ id: b.id, sortOrder: b.sortOrder })),
      );
      setBlocks(sortBlocks(saved));
    } catch {
      setSaveState("error");
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedBlocks.findIndex((b) => b.id === active.id);
    const newIndex = orderedBlocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(orderedBlocks, oldIndex, newIndex).map(
      (block, sortOrder) => ({ ...block, sortOrder }),
    );
    await persistOrder(reordered);
  }

  async function moveBlock(id: string, direction: -1 | 1) {
    const oldIndex = orderedBlocks.findIndex((b) => b.id === id);
    const newIndex = oldIndex + direction;
    if (oldIndex < 0 || newIndex < 0 || newIndex >= orderedBlocks.length) {
      return;
    }
    const reordered = arrayMove(orderedBlocks, oldIndex, newIndex).map(
      (block, sortOrder) => ({ ...block, sortOrder }),
    );
    await persistOrder(reordered);
  }

  function updateSelected(next: ProfileBlock) {
    setBlocks((prev) => {
      const current = prev.find((item) => item.id === next.id);
      if (current && JSON.stringify(current) === JSON.stringify(next)) {
        return prev;
      }
      return prev.map((item) => (item.id === next.id ? next : item));
    });
    if (next.type !== "HERO") return;
    const hero = next.content as {
      name?: string;
      headline?: string;
      bio?: string;
      location?: string;
      avatarUrl?: string;
    };
    setProfile((current) => {
      if (!current) return current;
      const patched = {
        ...current,
        displayName:
          hero.name !== undefined ? emptyToNull(hero.name) : current.displayName,
        headline:
          hero.headline !== undefined
            ? emptyToNull(hero.headline)
            : current.headline,
        bio: hero.bio !== undefined ? emptyToNull(hero.bio) : current.bio,
        location:
          hero.location !== undefined
            ? emptyToNull(hero.location)
            : current.location,
        avatarUrl:
          hero.avatarUrl !== undefined
            ? emptyToNull(hero.avatarUrl)
            : current.avatarUrl,
      };
      if (profileSnapshot(patched) === profileSnapshot(current)) return current;
      return patched;
    });
  }

  function handleServicesChange(next: ServiceItem[]) {
    const removed = services.filter(
      (s) => !next.some((n) => n.id === s.id) && !s.id.startsWith("tmp_"),
    );
    setServices(next);
    for (const item of removed) {
      void servicesApi.remove(item.id).catch(() => {
        setSaveState("error");
        notify("Não salvou. Tente de novo.", "error");
      });
    }
  }

  function handleTestimonialsChange(next: TestimonialItem[]) {
    const removed = testimonials.filter(
      (t) => !next.some((n) => n.id === t.id) && !t.id.startsWith("tmp_"),
    );
    setTestimonials(next);
    for (const item of removed) {
      void testimonialsApi.remove(item.id).catch(() => {
        setSaveState("error");
        notify("Não salvou. Tente de novo.", "error");
      });
    }
  }

  async function onPublish() {
    const wasPublished = profileRef.current?.status === "PUBLISHED";
    setPublishing(true);
    try {
      try {
        await flushPendingSaves();
      } catch {
        return;
      }
      const published = await profileApi.publish();
      const { profile: merged } = withPersistedTheme(
        published,
        profileRef.current,
      );
      applySavedProfile(
        profileRef,
        lastSavedProfile,
        setProfile,
        setAuthProfile,
        merged,
      );
      await refresh();
      notify(
        wasPublished
          ? "Página atualizada. Abra o link público para ver."
          : "Página no ar. Seu link já pode ir na bio.",
        "success",
      );
    } catch (err) {
      notify(
        err instanceof ApiError ? err.message : "Erro ao publicar",
        "error",
      );
    } finally {
      setPublishing(false);
    }
  }

  async function onUnpublish() {
    try {
      const draft = await profileApi.unpublish();
      const { profile: merged } = withPersistedTheme(draft, profileRef.current);
      applySavedProfile(
        profileRef,
        lastSavedProfile,
        setProfile,
        setAuthProfile,
        merged,
      );
      await refresh();
      notify("Página despublicada.", "info");
    } catch (err) {
      notify(
        err instanceof ApiError ? err.message : "Erro ao despublicar",
        "error",
      );
    }
  }

  async function copyPublicLink() {
    if (!profile?.username) return;
    const url = `${window.location.origin}/u/${profile.username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    notify("Link copiado. Cole na bio.", "success");
    window.setTimeout(() => setCopied(false), 1600);
  }

  const SelectedIcon = selected ? BLOCK_ICONS[selected.type] : null;

  if (loading) {
    return (
      <div className="flex h-dvh animate-pulse flex-col bg-background">
        <div className="flex h-14 items-center justify-between border-b border-line bg-white px-3 sm:h-16 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="h-7 w-28 rounded-full bg-line" />
            <div className="hidden h-5 w-16 rounded-full bg-line/70 sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden h-10 w-32 rounded-full bg-line/70 sm:block" />
            <div className="h-10 w-24 rounded-full bg-line" />
          </div>
        </div>
        <div className="grid min-h-0 flex-1 lg:grid-cols-[272px_minmax(0,1fr)_minmax(280px,380px)]">
          <div className="hidden flex-col gap-2 border-r border-line bg-white p-3 lg:flex">
            <div className="h-11 rounded-full bg-line" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-xl bg-line/60" />
              <div className="h-10 rounded-xl bg-line/60" />
            </div>
            <div className="mt-3 space-y-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-line/50" />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center bg-background">
            <div className="h-[520px] w-[260px] rounded-[2.4rem] bg-line/60" />
          </div>
          <div className="hidden flex-col gap-3 border-l border-line bg-white p-5 lg:flex">
            <div className="h-9 w-36 rounded-lg bg-line" />
            <div className="h-11 rounded-xl bg-line/50" />
            <div className="h-11 rounded-xl bg-line/50" />
            <div className="h-24 rounded-xl bg-line/40" />
          </div>
        </div>
        <p className="sr-only">Carregando editor</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="panel-in flex h-dvh flex-col items-center justify-center gap-4 bg-background px-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert className="h-5 w-5" />
        </span>
        <p className="text-[17px] font-semibold text-ink">
          Não foi possível abrir o editor
        </p>
        <p className="max-w-sm text-[14px] text-muted">
          {loadError || "Perfil indisponível. Verifique se a API está no ar."}
        </p>
        <div className="flex gap-2">
          <Button type="button" onClick={() => void load()}>
            Tentar de novo
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app">Voltar ao painel</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="border-b border-line bg-white">
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Logo href="/app" size="sm" />
            <span
              className={cn(
                "hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline",
                profile.status === "PUBLISHED"
                  ? "bg-lime text-ink"
                  : "bg-background text-muted",
              )}
            >
              {profile.status === "PUBLISHED" ? "No ar" : "Rascunho"}
            </span>
            <span
              className={cn(
                "inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-[12px]",
                saveUi === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : saveUi === "saved"
                    ? "border-line bg-background text-muted"
                    : "border-line bg-white text-muted",
              )}
            >
              {saveUi === "pending" ? (
                <>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bronze-soft" />
                  Alterações pendentes
                </>
              ) : saveUi === "saving" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  Salvando
                </>
              ) : saveUi === "error" ? (
                <>
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Não salvou</span>
                  <button
                    type="button"
                    className="shrink-0 font-semibold underline underline-offset-2"
                    onClick={() =>
                      void flushPendingSaves().catch(() => undefined)
                    }
                  >
                    Tentar
                  </button>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0 text-ink/45" />
                  Salvo
                </>
              )}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {profile.username ? (
              <button
                type="button"
                onClick={() => void copyPublicLink()}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12px] font-medium text-muted hover:text-ink"
                aria-label="Copiar link da página"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-ink" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="hidden max-w-[8.5rem] truncate sm:inline">
                  {copied ? "Copiado" : `/u/${profile.username}`}
                </span>
              </button>
            ) : null}
            {profile.status === "PUBLISHED" && profile.username ? (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden h-11 sm:inline-flex"
              >
                <Link href={`/u/${profile.username}`} target="_blank">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              className="h-11"
              disabled={publishing}
              onClick={() => void onPublish()}
            >
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publicando
                </>
              ) : profile.status === "PUBLISHED" ? (
                "Atualizar"
              ) : (
                "Publicar"
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-1 border-b border-line bg-white p-1 lg:hidden">
        {(
          [
            ["blocks", "Blocos"],
            ["edit", "Editar"],
            ["preview", "Prévia"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className={cn(
              "h-11 rounded-full text-[13px] font-semibold transition-colors",
              mobileTab === id
                ? "bg-ink text-white"
                : "text-muted hover:bg-background",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[272px_minmax(0,1fr)_minmax(280px,380px)]">
        <aside
          className={cn(
            "min-h-0 flex-col border-r border-line bg-white",
            mobileTab === "blocks" ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="border-b border-line p-3">
            <Button
              type="button"
              className="h-11 w-full"
              variant={inserterOpen ? "secondary" : "primary"}
              onClick={() => setInserterOpen((v) => !v)}
            >
              {inserterOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {inserterOpen ? "Fechar" : "Adicionar bloco"}
            </Button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["templates", "Modelos", LayoutTemplate],
                  ["appearance", "Aparência", Palette],
                ] as const
              ).map(([panel, label, Icon]) => (
                <button
                  key={panel}
                  type="button"
                  onClick={() => {
                    setEditorPanel(panel);
                    setSelectedId(null);
                    setMobileTab("edit");
                    setInserterOpen(false);
                  }}
                  className={cn(
                    "flex h-10 items-center justify-center gap-1.5 rounded-xl border text-[12px] font-semibold transition-colors",
                    editorPanel === panel
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-muted hover:border-ink/20 hover:text-ink",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {inserterOpen ? (
            <div className="panel-in border-b border-line bg-background/70 p-3">
              <div className="relative mb-2.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-soft" />
                <input
                  type="search"
                  value={inserterQuery}
                  onChange={(event) => setInserterQuery(event.target.value)}
                  placeholder="Buscar bloco: whatsapp, preços..."
                  aria-label="Buscar bloco"
                  className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-muted-soft focus:border-ink/25"
                />
              </div>
              {inserterGroups.length === 0 ? (
                <p className="px-1 py-6 text-center text-[12px] text-muted">
                  Nada com esse nome. Tente “link”, “preços” ou “mapa”.
                </p>
              ) : (
                <div className="space-y-3">
                  {inserterGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {group.types.map((type) => {
                          const Icon = BLOCK_ICONS[type];
                          const existing = UNIQUE_BLOCKS.includes(type)
                            ? orderedBlocks.find((block) => block.type === type)
                            : undefined;
                          const locked =
                            !existing &&
                            !canAddBlock(entitlements, orderedBlocks.length, type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                if (existing) {
                                  setEditorPanel("block");
                                  setSelectedId(existing.id);
                                  setInserterOpen(false);
                                  setMobileTab("edit");
                                  return;
                                }
                                void addBlock(type);
                              }}
                              className="flex min-h-11 items-center gap-2.5 rounded-xl border border-transparent bg-white px-2.5 py-2 text-left transition-colors hover:border-ink/10 hover:bg-white active:scale-[0.99]"
                            >
                              <span
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                  existing
                                    ? "bg-background text-muted"
                                    : "bg-ink text-white",
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-semibold text-ink">
                                  {BLOCK_META[type].label}
                                </span>
                                <span className="block truncate text-[11px] text-muted">
                                  {existing
                                    ? "Já na página — abrir para editar"
                                    : locked
                                      ? "Disponível no Pro"
                                      : BLOCK_META[type].description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
              Na página
            </p>
            <p className="mb-3 px-1 text-[12px] leading-relaxed text-muted lg:hidden">
              Segure as listras para arrastar, ou use as setas.
            </p>
            {orderedBlocks.length === 0 ? (
              <div className="panel-in rounded-2xl border border-dashed border-line px-4 py-6 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background text-ink">
                  <LayoutTemplate className="h-4 w-4" />
                </span>
                <p className="mt-3 text-[13px] font-semibold text-ink">
                  Sua página está vazia
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {entitlements.customTheme
                    ? "Comece por um modelo pronto e depois só troque os textos."
                    : "Adicione um bloco para montar a página. Modelos prontos ficam no Pro e no Premium."}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 h-10 w-full"
                  onClick={() => {
                    if (!entitlements.customTheme) {
                      setInserterOpen(true);
                      return;
                    }
                    setEditorPanel("templates");
                    setSelectedId(null);
                    setMobileTab("edit");
                    setInserterOpen(false);
                  }}
                >
                  {entitlements.customTheme ? "Ver modelos" : "Adicionar bloco"}
                </Button>
              </div>
            ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => void onDragEnd(e)}
            >
              <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {orderedBlocks.map((block, index) => (
                    <SortableBlockRow
                      key={block.id}
                      block={block}
                      selected={
                        editorPanel === "block" && selectedId === block.id
                      }
                      canMoveUp={index > 0}
                      canMoveDown={index < orderedBlocks.length - 1}
                      onMoveUp={() => void moveBlock(block.id, -1)}
                      onMoveDown={() => void moveBlock(block.id, 1)}
                      onSelect={() => {
                        setEditorPanel("block");
                        setSelectedId(block.id);
                        setMobileTab("edit");
                        setInserterOpen(false);
                      }}
                      onToggleVisible={() => {
                        setEditorPanel("block");
                        setSelectedId(block.id);
                        setBlocks((prev) =>
                          prev.map((item) =>
                            item.id === block.id
                              ? { ...item, isVisible: !item.isVisible }
                              : item,
                          ),
                        );
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            )}
          </div>
        </aside>

        <aside
          className={cn(
            "relative min-h-0 flex-col bg-background",
            mobileTab === "preview" ? "flex" : "hidden lg:flex",
          )}
        >
          {previewPage ? (
            <>
              <div className="hidden w-full flex-col items-center overflow-y-auto py-8 lg:flex">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-soft">
                  Prévia
                </p>
                <PhoneFrame>
                  <ProfilePreview
                    page={previewPage}
                    selectedId={
                      editorPanel === "block" ? selectedId : null
                    }
                    onSelectBlock={(id) => {
                      setEditorPanel("block");
                      setSelectedId(id);
                      setInserterOpen(false);
                    }}
                  />
                </PhoneFrame>
              </div>
              <div className="flex min-h-0 w-full flex-1 flex-col lg:hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5">
                  <p className="text-[12px] font-medium text-muted">
                    Toque num bloco para editar
                  </p>
                  {profile.username ? (
                    <Link
                      href={`/u/${profile.username}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink"
                    >
                      Abrir
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ProfilePreview
                    page={previewPage}
                    showHidden
                    showStatusBar={false}
                    selectedId={editorPanel === "block" ? selectedId : null}
                    onSelectBlock={(id) => {
                      setEditorPanel("block");
                      setSelectedId(id);
                      setMobileTab("edit");
                      setInserterOpen(false);
                    }}
                  />
                </div>
              </div>
            </>
          ) : null}
        </aside>

        <section
          className={cn(
            "min-h-0 overflow-y-auto border-l border-line bg-white",
            mobileTab === "edit" ? "block" : "hidden lg:block",
          )}
        >
          {editorPanel === "templates" ? (
            <div className="panel-in flex h-full min-h-0 flex-col">
              <div className="border-b border-line px-4 py-4 sm:px-5">
                <button
                  type="button"
                  className="mb-3 inline-flex h-10 items-center gap-1.5 text-[13px] font-medium text-muted lg:hidden"
                  onClick={() => setMobileTab("blocks")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Blocos
                </button>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                    <LayoutTemplate className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-semibold text-ink">
                      Modelos prontos
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted">
                      Uma página inteira montada em um toque.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-5">
                <TemplateGallery
                  hasContent={orderedBlocks.length > 0}
                  applyingId={applyingTemplate}
                  locked={!entitlements.customTheme}
                  onUnlock={() =>
                    requestUpgrade(
                      "Os modelos prontos são do Pro e do Premium. Eles montam tema, serviços e depoimentos.",
                    )
                  }
                  onApply={(template) => void applyTemplate(template)}
                />
              </div>
            </div>
          ) : editorPanel === "appearance" ? (
            <div className="panel-in flex h-full min-h-0 flex-col">
              <div className="border-b border-line px-4 py-4 sm:px-5">
                <button
                  type="button"
                  className="mb-3 inline-flex h-10 items-center gap-1.5 text-[13px] font-medium text-muted lg:hidden"
                  onClick={() => setMobileTab("blocks")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Blocos
                </button>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                    <Palette className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-semibold text-ink">
                      Aparência
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted">
                      Fundo, cores e endereço da página.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-5">
                <AppearancePanel
                  profile={profile}
                  themeLocked={!entitlements.customTheme}
                  onUnlockTheme={() =>
                    requestUpgrade(
                      "Cores, temas e modelos visuais ficam no Pro e no Premium.",
                    )
                  }
                  onChange={(patch) => {
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            ...patch,
                            theme: patch.theme
                              ? { ...patch.theme }
                              : prev.theme,
                          }
                        : prev,
                    );
                  }}
                />
                {profile.status === "PUBLISHED" ? (
                  <button
                    type="button"
                    className="mt-8 text-[12px] text-muted hover:text-ink"
                    onClick={() => void onUnpublish()}
                  >
                    Despublicar página
                  </button>
                ) : null}
              </div>
            </div>
          ) : selected && SelectedIcon ? (
            <div key={selected.id} className="panel-in flex h-full min-h-0 flex-col">
              <div className="border-b border-line px-4 py-4 sm:px-5">
                <button
                  type="button"
                  className="mb-3 inline-flex h-10 items-center gap-1.5 text-[13px] font-medium text-muted lg:hidden"
                  onClick={() => setMobileTab("blocks")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Blocos
                </button>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                    <SelectedIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-semibold text-ink">
                      {BLOCK_META[selected.type].label}
                    </h2>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                      {BLOCK_TIPS[selected.type]}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-ink"
                      aria-label={
                        selected.isVisible ? "Ocultar bloco" : "Mostrar bloco"
                      }
                      onClick={() =>
                        updateSelected({
                          ...selected,
                          isVisible: !selected.isVisible,
                        })
                      }
                    >
                      {selected.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    {confirmRemoveId === selected.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="h-11 rounded-lg px-2.5 text-[12px] font-semibold text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setConfirmRemoveId(null);
                            void removeBlock(selected.id);
                          }}
                        >
                          Apagar?
                        </button>
                        <button
                          type="button"
                          className="h-11 rounded-lg px-2 text-[12px] font-medium text-muted hover:bg-background hover:text-ink"
                          onClick={() => setConfirmRemoveId(null)}
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600"
                        aria-label="Remover bloco"
                        onClick={() => setConfirmRemoveId(selected.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-5 py-5">
                <BlockInspector
                  block={selected}
                  onChange={updateSelected}
                  profile={profile}
                  services={services}
                  testimonials={testimonials}
                  onServicesChange={handleServicesChange}
                  onTestimonialsChange={handleTestimonialsChange}
                  canAddService={canAddCountedItem(
                    entitlements.maxServices,
                    services.length,
                  )}
                  canAddTestimonial={canAddCountedItem(
                    entitlements.maxTestimonials,
                    testimonials.length,
                  )}
                  onLimitReached={() =>
                    requestUpgrade(
                      "O Free chega no limite de serviços ou depoimentos. Assine Pro ou Premium.",
                    )
                  }
                  hasLocationBlock={blocks.some(
                    (b) => b.type === "LOCATION" && b.isVisible,
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="panel-in flex h-full flex-col items-center justify-center px-6 py-16 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-ink">
                <LayoutTemplate className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[15px] font-semibold text-ink">
                Escolha o que editar
              </p>
              <p className="mt-1 max-w-[240px] text-[13px] leading-relaxed text-muted">
                {entitlements.customTheme
                  ? "Toque num bloco da lista ou da prévia. Ou comece por um modelo pronto."
                  : "Toque num bloco da lista ou da prévia. Modelos prontos ficam no Pro e no Premium."}
              </p>
              <div className="mt-6 flex w-full max-w-[240px] flex-col gap-2">
                <Button
                  type="button"
                  className="h-11"
                  onClick={() => {
                    if (!entitlements.customTheme) {
                      requestUpgrade(
                        "Os modelos prontos são do Pro e do Premium. Eles montam tema, serviços e depoimentos.",
                      );
                      return;
                    }
                    setEditorPanel("templates");
                    setSelectedId(null);
                    setMobileTab("edit");
                  }}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  {entitlements.customTheme
                    ? "Ver modelos prontos"
                    : "Modelos no Pro"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 lg:hidden"
                  onClick={() => setMobileTab("blocks")}
                >
                  Ir para os blocos
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  onClick={() => {
                    setEditorPanel("appearance");
                    setSelectedId(null);
                    setMobileTab("edit");
                  }}
                >
                  <Palette className="h-4 w-4" />
                  Aparência da página
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
      <Toast
        message={toast?.text || ""}
        variant={toast?.variant}
        show={Boolean(toast)}
        onDismiss={() => setToast(null)}
      />
      <UpgradeModal
        open={upgradeOpen}
        plans={plans}
        message={upgradeMessage}
        onClose={() => setUpgradeOpen(false)}
        onChoosePlan={(plan) => {
          setUpgradeOpen(false);
          setCheckoutPlan(plan);
        }}
      />
      <CheckoutDialog
        open={checkoutPlan !== null}
        planId={checkoutPlan}
        plans={plans}
        defaultEmail={user?.email}
        onClose={() => setCheckoutPlan(null)}
      />
    </div>
  );
}
