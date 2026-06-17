---
name: vois-loop
version: 1.3.0
author: Personify Labs
description: >
  Iterative design build loop for the Vois design system. Wraps design-ask,
  vois-router, and the full skill chain (vois-patterns, vois-components,
  vois-tokens, righter, design-rationale) in a loop that detects
  conflicts between skills and routes back upstream when something doesn't
  resolve cleanly. Includes an inline validation pass (no external skill
  required) that checks implementation correctness before design-rationale
  closes the loop. Use this as the single entry point for any feature build
  that starts from a ticket, brief, or raw description. Trigger when someone
  says "build this", pastes a ticket, or asks to run the full design loop.
license: CC-BY 4.0
---

# Vois Loop

A loop orchestrator that runs the full Vois skill chain iteratively. Unlike
vois-router which executes a linear chain, this skill enables skills to push
back on each other and route upstream when conflicts arise.

The loop encodes design iteration as a process, not a one-shot answer.

-----

## The loop at a glance

```
design-ask
    ↓
vois-router (classifies + sequences)
    ↓
vois-patterns → vois-components → vois-tokens
      ↑___________________loop back_________________|
                                                    ↓
                                              righter (inline throughout)
                                                    ↓
                                        validate (inline — see Step 4)
                                                    ↓
                                          design-rationale
```

**Where righter lives:** righter is not a sequential step. It runs inline
throughout vois-tokens — whenever labels, errors, button copy, helper
text, or any UI string is encountered. It does not run after vois-tokens.
It runs during it.

**Where validate lives:** validate is not an external skill. It is a structured
pass defined in this skill (Step 4) that runs after vois-tokens completes.
No external skill is needed or called.

Max iterations: 3. If unresolved after 3 passes, surface the conflict to the
designer rather than continuing to spin.

-----

## Loop state

The loop maintains a state block that persists across all iterations. Print it
at every handoff. Never let it go stale.

```
━━ Loop State ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration:     [1 of 3 max]
Mode:          [gated | fast]
Platform:      [web | ios | android]

Pre-flight:
  ✓ design-ask       verdict: [Ready / Caution / Not ready]
  ✓ vois-router      route: [FULL-CHAIN | PICK-UP | etc.]

Chain:
  ✓ vois-patterns    PATH-[X] — [container type]
  ✓ vois-components  [components selected]
  ● vois-tokens  in progress
    ↳ righter        [N copy items queued | inline as needed]
  ○ validate   pending
  ○ design-rationale pending

Conflicts:
  [none | description of active conflicts with iteration count]

Loop-back triggers:
  [none | what caused the upstream re-route and from which skill]

Designer inputs:
  [none | question asked → answer given, at which step]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Legend: ✓ complete · ● in progress · ○ pending · ✕ skipped · ↺ re-running

Note righter is nested under vois-tokens in the state block — it's a
subprocess, not a peer step.

-----

## Step 1: Pre-flight with design-ask

Before routing anything, run design-ask on the raw input. This unpacks the
ticket or brief into design-relevant framing.

design-ask produces a **readiness verdict**. Use it as follows:

|Verdict           |Action                                               |
|------------------|-----------------------------------------------------|
|Ready to start    |Proceed to routing                                   |
|Start with caution|Proceed, but flag the open questions in loop state   |
|Not ready         |Stop. Surface the gaps to the designer. Do not route.|

If verdict is "Not ready", output:

> "design-ask flagged too many unknowns to route safely. Here's what's missing:
> [gaps]. Resolve these before starting the loop."

If verdict is "Start with caution", carry the open questions into loop state
under "Conflicts" and surface them at the first handoff.

-----

## Step 2: Route with vois-router

Pass the design-ask output (not the raw ticket) to vois-router. The router
now has a clean, framed input instead of a raw requirement.

What carries forward from design-ask into vois-router:

- The real ask (stripped of implementation language)
- Type of design work (which affects which chain paths are relevant)
- Known constraints
- Any prescription alerts (these become conflict candidates)
- Platform (if inferable)

The router classifies work type and sequences the chain as normal. Its output
is the planned route, which the loop uses to manage iteration order.

In gated mode: show the route and wait for confirmation before entering the chain.
In fast mode: display and proceed immediately.

-----

## Step 3: Run the chain

Execute the chain in order:

```
vois-patterns → vois-components → vois-tokens (with righter inline)
```

### vois-patterns

Determines container type and structural decisions. Calls
`record_pattern_decision` with path ID and confidence. If confidence is below
0.6, calls `report_pattern_gap` instead. The loop surfaces gap reports
immediately — never absorbs them silently.

### vois-components

Selects specific components within the chosen container. Resolves ambiguous
pairs (Dialog vs Drawer, Toast vs Banner, Select vs Combobox). Calls
`record_component_choice` after each selection.

### vois-tokens

Implements the structure and components in code using shadcn/ui, Tailwind v4,
and Motion. Applies spacing tokens, type scale, color tokens, animation rules,
accessibility requirements, and CSS patterns as defined in the design system.

**righter runs inline here.** Every piece of UI text — button labels, form
labels, error messages, helper text, empty states, toast copy, tooltip content,
confirmation dialogs — is written during this step by invoking righter. Do not
defer copy to after implementation. Copy affects component sizing, layout, and
interaction patterns. It must be resolved as the implementation is built.

vois-tokens closes by calling `vois_record_rule_usage` with the rule
IDs applied. If any rule was violated or found ambiguous, flag it.

-----

## Conflict detection

A conflict is any condition where the output of one skill cannot be cleanly
accepted by the next skill without revisiting an upstream decision.

### What counts as a conflict

**vois-components → vois-tokens conflict:**
The selected component does not exist in the shadcn/ui manifest or cannot
be implemented against the Vois token set without inventing values. Loop back
to vois-components with the specific gap.

**righter (inline) → vois-tokens conflict:**
The correct copy for a UI element is too long, too conditional, or requires
a link — and the component the copy needs to live in can't support it. The
component choice is wrong. Loop back to vois-components.

Example: righter's correct error message is 35 words and needs a CTA link.
The component selected for this was an inline helper text span. The right
component is a Banner or Alert. Loop back to vois-components.

**vois-tokens → vois-components conflict:**
During implementation, the token or layout rules for the chosen container type
make a component selection technically incompatible. Example: a component that
requires a fixed-height container was selected for a PATH-C form that uses
fluid layout. Loop back to vois-components.

**vois-patterns → vois-components conflict:**
The container path ID and the selected component are incompatible at a
structural level. A full-page component was selected for a PATH-D (Dialog)
context. Loop back to vois-components, not vois-patterns, unless the pattern
itself was wrong.

**Any skill → design-ask conflict:**
A downstream skill surfaces ambiguity that traces back to the original
requirement — the implementation is unresolvable because the ticket didn't
define the user need clearly enough. Loop back to design-ask, not vois-router.
This is rare but important to catch.

**vois-tokens/vois-components → design-rationale conflict:**
A token or component choice contradicts a design principle the designer has
already stated or that design-rationale previously confirmed for this
project (e.g. "we never use modals for destructive confirmation" but the
chain selected an AlertDialog). Loop back to design-rationale to resolve
the principle before continuing — don't silently override it in
vois-tokens or vois-components.

### What does not count as a conflict

- Copy that needs iteration (righter handles this internally)
- A component with multiple valid options (vois-components resolves this)
- A pattern gap (handled by vois-router gap protocol, not the loop)
- A validate WARN (noted, not looped)

-----

## Pause-and-ask protocol

Pause-and-ask fires when the loop hits a fork that only the designer can
resolve. It is distinct from a loop-back: a loop-back means an upstream skill
made a decision that needs to change; a pause-and-ask means no skill owns the
answer and continuing without it would produce the wrong output or waste an
iteration on a guess.

### When to pause-and-ask

**design-ask returns "Start with caution" and an open question affects routing**
If an unresolved question would change which PATH vois-patterns selects, pause
before routing. Don't absorb the uncertainty and guess.

**vois-patterns has two equally valid paths**
If the container type decision lands at near-equal confidence between two paths
(both above 0.6, within 0.1 of each other), pause. Present both options with
one sentence on the trade-off. Don't pick arbitrarily.

**vois-components hits a context-dependent fork**
When the choice between two components depends on something about the product
context not present in the brief — not a generic pairing question righter can
resolve, but something like whether an action is terminal or recoverable — pause
and ask. vois-components resolves generic ambiguity. It can't resolve product
intent.

**righter (inline) needs brand or audience context**
If the correct copy depends on a tone, voice, or audience specificity that isn't
defined anywhere in the brief or session — and getting it wrong would require
a copy rewrite later — pause and ask. Don't default to generic product voice.

**validate surfaces a FAIL with two valid fixes that have different trade-offs**
If a validation failure can be resolved in more than one way and the choice
between them is a product or UX decision (not a design system rule), pause and
ask before looping back.

### What does not trigger pause-and-ask

- Generic component ambiguity (Dialog vs Drawer for a standard confirmation)
  — vois-components resolves this
- Copy iteration (righter handles internally)
- Conflicts where an upstream skill clearly owns the fix — use loop-back instead
- Anything the designer already answered earlier in the session

### Output format

**Binary question (yes/no)**

```
━━ Pause ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Blocked at: [skill name]
Context: [one sentence — what the loop is trying to resolve]

Question: [specific question]

  Y — [what yes means and what the loop does next]
  N — [what no means and what the loop does next]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Multiple choice (2–3 options)**

```
━━ Pause ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Blocked at: [skill name]
Context: [one sentence — what the loop is trying to resolve]

[Question in plain language]

  A — [option] — [one sentence: what this means for the build]
  B — [option] — [one sentence: what this means for the build]
  C — [option] — [one sentence: what this means for the build, if needed]

[Only include C if there are genuinely three distinct paths. Never pad to three.]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Rules for pause-and-ask output

- Maximum one question per pause. If multiple things are unknown, surface the
  one that unblocks the most.
- Options must be specific enough that the designer can answer without needing
  to ask a follow-up question.
- Prefer constrained options (yes/no or A/B/C). Use open-ended questions
  only as a last resort when the answer space is genuinely unpredictable and
  constrained options would misrepresent the choices available.
- After the designer responds, resume from exactly where the loop paused.
  Don't re-run steps that weren't affected by the question.
- Record the pause and the designer's answer in loop state under "Designer
  inputs" so it's visible in the completion block.
- In fast mode: pause-and-ask still fires. Fast mode skips handoff confirmations,
  not designer input on genuine decision points.

-----

## Loop-back protocol

When a conflict is detected:

1. **Name it.** Say exactly what skill flagged the conflict and what the
   conflict is.
1. **Identify the upstream target.** Which skill owns the decision that needs
   to change?
1. **Package what changed.** Tell the upstream skill specifically what new
   information it's getting, so it doesn't re-run from scratch.
1. **Increment the iteration counter.** Update loop state.
1. **Re-run from the upstream target only.** Don't re-run skills that are
   unaffected by the conflict.

Output format for a loop-back:

```
━━ Loop Back ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Conflict detected at: [skill name]
Conflict: [one sentence — what doesn't work and why]

Routing back to: [upstream skill]
New context: [what changed that the upstream skill needs to know]

Iteration: [N of 3]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

In gated mode: show the loop-back block and wait for confirmation before
re-running. The designer may want to resolve the conflict manually.

In fast mode: loop back immediately and note it in the final summary.

-----

## Max iterations

If iteration 3 completes and a conflict is still unresolved:

> "Loop hit max iterations (3) without resolving [conflict description].
> Here's where things stand:
> 
> - [current component or implementation choice and why it's in conflict]
> - [what the downstream skill needs that isn't possible with this choice]
> - [two options: A — accept the trade-off and document it, B — take it upstream]
> 
> How do you want to proceed?"

Do not attempt a 4th iteration. Surface it and let the designer decide.

-----

## Step 4: Validate pass

After vois-tokens completes and no active conflicts remain, run
validate.

The validate pass checks the implementation output against the vois-tokens
pre-submit checklist. It uses the design system's own rule IDs so violations
trace back to their source rule.

**Check categories:**

**Semantic HTML**

- Interactive elements using correct HTML (button, a, input — not div/span) `[DS-A11Y-005]`
- Heading levels sequential, none skipped `[DS-TYPOGRAPHY-002]`
- Lists using ul/ol/li not stacked divs `[DS-A11Y-011]`
- fieldset + legend used for radio/checkbox groups `[DS-A11Y-016]`

**Accessibility**

- All interactive elements have :focus-visible styles `[DS-A11Y-002]`
- No outline: none without a replacement `[DS-A11Y-003]`
- Touch targets minimum 44x44px `[DS-A11Y-001]`
- Images have alt text `[DS-A11Y-010]`
- Modals use inert on background content `[DS-MODAL-001]`
- Error messages linked to inputs via aria-describedby
- Form inputs associated with labels via htmlFor / id pairing

**Token alignment**

- No hardcoded hex values `[DS-COLOR-001]`
- No raw Tailwind palette classes where tokens exist `[DS-COLOR-002]`
- All spacing divisible by 4 or 8, no arbitrary values `[DS-SPACING-001]` `[DS-SPACING-003]`
- Spacing between siblings uses gap on parent, not margin-bottom on child `[DS-LAYOUT-COMP-001]`

**React**

- List renders have stable key props (not array index)
- Loading, error, and empty states all handled
- No derived state stored in useState

**Animation**

- UI animations under 300ms `[DS-ANIMATION-001]`
- prefers-reduced-motion handled `[DS-ANIMATION-004]`
- No transition: all `[DS-TAILWIND-005]`
- Hover effects guarded on touch devices `[DS-ANIMATION-007]`

**Component fidelity**

- Component choices match what vois-components selected
- Variants used semantically, not defaulted `[DS-COMPONENT-006]`
- cva used for variant logic `[DS-COMPONENT-002]`

The validate pass outputs one of three verdicts per check category:

- **PASS** — no issues
- **WARN** — issue present but non-blocking (note it, continue)
- **FAIL** — issue that should be fixed before handoff

If any FAIL verdicts: loop back to the relevant skill with the specific
failures as the new context. This counts as a loop-back iteration.

If only WARN verdicts: note them in loop state, proceed to design-rationale,
include them in the chain completion block.

-----

## Step 5: design-rationale

design-rationale closes the loop. It is offered at two opt-in points per
vois-router rules — after vois-patterns and after vois-components. Neither is
on the default path.

One addition in the loop context: if any loop-backs occurred, design-rationale
should briefly document what changed across iterations and why. Decisions that
shifted during the loop are worth recording, not hiding.

-----

## Chain completion block

```
━━ Loop Complete ━━━━━━━━━━━━━━━━━━━━━━━━━━
Work type:    [classification]
Platform:     [platform]
Iterations:   [N]

Pre-flight:
  design-ask verdict: [Ready / Caution]
  Open questions carried in: [none | list]

Decisions:
  Structure:    [PATH-X] — [container type]
  Components:   [list with one-line reasoning each]
  Implementation: [summary of vois-tokens output]
  Copy:         [list of copy items produced via righter]
  Rationale:    [ran / skipped at offer point 1 / skipped at offer point 2]

Loop-backs:
  [none | description of each — what triggered it, what upstream skill
  was re-run, what changed as a result]

Designer inputs:
  [none | each pause-and-ask question and the answer given]

Validation:
  PASS:  [categories]
  WARN:  [list if any, with rule IDs]
  FAIL:  [none — loop resolved all failures before this point]

Rule usage:
  [vois-tokens rule IDs applied, per vois_record_rule_usage output]

Gaps flagged:
  [none | any unresolved pattern or component gaps]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

-----

## Modes

**Gated (default)**
Pauses at each handoff and each loop-back. The designer confirms before
proceeding. Use when the brief is complex or unfamiliar.

**Fast**
Runs the full chain and any loop-backs without stopping. Presents the loop
completion block at the end. Opt in with "fast mode", "just run it", or "no
confirmations."

Switch at any point: "switch to fast mode" / "switch to gated mode."

-----

## What this skill never does

- Runs the chain without going through design-ask first
- Routes before design-ask returns "Ready" or "Start with caution"
- Runs righter as a sequential step after vois-tokens — it runs inline during it
- Defers copy until after implementation is built
- Loops back without naming the conflict explicitly
- Runs more than 3 iterations without surfacing to the designer
- Treats a validate WARN as a FAIL or a FAIL as a WARN
- Skips the validate pass because the chain "looks clean"
- Pauses-and-asks when a skill can resolve the fork itself
- Asks open-ended questions during a pause unless constrained options would misrepresent the choices
- Asks more than one question per pause
- Absorbs a loop-back silently in fast mode — always noted in completion block
- Offers design-rationale twice if the designer already declined once
- Re-runs skills that weren't affected by a conflict
- Invents token values or component variants that don't exist in the design system

-----

## Quick reference

|Input                             |What happens                                    |
|----------------------------------|------------------------------------------------|
|Raw ticket or brief               |design-ask → router → full chain                |
|Ticket + "fast mode"              |Same, no confirmations                          |
|design-ask returns "Not ready"    |Stop, surface gaps, wait                        |
|Conflict at righter (inline)      |Loop back to vois-components                    |
|Conflict at vois-tokens    |Loop back to vois-components or vois-patterns   |
|Conflict traces to bad requirement|Loop back to design-ask                         |
|validate FAIL                     |Loop back to relevant skill, counts as iteration|
|3 iterations, still conflicted    |Surface to designer, stop                       |
|Loop complete                     |Chain completion block, resume normal session   |
