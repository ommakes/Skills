// Fixture: clean equivalent of bad.tsx — should trigger zero findings.
import { motion } from "motion/react";
import { Check, X as CloseIcon } from "lucide-react";

export function GoodCard() {
  return (
    <div className="bg-surface text-on-surface p-3 transition-colors duration-[var(--motion-duration-base)] h-dvh will-change-transform">
      <div className="text-on-surface">token-based color</div>
      <a href="/x" className="outline-none focus-visible:ring-2">has focus ring</a>
      <img src="/cat.png" alt="A cat" />
      Loading…
      <div className="space-y-2" />
      <button className="active:scale-97">Press</button>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} />
      <Check size={20} strokeWidth={1.5} />
      <CloseIcon className="size-5 md:size-6" />
      <Check className="h-4 w-4" />
      <p className="motion-reduce:transition-none">respects prefers-reduced-motion</p>
      <div onClick={(e) => e.stopPropagation()}>
        <Button variant="link">stopPropagation wrapper and a link-variant Button are fine</Button>
      </div>
      <abbr title="World Health Organization">WHO</abbr>
      <p>3 × 4, and a handler named onConfirm: {onConfirm()}</p>
      <style>{"@media (prefers-reduced-motion: reduce) { .x { transition: none; } }"}</style>
    </div>
  );
}

function GoodDialog() {
  // overscroll-behavior: contain; — applied via the shared modal-scroll class.
  return (
    <div role="dialog" inert={false} className="modal-scroll">
      accessible modal
    </div>
  );
}

function GoodComplexTable() {
  // Wrapper owns both axes and has a bounded height, so the sticky header sticks inside it.
  return (
    <div className="overflow-auto max-h-96">
      <table>
        <thead className="sticky top-0">
          <tr>
            <th>Name</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}

function GoodGridAndPanel() {
  // A page grid (12), a single column, a gutter from the token, panel widths from tokens, and a name that only looks like a panel.
  return (
    <div className="grid grid-cols-1 gap-[var(--grid-gutter)] md:grid-cols-12">
      <Sheet className="w-(--panel-push-default) max-w-full" />
      <Drawer className="w-[var(--panel-overlay-md)]" />
      <Spreadsheet className="w-80" />
      <div style={{ display: "grid", gap: "var(--grid-gutter)" }} />
    </div>
  );
}

// Elevation done right: tier tokens, zero-blur rings, and the directional token for the docked edge.
function GoodElevation() {
  return (
    <div className="shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-base)]" style={{ boxShadow: "0 0 0 2px var(--border-state-focus)" }}>
      <section className="shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-small)] shadow-none" />
      <aside className="fixed inset-y-0 right-0 shadow-[var(--shadow-large-right)]" />
      <div className="fixed inset-x-0 bottom-0 shadow-[var(--shadow-large-bottom)]" />
    </div>
  );
}

// A dialog footer with Cancel, a primary action and a link, and a sibling dialog that is not nested.
function GoodDialog() {
  return (
    <>
      <Dialog>
        <DialogContent>
          <DialogFooter>
            <Button variant="link">Learn more</Button>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogContent>Another dialog</DialogContent>
      </Dialog>
    </>
  );
}

// DS-TOKEN-001 passes: tokens that alias the palette, and a local alias of a step
export function PaletteAlias() {
  return <span className="bg-(--action-primary-resting) text-(--text-primary) [--chip-accent:var(--blue-9)]">Draft</span>;
}
