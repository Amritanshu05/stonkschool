"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shell/PageHeader";
import { useAssets } from "@/lib/hooks";
import { api, ApiError } from "@/lib/api";
import type { Asset, CreateReplayResponse } from "@/lib/types";
import { cn } from "@/lib/cn";

const WINDOWS = [
  { id: "30m", label: "Last 30 minutes", minutes: 30 },
  { id: "2h", label: "Last 2 hours", minutes: 120 },
  { id: "6h", label: "Last 6 hours", minutes: 360 },
  { id: "1d", label: "Last 24 hours", minutes: 1440 },
] as const;

export function ReplayLanding() {
  const { data: assets, isLoading } = useAssets();
  const [selected, setSelected] = useState<Asset | null>(null);
  const [windowId, setWindowId] = useState<typeof WINDOWS[number]["id"]>("2h");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!selected && assets && assets.length > 0) {
      setSelected(assets[0]);
    }
  }, [assets, selected]);

  const grouped = useMemo(() => {
    const map: Record<string, Asset[]> = {};
    (assets ?? []).forEach((a) => {
      const k = a.type || "other";
      (map[k] ??= []).push(a);
    });
    return map;
  }, [assets]);

  async function handleStart() {
    if (!selected) return;
    setCreating(true);
    setError(null);
    try {
      const w = WINDOWS.find((x) => x.id === windowId)!;
      const to = new Date();
      // Snap to minute, sub a few seconds to stay safely behind the latest candle.
      to.setSeconds(0, 0);
      const from = new Date(to.getTime() - w.minutes * 60_000);
      const fmt = (d: Date) =>
        d.toISOString().replace(/\.\d{3}Z$/, "Z").replace(/\.\d+Z$/, "Z");
      const res = await api<CreateReplayResponse>("/api/v1/replay", {
        method: "POST",
        body: {
          asset_id: selected.id,
          from: fmt(from),
          to: fmt(to),
        },
      });
      router.push(`/replay/${res.replay_id}?asset=${selected.id}&from=${encodeURIComponent(fmt(from))}&to=${encodeURIComponent(fmt(to))}&symbol=${encodeURIComponent(selected.symbol)}`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message || `Could not start replay (${err.status})`
          : "Could not start replay";
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="container py-8">
      <PageHeader
        title="Replay"
        description="Pick a market and a window. We'll stream it tick-by-tick so you can practise without risk."
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
              <CardTitle>Choose an asset</CardTitle>
              <CardSubtitle>Same data the contests use.</CardSubtitle>
            </div>
          </CardHeader>

          {isLoading ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-sm text-ink-muted">No assets available.</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([type, list]) => (
                <div key={type}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {labelForType(type)}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {list.map((a) => {
                      const active = selected?.id === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => setSelected(a)}
                          className={cn(
                            "ss-focus flex items-center justify-between rounded border bg-bg-surface p-3 text-left transition-colors",
                            active
                              ? "border-brand-500 ring-1 ring-brand-500"
                              : "border-line hover:border-line-strong",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-sm font-semibold text-brand-700">
                              {a.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">
                                {a.symbol}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {a.name}
                              </div>
                            </div>
                          </div>
                          {active ? (
                            <span className="text-xs font-medium text-brand-700">
                              Selected
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="self-start">
          <CardHeader>
            <div>
              <CardTitle>Replay window</CardTitle>
              <CardSubtitle>How far back to start.</CardSubtitle>
            </div>
          </CardHeader>

          <div className="space-y-2">
            {WINDOWS.map((w) => {
              const active = w.id === windowId;
              return (
                <button
                  key={w.id}
                  onClick={() => setWindowId(w.id)}
                  className={cn(
                    "ss-focus flex w-full items-center justify-between rounded border bg-bg-surface px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "border-brand-500 ring-1 ring-brand-500"
                      : "border-line hover:border-line-strong",
                  )}
                >
                  <span className="font-medium">{w.label}</span>
                  <span className="text-xs text-ink-muted">
                    {w.minutes} min
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            fullWidth
            size="lg"
            className="mt-5"
            disabled={!selected || creating}
            loading={creating}
            onClick={handleStart}
          >
            Start replay
          </Button>
          <p className="mt-2 text-center text-xs text-ink-soft">
            We stream 1 tick / second over WebSocket.
          </p>
        </Card>
      </div>
    </div>
  );
}

function labelForType(t: string): string {
  switch (t) {
    case "crypto":
      return "Crypto";
    case "equity":
      return "Equities";
    case "etf":
      return "ETFs";
    default:
      return t.charAt(0).toUpperCase() + t.slice(1);
  }
}
