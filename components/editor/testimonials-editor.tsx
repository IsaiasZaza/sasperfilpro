"use client";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
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
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ChoicePickerSheet } from "@/components/editor/choice-picker-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveTestimonialLayout } from "@/lib/testimonials";
import {
  sortBySortOrder,
  type TestimonialItem,
  type TestimonialsContent,
  type TestimonialsLayout,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export function TestimonialsEditor({
  testimonials,
  defaultLayout = "stack",
  content,
  onChange,
  canAdd,
  testimonialLimit = null,
  onLimitReached,
}: {
  testimonials: TestimonialItem[];
  defaultLayout?: TestimonialsLayout;
  content?: TestimonialsContent | null;
  onChange: (next: TestimonialItem[]) => void;
  canAdd: boolean;
  testimonialLimit?: number | null;
  onLimitReached?: () => void;
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const ordered = sortBySortOrder(testimonials);

  function patch(id: string, partial: Partial<TestimonialItem>) {
    onChange(
      testimonials.map((item) =>
        item.id === id ? { ...item, ...partial } : item,
      ),
    );
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(
      arrayMove(ordered, oldIndex, newIndex).map((item, sortOrder) => ({
        ...item,
        sortOrder,
      })),
    );
  }

  function duplicateItem(item: TestimonialItem) {
    if (!canAdd) {
      onLimitReached?.();
      return;
    }
    const index = ordered.findIndex((entry) => entry.id === item.id);
    const copy: TestimonialItem = {
      ...item,
      id: `tmp_${Date.now()}`,
      authorName: item.authorName ? `${item.authorName} (cópia)` : "Cliente",
      sortOrder: index >= 0 ? index + 1 : ordered.length,
    };
    const next = [...ordered];
    if (index >= 0) next.splice(index + 1, 0, copy);
    else next.push(copy);
    onChange(next.map((entry, sortOrder) => ({ ...entry, sortOrder })));
  }

  return (
    <div className="space-y-3">
      {ordered.length === 0 ? (
        <p className="text-[13px] text-muted">
          Adicione falas reais de clientes para gerar confiança.
        </p>
      ) : (
        <p className="text-[12px] text-muted">
          Arraste pela alça para reordenar.
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={ordered.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {ordered.map((item, index) => (
              <SortableTestimonialCard
                key={item.id}
                item={item}
                index={index}
                defaultLayout={defaultLayout}
                content={content}
                canDuplicate={canAdd}
                onPatch={(partial) => patch(item.id, partial)}
                onDuplicate={() => duplicateItem(item)}
                onRemove={() =>
                  onChange(testimonials.filter((tst) => tst.id !== item.id))
                }
                onLimitReached={onLimitReached}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {!canAdd && testimonialLimit != null ? (
        <p className="text-[12px] leading-relaxed text-muted">
          Limite do plano: {testimonialLimit} depoimento
          {testimonialLimit === 1 ? "" : "s"}. Faça upgrade para adicionar
          mais.
        </p>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!canAdd}
        onClick={() => {
          if (!canAdd) {
            onLimitReached?.();
            return;
          }
          onChange([
            ...ordered,
            {
              id: `tmp_${Date.now()}`,
              authorName: "Cliente",
              text: "Excelente atendimento.",
              rating: 5,
              sortOrder: ordered.length,
              isVisible: true,
              layout: defaultLayout,
              padding: "md",
              spacing: "md",
            },
          ]);
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar depoimento
      </Button>
    </div>
  );
}

function SortableTestimonialCard({
  item,
  index,
  defaultLayout,
  content,
  canDuplicate,
  onPatch,
  onDuplicate,
  onRemove,
  onLimitReached,
}: {
  item: TestimonialItem;
  index: number;
  defaultLayout: TestimonialsLayout;
  content?: TestimonialsContent | null;
  canDuplicate: boolean;
  onPatch: (partial: Partial<TestimonialItem>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onLimitReached?: () => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const itemLayout = resolveTestimonialLayout(item, content ?? { layout: defaultLayout });
  const asQuote = itemLayout === "quote";
  const layoutValue = item.layout ?? defaultLayout;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "space-y-3 rounded-2xl border border-line bg-white p-3.5",
        isDragging && "z-10 shadow-md",
        !item.isVisible && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-muted active:cursor-grabbing"
            aria-label="Arrastar depoimento"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <p className="text-[12px] font-semibold text-ink">
            Cliente {index + 1}
            {!item.isVisible ? (
              <span className="ml-1.5 font-normal text-muted">· oculto</span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            label={item.isVisible ? "Ocultar" : "Mostrar"}
            onClick={() => onPatch({ isVisible: !item.isVisible })}
          >
            {item.isVisible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </IconButton>
          <IconButton
            label="Duplicar depoimento"
            onClick={() => {
              if (!canDuplicate) {
                onLimitReached?.();
                return;
              }
              onDuplicate();
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </IconButton>
          {confirmRemove ? (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="h-8 rounded-lg px-2 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                onClick={() => {
                  setConfirmRemove(false);
                  onRemove();
                }}
              >
                Apagar?
              </button>
              <button
                type="button"
                className="h-8 rounded-lg px-1.5 text-[11px] font-medium text-muted hover:bg-background"
                onClick={() => setConfirmRemove(false)}
              >
                Não
              </button>
            </div>
          ) : (
            <IconButton
              label="Remover depoimento"
              danger
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>
      </div>

      <TestimonialMiniPreview
        asQuote={asQuote}
        authorName={item.authorName}
        text={item.text}
        rating={item.rating}
      />

      <ChoicePickerSheet
        label="Estilo"
        hint={
          asQuote
            ? "Texto grande com aspas, sem estrelas."
            : "Cartão com estrelas e fundo."
        }
        value={layoutValue}
        onChange={(layout) => onPatch({ layout })}
        options={[
          { value: "stack", label: "Card" },
          { value: "quote", label: "Citação" },
        ]}
      />
      {!asQuote ? (
        <ChoicePickerSheet
          label="Espaço interno"
          hint="Padding dentro do card."
          value={item.padding || "md"}
          onChange={(padding) => onPatch({ padding })}
          options={[
            { value: "sm", label: "Compacto" },
            { value: "md", label: "Normal" },
            { value: "lg", label: "Amplo" },
          ]}
        />
      ) : null}
      <ChoicePickerSheet
        label="Espaço abaixo"
        hint="Distância até o próximo depoimento."
        value={item.spacing || "md"}
        onChange={(spacing) => onPatch({ spacing })}
        options={[
          { value: "sm", label: "Pouco" },
          { value: "md", label: "Normal" },
          { value: "lg", label: "Muito" },
        ]}
      />
      <div>
        <Label>Nome</Label>
        <Input
          value={item.authorName}
          onChange={(event) => onPatch({ authorName: event.target.value })}
          placeholder="Ana Clara"
        />
      </div>
      <div>
        <Label>Depoimento</Label>
        <Textarea
          value={item.text}
          onChange={(event) => onPatch({ text: event.target.value })}
          placeholder="Ficou perfeito, super recomendo."
        />
      </div>
      {!asQuote ? (
        <div>
          <Label>Nota</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => onPatch({ rating })}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-background"
                aria-label={`${rating} estrelas`}
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    rating <= (item.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-line",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[12px] leading-relaxed text-muted">
          Citações não exibem estrelas na página.
        </p>
      )}
    </div>
  );
}

function TestimonialMiniPreview({
  asQuote,
  authorName,
  text,
  rating,
}: {
  asQuote: boolean;
  authorName: string;
  text: string;
  rating: number;
}) {
  const previewText =
    text.trim() || "Seu depoimento aparece aqui na página.";
  const previewName = authorName.trim() || "Nome do cliente";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-dashed border-line bg-background/60 p-3",
        asQuote ? "relative pl-4" : "",
      )}
      aria-hidden="true"
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
        Prévia
      </p>
      {asQuote ? (
        <>
          <span
            className="absolute left-2 top-6 font-serif text-xl leading-none text-ink/25"
          >
            “
          </span>
          <p className="text-[13px] font-medium leading-snug text-ink">
            {previewText}
          </p>
        </>
      ) : (
        <>
          <div className="mb-1 flex gap-0.5 text-amber-400">
            {Array.from({
              length: Math.max(1, Math.min(5, rating || 5)),
            }).map((_, starIndex) => (
              <Star key={starIndex} className="h-2.5 w-2.5 fill-current" />
            ))}
          </div>
          <p className="text-[12px] leading-snug text-ink">
            “{previewText}”
          </p>
        </>
      )}
      <p className="mt-1.5 text-[11px] font-semibold text-muted">
        {previewName}
      </p>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-muted hover:bg-background hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
