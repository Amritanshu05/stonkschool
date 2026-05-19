/** Formatting helpers — keep number/date rendering consistent across screens. */

const VC = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const VC_FIXED = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatVC(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  if (!Number.isFinite(v)) return "0";
  return VC.format(v);
}

export function formatVCFixed(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  if (!Number.isFinite(v)) return "0.00";
  return VC_FIXED.format(v);
}

export function formatPct(
  n: number | string | null | undefined,
  digits = 2,
): string {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  if (!Number.isFinite(v)) return "0%";
  return `${v.toFixed(digits)}%`;
}

export function formatPriceShort(p: number | string): string {
  const v = typeof p === "string" ? Number(p) : p;
  if (!Number.isFinite(v)) return "—";
  if (v >= 1000) return v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return v.toFixed(4);
}

/** Backend timestamps come as `YYYY-MM-DDTHH:mm:ss[.fff]` (no TZ).
 *  We treat them as UTC since the backend pins TZ to UTC. */
export function parseUtcNaive(ts: string): Date {
  // Append `Z` if missing so JS parses as UTC.
  const withZ = /Z$|[+-]\d{2}:?\d{2}$/.test(ts) ? ts : `${ts}Z`;
  return new Date(withZ);
}

export function formatRelative(
  to: Date | string,
  from: Date = new Date(),
): string {
  const target = typeof to === "string" ? parseUtcNaive(to) : to;
  const diffMs = target.getTime() - from.getTime();
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  const pick = (val: number, unit: string) =>
    `${val} ${unit}${val === 1 ? "" : "s"}`;
  let label = "now";
  if (sec >= 45 && min < 60) label = pick(min, "min");
  else if (min >= 60 && hr < 24) label = pick(hr, "hr");
  else if (hr >= 24) label = pick(day, "day");
  else if (sec >= 5) label = pick(sec, "sec");

  return diffMs >= 0 ? `in ${label}` : `${label} ago`;
}

export function formatTimeShort(d: Date | string): string {
  const date = typeof d === "string" ? parseUtcNaive(d) : d;
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateLong(d: Date | string): string {
  const date = typeof d === "string" ? parseUtcNaive(d) : d;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
