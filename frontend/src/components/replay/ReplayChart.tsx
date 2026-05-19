"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";

export type ChartPoint = { time: number; value: number };

interface Props {
  points: ChartPoint[];
}

/**
 * Lightweight-Charts wrapper. Append-only: we only push new points to avoid
 * the cost of `setData` on every render. The hook keeps last-time per series
 * so we can call `update` for incremental ticks.
 */
export function ReplayChart({ points }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const dataLengthRef = useRef<number>(0);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      layout: {
        background: { color: "#FFFFFF" },
        textColor: "#5B6473",
        fontFamily: "Inter, ui-sans-serif, system-ui",
      },
      grid: {
        horzLines: { color: "#F1F4F7" },
        vertLines: { color: "#F4F6F8" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
      autoSize: true,
    });
    const series = chart.addAreaSeries({
      lineColor: "#0DA068",
      topColor: "rgba(13, 160, 104, 0.20)",
      bottomColor: "rgba(13, 160, 104, 0.0)",
      lineWidth: 2,
      priceLineVisible: true,
      lastValueVisible: true,
    });
    chartRef.current = chart;
    seriesRef.current = series;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      lastTimeRef.current = null;
      dataLengthRef.current = 0;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (points.length === 0) {
      series.setData([]);
      lastTimeRef.current = null;
      dataLengthRef.current = 0;
      return;
    }
    // If the array shrunk (panned out, or component remounted), reset.
    if (points.length < dataLengthRef.current) {
      series.setData(toLineData(points));
      lastTimeRef.current = points[points.length - 1].time;
      dataLengthRef.current = points.length;
      return;
    }
    if (lastTimeRef.current === null) {
      series.setData(toLineData(points));
      lastTimeRef.current = points[points.length - 1].time;
      dataLengthRef.current = points.length;
      chartRef.current?.timeScale().fitContent();
      return;
    }
    // Incremental — push only new points.
    for (let i = dataLengthRef.current; i < points.length; i++) {
      const p = points[i];
      // lightweight-charts requires strictly increasing timestamps.
      if (lastTimeRef.current !== null && p.time <= lastTimeRef.current) {
        // Same second as last tick — update the existing point.
        series.update({
          time: lastTimeRef.current as UTCTimestamp,
          value: p.value,
        });
        continue;
      }
      series.update({ time: p.time as UTCTimestamp, value: p.value });
      lastTimeRef.current = p.time;
    }
    dataLengthRef.current = points.length;
  }, [points]);

  return <div ref={ref} className="h-full w-full" />;
}

function toLineData(points: ChartPoint[]): LineData[] {
  // De-dupe on identical timestamps just in case.
  const out: LineData[] = [];
  let lastT = -Infinity;
  for (const p of points) {
    if (p.time <= lastT) {
      out[out.length - 1] = { time: p.time as UTCTimestamp, value: p.value };
    } else {
      out.push({ time: p.time as UTCTimestamp, value: p.value });
      lastT = p.time;
    }
  }
  return out;
}
