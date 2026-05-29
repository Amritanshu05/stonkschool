"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import * as Slider from "@radix-ui/react-slider";
import { toast } from "sonner";
import {
  Trophy,
  Lock,
  Users,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: contest, isLoading } = useQuery({
    queryKey: ["contest", id],
    queryFn: () => api.contests.get(id),
  });

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: api.wallet.balance,
  });

  // Allocation state: map from asset_id → pct
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [joined, setJoined] = useState(false);
  const [locked, setLocked] = useState(false);

  const { data: statusData } = useQuery({
    queryKey: ["contest-status", id],
    queryFn: () => api.contests.status(id),
    enabled: !!contest,
  });

  useEffect(() => {
    if (statusData) {
      setJoined(statusData.joined);
      setLocked(statusData.locked);

      if (statusData.joined && !statusData.locked && Object.keys(allocations).length === 0 && contest) {
        // Init equal allocation
        const equal = Math.floor(100 / contest.assets.length);
        const init = Object.fromEntries(
          contest.assets.map((a, i) => [
            a.id,
            i === 0 ? 100 - equal * (contest.assets.length - 1) : equal,
          ])
        );
        setAllocations(init);
      }
    }
  }, [statusData, contest]);

  const joinMutation = useMutation({
    mutationFn: () => api.contests.join(id),
    onSuccess: () => {
      setJoined(true);
      // Init equal allocation
      if (contest) {
        const equal = Math.floor(100 / contest.assets.length);
        const init = Object.fromEntries(contest.assets.map((a, i) => [
          a.id,
          i === 0 ? 100 - equal * (contest.assets.length - 1) : equal,
        ]));
        setAllocations(init);
      }
      toast.success("Joined! Now allocate your capital.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lockMutation = useMutation({
    mutationFn: () =>
      api.contests.allocate(
        id,
        Object.entries(allocations).map(([asset_id, pct]) => ({ asset_id, pct }))
      ),
    onSuccess: () => {
      setLocked(true);
      toast.success("Allocation locked! Good luck 🚀");
      setTimeout(() => router.push(`/contests/${id}/live`), 1500);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = 100 - totalAllocated;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-bg-subtle animate-pulse" />
        ))}
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <Trophy className="mx-auto h-10 w-10 text-ink-faint mb-3" />
        <p className="text-ink-muted">Contest not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Contest header */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              <Badge variant={contest.track === "crypto" ? "green" : contest.track === "etf" ? "amber" : "blue"} size="md">
                {contest.track.toUpperCase()}
              </Badge>
              <Badge
                variant={contest.status === "live" ? "green" : contest.status === "upcoming" ? "amber" : "outline"}
                size="md"
                dot={contest.status === "live"}
              >
                {contest.status}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-ink">{contest.title}</h1>
          </div>

          <div className="text-right">
            <p className="text-xs text-ink-faint uppercase tracking-wider">Entry Fee</p>
            <p className="num text-2xl font-bold text-amber">
              {formatCurrency(contest.entry_fee, "V")}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 pt-4 border-t border-line">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Calendar className="h-4 w-4 text-green" />
            <div>
              <p className="text-xs text-ink-faint">Starts</p>
              <p className="font-medium text-ink">{formatDateTime(contest.start_time)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Users className="h-4 w-4 text-green" />
            <div>
              <p className="text-xs text-ink-faint">Max Assets</p>
              <p className="font-medium text-ink">{contest.rules.max_assets}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Trophy className="h-4 w-4 text-amber" />
            <div>
              <p className="text-xs text-ink-faint">Min Allocation</p>
              <p className="font-medium text-ink">{contest.rules.min_allocation_pct}% per asset</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Assets in this contest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {contest.assets.map((a) => (
              <Badge key={a.id} variant="outline" size="lg">
                {a.symbol}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Join / Allocate */}
      {(contest.status === "live" || contest.status === "ended") ? (
        <Card className="text-center py-8">
          <div className="flex flex-col items-center justify-center">
            {contest.status === "live" ? (
              <div className="h-3 w-3 rounded-full bg-green animate-pulse mb-3" />
            ) : (
              <Trophy className="h-10 w-10 text-amber mb-3" />
            )}
            <p className="font-semibold text-ink">
              {contest.status === "live" ? "Contest is Live!" : "Contest Has Ended"}
            </p>
            <p className="text-sm text-ink-muted mt-1 mb-5 max-w-md">
              {joined
                ? "You are a participant. Follow real-time progress on the leaderboard."
                : "This contest is no longer accepting new participants."}
            </p>
            <Button
              onClick={() => router.push(`/contests/${id}/live`)}
            >
              {contest.status === "live" ? "Go to Live Leaderboard 🚀" : "View Final Standings 🏆"}
            </Button>
          </div>
        </Card>
      ) : !joined ? (
        <Card>
          <CardHeader>
            <CardTitle>Join Contest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {walletData && (
              <div className="flex items-center justify-between rounded-lg bg-bg-subtle px-4 py-3">
                <span className="text-sm text-ink-muted">Your balance</span>
                <span className="num font-semibold text-ink">
                  {formatCurrency(walletData.balance, "V", true)}
                </span>
              </div>
            )}
            {walletData && walletData.balance < contest.entry_fee && (
              <div className="flex items-center gap-2 rounded-lg bg-red-muted px-4 py-3 text-sm text-red">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Insufficient balance to join this contest.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={() => joinMutation.mutate()}
              loading={joinMutation.isPending}
              disabled={!!walletData && walletData.balance < contest.entry_fee}
            >
              <Trophy className="h-4 w-4" />
              Join for {formatCurrency(contest.entry_fee, "V")}
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </CardFooter>
        </Card>
      ) : locked ? (
        <Card className="text-center py-6">
          <CheckCircle className="mx-auto h-10 w-10 text-green mb-3" />
          <p className="font-semibold text-ink">Allocation Locked!</p>
          <p className="text-sm text-ink-muted mt-1">Redirecting to live view…</p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green" />
              Allocate Your Capital
            </CardTitle>
            <div className="text-right">
              <span className={`num text-sm font-semibold ${remaining === 0 ? "text-green" : remaining < 0 ? "text-red" : "text-amber"}`}>
                {remaining}% remaining
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {contest.assets.map((asset) => {
              const val = allocations[asset.id] ?? 0;
              return (
                <div key={asset.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-ink">{asset.symbol}</span>
                    <span className="num text-sm font-bold text-green">{val}%</span>
                  </div>
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={[val]}
                    onValueChange={([v]) =>
                      setAllocations((prev) => ({ ...prev, [asset.id]: v }))
                    }
                    min={0}
                    max={100}
                    step={1}
                  >
                    <Slider.Track className="relative bg-bg-subtle rounded-full h-1.5 flex-1">
                      <Slider.Range className="absolute bg-green rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb
                      className="block h-5 w-5 rounded-full border-2 border-green bg-bg-surface shadow-md focus:outline-none focus:ring-2 focus:ring-green/40 transition-transform hover:scale-110"
                      aria-label={`${asset.symbol} allocation`}
                    />
                  </Slider.Root>
                  <div className="flex justify-between text-[10px] text-ink-faint mt-1">
                    <span>0%</span>
                    <span>
                      ≈ {formatCurrency(Math.round((val / 100) * 100_000), "V", true)}
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              );
            })}

            {/* Total bar */}
            <div>
              <div className="flex justify-between text-xs text-ink-faint mb-1">
                <span>Total Allocated</span>
                <span className={`num font-semibold ${totalAllocated === 100 ? "text-green" : totalAllocated > 100 ? "text-red" : "text-amber"}`}>
                  {totalAllocated}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-bg-subtle overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${totalAllocated === 100 ? "bg-green" : totalAllocated > 100 ? "bg-red" : "bg-amber"}`}
                  style={{ width: `${Math.min(totalAllocated, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={() => lockMutation.mutate()}
              loading={lockMutation.isPending}
              disabled={totalAllocated !== 100}
            >
              <Lock className="h-4 w-4" />
              Lock Allocation
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
