import type Database from "better-sqlite3";
import { CONFIG } from "./config.js";

interface UsageRecord {
  request_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

function todayStr(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export async function fetchUsageData(db: Database.Database): Promise<number> {
  if (!CONFIG.DEEPSEEK_API_KEY) {
    console.warn("[deepseek] DEEPSEEK_API_KEY not set, skipping fetch");
    return 0;
  }

  const today = todayStr();
  const url = `${CONFIG.DEEPSEEK_USAGE_URL}?start_date=${today}&end_date=${today}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${CONFIG.DEEPSEEK_API_KEY}` },
    });

    const text = await res.text();

    if (!res.ok) {
      console.error(`[deepseek] API error ${res.status}: ${text}`);
      console.error(`[deepseek] Response headers:`, JSON.stringify(Object.fromEntries(res.headers.entries())));
      return 0;
    }

    console.log(`[deepseek] Raw response (first 500 chars):`, text.slice(0, 500));
    const json = JSON.parse(text);

    if (!json.data || !Array.isArray(json.data)) {
      console.error(`[deepseek] Unexpected response structure, keys:`, Object.keys(json));
      console.error(`[deepseek] Full response:`, text.slice(0, 1000));
      return 0;
    }

    const records: UsageRecord[] = json.data;

    const insert = db.prepare(`
      INSERT OR IGNORE INTO token_usage
        (request_id, model, prompt_tokens, completion_tokens, total_tokens, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    const insertMany = db.transaction(() => {
      for (const r of records) {
        const result = insert.run(
          r.request_id,
          r.model,
          r.prompt_tokens,
          r.completion_tokens,
          r.total_tokens,
          today
        );
        if (result.changes > 0) inserted++;
      }
    });
    insertMany();

    console.log(`[deepseek] Fetched ${records.length} records, inserted ${inserted} new`);
    return inserted;
  } catch (err) {
    console.error("[deepseek] Fetch failed:", err);
    return 0;
  }
}
