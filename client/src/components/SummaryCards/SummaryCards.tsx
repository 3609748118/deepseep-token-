import type { SummaryData } from "../../types";
import { formatTokens, formatCost } from "../../utils/format";
import styles from "./SummaryCards.module.css";

interface SummaryCardsProps {
  today: SummaryData | null;
  month: SummaryData | null;
}

export default function SummaryCards({ today, month }: SummaryCardsProps) {
  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.cardToday}`}>
        <span className={styles.label}>今日用量</span>
        <span className={styles.value}>
          {today ? formatTokens(today.total_tokens) : "--"}
        </span>
      </div>
      <div className={`${styles.card} ${styles.cardMonth}`}>
        <span className={styles.label}>本月用量</span>
        <span className={styles.value}>
          {month ? formatTokens(month.total_tokens) : "--"}
        </span>
      </div>
      <div className={`${styles.card} ${styles.cardCost}`}>
        <span className={styles.label}>预估费用</span>
        <span className={styles.value}>
          {month ? formatCost(month.estimated_cost) : "--"}
        </span>
      </div>
    </div>
  );
}
