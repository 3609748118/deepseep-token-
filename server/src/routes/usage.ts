import { Router } from "express";
import db from "../db.js";

const router = Router();

const VALID_DAYS = new Set([7, 14, 30]);
const VALID_MONTHS = new Set([3, 6, 12]);

router.get("/usage/daily", (req, res) => {
  const raw = parseInt(req.query.days as string, 10);
  const days = VALID_DAYS.has(raw) ? raw : 7;

  const rows = db
    .prepare(
      `SELECT
        date(recorded_at) as date,
        SUM(total_tokens) as total_tokens,
        SUM(cache_hit_tokens) as cache_hit_tokens,
        SUM(cache_miss_tokens) as cache_miss_tokens,
        SUM(completion_tokens) as completion_tokens,
        SUM(actual_cost) as estimated_cost,
        COUNT(*) as request_count
      FROM token_usage
      WHERE recorded_at >= date('now', '-${days} days', 'localtime')
      GROUP BY date(recorded_at)
      ORDER BY date ASC`
    )
    .all() as any[];

  res.json({
    data: rows.map((r) => ({
      ...r,
      estimated_cost: Math.round(r.estimated_cost * 100) / 100,
    })),
  });
});

router.get("/usage/monthly", (req, res) => {
  const raw = parseInt(req.query.months as string, 10);
  const months = VALID_MONTHS.has(raw) ? raw : 6;

  // Generate months from this month backwards
  const monthList: string[] = [];
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthList.push(ym);
  }

  const dbRows = db
    .prepare(
      `SELECT
        strftime('%Y-%m', recorded_at) as month,
        SUM(total_tokens) as total_tokens,
        SUM(cache_hit_tokens) as cache_hit_tokens,
        SUM(cache_miss_tokens) as cache_miss_tokens,
        SUM(completion_tokens) as completion_tokens,
        SUM(actual_cost) as estimated_cost,
        COUNT(*) as request_count
      FROM token_usage
      WHERE recorded_at >= date('now', '-${months} months', 'localtime')
      GROUP BY month
      ORDER BY month ASC`
    )
    .all() as any[];

  const dbMap = new Map(dbRows.map((r) => [r.month, r]));

  // Fill in empty months
  const data = monthList.map((month) => {
    const r = dbMap.get(month);
    return r
      ? { ...r, estimated_cost: Math.round(r.estimated_cost * 100) / 100 }
      : { month, total_tokens: 0, cache_hit_tokens: 0, cache_miss_tokens: 0, completion_tokens: 0, estimated_cost: 0, request_count: 0 };
  });

  res.json({ data });
});

export default router;
