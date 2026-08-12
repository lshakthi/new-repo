import { Search, FlaskConical, Briefcase, Circle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useProductTour } from '../tour/ProductTour';
import { ViewMode } from '../../design-system/tokens';
import { platformDestinations } from '../../config/platformNavigation';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export function TopBar() {
  const { mode, setMode } = useApp();
  const { reportTourEvent } = useProductTour();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLFormElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const searchResults = (normalizedSearch
    ? platformDestinations.filter((destination) =>
        [destination.label, destination.description, ...destination.keywords]
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      )
    : platformDestinations
  ).slice(0, 6);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const selectDestination = (path: string) => {
    navigate(path);
    setSearchValue('');
    setSearchOpen(false);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchResults[0]) selectDestination(searchResults[0].path);
  };

  return (
    <header className="h-14 border-b border-border-subtle bg-surface-elevated flex items-center px-4 gap-4 z-30">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cei-blue flex items-center justify-center">
          <span className="text-white text-xs font-bold">CEI</span>
        </div>
        <span className="text-sm font-semibold text-text-primary hidden lg:block">Founder AI</span>
      </div>

      <form ref={searchRef} onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto relative" role="search">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
          <input
            type="search"
            value={searchValue}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => { setSearchValue(event.target.value); setSearchOpen(true); }}
            onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); }}
            placeholder="Search pages, settings, and features..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-subtle bg-surface-panel text-sm placeholder:text-text-tertiary focus:border-cei-blue-light focus:bg-white focus:ring-1 focus:ring-cei-blue-light/30 transition-all"
            aria-label="Search the platform"
            aria-expanded={searchOpen}
            aria-controls="platform-search-results"
            autoComplete="off"
          />
        </div>
        {searchOpen && (
          <div id="platform-search-results" className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-border-subtle bg-surface-elevated shadow-xl overflow-hidden z-50" role="listbox">
            {searchResults.length > 0 ? searchResults.map((destination) => (
              <button
                key={destination.path}
                type="button"
                onClick={() => selectDestination(destination.path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-panel transition-colors border-b border-border-subtle last:border-b-0"
                role="option"
                aria-selected="false"
              >
                <Search size={14} className="text-text-tertiary shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-text-primary">{destination.label}</span>
                  <span className="block text-xs text-text-secondary truncate">{destination.description}</span>
                </span>
                <ArrowRight size={13} className="text-text-tertiary" />
              </button>
            )) : (
              <p className="px-4 py-4 text-sm text-text-secondary">No matching page or feature found.</p>
            )}
          </div>
        )}
      </form>

      <div className="flex items-center bg-surface-panel rounded-lg border border-border-subtle p-0.5 shrink-0" role="group" aria-label="Task view">
        <button
          data-tour="mode-science"
          onClick={() => {
            setMode(ViewMode.SCIENCE);
            reportTourEvent({ type: 'MODE_SELECTED', mode: ViewMode.SCIENCE });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === ViewMode.SCIENCE ? 'bg-surface-elevated text-cei-blue shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          aria-label="Show Science tasks"
          aria-pressed={mode === ViewMode.SCIENCE}
        >
          <FlaskConical size={13} aria-hidden="true" />
          <span className="hidden sm:inline">Science</span>
        </button>
        <button
          data-tour="mode-business"
          onClick={() => {
            setMode(ViewMode.BUSINESS);
            reportTourEvent({ type: 'MODE_SELECTED', mode: ViewMode.BUSINESS });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === ViewMode.BUSINESS ? 'bg-surface-elevated text-cei-blue shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          aria-label="Show Business tasks"
          aria-pressed={mode === ViewMode.BUSINESS}
        >
          <Briefcase size={13} aria-hidden="true" />
          <span className="hidden sm:inline">Business</span>
        </button>
      </div>

      <div className="hidden md:flex items-center gap-1.5 text-xs text-text-tertiary shrink-0">
        <Circle size={8} className="fill-success text-success" aria-hidden="true" />
        <span>Connected</span>
      </div>
    </header>
  );
}
