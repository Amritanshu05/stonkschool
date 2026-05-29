"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getPnlColor } from "@/lib/utils";
import Link from "next/link";
import { Trophy, TrendingUp, TrendingDown, Medal, ArrowLeft, Crown } from "lucide-react";

export default function ContestResultsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["contest-results", id],
    queryFn: () => api.contests.results(id),
  });

  const { data: leaderboard, isLoading: boardLoading } = useQuery({
    queryKey: ["leaderboard", id],
    queryFn: () => api.contests.leaderboard(id),
  });

  const isLoading = resultsLoading || boardLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-bg-subtle animate-pulse" />
        ))}
      </div>
    );
  }

  const pnl = results ? results.final_value - 100_000 : 0;
  const pnlPct = (pnl / 100_000) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Back */}
      <Link href="/contests">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Contests
        </Button>
      </Link>

      {/* Results hero */}
      {results && (
        <Card className="text-center py-8 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{ background: "radial-gradient(ellipse at center, var(--green) 0%, transparent 70%)" }}
          />
          <div className="relative z-10 flex flex-col items-center gap-3">
            {results.rank <= 3 ? (
              <Crown className="h-12 w-12 text-amber" />
            ) : (
              <Medal className="h-12 w-12 text-ink-muted" />
            )}
            <div>
              <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Your Final Rank</p>
              <p className="num text-6xl font-bold text-ink">#{results.rank}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-2">
              <div className="text-center">
                <p className="text-xs text-ink-faint">Final Value</p>
                <p className="num text-lg font-bold text-ink">
                  {formatCurrency(results.final_value, "V", true)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-ink-faint">P&amp;L</p>
                <p className={`num text-lg font-bold ${getPnlColor(pnl)}`}>
                  {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, "V", true)} ({pnlPct.toFixed(2)}%)
                </p>
              </div>
              {results.payout > 0 && (
                <div className="text-center">
                  <p className="text-xs text-ink-faint">Prize Won</p>
                  <p className="num text-lg font-bold text-amber">
                    {formatCurrency(results.payout, "V", true)}
                  </p>
                </div>
              )}
            </div>

            {results.payout > 0 ? (
              <Badge variant="amber" size="lg" className="mt-2">
                🎉 Prize Credited to Wallet
              </Badge>
            ) : (
              <p className="text-sm text-ink-muted mt-2">
                Better luck next time! Your skills will grow with every contest.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Final Leaderboard */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-line flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber" />
          <h2 className="font-semibold text-sm text-ink">Final Rankings</h2>
        </div>
        {!leaderboard?.length ? (
          <p className="text-center text-ink-muted py-8 text-sm">No results available.</p>
        ) : (
          <div className="divide-y divide-line">
            <div className="grid grid-cols-[40px_1fr_120px_80px] gap-2 px-5 py-2 text-[10px] text-ink-faint uppercase tracking-wider">
              <span>Rank</span><span>Trader</span>
              <span className="text-right">Value</span>
              <span className="text-right">Return</span>
            </div>
            {leaderboard.map((entry) => {
              const ret = ((entry.value - 100_000) / 100_000) * 100;
              return (
                <div
                  key={entry.rank}
                  className="grid grid-cols-[40px_1fr_120px_80px] gap-2 items-center px-5 py-3"
                >
                  <span className={`num text-sm font-bold ${entry.rank <= 3 ? "text-amber" : "text-ink-muted"}`}>
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                  </span>
                  <span className="text-sm font-medium text-ink truncate">{entry.user}</span>
                  <span className="num text-sm font-semibold text-ink text-right">
                    {formatCurrency(entry.value, "V", true)}
                  </span>
                  <span className={`num text-xs text-right ${getPnlColor(ret)}`}>
                    {ret >= 0 ? "+" : ""}{ret.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/contests" className="flex-1">
          <Button variant="secondary" className="w-full">Browse More Contests</Button>
        </Link>
        <Link href="/replay" className="flex-1">
          <Button variant="outline" className="w-full">Practice in Replay</Button>
        </Link>
      </div>
    </div>
  );
}
