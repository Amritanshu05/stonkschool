"use client";

import Link from "next/link";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/shell/PageHeader";

type Lesson = {
  slug: string;
  track: "Basics" | "Markets" | "Strategy" | "Psychology";
  minutes: number;
  title: string;
  hook: string;
};

// Static MVP content. A future iteration can move this server-side.
const LESSONS: Lesson[] = [
  {
    slug: "what-is-an-asset",
    track: "Basics",
    minutes: 4,
    title: "What is an asset, really?",
    hook: "Stocks, ETFs, crypto — they all do one thing. Ownership of future value. Let's keep it that simple.",
  },
  {
    slug: "what-moves-prices",
    track: "Markets",
    minutes: 5,
    title: "Why prices move (and why most reasons are wrong)",
    hook: "News explains 10% of the day. The rest is supply, demand, and expectations. Here's how to tell them apart.",
  },
  {
    slug: "diversification-is-not-magic",
    track: "Strategy",
    minutes: 6,
    title: "Diversification is not magic",
    hook: "Splitting money across five things doesn't help if all five fall together. Understand what counts as diversified.",
  },
  {
    slug: "fee-drag",
    track: "Basics",
    minutes: 3,
    title: "The quiet cost of every trade",
    hook: "Fees and spreads eat returns even when the price doesn't move. Here's the math, in one paragraph.",
  },
  {
    slug: "loss-aversion",
    track: "Psychology",
    minutes: 5,
    title: "Why losses hurt twice as much",
    hook: "It's a brain thing, not a market thing. Once you know it, you stop making the same mistake.",
  },
  {
    slug: "reading-a-candle",
    track: "Markets",
    minutes: 4,
    title: "Reading a candle without lying to yourself",
    hook: "A green candle is not a buy signal. Here's what each part of a candle actually tells you.",
  },
];

const TRACKS = ["Basics", "Markets", "Strategy", "Psychology"] as const;

export function LearnView() {
  return (
    <div className="container py-8">
      <PageHeader
        title="Learn"
        description="Bite-sized reads tied to what you actually do here. No 200-page PDFs."
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRACKS.map((t) => {
          const count = LESSONS.filter((l) => l.track === t).length;
          return (
            <Card key={t} className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Track
              </div>
              <div className="mt-1 text-lg font-semibold">{t}</div>
              <div className="mt-1 text-sm text-ink-muted">
                {count} short read{count === 1 ? "" : "s"}
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Start here</CardTitle>
              <CardSubtitle>Hand-picked for the first hour on StonkSchool.</CardSubtitle>
            </div>
          </CardHeader>
          <ul className="divide-y divide-line">
            {LESSONS.map((l) => (
              <li
                key={l.slug}
                className="grid items-center gap-3 py-4 sm:grid-cols-[140px_1fr_auto]"
              >
                <div className="flex items-center gap-2">
                  <Badge tone="brand">{l.track}</Badge>
                  <span className="text-xs text-ink-muted">{l.minutes} min</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{l.title}</div>
                  <p className="mt-0.5 text-sm text-ink-muted">{l.hook}</p>
                </div>
                <div>
                  <Link
                    href={`/learn/${l.slug}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Read →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <div className="ss-card p-6 text-sm text-ink-muted">
          <strong className="text-ink">A note on integrity.</strong> StonkSchool
          is a learning environment. We don&apos;t recommend specific stocks,
          time the market for you, or promise returns. Everything here is paper
          money — the goal is to build instinct that survives a real account.
        </div>
      </section>
    </div>
  );
}
