import { cn } from "@/lib/cn";

interface Props {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

function initials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const palette = [
    "bg-brand-100 text-brand-700",
    "bg-accent-50 text-accent-700",
    "bg-warn-soft text-warn",
    "bg-loss-soft text-loss",
    "bg-bg-subtle text-ink",
  ];
  return palette[Math.abs(h) % palette.length];
}

export function Avatar({ name, size = "md", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        sizes[size],
        colorFor(name),
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
