"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/lib/ws";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPnlColor } from "@/lib/utils";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Gauge,
  ArrowUp,
  ArrowDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
} from "lightweight-charts";

interface OHLCBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function ReplaySessionPage() {
  const { id } = useParams<{ id: string }>();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApi = useRef<IChartApi | null>(null);
  const seriesApi = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [pnl, setPnl] = useState(0);
  const [qty, setQty] = useState(1);

  // ─── Chart setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = document.documentElement.classList.contains("dark");
    const bg = isDark ? "#0E1424" : "#FFFFFF";
    const grid = isDark ? "#222D42" : "#E0DDD5";
    const text = isDark ? "#8A96AA" : "#6B6660";

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor: text,
        fontFamily: '"Geist Mono", monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: {
        borderColor: grid,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: { borderColor: grid },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: isDark ? "#00FF88" : "#00A651",
      downColor: isDark ? "#FF4757" : "#DC2626",
      borderUpColor: isDark ? "#00FF88" : "#00A651",
      borderDownColor: isDark ? "#FF4757" : "#DC2626",
      wickUpColor: isDark ? "#00FF88" : "#00A651",
      wickDownColor: isDark ? "#FF4757" : "#DC2626",
    });

    chartApi.current = chart;
    seriesApi.current = series;

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: chartRef.current?.clientWidth ?? 600 });
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // ─── WebSocket ─────────────────────────────────────────────────────────────
  useWebSocket(`/ws/replay/${id}`, {
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onMessage: (data) => {
      if (data.type === "bar" && data.bar) {
        const bar = data.bar as OHLCBar;
        seriesApi.current?.update({
          time: bar.time as CandlestickData["time"],
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        });
        setCurrentPrice(bar.close);
        if (!openPrice) setOpenPrice(bar.open);
      }
      if (data.type === "pnl" && typeof data.value === "number") {
        setPnl(data.value as number);
      }
    },
  });

  // ─── Trade ─────────────────────────────────────────────────────────────────
  const trade = useMutation({
    mutationFn: (side: "buy" | "sell") =>
      api.replay.trade(id, { side, quantity: qty, price: currentPrice ?? undefined }),
    onSuccess: (_, side) => {
      toast.success(`${side === "buy" ? "Bought" : "Sold"} ${qty} units`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const priceChange =
    currentPrice && openPrice ? ((currentPrice - openPrice) / openPrice) * 100 : 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-bg-surface shrink-0">
        <div className="flex items-center gap-4">
          {connected ? (
            <Badge variant="green" size="sm" dot>Streaming</Badge>
          ) : (
            <Badge variant="outline" size="sm">Connecting…</Badge>
          )}
          {currentPrice && (
            <div className="flex items-center gap-2">
              <span className="num text-lg font-bold text-ink">
                {currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <span className={`num text-sm flex items-center gap-0.5 ${getPnlColor(priceChange)}`}>
                {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <div className="flex gap-1">
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  speed === s ? "bg-green/10 text-green" : "text-ink-muted hover:text-ink"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chart */}
        <div className="flex-1 relative bg-bg-surface" ref={chartRef} />

        {/* Trade panel */}
        <div className="w-64 shrink-0 border-l border-line bg-bg-surface flex flex-col gap-4 p-4 overflow-y-auto">
          {/* P&L */}
          <Card className="text-center">
            <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Session P&amp;L</p>
            <p className={`num text-2xl font-bold ${getPnlColor(pnl)}`}>
              {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, "V", true)}
            </p>
          </Card>

          {/* Quantity */}
          <div>
            <label className="text-xs text-ink-faint uppercase tracking-wider mb-2 block">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-8 w-8 rounded-lg border border-line bg-bg-subtle flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 rounded-lg border border-line bg-bg-subtle px-2 py-1.5 text-center text-sm num text-ink focus:outline-none focus:border-green"
              />
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-8 w-8 rounded-lg border border-line bg-bg-subtle flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Trade buttons */}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-green! text-bg! gap-1.5"
              onClick={() => trade.mutate("buy")}
              loading={trade.isPending}
              disabled={!connected}
            >
              <ArrowUp className="h-4 w-4" />
              Buy Long
            </Button>
            <Button
              className="w-full bg-red! text-white! gap-1.5"
              onClick={() => trade.mutate("sell")}
              loading={trade.isPending}
              disabled={!connected}
            >
              <ArrowDown className="h-4 w-4" />
              Sell Short
            </Button>
          </div>

          {/* Estimated cost */}
          {currentPrice && (
            <div className="rounded-lg bg-bg-subtle px-3 py-2.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-ink-faint">Est. Cost</span>
                <span className="num font-semibold text-ink">
                  {formatCurrency(currentPrice * qty, "V", true)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-faint">Price/unit</span>
                <span className="num text-ink">
                  {currentPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
