# Changelog

All notable changes to the `vois-dataviz` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
