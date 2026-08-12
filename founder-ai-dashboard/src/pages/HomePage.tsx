import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { mockSessions } from '../mocks/sessions';
import {
  ArrowRight, Clock, CheckCircle2, AlertCircle,
  FileText, FlaskConical, Briefcase, Sparkles
} from 'lucide-react';
import { ViewMode } from '../design-system/tokens';

export function HomePage() {
  const { mode } = useApp();
  const navigate = useNavigate();

  const statusIcon = {
    active: <Clock size={14} className="text-cei-blue-light" />,
    completed: <CheckCircle2 size={14} className="text-success" />,
    partial: <AlertCircle size={14} className="text-evidence-moderate" />,
  };

  const quickActions = mode === ViewMode.SCIENCE
    ? [
        { label: 'Research a question', path: '/tasks', icon: FlaskConical },
        { label: 'Check a sequence', path: '/tasks', icon: FileText },
        { label: 'Validate a target', path: '/tasks', icon: Sparkles },
      ]
    : [
        { label: 'Regulatory pathway', path: '/tasks', icon: Briefcase },
        { label: 'Patent landscape', path: '/tasks', icon: FileText },
        { label: 'Market sizing', path: '/tasks', icon: Sparkles },
      ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div data-tour="home-overview" className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Good morning, Sarah</h1>
        <p className="text-sm text-text-secondary mt-1">Home is your overview for starting work and returning to recent conversations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg hover:border-cei-blue-light/40 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-cei-blue/5 flex items-center justify-center group-hover:bg-cei-blue/10 transition-colors">
                <Icon size={18} className="text-cei-blue" />
              </div>
              <span className="flex-1 text-sm font-medium text-text-primary">{action.label}</span>
              <ArrowRight size={14} className="text-text-tertiary group-hover:text-cei-blue-light transition-colors" />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">Recent chats</h2>
        <button onClick={() => navigate('/history')} className="text-xs text-cei-blue-light hover:text-cei-blue font-medium">View all</button>
      </div>

      <div className="space-y-2">
        {mockSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => navigate('/tasks', { state: { sessionId: session.id } })}
            className="w-full text-left px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg hover:border-cei-blue-light/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{statusIcon[session.status]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary group-hover:text-cei-blue transition-colors truncate">{session.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{session.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wide">{session.mode}</span>
                  <span className="text-[10px] text-text-tertiary">Updated {new Date(session.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-text-tertiary group-hover:text-cei-blue-light mt-1 shrink-0 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 px-4 py-2.5 bg-amber-50/50 border border-amber-200/40 rounded-lg">
        <p className="text-xs text-amber-700"><span className="font-semibold">Sample data for demonstration.</span> Conversations and results use realistic biotech scenarios for prototype evaluation.</p>
      </div>
    </div>
  );
}
