import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = "VCOIN",
  compact = false
): string {
  const val = amount ?? 0;
  if (compact) {
    if (Math.abs(val) >= 1_000_000)
      return `${(val / 1_000_000).toFixed(1)}M ${currency}`;
    if (Math.abs(val) >= 1_000)
      return `${(val / 1_000).toFixed(1)}K ${currency}`;
  }
  return `${val.toLocaleString("en-IN")} ${currency}`;
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getContestStatusColor(
  status: "upcoming" | "live" | "ended"
): string {
  switch (status) {
    case "live":
      return "text-green";
    case "upcoming":
      return "text-amber";
    case "ended":
      return "text-ink-muted";
  }
}

export function getPnlColor(value: number): string {
  if (value > 0) return "text-green";
  if (value < 0) return "text-red";
  return "text-ink-muted";
}
