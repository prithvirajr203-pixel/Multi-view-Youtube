import { useState, useRef } from 'react';
import type { BrowserSession } from '../types';

interface BrowserTileProps {
  session: BrowserSession;
  isSelected: boolean;
  compact: boolean;
  onSelect: () => void;
  onClose: () => void;
  onNavigate: (id: string, url: string) => void;
  onReload: (id: string) => void;
  onBack: (id: string) => void;
  onForward: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  RUNNING:    'bg-green-500',
  IDLE:       'bg-blue-500',
  AUTOMATING: 'bg-yellow-400',
  STARTING:   'bg-gray-400',
  STOPPING:   'bg-orange-400',
  STOPPED:    'bg-gray-600',
  ERROR:      'bg-red-500',
  CRASHED:    'bg-red-700',
};

export function BrowserTile({
  session, isSelected, compact,
  onSelect, onClose, onNavigate, onReload, onBack, onForward,
}: BrowserTileProps) {
  const [urlInput, setUrlInput] = useState(session.current_url === 'about:blank' ? '' : session.current_url);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = urlInput.trim();
    if (val) onNavigate(session.session_id, val);
  };

  const dotColor = STATUS_COLORS[session.status] ?? 'bg-gray-500';

  return (
    <div
      onClick={onSelect}
      className={`flex flex-col rounded-lg border transition-all duration-200 overflow-hidden cursor-pointer
        ${isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-gray-700 hover:border-gray-500'
        } bg-gray-800`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
          <span className="text-xs font-bold text-gray-300 shrink-0">{session.session_id}</span>
          {!compact && (
            <span className="text-xs text-gray-500 truncate max-w-[120px]" title={session.title}>
              {session.title || 'New Tab'}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="text-gray-500 hover:text-red-400 ml-2 shrink-0 transition-colors"
          title="Close"
        >✕</button>
      </div>

      {/* ── Address bar ── */}
      <form
        onSubmit={handleNavigate}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 px-2 py-1.5 bg-gray-850 border-b border-gray-700 shrink-0"
        style={{ background: '#1a1f2e' }}
      >
        <button type="button" onClick={() => onBack(session.session_id)}
          className="text-gray-400 hover:text-white px-1 text-sm transition-colors">◀</button>
        <button type="button" onClick={() => onForward(session.session_id)}
          className="text-gray-400 hover:text-white px-1 text-sm transition-colors">▶</button>
        <button type="button" onClick={() => onReload(session.session_id)}
          className="text-gray-400 hover:text-white px-1 text-sm transition-colors">↻</button>
        <input
          ref={inputRef}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Enter URL and press Enter…"
          className="flex-1 bg-gray-900 text-xs text-gray-200 px-2 py-1 rounded border border-gray-700 focus:border-blue-500 outline-none min-w-0"
        />
        <button type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded transition-colors shrink-0">GO</button>
      </form>

      {/* ── Live view ── */}
      <div className="relative flex-1 bg-black overflow-hidden" style={{ minHeight: compact ? 160 : 280 }}>
        <img
          id={`screencast-${session.session_id}`}
          alt=""
          className="w-full h-full object-contain opacity-0 transition-opacity duration-300"
        />
        {/* Overlay: show URL if no frame received yet */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-gray-600 text-xs px-2 text-center break-all">
            {session.current_url === 'about:blank' ? 'Enter a URL above to navigate' : session.current_url}
          </span>
        </div>
        {/* LIVE badge */}
        <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          LIVE
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-900 border-t border-gray-700 shrink-0">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${dotColor} text-black`}>
          {session.status}
        </span>
        <span className="text-[10px] text-gray-500 truncate max-w-[60%] text-right" title={session.current_url}>
          {session.current_url === 'about:blank' ? '—' : session.current_url}
        </span>
      </div>
    </div>
  );
}
