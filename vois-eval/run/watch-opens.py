#!/usr/bin/env python3
"""Logs every file open under a harness root to <root>/opens.jsonl, for subagent-harness.mjs (Linux inotify, no dependencies).

  watch-opens.py <root> [--outside DIR ...]

Watches every <root>/*/work directory tree. Directories passed with --outside (held-out files, the eval folder) are
watched too and their opens are logged with "outside": true; any such open during a run means a subagent looked
where it should not. Stop it with SIGTERM or Ctrl-C after the last subagent has finished.
"""
import ctypes, ctypes.util, json, os, struct, sys, time

IN_OPEN, IN_ISDIR, IN_CREATE = 0x20, 0x40000000, 0x100
libc = ctypes.CDLL(ctypes.util.find_library("c"), use_errno=True)
fd = libc.inotify_init()
wd_path, outside_wds = {}, set()


def add(path, outside=False):
    wd = libc.inotify_add_watch(fd, path.encode(), IN_OPEN | IN_CREATE)
    if wd >= 0:
        wd_path[wd] = path
        if outside:
            outside_wds.add(wd)


def add_tree(top):
    for d, _, _ in os.walk(top):
        add(d)


root = os.path.abspath(sys.argv[1])
outs = [os.path.abspath(sys.argv[i + 1]) for i, a in enumerate(sys.argv) if a == "--outside"]
for run in sorted(os.listdir(root)):
    work = os.path.join(root, run, "work")
    if os.path.isdir(work):
        add_tree(work)
for o in outs:
    add(o, outside=True)

log = open(os.path.join(root, "opens.jsonl"), "a", buffering=1)
print(f"watching {len(wd_path)} directories under {root}", flush=True)
while True:
    buf = os.read(fd, 65536)
    i = 0
    while i < len(buf):
        wd, mask, _, ln = struct.unpack_from("iIII", buf, i)
        name = buf[i + 16:i + 16 + ln].split(b"\0", 1)[0].decode(errors="replace")
        i += 16 + ln
        base = wd_path.get(wd)
        if base is None:
            continue
        path = os.path.join(base, name) if name else base
        if mask & IN_CREATE and mask & IN_ISDIR and wd not in outside_wds:
            add(path)
        if mask & IN_OPEN:
            log.write(json.dumps({"t": int(time.time() * 1000), "path": path, "isdir": bool(mask & IN_ISDIR), "outside": wd in outside_wds}) + "\n")
