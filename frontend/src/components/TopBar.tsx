import { useState } from 'react';
import type { GridLayout } from '../types';

interface TopBarProps {
  layout: GridLayout;
  sessionCount: number;
  backendOnline: boolean;
  wsConnected: boolean;
  onAddBrowser: () => void;
  onAddMultiple: (n: number) => void;
  onCloseAll: () => void;
  onSetLayout: (l: GridLayout) => void;
  onNavigateAll: (url: string) => void;
  onReloadAll: () => void;
  onStopAll: () => void;
}

const LAYOUTS: GridLayout[] = [1, 2, 4, 6, 8];

export function TopBar({
  layout, sessionCount, backendOnline, wsConnected,
  onAddBrowser, onAddMultiple, onCloseAll, onSetLayout,
  onNavigateAll, onReloadAll, onStopAll,
}: TopBarProps) {
  const [globalUrl, setGlobalUrl] = useState('');

  const handleGlobalNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = globalUrl.trim();
    if (trimmed) {
      onNavigateAll(trimmed);
    }
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-3 shrink-0">
      {/* Layout switcher */}
      <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
        {LAYOUTS.map(l => (
          <button
            key={l}
            onClick={() => onSetLayout(l)}
            className={`w-7 h-7 text-xs font-bold rounded transition-colors
              ${layout === l
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            title={`Layout: ${l} view${l > 1 ? 's' : ''}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-700" />

      {/* Browser controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onAddBrowser}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm"
        >
          <span>+</span> Add Browser
        </button>

        <div className="flex items-center gap-1">
          {[2, 4, 6, 8].map(n => (
            <button
              key={n}
              onClick={() => onAddMultiple(n)}
              title={`Add ${n} browser sessions`}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-semibold px-2 py-1.5 rounded transition-colors"
            >
              +{n}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-700" />

      {/* Global URL Box — Broadcasts URL to all open browser sessions */}
      <form onSubmit={handleGlobalNavigate} className="flex items-center gap-1.5 flex-1 max-w-xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={globalUrl}
            onChange={(e) => setGlobalUrl(e.target.value)}
            placeholder="Paste Common URL here to open in ALL tabs (e.g. https://example.com)..."
            className="w-full bg-gray-950 text-xs text-gray-100 placeholder-gray-500 pl-3 pr-8 py-1.5 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
          {globalUrl && (
            <button
              type="button"
              onClick={() => setGlobalUrl('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!globalUrl.trim() || sessionCount === 0}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shrink-0 shadow-sm"
          title="Open this URL in all active browser tabs"
        >
          🌐 Open in All
        </button>
      </form>

      {/* Global batch actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onReloadAll}
          disabled={sessionCount === 0}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 border border-gray-700 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
          title="Reload all browser tabs"
        >
          ↻ Reload All
        </button>
        <button
          onClick={onStopAll}
          disabled={sessionCount === 0}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 border border-gray-700 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
          title="Stop loading on all tabs"
        >
          ⏹ Stop All
        </button>
        <button
          onClick={onCloseAll}
          disabled={sessionCount === 0}
          className="bg-red-950/80 hover:bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed text-red-300 border border-red-900/50 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
          title="Close all browser tabs"
        >
          Close All
        </button>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs ml-auto border-l border-gray-800 pl-3">
        <div className="flex items-center gap-1 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-md">
          <span className="text-blue-400 font-bold">👁️ Total Views:</span>
          <span className="text-white font-extrabold text-sm font-mono ml-1">{sessionCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-400' : 'bg-red-500'}`} />
          <span className="text-gray-400">{backendOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-yellow-500'}`} />
          <span className="text-gray-400">WS</span>
        </div>
      </div>
    </header>
  );
}
