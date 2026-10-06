# Changelog

All notable changes to the `vois-dataviz` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
