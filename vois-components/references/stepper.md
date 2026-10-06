# Stepper

The spec for the Stepper that `JOB-MULTISTEP-GUIDE` picks. Read it after the job tree has chosen Stepper over Wizard, Progress or a checklist.

**Basis:** judgment. Drafted on 2026-10-06 from the email-change flow (`PATH-SET-EMAIL-CHANGE`), one blind build of a three-step onboarding, and standard ordered-list accessibility practice. No Mobbin evidence was checked.

## What it is

A step indicator for a sequential, required flow of 2 to 5 steps, shown above the step content. It tells the user where they are and what is left. It is not a navigation system and not a status tracker.

A Stepper is not any of these:
- **A quantity control** (minus, number, plus), as on a pricing card. Call that a quantity control. See `[PATH-PRICE-S3]`.
- **Tabs.** Tabs let the user jump anywhere and don't gate anything. Steps are ordered and gated.
- **Progress.** Progress shows how far along a measurable operation is.
- **A Breadcrumb.** A Breadcrumb shows depth in a hierarchy, not order in a flow.

One step is not a flow. Don't show a Stepper for a single step.

## Where it comes from

shadcn/ui ships no Stepper. Build it once per workspace, as `@/components/ui/stepper`, and reuse it. Don't rebuild it per screen.

## Anatomy

```
<nav aria-label="Onboarding progress">
  <ol>
    <li aria-current="step">   marker + label (+ one-line description) + connector
```

- **Marker.** A circle holding the step number, or a check when the step is complete.
- **Label.** One or two words, a noun: "Account", "Team", "Review". Copy goes through `righter`.
- **Connector.** A line between markers. It fills when the step before it is complete.
- **Description.** Optional, one line, only on the current step.

## States

Every state carries more than color (`[DS-COLOR-003]`).

| State | Marker | Label | Screen reader |
|---|---|---|---|
| Upcoming | Number, neutral border | Muted | "Step 3, Review" |
| Current | Filled with the primary color, number | Foreground, medium weight | `aria-current="step"` |
| Complete | Check icon | Foreground | "Completed" in visually hidden text |
| Error | Alert icon in the `negative` role (`[DS-COLOR-008]`) | Foreground | "Needs attention" in visually hidden text |

## Behavior

- **Buttons navigate, the indicator doesn't.** Back and Next move between steps. The indicator is not in the tab order. Make a completed step clickable only when going back loses nothing the user typed.
- **Validate before Next.** Each step validates before the next one opens. Errors show on the step, and the step's marker shows the error state if the user has moved on.
- **Back keeps what the user typed.**
- **Move focus on a step change.** Focus goes to the new step's heading, so keyboard and screen reader users land at the start of the content.
- **The last step ends the flow.** Its primary button finishes it (Verify, Create, Finish) instead of Next. A closing "Done" step is optional. Don't add one just to have a result: it counts toward the 5-step limit.

## Layout

- Put it at the top of the form container, above the step content. Cap the container at `--width-form-max`.
- One Stepper per flow.
- Below the `sm` breakpoint, show only the current label and a short line such as "Step 2 of 3: Team". Keep the markers.
- Markers are 32px (`size-8`) so they sit on the 4px grid. Connectors are 1px lines in `--color-border`, filled with `--color-primary` when complete.

## Motion

Marker and connector color changes take 200ms or less (`[DS-ANIMATION-001]`) and respect `prefers-reduced-motion` (`[DS-ANIMATION-004]`).

## Accessibility

- A `nav` with an `aria-label` that names the flow.
- An ordered list (`ol`), so the count is announced.
- `aria-current="step"` on the current item.
- Complete and error states have visually hidden text. Color is never the only signal.
- Contrast follows `[DS-A11Y-004]`: the label on its background is normal text (4.5:1), and the marker border against the page is a UI component (3:1).
