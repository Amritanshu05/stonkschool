import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="ss-chip border border-line">404</span>
      <h1 className="mt-3 text-2xl font-semibold">We can&apos;t find that page.</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        The link may be broken or the contest may have wrapped up.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/dashboard">
          <Button>Go to dashboard</Button>
        </Link>
        <Link href="/contests">
          <Button variant="secondary">Browse contests</Button>
        </Link>
      </div>
    </div>
  );
}
