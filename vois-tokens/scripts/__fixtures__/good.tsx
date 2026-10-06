// Fixture: clean equivalent of bad.tsx — should trigger zero findings.
import { motion } from "motion/react";

export function GoodCard() {
  return (
    <div className="bg-surface text-on-surface p-3 transition-colors duration-200 h-dvh will-change-transform">
      <div className="text-on-surface">token-based color</div>
      <a href="/x" className="outline-none focus-visible:ring-2">has focus ring</a>
      <img src="/cat.png" alt="A cat" />
      Loading…
      <div className="space-y-2" />
      <button className="active:scale-97">Press</button>
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} />
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
