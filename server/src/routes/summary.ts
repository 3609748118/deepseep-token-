import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/summary", (_req, res) => {
  const todayRow = db
    .prepare(
      `SELECT
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(prompt_tokens), 0) as prompt_tokens,
        COALESCE(SUM(completion_tokens), 0) as completion_tokens,
        COALESCE(SUM(actual_cost), 0) as estimated_cost,
        COUNT(*) as request_count
      FROM token_usage
      WHERE date(recorded_at) = date('now', 'localtime')`
    )
    .get() as any;

  const monthRow = db
    .prepare(
      `SELECT
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(prompt_tokens), 0) as prompt_tokens,
        COALESCE(SUM(completion_tokens), 0) as completion_tokens,
        COALESCE(SUM(actual_cost), 0) as estimated_cost,
        COUNT(*) as request_count
      FROM token_usage
      WHERE strftime('%Y-%m', recorded_at) = strftime('%Y-%m', 'now', 'localtime')`
    )
    .get() as any;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const lastRefresh = db
    .prepare("SELECT recorded_at FROM token_usage ORDER BY id DESC LIMIT 1")
    .get() as { recorded_at: string } | undefined;

  res.json({
    today: {
      ...todayRow,
      estimated_cost: round2(todayRow.estimated_cost),
    },
    month: {
      ...monthRow,
      estimated_cost: round2(monthRow.estimated_cost),
    },
    last_refresh: lastRefresh?.recorded_at || null,
  });
});

export default router;
