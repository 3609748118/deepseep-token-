import { useState, useMemo } from "react";
import type {
  DailyUsagePoint,
  MonthlyUsagePoint,
  ViewMode,
  SortField,
  SortDirection,
} from "../../types";
import { formatTokens, formatCost, formatDate, formatMonth } from "../../utils/format";
import styles from "./UsageTable.module.css";

interface UsageTableProps {
  data: (DailyUsagePoint | MonthlyUsagePoint)[];
  viewMode: ViewMode;
}

export default function UsageTable({ data, viewMode }: UsageTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    const d = [...data];
    d.sort((a, b) => {
      let va: string | number, vb: string | number;
      if (sortField === "date") {
        va = viewMode === "daily" ? (a as DailyUsagePoint).date : (a as MonthlyUsagePoint).month;
        vb = viewMode === "daily" ? (b as DailyUsagePoint).date : (b as MonthlyUsagePoint).month;
      } else {
        va = a[sortField];
        vb = b[sortField];
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return d;
  }, [data, sortField, sortDir, viewMode]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortArrow = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const cols: { field: SortField; label: string }[] = [
    { field: "date" as SortField, label: viewMode === "daily" ? "日期" : "月份" },
    { field: "total_tokens", label: "Token 用量" },
    { field: "request_count" as SortField, label: "请求次数" },
    { field: "estimated_cost", label: "费用" },
  ];

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.field} onClick={() => handleSort(c.field)}>
                {c.label}
                <SortArrow field={c.field} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.empty}>
                暂无数据
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr key={i}>
                <td>
                  {viewMode === "daily"
                    ? formatDate((row as DailyUsagePoint).date)
                    : formatMonth((row as MonthlyUsagePoint).month)}
                </td>
                <td>{formatTokens(row.total_tokens)}</td>
                <td>{row.request_count.toLocaleString("en-US")}</td>
                <td>{formatCost(row.estimated_cost)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
