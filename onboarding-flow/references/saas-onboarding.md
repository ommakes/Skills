# SaaS / Web Onboarding — `[SHAPE-SAAS]`

Grounded in real onboarding flows from Dropbox Dash, WRITER, Apollo, and Outseta.

## The core move: don't block the product

Every real SaaS onboarding pulled for this skill did the same thing: the user lands in the
actual product — real sidebar, real nav, real empty workspace — on signup. Onboarding is a
**checklist docked alongside the product**, not a wizard the user has to clear before they can
touch anything. Dropbox Dash drops the user straight into the chat interface with a "Get to
know Dash" card underneath it. Apollo shows the full CRM nav on day one with a "Next steps for
you" panel on the home screen. Outseta docks its 8-step setup guide in the left sidebar,
permanently accessible, not modal.

Don't build a full-screen wizard for a SaaS product unless the account genuinely can't function
until a step is done (e.g. connecting a payment processor before anything else works). Default
to the companion pattern. `id: SAAS-001`

## Anatomy of the checklist

1. **Placement**: sidebar-docked (Outseta), home-screen card (Apollo, WRITER), or embedded
   above the main content (Dropbox Dash). Pick based on how often the user will return to the
   home/dashboard screen in normal use — if rarely, dock it in the sidebar so it stays visible.
2. **Progress indicator**: fraction ("1/8 completed") plus a filled progress bar, always visible
   at the top of the checklist — never buried. `id: SAAS-002`
3. **Item structure**: each item is one line (title + one-sentence description) with a single
   CTA button per item ("Start", "Connect Stripe", "Create plans", "Send invites"). Numbered,
   but not always strictly sequential — Apollo lets users complete "Essentials" before
   "Outbound" even though outbound is listed first. `id: SAAS-003`
4. **Completed state**: checkmark + strikethrough or muted text, but the item **stays visible**
   in the list rather than disappearing. This is deliberate — visible progress motivates
   completion of what's left (Outseta, Apollo). `id: SAAS-004`
5. **One item "in progress" at a time expands inline**: WRITER's checklist shows the active
   step with its own mini progress bar (0% → 67% → 100%) directly in the card, so the user
   sees momentum without leaving the home screen.
6. **Optional deeper items appear below the checklist, not inside it**: Apollo surfaces
   "upcoming free live trainings" and a bookable 1:1 onboarding expert *below* the core
   checklist — progressive disclosure, not required steps. `id: SAAS-005`

## What NOT to do

- Don't gate the product's real functionality behind checklist completion. `id: SAAS-006`
- Don't use a percentage that includes steps the user can't act on yet (misleads on effort
  remaining).
- Don't remove completed items from view — it removes the visible momentum that motivates
  finishing the rest.
- Don't make every item mandatory-looking (bold black button) — vary button emphasis so the
  user can tell "quick win" items (checkbox-style) from "meaningfully de-risking" items
  (primary button, e.g. "Connect Stripe").

## Copy patterns to hand to righter

- Direct, first-name address on the home screen: "Welcome, Alex", "Let's get you going, Sam"
- Imperative, single-verb CTAs on checklist items: "Start", "Connect", "Create", "Invite",
  "Verify" — never "Let's start connecting your account"
- Item descriptions are one sentence, benefit-first: "Connect your Stripe account to start
  processing payments," not "You will need to connect Stripe."

## Structure/styling handoff

Read `vois-patterns/references/settings-pages.md` if the checklist lives inside a settings-like
sidebar, or treat the home-screen card as a standard container — read
`vois-patterns` first to pick the container type, then `vois-components` for the specific
checklist-item component (likely a list row with leading icon + trailing button, not a custom
one-off), then `vois-tokens` for spacing/type.
