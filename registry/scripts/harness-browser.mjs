// Shared setup for the real-browser tests of single harness items (drawer, carousel, resizable). It finds `playwright`
// and a Chromium, builds harness/dist, serves it on a free port, and hands back a launched browser. Without Playwright or
// Chromium the tests are skipped, never passed. input-otp.test.mjs has its own copy of this and is left as it was.
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

const playwright = (() => {
  for (const from of [import.meta.url, resolve(registryDir, "..", "package.json")]) {
    try { return createRequire(from)("playwright"); } catch { /* try the next place */ }
  }
  return null;
})();

const browserOk = (() => {
  if (!playwright) return false;
  const r = spawnSync(process.execPath, ["-e", "const p=require('playwright');p.chromium.launch().then(b=>b.close()).then(()=>process.exit(0),()=>process.exit(1))"], { stdio: "ignore", cwd: registryDir });
  return r.status === 0;
})();

/** A reason string for node:test's `skip` option, or false when the browser tests can run. */
export const skip = browserOk ? false : "playwright or its Chromium is not installed here, so the real-browser tests did not run";

function freePort() {
  return new Promise((ok, fail) => {
    const s = createServer();
    s.once("error", fail);
    s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => ok(port)); });
  });
}

/** Builds and serves the harness, launches Chromium. Returns { base, browser, stop }. */
export async function start() {
  const built = spawnSync(process.execPath, ["harness/build.mjs"], { cwd: registryDir, encoding: "utf8" });
  if (built.status !== 0) throw new Error(built.stderr || built.stdout);
  const port = await freePort();
  const server = spawn(process.execPath, ["harness/serve.mjs"], { cwd: registryDir, env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  const browser = await playwright.chromium.launch();
  return { base, browser, stop: async () => { await browser.close(); server.kill(); } };
}
