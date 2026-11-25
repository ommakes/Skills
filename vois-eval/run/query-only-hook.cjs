#!/usr/bin/env node
// PreToolUse hook for the retrieval arm. The CLI's own allow rule, `Bash(node skills/.../query.mjs:*)`, is a prefix match,
// and a command that starts with it can carry on with `; grep ...` and run. So the run directory also gets this hook:
// a Bash command is allowed only if the whole string is one plain call to query.mjs. No quotes, pipes, `;`, `&`,
// redirects, `$`, backticks, parentheses or newlines. Anything else exits 2, which blocks the call.
const QUERY = /^node skills\/vois-components\/scripts\/query\.mjs(?: (?:--[a-z]+|[A-Za-z0-9_.:-]+))*$/;
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let cmd;
  try { cmd = JSON.parse(raw)?.tool_input?.command; } catch { cmd = undefined; }
  if (typeof cmd === "string" && QUERY.test(cmd)) process.exit(0);
  process.stderr.write("Only a single plain `node skills/vois-components/scripts/query.mjs ...` command is allowed here. No pipes, `;`, quotes or other commands.\n");
  process.exit(2);
});
