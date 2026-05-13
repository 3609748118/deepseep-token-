import cron from "node-cron";
import type Database from "better-sqlite3";
import { CONFIG } from "./config.js";
import { fetchUsageData } from "./deepseek.js";

let lastFetchTime: Date | null = null;

export function getLastFetchTime(): Date | null {
  return lastFetchTime;
}

export function startCronJob(db: Database.Database): void {
  const run = async () => {
    await fetchUsageData(db);
    lastFetchTime = new Date();
  };

  run();
  cron.schedule(CONFIG.CRON_INTERVAL, run);
  console.log(`[cron] Scheduled every 5 minutes`);
}
