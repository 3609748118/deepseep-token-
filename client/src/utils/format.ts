export function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export function formatCost(n: number): string {
  return "¥" + n.toFixed(2);
}

export function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateStr;
}

export function formatMonth(monthStr: string): string {
  const [y, m] = monthStr.split("-");
  return `${y}-${m}`;
}
