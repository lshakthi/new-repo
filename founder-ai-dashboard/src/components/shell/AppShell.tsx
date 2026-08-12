import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { LeftRail } from './LeftRail';
import { EvidencePanel } from './EvidencePanel';

export function AppShell() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-primary">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <EvidencePanel />
      </div>
    </div>
  );
}
