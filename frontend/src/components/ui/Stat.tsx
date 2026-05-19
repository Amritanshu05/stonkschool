import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: "up" | "down" | "flat";
  className?: string;
}

export function Stat({ label, value, hint, trend, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <span
        className={cn(
          "text-2xl font-semibold num text-ink",
          trend === "up" && "text-gain",
          trend === "down" && "text-loss",
        )}
      >
        {value}
      </span>
      {hint ? <span className="text-xs text-ink-muted">{hint}</span> : null}
    </div>
  );
}
