#!/usr/bin/env python3
"""Tests for scripts/check-verification.py.

Each test breaks one input in a throwaway copy of the repo and expects a
finding, so a guard that stops working shows up as a failing test. Nothing
here touches the real working tree.
"""
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path

REAL_ROOT = Path(__file__).resolve().parent.parent

spec = importlib.util.spec_from_file_location("check_verification", REAL_ROOT / "scripts" / "check-verification.py")
vd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vd)

TOKENS = "vois-tokens/data/vois-rules.json"
DATAVIZ = "vois-dataviz/data/dataviz-rules.json"
COMPONENTS = "vois-components/data/components-rules.json"


class VerificationCheck(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, ignore_errors=True)
        shutil.copytree(
            REAL_ROOT, self.tmp / "repo",
            ignore=shutil.ignore_patterns(".git", "node_modules"),
        )
        self.root = self.tmp / "repo"
        self._old_root = vd.ROOT
        vd.ROOT = self.root
        self.addCleanup(setattr, vd, "ROOT", self._old_root)

    def edit(self, rel, fn):
        p = self.root / rel
        data = json.loads(p.read_text())
        fn(data)
        p.write_text(json.dumps(data))

    def token_rule(self, data, rule_id):
        return next(r for r in data["rules"] if r["id"] == rule_id)

    def findings(self):
        return vd.check_verification()

    def assert_finding(self, fragment):
        found = self.findings()
        self.assertTrue(any(fragment in f for f in found), f"expected a finding with {fragment!r}, got {found}")

    def test_real_data_is_clean(self):
        self.assertEqual(self.findings(), [])

    def test_missing_verification(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-A11Y-001").pop("verification"))
        self.assert_finding("DS-A11Y-001")

    def test_unknown_verification_value(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-A11Y-001").update(verification="Detector "))
        self.assert_finding("expected one of")

    def test_null_verification(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-A11Y-001").update(verification=None))
        self.assert_finding("DS-A11Y-001")

    def test_detector_without_a_name(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-A11Y-003").pop("detector"))
        self.assert_finding("no `detector` name")

    def test_empty_detector_name(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-A11Y-003").update(detector=""))
        self.assert_finding("no `detector` name")

    def test_detector_named_on_a_judgment_rule(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-A11Y-001").update(detector="DS-A11Y-003"))
        self.assert_finding("names detector")

    def test_detector_not_in_registry(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-A11Y-003").update(detector="DS-A11Y-999"))
        self.assert_finding("not in vois-tokens/scripts/registry.mjs")

    def edit_registry(self, old, new):
        p = self.root / "vois-tokens/scripts/registry.mjs"
        s = p.read_text()
        self.assertIn(old, s)
        p.write_text(s.replace(old, new, 1))

    def test_covers_comes_from_the_registry_not_the_validator(self):
        # Drop DS-MODAL-002 from `covers`: the rule still names DS-MODAL, but the code no longer says it covers it.
        self.edit_registry('covers: ["DS-MODAL-001", "DS-MODAL-002"]', 'covers: ["DS-MODAL-001"]')
        self.assert_finding("DS-MODAL-002: names detector 'DS-MODAL', but the detector for this rule is none in the registry")

    def test_covers_that_names_a_rule_which_does_not_name_it_back(self):
        self.edit_registry('covers: ["DS-MODAL-001", "DS-MODAL-002"]', 'covers: ["DS-MODAL-001", "DS-MODAL-002", "DS-MODAL-003"]')
        self.assert_finding("says it covers DS-MODAL-003")

    def test_covers_that_names_a_rule_which_does_not_exist(self):
        self.edit_registry('covers: ["DS-MODAL-001", "DS-MODAL-002"]', 'covers: ["DS-MODAL-001", "DS-MODAL-002", "DS-NOPE-999"]')
        self.assert_finding("says it covers DS-NOPE-999")

    def test_malformed_covers_makes_the_registry_unreadable(self):
        self.edit_registry('covers: ["DS-MODAL-001", "DS-MODAL-002"]', 'covers: "DS-MODAL-001"')
        self.assert_finding("could not read detector ids")
        self.edit_registry('covers: "DS-MODAL-001"', "covers: [1, 2]")
        self.assert_finding("could not read detector ids")

    def test_a_rule_cannot_name_a_detector_that_covers_other_rules(self):
        self.edit(TOKENS, lambda d: self.token_rule(d, "DS-MODAL-003").update(verification="detector", detector="DS-MODAL"))
        self.assert_finding("DS-MODAL-003: names detector 'DS-MODAL', but the detector for this rule is none in the registry")

    def test_registry_detector_nobody_claims(self):
        def drop(d):
            for rid in ("DS-MODAL-001", "DS-MODAL-002"):
                r = self.token_rule(d, rid)
                r["verification"] = "judgment"
                r.pop("detector")
        self.edit(TOKENS, drop)
        self.assert_finding("'DS-MODAL'")

    def test_lookalike_detector_nobody_claims(self):
        def drop(d):
            row = next(r for r in d["lookalikes"]["rows"] if r["id"] == "LOOKALIKE-002")
            row["verification"] = "judgment"
            row.pop("detector")
        self.edit(COMPONENTS, drop)
        self.assert_finding("'LOOKALIKE-002'")

    def test_lookalike_row_missing_verification(self):
        def drop(d):
            next(r for r in d["lookalikes"]["rows"] if r["id"] == "LOOKALIKE-004").pop("verification")
        self.edit(COMPONENTS, drop)
        self.assert_finding("LOOKALIKE-004")

    def test_slop_detector_is_exempt_by_category(self):
        # DS-SLOP-002 has a detector but its family is not indexed in vois-rules.json.
        self.assertIn("DS-SLOP-002", vd.registry_detectors())
        self.assertEqual(self.findings(), [])

    def test_swapped_detector_names(self):
        def swap(d):
            a, b = self.token_rule(d, "DS-A11Y-003"), self.token_rule(d, "DS-A11Y-010")
            a["detector"], b["detector"] = b["detector"], a["detector"]
        self.edit(TOKENS, swap)
        self.assert_finding("the detector for this rule is 'DS-A11Y-003'")

    def test_lookalike_row_pointing_at_another_detector(self):
        def point(d):
            next(r for r in d["lookalikes"]["rows"] if r["id"] == "LOOKALIKE-002")["detector"] = "LOOKALIKE-003"
        self.edit(COMPONENTS, point)
        self.assert_finding("the detector for this rule is 'LOOKALIKE-002'")

    def with_registry(self, extra):
        real = vd.registry_detectors
        vd.registry_detectors = lambda: {**real(), **{name: [] for name in extra}}
        self.addCleanup(setattr, vd, "registry_detectors", real)

    def test_new_slop_detector_is_exempt_but_a_typo_family_is_not(self):
        self.with_registry({"DS-SLOP-005"})
        self.assertEqual(self.findings(), [])
        self.with_registry({"DS-ANIM-010"})
        self.assert_finding("'DS-ANIM-010'")

    def test_slop_exemption_ends_when_the_family_is_indexed(self):
        self.edit(TOKENS, lambda d: d["categories"].update({"DS-SLOP": "Anti-slop"}))
        self.assert_finding("'DS-SLOP-002'")

    def edit_dataviz_detect(self, old, new):
        p = self.root / "vois-dataviz/scripts/detect.mjs"
        s = p.read_text()
        self.assertIn(old, s)
        p.write_text(s.replace(old, new, 1))

    def test_dataviz_detector_renamed_in_code(self):
        self.edit_dataviz_detect('id: "dual-axis"', 'id: "dual-y-axis"')
        self.assert_finding("'dual-y-axis' reports DV-HONEST-002")
        self.assert_finding("a rule names detector 'dual-axis'")

    def test_dataviz_detector_in_code_that_no_rule_claims(self):
        self.edit_dataviz_detect(
            '    id: "dual-axis", ruleId: "DV-HONEST-002",',
            '    id: "orphan-check", ruleId: "DV-HONEST-002",\n    run() { return []; },\n  },\n  {\n    id: "dual-axis", ruleId: "DV-HONEST-002",',
        )
        self.assert_finding("'orphan-check' reports DV-HONEST-002")

    def test_dataviz_detector_written_in_another_style_is_still_checked(self):
        # Single quotes, ruleId first, a key between the two: a source-text regex would miss all of these.
        self.edit_dataviz_detect(
            '    id: "dual-axis", ruleId: "DV-HONEST-002",',
            "    ruleId: 'DV-HONEST-002',\n    severityNote: 'x',\n    id: 'sneaky-axis',",
        )
        self.assert_finding("'sneaky-axis' reports DV-HONEST-002")
        self.assert_finding("a rule names detector 'dual-axis'")

    def test_dataviz_reformatted_but_unchanged_still_passes(self):
        self.edit_dataviz_detect(
            '    id: "dual-axis", ruleId: "DV-HONEST-002",',
            "    ruleId: 'DV-HONEST-002',\n    id: 'dual-axis',",
        )
        self.assertEqual(self.findings(), [])

    def test_dataviz_detector_list_not_exported(self):
        self.edit_dataviz_detect("export const DETECTOR_IDS", "const DETECTOR_IDS_HIDDEN")
        self.assert_finding("could not read DETECTOR_IDS")

    def test_dataviz_detector_reports_a_rule_that_does_not_exist(self):
        self.edit_dataviz_detect('ruleId: "DV-HONEST-002"', 'ruleId: "DV-HONEST-999"')
        self.assert_finding("reports DV-HONEST-999")

    def test_dataviz_detect_file_with_no_detectors(self):
        (self.root / "vois-dataviz/scripts/detect.mjs").write_text("export const DETECTOR_IDS = [];\n")
        self.assert_finding("could not read DETECTOR_IDS")

    def test_dataviz_verification_must_match_enforcement(self):
        def flip(d):
            next(r for r in d["rules"] if r["enforcement"] == "judgment").update(verification="detector", detector="dual-axis")
        self.edit(DATAVIZ, flip)
        self.assert_finding("enforcement 'judgment' means verification `judgment`")

    def test_dataviz_auto_rule_without_verification(self):
        def drop(d):
            next(r for r in d["rules"] if r["enforcement"] == "auto").pop("verification")
        self.edit(DATAVIZ, drop)
        self.assert_finding("expected one of")

    def test_missing_node_is_a_finding_not_a_pass(self):
        vd.node_json, real = (lambda code: None), vd.node_json
        self.addCleanup(setattr, vd, "node_json", real)
        self.assert_finding("could not read detector ids from scripts/registry.mjs")
        self.assert_finding("could not read DETECTOR_IDS")

    def test_empty_rules_list_is_a_finding(self):
        self.edit(DATAVIZ, lambda d: d.update(rules=[]))
        self.assert_finding("has no rules")


if __name__ == "__main__":
    unittest.main(verbosity=1)
