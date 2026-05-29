"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  PlayCircle,
  ChevronRight,
  Calendar,
  TrendingUp,
  Search,
} from "lucide-react";

const ASSET_TYPES = ["all", "crypto", "etf", "equity"] as const;
type AssetType = typeof ASSET_TYPES[number];

export default function ReplayHubPage() {
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<AssetType>("all");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets", assetType],
    queryFn: () =>
      api.assets.list(assetType === "all" ? undefined : assetType),
  });

  const createReplay = useMutation({
    mutationFn: () =>
      api.replay.create({
        asset_id: selectedAsset!,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      }),
    onSuccess: (data) => {
      router.push(`/replay/${data.replay_id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const TRACK_COLORS: Record<string, "green" | "amber" | "blue" | "default"> = {
    crypto: "green",
    etf: "amber",
    equity: "blue",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-green" />
          Market Replay
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Replay historical market data and practice trading in a time-controlled environment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Asset selector */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Filter tabs */}
          <div className="flex gap-1.5">
            {ASSET_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setAssetType(t); setSelectedAsset(null); }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                  assetType === t
                    ? "bg-green/10 text-green border border-green/20"
                    : "bg-bg-subtle text-ink-muted hover:text-ink"
                }`}
              >
                {t === "all" ? "All Assets" : t}
              </button>
            ))}
          </div>

          {/* Asset grid */}
          {isLoading ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-bg-subtle animate-pulse" />
              ))}
            </div>
          ) : !assets?.length ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <Search className="h-8 w-8 text-ink-faint" />
              <p className="text-sm text-ink-muted">No assets found.</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.id === selectedAsset ? null : asset.id)}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${
                    selectedAsset === asset.id
                      ? "border-green bg-green/10"
                      : "border-line bg-bg-surface hover:border-line/80 hover:bg-bg-subtle"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm text-ink">{asset.symbol}</p>
                    <Badge variant={TRACK_COLORS[asset.type] ?? "default"} size="sm" className="mt-1">
                      {asset.type}
                    </Badge>
                  </div>
                  {selectedAsset === asset.id && (
                    <div className="h-4 w-4 rounded-full bg-green flex items-center justify-center">
                      <svg className="h-2.5 w-2.5 text-bg" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Config panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-ink-faint uppercase tracking-wider mb-1.5 block">
                  From
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-line bg-bg-subtle px-3 py-2 text-sm text-ink focus:outline-none focus:border-green transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-ink-faint uppercase tracking-wider mb-1.5 block">
                  To
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg border border-line bg-bg-subtle px-3 py-2 text-sm text-ink focus:outline-none focus:border-green transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected asset info */}
          {selectedAsset && (
            <Card className="border-green/20 bg-green/5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green" />
                <span className="font-semibold text-sm text-ink">
                  {assets?.find((a) => a.id === selectedAsset)?.symbol}
                </span>
              </div>
              <div className="text-xs text-ink-muted space-y-1">
                <p>Period: {formatDate(from)} — {formatDate(to)}</p>
              </div>
            </Card>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={!selectedAsset}
            loading={createReplay.isPending}
            onClick={() => createReplay.mutate()}
          >
            <PlayCircle className="h-4 w-4" />
            Start Replay
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </div>
    </div>
  );
}
