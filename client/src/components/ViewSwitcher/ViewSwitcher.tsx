import type { ViewMode, ChartType, DailyRange, MonthlyRange } from "../../types";
import styles from "./ViewSwitcher.module.css";

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  dailyRange: DailyRange;
  onDailyRangeChange: (range: DailyRange) => void;
  monthlyRange: MonthlyRange;
  onMonthlyRangeChange: (range: MonthlyRange) => void;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

export default function ViewSwitcher({
  viewMode,
  onViewModeChange,
  dailyRange,
  onDailyRangeChange,
  monthlyRange,
  onMonthlyRangeChange,
  chartType,
  onChartTypeChange,
}: ViewSwitcherProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${viewMode === "daily" ? styles.active : ""}`}
          onClick={() => onViewModeChange("daily")}
        >
          日用量视图
        </button>
        <button
          className={`${styles.tab} ${viewMode === "monthly" ? styles.active : ""}`}
          onClick={() => onViewModeChange("monthly")}
        >
          月用量视图
        </button>
      </div>

      {viewMode === "daily" ? (
        <select
          className={styles.select}
          value={dailyRange}
          onChange={(e) => onDailyRangeChange(Number(e.target.value) as DailyRange)}
        >
          <option value={7}>近 7 天</option>
          <option value={14}>近 14 天</option>
          <option value={30}>近 30 天</option>
        </select>
      ) : (
        <select
          className={styles.select}
          value={monthlyRange}
          onChange={(e) => onMonthlyRangeChange(Number(e.target.value) as MonthlyRange)}
        >
          <option value={3}>近 3 个月</option>
          <option value={6}>近 6 个月</option>
          <option value={12}>近 12 个月</option>
        </select>
      )}

      <div className={styles.chartToggle}>
        <button
          className={`${styles.chartBtn} ${chartType === "bar" ? styles.chartActive : ""}`}
          onClick={() => onChartTypeChange("bar")}
        >
          柱状图
        </button>
        <button
          className={`${styles.chartBtn} ${chartType === "line" ? styles.chartActive : ""}`}
          onClick={() => onChartTypeChange("line")}
        >
          折线图
        </button>
      </div>
    </div>
  );
}
