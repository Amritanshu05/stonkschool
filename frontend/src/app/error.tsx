"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold">Something went sideways.</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        The page hit an unexpected error. You can try again, or head back to the
        dashboard.
      </p>
      {error?.message ? (
        <pre className="mt-4 max-w-lg overflow-x-auto rounded border border-line bg-bg-subtle p-3 text-left text-xs text-ink-muted">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/dashboard">
          <Button variant="secondary">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
