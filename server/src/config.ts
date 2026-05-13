import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "../../.env") });

export const CONFIG = {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
  PORT: parseInt(process.env.PORT || "3001", 10),
  DB_PATH: resolve(__dirname, "../data/usage.db"),

  // Pricing per model: ¥ / million tokens
  // Reference: https://api-docs.deepseek.com/quick_start/pricing
  PRICING: {
    "deepseek-v4-pro": {
      cache_hit: 0.025,
      cache_miss: 3.00,
      output: 6.00,
    },
    "deepseek-v4-flash": {
      cache_hit: 0.02,
      cache_miss: 1.00,
      output: 2.00,
    },
    // fallback for unknown models
    _default: {
      cache_hit: 0.025,
      cache_miss: 1.00,
      output: 2.00,
    },
  } as Record<string, { cache_hit: number; cache_miss: number; output: number }>,
};
