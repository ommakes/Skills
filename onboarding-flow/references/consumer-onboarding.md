# Consumer / Mobile Onboarding — `[SHAPE-CONSUMER]`

Grounded in real onboarding flows from NYTimes, Apple News, Nibble, Rocket Money, MacroFactor,
Cleo AI, Brilliant, ABY Journal, Tonal, Tubi, and IMDb.

## The core move: it's a linear sequence, and that's fine

Unlike SaaS, consumer mobile onboarding is meant to be a full-screen, one-thing-at-a-time
sequence the user moves through before reaching the real app. This works *because* each screen
is short, has one question or one message, and visibly moves a progress bar. The failure mode
here isn't "too linear" — it's a sequence that asks for personalization and never uses it, or
a paywall that shows up with no context.

## The typical screen sequence

Not every app uses every screen, but this is the order real flows follow:

1. **Splash / logo** — brief, sometimes just a loading transition (Tubi, Apple News). Skippable
   in your design thinking — it's brand, not a decision point.
2. **Value proposition screen(s)** — one clear statement of what the app does and for whom.
   Apple News: "Welcome to Apple News — The best stories from the sources you love, selected
   just for you." One headline, one subhead, nothing else competing for attention.
3. **Personalization quiz** — see full pattern below. This is the highest-leverage screen type;
   most of what follows is standard, this is where you differentiate.
4. **Permission priming** — a screen *explaining the value* of a permission before the native OS
   prompt fires. Nibble: "Remember 3x more new information with visual learning* — Turn on push
   notifications to level up faster," with a fake preview of the notification above it. IMDb:
   explains exactly why it wants the ad ID and reassures it's changeable later. Never let the
   native OS permission dialog be the user's first exposure to *why* you're asking.
   `id: CONSUMER-005` (SHOULD)
5. **Account creation** — usually the shortest screen, often just email/social login.
6. **Paywall / subscribe** — see pattern below. Can appear before or after the personalization
   payoff depending on how much value has been demonstrated yet.
7. **Confirmation / celebration** — a single moment of "you're set," logo-forward, one CTA
   forward. MasterClass: "You're in." with a one-sentence payoff statement and a single
   "Let's Get Started" button. Keep this screen to seconds, not a summary.
8. **Drop into home**, ideally already reflecting whatever was collected in step 3.

Consent/tracking screens (Tubi's "We and our 311 partners...") are legally required in many
jurisdictions and use plain, undisguised buttons: Accept All / No Thanks / Manage Preferences —
never trick the user into thinking there's only one option. `id: CONSUMER-007` (MUST)

## Personalization quiz pattern (the highest-leverage screen type)

Every quiz screen pulled for this skill shares the same bones:

- **One question per screen.** Never stack two questions on one screen. `id: CONSUMER-001` (SHOULD)
- **Progress shown as a thin bar at the top**, or an explicit step count ("Step 3 of 4",
  numbered dots "1 ● 2"). Rocket Money and MacroFactor use a thin filled bar; Cleo and Brilliant
  use it too, sometimes paired with a number. `id: CONSUMER-002` (SHOULD)
- **Back arrow top-left, X to close/skip top-right** (Rocket Money). Never remove the exit.
  `id: CONSUMER-003` (MUST)
- **Card-style single-select options with a radio indicator**, 3–6 options, each with a short
  label and sometimes a one-line description ("Based off your current savings and account
  balance" — Rocket Money's recommended option).
- **One option can be visually flagged as recommended or a smart default** (Rocket Money's
  "Recommended For You" section header + pre-selected radio; Tonal highlights one goal card in
  solid black against the other two in grey).
- **One full-width primary CTA at the bottom** ("Continue" / "Next"), sometimes disabled/muted
  until a selection is made (Brilliant shows "Continue" greyed out pre-selection).
- **Conversational framing beats form framing.** Cleo: "What are you saving for? This helps
  Cleo choose the best way for you to save." ABY Journal: "It's really great to meet you,
  Alex... What brings you here?" — the app is having a conversation, not administering a form.

## The personalization payoff — don't skip this `id: CONSUMER-004` (SHOULD)

The quiz is wasted effort if the next screens don't visibly use the answer. Real examples:
NYTimes shows a notification-preference *screen* keyed to interests right after account
creation, then a "Step 4 of 4" screen surfacing recommended stories. MasterClass shows
"8 classes for you — from 1 interest" directly after the interest-selection step, with the
count and the source of the recommendation stated explicitly. If your quiz answer doesn't
visibly reappear within one or two screens, cut the quiz question — it's just friction.

## Social proof, inserted deliberately

Nibble inserts a full-screen testimonial block ("People love Nibble" — two 5-star quotes) mid-
sequence, between the value/personalization screens and account creation — right where
hesitation is highest, not at the very start where it has no context yet.

## Paywall pattern

- **Placement varies by trust already earned.** NYTimes shows the paywall immediately after
  account creation (news product, value is self-evident). Nibble and MasterClass demonstrate
  personalized value first (quiz results, class recommendations), then present the paywall.
  Default to "demonstrate personalized value first" unless the product's value is instantly
  obvious without any setup.
- **Always offer a visible non-paying path**, even if de-emphasized: NYTimes pairs "Subscribe
  Now" (primary, filled) with "Continue without subscribing" (secondary, outlined) on the same
  screen — never force the choice to only "subscribe or leave the app." `id: CONSUMER-006` (MUST)
- **State the terms plainly near the CTA**: price, billing cadence, and cancellation terms
  visible on the same screen as the button, not hidden behind a link (NYTimes, MasterClass both
  do this above/below the primary CTA).

## What NOT to do

- Don't ask a personalization question you won't use in the next two screens.
- Don't let the OS permission dialog be a surprise — always prime it first.
- Don't disguise a consent/tracking screen's options as a single button with a small "manage"
  link — plain, equal-weight buttons are both more honest and hold up better under regulatory
  scrutiny.
- Don't skip the confirmation screen straight into a busy home screen — give the user one
  beat of "this worked" before flooding them with content.

## Copy patterns to hand to righter

- Value prop headline: benefit-first, no jargon ("The best stories from the sources you love,
  selected just for you," not "Personalized content aggregation powered by ML")
- Quiz questions: conversational, first person from the user's point of view ("What brings you
  here?", "What are you saving for?") rather than clinical ("Select your primary use case")
  — but confirm final tone/reading-level with righter, don't finalize wording here
- Permission priming: state the specific benefit, not just "we need this permission"

## Structure/styling handoff

Quiz screens are effectively a `[PATH-D]`-style quick-selection pattern per vois-patterns
(single decision, full-screen rather than modal on mobile) — read
`vois-patterns/references/dialogs-and-action-sheets.md` for the mobile full-screen vs. modal
threshold, then `vois-components` for the radio-card component, then `vois-tokens` for spacing
and the progress-bar treatment.
