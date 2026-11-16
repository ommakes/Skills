import * as React from "react";
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent, type DragOverEvent, type DragStartEvent, type Announcements,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { copy as defaultCopy, type Copy } from "@/lib/questionnaire/copy";
import type { Option } from "@/lib/questionnaire/types";
import { FieldShell } from "./field-shell";

export interface TapToRankProps {
  legend: string;
  helper?: string | null;
  requirementLabel?: string;
  options: Option[];
  mode: "rank_all" | "top_n";
  topN?: number;
  /** Ordered ids, best first. Empty until the person moves an item or keeps the order. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Up and Down buttons. Keep on: they are the single-pointer alternative to dragging (WCAG 2.5.7). */
  showMoveButtons?: boolean;
  /** Press and hold time before a drag starts, in ms. */
  holdMs?: number;
  copy?: Copy;
  className?: string;
}

const btn =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-input bg-background px-3 text-sm text-foreground " +
  "transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground";

interface RowProps {
  id: string; label: string; index: number; total: number; ranked: boolean;
  showMoveButtons: boolean; onMove: (d: -1 | 1) => void; copy: Copy;
}

function Row({ id, label, index, total, ranked, showMoveButtons, onMove, copy }: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      data-slot="rank-row"
      data-dragging={isDragging || undefined}
      data-ranked={ranked || undefined}
      // Press and hold anywhere on the row starts a drag. touch-action stays default so the page still scrolls.
      onPointerDown={listeners?.onPointerDown as React.PointerEventHandler<HTMLLIElement> | undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex min-h-14 select-none items-center gap-2 rounded-lg border border-input bg-background px-3 py-2",
        "data-[ranked]:border-primary data-[ranked]:bg-muted",
        "data-[dragging]:relative data-[dragging]:z-10 data-[dragging]:cursor-grabbing data-[dragging]:shadow-[var(--shadow-small)]"
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        onKeyDown={listeners?.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement> | undefined}
        aria-label={copy.rankHandle(label, index + 1, total)}
        className={cn(btn, "cursor-grab px-2")}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="currentColor">
          <circle cx="5" cy="4" r="1.2" /><circle cx="11" cy="4" r="1.2" />
          <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="12" r="1.2" /><circle cx="11" cy="12" r="1.2" />
        </svg>
      </button>
      <span className="w-6 text-sm font-medium text-foreground">{index + 1}</span>
      <span className="flex-1 text-base text-foreground">{label}</span>
      {showMoveButtons ? (
        <>
          <button type="button" className={btn} onClick={() => { if (index > 0) onMove(-1); }} aria-disabled={index === 0 || undefined} aria-label={copy.rankMoveUp(label)}>{copy.rankUp}</button>
          <button type="button" className={btn} onClick={() => { if (index < total - 1) onMove(1); }} aria-disabled={index === total - 1 || undefined} aria-label={copy.rankMoveDown(label)}>{copy.rankDown}</button>
        </>
      ) : null}
    </li>
  );
}

/** Card sort. Every item sits in one list. Press and hold to drag. Rows shift live as you move. */
export function TapToRank({
  legend, helper, requirementLabel, options, mode, topN, value, onChange,
  showMoveButtons = true, holdMs = 200, copy = defaultCopy, className,
}: TapToRankProps) {
  const touched = value.length > 0;
  const order = touched ? value : options.map((o) => o.id);
  const limit = mode === "top_n" ? (topN ?? 3) : options.length;
  const [live, setLive] = React.useState<string[] | null>(null); // order while dragging
  const shown = live ?? order;
  const [msg, setMsg] = React.useState("");
  const startOrder = React.useRef<string[]>(order);

  const label = (id: string | number) => options.find((o) => o.id === id)?.label ?? String(id);
  const pos = (ids: string[], id: string | number) => ids.indexOf(String(id)) + 1;

  const sensors = useSensors(
    // Delay applies to mouse and touch: "click and hold" and "press and hold" are the same gesture.
    useSensor(PointerSensor, { activationConstraint: { delay: holdMs, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) => copy.rankPickedUp(label(active.id), pos(order, active.id), order.length),
    onDragOver: ({ active, over }) => (over ? copy.rankOver(label(active.id), pos(arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id))), active.id), order.length) : undefined),
    onDragEnd: ({ active }) => copy.rankDropped(label(active.id), pos(live ?? order, active.id), order.length),
    onDragCancel: ({ active }) => copy.rankCancelled(label(active.id)),
  };

  function onStart(e: DragStartEvent) { startOrder.current = order; setLive(order); void e; }
  function onOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLive((cur) => {
      const base = cur ?? order;
      return arrayMove(base, base.indexOf(String(active.id)), base.indexOf(String(over.id)));
    });
  }
  function onEnd(e: DragEndEvent) {
    const final = live ?? order;
    setLive(null);
    if (e.over && final.join() !== startOrder.current.join()) onChange(final);
    else if (!touched && e.over) onChange(final);
  }
  function onCancel() { setLive(null); }

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = arrayMove(order, i, j);
    onChange(next);
    setMsg(copy.rankPosition(label(order[i]!), j + 1, order.length));
  }

  const helperText = helper ?? (mode === "top_n" ? copy.rankHelperTop(limit) : copy.rankHelperAll);

  return (
    <FieldShell legend={legend} requirementLabel={requirementLabel} helper={helperText} className={className}>
      <p className="text-sm text-muted-foreground">{copy.rankHelperKeys}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} accessibility={{ announcements }} onDragStart={onStart} onDragOver={onOver} onDragEnd={onEnd} onDragCancel={onCancel}>
        <SortableContext items={shown} strategy={verticalListSortingStrategy}>
          <ol aria-label={copy.rankListLabel} className="flex flex-col gap-2">
            {shown.map((id, i) => (
              <React.Fragment key={id}>
                <Row
                  id={id} label={label(id)} index={i} total={shown.length}
                  ranked={touched && i < limit} showMoveButtons={showMoveButtons}
                  onMove={(d) => move(order.indexOf(id), d)} copy={copy}
                />
                {mode === "top_n" && i === limit - 1 && shown.length > limit ? (
                  <li aria-hidden="true" className="border-t border-input pt-1 text-sm text-muted-foreground">{copy.rankCutoff(limit)}</li>
                ) : null}
              </React.Fragment>
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {!touched ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">{copy.rankNotSet}</p>
          <button type="button" className={btn} onClick={() => onChange(order)}>{copy.rankKeep}</button>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className="sr-only">{msg}</p>
    </FieldShell>
  );
}
