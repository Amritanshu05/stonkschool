import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";

export function LandingTrust() {
  return (
    <section className="container py-16 lg:py-24">
      <div className="ss-card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Built like a fintech, priced like a classroom.
          </h2>
          <p className="mt-2 text-ink-muted">
            No real money is ever at stake. Every contest uses deterministic
            seed data by default, and the rest of the platform stays online even
            when an exchange feed goes down. You learn — markets stay stable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`${API_URL}/api/v1/auth/google`}>
            <Button size="lg">Continue with Google</Button>
          </a>
          <Link href="/contests">
            <Button size="lg" variant="secondary">
              See contests
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
