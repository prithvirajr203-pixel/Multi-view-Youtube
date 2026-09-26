import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { BrowserSession, GridLayout } from '../types';

export function useBrowserStore() {
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [layout, setLayout] = useState<GridLayout>(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // Poll backend health + sessions every 2 s
  const refresh = useCallback(async () => {
    try {
      const [health, list] = await Promise.all([api.health(), api.browsers.list()]);
      setBackendOnline(health?.status === 'ONLINE');
      setSessions(list);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, [refresh]);

  // Handle incoming WS messages (screencast frames + events)
  const handleWsMessage = useCallback((payload: Record<string, unknown>) => {
    if (payload.event === 'screencast_frame') {
      const id = payload.session_id as string;
      const data = payload.data as string;
      const img = document.getElementById(`screencast-${id}`) as HTMLImageElement | null;
      if (img) {
        img.src = `data:image/jpeg;base64,${data}`;
        img.classList.remove('opacity-0');
      }
    }
  }, []);

  const addBrowser = useCallback(async () => {
    try {
      const s = await api.browsers.create();
      setSessions(prev => [...prev, s]);
      setSelectedId(s.session_id);
      if (layout < 2) setLayout(2);
    } catch (e: unknown) {
      alert(`Failed to add browser: ${(e as Error).message}`);
    }
  }, [layout]);

  const addMultiple = useCallback(async (count: number) => {
    for (let i = 0; i < count; i++) {
      try {
        await api.browsers.create();
      } catch { /* continue */ }
    }
    await refresh();
  }, [refresh]);

  const closeBrowser = useCallback(async (id: string) => {
    await api.browsers.close(id);
    setSessions(prev => prev.filter(s => s.session_id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const closeAll = useCallback(async () => {
    for (const s of sessions) {
      await api.browsers.close(s.session_id).catch(() => {});
    }
    setSessions([]);
    setSelectedId(null);
  }, [sessions]);

  const navigate = useCallback(async (id: string, url: string) => {
    const updated = await api.browsers.navigate(id, url);
    setSessions(prev => prev.map(s => s.session_id === id ? updated : s));
  }, []);

  const reload = useCallback(async (id: string) => {
    await api.browsers.reload(id);
    refresh();
  }, [refresh]);

  const goBack = useCallback(async (id: string) => {
    await api.browsers.back(id);
    refresh();
  }, [refresh]);

  const goForward = useCallback(async (id: string) => {
    await api.browsers.forward(id);
    refresh();
  }, [refresh]);

  const navigateAll = useCallback(async (url: string) => {
    await api.browsers.navigateAll(url);
    refresh();
  }, [refresh]);

  const reloadAll = useCallback(async () => {
    await api.browsers.reloadAll();
    refresh();
  }, [refresh]);

  const stopAll = useCallback(async () => {
    await api.browsers.stopAll();
    refresh();
  }, [refresh]);

  return {
    sessions, layout, setLayout,
    selectedId, setSelectedId,
    backendOnline,
    handleWsMessage,
    addBrowser, addMultiple, closeBrowser, closeAll,
    navigate, reload, goBack, goForward,
    navigateAll, reloadAll, stopAll,
    refresh,
  };
}
