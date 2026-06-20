import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WSEvent { event: string; data: any; }

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<WSEvent[]>([]);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io('/', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.onAny((event, data) => {
      setEvents(prev => [...prev.slice(-99), { event, data }]);
      listenersRef.current.get(event)?.forEach(cb => cb(data));
    });

    return () => { socket.disconnect(); };
  }, []);

  const on = useCallback((event: string, cb: (data: any) => void) => {
    if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
    listenersRef.current.get(event)!.add(cb);
    return () => listenersRef.current.get(event)!.delete(cb);
  }, []);

  return { connected, events, on, socket: socketRef.current };
}
