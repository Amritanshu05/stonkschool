"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";
import { useContests } from "@/lib/hooks";
import {
  formatDateLong,
  formatRelative,
  formatVCFixed,
} from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ContestListItem, ContestStatus } from "@/lib/types";

type Filter = "all" | "open" | "starting_soon" | "live";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open to join" },
  { id: "starting_soon", label: "Starting soon" },
  { id: "live", label: "Live now" },
];

export function ContestListView() {
  const { data, isLoading } = useContests();
  const [filter, setFilter] = useState<Filter>("all");
  const [track, setTrack] = useState<string>("all");

  const tracks = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((c) => set.add(c.track));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((c) => {
      if (track !== "all" && c.track !== track) return false;
      if (filter === "open" && c.status !== "joining_open") return false;
      if (filter === "starting_soon" && c.status !== "upcoming") return false;
      if (filter === "live" && c.status !== "live") return false;
      return true;
    });
  }, [data, filter, track]);

  return (
    <div className="container py-8">
      <PageHeader
        title="Contests"
        description="Short, skill-based matches against other learners. Pick your track, lock your allocation, and see how it plays out."
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md bg-bg-subtle p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.id
                  ? "bg-bg-surface text-ink shadow-card"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {tracks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-ink-soft">
              Track
            </span>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="ss-focus h-9 rounded-sm border border-line bg-bg-surface px-3 text-sm"
            >
              <option value="all">All tracks</option>
              {tracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <section className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              title="No contests match your filter"
              description="Try switching tracks or come back in a few minutes — new contests open regularly."
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <ContestCard key={c.id} contest={c} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>How contests work</CardTitle>
              <CardSubtitle>
                Two-minute primer for first-time players.
              </CardSubtitle>
            </div>
          </CardHeader>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Join", "Pay a small entry in virtual coins."],
              ["Allocate", "Split 100% across the basket."],
              ["Lock & watch", "We compute portfolio values live."],
              ["Settle", "Top three split the prize pool."],
            ].map(([t, b], i) => (
              <li
                key={t}
                className="rounded border border-line p-3"
              >
                <div className="num text-xs font-semibold tracking-widest text-brand-600">
                  0{i + 1}
                </div>
                <div className="mt-1 text-sm font-semibold">{t}</div>
                <div className="mt-1 text-xs text-ink-muted">{b}</div>
              </li>
            ))}
          </ol>
        </Card>
      </section>
    </div>
  );
}

function ContestCard({ contest }: { contest: ContestListItem }) {
  return (
    <Link
      href={`/contests/${contest.id}`}
      className="ss-card-hover block p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{contest.track}</Badge>
            <StatusBadge status={contest.status as ContestStatus} />
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-semibold text-ink">
            {contest.title}
          </h3>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-ink-soft">Entry</div>
          <div className="num mt-0.5 font-semibold">
            {formatVCFixed(contest.entry_fee)} VC
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-soft">Starts</div>
          <div className="mt-0.5 text-sm">
            <div className="font-semibold">
              {formatRelative(contest.start_time)}
            </div>
            <div className="text-xs text-ink-muted">
              {formatDateLong(contest.start_time)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
