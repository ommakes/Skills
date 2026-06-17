# Vois Loop

Top-level iterative orchestrator for the Vois design system skill chain. Runs the full chain in a managed loop with conflict detection and upstream re-routing.

---

## What This Is

vois-loop wraps design-ask, vois-router, and the full design system skill chain (vois-patterns → vois-components → vois-tokens → validate → design-rationale) in a loop that can route back upstream when skills conflict with each other.

Unlike vois-router, which executes a linear single-pass chain, vois-loop treats iteration as part of the process. If a component choice breaks during implementation, or righter's correct copy doesn't fit the selected component, the loop names the conflict and re-routes to the right upstream skill — without losing prior decisions.

## When to Use

Use vois-loop when:

- Starting from a ticket, brief, or raw feature description
- You want conflict resolution handled automatically — not manually
- The brief is complex enough that component or copy decisions might need to change during implementation
- You want a complete audit trail of decisions and iteration history at the end

**Trigger phrases:** "build this", "run the design loop", "go through the full chain"

## When Not to Use

- **Single component question** → use vois-router (COMPONENT-ONLY) or vois-components directly
- **Copy review only** → use righter directly
- **Explaining a design decision** → use design-rationale directly
- **You already have a path ID and just need components + implementation** → use vois-router (PICK-UP)

## How to Use

**Gated mode (default):** The loop pauses at each handoff and each loop-back. You confirm before it proceeds. Use this when the brief is complex or unfamiliar.

**Fast mode:** The loop runs the full chain and any re-routes without stopping. You get the chain completion block at the end. Opt in with: "fast mode", "just run it", "no confirmations".

Switch at any point: "switch to fast mode" / "switch to gated mode".

**Max iterations:** 3. If a conflict isn't resolved after three passes, the loop surfaces it to you with two options — accept the trade-off or escalate — and stops.

## Relationship to Other Skills

| Skill | Role in the loop |
|---|---|
| **design-ask** | Pre-flight: unpacks the ticket or brief before routing. Produces a readiness verdict. |
| **vois-router** | Called internally to classify the work type and sequence the chain. |
| **vois-patterns** | Step 1 of the chain: determines container type and path ID. |
| **vois-components** | Step 2: selects specific components for the container. Loop-backs often land here. |
| **vois-tokens** | Step 3: implements in code using Vois tokens, spacing, and accessibility rules. |
| **righter** | Runs inline during vois-tokens — not as a sequential step. |
| **design-rationale** | Closes the loop. Opt-in at two points. Documents iteration history if loop-backs occurred. |

## vois-loop vs vois-router

| | vois-loop | vois-router |
|---|---|---|
| **Iteration** | Yes — detects conflicts, routes back upstream | No — single pass through the chain |
| **Conflict handling** | Built-in loop-back protocol with named conflict types | Not handled — run vois-loop if you need it |
| **Pre-flight** | Runs design-ask before routing | Routes directly from input |
| **Validate pass** | Inline after vois-tokens | Not included |
| **Best for** | Feature builds from tickets or briefs | Direct routing when work type is clear |

Both support gated and fast modes. Both produce a chain completion block.

---

## Version

**v1.2.0** — Initial release. See `CHANGELOG.md` for details.

---

**Last updated:** 2026-06-13  
**Maintained by:** Om Suthar / Personify Labs  
**Repository:** [github.com/ommakes/Skills](https://github.com/ommakes/Skills)
