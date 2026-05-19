import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ss-card p-5 sm:p-6", className)} {...rest} />;
}

export function CardHeader({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 mb-4", className)}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-ink", className)}
      {...rest}
    />
  );
}

export function CardSubtitle({
  className,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-ink-muted mt-0.5", className)}
      {...rest}
    />
  );
}
