"use client";

import { useEffect, useRef, useState } from "react";

export type WsStatus = "connecting" | "open" | "closed" | "error";

interface Options<T> {
  url: string | null;
  onMessage?: (data: T) => void;
  /** Reconnect delay in ms. 0 disables. */
  reconnectMs?: number;
}

/** Lightweight WebSocket hook. JSON messages, auto-reconnect, status. */
export function useWebsocket<T = unknown>({
  url,
  onMessage,
  reconnectMs = 3000,
}: Options<T>) {
  const [status, setStatus] = useState<WsStatus>("connecting");
  const [last, setLast] = useState<T | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!url) return;
    let stopped = false;

    function open() {
      if (stopped) return;
      setStatus("connecting");
      let ws: WebSocket;
      try {
        ws = new WebSocket(url!);
      } catch {
        setStatus("error");
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => setStatus("open");
      ws.onclose = () => {
        setStatus("closed");
        scheduleReconnect();
      };
      ws.onerror = () => setStatus("error");
      ws.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          setLast(parsed as T);
          handlerRef.current?.(parsed as T);
        } catch {
          // ignore non-JSON frames
        }
      };
    }

    function scheduleReconnect() {
      if (!reconnectMs || stopped) return;
      if (reconnectRef.current) return;
      reconnectRef.current = window.setTimeout(() => {
        reconnectRef.current = null;
        open();
      }, reconnectMs);
    }

    open();

    return () => {
      stopped = true;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [url, reconnectMs]);

  return { status, last };
}
