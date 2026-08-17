# Changelog

All notable changes to the Metrics Tagging skill are documented here.

---

## [1.1.0] — 2026-08-17

### Added

- **Properties column** in the Event Taxonomy Table — captures the contextual payload data (plan type, error code, `flow_id`) that rides along on an event, separate from the event name itself. Includes a rule against putting PII in properties — reference a user/account ID instead.
- **Task-Level Events (Flow Completion)** section — a second table pairing a start event with an end event (e.g. `personaCreateBtnClicked` → `personaSaveBtnClicked` = `addNewPersona`) via a shared `flow_id` linking property, with explicit Success Definition and Abandonment Rule columns. Analytics tools (Amplitude, Mixpanel, GA4) stitch funnels together via a shared property fired on both events, not a native "paired event" object — this table makes that linkage explicit instead of leaving it implicit.
- **Avoiding Taxonomy Bloat** section — rule against creating a separate event per dropdown/radio/toggle option (use one event plus a property instead), and a ~25–30 row/screen soft ceiling that flags for consolidation rather than shipping unreadable sprawl silently.
- **Cross-Session Consistency (Event Registry)** section — the skill now reads `references/event-registry.md` (project-local, not bundled with the skill) before naming new events, reuses matching patterns instead of reinventing names, and appends newly created events after finalizing output. Ships with a starter template at `references/event-registry.md`.
- Dedup check and registry check added to the pre-output Quality Check list.

### Changed

- Event Taxonomy Table is now 6 columns (added Properties), up from 5.
- Output Format now conditionally includes the Task-Level Events table (step 3) when the screen contains a multi-step create/edit/delete pattern — omitted entirely when none exist.
- **Version bump:** `1.0.0` → `1.1.0`

---

## [1.0.0] — 2026-04-14

Initial tracked version. Three-level tagging mental model (Page/App/Business), camelCase `nounVerb` naming convention, 5-column Event Taxonomy Table, cascading/high-impact input flagging, element coverage checklist, Coverage Gaps section, and KPI-mapping by product type.
