"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, getPnlColor, formatPercent } from "@/lib/utils";
import Link from "next/link";
import {
  User,
  Wallet,
  Trophy,
  BarChart2,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

// Avatar placeholder
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-16 w-16 rounded-2xl bg-green/10 border-2 border-green/20 flex items-center justify-center">
      <span className="text-xl font-bold text-green">{initials}</span>
    </div>
  );
}

// Stat tile
function Tile({
  label,
  value,
  sub,
  valueClass = "text-ink",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-ink-faint uppercase tracking-wider">{label}</p>
      <p className={`num text-xl font-bold ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-ink-faint">{sub}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: api.users.me,
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: api.wallet.balance,
  });

  const { data: txns, isLoading: txnLoading } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: api.wallet.transactions,
  });

  const winRate = user
    ? user.stats.contests_played > 0
      ? (user.stats.contests_won / user.stats.contests_played) * 100
      : 0
    : 0;

  const TYPE_LABELS: Record<string, string> = {
    entry_fee: "Contest Entry Fee",
    payout: "Contest Payout",
    replay: "Replay Session",
    bonus: "Bonus",
    initial: "Initial Wallet",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
        <User className="h-6 w-6 text-green" />
        Profile
      </h1>

      {/* Profile card */}
      <Card>
        {userLoading ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-bg-subtle animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 rounded bg-bg-subtle animate-pulse" />
              <div className="h-4 w-24 rounded bg-bg-subtle animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar name={user.display_name} />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink">{user.display_name}</h2>
              <p className="text-sm text-ink-muted">{user.email}</p>
            </div>
            <div className="grid grid-cols-3 gap-6 sm:gap-10">
              <Tile
                label="Wallet"
                value={formatCurrency(wallet?.balance ?? user.wallet_balance, "V", true)}
              />
              <Tile
                label="Contests"
                value={user.stats.contests_played.toString()}
              />
              <Tile
                label="Win Rate"
                value={`${winRate.toFixed(0)}%`}
                valueClass={winRate >= 50 ? "text-green" : "text-amber"}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-ink-muted">Not signed in.</p>
            <Link href="/login">
              <Button className="mt-3">Sign In</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Stats grid */}
      {user && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="text-xs text-ink-faint">Contests Won</p>
              <p className="num text-2xl font-bold text-ink">{user.stats.contests_won}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green/10 flex items-center justify-center shrink-0">
              <BarChart2 className="h-5 w-5 text-green" />
            </div>
            <div>
              <p className="text-xs text-ink-faint">Win Rate</p>
              <p className={`num text-2xl font-bold ${winRate >= 50 ? "text-green" : "text-amber"}`}>
                {winRate.toFixed(0)}%
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-blue" />
            </div>
            <div>
              <p className="text-xs text-ink-faint">Balance</p>
              <p className="num text-2xl font-bold text-ink">
                {formatCurrency(wallet?.balance ?? 0, "V", true)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <Clock className="h-4 w-4 text-green" />
            Transaction History
          </h2>
        </div>
        {txnLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-40 rounded bg-bg-subtle animate-pulse" />
                <div className="h-4 w-20 rounded bg-bg-subtle animate-pulse" />
              </div>
            ))}
          </div>
        ) : !txns?.length ? (
          <div className="py-10 text-center">
            <Wallet className="mx-auto h-8 w-8 text-ink-faint mb-2" />
            <p className="text-sm text-ink-muted">No transactions yet.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-line">
              {txns.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-subtle transition-colors">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {TYPE_LABELS[tx.type] ?? tx.type}
                    </p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      {formatDateTime(tx.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tx.amount > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-green" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red" />
                    )}
                    <span className={`num text-sm font-semibold ${getPnlColor(tx.amount)}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrency(tx.amount, "V", true)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href="/contests" className="flex-1">
          <Button variant="secondary" className="w-full gap-1.5">
            <Trophy className="h-4 w-4 text-amber" />
            Browse Contests
          </Button>
        </Link>
        <Link href="/replay" className="flex-1">
          <Button variant="outline" className="w-full gap-1.5">
            <BarChart2 className="h-4 w-4 text-green" />
            Start Replay
          </Button>
        </Link>
      </div>
    </div>
  );
}
