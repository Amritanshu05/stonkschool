"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, getPnlColor } from "@/lib/utils";
import Link from "next/link";
import {
  Wallet,
  Trophy,
  PlayCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart2,
  Clock,
  Activity,
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass = "text-green",
  iconBg = "bg-green/10",
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
  iconBg?: string;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">{label}</p>
          <p className="mt-2 num text-2xl font-bold text-ink">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>
    </Card>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Link href="/contests">
          <Button variant="secondary" size="md" className="w-full justify-start gap-2">
            <Trophy className="h-4 w-4 text-amber" />
            Browse Contests
          </Button>
        </Link>
        <Link href="/replay">
          <Button variant="secondary" size="md" className="w-full justify-start gap-2">
            <PlayCircle className="h-4 w-4 text-green" />
            Start Replay
          </Button>
        </Link>
        <Link href="/learn">
          <Button variant="secondary" size="md" className="w-full justify-start gap-2">
            <BarChart2 className="h-4 w-4 text-blue" />
            Learn
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Recent Transactions ──────────────────────────────────────────────────────
function RecentTransactions() {
  const { data: txns, isLoading } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: api.wallet.transactions,
  });

  const TYPE_LABELS: Record<string, string> = {
    entry_fee: "Contest Entry Fee",
    payout: "Contest Payout",
    replay: "Replay Session",
    bonus: "Bonus",
    initial: "Initial Wallet",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green" />
          Recent Transactions
        </CardTitle>
        <Link href="/profile" className="text-xs text-green hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <div className="h-4 w-32 rounded bg-bg-subtle animate-pulse" />
                <div className="h-4 w-16 rounded bg-bg-subtle animate-pulse" />
              </div>
            ))}
          </div>
        ) : !txns?.length ? (
          <p className="text-sm text-ink-muted text-center py-4">No transactions yet.</p>
        ) : (
          <div className="space-y-1">
            {txns.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {TYPE_LABELS[tx.type] ?? tx.type}
                  </p>
                  <p className="text-xs text-ink-faint flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(tx.created_at)}
                  </p>
                </div>
                <span className={`num text-sm font-semibold ${getPnlColor(tx.amount)}`}>
                  {tx.amount > 0 ? "+" : ""}
                  {formatCurrency(tx.amount, "V")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Your Contests ────────────────────────────────────────────────────────────
function YourContests() {
  const { data: myContests, isLoading } = useQuery({
    queryKey: ["my-contests"],
    queryFn: api.users.myContests,
    refetchInterval: 15_000,
  });

  const statusMap: Record<string, { label: string; variant: "green" | "amber" | "outline" | "default"; dot: boolean }> = {
    live:              { label: "Live",          variant: "green" as const,   dot: true  },
    upcoming:          { label: "Upcoming",      variant: "amber" as const,   dot: false },
    joining_open:      { label: "Upcoming",      variant: "amber" as const,   dot: false },
    allocation_locked: { label: "Locked",        variant: "amber" as const,   dot: false },
    ended:             { label: "Ended",         variant: "outline" as const, dot: false },
  };

  const TRACK_LABELS: Record<string, string> = { crypto: "Crypto", etf: "ETF", equity: "Equity" };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber" />
          Your Contests
        </CardTitle>
        <Link href="/contests" className="text-xs text-green hover:underline flex items-center gap-1">
          Explore more <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-line last:border-0">
                <div className="space-y-1">
                  <div className="h-4 w-40 rounded bg-bg-subtle animate-pulse" />
                  <div className="h-3.5 w-24 rounded bg-bg-subtle animate-pulse" />
                </div>
                <div className="h-6 w-16 rounded bg-bg-subtle animate-pulse" />
              </div>
            ))}
          </div>
        ) : !myContests?.length ? (
          <div className="text-center py-6 flex flex-col items-center gap-2">
            <p className="text-sm text-ink-muted">You haven&apos;t joined any contests yet.</p>
            <Link href="/contests">
              <Button variant="outline" size="sm">
                Browse Contests
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {myContests.slice(0, 5).map((c) => {
              const statusConfig = statusMap[c.status] ?? { label: c.status, variant: "default" as const, dot: false };
              let linkHref = `/contests/${c.contest_id}`;
              if (c.status === "live") {
                linkHref = `/contests/${c.contest_id}/live`;
              } else if (c.status === "ended") {
                linkHref = `/contests/${c.contest_id}/results`;
              }

              return (
                <div key={c.contest_id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4">
                  <div className="min-w-0">
                    <Link href={linkHref} className="font-semibold text-sm text-ink hover:text-green transition-colors truncate block">
                      {c.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="default" size="sm" className="bg-bg-subtle text-ink-muted">
                        {TRACK_LABELS[c.track] ?? c.track}
                      </Badge>
                      <Badge variant={statusConfig.variant} size="sm" dot={statusConfig.dot}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {c.current_rank != null && (
                      <p className="text-xs text-ink-muted font-medium">Rank #{c.current_rank}</p>
                    )}
                    {c.portfolio_value != null && (
                      <p className="num text-sm font-bold text-ink mt-0.5">
                        {formatCurrency(c.portfolio_value, "V", true)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: api.users.me,
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: api.wallet.balance,
  });

  const { data: contests } = useQuery({
    queryKey: ["contests"],
    queryFn: api.contests.list,
  });

  const liveContests = contests?.filter((c) => c.status === "live") ?? [];
  const upcomingContests = contests?.filter((c) => c.status === "upcoming") ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 border border-green/20">
            <TrendingUp className="h-5 w-5 text-green" />
          </div>
          <div>
            {userLoading ? (
              <div className="h-6 w-40 rounded bg-bg-subtle animate-pulse" />
            ) : (
              <h1 className="text-xl font-bold text-ink">
                Welcome back, {user?.display_name ?? "Trader"} 👋
              </h1>
            )}
            <p className="text-sm text-ink-muted">Here&apos;s your trading overview.</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Wallet Balance"
          value={wallet ? formatCurrency(wallet.balance, "V", true) : "—"}
          sub={wallet?.currency ?? "VCOIN"}
        />
        <StatCard
          icon={Trophy}
          label="Contests Played"
          value={user?.stats.contests_played.toString() ?? "0"}
          iconClass="text-amber"
          iconBg="bg-amber/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Contests Won"
          value={user?.stats.contests_won.toString() ?? "0"}
          sub={
            user
              ? `${((user.stats.contests_won / (user.stats.contests_played || 1)) * 100).toFixed(0)}% win rate`
              : undefined
          }
        />
        <StatCard
          icon={Activity}
          label="Live Contests"
          value={liveContests.length.toString()}
          sub={`${upcomingContests.length} upcoming`}
          iconClass="text-red"
          iconBg="bg-red/10"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Quick Actions + Your Contests + Transactions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <QuickActions />
          <YourContests />
          <RecentTransactions />
        </div>

        {/* Right: Active Contests */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green animate-pulse" />
                Live Contests
              </CardTitle>
              <Link href="/contests" className="text-xs text-green hover:underline flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {liveContests.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-ink-muted">No live contests right now.</p>
                  <Link href="/contests">
                    <Button variant="link" size="sm" className="mt-2">
                      Browse upcoming →
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {liveContests.slice(0, 3).map((c) => (
                    <Link key={c.id} href={`/contests/${c.id}/live`}>
                      <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-bg-subtle transition-colors">
                        <div>
                          <p className="text-sm font-medium text-ink">{c.title}</p>
                          <Badge variant="green" size="sm" dot className="mt-1">Live</Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-ink-faint" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming contests */}
          {upcomingContests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingContests.slice(0, 3).map((c) => (
                    <Link key={c.id} href={`/contests/${c.id}`}>
                      <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-bg-subtle transition-colors">
                        <div>
                          <p className="text-sm font-medium text-ink">{c.title}</p>
                          <p className="text-xs text-ink-faint mt-0.5">
                            {formatDateTime(c.start_time)}
                          </p>
                        </div>
                        <Badge variant="amber" size="sm">{formatCurrency(c.entry_fee, "V")}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
