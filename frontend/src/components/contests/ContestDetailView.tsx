"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shell/PageHeader";
import {
  formatDateLong,
  formatRelative,
  formatVCFixed,
} from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import {
  useContestDetails,
  useLeaderboard,
  useMyContests,
  useUser,
} from "@/lib/hooks";

export function ContestDetailView({ contestId }: { contestId: string }) {
  const { data: contest, isLoading } = useContestDetails(contestId);
  const { data: leaderboard } = useLeaderboard(contestId);
  const { user } = useUser();
  const { data: my, mutate: mutateMy } = useMyContests();
  const router = useRouter();

  const myEntry = my?.find((c) => c.contest_id === contestId);
  const alreadyJoined = Boolean(myEntry);
  const alreadyLocked = Boolean(myEntry?.locked_at);

  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!user) {
      router.push("/login");
      return;
    }
    setJoining(true);
    setError(null);
    try {
      await api(`/api/v1/contests/${contestId}/join`, { method: "POST" });
      await mutateMy();
      router.push(`/contests/${contestId}/allocate`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message || `Could not join (${err.status})`
          : "Could not join contest";
      setError(msg);
    } finally {
      setJoining(false);
    }
  }

  if (isLoading || !contest) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-72" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const showJoinCta = contest.status === "joining_open" && !alreadyJoined;
  const showAllocateCta =
    alreadyJoined && !alreadyLocked && contest.status !== "live" && contest.status !== "ended";
  const showLeaderboard =
    contest.status === "live" ||
    contest.status === "ended" ||
    contest.status === "settled";

  return (
    <div className="container py-8">
      <PageHeader
        title={contest.title}
        description="Allocate, lock, watch. The market does the rest."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{contest.track}</Badge>
            <StatusBadge status={contest.status} />
            <span className="text-xs text-ink-muted">
              Starts {formatRelative(contest.start_time)} ·{" "}
              {formatDateLong(contest.start_time)}
            </span>
          </div>
        }
        actions={
          <>
            {showJoinCta ? (
              <Button onClick={handleJoin} loading={joining}>
                Join for {formatVCFixed(contest.entry_fee)} VC
              </Button>
            ) : null}
            {showAllocateCta ? (
              <Link href={`/contests/${contestId}/allocate`}>
                <Button>Allocate now</Button>
              </Link>
            ) : null}
            {contest.status === "live" && alreadyJoined ? (
              <Link href={`/contests/${contestId}/live`}>
                <Button>Open live view</Button>
              </Link>
            ) : null}
            {contest.status === "settled" ? (
              <Link href={`/contests/${contestId}/results`}>
                <Button>See results</Button>
              </Link>
            ) : null}
          </>
        }
      />

      {error ? (
        <div className="mt-4 rounded border border-loss/40 bg-loss-soft px-4 py-2.5 text-sm text-loss">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Contest details</CardTitle>
              <CardSubtitle>Everything you need before you join.</CardSubtitle>
            </div>
          </CardHeader>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
            <Field label="Track" value={contest.track} />
            <Field
              label="Entry"
              value={`${formatVCFixed(contest.entry_fee)} VC`}
            />
            <Field
              label="Starting capital"
              value={`${formatVCFixed(contest.virtual_capital)} VC`}
            />
            <Field label="Status" value={<StatusBadge status={contest.status} />} />
            <Field
              label="Starts"
              value={formatDateLong(contest.start_time)}
              sub={formatRelative(contest.start_time)}
            />
            <Field
              label="Ends"
              value={formatDateLong(contest.end_time)}
              sub={formatRelative(contest.end_time)}
            />
          </dl>

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Asset basket
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {contest.assets.length === 0 ? (
                <span className="text-sm text-ink-muted">
                  No assets configured.
                </span>
              ) : (
                contest.assets.map((a) => (
                  <span
                    key={a.id}
                    className="rounded border border-line bg-bg-subtle px-3 py-1.5 text-sm font-semibold"
                  >
                    {a.symbol}
                  </span>
                ))
              )}
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              You&apos;ll split your starting capital across these assets. The
              percentages must sum to 100. Once locked, the allocation
              can&apos;t be changed during the contest.
            </p>
          </div>

          <div className="mt-6 rounded bg-bg-subtle p-4 text-sm text-ink-muted">
            <strong className="text-ink">Prize split:</strong> 50% / 30% / 20%
            of the pool to ranks 1, 2 and 3. Pool size = entry fee × number of
            participants.
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Leaderboard preview</CardTitle>
              <CardSubtitle>
                {showLeaderboard
                  ? "Top players right now."
                  : "Available once the contest is live."}
              </CardSubtitle>
            </div>
          </CardHeader>

          {!showLeaderboard ? (
            <div className="rounded border border-dashed border-line p-6 text-center text-sm text-ink-muted">
              The leaderboard activates the moment the bell rings.
            </div>
          ) : !leaderboard ? (
            <div className="space-y-2">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-sm text-ink-muted">
              No portfolios computed yet.
            </div>
          ) : (
            <ul className="space-y-1">
              {leaderboard.slice(0, 8).map((row) => (
                <li
                  key={`${row.rank}-${row.user}`}
                  className="flex items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-bg-subtle"
                >
                  <div className="flex items-center gap-3">
                    <span className="num w-7 text-ink-soft">#{row.rank}</span>
                    <span className="font-medium">{row.user}</span>
                  </div>
                  <span className="num font-semibold">
                    {formatVCFixed(row.value)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
      {sub ? <dd className="text-xs text-ink-muted">{sub}</dd> : null}
    </div>
  );
}
