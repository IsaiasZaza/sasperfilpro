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
import { Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldHead } from "@/components/editor/size-pills";
import {
  formatPriceFromCents,
  parsePriceToCents,
  sortBySortOrder,
  type ServiceItem,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export function ServicesEditor({
  services,
  onChange,
  canAdd,
  onLimitReached,
}: {
  services: ServiceItem[];
  onChange: (next: ServiceItem[]) => void;
  canAdd: boolean;
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
  const ordered = sortBySortOrder(services);

  function patch(id: string, partial: Partial<ServiceItem>) {
    onChange(
      services.map((item) => (item.id === id ? { ...item, ...partial } : item)),
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

  return (
    <div className="space-y-3">
      {ordered.length === 0 ? (
        <p className="text-[13px] text-muted">
          Adicione os serviços que você oferece. O preço é opcional — deixe em
          branco se não quiser mostrar valor.
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
              <SortableServiceCard
                key={item.id}
                item={item}
                index={index}
                onPatch={(partial) => patch(item.id, partial)}
                onRemove={() =>
                  onChange(services.filter((svc) => svc.id !== item.id))
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          if (!canAdd) {
            onLimitReached?.();
            return;
          }
          onChange([
            ...ordered,
            {
              id: `tmp_${Date.now()}`,
              name: "Novo serviço",
              description: "",
              priceCents: 0,
              priceFormatted: "",
              sortOrder: ordered.length,
              isVisible: true,
            },
          ]);
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar serviço
      </Button>
    </div>
  );
}

function SortableServiceCard({
  item,
  index,
  onPatch,
  onRemove,
}: {
  item: ServiceItem;
  index: number;
  onPatch: (partial: Partial<ServiceItem>) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
            aria-label="Arrastar serviço"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <p className="text-[12px] font-semibold text-ink">
            Serviço {index + 1}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={item.isVisible ? "Ocultar" : "Mostrar"}
            onClick={() => onPatch({ isVisible: !item.isVisible })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted"
          >
            {item.isVisible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            aria-label="Remover serviço"
            onClick={onRemove}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div>
        <FieldHead label="Nome" />
        <Input
          value={item.name}
          onChange={(event) => onPatch({ name: event.target.value })}
          placeholder="Extensão fio a fio"
        />
      </div>
      <div>
        <FieldHead label="Descrição" />
        <Textarea
          value={item.description ?? ""}
          onChange={(event) => onPatch({ description: event.target.value })}
          placeholder="Duração, o que está incluso..."
          className="min-h-[72px]"
        />
      </div>
      <div>
        <FieldHead label="Preço (R$)" />
        <Input
          inputMode="decimal"
          value={
            item.priceCents
              ? (item.priceCents / 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              : ""
          }
          onChange={(event) => {
            const priceCents = parsePriceToCents(event.target.value);
            onPatch({
              priceCents,
              priceFormatted:
                priceCents > 0 ? formatPriceFromCents(priceCents) : "",
            });
          }}
          placeholder="Opcional"
        />
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Deixe vazio para o serviço aparecer sem valor.
        </p>
      </div>
    </div>
  );
}
