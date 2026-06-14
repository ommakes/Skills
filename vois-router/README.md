# Vois Router

Chain orchestrator for the Vois design system skill chain. Single entry point for UI work when you know the work type and don't need iterative conflict resolution.

---

## What This Is

vois-router reads your input, classifies the work into one of six types, sequences the right skills in the right order, and carries context forward between them so each skill starts with what it needs — not a raw re-explanation of the problem.

It coordinates: vois-patterns, vois-components, vois-design-system, righter, and design-rationale.

Each of those skills works standalone. The router adds orchestration on top — nothing more.

## When to Use

Use vois-router when:

- You know the work type and want direct routing without the iterative loop
- You're resuming mid-chain with an existing path ID (PICK-UP)
- You have a single component question, copy request, or rationale to defend
- You want handoff control at each step (gated) or a single summary at the end (fast)

**Trigger phrases:** "build this screen", "what component should I use", "help me write this copy", "route me through the design system", or paste any ticket/brief/design question without specifying which skill to use.

## When Not to Use

- **Starting from a ticket with complex inter-skill decisions** → use vois-loop instead. It wraps this router and adds conflict detection and upstream re-routing across iterations.

## Work Types

| Classification | Signals | Entry point |
|---|---|---|
| **FULL-CHAIN** | Feature brief, screen description, ticket, "build this" | vois-patterns |
| **PICK-UP** | "I have path ID X", resuming a prior session | vois-components (after path ID validation) |
| **COMPONENT-ONLY** | "Modal or drawer?", "which component for X?" | vois-components |
| **COPY-ONLY** | "What should this say?", copy pasted for review | righter |
| **RATIONALE-ONLY** | "Help me defend this", "what principle applies?" | design-rationale |
| **AUDIT** | "Review this screen", existing design shared | design-rationale → vois-patterns (lightweight) |

## How to Use

**Gated mode (default):** Pauses at each handoff with a summary of what's being passed forward. Confirm to proceed. Use when the brief is complex or you want step-by-step control.

**Fast mode:** Runs the full chain without stopping. Chain completion block at the end. Opt in with: "just run it", "no confirmations", "fast mode".

Switch at any point: "switch to fast mode" / "switch to gated mode".

## Relationship to Other Skills

| Skill | Role |
|---|---|
| **vois-loop** | Higher-level orchestrator that wraps this router. Use vois-loop when starting from a ticket and you want iterative conflict resolution. |
| **vois-patterns** | Step 1 in FULL-CHAIN: structural container decisions and path ID. |
| **vois-components** | Step 2 in FULL-CHAIN, entry point for PICK-UP and COMPONENT-ONLY: specific component selection. |
| **vois-design-system** | Step 3 in FULL-CHAIN: token, spacing, and accessibility implementation. |
| **righter** | Invoked inline throughout — not a sequential step. Batched when 3+ copy items are queued at the same step. |
| **design-rationale** | Opt-in at two points in FULL-CHAIN (after patterns, after components). Primary skill for RATIONALE-ONLY and AUDIT. |

## vois-router vs vois-loop

| | vois-router | vois-loop |
|---|---|---|
| **Iteration** | No — single pass | Yes — detects conflicts, routes back upstream |
| **Conflict handling** | Not handled | Built-in loop-back protocol |
| **Pre-flight** | Routes directly | Runs design-ask before routing |
| **Validate pass** | Not included | Inline after vois-design-system |
| **Best for** | Clear work type, direct routing | Feature builds from tickets or briefs |

---

## Version

**v1.2.0** — Added mandatory righter copy gate (step 2b) before implementation. See `CHANGELOG.md` for details.

---

**Last updated:** 2026-06-13  
**Maintained by:** Om Suthar / Personify Labs  
**Repository:** [github.com/ommakes/Skills](https://github.com/ommakes/Skills)
