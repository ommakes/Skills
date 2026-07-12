// Fixture: one deliberate violation per CODE_EXT-applicable [DS-*] rule.
import { motion } from "motion/react";

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
