import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartType, ViewMode, DailyUsagePoint, MonthlyUsagePoint } from "../../types";
import { formatTokens, formatCost, formatDate, formatMonth } from "../../utils/format";
import styles from "./UsageChart.module.css";

interface ChartDataPoint {
  label: string;
  输入: number;
  输出: number;
  缓存命中: number;
  缓存未命中: number;
  estimated_cost: number;
}

interface UsageChartProps {
  chartType: ChartType;
  viewMode: ViewMode;
  dailyData: DailyUsagePoint[];
  monthlyData: MonthlyUsagePoint[];
}

function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div>输入: {formatNum(d.输入)}</div>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        缓存命中 {formatNum(d.缓存命中)} + 未命中 {formatNum(d.缓存未命中)}
      </div>
      <div>输出: {formatNum(d.输出)}</div>
      <div style={{ marginTop: 4, borderTop: "1px solid #e5e7eb", paddingTop: 4 }}>
        费用: {formatCost(d.estimated_cost)}
      </div>
    </div>
  );
}

export default function UsageChart({
  chartType,
  viewMode,
  dailyData,
  monthlyData,
}: UsageChartProps) {
  const data: ChartDataPoint[] =
    viewMode === "daily"
      ? dailyData.map((d) => ({
          label: formatDate(d.date),
          输入: d.cache_hit_tokens + d.cache_miss_tokens,
          输出: d.completion_tokens,
          缓存命中: d.cache_hit_tokens,
          缓存未命中: d.cache_miss_tokens,
          estimated_cost: d.estimated_cost,
        }))
      : monthlyData.map((d) => ({
          label: formatMonth(d.month),
          输入: d.cache_hit_tokens + d.cache_miss_tokens,
          输出: d.completion_tokens,
          缓存命中: d.cache_hit_tokens,
          缓存未命中: d.cache_miss_tokens,
          estimated_cost: d.estimated_cost,
        }));

  if (!data.length) {
    return <div className={styles.empty}>暂无数据</div>;
  }

  const yMax = viewMode === "monthly" ? 100_000_000 : "auto";

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={360}>
        {chartType === "bar" ? (
          <BarChart data={data} barCategoryGap={0} barGap={0} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={false} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
            <YAxis domain={[0, yMax]} tickFormatter={formatTokens} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="输入" stackId="a" fill="#818CF8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="输出" stackId="a" fill="#4F46E5" radius={[0, 0, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={false} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
            <YAxis domain={[0, yMax]} tickFormatter={formatTokens} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="输入" stroke="#818CF8" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="输出" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
