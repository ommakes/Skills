# Changelog

All notable changes to the vois-loop skill are documented here.

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
