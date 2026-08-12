import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Compass, BookMarked, Bell, FolderOpen,
  Settings, PanelLeftClose, PanelLeft, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'tasks', label: 'New Task', icon: Compass, path: '/tasks' },
  { id: 'history', label: 'History', icon: Clock, path: '/history' },
  { id: 'library', label: 'Library', icon: BookMarked, path: '/library' },
  { id: 'watchlist', label: 'Watchlist', icon: Bell, path: '/watchlist', badge: 3 },
  { id: 'workspaces', label: 'Workspaces', icon: FolderOpen, path: '/workspaces' },
];

const bottomItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function LeftRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative
          ${active
            ? 'bg-cei-blue/8 text-cei-blue'
            : 'text-text-secondary hover:bg-surface-panel hover:text-text-primary'
          }
        `}
        aria-current={active ? 'page' : undefined}
        title={sidebarCollapsed ? item.label : undefined}
      >
        <Icon size={18} aria-hidden="true" className="flex-shrink-0" />
        {!sidebarCollapsed && <span>{item.label}</span>}
        {item.badge && item.badge > 0 && (
          <span className={`
            ${sidebarCollapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'}
            min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-review-required text-white text-[10px] font-bold
          `}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav
      className={`
        h-full border-r border-border-subtle bg-surface-elevated flex flex-col transition-all duration-200
        ${sidebarCollapsed ? 'w-16' : 'w-56'}
      `}
      aria-label="Main navigation"
    >
      {/* Toggle */}
      <div className="px-3 py-2 flex justify-end">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-panel transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Main nav */}
      <div className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </div>

      {/* Recent sessions */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2 border-t border-border-subtle">
          <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2">Recent</p>
          <div className="space-y-1">
            <button onClick={() => navigate('/tasks')} className="w-full text-left text-xs text-text-secondary hover:text-text-primary truncate py-1 px-1 rounded hover:bg-surface-panel transition-colors">
              TP53 target validation
            </button>
            <button onClick={() => navigate('/tasks')} className="w-full text-left text-xs text-text-secondary hover:text-text-primary truncate py-1 px-1 rounded hover:bg-surface-panel transition-colors">
              510(k) pathway triage
            </button>
            <button onClick={() => navigate('/tasks')} className="w-full text-left text-xs text-text-secondary hover:text-text-primary truncate py-1 px-1 rounded hover:bg-surface-panel transition-colors">
              BRAF V600E variant report
            </button>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-border-subtle space-y-0.5">
        {bottomItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
