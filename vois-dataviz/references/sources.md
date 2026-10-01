# Sources and what was actually read

Be clear about provenance. Rules tag their sources in `data/dataviz-rules.json`. The rules are platform-agnostic: they rest on the playbook, real dashboards, WCAG and the design-system-agnostic dataviz skill, not on any one vendor's design system. Only the `DV-IMPL` rules are specific to the Vois stack.

| Source | How it was used | Read how |
|---|---|---|
| UX Magazine data visualization playbook (Jim Gulsen): 7 project principles, 23 chart families, tool and resource lists | Principles 1 to 7 map to `DV-PURPOSE`, `DV-CLARITY`, `DV-HONEST`, `DV-CONSIST`, `DV-CONTEXT`, `DV-A11Y`, `DV-SUSTAIN`. The 23 families are the spine of `data/chart-catalog.json` (each carries its `article_ref`). | Full text supplied in the request |
| Mobbin, web screens | 57 evidence entries in `data/evidence.json`: dashboards, charts, tooltips, date pickers, comparison, funnels, sparkline tables, empty, loading and edit states. About 45 searches' worth of screens; each entry cites its Mobbin page. | Searched through the Mobbin MCP. Images were viewed directly |
| `dataviz` skill (bundled with the environment) | Color jobs, mark specs, interaction anatomy, anti-patterns (tags `dataviz-skill`). It is design-system agnostic and ships a palette validator. | Read in full |
| WCAG 2.2 | 1.1.1, 1.3.1, 1.4.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.13, 2.1.1 (tags `wcag`). | From knowledge of the standard |
| Vois skills (`vois-tokens`, `vois-components`, `vois-patterns`) | Token, motion, hit-area and spacing rules cited by id; JOB, PATH conventions. | Read in full |

## Limits to know about

- **Mobbin evidence is a snapshot** of other companies' screens from one search session. Treat entries as pattern observations, not as endorsements of a product, and don't copy their visuals. Image links expire, so only page links are stored. Spot-check a link if it matters.
- **Numeric thresholds are defaults, not law:** 6 donut segments, about 12 categories, 8 series ceiling, about 500 points to downsample, 24px bars. They come from the playbook and the `dataviz` skill and from common practice. A reader study could move them.
- **The detector is heuristic.** It reads text, not types, and covers the 15 rules marked `auto` through 13 detectors. A clean detector run is not an accessibility review.
