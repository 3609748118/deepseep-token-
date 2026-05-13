import { Router } from "express";
import db from "../db.js";
import { fetchUsageData } from "../deepseek.js";

const router = Router();

router.post("/refresh", async (_req, res) => {
  try {
    const count = await fetchUsageData(db);
    res.json({
      success: true,
      records_inserted: count,
      message: count > 0 ? `Inserted ${count} new records` : "No new records",
    });
  } catch {
    res.status(502).json({
      success: false,
      records_inserted: 0,
      message: "Failed to fetch from DeepSeek API",
    });
  }
});

export default router;
