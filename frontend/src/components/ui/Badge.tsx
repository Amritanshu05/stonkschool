import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { ContestStatus } from "@/lib/types";

type Tone = "neutral" | "brand" | "warn" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-bg-subtle text-ink-muted",
  brand: "bg-brand-50 text-brand-700",
  warn: "bg-warn-soft text-warn",
  danger: "bg-loss-soft text-loss",
  info: "bg-accent-50 text-accent-700",
};

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
  ...rest
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "brand" && "bg-brand-500",
            tone === "warn" && "bg-warn",
            tone === "danger" && "bg-loss",
            tone === "info" && "bg-accent-500",
            tone === "neutral" && "bg-ink-soft",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}

const STATUS_LABEL: Record<ContestStatus, string> = {
  draft: "Draft",
  upcoming: "Starting soon",
  joining_open: "Open to join",
  allocation_locked: "Locking up",
  live: "Live",
  ended: "Ended",
  settled: "Settled",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<ContestStatus, Tone> = {
  draft: "neutral",
  upcoming: "info",
  joining_open: "brand",
  allocation_locked: "warn",
  live: "brand",
  ended: "neutral",
  settled: "neutral",
  cancelled: "danger",
};

export function StatusBadge({ status }: { status: ContestStatus }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <Badge tone={tone} dot={status === "live" || status === "joining_open"}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
