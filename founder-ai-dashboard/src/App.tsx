import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProductTourProvider } from './components/tour/ProductTour';
import { AppShell } from './components/shell/AppShell';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { TaskLauncherPage } from './pages/TaskLauncherPage';
import { TargetAssessmentPage } from './pages/TargetAssessmentPage';
import { VariantReportPage } from './pages/VariantReportPage';
import { RegulatoryBriefPage } from './pages/RegulatoryBriefPage';
import { PipelinePage } from './pages/PipelinePage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ProductTourProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/tasks" element={<TaskLauncherPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/target-assessment" element={<TargetAssessmentPage />} />
              <Route path="/variant-report" element={<VariantReportPage />} />
              <Route path="/regulatory" element={<RegulatoryBriefPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ProductTourProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
