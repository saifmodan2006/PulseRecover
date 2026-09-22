"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { StreamEvent } from "@/types";

export function useLiveStream(onEventReceived?: (event: StreamEvent) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/live/stream";
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "NEW_EVENT" && parsed.data) {
            const streamEvt: StreamEvent = parsed.data;
            setEvents((prev) => [streamEvt, ...prev].slice(0, 100));
            setLastEventTime(new Date().toLocaleTimeString());
            if (onEventReceived) {
              onEventReceived(streamEvt);
            }
          }
        } catch (e) {
          // ignore malformed ping/pong
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      setIsConnected(false);
    }
  }, [onEventReceived]);

  useEffect(() => {
    connect();

    // Heartbeat ping interval
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send("ping");
      }
    }, 15000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { isConnected, events, lastEventTime };
}
