"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stat } from "@/components/ui/Stat";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/shell/PageHeader";
import { WS_URL } from "@/lib/api";
import { useWebsocket } from "@/lib/useWebsocket";
import {
  useContestDetails,
  useContestStatus,
  useLeaderboard,
  useUser,
} from "@/lib/hooks";
import { formatDateLong, formatVCFixed } from "@/lib/format";
import type { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function LiveContestView({ contestId }: { contestId: string }) {
  const { user } = useUser();
  const { data: contest } = useContestDetails(contestId);
  const { data: status } = useContestStatus(contestId);
  const { data: initial } = useLeaderboard(contestId);

  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);
  useEffect(() => {
    if (initial && board === null) setBoard(initial);
  }, [initial, board]);

  const { status: wsStatus } = useWebsocket<LeaderboardEntry[]>({
    url: `${WS_URL}/ws/contest/${contestId}`,
    onMessage: (msg) => {
      if (Array.isArray(msg)) setBoard(msg);
    },
  });

  const [timeLeft, setTimeLeft] = useState<string>("—");
  useEffect(() => {
    if (!contest) return;
    function tick() {
      const end = new Date(contest!.end_time + "Z").getTime();
      const ms = end - Date.now();
      setTimeLeft(formatCountdown(ms));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [contest]);

  if (!contest) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-6 h-72 w-full" />
      </div>
    );
  }

  const meRow = board?.find((r) => r.user === user?.display_name);

  return (
    <div className="container py-8">
      <PageHeader
        title={contest.title}
        description="Live updates stream over WebSocket. Refresh-free."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{contest.track}</Badge>
            <StatusBadge status={status?.status ?? contest.status} />
            <span
              className={cn(
                "ss-chip",
                wsStatus === "open"
                  ? "border border-brand-100 bg-brand-50 text-brand-700"
                  : "border border-line",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  wsStatus === "open" ? "bg-brand-500" : "bg-ink-soft",
                )}
              />
              {wsStatus === "open" ? "Live stream" : "Connecting…"}
            </span>
          </div>
        }
        actions={
          <Link href={`/contests/${contestId}`}>
            <Button variant="secondary">Contest details</Button>
          </Link>
        }
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <Stat
            label="Your rank"
            value={
              status?.current_rank ? `#${status.current_rank}` : meRow ? `#${meRow.rank}` : "—"
            }
            hint={
              status?.current_rank
                ? "Updates every few seconds"
                : "Will appear when the engine ticks"
            }
          />
        </Card>
        <Card>
          <Stat
            label="Portfolio value"
            value={
              status?.portfolio_value != null
                ? `${formatVCFixed(status.portfolio_value)} VC`
                : meRow
                ? `${formatVCFixed(meRow.value)} VC`
                : "—"
            }
            trend={
              (status?.portfolio_value ?? meRow?.value ?? 0) >
              contest.virtual_capital
                ? "up"
                : (status?.portfolio_value ?? meRow?.value ?? 0) <
                  contest.virtual_capital
                ? "down"
                : "flat"
            }
            hint={`Started at ${formatVCFixed(contest.virtual_capital)} VC`}
          />
        </Card>
        <Card>
          <Stat
            label="Time left"
            value={timeLeft}
            hint={`Ends ${formatDateLong(contest.end_time)}`}
          />
        </Card>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Leaderboard</CardTitle>
              <CardSubtitle>Top 25 players, refreshed in real time.</CardSubtitle>
            </div>
            <Badge tone={wsStatus === "open" ? "brand" : "neutral"} dot>
              {wsStatus === "open" ? "Live" : wsStatus}
            </Badge>
          </CardHeader>

          {!board ? (
            <div className="space-y-2">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          ) : board.length === 0 ? (
            <div className="rounded border border-dashed border-line p-6 text-center text-sm text-ink-muted">
              Engine hasn&apos;t computed the first tick yet.
            </div>
          ) : (
            <ul className="thin-scroll max-h-[28rem] overflow-y-auto pr-1">
              {board.slice(0, 25).map((row) => {
                const isMe =
                  user?.display_name && row.user === user.display_name;
                const podium = row.rank <= 3;
                return (
                  <li
                    key={`${row.rank}-${row.user}`}
                    className={cn(
                      "flex items-center justify-between rounded-sm px-2 py-2.5 text-sm",
                      isMe ? "bg-brand-50" : "hover:bg-bg-subtle",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "num inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                          podium
                            ? row.rank === 1
                              ? "bg-warn-soft text-warn"
                              : row.rank === 2
                              ? "bg-bg-subtle text-ink"
                              : "bg-loss-soft text-loss"
                            : "bg-bg-subtle text-ink-muted",
                        )}
                      >
                        {row.rank}
                      </span>
                      <Avatar name={row.user} size="sm" />
                      <span className="font-medium">{row.user}</span>
                      {isMe ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                          YOU
                        </span>
                      ) : null}
                    </div>
                    <span className="num font-semibold">
                      {formatVCFixed(row.value)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Prize pool</CardTitle>
              <CardSubtitle>50 / 30 / 20 split for the top 3.</CardSubtitle>
            </div>
          </CardHeader>
          <PrizePool
            entryFee={contest.entry_fee}
            playerCount={board?.length ?? 0}
          />
        </Card>
      </section>
    </div>
  );
}

function PrizePool({
  entryFee,
  playerCount,
}: {
  entryFee: number;
  playerCount: number;
}) {
  const pool = entryFee * playerCount;
  const splits = [
    { rank: "1st", pct: 0.5 },
    { rank: "2nd", pct: 0.3 },
    { rank: "3rd", pct: 0.2 },
  ];
  return (
    <div>
      <div className="rounded border border-line bg-bg-subtle/60 p-4 text-center">
        <div className="text-xs uppercase tracking-wide text-ink-soft">
          Estimated pool
        </div>
        <div className="num mt-1 text-2xl font-semibold">
          {formatVCFixed(pool)} VC
        </div>
        <div className="mt-1 text-xs text-ink-muted">
          {playerCount} player{playerCount === 1 ? "" : "s"} ·{" "}
          {formatVCFixed(entryFee)} VC entry
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {splits.map((s) => (
          <li
            key={s.rank}
            className="flex items-center justify-between rounded border border-line px-3 py-2 text-sm"
          >
            <span className="font-medium">{s.rank}</span>
            <span className="text-ink-muted">{Math.round(s.pct * 100)}%</span>
            <span className="num font-semibold">
              {formatVCFixed(pool * s.pct)} VC
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ended";
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hr = Math.floor(ms / 3600000);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hr > 0) return `${hr}h ${pad(min)}m`;
  return `${pad(min)}:${pad(sec)}`;
}
