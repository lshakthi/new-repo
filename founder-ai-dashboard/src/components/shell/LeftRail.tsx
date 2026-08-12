import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Compass, Settings, PanelLeftClose, PanelLeft, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useProductTour } from '../tour/ProductTour';
import { mockSessions } from '../../mocks/sessions';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'tasks', label: 'New Task', icon: Compass, path: '/tasks' },
  { id: 'history', label: 'History', icon: Clock, path: '/history' },
];

const bottomItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const tourAnchors: Record<string, string | undefined> = {
  home: 'nav-home',
  tasks: 'nav-new-task',
  history: 'nav-history',
  settings: 'nav-settings',
};

export function LeftRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const { reportTourEvent } = useProductTour();

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        data-tour={tourAnchors[item.id]}
        onClick={() => {
          reportTourEvent({ type: 'NAV_CLICKED', id: item.id });
          navigate(item.path);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${active ? 'bg-cei-blue/8 text-cei-blue' : 'text-text-secondary hover:bg-surface-panel hover:text-text-primary'}`}
        aria-current={active ? 'page' : undefined}
        title={sidebarCollapsed ? item.label : undefined}
      >
        <Icon size={18} aria-hidden="true" className="shrink-0" />
        {!sidebarCollapsed && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <nav
      className={`h-full border-r border-border-subtle bg-surface-elevated flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}
      aria-label="Main navigation"
    >
      <div className="px-3 py-2 flex justify-end">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-panel transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </div>

      {!sidebarCollapsed && (
        <div className="px-3 py-2 border-t border-border-subtle">
          <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2">Recent chats</p>
          <div className="space-y-1">
            {mockSessions.slice(0, 3).map((session) => (
              <button
                key={session.id}
                onClick={() => navigate('/tasks', { state: { sessionId: session.id } })}
                className="w-full text-left text-xs text-text-secondary hover:text-text-primary truncate py-1 px-1 rounded hover:bg-surface-panel transition-colors"
              >
                {session.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-2 py-2 border-t border-border-subtle space-y-0.5">
        {bottomItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
