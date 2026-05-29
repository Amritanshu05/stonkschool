"use client";

import { useEffect, useRef, useCallback } from "react";
import { WS_URL } from "./api";

type WSMessage = Record<string, unknown>;

interface UseWebSocketOptions {
  onMessage?: (data: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectDelay?: number;
  enabled?: boolean;
}

export function useWebSocket(path: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnectDelay = 3000,
    enabled = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return;

    const ws = new WebSocket(`${WS_URL}${path}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (mountedRef.current) onConnect?.();
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as WSMessage;
        onMessage?.(data);
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      onDisconnect?.();
      // Auto-reconnect
      reconnectTimer.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, reconnectDelay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [path, enabled, onMessage, onConnect, onDisconnect, reconnectDelay]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
