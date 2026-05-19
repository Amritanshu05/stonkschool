"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/shell/PageHeader";
import { swrFetcher } from "@/lib/api";
import {
  useContestDetails,
  useLeaderboard,
  useUser,
} from "@/lib/hooks";
import { formatDateLong, formatPct, formatVCFixed } from "@/lib/format";
import type { ContestResults } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ResultsView({ contestId }: { contestId: string }) {
  const { user } = useUser();
  const { data: contest } = useContestDetails(contestId);
  const { data: leaderboard } = useLeaderboard(contestId);

  // /results requires a session and only returns once settled.
  // Use ApiError-aware SWR; null → not yet settled or you didn't play.
  const { data: myResult, error: myErr } = useSWR<ContestResults>(
    `/api/v1/contests/${contestId}/results`,
    swrFetcher,
    { shouldRetryOnError: false },
  );

  if (!contest) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-6 h-72 w-full" />
      </div>
    );
  }

  const settled = contest.status === "settled" || contest.status === "ended";
  const podium = (leaderboard ?? []).filter((r) => r.rank <= 3);
  const myDelta =
    myResult?.final_value != null
      ? ((Number(myResult.final_value) - Number(contest.virtual_capital)) /
          Number(contest.virtual_capital)) *
        100
      : null;

  return (
    <div className="container py-8">
      <PageHeader
        title={`Results · ${contest.title}`}
        description="The market called it. Here's how it shook out."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{contest.track}</Badge>
            <StatusBadge status={contest.status} />
            <span className="text-xs text-ink-muted">
              Ended {formatDateLong(contest.end_time)}
            </span>
          </div>
        }
        actions={
          <>
            <Link href="/contests">
              <Button>Find another</Button>
            </Link>
            <Link href={`/contests/${contestId}`}>
              <Button variant="secondary">Contest details</Button>
            </Link>
          </>
        }
      />

      {!settled ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-muted">
            This contest hasn&apos;t ended yet. Come back when it&apos;s
            settled.
          </p>
        </Card>
      ) : (
        <>
          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Podium</CardTitle>
                  <CardSubtitle>
                    Top three split the pool, 50 / 30 / 20.
                  </CardSubtitle>
                </div>
              </CardHeader>

              {!leaderboard ? (
                <Skeleton className="h-40" />
              ) : podium.length === 0 ? (
                <div className="rounded border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                  No leaderboard data available.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[2, 1, 3]
                    .map((wantRank) => podium.find((p) => p.rank === wantRank))
                    .filter((x): x is NonNullable<typeof x> => Boolean(x))
                    .map((row) => (
                      <PodiumCard
                        key={row.rank}
                        rank={row.rank}
                        name={row.user}
                        value={Number(row.value)}
                      />
                    ))}
                </div>
              )}
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Your finish</CardTitle>
                  <CardSubtitle>
                    {user ? `Hi, ${user.display_name.split(" ")[0]}.` : ""}
                  </CardSubtitle>
                </div>
              </CardHeader>

              {myErr ? (
                <div className="rounded border border-dashed border-line p-4 text-sm text-ink-muted">
                  You didn&apos;t play this contest, or it isn&apos;t settled
                  for you yet.
                </div>
              ) : !myResult ? (
                <Skeleton className="h-32" />
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-ink-soft">
                      Final rank
                    </div>
                    <div className="num text-3xl font-semibold">
                      #{myResult.rank}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field
                      label="Final value"
                      value={`${formatVCFixed(myResult.final_value)} VC`}
                      sub={
                        myDelta != null
                          ? `${myDelta >= 0 ? "+" : ""}${formatPct(myDelta)} vs starting`
                          : undefined
                      }
                      tone={
                        myDelta != null && myDelta > 0
                          ? "up"
                          : myDelta != null && myDelta < 0
                          ? "down"
                          : "flat"
                      }
                    />
                    <Field
                      label="Prize"
                      value={
                        myResult.payout != null
                          ? `+${formatVCFixed(myResult.payout)} VC`
                          : "—"
                      }
                      sub={myResult.rank <= 3 ? "Credited to wallet" : "No prize this time"}
                      tone={
                        myResult.payout != null && Number(myResult.payout) > 0
                          ? "up"
                          : "flat"
                      }
                    />
                  </div>
                </div>
              )}
            </Card>
          </section>

          <section className="mt-8">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Final leaderboard</CardTitle>
                  <CardSubtitle>Top 25 players ranked by portfolio value.</CardSubtitle>
                </div>
              </CardHeader>
              {!leaderboard ? (
                <Skeleton className="h-40" />
              ) : leaderboard.length === 0 ? (
                <div className="text-sm text-ink-muted">No data.</div>
              ) : (
                <ul className="thin-scroll max-h-[28rem] overflow-y-auto pr-1">
                  {leaderboard.slice(0, 25).map((row) => {
                    const isMe = user?.display_name === row.user;
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
                              row.rank === 1 && "bg-warn-soft text-warn",
                              row.rank === 2 && "bg-bg-subtle text-ink",
                              row.rank === 3 && "bg-loss-soft text-loss",
                              row.rank > 3 && "bg-bg-subtle text-ink-muted",
                            )}
                          >
                            {row.rank}
                          </span>
                          <Avatar name={row.user} size="sm" />
                          <span className="font-medium">{row.user}</span>
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
          </section>
        </>
      )}
    </div>
  );
}

function PodiumCard({
  rank,
  name,
  value,
}: {
  rank: number;
  name: string;
  value: number;
}) {
  const tone =
    rank === 1
      ? "bg-warn-soft text-warn"
      : rank === 2
      ? "bg-bg-subtle text-ink"
      : "bg-loss-soft text-loss";
  const order = rank === 1 ? "sm:order-2" : rank === 2 ? "sm:order-1" : "sm:order-3";
  const height = rank === 1 ? "sm:py-10" : rank === 2 ? "sm:py-8" : "sm:py-6";

  return (
    <div
      className={cn(
        "ss-card flex flex-col items-center gap-2 p-5 text-center",
        order,
        height,
      )}
    >
      <span
        className={cn(
          "num inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
          tone,
        )}
      >
        {rank}
      </span>
      <Avatar name={name} size="lg" />
      <div className="font-semibold">{name}</div>
      <div className="num text-lg font-semibold">{formatVCFixed(value)} VC</div>
    </div>
  );
}

function Field({
  label,
  value,
  sub,
  tone = "flat",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "up" | "down" | "flat";
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink-soft">{label}</div>
      <div
        className={cn(
          "num mt-1 text-base font-semibold",
          tone === "up" && "text-gain",
          tone === "down" && "text-loss",
        )}
      >
        {value}
      </div>
      {sub ? <div className="text-xs text-ink-muted">{sub}</div> : null}
    </div>
  );
}
