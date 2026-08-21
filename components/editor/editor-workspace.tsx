"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
  Check,
  CheckCircle2,
  Circle,
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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { AppearancePanel } from "@/components/editor/appearance-panel";
import { BlockInspector } from "@/components/editor/block-inspector";
import {
  BLOCK_ICONS,
  BLOCK_TIPS,
  INSERTABLE_BLOCKS,
} from "@/components/editor/editor-meta";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  authApi,
  blocksApi,
  profileApi,
  servicesApi,
  testimonialsApi,
} from "@/lib/api-client";
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

function defaultContent(type: BlockType): ProfileBlock["content"] {
  switch (type) {
    case "HERO":
      return { name: "Seu nome", headline: "Sua profissão" };
    case "CTA_BUTTON":
      return { label: "Agendar horário", url: "https://", style: "primary" };
    case "LINK_BUTTON":
      return { label: "Conheça meu trabalho", url: "https://" };
    case "WHATSAPP":
      return {
        phone: "",
        message: "Oi! Vi seu perfil no PerfilPro",
        label: "WhatsApp",
      };
    case "SOCIAL":
      return {
        items: [{ network: "instagram", url: "https://instagram.com/" }],
      };
    case "SERVICES":
      return { heading: "Serviços" };
    case "TESTIMONIALS":
      return { heading: "Depoimentos" };
    case "LOCATION":
      return { address: "" };
  }
}

function SortableBlockRow({
  block,
  selected,
  onSelect,
  onToggleVisible,
}: {
  block: ProfileBlock;
  selected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
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
        "flex items-center gap-2 rounded-xl border px-2 py-2 transition-colors",
        selected
          ? "border-bronze/40 bg-white shadow-[0_8px_20px_-14px_rgba(20,17,14,0.45)]"
          : "border-transparent hover:border-line hover:bg-white/80",
        isDragging && "z-10 border-bronze/50 bg-white opacity-95 shadow-lg",
        !block.isVisible && "opacity-55",
      )}
    >
      <button
        type="button"
        className="inline-flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-soft active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            selected ? "bg-ink text-white" : "bg-[#efeae3] text-ink",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {BLOCK_META[block.type].label}
          </span>
          <span className="block truncate text-[11px] text-muted">
            {blockSummary(block)}
          </span>
        </span>
      </button>
      <button
        type="button"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
        aria-label={block.isVisible ? "Ocultar bloco" : "Mostrar bloco"}
        onClick={(event) => {
          event.stopPropagation();
          onToggleVisible();
        }}
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
  const router = useRouter();
  const { clearSession, refresh, setProfile: setAuthProfile } = useAuth();

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
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
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

  const checklist = useMemo(() => {
    const hero = orderedBlocks.find((b) => b.type === "HERO" && b.isVisible);
    const whatsapp = orderedBlocks.find(
      (b) => b.type === "WHATSAPP" && b.isVisible,
    );
    const heroName =
      hero && "name" in hero.content ? String(hero.content.name || "") : "";
    const phone =
      whatsapp && "phone" in whatsapp.content
        ? String(whatsapp.content.phone || "")
        : "";
    return [
      {
        id: "username",
        label: "Username definido",
        done: Boolean(profile?.username && !profile.username.startsWith("user-")),
      },
      {
        id: "name",
        label: "Nome no perfil",
        done: Boolean(profile?.displayName || heroName),
      },
      { id: "whatsapp", label: "WhatsApp preenchido", done: Boolean(phone) },
      {
        id: "services",
        label: "Pelo menos um serviço",
        done: services.length > 0,
      },
    ];
  }, [orderedBlocks, profile, services.length]);

  const readyCount = checklist.filter((i) => i.done).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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
      setProfile(p);
      setAuthProfile(p);
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
      lastSavedProfile.current = JSON.stringify({
        username: p.username,
        displayName: p.displayName,
        headline: p.headline,
        bio: p.bio,
        location: p.location,
        avatarUrl: p.avatarUrl,
        theme: p.theme,
      });
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
    setSaveState("saving");
    const blockId = selected.id;
    const blockType = selected.type;
    const content = selected.content;
    const isVisible = selected.isVisible;
    const title = selected.title;

    saveTimer.current = window.setTimeout(() => {
      void (async () => {
        try {
          await blocksApi.update(blockId, { content, isVisible, title });
          lastSavedBlock.current[blockId] = payload;

          if (blockType === "HERO") {
            const hero = content as {
              name?: string;
              headline?: string;
              bio?: string;
              location?: string;
              avatarUrl?: string;
            };
            const updatedProfile = await profileApi.update({
              displayName: hero.name || undefined,
              headline: hero.headline || undefined,
              bio: hero.bio || undefined,
              location: hero.location || undefined,
              avatarUrl: hero.avatarUrl || undefined,
            });
            setProfile(updatedProfile);
            setAuthProfile(updatedProfile);
          }
          setSaveState("saved");
        } catch {
          setSaveState("error");
        }
      })();
    }, 500);

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
    setSaveState("saving");
    servicesTimer.current = window.setTimeout(() => {
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
    }, 600);
    return () => {
      if (servicesTimer.current) window.clearTimeout(servicesTimer.current);
    };
  }, [services, loading, loadError]);

  useEffect(() => {
    if (loading || loadError) return;
    const snapshot = JSON.stringify(testimonials);
    if (snapshot === lastSavedTestimonials.current) return;

    if (testimonialsTimer.current) window.clearTimeout(testimonialsTimer.current);
    setSaveState("saving");
    testimonialsTimer.current = window.setTimeout(() => {
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
    }, 600);
    return () => {
      if (testimonialsTimer.current)
        window.clearTimeout(testimonialsTimer.current);
    };
  }, [testimonials, loading, loadError]);

  // Autosave aparência / dados da página
  useEffect(() => {
    if (loading || loadError || !profile) return;
    const snapshot = JSON.stringify({
      username: profile.username,
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      avatarUrl: profile.avatarUrl,
      theme: profile.theme,
    });
    if (snapshot === lastSavedProfile.current) return;

    if (profileTimer.current) window.clearTimeout(profileTimer.current);
    setSaveState("saving");
    profileTimer.current = window.setTimeout(() => {
      void (async () => {
        try {
          const updated = await profileApi.update({
            username: profile.username || undefined,
            displayName: profile.displayName || undefined,
            headline: profile.headline || undefined,
            bio: profile.bio || undefined,
            location: profile.location || undefined,
            avatarUrl: profile.avatarUrl || undefined,
            theme: profile.theme || undefined,
          });
          lastSavedProfile.current = JSON.stringify({
            username: updated.username,
            displayName: updated.displayName,
            headline: updated.headline,
            bio: updated.bio,
            location: updated.location,
            avatarUrl: updated.avatarUrl,
            theme: updated.theme,
          });
          setProfile(updated);
          setAuthProfile(updated);
          setSaveState("saved");
        } catch (err) {
          setSaveState("error");
          setMessage(
            err instanceof ApiError
              ? err.message
              : "Erro ao salvar aparência",
          );
        }
      })();
    }, 550);
    return () => {
      if (profileTimer.current) window.clearTimeout(profileTimer.current);
    };
  }, [profile, loading, loadError, setAuthProfile]);

  async function addBlock(type: BlockType) {
    try {
      setSaveState("saving");
      const created = await blocksApi.create({
        type,
        content: defaultContent(type),
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
      setMessage(err instanceof ApiError ? err.message : "Erro ao criar bloco");
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

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedBlocks.findIndex((b) => b.id === active.id);
    const newIndex = orderedBlocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(orderedBlocks, oldIndex, newIndex).map(
      (block, sortOrder) => ({ ...block, sortOrder }),
    );
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

  function updateSelected(next: ProfileBlock) {
    setBlocks((prev) => prev.map((b) => (b.id === next.id ? next : b)));
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
      setProfile(published);
      await refresh();
      setMessage("Página publicada! Seu link já pode ir na bio.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Erro ao publicar");
    }
  }

  async function onUnpublish() {
    try {
      const draft = await profileApi.unpublish();
      setProfile(draft);
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
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearSession();
    router.push("/login");
  }

  const SelectedIcon = selected ? BLOCK_ICONS[selected.type] : null;

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f6f3ee] text-muted">
        Carregando editor...
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#f6f3ee] px-5 text-center">
        <p className="font-serif text-xl text-ink">Não foi possível abrir o editor</p>
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
    <div className="flex h-dvh flex-col bg-[linear-gradient(180deg,#f3efe8_0%,#efeae3_40%,#e8e1d6_100%)]">
      <header className="border-b border-line/80 bg-[#fffcf8]/95 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/app" className="shrink-0 font-serif text-[1.25rem] text-ink">
              PerfilPro
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-medium text-ink">Editor</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    profile.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-[#efeae3] text-muted",
                  )}
                >
                  {profile.status === "PUBLISHED" ? "Publicada" : "Rascunho"}
                </span>
                <span className="hidden items-center gap-1 text-[11px] text-muted sm:inline-flex">
                  {saveState === "saving"
                    ? "Salvando..."
                    : saveState === "error"
                      ? "Erro ao salvar"
                      : (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            Salvo
                          </>
                        )}
                </span>
              </div>
              {profile.username ? (
                <p className="truncate text-[11px] text-muted">
                  /u/{profile.username}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/app"
              className="hidden px-2 text-[13px] font-medium text-muted hover:text-ink sm:inline"
            >
              Painel
            </Link>
            {profile.username ? (
              <button
                type="button"
                onClick={() => void copyPublicLink()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 text-[12px] font-medium text-muted hover:text-ink sm:px-3"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {copied ? "Copiado" : "Copiar link"}
                </span>
              </button>
            ) : null}
            {profile.status === "PUBLISHED" && profile.username ? (
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Link href={`/u/${profile.username}`} target="_blank">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver
                </Link>
              </Button>
            ) : null}
            {profile.status === "PUBLISHED" ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => void onUnpublish()}
              >
                Despublicar
              </Button>
            ) : null}
            <Button type="button" size="sm" onClick={() => void onPublish()}>
              Publicar
            </Button>
            <button
              type="button"
              className="hidden text-[13px] font-medium text-ink underline-offset-4 hover:underline sm:inline"
              onClick={() => void handleLogout()}
            >
              Sair
            </button>
          </div>
        </div>

        {message ? (
          <div className="flex items-center justify-between gap-3 border-t border-line bg-white px-4 py-2 text-[13px] text-muted">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </header>

      <div className="grid grid-cols-3 border-b border-line bg-[#fffcf8] lg:hidden">
        {(
          [
            ["blocks", "Blocos"],
            ["edit", "Editar"],
            ["preview", "Preview"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className={cn(
              "py-2.5 text-[13px] font-medium",
              mobileTab === id
                ? "border-b-2 border-ink text-ink"
                : "text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside
          className={cn(
            "min-h-0 flex-col border-r border-line bg-[#fffcf8]/90",
            mobileTab === "blocks" ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="border-b border-line p-3">
            <Button
              type="button"
              className="w-full"
              size="sm"
              onClick={() => setInserterOpen((v) => !v)}
            >
              <Plus className="h-4 w-4" />
              {inserterOpen ? "Fechar inseridor" : "Adicionar bloco"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setEditorPanel("appearance");
                setSelectedId(null);
                setMobileTab("edit");
              }}
              className={cn(
                "mt-2 flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition",
                editorPanel === "appearance"
                  ? "border-bronze/40 bg-white text-ink shadow-sm"
                  : "border-transparent text-muted hover:border-line hover:bg-white/80 hover:text-ink",
              )}
            >
              <Palette className="h-4 w-4" />
              Aparência e página
            </button>
          </div>

          {inserterOpen ? (
            <div className="border-b border-line bg-white p-3">
              <div className="grid grid-cols-2 gap-2">
                {INSERTABLE_BLOCKS.map((type) => {
                  const Icon = BLOCK_ICONS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => void addBlock(type)}
                      className="flex flex-col items-start gap-2 rounded-xl border border-line bg-[#fffcf8] p-2.5 text-left hover:border-bronze/40 hover:bg-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[12px] font-semibold text-ink">
                        {BLOCK_META[type].label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
              Estrutura ({orderedBlocks.length})
            </p>
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
                  {orderedBlocks.map((block) => (
                    <SortableBlockRow
                      key={block.id}
                      block={block}
                      selected={
                        editorPanel === "block" && selectedId === block.id
                      }
                      onSelect={() => {
                        setEditorPanel("block");
                        setSelectedId(block.id);
                        setMobileTab("edit");
                      }}
                      onToggleVisible={() => {
                        setEditorPanel("block");
                        setSelectedId(block.id);
                        setMobileTab("edit");
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

            <div className="mt-5 rounded-2xl border border-line bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
                Pronto para publicar?
              </p>
              <p className="mt-1 text-[12px] text-muted">
                {readyCount}/{checklist.length}
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#efeae3]">
                <div
                  className="h-full rounded-full bg-bronze transition-all"
                  style={{
                    width: `${(readyCount / checklist.length) * 100}%`,
                  }}
                />
              </div>
              <ul className="mt-3 space-y-1.5">
                {checklist.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-soft" />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <section
          className={cn(
            "min-h-0 overflow-y-auto p-4 sm:p-6",
            mobileTab === "edit" ? "block" : "hidden lg:block",
          )}
        >
          {editorPanel === "appearance" ? (
            <div className="mx-auto max-w-xl">
              <div className="mb-4 rounded-2xl border border-line/80 bg-[#fffcf8] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
                    <Palette className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-serif text-[1.4rem] text-ink">
                      Aparência e página
                    </h2>
                    <p className="mt-1 text-[13px] text-muted">
                      Fundo, cores, botões e dados gerais do perfil.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-[#fffcf8] p-5 sm:p-6">
                <AppearancePanel
                  profile={profile}
                  onChange={(patch) => {
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            ...patch,
                            theme: patch.theme
                              ? { ...(prev.theme || {}), ...patch.theme }
                              : prev.theme,
                          }
                        : prev,
                    );
                  }}
                />
              </div>
            </div>
          ) : selected && SelectedIcon ? (
            <div className="mx-auto max-w-xl">
              <div className="mb-4 rounded-2xl border border-line/80 bg-[#fffcf8] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
                    <SelectedIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-[1.4rem] text-ink">
                      {BLOCK_META[selected.type].label}
                    </h2>
                    <p className="mt-1 text-[13px] text-muted">
                      {BLOCK_TIPS[selected.type]}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-muted"
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
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-red-600"
                      onClick={() => void removeBlock(selected.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-[#fffcf8] p-5 sm:p-6">
                <BlockInspector
                  block={selected}
                  onChange={updateSelected}
                  services={services}
                  testimonials={testimonials}
                  onServicesChange={handleServicesChange}
                  onTestimonialsChange={handleTestimonialsChange}
                />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
              <p className="font-serif text-xl text-ink">
                Selecione um bloco ou a aparência
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditorPanel("appearance");
                    setMobileTab("edit");
                  }}
                >
                  <Palette className="h-4 w-4" />
                  Aparência
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setInserterOpen(true);
                    setMobileTab("blocks");
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar bloco
                </Button>
              </div>
            </div>
          )}
        </section>

        <aside
          className={cn(
            "min-h-0 overflow-y-auto border-l border-line bg-[#ebe4d8]/70 p-4",
            mobileTab === "preview" ? "block" : "hidden lg:block",
          )}
        >
          <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
            Preview
          </p>
          <p className="mb-3 text-center text-[11px] text-muted">
            Clique no bloco para editar
          </p>
          {previewPage ? (
            <div className="mx-auto w-fit p-3">
              <PhoneFrame size="sm">
                <ProfilePreview
                  page={previewPage}
                  selectedId={
                    editorPanel === "block" ? selectedId : null
                  }
                  onSelectBlock={(id) => {
                    setEditorPanel("block");
                    setSelectedId(id);
                    setMobileTab("edit");
                  }}
                  onSelectBackground={() => {
                    setEditorPanel("appearance");
                    setSelectedId(null);
                    setMobileTab("edit");
                  }}
                />
              </PhoneFrame>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
