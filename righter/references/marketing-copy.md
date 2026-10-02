# Marketing copy

Read this when writing or reviewing copy for a marketing site: hero, section heads, feature cards, buttons, FAQ, meta descriptions. Product UI keeps using the main principles and `data/components.json`.

Layout, type scale, and spacing for these pages live in `vois-patterns` (`references/marketing-pages.md`) and `vois-tokens` (`references/marketing-type-and-spacing.md`). This file covers words only. `gtm-positioning` decides what to say. This file decides how much of it fits.

## Word limits

Limits per slot are in `data/marketing-limits.json`. Don't count by hand. Run:

```
node scripts/check-slots.mjs hero-h1 "Martial arts for all ages in Ashburn"
node scripts/check-slots.mjs --file copy.json      # {"hero-h1": "...", "hero-sub": "..."}
node scripts/check-slots.mjs --list
```

| Slot | Max words | Notes |
|---|---|---|
| Hero h1 | 7 | Say what it is and where. No adjectives. |
| Hero sub | 12 | One idea. One acronym max. |
| Section head | 5 | Name the job, not the mood. |
| Card title | 4 | Use the thing's real name. |
| Card description | 20 | Two sentences max. |
| Button or link | 2 to 4 | Verb first. |
| Eyebrow or label | 2 | Only if it carries information. |
| Form helper | 12 | |

The script fails on the limit, on em dashes, and on puffery. It warns on weakeners and on crowded acronyms.

**Limits beat rhetorical devices.** Principle `rhetorical-devices` still applies on marketing surfaces, but a device has to fit inside the slot's limit. If it doesn't fit, cut the device, not the limit.

## Rules

Where a rule already exists in `SKILL.md`, cite that id and don't restate it.

| Id | Rule | Related |
|---|---|---|
| `mkt-one-idea-per-sentence` | If "and" is doing the work of a period, split the sentence. | `simple-sentences` |
| `mkt-concrete-over-adjective` | Cut "premier," "unique," "world-class," "passionate," "leading," "best-in-class." Use a number, a place, or a fact. | |
| `mkt-say-it-once` | A fact (rating, years open, price) appears in one place per page. Repeat it only in the footer. | |
| `mkt-one-name-per-thing` | "Jiu Jitsu" or "Jiu-Jitsu," never both. One label per action across the whole site. | `consistent-terminology` |
| `mkt-one-acronym` | One acronym per sentence, defined or dropped. | `avoid-jargon` |
| `mkt-buttons-say-what-happens` | "Book a free class," not "Get started" or "Submit." | `accessible-copy` |
| `mkt-no-triple-data` | Show a start time and a duration, not a range plus a start time plus a duration. | |
| `mkt-no-weakeners` | Drop "just," "simply," "really," "we strive to." | `eliminate-weakeners` |
| `mkt-lead-with-the-goal` | Lead with the reader's goal, not the organization's history. | `user-goal-framing` |
| `mkt-meta-description` | A sentence about the page, not a tagline. | |

Sentence case everywhere. Pick one heading case and keep it.

## Before and after

From a real mockup (a martial arts gym). Counts are from `check-slots.mjs`.

| Slot | Before | After |
|---|---|---|
| H1 | Ashburn's premier martial arts facility for all ages (8 words) | Martial arts for all ages in Ashburn (7) |
| Sub | Kids and adult martial arts in Ashburn, VA. Brazilian Jiu Jitsu (BJJ), Mixed Martial Arts (MMA), and Krav Maga for every level and every age. Join your first class for free (31) | Jiu Jitsu and Krav MMA for kids and adults. First class free. (12) |
| Card | Our in-house system built from Krav Maga self-defense plus MMA training: Jiu Jitsu, Muay Thai, boxing, and takedowns. Learn to handle a real attacker and hold your own against a trained fighter. (32) | Our in-house system: Krav Maga self-defense plus Muay Thai, boxing, takedowns, and jiu jitsu. (14) |
| Contact head | We'd Love to Hear From You (6) | Ask us anything (3) |
| CTAs | Start free / Book a free class / Start for Free | Book a free class |

Notice the "after" card writes "jiu jitsu" in lowercase while the sub writes "Jiu Jitsu." That breaks `mkt-one-name-per-thing`. Pick one.

## Copy lint

Run before copy ships. Layout items are in `vois-patterns` and `vois-tokens`.

- [ ] Every slot is within its word limit (`scripts/check-slots.mjs`).
- [ ] No puffery (premier, unique, world-class, best-in-class, passionate).
- [ ] Heading case is consistent.
- [ ] Each action has one label sitewide.
- [ ] No fact appears more than once outside the footer.
- [ ] Stats don't contradict each other ("Est. 2021" next to "12+ years").
- [ ] Hours and schedule agree.
- [ ] Every link label makes sense out of context (`accessible-copy`).
- [ ] No em dashes (`no-em-dashes`).
