import type { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  onNavigate: (p: Page) => void;
  sessionCount: number;
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '⊞' },
  { id: 'browsers',   label: 'Browsers',   icon: '🖥️' },
  { id: 'workflows',  label: 'Workflows',  icon: '⚡' },
  { id: 'scheduler',  label: 'Scheduler',  icon: '🕐' },
  { id: 'profiles',   label: 'Profiles',   icon: '👤' },
  { id: 'logs',       label: 'Logs',       icon: '📋' },
  { id: 'settings',   label: 'Settings',   icon: '⚙️' },
];

export function Sidebar({ activePage, onNavigate, sessionCount }: SidebarProps) {
  return (
    <aside className="w-52 shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-sm font-bold text-blue-400 tracking-widest uppercase">MultiView</h1>
        <p className="text-[10px] text-gray-500 tracking-widest">AGENT</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
              ${activePage === id
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
            {id === 'browsers' && sessionCount > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {sessionCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700">
        <p className="text-[10px] text-gray-600">v0.1.0-phase4</p>
      </div>
    </aside>
  );
}
