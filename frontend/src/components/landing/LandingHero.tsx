import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(13,160,104,0.18),transparent_70%)]"
      />
      <div className="container relative grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <span className="ss-chip border border-brand-100 bg-brand-50 text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Practice, not gamble
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Learn to invest{" "}
            <span className="text-brand-600">without losing money.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-muted">
            Trade real markets with virtual coins. Join short, skill-based
            contests against other learners. See, in plain language, why each
            move worked or didn&apos;t.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`${API_URL}/api/v1/auth/google`}>
              <Button size="lg" className="px-6">
                Continue with Google
              </Button>
            </a>
            <Link href="/contests">
              <Button variant="secondary" size="lg" className="px-6">
                Browse contests
              </Button>
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-6 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <CheckIcon /> Free, no card needed
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon /> Virtual coins only
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon /> Beginner-first design
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-brand-600">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6.5l2.5 2.5L10 3.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-xl bg-gradient-to-tr from-brand-100/60 via-bg-surface to-accent-50/60 blur-2xl" />
      <div className="ss-card relative overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-soft">
              Contest
            </div>
            <div className="text-base font-semibold">BTC vs ETH — Quick Battle</div>
          </div>
          <span className="ss-chip border border-brand-100 bg-brand-50 text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <PreviewStat label="Your rank" value="#2" />
          <PreviewStat label="Portfolio" value="100,230" trend="up" />
          <PreviewStat label="Players" value="24" />
        </div>

        <div className="p-4">
          <FauxChart />
        </div>

        <div className="space-y-2 border-t border-line p-4">
          <PreviewRow rank="1" name="Bob" value="100,420" you={false} />
          <PreviewRow rank="2" name="You" value="100,230" you />
          <PreviewRow rank="3" name="Carol" value="100,180" you={false} />
        </div>
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </div>
      <div
        className={
          "mt-1 num text-lg font-semibold " +
          (trend === "up" ? "text-gain" : "text-ink")
        }
      >
        {value}
      </div>
    </div>
  );
}

function PreviewRow({
  rank,
  name,
  value,
  you,
}: {
  rank: string;
  name: string;
  value: string;
  you: boolean;
}) {
  return (
    <div
      className={
        "flex items-center justify-between rounded-sm px-2 py-1.5 text-sm " +
        (you ? "bg-brand-50" : "")
      }
    >
      <div className="flex items-center gap-3">
        <span className="num w-6 text-ink-soft">#{rank}</span>
        <span className="font-medium">{name}</span>
        {you ? (
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            YOU
          </span>
        ) : null}
      </div>
      <span className="num font-semibold">{value}</span>
    </div>
  );
}

function FauxChart() {
  // Static, decorative SVG line — no live data on the landing page.
  return (
    <svg viewBox="0 0 320 80" className="h-24 w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0DA068" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0DA068" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,55 L20,52 L40,58 L60,42 L80,46 L100,38 L120,34 L140,44 L160,30 L180,28 L200,22 L220,28 L240,18 L260,22 L280,12 L300,18 L320,8"
        fill="none"
        stroke="#0DA068"
        strokeWidth="2"
      />
      <path
        d="M0,55 L20,52 L40,58 L60,42 L80,46 L100,38 L120,34 L140,44 L160,30 L180,28 L200,22 L220,28 L240,18 L260,22 L280,12 L300,18 L320,8 L320,80 L0,80 Z"
        fill="url(#g)"
      />
    </svg>
  );
}
