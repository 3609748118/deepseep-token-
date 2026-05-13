import type {
  ApiSummaryResponse,
  DailyUsagePoint,
  MonthlyUsagePoint,
  RefreshResponse,
  DailyRange,
  MonthlyRange,
} from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function fetchSummary(): Promise<ApiSummaryResponse> {
  const res = await fetch(`${BASE}/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchDailyUsage(
  days: DailyRange
): Promise<DailyUsagePoint[]> {
  const res = await fetch(`${BASE}/usage/daily?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch daily usage");
  const json = await res.json();
  return json.data;
}

export async function fetchMonthlyUsage(
  months: MonthlyRange
): Promise<MonthlyUsagePoint[]> {
  const res = await fetch(`${BASE}/usage/monthly?months=${months}`);
  if (!res.ok) throw new Error("Failed to fetch monthly usage");
  const json = await res.json();
  return json.data;
}

export async function triggerRefresh(): Promise<RefreshResponse> {
  const res = await fetch(`${BASE}/refresh`, { method: "POST" });
  return res.json();
}
