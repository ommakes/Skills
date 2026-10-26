#!/usr/bin/env node
// A stand-in for the `claude` CLI, used by run.test.mjs. It records its arguments, optionally writes
// ./out.tsx, and prints the stream-json events given in the FAKE_CLAUDE environment variable.
const fs = require("fs");
const cfg = JSON.parse(process.env.FAKE_CLAUDE || "{}");
fs.writeFileSync("argv.json", JSON.stringify(process.argv.slice(2)));
if (cfg.writeFile) fs.writeFileSync("out.tsx", cfg.writeFile);
if (cfg.sleepMs) setTimeout(() => {}, cfg.sleepMs);
else for (const e of cfg.events ?? []) console.log(JSON.stringify(e));
