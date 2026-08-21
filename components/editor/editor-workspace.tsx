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
  Palette,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/brand/logo";
import { AppearancePanel } from "@/components/editor/appearance-panel";
import { BlockInspector } from "@/components/editor/block-inspector";
import {
  BLOCK_ICONS,
  BLOCK_TIPS,
  INSERTABLE_BLOCKS,
  UNIQUE_BLOCKS,
} from "@/components/editor/editor-meta";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import {
  blocksApi,
  profileApi,
  servicesApi,
  testimonialsApi,
} from "@/lib/api-client";
import {
  mergeThemeResponse,
  themeFromApi,
  themeToApi,
} from "@/lib/theme";
import { normalizeHttpUrl, prepareBlockContent } from "@/lib/url";
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
type EditorPanel = "block" | "appearance";

const SAVE_WAIT_MS = 5000;

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function profileSnapshot(profile: Profile) {
  return JSON.stringify({
    username: profile.username,
    displayName: profile.displayName,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    avatarUrl: profile.avatarUrl,
    theme: themeToApi(profile.theme) ?? {},
  });
}

function withPersistedTheme(
  updated: Profile,
  local: Profile | null | undefined,
): { profile: Profile; lost: boolean } {
  const merged = mergeThemeResponse(updated.theme, local?.theme);
  return { profile: { ...updated, theme: merged.theme }, lost: merged.lost };
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
  const { refresh, setProfile: setAuthProfile } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<ProfileBlock[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [inserterOpen, setInserterOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");
  const [editorPanel, setEditorPanel] = useState<EditorPanel>("block");
  const [copied, setCopied] = useState(false);

  const saveTimer = useRef<number | null>(null);
  const servicesTimer = useRef<number | null>(null);
  const testimonialsTimer = useRef<number | null>(null);
  const profileTimer = useRef<number | null>(null);
  const lastSavedBlock = useRef<Record<string, string>>({});
  const lastSavedServices = useRef("");
  const lastSavedTestimonials = useRef("");
  const lastSavedProfile = useRef("");
  const profileRef = useRef<Profile | null>(null);
  const profileSaveGen = useRef(0);

  const orderedBlocks = useMemo(() => sortBlocks(blocks), [blocks]);
  const selected = orderedBlocks.find((b) => b.id === selectedId) ?? null;
  const blockIds = useMemo(() => orderedBlocks.map((b) => b.id), [orderedBlocks]);

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
      const ordered = sortBlocks(b);
      const loaded = { ...p, theme: themeFromApi(p.theme) };
      setProfile(loaded);
      setAuthProfile(loaded);
      setBlocks(ordered);
      setServices(s);
      setTestimonials(t);
      setSelectedId(ordered[0]?.id ?? null);
      lastSavedBlock.current = {};
      for (const block of ordered) {
        lastSavedBlock.current[block.id] = JSON.stringify({
          content: block.content,
          isVisible: block.isVisible,
          title: block.title,
        });
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
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [message]);

  // Autosave bloco selecionado (sem loop)
  useEffect(() => {
    if (!selected) return;
    const payload = JSON.stringify({
      content: selected.content,
      isVisible: selected.isVisible,
      title: selected.title,
    });
    if (lastSavedBlock.current[selected.id] === payload) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    const blockId = selected.id;
    const blockType = selected.type;
    const content = selected.content;
    const isVisible = selected.isVisible;
    const title = selected.title;

    saveTimer.current = window.setTimeout(() => {
      setSaveState("saving");
      void (async () => {
        try {
          let previousContent: Record<string, unknown> | undefined;
          try {
            previousContent = JSON.parse(
              lastSavedBlock.current[blockId] || "{}",
            ).content;
          } catch {
            previousContent = undefined;
          }
          await blocksApi.update(blockId, {
            content: prepareBlockContent(
              blockType,
              content as Record<string, unknown>,
              previousContent,
            ),
            isVisible,
            title,
          });
          lastSavedBlock.current[blockId] = payload;

          if (blockType === "HERO") {
            const hero = content as {
              name?: string;
              headline?: string;
              bio?: string;
              location?: string;
              avatarUrl?: string;
            };
            const current = profileRef.current;
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
              location:
                hero.location !== undefined
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
            lastSavedProfile.current = profileSnapshot(merged);
            setProfile(merged);
            setAuthProfile(merged);
            if (lost) {
              setSaveState("error");
              setMessage("Não foi possível gravar o tema. Tente de novo.");
              return;
            }
          }
          setSaveState("saved");
        } catch {
          setSaveState("error");
        }
      })();
    }, SAVE_WAIT_MS);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [selected, setAuthProfile]);

  // Autosave serviços
  useEffect(() => {
    if (loading || loadError) return;
    const snapshot = JSON.stringify(services);
    if (snapshot === lastSavedServices.current) return;

    if (servicesTimer.current) window.clearTimeout(servicesTimer.current);
    servicesTimer.current = window.setTimeout(() => {
      setSaveState("saving");
      void (async () => {
        try {
          const resolved: ServiceItem[] = [];
          for (const local of services) {
            if (local.id.startsWith("tmp_")) {
              const created = await servicesApi.create({
                name: local.name,
                description: local.description,
                priceCents: local.priceCents,
                isVisible: local.isVisible,
              });
              resolved.push(created);
            } else {
              const updated = await servicesApi.update(local.id, {
                name: local.name,
                description: local.description,
                priceCents: local.priceCents,
                isVisible: local.isVisible,
              });
              resolved.push(updated);
            }
          }
          lastSavedServices.current = JSON.stringify(resolved);
          setServices(resolved);
          setSaveState("saved");
        } catch {
          setSaveState("error");
        }
      })();
    }, SAVE_WAIT_MS);
    return () => {
      if (servicesTimer.current) window.clearTimeout(servicesTimer.current);
    };
  }, [services, loading, loadError]);

  useEffect(() => {
    if (loading || loadError) return;
    const snapshot = JSON.stringify(testimonials);
    if (snapshot === lastSavedTestimonials.current) return;

    if (testimonialsTimer.current) window.clearTimeout(testimonialsTimer.current);
    testimonialsTimer.current = window.setTimeout(() => {
      setSaveState("saving");
      void (async () => {
        try {
          const resolved: TestimonialItem[] = [];
          for (const local of testimonials) {
            if (local.id.startsWith("tmp_")) {
              const created = await testimonialsApi.create({
                authorName: local.authorName,
                text: local.text,
                rating: local.rating,
                isVisible: local.isVisible,
              });
              resolved.push(created);
            } else {
              const updated = await testimonialsApi.update(local.id, {
                authorName: local.authorName,
                text: local.text,
                rating: local.rating,
                isVisible: local.isVisible,
              });
              resolved.push(updated);
            }
          }
          lastSavedTestimonials.current = JSON.stringify(resolved);
          setTestimonials(resolved);
          setSaveState("saved");
        } catch {
          setSaveState("error");
        }
      })();
    }, SAVE_WAIT_MS);
    return () => {
      if (testimonialsTimer.current)
        window.clearTimeout(testimonialsTimer.current);
    };
  }, [testimonials, loading, loadError]);

  // Autosave aparência / dados da página
  useEffect(() => {
    if (loading || loadError || !profile) return;
    const snapshot = profileSnapshot(profile);
    if (snapshot === lastSavedProfile.current) return;

    if (profileTimer.current) window.clearTimeout(profileTimer.current);
    const gen = ++profileSaveGen.current;
    const pending = profile;
    profileTimer.current = window.setTimeout(() => {
      setSaveState("saving");
      void (async () => {
        try {
          const updated = await profileApi.update({
            username: pending.username || undefined,
            displayName: emptyToNull(pending.displayName),
            headline: emptyToNull(pending.headline),
            bio: emptyToNull(pending.bio),
            location: emptyToNull(pending.location),
            avatarUrl: emptyToNull(pending.avatarUrl),
            theme: themeToApi(pending.theme),
          });
          if (gen !== profileSaveGen.current) return;
          const { profile: merged, lost } = withPersistedTheme(
            updated,
            pending,
          );
          lastSavedProfile.current = profileSnapshot(merged);
          setProfile(merged);
          setAuthProfile(merged);
          if (lost) {
            setSaveState("error");
            setMessage("Não foi possível gravar o tema. Tente de novo.");
            return;
          }
          setSaveState("saved");
        } catch (err) {
          if (gen !== profileSaveGen.current) return;
          setSaveState("error");
          setMessage(
            err instanceof ApiError
              ? err.message
              : "Erro ao salvar aparência",
          );
        }
      })();
    }, SAVE_WAIT_MS);
    return () => {
      if (profileTimer.current) window.clearTimeout(profileTimer.current);
    };
  }, [profile, loading, loadError, setAuthProfile]);

  async function addBlock(type: BlockType) {
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
      lastSavedBlock.current[created.id] = JSON.stringify({
        content: created.content,
        isVisible: created.isVisible,
        title: created.title,
      });
      setInserterOpen(false);
      setMobileTab("edit");
      setSaveState("saved");
    } catch (err) {
      const detail =
        err instanceof ApiError && Array.isArray(err.details)
          ? (err.details[0] as { message?: string } | undefined)?.message
          : null;
      setMessage(
        detail ||
          (err instanceof ApiError ? err.message : "Erro ao criar bloco"),
      );
      setSaveState("error");
    }
  }

  async function removeBlock(id: string) {
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
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Erro ao remover");
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
  }

  function handleServicesChange(next: ServiceItem[]) {
    const removed = services.filter(
      (s) => !next.some((n) => n.id === s.id) && !s.id.startsWith("tmp_"),
    );
    setServices(next);
    for (const item of removed) {
      void servicesApi.remove(item.id).catch(() => setSaveState("error"));
    }
  }

  function handleTestimonialsChange(next: TestimonialItem[]) {
    const removed = testimonials.filter(
      (t) => !next.some((n) => n.id === t.id) && !t.id.startsWith("tmp_"),
    );
    setTestimonials(next);
    for (const item of removed) {
      void testimonialsApi.remove(item.id).catch(() => setSaveState("error"));
    }
  }

  async function onPublish() {
    try {
      const published = await profileApi.publish();
      const { profile: merged } = withPersistedTheme(
        published,
        profileRef.current,
      );
      lastSavedProfile.current = profileSnapshot(merged);
      setProfile(merged);
      setAuthProfile(merged);
      await refresh();
      setMessage("Página publicada! Seu link já pode ir na bio.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Erro ao publicar");
    }
  }

  async function onUnpublish() {
    try {
      const draft = await profileApi.unpublish();
      const { profile: merged } = withPersistedTheme(draft, profileRef.current);
      lastSavedProfile.current = profileSnapshot(merged);
      setProfile(merged);
      setAuthProfile(merged);
      await refresh();
      setMessage("Página despublicada.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Erro ao despublicar");
    }
  }

  async function copyPublicLink() {
    if (!profile?.username) return;
    const url = `${window.location.origin}/u/${profile.username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setMessage("Link copiado. Cole na bio.");
    window.setTimeout(() => setCopied(false), 1600);
  }

  const SelectedIcon = selected ? BLOCK_ICONS[selected.type] : null;

  if (loading) {
    return (
      <div className="flex h-dvh flex-col bg-background">
        <div className="h-16 border-b border-line bg-white" />
        <div className="grid min-h-0 flex-1 lg:grid-cols-[272px_minmax(0,1fr)_minmax(280px,380px)]">
          <div className="hidden border-r border-line bg-white lg:block" />
          <div className="flex items-center justify-center bg-background">
            <div className="h-[520px] w-[260px] rounded-[2.4rem] bg-line/70" />
          </div>
          <div className="hidden border-l border-line bg-white lg:block" />
        </div>
        <p className="sr-only">Carregando editor</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background px-5 text-center">
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
                "hidden items-center gap-1.5 text-[12px] md:inline-flex",
                saveState === "error" ? "text-red-700" : "text-muted",
              )}
            >
              {saveState === "saving" ? (
                "Salvando..."
              ) : saveState === "error" ? (
                "Não salvou"
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-ink/50" />
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
            <Button type="button" className="h-11" onClick={() => void onPublish()}>
              {profile.status === "PUBLISHED" ? "Atualizar" : "Publicar"}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 border-b border-line bg-white p-1 lg:hidden">
        {(
          [
            ["blocks", "Blocos"],
            ["edit", "Editar"],
            ["preview", "Página"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className={cn(
              "h-11 rounded-full text-[13px] font-medium",
              mobileTab === id ? "bg-ink text-white" : "text-muted",
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
            <button
              type="button"
              onClick={() => {
                setEditorPanel("appearance");
                setSelectedId(null);
                setMobileTab("edit");
                setInserterOpen(false);
              }}
              className={cn(
                "mt-2 flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-[13px] font-semibold transition-colors",
                editorPanel === "appearance"
                  ? "bg-background text-ink"
                  : "text-muted hover:bg-background hover:text-ink",
              )}
            >
              <Palette className="h-4 w-4" />
              Aparência
            </button>
          </div>

          {inserterOpen ? (
            <div className="border-b border-line bg-background/70 p-3">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
                Novo bloco
              </p>
              <div className="grid grid-cols-1 gap-1">
                {INSERTABLE_BLOCKS.map((type) => {
                  const Icon = BLOCK_ICONS[type];
                  const existing = UNIQUE_BLOCKS.includes(type)
                    ? orderedBlocks.find((block) => block.type === type)
                    : undefined;
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
                      className="flex min-h-11 items-center gap-2.5 rounded-xl border border-transparent bg-white px-2.5 py-2 text-left hover:border-ink/10"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-ink">
                          {BLOCK_META[type].label}
                        </span>
                        {existing ? (
                          <span className="block text-[11px] text-muted">
                            Já na página — clicar para editar
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
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
              <p className="px-1 py-8 text-[13px] leading-relaxed text-muted">
                Nenhum bloco ainda. Toque em Adicionar bloco para montar a
                página.
              </p>
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
                    Prévia — só visualização
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
          {editorPanel === "appearance" ? (
            <div className="flex h-full min-h-0 flex-col">
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
            <div className="flex h-full min-h-0 flex-col">
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
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Remover bloco"
                      onClick={() => void removeBlock(selected.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-ink">
                Toque num bloco para editar
              </p>
              <p className="mt-1 max-w-[240px] text-[13px] leading-relaxed text-muted">
                A lista à esquerda e o celular no centro abrem os campos aqui.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-6 h-11"
                onClick={() => {
                  setEditorPanel("appearance");
                  setSelectedId(null);
                  setMobileTab("edit");
                }}
              >
                <Palette className="h-4 w-4" />
                Aparência
              </Button>
            </div>
          )}
        </section>
      </div>
      <Toast message={message || ""} show={Boolean(message)} />
    </div>
  );
}
