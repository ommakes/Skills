# Changelog

All notable changes to the vois-router skill are documented here.

---

## [1.3.1] — 2026-06-17

### Changed

- Updated cross-references from `vois-design-system` to its new name, `vois-tokens`.

---

## [1.3.0] — 2026-06-17

### Changed

- **COMPONENT-ONLY route:** rewritten to specify scoped reference-file loading instead of vague "scoped" language. Now that `vois-tokens` has addressable `references/` files, the router tells it which component was picked and it reads only `references/components.md` (and usually `references/animation.md` for the transition) instead of the full skill.
- **Skill list in the intro:** updated to note which skills now use the `SKILL.md` + `references/` structure (`vois-tokens`, `vois-patterns`, `vois-components`).
- No changes to session state format, handoff blocks, work-type classification, or gap handling.
- **Version bump:** `1.2.0` → `1.3.0`

---

## [1.2.0] — 2026-06-14

### Added

**Mandatory righter copy gate (step 2b)**

A new required step in the FULL-CHAIN sequence, inserted between vois-components and vois-tokens:

- After vois-components completes, the router enumerates every text-bearing element on the screen: headings, subheads, body copy, CTAs, labels, placeholders, empty states, error messages, nav items, status badges, tooltips, form helper text, confirmations
- All items are batched and sent to righter in a single invocation — never per-item
- Implementation (vois-tokens) cannot begin until righter output is confirmed
- Approved copy is passed into vois-tokens as part of the context package
- Gate is mandatory in both gated and fast modes; only the gated confirmation prompt is skipped in fast mode

### Changed

- **FULL-CHAIN sequence:** step 2b added; vois-tokens context package updated to include `approved copy from step 2b`
- **Righter invocation rules:** new "Mandatory gate before implementation (step 2b)" subsection with step-by-step protocol
- **"What the router never does":** two new items — "Writes any implementation code before righter has reviewed all copy on the screen" and "Skips the step 2b copy gate because the chain is in fast mode"
- **Version bump:** `1.1.0` → `1.2.0`

---

## [1.1.0] — 2026-06-13

### Added

**Six work-type classifications**

- FULL-CHAIN: feature brief, screen description, Jira/ADO ticket, "build this" → entry at vois-patterns
- PICK-UP: resuming with a known path ID → entry at vois-components (with mandatory path ID validation)
- COMPONENT-ONLY: single component decision → entry at vois-components (scoped)
- COPY-ONLY: copy review or new copy request → entry at righter
- RATIONALE-ONLY: defending a design decision → entry at design-rationale (with pre-flight field check)
- AUDIT: reviewing an existing screen → design-rationale then vois-patterns lightweight pass

**Platform resolution**

- Confident inference rules for web, iOS, and Android from brief signals
- Explicit ask protocol when platform is genuinely ambiguous (one question, not multiple)

**Session state block**

- Persists across all steps in the chain
- Printed collapsed at every handoff
- Recovery artifact: paste back into a new session to resume from the last completed step

**Gated and fast modes**

- Gated (default): handoff block between each step; designer confirms before proceeding
- Fast: full chain without stops; chain completion block at end
- Switchable mid-session

**Per-skill context packaging**

- FULL-CHAIN: translates raw input into vois-patterns decision framing, passes path ID to vois-components, packages components + platform for vois-tokens
- PICK-UP: validates path ID with designer before passing to vois-components
- COMPONENT-ONLY: frames decision as job-to-be-done before loading vois-components

**Inline righter invocation**

- Single copy item: pause current skill, run righter, resume
- Batched copy (3+ items): collect all items, run righter once with full list — no per-item invocations
- Copy items tracked in session state so none are dropped across invocations

**Design-rationale: two opt-in points**

- Offered after vois-patterns (structural choice check) and after vois-components (component audit)
- Neither is on the default path; both require explicit designer confirmation
- No double-offering: if declined at point 1, not re-offered at point 2

**Gap surfacing**

- Any `report_pattern_gap` call from vois-patterns or vois-components surfaces immediately — never absorbed silently
- Three options presented to designer: use closest match, stop and design new pattern, or continue without match
- Gap and designer choice recorded in session state and chain completion block

**Abandonment and recovery**

- After one unanswered handoff prompt in gated mode, router stops and surfaces the session state as a recovery artifact
- Paste session state + "resume" in a new session to continue from the last completed step

**Chain completion block**

- Consolidated record: work type, platform, decisions per skill, copy produced, rationale status, gaps flagged, design-rationale findings, implementation reference

---

**Last updated:** 2026-06-13  
**Current version:** 1.1.0
