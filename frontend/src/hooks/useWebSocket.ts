import { useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../services/api';

type MessageHandler = (payload: Record<string, unknown>) => void;

export function useWebSocket(onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);

  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    // Backend is not configured.
    // Keep the frontend running without attempting an invalid WebSocket.
    if (!WS_URL) {
      return;
    }

    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // Connection established.
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onMessageRef.current(payload);
      } catch {
        // Ignore invalid WebSocket messages.
      }
    };

    ws.onclose = () => {
      wsRef.current = null;

      // Only reconnect if a backend URL is configured.
      if (WS_URL) {
        reconnectTimer.current = setTimeout(connect, 2000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }

      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return wsRef;
}