import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, MousePointerClick, Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../design-system/tokens';
import type { ViewModeType } from '../../design-system/tokens';

const TOUR_STORAGE_KEY = 'founder-ai-product-tour-v3';

type TourStage =
  | 'welcome'
  | 'home'
  | 'new-task'
  | 'task-overview'
  | 'mode'
  | 'task-query'
  | 'task-group'
  | 'task-select'
  | 'history'
  | 'history-overview'
  | 'tools'
  | 'tools-overview'
  | 'tools-source'
  | 'tools-run'
  | 'tools-results'
  | 'settings'
  | 'settings-overview'
  | 'complete';

export type ProductTourEvent =
  | { type: 'NAV_CLICKED'; id: string }
  | { type: 'MODE_SELECTED'; mode: ViewModeType }
  | { type: 'TASK_QUERY_ENTERED'; query: string }
  | { type: 'TASK_GROUP_EXPANDED'; groupId: string }
  | { type: 'TASK_SELECTED'; taskId: string }
  | { type: 'TOOL_SOURCE_SELECTED'; id: string }
  | { type: 'TOOLS_RUN_COMPLETED' };

interface TourStep {
  selector: string | null;
  title: string;
  body: string;
  instruction?: string;
  kind: 'intro' | 'action' | 'info' | 'complete';
  progress: number;
}

interface ProductTourContextValue {
  isOpen: boolean;
  stage: TourStage;
  isTransitioning: boolean;
  modeAtStepStart: ViewModeType;
  startTour: () => void;
  skip: () => void;
  continueTour: () => void;
  reportTourEvent: (event: ProductTourEvent) => void;
}

const ProductTourContext = createContext<ProductTourContextValue | null>(null);

function hasDismissedTour() {
  try { return localStorage.getItem(TOUR_STORAGE_KEY) !== null; } catch { return false; }
}

function saveTourStatus(status: 'completed' | 'skipped') {
  try { localStorage.setItem(TOUR_STORAGE_KEY, status); } catch { /* Storage may be unavailable. */ }
}

export function ProductTourProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { mode, setSidebarCollapsed } = useApp();
  const [isOpen, setIsOpen] = useState(() => !hasDismissedTour());
  const [stage, setStage] = useState<TourStage>('welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modeAtStepStart, setModeAtStepStart] = useState<ViewModeType>(mode);
  const [pendingNavigation, setPendingNavigation] = useState<{ path: string; next: TourStage } | null>(null);
  const transitionTimer = useRef<number | null>(null);

  const advanceTo = useCallback((next: TourStage) => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setIsTransitioning(true);
    transitionTimer.current = window.setTimeout(() => {
      if (next === 'complete') saveTourStatus('completed');
      setStage(next);
      setIsTransitioning(false);
      transitionTimer.current = null;
    }, 420);
  }, []);

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  useEffect(() => {
    if (!pendingNavigation || location.pathname !== pendingNavigation.path || isTransitioning) return;
    const next = pendingNavigation.next;
    setPendingNavigation(null);
    advanceTo(next);
  }, [advanceTo, isTransitioning, location.pathname, pendingNavigation]);

  const startTour = useCallback(() => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setSidebarCollapsed(false);
    setPendingNavigation(null);
    setIsTransitioning(false);
    setStage('welcome');
    setIsOpen(true);
  }, [setSidebarCollapsed]);

  const skip = useCallback(() => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    saveTourStatus('skipped');
    setPendingNavigation(null);
    setIsTransitioning(false);
    setIsOpen(false);
  }, []);

  const continueTour = useCallback(() => {
    if (isTransitioning) return;
    if (stage === 'welcome') advanceTo('home');
    if (stage === 'task-overview') {
      setModeAtStepStart(mode);
      advanceTo('mode');
    }
    if (stage === 'history-overview') advanceTo('tools');
    if (stage === 'tools-overview') advanceTo('tools-source');
    if (stage === 'tools-results') advanceTo('settings');
    if (stage === 'settings-overview') advanceTo('complete');
    if (stage === 'complete') setIsOpen(false);
  }, [advanceTo, isTransitioning, mode, stage]);

  const reportTourEvent = useCallback((event: ProductTourEvent) => {
    if (!isOpen || isTransitioning) return;

    if (event.type === 'NAV_CLICKED') {
      const expectedNavigation =
        stage === 'home' && event.id === 'home' ? { path: '/', next: 'new-task' as TourStage } :
        stage === 'new-task' && event.id === 'tasks' ? { path: '/tasks', next: 'task-overview' as TourStage } :
        stage === 'history' && event.id === 'history' ? { path: '/history', next: 'history-overview' as TourStage } :
        stage === 'tools' && event.id === 'tools' ? { path: '/tools', next: 'tools-overview' as TourStage } :
        stage === 'settings' && event.id === 'settings' ? { path: '/settings', next: 'settings-overview' as TourStage } : null;
      if (expectedNavigation) setPendingNavigation(expectedNavigation);
      return;
    }

    if (stage === 'mode' && event.type === 'MODE_SELECTED' && event.mode !== modeAtStepStart) {
      advanceTo('task-query');
      return;
    }
    if (stage === 'task-query' && event.type === 'TASK_QUERY_ENTERED' && event.query.trim().length >= 3) {
      advanceTo('task-group');
      return;
    }
    if (stage === 'task-group' && event.type === 'TASK_GROUP_EXPANDED') {
      advanceTo('task-select');
      return;
    }
    if (stage === 'task-select' && event.type === 'TASK_SELECTED') {
      advanceTo('history');
      return;
    }
    if (stage === 'tools-source' && event.type === 'TOOL_SOURCE_SELECTED') {
      advanceTo('tools-run');
      return;
    }
    if (stage === 'tools-run' && event.type === 'TOOLS_RUN_COMPLETED') {
      advanceTo('tools-results');
    }
  }, [advanceTo, isOpen, isTransitioning, modeAtStepStart, stage]);

  return (
    <ProductTourContext.Provider value={{ isOpen, stage, isTransitioning, modeAtStepStart, startTour, skip, continueTour, reportTourEvent }}>
      {children}
    </ProductTourContext.Provider>
  );
}

export function useProductTour() {
  const context = useContext(ProductTourContext);
  if (!context) throw new Error('useProductTour must be used within ProductTourProvider');
  return context;
}

function getTourStep(stage: TourStage, mode: ViewModeType): TourStep {
  const steps: Record<TourStage, TourStep> = {
    welcome: {
      selector: null,
      title: 'Learn Founder AI by doing',
      body: 'Learn how to supercharge your startup.',
      kind: 'intro',
      progress: 0,
    },
    home: {
      selector: '[data-tour="nav-home"]',
      title: 'Home is your starting point',
      body: 'Home brings together quick actions and recent work. Click the highlighted Home tab to begin.',
      instruction: 'Click Home',
      kind: 'action',
      progress: 0,
    },
    'new-task': {
      selector: '[data-tour="nav-new-task"]',
      title: 'Start work from New Task',
      body: 'New Task organizes the platform around the outcome you want. Open it using the highlighted tab.',
      instruction: 'Click New Task',
      kind: 'action',
      progress: 1,
    },
    'task-overview': {
      selector: '[data-tour="task-overview"]',
      title: 'Tasks are guided workflows',
      body: 'Each task combines a clear goal with relevant tools, evidence sources, and an expected output—more structure than an open-ended chat.',
      kind: 'info',
      progress: 1,
    },
    mode: {
      selector: mode === ViewMode.SCIENCE ? '[data-tour="mode-business"]' : '[data-tour="mode-science"]',
      title: 'Compare Science and Business',
      body: 'Science focuses on research, targets, variants, sequences, and compounds. Business focuses on regulatory, market, patent, and company decisions.',
      instruction: `Switch to ${mode === ViewMode.SCIENCE ? 'Business' : 'Science'}`,
      kind: 'action',
      progress: 2,
    },
    'task-query': {
      selector: '[data-tour="task-query"]',
      title: 'Describe what you need',
      body: `Use the real task finder to narrow the available workflows. Try ${mode === ViewMode.BUSINESS ? '“FDA pathway”' : '“target validation”'}, or enter your own goal.`,
      instruction: 'Type at least 3 characters and pause',
      kind: 'action',
      progress: 3,
    },
    'task-group': {
      selector: '[data-tour="task-group"]',
      title: 'Choose a workflow area',
      body: 'Your query has narrowed the choices. Expand the highlighted group to see the individual guided tasks inside it.',
      instruction: 'Expand the highlighted group',
      kind: 'action',
      progress: 3,
    },
    'task-select': {
      selector: '[data-tour="task-card"]',
      title: 'Start your practice task',
      body: 'Select the highlighted task.',
      instruction: 'Select the highlighted task',
      kind: 'action',
      progress: 3,
    },
    history: {
      selector: '[data-tour="nav-history"]',
      title: 'Find previous work in History',
      body: 'Now use the navigation yourself to see where completed and in-progress conversations are stored.',
      instruction: 'Click History',
      kind: 'action',
      progress: 4,
    },
    'history-overview': {
      selector: '[data-tour="history-overview"]',
      title: 'Continue where you stopped',
      body: 'History keeps previous tasks and conversations together. Selecting an item reopens its working context.',
      kind: 'info',
      progress: 4,
    },
    tools: {
      selector: '[data-tour="nav-tools"]',
      title: 'Query approved sources in Tools',
      body: 'Tools turns plain-language questions into source-specific database parameters. Open it using the highlighted tab.',
      instruction: 'Click Tools',
      kind: 'action',
      progress: 5,
    },
    'tools-overview': {
      selector: '[data-tour="tools-overview"]',
      title: 'Start with a connected source',
      body: 'Configured APIs are active; unavailable integrations stay visible but disabled until they are connected in Settings.',
      kind: 'info',
      progress: 5,
    },
    'tools-source': {
      selector: '[data-tour="tools-source"]',
      title: 'Choose an API chicklet',
      body: 'Each chicklet uses the provider’s official mark and summarizes the data it contains. Open the configured ClinicalTrials.gov tool.',
      instruction: 'Click ClinicalTrials.gov',
      kind: 'action',
      progress: 5,
    },
    'tools-run': {
      selector: '[data-tour="tools-run"]',
      title: 'Run the prepared example',
      body: 'The ClinicalTrials.gov example is ready. Run it to see how natural language becomes structured parameters and traceable records.',
      instruction: 'Click Run search and wait for the results',
      kind: 'action',
      progress: 5,
    },
    'tools-results': {
      selector: '[data-tour="tools-results"]',
      title: 'Review interpretation and provenance',
      body: 'Before relying on results, inspect the generated parameters, source limitations, match rationale, stable identifiers, and execution trail.',
      kind: 'info',
      progress: 5,
    },
    settings: {
      selector: '[data-tour="nav-settings"]',
      title: 'Finish in Settings',
      body: 'Settings is where platform connections, data sources, privacy controls, and this tutorial are managed.',
      instruction: 'Click Settings',
      kind: 'action',
      progress: 6,
    },
    'settings-overview': {
      selector: '[data-tour="settings-overview"]',
      title: 'Make the workspace yours',
      body: 'Configure providers and data handling here. You can replay this walkthrough at any time with the Replay tour button.',
      kind: 'info',
      progress: 6,
    },
    complete: {
      selector: null,
      title: 'You are ready to explore',
      body: 'You navigated the workspace, started a guided workflow, searched an approved source, and reviewed result provenance.',
      kind: 'complete',
      progress: 6,
    },
  };
  return steps[stage];
}

export function ProductTour() {
  const { mode } = useApp();
  const { isOpen, stage, isTransitioning, modeAtStepStart, continueTour, skip } = useProductTour();
  const location = useLocation();
  const step = getTourStep(stage, stage === 'mode' ? modeAtStepStart : mode);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const targetElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !step.selector) {
      targetElement.current = null;
      setTargetRect(null);
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let describedTarget: HTMLElement | null = null;
    let previousDescription: string | null = null;

    const measure = () => {
      if (targetElement.current) setTargetRect(targetElement.current.getBoundingClientRect());
    };

    const attachTarget = () => {
      const target = document.querySelector<HTMLElement>(step.selector!);
      if (!target) return;
      targetElement.current = target;
      previousDescription = target.getAttribute('aria-describedby');
      target.setAttribute('aria-describedby', [previousDescription, 'product-tour-description'].filter(Boolean).join(' '));
      describedTarget = target;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      if (target.matches('button, input, select, textarea, [tabindex]')) target.focus({ preventScroll: true });
      requestAnimationFrame(() => requestAnimationFrame(measure));
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(target);
      mutationObserver?.disconnect();
    };

    mutationObserver = new MutationObserver(attachTarget);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    attachTarget();
    window.addEventListener('resize', measure);
    document.addEventListener('scroll', measure, true);

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', measure);
      document.removeEventListener('scroll', measure, true);
      if (describedTarget) {
        if (previousDescription) describedTarget.setAttribute('aria-describedby', previousDescription);
        else describedTarget.removeAttribute('aria-describedby');
      }
      targetElement.current = null;
    };
  }, [isOpen, location.pathname, step.selector]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, skip]);

  if (!isOpen) return null;

  const padding = 8;
  const tooltipWidth = Math.min(380, window.innerWidth - 32);
  const hasRightSpace = targetRect && window.innerWidth - targetRect.right > tooltipWidth + 32;
  const tooltipLeft = targetRect
    ? (hasRightSpace
        ? targetRect.right + 20
        : Math.min(Math.max(16, targetRect.left), window.innerWidth - tooltipWidth - 16))
    : window.innerWidth / 2 - tooltipWidth / 2;
  const tooltipTop = targetRect
    ? (hasRightSpace
        ? Math.min(Math.max(16, targetRect.top), window.innerHeight - 290)
        : (window.innerHeight - targetRect.bottom > 280
            ? targetRect.bottom + 18
            : Math.max(16, targetRect.top - 270)))
    : Math.max(16, window.innerHeight / 2 - 150);
  const hole = targetRect ? {
    left: Math.max(0, targetRect.left - padding),
    top: Math.max(0, targetRect.top - padding),
    right: Math.min(window.innerWidth, targetRect.right + padding),
    bottom: Math.min(window.innerHeight, targetRect.bottom + padding),
  } : null;
  const progressLabels = ['Home', 'New Task', 'Modes', 'Create', 'History', 'Tools', 'Settings'];

  return createPortal(
    <div className="fixed inset-0 z-100 pointer-events-none" aria-live="polite">
      {hole ? (
        <>
          <div className="tour-scrim fixed left-0 right-0 top-0 pointer-events-auto" style={{ height: hole.top }} />
          <div className="tour-scrim fixed left-0 pointer-events-auto" style={{ top: hole.top, width: hole.left, height: hole.bottom - hole.top }} />
          <div className="tour-scrim fixed right-0 pointer-events-auto" style={{ top: hole.top, left: hole.right, height: hole.bottom - hole.top }} />
          <div className="tour-scrim fixed left-0 right-0 bottom-0 pointer-events-auto" style={{ top: hole.bottom }} />
          <div
            className={`tour-spotlight fixed rounded-xl border-2 pointer-events-none ${isTransitioning ? 'tour-spotlight-success' : ''}`}
            style={{ left: hole.left, top: hole.top, width: hole.right - hole.left, height: hole.bottom - hole.top }}
          />
        </>
      ) : <div className="tour-scrim fixed inset-0 pointer-events-auto" />}

      <section
        role="dialog"
        aria-labelledby="product-tour-title"
        aria-describedby="product-tour-description"
        className="tour-coachmark fixed pointer-events-auto rounded-2xl border border-border-subtle bg-surface-elevated p-5 shadow-2xl"
        style={{ left: tooltipLeft, top: tooltipTop, width: tooltipWidth }}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5" aria-label={`${progressLabels[step.progress]} stage`}>
            {progressLabels.map((label, index) => (
              <span key={label} className={`h-1.5 rounded-full transition-all duration-300 ${index === step.progress ? 'w-6 bg-cei-blue' : index < step.progress ? 'w-2 bg-success' : 'w-2 bg-border-default'}`} />
            ))}
          </div>
          {step.kind !== 'complete' && <button onClick={skip} className="p-1 text-text-tertiary hover:text-text-primary rounded" aria-label="Skip tour"><X size={16} /></button>}
        </div>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isTransitioning || step.kind === 'complete' ? 'bg-success-bg text-success' : 'bg-cei-blue/8 text-cei-blue'}`}>
          {isTransitioning || step.kind === 'complete' ? <CheckCircle2 size={21} /> : step.kind === 'intro' ? <Sparkles size={20} /> : <MousePointerClick size={20} />}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-cei-blue mb-1">{progressLabels[step.progress]}</p>
        <h2 id="product-tour-title" className="text-base font-semibold text-text-primary">{isTransitioning ? 'Nice work' : step.title}</h2>
        <p id="product-tour-description" className="text-sm leading-6 text-text-secondary mt-1.5">{step.body}</p>

        {step.kind === 'action' && (
          <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${isTransitioning ? 'bg-success-bg text-success' : 'bg-cei-blue/5 text-cei-blue'}`}>
            {isTransitioning ? <CheckCircle2 size={14} /> : <span className="tour-action-pulse h-2 w-2 rounded-full bg-cei-blue" />}
            {isTransitioning ? 'Action complete' : step.instruction}
          </div>
        )}

        {step.kind === 'intro' && (
          <div className="flex items-center justify-between mt-5">
            <button onClick={skip} className="text-xs font-medium text-text-tertiary hover:text-text-primary">Skip tour</button>
            <button onClick={continueTour} className="px-4 py-2.5 rounded-lg bg-cei-blue text-white text-sm font-medium hover:bg-cei-navy transition-colors">Start walkthrough</button>
          </div>
        )}
        {step.kind === 'info' && (
          <div className="flex justify-end mt-5">
            <button onClick={continueTour} className="px-4 py-2.5 rounded-lg bg-cei-blue text-white text-sm font-medium hover:bg-cei-navy transition-colors">{stage === 'settings-overview' ? 'Finish tour' : 'Continue'}</button>
          </div>
        )}
        {step.kind === 'complete' && (
          <button onClick={continueTour} className="mt-5 w-full px-4 py-2.5 rounded-lg bg-cei-blue text-white text-sm font-medium hover:bg-cei-navy transition-colors">Start exploring</button>
        )}
      </section>
    </div>,
    document.body,
  );
}
