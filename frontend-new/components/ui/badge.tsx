import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium transition-colors",
  {
    variants: {
      variant: {
        default:   "bg-bg-subtle text-ink",
        green:     "bg-green-muted text-green",
        amber:     "bg-amber-muted text-amber",
        red:       "bg-red-muted text-red",
        blue:      "bg-blue-muted text-blue",
        outline:   "border border-line text-ink-muted",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs rounded",
        md: "px-2 py-0.5 text-xs rounded-md",
        lg: "px-2.5 py-1 text-sm rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "green" && "bg-green",
            variant === "amber" && "bg-amber",
            variant === "red" && "bg-red",
            variant === "blue" && "bg-blue",
            !variant || variant === "default" && "bg-ink-muted"
          )}
        />
      )}
      {children}
    </span>
  );
}
