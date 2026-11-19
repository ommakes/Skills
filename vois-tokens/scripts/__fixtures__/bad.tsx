// Fixture: one deliberate violation per CODE_EXT-applicable [DS-*] rule.
import { motion } from "motion/react";
import { useState } from "react";
import { Check, X as CloseIcon } from "lucide-react";

const legacyOverride = "color: red !important;"; // DS-TAILWIND-004

export function BadCard() {
  return (
    <div className="bg-red-500 p-[13px] transition-all duration-700 h-screen will-change-left">
      {/* DS-COLOR-002, DS-SPACING-001, DS-TAILWIND-005, DS-ANIMATION-001, DS-LAYOUT-001, DS-ANIMATION-009 */}
      <div style={{ color: "#ff0000" }}>hardcoded color</div> {/* DS-COLOR-001 */}
      <button className="outline-none">no focus ring</button> {/* DS-A11Y-003 */}
      <img src="/cat.png" /> {/* DS-A11Y-010 */}
      Loading...
      {/* DS-TYPOGRAPHY-009 */}
      <br />
      <br /> {/* DS-A11Y-012 */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600" /> {/* DS-SLOP-002 (also trips DS-COLOR-002) */}
      <button className="active:scale-80">Press</button> {/* DS-ANIMATION-008 */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} /> {/* DS-ANIMATION-005; file has no reduced-motion fallback at all -> DS-ANIMATION-004 */}
    </div>
  );
}

// DS-MODAL: custom dialog with neither safeguard wired up, not Radix-backed.
function CustomDialog() {
  return <div role="dialog">custom modal</div>;
}

// DS-TABLE-001: scroll wrapper with no bounded height around a sticky header (the shape of a shared Table wrapper).
function BadTable() {
  return (
    <div className="relative w-full overflow-x-auto">
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

// Lookalikes: one deliberate violation per LOOKALIKE-* rule. Each marker is the rule it should trip.
function BadLookalikes() {
  const [shown, setShown] = useState(false);
  const flash = () => {
    setShown(true);
    setTimeout(() => setShown(false), 3000); // LOOKALIKE-007
    if (window.confirm("Sure?")) setShown(false); // LOOKALIKE-009
  };
  return (
    <div>
      <button className="rounded-sm focus-visible:ring-2">Open</button> {/* LOOKALIKE-001 */}
      <Loader2 className="size-4 animate-spin" /> {/* LOOKALIKE-002 */}
      <button role="radio" aria-checked="true">Monthly</button> {/* LOOKALIKE-003 */}
      <div onClick={flash}>Row</div> {/* LOOKALIKE-005 */}
      <span>×</span> {/* LOOKALIKE-008 */}
      <div role="alert" className="border-l-4 border-red-500 p-3">Failed</div> {/* LOOKALIKE-010 */}
      <span title="More info">?</span> {/* LOOKALIKE-011 */}
      <div className="size-10 rounded-full"><img src={photo} alt="" /></div> {/* LOOKALIKE-012 */}
      <div className="duration-[150ms] ease-[cubic-bezier(0.2,0,0,1)]" /> {/* DS-MOTION-001 */}
      <Check strokeWidth={3} /> {/* DS-ICON-001 */}
      <CloseIcon size={18} /> {/* DS-ICON-002 */}
    </div>
  );
}

// DS-GRID-007 (hard-coded column count), DS-GRID-004 (raw gutter), DS-PANEL-008 (hard-coded panel width).
function BadGridAndPanel() {
  return (
    <div className="grid grid-cols-3 gap-[24px]">
      <SheetContent className="w-[420px]" />
    </div>
  );
}

// DS-ELEVATION-007 (raw shadow with blur) and DS-ELEVATION-006 (docked panel, shadow not directional).
function BadElevation() {
  return (
    <div className="shadow-[0_4px_12px_rgba(0,0,0,0.2)]" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
      <aside className="fixed inset-y-0 right-0 shadow-[var(--shadow-large-left)]" />
      {/* DS-GLASS-003 and -004: no -webkit- twin, a literal blur. DS-GLASS-005: the blur is transitioned */}
      <nav style={{ backdropFilter: "blur(12px)" }} className="backdrop-blur-md transition-[opacity,backdrop-filter]" />
      {/* DS-ICON-005: icon-only Button with no accessible name */}
      <Button size="icon"><span className="icon" /></Button>
    </div>
  );
}

// DS-MODAL-005 (three buttons in a dialog footer) and DS-MODAL-006 (a dialog opened inside another).
function BadDialog() {
  return (
    <Dialog>
      <DialogContent>
        <Dialog>
          <DialogContent>Second step</DialogContent>
        </Dialog>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="outline">Save draft</Button>
          <Button>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// DS-TOKEN-001: a Global palette step named in component code instead of the token that aliases it
export function PaletteMisuse() {
  return <span className="bg-(--blue-9) text-[color:var(--gray-a11)]">Draft</span>;
}
