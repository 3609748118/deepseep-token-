import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readCsv(path: string) {
  return readFileSync(path, "utf-8")
    .replace(/^﻿/, "")
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => line.split(","));
}

// Convert UTC date string to local date (UTC+8)
function toLocal(utcDate: string): string {
  const [y, m, d] = utcDate.split("-").map(Number);
  const local = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const yy = local.getFullYear();
  const mm = String(local.getMonth() + 1).padStart(2, "0");
  const dd = String(local.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Read cost data for actual costs
const costRows = readCsv(resolve(__dirname, "../../cost-2026-5.csv"));
const costMap = new Map<string, number>(); // key: "date|model"
for (const r of costRows) {
  const localDate = toLocal(r[1]);
  costMap.set(`${localDate}|${r[2]}`, parseFloat(r[4]));
}

// Read amount data for token breakdown
const amountRows = readCsv(resolve(__dirname, "../../amount-2026-5.csv"));

// Aggregate: date|model -> tokens
const groups = new Map<string, {
  date: string;
  model: string;
  cache_hit: number;
  cache_miss: number;
  completion: number;
  requests: number;
}>();

for (const r of amountRows) {
  const [userId, utcDate, model, , , type, , amount] = r;
  const date = toLocal(utcDate);
  const key = `${date}|${model}`;
  if (!groups.has(key)) {
    groups.set(key, { date, model, cache_hit: 0, cache_miss: 0, completion: 0, requests: 0 });
  }
  const g = groups.get(key)!;
  const amt = parseInt(amount, 10) || 0;

  if (type === "output_tokens") g.completion += amt;
  else if (type === "input_cache_hit_tokens") g.cache_hit += amt;
  else if (type === "input_cache_miss_tokens") g.cache_miss += amt;
  else if (type === "request_count") g.requests += amt;
}

// Clear old imported data and re-import
db.prepare("DELETE FROM token_usage WHERE request_id LIKE 'import-%'").run();

const insert = db.prepare(`
  INSERT OR REPLACE INTO token_usage
    (request_id, model, prompt_tokens, completion_tokens, cache_hit_tokens, cache_miss_tokens, total_tokens, actual_cost, recorded_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let total = 0;
const doImport = db.transaction(() => {
  for (const g of groups.values()) {
    const requestId = `import-${g.date}-${g.model}`;
    const actualCost = costMap.get(`${g.date}|${g.model}`) || 0;
    insert.run(
      requestId, g.model,
      g.cache_hit + g.cache_miss, // prompt_tokens
      g.completion,
      g.cache_hit,
      g.cache_miss,
      g.cache_hit + g.cache_miss + g.completion,
      actualCost,
      g.date
    );
    total++;
  }
});
doImport();

console.log(`Re-imported ${total} records with actual costs`);
