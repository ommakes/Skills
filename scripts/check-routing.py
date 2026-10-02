#!/usr/bin/env python3
"""Routing and link audit for a skills repo.

Fails (exit 1) when something points at a destination that does not exist:
  - a file path or markdown link in a doc, or a source_file / dataRef / tool path in JSON
  - a skill in skills.json with no folder, no SKILL.md, or a version that disagrees with SKILL.md
  - a router work type, graph.json edge, loop conflict, or validate-checklist rule ID that points nowhere
  - an empty file (other than __init__.py)
Warns (exit 0) on orphaned reference, data, and script files that nothing mentions.

Usage: python3 scripts/check-routing.py [repo-root]

Both skill repos use the same copy of this script. Repo-specific exceptions live in
scripts/check-routing.config.json (see that file's "description").
CHANGELOG.md files are skipped: they record history, so they name files that have since moved.
"""
import fnmatch
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
repo = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(HERE)

cfg_path = os.path.join(repo, "scripts", "check-routing.config.json")
CFG = json.load(open(cfg_path, encoding="utf8")) if os.path.exists(cfg_path) else {}
EXTERNAL = set(CFG.get("externalSkills", []))
SKIP_FILES = CFG.get("skipFiles", [])
IGNORE = CFG.get("ignore", [])

findings = []  # (severity, file, message)


def rel(p):
    return os.path.relpath(p, repo)


def add(sev, where, msg):
    w = rel(where) if os.path.isabs(where) else where
    for ig in IGNORE:
        if fnmatch.fnmatch(w, ig["file"]) and re.search(ig["message"], msg):
            return
    findings.append((sev, w, msg))


def skipped(path):
    r = rel(path)
    return os.path.basename(r) in ("CHANGELOG.md", "check-routing.config.json") or any(fnmatch.fnmatch(r, g) for g in SKIP_FILES)


# ---------- inventory
SKILL_DIRS = {}  # skill name -> absolute dir (nested sub-skills included)
md_files, json_files, code_files, all_files = [], [], [], []
for dp, dn, fn in os.walk(repo):
    dn[:] = [d for d in dn if d not in (".git", "node_modules", "__pycache__")]
    if "SKILL.md" in fn:
        SKILL_DIRS[os.path.basename(dp)] = dp
    for f in fn:
        p = os.path.join(dp, f)
        all_files.append(p)
        if f.endswith(".md") or f == "README":
            md_files.append(p)
        elif f.endswith(".json"):
            json_files.append(p)
        elif f.endswith((".mjs", ".js", ".py", ".sh", ".yml")):
            code_files.append(p)
SKILLS = set(SKILL_DIRS)
TOP_SKILLS = {s for s, d in SKILL_DIRS.items() if os.path.dirname(d) == repo}

# ---------- 1. empty files
for p in all_files:
    if os.path.getsize(p) == 0 and os.path.basename(p) != "__init__.py":
        add("ERROR", p, "empty file")

# ---------- 2. paths and links in markdown
PATH_RE = re.compile(r"`((?:\.{1,2}/)?(?:[\w.\-]+/)+[\w.\-*<>]+\.(?:md|json|mjs|js|py|sh|css|html|template|yml))`")
LINK_RE = re.compile(r"\]\(((?!https?:|#|mailto:)[^)\s]+)\)")
CROSS = 0


def owning_skill_dir(path):
    r = rel(path).split(os.sep)
    d = os.path.join(repo, r[0])
    return d


def resolves(token, from_file):
    global CROSS
    if any(c in token for c in "<*{"):
        return True  # placeholder or glob
    t = token[2:] if token.startswith("./") else token
    if t.startswith("."):
        return True  # project-local config (.claude/, .vois/), not part of this repo
    own = owning_skill_dir(from_file)
    cands = [os.path.join(os.path.dirname(from_file), token), os.path.join(repo, t), os.path.join(own, t)]
    if any(os.path.exists(c) for c in cands):
        return True
    first = t.split("/")[0]
    if first in EXTERNAL:
        return True
    # prose like "`vois-patterns` (`references/x.md`)": the path is relative to another skill
    for d in SKILL_DIRS.values():
        if os.path.exists(os.path.join(d, t)):
            CROSS += 1
            return True
    return False


for f in md_files:
    if skipped(f):
        continue
    text = open(f, encoding="utf8", errors="ignore").read()
    for m in PATH_RE.finditer(text):
        tok = m.group(1)
        if not resolves(tok, f):
            add("ERROR", f, f"path does not exist: {tok}")
    for m in LINK_RE.finditer(text):
        tok = m.group(1).split("#")[0]
        if tok and not resolves(tok, f):
            add("ERROR", f, f"markdown link target does not exist: {tok}")


# ---------- 3. paths inside JSON
def walk(o, fn, key=None, parent=None):
    if isinstance(o, dict):
        for k, v in o.items():
            walk(v, fn, k, o)
    elif isinstance(o, list):
        for v in o:
            walk(v, fn, key, parent)
    else:
        fn(key, o, parent)


JSON = {}
for f in json_files:
    try:
        JSON[f] = json.load(open(f, encoding="utf8"))
    except Exception as e:
        add("ERROR", f, f"invalid JSON: {e}")

PATH_KEYS = ("source_file", "dataRef", "detector", "ruleSource", "graph", "tools")
for f, d in JSON.items():
    if skipped(f):
        continue
    is_skills_json = os.path.basename(f) == "skills.json"

    def chk(key, val, parent, f=f, is_skills_json=is_skills_json):
        if not isinstance(val, str) or "/" not in val or val.startswith("http") or any(c in val for c in "<*"):
            return
        if not (key in PATH_KEYS or (key == "path" and not is_skills_json)):
            return
        if isinstance(parent, dict) and parent.get("repo"):
            return  # node that lives in another repo
        base = os.path.dirname(f)
        cands = [os.path.join(repo, val), os.path.join(base, val), os.path.join(owning_skill_dir(f), val)]
        if any(os.path.exists(c) for c in cands) or val.split("/")[0] in EXTERNAL:
            return
        add("ERROR", f, f"{key} does not exist: {val}")

    walk(d, chk)

# ---------- 4. skills.json
sk_entries = {}
sj = os.path.join(repo, "skills.json")
if os.path.exists(sj):
    for s in JSON[sj]["skills"]:
        sk_entries[s["name"]] = s
        p = os.path.join(repo, s["path"])
        sm = os.path.join(p, "SKILL.md")
        if not os.path.isdir(p):
            add("ERROR", sj, f"skill '{s['name']}' path missing: {s['path']}")
            continue
        if not os.path.exists(sm):
            add("ERROR", sj, f"skill '{s['name']}' has no SKILL.md")
            continue
        text = open(sm, encoding="utf8").read()
        fm = text.split("---")[1] if text.startswith("---") else ""
        ver = re.search(r"^version:\s*(\S+)", fm, re.M)
        nm = re.search(r"^name:\s*(\S+)", fm, re.M)
        if ver and ver.group(1) != s["version"]:
            add("ERROR", sj, f"version mismatch for {s['name']}: skills.json {s['version']} vs SKILL.md {ver.group(1)}")
        if nm and nm.group(1) != s["name"]:
            add("ERROR", sj, f"name mismatch: skills.json {s['name']} vs SKILL.md {nm.group(1)}")
        for df in s.get("dataFiles", []):
            if not os.path.exists(os.path.join(p, df["path"])):
                add("ERROR", sj, f"{s['name']} dataFile missing: {df['path']}")
    for name in sorted(TOP_SKILLS):
        if name not in sk_entries:
            add("WARN", sj, f"skill folder '{name}' is not listed in skills.json")

known = SKILLS | set(sk_entries)


def need_skill(name, where, ctx):
    if " " in name or name in known or name in EXTERNAL:
        return  # descriptive text ("any downstream skill") or a skill in the other repo
    add("ERROR", where, f"{ctx}: skill '{name}' exists nowhere")


# ---------- 5. router, graph, loop
wt = os.path.join(repo, "vois-router/data/work-type-classification.json")
gj = os.path.join(repo, "graph.json")
if wt in JSON:
    d = JSON[wt]
    ids = [w["id"] for w in d["work_types"]]
    if len(ids) != len(set(ids)):
        add("ERROR", wt, "duplicate work type ids")
    for w in d["work_types"]:
        need_skill(w["entry_point"], wt, f"work type {w['id']} entry_point")
    for e in d.get("excluded_from_routing", []):
        need_skill(e["skill"], wt, "excluded_from_routing")
    router_md = open(os.path.join(repo, "vois-router/SKILL.md"), encoding="utf8").read()
    for i in ids:
        if f"**{i}**" not in router_md:
            add("ERROR", wt, f"work type {i} is in the JSON but has no row in vois-router/SKILL.md")
    for m in re.finditer(r"^\| \*\*([A-Z][A-Z\-]+)\*\* \|", router_md, re.M):
        if m.group(1) not in ids:
            add("ERROR", "vois-router/SKILL.md", f"work type {m.group(1)} has a row but is not in work-type-classification.json")
    if gj in JSON:
        g = JSON[gj]
        edges = g["entryEdges"]["edges"]
        gids = [e["workTypeId"] for e in edges]
        node_ids = {n["id"] for n in g["nodes"]}
        for i in ids:
            if i not in gids:
                add("ERROR", gj, f"work type {i} is missing from graph.json entryEdges")
        for i in gids:
            if i not in ids:
                add("ERROR", gj, f"graph.json has an entry edge for unknown work type {i}")
        for e in edges:
            for k in ("entry", "then", "precededBy"):
                v = e.get(k)
                if v and k != "precededBy" and v not in node_ids and v not in known:
                    add("ERROR", gj, f"entry edge {e['workTypeId']}.{k} -> '{v}' is not a node or skill")
        for n in g["nodes"]:
            if n.get("path") and not n.get("repo") and not os.path.exists(os.path.join(repo, n["path"])):
                add("ERROR", gj, f"node {n['id']} path missing: {n['path']}")
            for t in n.get("tools", []):
                if not os.path.exists(os.path.join(repo, t)):
                    add("ERROR", gj, f"node {n['id']} tool missing: {t}")
        for sect in ("chainEdges",):
            for e in g.get(sect, {}).get("edges", []):
                for k in ("from", "to"):
                    if e.get(k) and e[k] not in node_ids:
                        add("ERROR", gj, f"{sect} edge references unknown node '{e[k]}'")
        for e in g.get("loopBackEdges", {}).get("edges", []):
            v = e.get("loopBackTo")
            if v and v not in node_ids:
                add("ERROR", gj, f"loopBackEdges '{e['conflictId']}' loops back to unknown node '{v}'")
        cm = os.path.join(repo, "vois-loop/data/conflict-matrix.json")
        if cm in JSON:
            graph_conflicts = {e["conflictId"] for e in g["loopBackEdges"]["edges"]}
            for x in JSON[cm]["conflicts"]:
                need_skill(x["loop_back_to"], cm, f"conflict {x['id']} loop_back_to")
                need_skill(x["from_skill"], cm, f"conflict {x['id']} from_skill")
                if x["id"] not in graph_conflicts:
                    add("ERROR", cm, f"conflict {x['id']} is missing from graph.json loopBackEdges")

# ---------- 6. rule IDs
ID_SETS = {}


def load_ids(path, listkey):
    p = os.path.join(repo, path)
    if p in JSON:
        ID_SETS[path] = {x["id"] for x in JSON[p][listkey]}


load_ids("vois-tokens/data/vois-rules.json", "rules")
load_ids("vois-patterns/data/patterns-rules.json", "nodes")
load_ids("vois-components/data/components-rules.json", "jobs")
load_ids("vois-dataviz/data/dataviz-rules.json", "rules")
DS = ID_SETS.get("vois-tokens/data/vois-rules.json", set())
PATHN = ID_SETS.get("vois-patterns/data/patterns-rules.json", set())
JOB = ID_SETS.get("vois-components/data/components-rules.json", set())
DV = ID_SETS.get("vois-dataviz/data/dataviz-rules.json", set())
ANTISLOP = set()
_as = os.path.join(repo, "vois-tokens/references/anti-slop.md")
if os.path.exists(_as):
    ANTISLOP = set(re.findall(r"### `\[(DS-SLOP-\d+)\]`", open(_as, encoding="utf8").read()))

ID_RE = re.compile(r"(?<![\w-])((?:DS|PATH|JOB|DV)-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3}|(?:PATH|JOB)-[A-Z0-9]+(?:-[A-Z0-9]+)*)(?![\w-])")
RULE_FILES = ("vois-rules.json", "patterns-rules.json", "components-rules.json", "dataviz-rules.json", "evidence.json")
for f in md_files + list(JSON):
    if skipped(f) or "/design-previews/" in f or os.path.basename(f) in RULE_FILES:
        continue
    text = open(f, encoding="utf8", errors="ignore").read()
    for m in ID_RE.finditer(text):
        i = m.group(1)
        if text[m.end():m.end() + 1] == "*" or text[m.end():m.end() + 2] == "-*" or i in ("PATH-X", "PATH-X-Y"):
            continue
        if i.startswith("DS-SLOP-"):
            if ANTISLOP and i not in ANTISLOP:
                add("ERROR", f, f"cites {i}, which is not defined in vois-tokens/references/anti-slop.md")
            continue
        pool = DS if i.startswith("DS-") else DV if i.startswith("DV-") else PATHN if i.startswith("PATH-") else JOB
        if pool and i not in pool and not any(p.startswith(i + "-") for p in pool):
            add("ERROR", f, f"cites {i}, which does not exist in the rules data")

vc = os.path.join(repo, "vois-loop/data/validate-checklist.json")
if vc in JSON:
    rules = set(DS) | set(DV)
    for cat in JSON[vc]["categories"]:
        for it in cat["items"]:
            for rid in it.get("ruleIds", []):
                if rid.startswith("DS-SLOP-"):
                    if ANTISLOP and rid not in ANTISLOP:
                        add("ERROR", vc, f"category '{cat['category']}' cites {rid}, not defined in anti-slop.md")
                elif rid not in rules:
                    add("ERROR", vc, f"category '{cat['category']}' cites rule {rid} that exists in no rules file")

# ---------- 7. orphans: reference, data, and script files nothing mentions
corpus = ""
for f in md_files + json_files + code_files:
    if os.path.basename(f) == "CHANGELOG.md":
        continue
    corpus += open(f, encoding="utf8", errors="ignore").read() + "\n"
for name, d in sorted(SKILL_DIRS.items()):
    for sub in ("references", "data", "scripts"):
        sd = os.path.join(d, sub)
        if not os.path.isdir(sd):
            continue
        for fn in sorted(os.listdir(sd)):
            if fn.startswith(("__", ".")) or os.path.isdir(os.path.join(sd, fn)) or fn.endswith(".test.mjs"):
                continue
            if fn not in corpus:
                add("WARN", os.path.join(sd, fn), "orphan: no doc, data, or script mentions this file")

# ---------- report
order = {"ERROR": 0, "WARN": 1}
seen, out = set(), []
for f in sorted(findings, key=lambda x: (order[x[0]], x[1], x[2])):
    if f not in seen:
        seen.add(f)
        out.append(f)
errs = [f for f in out if f[0] == "ERROR"]
warns = [f for f in out if f[0] == "WARN"]
print(f"check-routing: {len(SKILLS)} skills, {len(md_files)} docs, {len(json_files)} JSON files, {CROSS} cross-skill relative paths")
for sev, where, msg in out:
    print(f"  {sev:5} {where}: {msg}")
if errs:
    print(f"check-routing: FAILED, {len(errs)} error(s), {len(warns)} warning(s)")
    sys.exit(1)
print(f"check-routing: OK, {len(warns)} warning(s)")
