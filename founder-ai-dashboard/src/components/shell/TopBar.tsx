import { Search, FlaskConical, Briefcase, ChevronDown, User, Circle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../design-system/tokens';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function TopBar() {
  const { mode, setMode } = useApp();
  const navigate = useNavigate();
  const [askValue, setAskValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (askValue.trim()) {
      navigate('/research', { state: { query: askValue.trim() } });
      setAskValue('');
    }
  };

  return (
    <header className="h-14 border-b border-border-subtle bg-surface-elevated flex items-center px-4 gap-4 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cei-blue flex items-center justify-center">
          <span className="text-white text-xs font-bold">CEI</span>
        </div>
        <span className="text-sm font-semibold text-text-primary hidden lg:block">Founder AI</span>
      </div>

      {/* Ask Field */}
      <form onSubmit={handleAsk} className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
          <input
            type="text"
            value={askValue}
            onChange={(e) => setAskValue(e.target.value)}
            placeholder="Ask a scientific question, describe a task, or paste a sequence..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-subtle bg-surface-panel text-sm placeholder:text-text-tertiary focus:border-cei-blue-light focus:bg-white focus:ring-1 focus:ring-cei-blue-light/30 transition-all"
            aria-label="Ask or search"
          />
        </div>
      </form>

      {/* Mode Switch */}
      <div className="flex items-center bg-surface-panel rounded-lg border border-border-subtle p-0.5 flex-shrink-0">
        <button
          onClick={() => setMode(ViewMode.SCIENCE)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === ViewMode.SCIENCE
              ? 'bg-surface-elevated text-cei-blue shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          aria-pressed={mode === ViewMode.SCIENCE}
        >
          <FlaskConical size={13} aria-hidden="true" />
          <span className="hidden sm:inline">Science</span>
        </button>
        <button
          onClick={() => setMode(ViewMode.BUSINESS)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === ViewMode.BUSINESS
              ? 'bg-surface-elevated text-cei-blue shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          aria-pressed={mode === ViewMode.BUSINESS}
        >
          <Briefcase size={13} aria-hidden="true" />
          <span className="hidden sm:inline">Business</span>
        </button>
      </div>

      {/* Connection Status */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-text-tertiary flex-shrink-0">
        <Circle size={8} className="fill-success text-success" aria-hidden="true" />
        <span>Connected</span>
      </div>

      {/* Profile */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-surface-panel transition-colors"
          aria-expanded={profileOpen}
          aria-haspopup="true"
        >
          <div className="w-7 h-7 rounded-full bg-cei-blue/10 flex items-center justify-center">
            <User size={14} className="text-cei-blue" />
          </div>
          <ChevronDown size={12} className="text-text-tertiary" aria-hidden="true" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-surface-elevated border border-border-subtle rounded-lg shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-border-subtle">
              <p className="text-sm font-medium text-text-primary">Dr. Sarah Chen</p>
              <p className="text-xs text-text-tertiary">Therapeutics founder</p>
            </div>
            <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-panel">Profile</button>
            <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-panel">Settings</button>
            <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-panel">API and providers</button>
            <div className="border-t border-border-subtle mt-1 pt-1">
              <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-panel">Sign out</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
