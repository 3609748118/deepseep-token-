import { Router } from "express";
import db from "./db.js";
import { CONFIG } from "./config.js";

const DEEPSEEK_BASE = "https://api.deepseek.com";

function todayStr(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function calcCost(model: string, cacheHit: number, cacheMiss: number, output: number): number {
  const p = CONFIG.PRICING[model] || CONFIG.PRICING._default;
  return (
    (cacheHit / 1_000_000) * p.cache_hit +
    (cacheMiss / 1_000_000) * p.cache_miss +
    (output / 1_000_000) * p.output
  );
}

function saveUsage(record: {
  request_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cache_hit_tokens: number;
  cache_miss_tokens: number;
  total_tokens: number;
  actual_cost: number;
}) {
  db.prepare(`
    INSERT OR IGNORE INTO token_usage
      (request_id, model, prompt_tokens, completion_tokens, cache_hit_tokens, cache_miss_tokens, total_tokens, actual_cost, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.request_id, record.model, record.prompt_tokens, record.completion_tokens,
    record.cache_hit_tokens, record.cache_miss_tokens, record.total_tokens,
    Math.round(record.actual_cost * 10000) / 10000,
    todayStr()
  );
}

function extractAndSave(json: any) {
  if (!json?.usage || !json?.id) return;
  const u = json.usage;

  // Handle both API response formats:
  // v4: prompt_cache_hit_tokens / prompt_cache_miss_tokens at top level
  // or nested: prompt_tokens_details.cached_tokens
  let cacheHit = u.prompt_cache_hit_tokens || 0;
  let cacheMiss = u.prompt_cache_miss_tokens || 0;

  if (!cacheHit && !cacheMiss && u.prompt_tokens_details) {
    cacheHit = u.prompt_tokens_details.cached_tokens || 0;
    cacheMiss = (u.prompt_tokens || 0) - cacheHit;
  }

  const model = json.model || "unknown";

  saveUsage({
    request_id: json.id,
    model,
    prompt_tokens: u.prompt_tokens || 0,
    completion_tokens: u.completion_tokens || 0,
    cache_hit_tokens: cacheHit,
    cache_miss_tokens: cacheMiss,
    total_tokens: u.total_tokens || 0,
    actual_cost: calcCost(model, cacheHit, cacheMiss, u.completion_tokens || 0),
  });
}

const router = Router();

router.all("/proxy/{*path}", async (req, res) => {
  const path = req.originalUrl.replace("/proxy/", "");
  const targetUrl = `${DEEPSEEK_BASE}/${path}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.DEEPSEEK_API_KEY}`,
    };

    const body = req.method !== "GET" ? JSON.stringify(req.body) : undefined;

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const isStream = req.body?.stream === true;
    const isChatCompletions = path.includes("chat/completions");

    if (isStream && isChatCompletions) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = upstream.body?.getReader();
      if (!reader) {
        res.status(500).json({ error: "No response body" });
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.usage) extractAndSave(json);
              } catch { /* skip */ }
            }
          }

          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
      }
      res.end();
    } else {
      const text = await upstream.text();
      res.status(upstream.status).setHeader("Content-Type", "application/json");

      if (upstream.ok && isChatCompletions) {
        try {
          const json = JSON.parse(text);
          extractAndSave(json);
        } catch { /* pass through */ }
      } else if (!upstream.ok) {
        console.error(`[proxy] Upstream error ${upstream.status}:`, text.slice(0, 500));
      }

      res.send(text);
    }
  } catch (err) {
    console.error("[proxy] Error:", err);
    res.status(502).json({ error: "Proxy error" });
  }
});

export default router;
