import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-snappy ss-focus disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-card hover:shadow-pop",
  secondary:
    "bg-bg-surface text-ink border border-line hover:border-line-strong hover:bg-bg-subtle",
  ghost: "bg-transparent text-ink-muted hover:bg-bg-subtle hover:text-ink",
  danger: "bg-loss text-white hover:bg-[#bd3a40]",
  link: "bg-transparent text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline px-0",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-sm",
  md: "h-10 px-4 text-sm rounded",
  lg: "h-12 px-5 text-base rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
});
