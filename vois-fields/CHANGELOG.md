# Changelog

All notable changes to the Vois Fields skill are documented here.

---

## [1.0.0] - 2026-11-14

### Added
- The skill: `SKILL.md`, `README.md`, and three references (`core-rules.md`, `prefill.md`, `type-ahead.md`).
- `data/field-types.json`: 12 field types (email, phone, URL, US ZIP code, person name, VIN, driver's license, SSN, money, percent, one-time code, date), each with input attributes, stored format, shown format, check timing, privacy class and confidence. VIN and prefill come first because commercial auto work needs them.
- `data/field-types.schema.json` and `scripts/check-fields.mjs`: a schema check plus rules a schema cannot say. 16 tests, with a guard test for each rule, and a check that a malformed table is reported, not thrown.
- `data/prefill-answer.schema.json`: the contract for a prefilled answer (`fieldType`, `value`, `origin`, `confidence`).
- `data/fields-rules.json`: 23 `FIELD-*` rules (the seven core input rules, five check timings, four sensitive data rules, six prefill rules, type-ahead defaults).
- `docs/field-explainer.html`: an interactive page for picking a field type.

### Not in this version
- Lint rules for blocked paste, `type="number"` in markup and inputs under 16px. The table check covers the data only.
- Date ranges, FEIN, USDOT and MC numbers, policy and claim numbers, file upload and repeating rows.
