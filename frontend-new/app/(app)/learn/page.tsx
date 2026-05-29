import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, TrendingUp, BarChart2, Layers, PlayCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Master financial markets with structured learning modules covering crypto, ETFs, equities, and trading strategies.",
};

const CATEGORIES = [
  {
    id: "markets-101",
    icon: TrendingUp,
    color: "text-green",
    bg: "bg-green/10",
    badge: "green" as const,
    title: "Markets 101",
    desc: "Understand how financial markets work — exchanges, order books, price discovery.",
    articles: 8,
    level: "Beginner",
  },
  {
    id: "crypto",
    icon: Layers,
    color: "text-amber",
    bg: "bg-amber/10",
    badge: "amber" as const,
    title: "Crypto Fundamentals",
    desc: "Bitcoin, Ethereum, DeFi, and why crypto markets behave differently.",
    articles: 12,
    level: "Beginner",
  },
  {
    id: "etfs",
    icon: BarChart2,
    color: "text-blue",
    bg: "bg-blue/10",
    badge: "blue" as const,
    title: "ETFs & Indices",
    desc: "Index funds, sector ETFs, NAV, and building a diversified portfolio.",
    articles: 7,
    level: "Intermediate",
  },
  {
    id: "equities",
    icon: TrendingUp,
    color: "text-green",
    bg: "bg-green/10",
    badge: "green" as const,
    title: "Equity Analysis",
    desc: "Reading financial statements, valuation ratios, and picking stocks.",
    articles: 10,
    level: "Intermediate",
  },
  {
    id: "trading-strategies",
    icon: BarChart2,
    color: "text-amber",
    bg: "bg-amber/10",
    badge: "amber" as const,
    title: "Trading Strategies",
    desc: "Momentum, mean reversion, trend-following, and risk management.",
    articles: 9,
    level: "Advanced",
  },
  {
    id: "risk-management",
    icon: Layers,
    color: "text-blue",
    bg: "bg-blue/10",
    badge: "blue" as const,
    title: "Risk Management",
    desc: "Position sizing, stop losses, portfolio diversification, and drawdown control.",
    articles: 6,
    level: "Advanced",
  },
];

const LEVEL_BADGE = {
  Beginner:     "green" as const,
  Intermediate: "amber" as const,
  Advanced:     "red" as const,
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-green" />
          <h1 className="text-2xl font-bold text-ink">Learning Hub</h1>
        </div>
        <p className="text-ink-muted max-w-xl">
          Structured content from zero to advanced trading. Every module has hands-on replay practice so you can apply what you learn immediately.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/learn/${cat.id}`}>
            <Card className="group h-full flex flex-col gap-4 hover:border-line/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.bg}`}>
                  <cat.icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <div className="flex gap-1.5">
                  <Badge variant={LEVEL_BADGE[cat.level as keyof typeof LEVEL_BADGE]} size="sm">
                    {cat.level}
                  </Badge>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-ink mb-1">{cat.title}</h2>
                <p className="text-sm text-ink-muted leading-relaxed">{cat.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
                <span className="text-xs text-ink-faint">{cat.articles} articles</span>
                <div className="flex items-center gap-1 text-xs text-green opacity-0 group-hover:opacity-100 transition-opacity">
                  Start learning <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Practice CTA */}
      <div className="mt-12 rounded-2xl border border-line bg-bg-elevated/60 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-ink text-lg">Ready to apply what you&apos;ve learned?</h2>
          <p className="text-sm text-ink-muted mt-1">
            Head to Market Replay and practice your strategies risk-free.
          </p>
        </div>
        <Link href="/replay">
          <Button size="lg" className="shrink-0">
            <PlayCircle className="h-4 w-4" />
            Go to Replay
          </Button>
        </Link>
      </div>
    </div>
  );
}
