"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shell/PageHeader";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { formatVCFixed } from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import { useContestDetails, useMyContests } from "@/lib/hooks";
import { cn } from "@/lib/cn";

export function AllocateView({ contestId }: { contestId: string }) {
  const { data: contest, isLoading } = useContestDetails(contestId);
  const { data: my, mutate: mutateMy } = useMyContests();
  const router = useRouter();

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myEntry = my?.find((c) => c.contest_id === contestId);
  const alreadyLocked = Boolean(myEntry?.locked_at);

  useEffect(() => {
    if (!contest) return;
    setAllocations((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      // Default to even split.
      const n = contest.assets.length;
      if (n === 0) return {};
      const even = Math.floor(100 / n);
      const out: Record<string, number> = {};
      contest.assets.forEach((a, i) => {
        out[a.id] = i === 0 ? 100 - even * (n - 1) : even;
      });
      return out;
    });
  }, [contest]);

  const total = useMemo(
    () => Object.values(allocations).reduce((s, v) => s + (Number(v) || 0), 0),
    [allocations],
  );
  const isValid = total === 100 && Object.values(allocations).every((v) => v >= 0);

  function setOne(id: string, value: number) {
    setAllocations((prev) => ({ ...prev, [id]: clamp0to100(value) }));
  }

  function distributeEvenly() {
    if (!contest) return;
    const n = contest.assets.length;
    const even = Math.floor(100 / n);
    const out: Record<string, number> = {};
    contest.assets.forEach((a, i) => {
      out[a.id] = i === 0 ? 100 - even * (n - 1) : even;
    });
    setAllocations(out);
  }

  async function handleLock() {
    if (!contest) return;
    setSubmitting(true);
    setError(null);
    try {
      await api(`/api/v1/contests/${contestId}/allocate`, {
        method: "POST",
        body: {
          allocations: Object.entries(allocations).map(([asset_id, pct]) => ({
            asset_id,
            pct,
          })),
        },
      });
      await mutateMy();
      router.push(`/contests/${contestId}/live`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message || `Could not lock (${err.status})`
          : "Could not lock allocation";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !contest) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-6 h-72 w-full" />
      </div>
    );
  }

  if (alreadyLocked) {
    return (
      <div className="container py-8">
        <PageHeader
          title="Allocation already locked"
          description="You're set. Watch your portfolio in the live view."
        />
        <Card className="mt-6">
          <p className="text-sm text-ink-muted">
            Your allocation for this contest has been locked. The leaderboard
            updates as the market moves.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href={`/contests/${contestId}/live`}>
              <Button>Open live view</Button>
            </Link>
            <Link href={`/contests/${contestId}`}>
              <Button variant="secondary">Back to contest</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <PageHeader
        title={`Allocate · ${contest.title}`}
        description="Split 100% of your starting capital across the basket. Once locked, this can't be changed during the contest."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{contest.track}</Badge>
            <StatusBadge status={contest.status} />
            <span className="text-xs text-ink-muted">
              Starting capital · {formatVCFixed(contest.virtual_capital)} VC
            </span>
          </div>
        }
        actions={
          <Button
            variant="secondary"
            size="md"
            onClick={distributeEvenly}
            type="button"
          >
            Reset to even split
          </Button>
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
              <CardTitle>Your allocation</CardTitle>
              <CardSubtitle>Drag, type, or use the quick buttons.</CardSubtitle>
            </div>
          </CardHeader>

          <ul className="space-y-5">
            {contest.assets.map((a) => {
              const pct = allocations[a.id] ?? 0;
              const capital = (contest.virtual_capital * pct) / 100;
              return (
                <li key={a.id} className="rounded border border-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 font-semibold text-brand-700">
                        {a.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{a.symbol}</div>
                        <div className="text-xs text-ink-muted">
                          {formatVCFixed(capital)} VC
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOne(a.id, pct - 5)}
                        className="ss-focus rounded-sm border border-line px-2.5 py-1 text-sm hover:bg-bg-subtle"
                      >
                        −5
                      </button>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={pct}
                          onChange={(e) =>
                            setOne(a.id, Number(e.target.value || 0))
                          }
                          className="ss-focus h-9 w-20 rounded-sm border border-line bg-bg-surface px-3 text-right num text-sm"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
                          %
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOne(a.id, pct + 5)}
                        className="ss-focus rounded-sm border border-line px-2.5 py-1 text-sm hover:bg-bg-subtle"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={pct}
                      onChange={(e) =>
                        setOne(a.id, Number(e.target.value))
                      }
                      className="ss-focus w-full accent-brand-500"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <div>
              <CardTitle>Summary</CardTitle>
              <CardSubtitle>Lock when total reads 100%.</CardSubtitle>
            </div>
          </CardHeader>

          <div className="rounded border border-line p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Allocated</span>
              <span
                className={cn(
                  "num font-semibold",
                  total === 100 ? "text-gain" : total > 100 ? "text-loss" : "text-ink",
                )}
              >
                {total}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
              <div
                className={cn(
                  "h-full transition-[width] duration-200 ease-snappy",
                  total > 100 ? "bg-loss" : "bg-brand-500",
                )}
                style={{ width: `${Math.min(total, 100)}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-ink-muted">
              {total === 100
                ? "Looks good. You can lock now."
                : total > 100
                ? `Trim ${total - 100}% from somewhere.`
                : `Add ${100 - total}% more.`}
            </div>
          </div>

          <div className="mt-4 space-y-1 text-xs text-ink-muted">
            <Row label="Starting capital" value={`${formatVCFixed(contest.virtual_capital)} VC`} />
            <Row label="Entry paid" value={`${formatVCFixed(contest.entry_fee)} VC`} />
            <Row label="Asset count" value={contest.assets.length} />
          </div>

          <Button
            fullWidth
            size="lg"
            className="mt-5"
            disabled={!isValid || submitting}
            loading={submitting}
            onClick={handleLock}
          >
            Lock allocation
          </Button>
          <p className="mt-2 text-center text-xs text-ink-soft">
            You can still leave this page — nothing is locked until you tap the
            button.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="num text-ink">{value}</span>
    </div>
  );
}

function clamp0to100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
