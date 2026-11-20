#!/usr/bin/env node
// Serves harness/dist for the rendered check. Every path that is not app.js or app.css answers with index.html, and
// the page picks its story from the path. PORT sets the port (default 3000). Never use it outside CI or local checks:
// it has no auth and no caching rules.

import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "dist");
const TYPES = { "/app.js": "text/javascript; charset=utf-8", "/app.css": "text/css; charset=utf-8" };

export function pick(url) {
  // Plain string handling, not URL parsing: a target like //host/app.js must not be read as a host.
  const path = String(url).split(/[?#]/, 1)[0];
  return Object.hasOwn(TYPES, path) ? { file: path.slice(1), type: TYPES[path] } : { file: "index.html", type: "text/html; charset=utf-8" };
}

// Start only when this file is run, so a test can import pick() without opening a port.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!existsSync(join(dist, "index.html"))) {
    console.error("harness/dist is missing. Run: node harness/build.mjs");
    process.exit(1);
  }
  const port = Number(process.env.PORT ?? 3000);
  createServer((req, res) => {
    const { file, type } = pick(req.url ?? "/");
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    res.end(readFileSync(join(dist, file)));
  }).listen(port, () => console.log(`Harness on http://localhost:${port}`));
}
