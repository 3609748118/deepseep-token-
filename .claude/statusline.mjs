#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { homedir } from "os";

// Parse JSON from stdin
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const green = "\x1b[32m";
  const red = "\x1b[31m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";

  // Model
  const model = data.model?.display_name || "Unknown";

  // Git info
  const cwd = data.workspace?.current_dir || ".";
  let gitInfo = "no git";
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (branch) {
      const diff = execSync("git diff --shortstat HEAD", { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
      const addedMatch = diff.match(/(\d+) insertion/);
      const deletedMatch = diff.match(/(\d+) deletion/);
      const added = addedMatch ? addedMatch[1] : "0";
      const deleted = deletedMatch ? deletedMatch[1] : "0";
      gitInfo = `branch ${branch} ${green}+${added}${reset}/${red}-${deleted}${reset}`;
    }
  } catch {}

  // Context bar
  const usedPct = data.context_window?.used_percentage || 0;
  const usedInt = Math.floor(usedPct);
  const barFilled = Math.min(20, Math.floor(usedInt / 5));
  const barEmpty = 20 - barFilled;
  const bar = "█".repeat(barFilled) + "░".repeat(barEmpty);
  const barColor = usedInt < 50 ? green : usedInt < 80 ? yellow : red;
  const contextBar = `context ${barColor}${bar}${reset} ${usedInt}%`;

  // Cost data (from ccusage, cached 5 min)
  let costStr = "cost --";
  let timeStr = "time --";
  const cacheFile = join(homedir(), ".claude", "ccusage-cache.json");
  const cacheAge = 300;

  let needsRefresh = true;
  if (existsSync(cacheFile)) {
    const st = statSync(cacheFile);
    const mtime = Math.floor(st.mtimeMs / 1000);
    const now = Math.floor(Date.now() / 1000);
    if (now - mtime < cacheAge) needsRefresh = false;
  }

  if (needsRefresh) {
    try {
      const out = execSync("ccusage blocks --json", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
      if (out) {
        JSON.parse(out); // validate
        writeFileSync(cacheFile, out);
      }
    } catch {}
  }

  if (existsSync(cacheFile)) {
    try {
      const cache = JSON.parse(readFileSync(cacheFile, "utf8"));
      const blocks = cache.blocks || [];
      const active = blocks.filter((b) => b.isActive).pop() || blocks[blocks.length - 1];
      if (active) {
        costStr = `cost $${(active.costUSD || 0).toFixed(2)} spent`;
        if (active.endTime) {
          const endMs = new Date(active.endTime).getTime();
          const nowMs = Date.now();
          const diff = Math.max(0, Math.floor((endMs - nowMs) / 1000));
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          timeStr = diff > 0 ? `time ${h}h ${m}m until reset` : "time resetting...";
        }
      }
    } catch {}
  }

  // Output (2 lines for Claude Code statusLine)
  console.log(`model ${model}   ${gitInfo}   ${contextBar}`);
  console.log(`${costStr}   ${timeStr}`);
});
