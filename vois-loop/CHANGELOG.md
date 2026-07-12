# Changelog

All notable changes to the vois-loop skill are documented here.

---

## [1.5.0] — 2026-07-12

### Added

- **Taste dials and the design read in loop state:** the `Dials: V/M/D` and `Design read:` lines are captured from vois-router (Step 2) before the chain runs, so a wrong read or miscalibrated dials surface at the cheapest possible point.
- **Anti-slop and redesign-safety checks in the Step 4 validate pass:** a new Anti-slop category (`DS-SLOP-*`, with `DS-SLOP-002` folded in from the auto-checker as advisory) and a Redesign-safety category that fires only on REDESIGN runs, guarding against silently changed load-bearing identifiers and out-of-mode changes.

### Changed

- **Version bump:** `1.4.0` → `1.5.0`

---

## [1.4.0] — 2026-06-25

### Changed

- **Step 4: Validate pass** now opens by running vois-tokens' mechanical detector (`scripts/detect.mjs`) against every file changed in the iteration, before grading by eye. Checklist items the detector covers are marked `(auto-checked)` (or `(auto-checked, advisory)` for the two color rules that stay advisory to avoid overlapping with the token-drift app); their PASS/WARN/FAIL is taken directly from the detector's findings instead of being re-derived by reading the code. Judgment-only items are unchanged.
- **Version bump:** `1.3.0` → `1.4.0`

---

## [1.3.0] — 2026-06-17

### Added

- **Sixth conflict type:** vois-tokens/vois-components conflicting with a previously stated design-rationale principle now loops back to `design-rationale` instead of being silently overridden.

### Changed

- **Version bump:** `1.2.1` → `1.3.0`

---

## [1.2.1] — 2026-06-17

### Changed

- Updated cross-references from `vois-design-system` to its new name, `vois-tokens`.

---

## [1.2.0] — 2026-06-13

### Added

**Loop orchestration**

- Single entry point for any feature build starting from a ticket, brief, or raw description
- Wraps design-ask, vois-router, and the full design system skill chain in a managed loop
- Loop state block printed at every handoff — iteration counter, mode, platform, per-skill status, active conflicts, loop-back triggers, designer inputs

**Conflict detection**

- Five conflict types defined with explicit upstream targets: vois-components → vois-tokens, righter (inline) → vois-tokens, vois-tokens → vois-components, vois-patterns → vois-components, and any skill → design-ask
- Clear separation between what counts as a conflict (requires loop-back) and what does not (righter iteration, multiple valid component options, pattern gaps, validate WARN)

**Loop-back protocol**

- Structured loop-back block with: conflict source, conflict description, upstream target, new context, and iteration count
- Gated mode: shows loop-back block and waits for confirmation before re-running
- Fast mode: loops back immediately, notes it in the completion block
- Max 3 iterations — surfaces to designer after third pass if unresolved, with two options (accept trade-off or escalate)

**Pause-and-ask protocol**

- Five trigger conditions: design-ask caution + routing fork, equal-confidence path split in vois-patterns, context-dependent component fork, righter needs brand context, validate FAIL with multiple valid fixes
- Binary (Y/N) and multiple-choice (A/B/C) output formats
- Maximum one question per pause; designer's answer recorded in loop state

**Inline validate pass (Step 4)**

- Runs after vois-tokens completes, before design-rationale
- Six check categories: Semantic HTML, Accessibility, Token alignment, React, Animation, Component fidelity
- Three verdicts per category: PASS, WARN (non-blocking), FAIL (triggers loop-back)
- All checks tied to vois-tokens rule IDs (`DS-A11Y-*`, `DS-SPACING-*`, `DS-ANIMATION-*`, etc.)

**Gated and fast modes**

- Gated (default): pauses at each handoff and loop-back; designer confirms before proceeding
- Fast: runs full chain and any loop-backs without stopping; presents chain completion block at end
- Mode switchable at any point mid-session

**Chain completion block**

- Consolidated record: work type, platform, iteration count, decisions per skill, loop-backs, designer inputs, validation results, rule usage, gaps flagged

---

**Last updated:** 2026-06-13  
**Current version:** 1.2.0
