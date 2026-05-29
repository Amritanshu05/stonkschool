"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/ws";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPnlColor } from "@/lib/utils";
import { Trophy, TrendingUp, TrendingDown, Wifi, WifiOff, Crown } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  user: string;
  value: number;
}

export default function ContestLivePage() {
  const { id } = useParams<{ id: string }>();
  const [wsConnected, setWsConnected] = useState(false);
  const [liveBoard, setLiveBoard] = useState<LeaderboardEntry[]>([]);

  // Seed from REST
  const { data: boardData } = useQuery({
    queryKey: ["leaderboard", id],
    queryFn: () => api.contests.leaderboard(id),
    refetchInterval: 30_000,
  });

  const { data: status } = useQuery({
    queryKey: ["contest-status", id],
    queryFn: () => api.contests.status(id),
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (boardData) setLiveBoard(boardData);
  }, [boardData]);

  // Live updates via WebSocket
  useWebSocket(`/ws/contest/${id}`, {
    onConnect: () => setWsConnected(true),
    onDisconnect: () => setWsConnected(false),
    onMessage: (data) => {
      if (data.type === "leaderboard_update" && Array.isArray(data.entries)) {
        setLiveBoard(data.entries as LeaderboardEntry[]);
      }
    },
    enabled: true,
  });

  const topThree = liveBoard.slice(0, 3);
  const rest = liveBoard.slice(3);

  const rankColor = (rank: number) =>
    rank === 1 ? "text-amber" : rank === 2 ? "text-ink" : rank === 3 ? "text-amber/70" : "text-ink-muted";

  const rankBg = (rank: number) =>
    rank === 1 ? "bg-amber/10 border-amber/20" : "bg-bg-subtle border-line";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green animate-pulse" />
            Live Leaderboard
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">Real-time updates via WebSocket</p>
        </div>
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <Badge variant="green" size="sm" dot>Live</Badge>
          ) : (
            <Badge variant="outline" size="sm">Connecting…</Badge>
          )}
        </div>
      </div>

      {/* My status card */}
      {status && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Your Rank",
              value: `#${status.current_rank}`,
              icon: Trophy,
              color: "text-amber",
              bg: "bg-amber/10",
            },
            {
              label: "Portfolio Value",
              value: formatCurrency(status.portfolio_value, "V", true),
              icon: TrendingUp,
              color: "text-green",
              bg: "bg-green/10",
            },
            {
              label: "P&L",
              value: formatCurrency(status.portfolio_value - 100_000, "V", true),
              icon: status.portfolio_value >= 100_000 ? TrendingUp : TrendingDown,
              color: getPnlColor(status.portfolio_value - 100_000),
              bg: status.portfolio_value >= 100_000 ? "bg-green/10" : "bg-red/10",
            },
          ].map((s) => (
            <Card key={s.label} className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-ink-faint">{s.label}</p>
                <p className={`num text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Podium */}
      {topThree.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber" /> Top 3
            </h2>
          </div>
          <div className="divide-y divide-line">
            {topThree.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 px-5 py-4 ${rankBg(entry.rank)} border-0`}
              >
                <div className={`num text-xl font-bold w-8 shrink-0 ${rankColor(entry.rank)}`}>
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                </div>
                <span className="flex-1 font-semibold text-ink">{entry.user}</span>
                <span className="num font-bold text-sm text-ink">
                  {formatCurrency(entry.value, "V", true)}
                </span>
                <span className={`num text-xs ${getPnlColor(entry.value - 100_000)}`}>
                  {entry.value >= 100_000 ? "+" : ""}
                  {(((entry.value - 100_000) / 100_000) * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Full leaderboard */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-sm text-ink">Full Rankings</h2>
        </div>
        {liveBoard.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="mx-auto h-8 w-8 text-ink-faint mb-2" />
            <p className="text-sm text-ink-muted">Leaderboard updating…</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {/* Header row */}
            <div className="grid grid-cols-[40px_1fr_120px_80px] gap-2 px-5 py-2 text-[10px] text-ink-faint uppercase tracking-wider">
              <span>Rank</span>
              <span>Trader</span>
              <span className="text-right">Value</span>
              <span className="text-right">P&amp;L</span>
            </div>
            {liveBoard.map((entry) => (
              <div
                key={entry.rank}
                className="grid grid-cols-[40px_1fr_120px_80px] gap-2 items-center px-5 py-3 hover:bg-bg-subtle transition-colors"
              >
                <span className={`num text-sm font-bold ${rankColor(entry.rank)}`}>
                  #{entry.rank}
                </span>
                <span className="text-sm font-medium text-ink truncate">{entry.user}</span>
                <span className="num text-sm font-semibold text-ink text-right">
                  {formatCurrency(entry.value, "V", true)}
                </span>
                <span className={`num text-xs text-right ${getPnlColor(entry.value - 100_000)}`}>
                  {(((entry.value - 100_000) / 100_000) * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
