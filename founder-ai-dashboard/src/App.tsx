import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/shell/AppShell';
import { HomePage } from './pages/HomePage';
import { TaskLauncherPage } from './pages/TaskLauncherPage';
import { ResearchPage } from './pages/ResearchPage';
import { TargetAssessmentPage } from './pages/TargetAssessmentPage';
import { VariantReportPage } from './pages/VariantReportPage';
import { RegulatoryBriefPage } from './pages/RegulatoryBriefPage';
import { PipelinePage } from './pages/PipelinePage';
import { SettingsPage } from './pages/SettingsPage';
import { OnboardingPage } from './pages/OnboardingPage';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Onboarding (no shell) */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Main app with shell */}
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks" element={<TaskLauncherPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/target-assessment" element={<TargetAssessmentPage />} />
            <Route path="/variant-report" element={<VariantReportPage />} />
            <Route path="/regulatory" element={<RegulatoryBriefPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Placeholder routes */}
            <Route path="/history" element={<PlaceholderPage title="Session History" />} />
            <Route path="/library" element={<PlaceholderPage title="Deliverables Library" />} />
            <Route path="/watchlist" element={<PlaceholderPage title="Watchlist and Alerts" />} />
            <Route path="/workspaces" element={<PlaceholderPage title="Workspaces" />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-text-primary mb-2">{title}</h1>
      <p className="text-sm text-text-secondary">
        This screen is part of the full prototype. Navigate to the core flows using the left sidebar: Home, New Task, or Research.
      </p>
      <div className="mt-6 grid gap-3">
        {[
          { path: '/', label: 'Home Dashboard' },
          { path: '/tasks', label: 'Task Launcher' },
          { path: '/research', label: 'Conversational Research (TP53 demo)' },
          { path: '/target-assessment', label: 'Target Assessment Output' },
          { path: '/variant-report', label: 'Variant Evidence Report' },
          { path: '/regulatory', label: 'Regulatory Brief' },
          { path: '/pipeline', label: 'Cross-Domain Pipeline' },
          { path: '/onboarding', label: 'Onboarding Flow' },
          { path: '/settings', label: 'Settings' },
        ].map((link) => (
          <a
            key={link.path}
            href={link.path}
            className="text-sm text-cei-blue-light hover:text-cei-blue font-medium"
          >
            {link.label} →
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
