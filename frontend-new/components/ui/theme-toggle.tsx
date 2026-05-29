"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "relative h-8 w-14 rounded-full border border-line bg-bg-subtle",
          className
        )}
        aria-label="Toggle theme"
        disabled
      >
        <span className="absolute top-0.5 left-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "relative h-8 w-14 rounded-full border border-line bg-bg-subtle",
        "transition-all duration-300 cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green",
        className
      )}
      aria-label="Toggle theme"
    >
      {/* Track */}
      <span
        className={cn(
          "absolute top-0.5 left-0.5 flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300",
          resolvedTheme === "dark"
            ? "translate-x-6 bg-ink/10"
            : "translate-x-0 bg-amber/20"
        )}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-3.5 w-3.5 text-ink-muted" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber" />
        )}
      </span>
    </button>
  );
}
