import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ViewModeType } from '../design-system/tokens';
import { ViewMode } from '../design-system/tokens';

interface AppState {
  mode: ViewModeType;
  setMode: (mode: ViewModeType) => void;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  evidencePanelOpen: boolean;
  setEvidencePanelOpen: (open: boolean) => void;
  activeSourceId: string | null;
  setActiveSourceId: (id: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewModeType>(ViewMode.SCIENCE);
  const [activeSessionId, setActiveSessionId] = useState<string | null>('session-1');
  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AppContext.Provider value={{
      mode, setMode,
      activeSessionId, setActiveSessionId,
      evidencePanelOpen, setEvidencePanelOpen,
      activeSourceId, setActiveSourceId,
      sidebarCollapsed, setSidebarCollapsed,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
