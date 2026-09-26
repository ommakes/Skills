# Changelog

All notable changes to the Onboarding Flow skill are documented here.

---

## [1.2.0] — 2026-09-26

### Added

- **`strength` field on every rule in `data/onboarding-rules.json`** — `MUST` (progress
  honesty, always-present exit, route-to-other-skills, never gate real functionality behind a
  checklist, a genuine non-paying paywall path, undisguised consent buttons) or `SHOULD`
  (everything else — strong defaults with legitimate exceptions). `scripts/check-rule-sync.mjs`
  now fails if a rule is missing a valid strength.
- **Activation modeling in Mode 2.** Before sequencing any screens, the skill now requires
  naming the product's activation event and what's strictly necessary to reach it, and cutting
  any step that doesn't move the user toward it. Mode 1 applies the same lens when auditing.
  `SKILL.md`'s Checklist Before Handing Off gained a matching item.
- **Evidence-vs-baseline distinction in Mode 2.** The Mobbin-pull step now explicitly treats a
  pulled example as evidence of current practice, not proof a pattern is correct — it's weighed
  against `data/onboarding-rules.json`'s durable rules, not treated as an override.
- **Hybrid/prosumer addendum to the decision tree.** A short paragraph for single-surface tools
  that blend both shapes (Notion/Figma/Slack-style), defaulting to the SaaS shape with at most
  one borrowed personalization screen — without replacing the fast SaaS-vs-consumer binary for
  the common case.
- **Evidence-grounded violations in the Review format.** Each flagged rule in Mode 1 output now
  requires an Observed/Expected pair, so violations point at the actual input instead of being
  asserted without support.
- **`evals/cases.json`** — a 7-case regression corpus (good/bad flows across both shapes) with
  the rule ids a correct review should flag, and — for the exact false positive fixed in
  1.1.1 — the ids it should explicitly *not* flag. Manual regression corpus, same convention as
  `righter/evals/cases.json`; not an automated test suite, since whether a flow violates a rule
  is a judgment call, not something a script can verify.

### Changed

- **Version bump:** `1.1.1` → `1.2.0`

---

## [1.1.1] — 2026-09-26

### Fixed

- **`UNIV-001` contradicted `SAAS-003` and `CONSUMER-007`.** `UNIV-001` banned any second
  equal-weight button on a screen, but `SAAS-003`'s checklist pattern (one button per item, many
  items per screen) and `CONSUMER-007`'s consent pattern (explicitly equal-weight buttons) both
  violated it as written. Scoped `UNIV-001` to a single-decision screen and carved out both as
  exceptions, since neither is competing actions for one decision.
- **`UNIV-004` and `CONSUMER-004` disagreed on personalization-payoff timing.** One required the
  payoff on "the next screen," the other allowed "one or two screens." Aligned both to the same
  tolerance.
- **`scripts/check-rule-sync.mjs` broke on Windows.** It derived each file's relative path with
  `file.replace(skillRoot + "/", "")`, which never matches when `path.join` emits backslashes —
  the script would report a false mismatch even when the rules were in sync. Switched to
  `path.relative()`, normalized to forward slashes.

### Changed

- **Version bump:** `1.1.0` → `1.1.1`

---

## [1.1.0] — 2026-09-26

Initial tracked version. Two modes (evaluate an existing flow, generate a new one), an explicit
SaaS-vs-consumer/mobile decision tree, 18 rules (5 universal, 6 SaaS, 7 consumer) canonicalized
in `data/onboarding-rules.json` and restated for readability with worked real-app examples in
`references/saas-onboarding.md` and `references/consumer-onboarding.md`, and
`scripts/check-rule-sync.mjs` to keep the two from silently drifting.
