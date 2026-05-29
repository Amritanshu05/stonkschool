"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import Link from "next/link";
import { Trophy, Clock, CheckCircle, Users, ArrowRight, Filter } from "lucide-react";

type Track = "all" | "crypto" | "etf" | "equity";
type Status = "all" | "upcoming" | "live" | "ended";

const TRACK_LABELS: Record<string, string> = { crypto: "Crypto", etf: "ETF", equity: "Equity" };

function ContestCard({ contest }: { contest: Awaited<ReturnType<typeof api.contests.list>>[number] }) {
  const statusMap: Record<string, { label: string; variant: "green" | "amber" | "outline" | "default"; dot: boolean }> = {
    live:              { label: "Live",          variant: "green" as const,   dot: true  },
    upcoming:          { label: "Upcoming",      variant: "amber" as const,   dot: false },
    joining_open:      { label: "Upcoming",      variant: "amber" as const,   dot: false },
    allocation_locked: { label: "Locked",        variant: "amber" as const,   dot: false },
    ended:             { label: "Ended",         variant: "outline" as const, dot: false },
  };
  const statusConfig = statusMap[contest.status] ?? { label: contest.status, variant: "default" as const, dot: false };

  const trackConfig = {
    crypto: { variant: "green" as const },
    etf:    { variant: "amber" as const },
    equity: { variant: "blue" as const },
  }[contest.track as "crypto" | "etf" | "equity"] ?? { variant: "default" as const };

  return (
    <Link href={contest.status === "live" ? `/contests/${contest.id}/live` : `/contests/${contest.id}`}>
      <Card className="group h-full hover:border-line/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={trackConfig.variant} size="sm">
              {TRACK_LABELS[contest.track] ?? contest.track}
            </Badge>
            <Badge variant={statusConfig.variant} size="sm" dot={statusConfig.dot}>
              {statusConfig.label}
            </Badge>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-faint shrink-0 group-hover:text-ink transition-colors" />
        </div>

        {/* Title */}
        <div>
          <h3 className="font-semibold text-ink leading-snug">{contest.title}</h3>
        </div>

        {/* Meta */}
        <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-line">
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">Entry Fee</p>
            <p className="num text-sm font-semibold text-ink">
              {formatCurrency(contest.entry_fee, "V")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">Starts</p>
            <p className="num text-sm font-semibold text-ink">
              {formatDateTime(contest.start_time)}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function ContestsPage() {
  const [track, setTrack] = useState<Track>("all");
  const [status, setStatus] = useState<Status>("all");

  const { data: contests, isLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: api.contests.list,
  });

  const filtered = contests?.filter((c) => {
    if (track !== "all" && c.track !== track) return false;
    if (status !== "all" && c.status !== status) return false;
    return true;
  }) ?? [];

  const tracks: { key: Track; label: string }[] = [
    { key: "all",    label: "All Markets" },
    { key: "crypto", label: "Crypto" },
    { key: "etf",    label: "ETF" },
    { key: "equity", label: "Equity" },
  ];

  const statuses: { key: Status; label: string; icon: any }[] = [
    { key: "all",      label: "All",      icon: Filter },
    { key: "live",     label: "Live",     icon: Trophy },
    { key: "upcoming", label: "Upcoming", icon: Clock },
    { key: "ended",    label: "Ended",    icon: CheckCircle },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber" />
          Contests
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Compete with equal capital. Prove your edge in crypto, ETFs, and equities.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Track filter */}
        <div className="flex gap-1.5 flex-wrap">
          {tracks.map((t) => (
            <button
              key={t.key}
              onClick={() => setTrack(t.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                track === t.key
                  ? "bg-green/10 text-green border border-green/20"
                  : "bg-bg-subtle text-ink-muted hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                status === s.key
                  ? "bg-bg-elevated text-ink border border-line"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-bg-subtle animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Trophy className="h-12 w-12 text-ink-faint" />
          <p className="text-ink-muted">No contests found for this filter.</p>
          <Button variant="ghost" onClick={() => { setTrack("all"); setStatus("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ContestCard key={c.id} contest={c} />
          ))}
        </div>
      )}

      {/* Live count */}
      {contests && (
        <div className="mt-8 flex items-center gap-2 text-sm text-ink-faint">
          <Users className="h-4 w-4" />
          <span>
            {contests.filter((c) => c.status === "live").length} live ·{" "}
            {contests.filter((c) => c.status === "upcoming").length} upcoming ·{" "}
            {contests.length} total
          </span>
        </div>
      )}
    </div>
  );
}
