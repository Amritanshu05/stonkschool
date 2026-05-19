import { cn } from "@/lib/cn";

interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/** Original mark — concentric arcs forming an upward stroke. */
export function Logo({ size = 28, withWordmark = true, className }: Props) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 select-none", className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="32" height="32" rx="9" fill="#0DA068" />
        <path
          d="M8 21l4-5 4 3 8-10"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="9" r="2.2" fill="#fff" />
      </svg>
      {withWordmark ? (
        <span className="font-semibold tracking-tight text-ink text-[17px]">
          Stonk<span className="text-brand-500">School</span>
        </span>
      ) : null}
    </span>
  );
}
