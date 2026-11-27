#!/usr/bin/env node
// Builds the accessibility harness: a small app that renders every registry component and its states, one page
// each, so the rendered check (vois-loop/scripts/render-check.mjs, private repo only) has something to open. It is a dev tool for this
// repo's CI. It is not a registry item and nothing in it reaches a consumer.
//
//   node harness/build.mjs             writes harness/dist/ (app.js, app.css, index.html), which git ignores
//   node harness/build.mjs --manifest  rewrites vois-render.json from the stories
//
// The components import `@/components/ui/<name>` and `@/lib/<name>`, which only resolve inside a consumer app. This
// build resolves them from the install targets in registry.json, so the harness always renders the files the registry
// ships, not a copy. `@/lib/utils` (shadcn's cn) is the one file that is not a registry file; it is harness/src/lib/utils.ts.

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const registryDir = resolve(here, "..");
const dist = join(here, "dist");

/** `@/<install target without its extension>` -> the registry file that installs there. */
export function aliasMap(registry) {
  const map = new Map();
  for (const item of registry.items) {
    for (const f of item.files ?? []) {
      if (typeof f.target !== "string" || !/\.(?:tsx?|ts)$/.test(f.target)) continue;
      const key = `@/${f.target.replace(/\.tsx?$/, "")}`;
      if (map.has(key)) throw new Error(`two registry files install to ${f.target}`);
      map.set(key, join(registryDir, f.path));
    }
  }
  map.set("@/lib/utils", join(here, "src", "lib", "utils.ts"));
  return map;
}

function readRegistry() {
  return JSON.parse(readFileSync(join(registryDir, "registry.json"), "utf8"));
}

function aliasPlugin(aliases) {
  return {
    name: "vois-alias",
    setup(b) {
      b.onResolve({ filter: /^@\// }, (args) => {
        const path = aliases.get(args.path);
        if (!path) return { errors: [{ text: `"${args.path}" is not a registry install target. Add its item to registry.json or fix the import.` }] };
        return { path };
      });
    },
  };
}

/** The story ids and their extra states, read by bundling the stories for node. The page and the manifest both come from this list. */
export async function storyList() {
  const tmp = mkdtempSync(join(tmpdir(), "vois-harness-"));
  try {
    const out = join(tmp, "stories.mjs");
    await build({
      entryPoints: [join(here, "src", "stories", "index.ts")],
      outfile: out,
      bundle: true,
      format: "esm",
      platform: "node",
      jsx: "automatic",
      plugins: [aliasPlugin(aliasMap(readRegistry()))],
      logLevel: "silent",
    });
    const { STORIES } = await import(pathToFileURL(out).href);
    return Object.entries(STORIES).map(([id, s]) => ({ id, title: s.title, items: s.items, states: s.states ?? {} }));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/** vois-render.json for the harness: one surface per story, and each extra state in both themes. */
export function manifestFor(stories) {
  return {
    baseUrl: "http://localhost:3000",
    // These are components, not screens, so the empty, loading and error screen states do not apply.
    requiredStates: [],
    surfaces: stories.map(({ id, states }) => ({
      id,
      path: `/${id}`,
      ...(Object.keys(states).length
        ? {
            states: Object.entries(states).flatMap(([name, { expect }]) => [
              { id: name, path: `/${id}?state=${name}&theme=light`, expect },
              { id: `${name}-dark`, path: `/${id}?state=${name}&theme=dark`, expect },
            ]),
          }
        : {}),
    })),
  };
}

export async function buildHarness() {
  const aliases = aliasMap(readRegistry());
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  const resolveAlias = aliasPlugin(aliases);

  await build({
    entryPoints: [join(here, "src", "main.tsx")],
    outfile: join(dist, "app.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [resolveAlias],
    logLevel: "warning",
  });

  const tailwind = join(registryDir, "node_modules", "@tailwindcss", "cli", "dist", "index.mjs");
  execFileSync(process.execPath, [tailwind, "-i", join(here, "src", "app.css"), "-o", join(dist, "app.css")], { cwd: here, stdio: ["ignore", "ignore", "inherit"] });

  writeFileSync(join(dist, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vois registry harness</title>
<link rel="stylesheet" href="/app.css">
</head>
<body>
<div id="root"></div>
<script src="/app.js"></script>
</body>
</html>
`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--manifest")) {
    // Rewrites registry/vois-render.json from the stories. Run it after adding or removing a story or a state.
    writeFileSync(join(registryDir, "vois-render.json"), JSON.stringify(manifestFor(await storyList()), null, 2) + "\n");
    console.log("Wrote registry/vois-render.json");
  } else {
    await buildHarness();
    console.log("Built harness/dist");
  }
}
