# Questionnaire UI `[DS-A11Y]` `[DS-RESPONSIVE]`

Shared rules for respondent-facing questionnaires. The decision tree is PATH-H in vois-patterns. Dimensions are in `data/tokens.questionnaire.json`.

## Required and errors `[DS-A11Y-024]`

- Write "Required" or "Optional" on every question.
- Set `aria-required` on required questions.
- After a failed check: `aria-invalid`, a specific error under the question, focus on the first error.

## Focus moves with the question `[DS-A11Y-025]`

When one question replaces another, focus goes to the new title and a screen reader announces it. Typeform's documented failure is leaving keyboard and screen reader users behind on the old question.

## Motion `[DS-A11Y-026]`

Honour `prefers-reduced-motion`. Add a visible Reduce motion control for people who have not set the OS option. Between questions use no slide or scale. An instant swap or a fade of 150ms or less is fine. `DS-ANIMATION-004` covers the base rule.

## Sticky bar and keyboard `[DS-RESPONSIVE-011]`

```css
.survey-bar {
  position: sticky;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
}
```

Put the bar inside the scrolling container. A `position: fixed` bar is covered by the on-screen keyboard on iOS and on Chrome for Android 108 and up. Put errors above the input so the keyboard cannot hide them. If the bar must be fixed, track `window.visualViewport` into a `--kb` variable and scroll the focused field into view with its label and error.

`interactive-widget=resizes-content` works only in Chromium. Do not rely on it alone.

## Small screens `[DS-RESPONSIVE-012]`

Below 360px:
- A 5-point Likert goes vertical if a point would be under 44px.
- Rank keeps the drag handle and the arrow buttons at 44px. The label wraps.
- Padding and gaps shrink. Type does not.
- No horizontal scroll at 320px.

## Sizes

| Part | Value |
|---|---|
| Tap target | 44px normal, 48px comfortable, 24px floor |
| Gap between targets | 8px, 12px between primary and destructive |
| Option row | 56px at every width `[DS-RESPONSIVE-013]` |
| Likert point | 48px |
| Rank row | 64px, handle 44px |
| Text input | 52 to 56px, 16px font |
| Primary button | 52px, full width |
| Progress bar | 4px |
| Content width | 640px max, centred from 768px |

The anchored numbers (44, 48, 24, 16) come from Apple, Material, and WCAG. The rest are proposals, except the option row.

## Option rows are an exception to density `[DS-RESPONSIVE-013]`

Option rows are 56px in every questionnaire, at every width. We decided this on 2026-11-14. It overrides the compact row height inside PATH-H only. Outside a questionnaire, density specs apply as before. Do not use the other proposed sizes (52px input, 52px button, 64px rank row) in dense agent tools.

## Poll and quiz results `[DS-A11Y-027]` `[DS-A11Y-028]`

Rules for the results view are in PATH-H-6. Two accessibility rules apply:

- Colour is never the only signal. The correct option has a check icon and the words "Correct answer". The respondent's pick says "Your answer". Each row reads as text: label, percent, count. Bars are `aria-hidden`. The fill needs 3:1 contrast against its track.
- When results appear, focus moves to the results heading and one polite message announces the outcome. Do not announce each bar. Do not announce live updates.
