export interface SummaryData {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  request_count: number;
  estimated_cost: number;
}

export interface ApiSummaryResponse {
  today: SummaryData;
  month: SummaryData;
  last_refresh: string | null;
}

export interface DailyUsagePoint {
  date: string;
  total_tokens: number;
  cache_hit_tokens: number;
  cache_miss_tokens: number;
  completion_tokens: number;
  request_count: number;
  estimated_cost: number;
}

export interface MonthlyUsagePoint {
  month: string;
  total_tokens: number;
  cache_hit_tokens: number;
  cache_miss_tokens: number;
  completion_tokens: number;
  request_count: number;
  estimated_cost: number;
}

export interface RefreshResponse {
  success: boolean;
  records_inserted: number;
  message: string;
}

export type ViewMode = "daily" | "monthly";
export type ChartType = "bar" | "line";
export type DailyRange = 7 | 14 | 30;
export type MonthlyRange = 3 | 6 | 12;
export type SortField = "date" | "total_tokens" | "request_count" | "estimated_cost";
export type SortDirection = "asc" | "desc";
