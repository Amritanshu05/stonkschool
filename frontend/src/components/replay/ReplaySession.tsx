"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { PageHeader } from "@/components/shell/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { WS_URL } from "@/lib/api";
import { api, ApiError } from "@/lib/api";
import { useWebsocket } from "@/lib/useWebsocket";
import {
  formatPriceShort,
  formatPct,
  formatTimeShort,
} from "@/lib/format";
import type { DemoTradeResponse, ReplayTickMsg } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ReplayChart, type ChartPoint } from "./ReplayChart";

type Trade = {
  id: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
  at: number;
};

export function ReplaySession({
  replayId,
  symbol,
}: {
  replayId: string;
  symbol: string;
}) {
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [paused, setPaused] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [qty, setQty] = useState<string>("0.5");
  const [busy, setBusy] = useState<"buy" | "sell" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const buffer = useRef<ChartPoint[]>([]);

  const { status: wsStatus } = useWebsocket<ReplayTickMsg>({
    url: `${WS_URL}/ws/replay/${replayId}`,
    onMessage: (m) => {
      if (paused) return;
      if (
        m &&
        typeof m === "object" &&
        "timestamp" in m &&
        "price" in m &&
        Number.isFinite(Number(m.price))
      ) {
        const ts = parseTs(m.timestamp);
        const price = Number(m.price);
        // Buffer to limit React renders to ~10/sec.
        buffer.current.push({ time: ts, value: price });
      }
    },
  });

  // Drain the buffer at a steady cadence to avoid overwhelming React.
  useEffect(() => {
    const id = setInterval(() => {
      if (buffer.current.length === 0) return;
      const next = buffer.current.splice(0, buffer.current.length);
      setPoints((prev) => {
        // Keep the last ~3000 ticks for smooth panning.
        const merged = prev.concat(next);
        return merged.length > 3000
          ? merged.slice(merged.length - 3000)
          : merged;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const latest = points[points.length - 1];
  const first = points[0];
  const change =
    latest && first ? ((latest.value - first.value) / first.value) * 100 : 0;

  const pnl = useMemo(() => {
    if (!latest) return 0;
    let cash = 0;
    let pos = 0;
    for (const t of trades) {
      if (t.side === "buy") {
        cash -= t.price * t.qty;
        pos += t.qty;
      } else {
        cash += t.price * t.qty;
        pos -= t.qty;
      }
    }
    return cash + pos * latest.value;
  }, [trades, latest]);

  async function placeTrade(side: "buy" | "sell") {
    if (!latest) return;
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    setBusy(side);
    setError(null);
    try {
      const res = await api<DemoTradeResponse>(
        `/api/v1/replay/${replayId}/trade`,
        { method: "POST", body: { side, quantity: q } },
      );
      setTrades((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          side: res.side,
          price: Number(res.price),
          qty: Number(res.quantity),
          at: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message || `Trade failed (${err.status})`
          : "Trade failed";
      setError(msg);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="container py-8">
      <PageHeader
        title={`Replay · ${symbol}`}
        description="Practise reading a market live. No real money, no consequences — just reps."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={wsStatus === "open" ? "brand" : "neutral"} dot>
              {wsStatus === "open" ? "Streaming" : wsStatus}
            </Badge>
            <span className="text-xs text-ink-muted">
              Replay session · {replayId.slice(0, 8)}
            </span>
          </div>
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? "Resume" : "Pause"}
            </Button>
            <Link href="/replay">
              <Button variant="ghost">New session</Button>
            </Link>
          </>
        }
      />

      {error ? (
        <div className="mt-4 rounded border border-loss/40 bg-loss-soft px-4 py-2.5 text-sm text-loss">
          {error}
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <Stat
            label="Last price"
            value={
              latest ? (
                <>
                  <span className="text-ink-soft text-base font-medium pr-1">
                    {symbol}
                  </span>
                  {formatPriceShort(latest.value)}
                </>
              ) : (
                "—"
              )
            }
            hint={latest ? `at ${formatTimeShort(new Date(latest.time * 1000))}` : "Waiting for stream"}
          />
        </Card>
        <Card>
          <Stat
            label="Window change"
            value={formatPct(change)}
            trend={change > 0.05 ? "up" : change < -0.05 ? "down" : "flat"}
            hint="From first tick in this session"
          />
        </Card>
        <Card>
          <Stat
            label="Paper P&L"
            value={
              `${pnl >= 0 ? "+" : ""}${formatPriceShort(pnl)}`
            }
            trend={pnl > 0 ? "up" : pnl < 0 ? "down" : "flat"}
            hint={`${trades.length} trade${trades.length === 1 ? "" : "s"}`}
          />
        </Card>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-0">
          <CardHeader className="px-5 pt-5">
            <div>
              <CardTitle>Live chart</CardTitle>
              <CardSubtitle>1 tick / second from the seed engine.</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-[420px] px-2 pb-3">
            <ReplayChart points={points} />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Place a paper trade</CardTitle>
                <CardSubtitle>Executes at the last streamed price.</CardSubtitle>
              </div>
            </CardHeader>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Quantity
            </label>
            <input
              type="number"
              min={0}
              step="0.0001"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="ss-focus mt-1 h-10 w-full rounded-sm border border-line bg-bg-surface px-3 text-sm num"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                onClick={() => placeTrade("buy")}
                loading={busy === "buy"}
                disabled={!latest || busy !== null}
              >
                Buy
              </Button>
              <Button
                variant="danger"
                onClick={() => placeTrade("sell")}
                loading={busy === "sell"}
                disabled={!latest || busy !== null}
              >
                Sell
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Trade log</CardTitle>
                <CardSubtitle>This session only.</CardSubtitle>
              </div>
            </CardHeader>
            {trades.length === 0 ? (
              <div className="rounded border border-dashed border-line p-4 text-center text-sm text-ink-muted">
                No trades yet. Try a small buy and watch the P&amp;L.
              </div>
            ) : (
              <ul className="thin-scroll max-h-72 space-y-1 overflow-y-auto pr-2">
                {trades.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-bg-subtle"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-6 w-12 items-center justify-center rounded-full text-[11px] font-semibold uppercase",
                          t.side === "buy"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-loss-soft text-loss",
                        )}
                      >
                        {t.side}
                      </span>
                      <span className="num text-ink-muted">
                        {t.qty.toFixed(4)} @ {formatPriceShort(t.price)}
                      </span>
                    </div>
                    <span className="text-xs text-ink-soft">
                      {formatTimeShort(new Date(t.at))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

function parseTs(ts: string): number {
  // Backend sends "YYYY-MM-DD HH:MM:SS" without TZ — treat as UTC.
  const norm = ts.replace(" ", "T");
  const withZ = /Z$|[+-]\d{2}:?\d{2}$/.test(norm) ? norm : `${norm}Z`;
  const d = new Date(withZ);
  return Math.floor(d.getTime() / 1000);
}
