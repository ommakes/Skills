#!/usr/bin/env python3
"""Check that every rule says how it can be checked, and that the detectors match.

Every rule in vois-tokens, vois-dataviz and the vois-components lookalike table has a
`verification` of detector | spec | rendered | judgment. A `detector` rule names its detector,
that detector must exist in code (vois-tokens/scripts/registry.mjs, vois-dataviz/scripts/detect.mjs),
and every detector in code must be claimed by a rule. Needs `node` on PATH, because it imports
those two modules instead of parsing their source, and fails when node is missing.

The check functions are the same code as check_verification in the private repo's
scripts/validate-data.py (ommakes/vois-skills). Change them there first.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def category_of(rule_id):
    """DS-LAYOUT-COMP-001 -> DS-LAYOUT-COMP ; DS-A11Y-001 -> DS-A11Y ; PATH-A stays PATH-A."""
    return re.sub(r"-\d+$", "", rule_id)


VERIFICATION_VALUES = {"detector", "spec", "rendered", "judgment"}
# Detectors in this family are judgment-only by design and not indexed in vois-rules.json.
UNINDEXED_DETECTOR_PREFIX = "DS-SLOP-"
# vois-dataviz keeps its older `enforcement` field; `verification` must say the same thing.
DATAVIZ_ENFORCEMENT_TO_VERIFICATION = {"auto": "detector", "spec": "spec", "judgment": "judgment"}


def node_json(code):
    """Run a small ES-module snippet from the repo root and parse what it prints as JSON.
    Importing the real module (not parsing its source) means a reformatted line cannot hide
    an entry. Returns None when node is missing, the import fails, or the output is not JSON."""
    try:
        out = subprocess.run(
            ["node", "--input-type=module", "-e", code],
            cwd=ROOT, capture_output=True, text=True, timeout=60,
        )
        return json.loads(out.stdout) if out.returncode == 0 else None
    except (OSError, subprocess.SubprocessError, ValueError):
        return None


def registry_detectors():
    """{detector id: [rule ids it covers beyond its own id]} from vois-tokens/scripts/registry.mjs.
    None when it cannot be read (the caller reports that as a finding)."""
    rows = node_json(
        "import {RULES} from './vois-tokens/scripts/registry.mjs'; "
        "console.log(JSON.stringify(RULES.map(r => ({id: r.id, covers: r.covers ?? []}))))"
    )
    if not isinstance(rows, list) or not rows:
        return None
    out = {}
    for r in rows:
        covers = r.get("covers")
        if not isinstance(r.get("id"), str) or not isinstance(covers, list) or not all(isinstance(c, str) for c in covers):
            return None  # a malformed `covers` makes the whole registry unreadable, never wider
        out[r["id"]] = covers
    return out


def dataviz_detectors():
    """[{id, ruleId}] from the DETECTOR_IDS export of vois-dataviz/scripts/detect.mjs, or None."""
    rows = node_json(
        "import {DETECTOR_IDS} from './vois-dataviz/scripts/detect.mjs'; console.log(JSON.stringify(DETECTOR_IDS))"
    )
    if not isinstance(rows, list) or not rows:
        return None
    return rows if all(isinstance(r, dict) and isinstance(r.get("id"), str) and isinstance(r.get("ruleId"), str) for r in rows) else None


def check_verification():
    """Every rule in vois-tokens, vois-dataviz and the vois-components lookalike
    table says how it can be checked: detector | spec | rendered | judgment.
    A rule marked `detector` must name a real detector, and every detector in
    code must be claimed by a rule, so the data and the detectors cannot drift."""
    findings = []
    sources = [
        ("vois-tokens", "data/vois-rules.json", lambda d: d.get("rules", [])),
        ("vois-dataviz", "data/dataviz-rules.json", lambda d: d.get("rules", [])),
        ("vois-components", "data/components-rules.json", lambda d: d.get("lookalikes", {}).get("rows", [])),
    ]
    registry = registry_detectors()
    if registry is None:
        findings.append(
            "vois-tokens: could not read detector ids from scripts/registry.mjs "
            "(is `node` installed?), so `detector` names were not checked."
        )
    named = {}  # detector name -> ids of the tokens rules and lookalike rows that name it
    tokens_rules = []
    dataviz_rules = []
    for skill, data_rel, getter in sources:
        path = ROOT / skill / data_rel
        if not path.exists():
            findings.append(f"{skill}: {data_rel} is missing, cannot check `verification`.")
            continue
        entries = getter(json.loads(path.read_text()))
        if skill == "vois-dataviz":
            dataviz_rules = entries
        if skill == "vois-tokens":
            tokens_rules = entries
        if not entries:
            findings.append(f"{skill}: {data_rel} has no rules to check `verification` on.")
        for e in entries:
            rid = e.get("id", "<no id>")
            v = e.get("verification")
            det = e.get("detector")
            if v not in VERIFICATION_VALUES:
                findings.append(
                    f"{skill}: {rid}: `verification` is {v!r}, expected one of {sorted(VERIFICATION_VALUES)}."
                )
                continue
            if v == "detector" and not (isinstance(det, str) and det):
                findings.append(f"{skill}: {rid}: verification is `detector` but no `detector` name is given.")
            if skill != "vois-dataviz" and v == "detector" and isinstance(det, str) and det:
                named.setdefault(det, []).append(rid)
                # The detector for a rule is the registry entry with the rule's own id, or the
                # one that lists the rule in `covers`. Read from the code, so the link cannot lie.
                if registry is not None:
                    allowed = {d for d, covers in registry.items() if d == rid or rid in covers}
                    if det not in allowed:
                        findings.append(
                            f"{skill}: {rid}: names detector {det!r}, but the detector for this rule is "
                            f"{' or '.join(repr(a) for a in sorted(allowed)) or 'none in the registry'}."
                        )
            if v != "detector" and det is not None:
                findings.append(
                    f"{skill}: {rid}: names detector {det!r} but verification is `{v}`; "
                    "either mark it `detector` or drop the name."
                )
            if skill == "vois-dataviz":
                want = DATAVIZ_ENFORCEMENT_TO_VERIFICATION.get(e.get("enforcement"))
                if want != v:
                    findings.append(
                        f"{skill}: {rid}: enforcement {e.get('enforcement')!r} means verification "
                        f"`{want}`, but verification is `{v}`."
                    )

    if registry is not None:
        for name in sorted(set(named) - set(registry)):
            findings.append(f"detector {name!r} is named by a rule but is not in vois-tokens/scripts/registry.mjs.")

        # A `covers` entry must be a real tokens rule that names this detector back.
        by_id = {r.get("id"): r for r in tokens_rules}
        for det, covers in sorted(registry.items()):
            for c in covers:
                r = by_id.get(c)
                if r is None or r.get("verification") != "detector" or r.get("detector") != det:
                    findings.append(
                        f"registry.mjs: detector {det!r} says it covers {c}, "
                        "but that is not a vois-tokens rule marked `detector` with that name."
                    )

        tokens_path = ROOT / "vois-tokens" / "data" / "vois-rules.json"
        categories = json.loads(tokens_path.read_text()).get("categories") if tokens_path.exists() else None
        for name in sorted(set(registry) - set(named)):
            # Exempt by name, and only while the family really is absent from the
            # tokens `categories` map, so a typo'd or new family is still reported.
            if (name.startswith(UNINDEXED_DETECTOR_PREFIX) and isinstance(categories, dict)
                    and category_of(name) not in categories):
                continue
            findings.append(f"registry.mjs has detector {name!r} that no rule or lookalike row marks as its `detector`.")

    findings += check_dataviz_detectors(dataviz_rules)
    return findings


def check_dataviz_detectors(rules):
    """vois-dataviz/scripts/detect.mjs exports DETECTOR_IDS, one { id, ruleId } per detector.
    The rule a detector reports must exist and name that detector (so no detector
    in code goes unclaimed), and every detector a rule names must exist in code."""
    detectors = dataviz_detectors()
    if detectors is None:
        return ["vois-dataviz: could not read DETECTOR_IDS from scripts/detect.mjs (is `node` installed?), so its detectors were not checked."]
    by_id = {r.get("id"): r for r in rules}
    findings = []
    for d in detectors:
        r = by_id.get(d["ruleId"])
        if r is None or r.get("verification") != "detector" or r.get("detector") != d["id"]:
            findings.append(
                f"vois-dataviz: detect.mjs detector {d['id']!r} reports {d['ruleId']}, "
                "but that rule does not name it as its `detector`."
            )
    code_names = {d["id"] for d in detectors}
    claimed = {r.get("detector") for r in rules if r.get("verification") == "detector"}
    for name in sorted(claimed - code_names - {None}):
        findings.append(f"vois-dataviz: a rule names detector {name!r}, which is not in scripts/detect.mjs.")
    return findings


def main():
    findings = check_verification()
    print("Checking how each rule is verified (verification / detector)...")
    for f in findings:
        print(f"FAIL {f}")
    if findings:
        print(f"{len(findings)} finding(s)")
        return 1
    print("OK: every rule declares how it is checked, and detectors match the code")
    return 0


if __name__ == "__main__":
    sys.exit(main())
