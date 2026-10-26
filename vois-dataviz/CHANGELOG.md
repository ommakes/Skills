# Changelog

All notable changes to the `vois-dataviz` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-26

### Added

- **`verification` on every rule in `data/dataviz-rules.json`.** It says the same thing as `enforcement` in the vocabulary the other skills use: `auto` is `detector`, `spec` is `spec`, `judgment` is `judgment`. `scripts/check-verification.py` fails if the two disagree.

### Notes

- No rule text, severity, enforcement or detector behavior changed. `scripts/detect.mjs` now also exports `DETECTOR_IDS` (each detector's id and the rule it reports) so `check-verification.py` can import the list instead of parsing the source.
- **Version bump:** `1.1.2` → `1.2.0`

---

## [1.1.2] - 2026-10-21

### Fixed

- **The animate-flag example could cancel its own first animation, and a repeat pick never cleared it.** 1.1.1 cleared the flag one animation frame after the request settled unless `onAnimationStart` had fired. With cached data the chart can start later than that frame, so the first-mount animation was switched off before it began. And a pick on the range that was already selected changed neither `isFetching` nor `data`, so the clearing effect did not run, no animation ended, and the next poll animated. The example now closes the animation window on a timer, one animation plus one beat after the request settles, restarted by every pick. No chart event has to fire. A poll that lands inside that short window after a pick can still animate once, and the text says so. It is still not run against a live chart in this repo.

### Notes

- No rule, detector or data changed.
- **Version bump:** `1.1.1` → `1.1.2`

---

## [1.1.1] - 2026-10-10

### Fixed

- **The animate-flag example in `references/implementation.md` could animate on a poll.** The flag cleared only on `onAnimationEnd`. A picked range that returned the same points never ended an animation, so the flag stayed on and the next refetch animated. Under reduced motion `onAnimationEnd` never fires either. The example now clears the flag when the request settles with no animation started, and never turns it on under reduced motion. It also names where `motionDuration` comes from. It is not run against a live chart in this repo, and the text says so.
- **The `slow-chart-animation` message claimed more than the check does.** It said "never replay it on a refetch", but the detector reads `animationDuration` only. The message now says what it checks and lists the rest as things to do. The rules `DV-A11Y-008` and `DV-IMPL-005` are unchanged.

### Notes

- **Version bump:** `1.1.0` → `1.1.1`

---

## [1.1.0] - 2026-10-09

### Changed

- **`DV-A11Y-008` and `DV-IMPL-005` split two cases.** Chart animation still runs on first mount and never replays on a refetch, a poll or a live update. It may now also run when the user changes the range, filter or series, because they asked for the change. The 300ms ceiling and reduced-motion rule are unchanged.
- The Motion example in `references/implementation.md` shows how to turn animation on for a user-chosen range and back off, and points to the chart range change spec in `vois-components`.
- The `slow-chart-animation` detector message says what the reworded rules say. It still checks `animationDuration` above 300.

### Notes

- **Version bump:** `1.0.4` → `1.1.0`

---

## [1.0.4] - 2026-10-08

### Changed

- **Step 8 of the review checklist** (`data/review-checklist.json`) now says "If the vois_record_rule_usage tool is available, call it" instead of a bare "Call vois_record_rule_usage". The public skill has to work without the Vois MCP. The private repo keeps the required call; `scripts/check-mirror.mjs` allows that one sentence to differ.

---

## [1.0.3] - 2026-10-06

### Fixed

- **Test count.** `SKILL.md` said `scripts/dataviz.test.mjs` has 54 tests. It has 58.
- **Two status vocabularies.** The chart status tokens (`chart-status-good`, `-warning`, `-serious`, `-critical`) and the system status roles (`positive`, `negative`, `warning`, `info`, `DS-COLOR-008` in `vois-tokens`) had no stated relationship. `references/implementation.md` now maps good to `positive`, warning to `warning`, and critical to `negative`, and says `serious` is chart-only, a fourth level with no system role. The workspace token set defines the aliases.

### Changed

- **Version bump:** `1.0.2` → `1.0.3`

---

## [1.0.2] - 2026-10-02

### Fixed

- `SKILL.md` said `scripts/validate-data.py` at the repo root checks the prose-to-JSON ID sync. That script only exists in the private repo. In this repo the check runs in `scripts/dataviz.test.mjs`.

---

## [1.0.1] - 2026-10-01

### Changed

- **Rules are platform-agnostic.** Removed the `material` and `uswds` source tags from 15 rules and from the docs. Rules now cite only the playbook, Mobbin evidence, WCAG, the design-system-agnostic dataviz skill and, for implementation rules, the Vois stack. A test fails if a rule cites any other source. No rule text changed.

---

## [1.0.0] - 2026-10-01

### Added

- Initial release. Data visualization and dashboard guidance for web apps, usable for both building and reviewing.
- `data/dataviz-rules.json`: 14 principles with do and don't lists and 114 rules (`DV-*`), each with severity, enforcement, do, don't, check, sources and evidence.
- `data/decision-tree.json`: the chart-selection decision tree as a graph, with job entry points and six gates.
- `data/chart-catalog.json`: 48 forms (`FORM-*`) covering all 23 families in the UX Magazine playbook plus stat tile, meter, funnel, treemap, dumbbell, small multiples, emphasis and others.
- `data/dashboard-patterns.json`: six dashboard templates and eight reusable pieces (`DASH-*`).
- `data/evidence.json`: 57 observations from real dashboards on Mobbin (`MOB-*`).
- `data/review-checklist.json`, `data/review-output.schema.json`, `data/chart-spec.schema.json`: the review protocol, the shape of a review, and the spec to fill in before coding.
- `scripts/check-spec.mjs`, `scripts/detect.mjs`, `scripts/build-reference.mjs`, and 54 tests.
- Generated references: principles, decision tree, chart catalog, dashboard patterns, evidence. Hand-written: implementation, review protocol, sources.
- `scripts/dataviz.test.mjs` includes a prose-to-JSON ID sync check for the five ID families (`DV-`, `FORM-`, `CHART-`, `DASH-`, `MOB-`).
