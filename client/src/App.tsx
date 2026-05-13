import { useState, useEffect, useCallback } from "react";
import type {
  ApiSummaryResponse,
  DailyUsagePoint,
  MonthlyUsagePoint,
  ViewMode,
  ChartType,
  DailyRange,
  MonthlyRange,
} from "./types";
import {
  fetchSummary,
  fetchDailyUsage,
  fetchMonthlyUsage,
} from "./api/client";
import { useCountdown } from "./hooks/useCountdown";
import Header from "./components/Header/Header";
import SummaryCards from "./components/SummaryCards/SummaryCards";
import ViewSwitcher from "./components/ViewSwitcher/ViewSwitcher";
import UsageChart from "./components/UsageChart/UsageChart";
import UsageTable from "./components/UsageTable/UsageTable";
import styles from "./App.module.css";

export default function App() {
  const [summary, setSummary] = useState<ApiSummaryResponse | null>(null);
  const [dailyData, setDailyData] = useState<DailyUsagePoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyUsagePoint[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [dailyRange, setDailyRange] = useState<DailyRange>(7);
  const [monthlyRange, setMonthlyRange] = useState<MonthlyRange>(6);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const countdownSeconds = useCountdown(lastRefresh);

  const loadSummary = useCallback(async () => {
    try {
      const s = await fetchSummary();
      setSummary(s);
      setError(null);
    } catch {
      setError("获取汇总数据失败");
    }
  }, []);

  const loadDaily = useCallback(async (range: DailyRange) => {
    try {
      const d = await fetchDailyUsage(range);
      setDailyData(d);
      setError(null);
    } catch {
      setError("获取日用量数据失败");
    }
  }, []);

  const loadMonthly = useCallback(async (range: MonthlyRange) => {
    try {
      const d = await fetchMonthlyUsage(range);
      setMonthlyData(d);
      setError(null);
    } catch {
      setError("获取月用量数据失败");
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadDaily(dailyRange);
  }, [loadSummary, loadDaily, dailyRange]);

  useEffect(() => {
    if (viewMode === "monthly" && !monthlyData.length) {
      loadMonthly(monthlyRange);
    }
  }, [viewMode, monthlyRange, monthlyData.length, loadMonthly]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadSummary(),
      viewMode === "daily" ? loadDaily(dailyRange) : loadMonthly(monthlyRange),
    ]);
    setIsRefreshing(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    if (countdownSeconds === 0 && lastRefresh) {
      loadSummary();
      if (viewMode === "daily") loadDaily(dailyRange);
      else loadMonthly(monthlyRange);
    }
  }, [countdownSeconds]);

  useEffect(() => {
    if (summary?.last_refresh) {
      const t = new Date(summary.last_refresh);
      t.setMinutes(t.getMinutes() + 5);
      setLastRefresh(t);
    }
  }, [summary?.last_refresh]);

  return (
    <div className={styles.app}>
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        countdownSeconds={countdownSeconds}
      />
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      <main className={styles.main}>
        <SummaryCards today={summary?.today ?? null} month={summary?.month ?? null} />
        <ViewSwitcher
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dailyRange={dailyRange}
          onDailyRangeChange={(r) => { setDailyRange(r); loadDaily(r); }}
          monthlyRange={monthlyRange}
          onMonthlyRangeChange={(r) => { setMonthlyRange(r); loadMonthly(r); }}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
        <UsageChart
          chartType={chartType}
          viewMode={viewMode}
          dailyData={dailyData}
          monthlyData={monthlyData}
        />
        <UsageTable
          data={viewMode === "daily" ? dailyData : monthlyData}
          viewMode={viewMode}
        />
      </main>
    </div>
  );
}
