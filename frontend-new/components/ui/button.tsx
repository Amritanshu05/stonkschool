import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-green text-bg hover:bg-green/90 active:scale-[0.98]",
        secondary:
          "bg-bg-subtle text-ink hover:bg-bg-elevated active:scale-[0.98]",
        ghost:
          "bg-transparent text-ink-muted hover:bg-bg-subtle hover:text-ink active:scale-[0.98]",
        outline:
          "border border-line bg-transparent text-ink hover:bg-bg-subtle active:scale-[0.98]",
        danger:
          "bg-red text-white hover:bg-red/90 active:scale-[0.98]",
        amber:
          "bg-amber text-bg hover:bg-amber/90 active:scale-[0.98]",
        link:
          "bg-transparent text-green underline-offset-4 hover:underline p-0! h-auto!",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-9 px-4 text-sm rounded-lg",
        lg: "h-11 px-6 text-base rounded-lg",
        xl: "h-13 px-8 text-lg rounded-xl",
        icon: "h-9 w-9 rounded-lg",
        "icon-sm": "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
