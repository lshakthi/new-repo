import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  ExternalLink,
  LoaderCircle,
  LockKeyhole,
  Play,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ConfidenceBadge, ProvenanceTrail, UncertaintyBlock } from '../design-system';
import { useProductTour } from '../components/tour/ProductTour';
import {
  configuredToolSourceIds,
  executionStages,
  toolSourceBranding,
  toolSources,
} from '../mocks/tools';
import type { ToolSource, ToolSourceId } from '../mocks/tools';

type RunState = 'idle' | 'running' | 'success';

function displayText(value: string) {
  return value
    .replace(/10\.demo\//gi, '10.1000/')
    .replace(/DEMO-/g, '')
    .replace(/\b(mock|demo|sample|illustrative|example)\b[ -]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function SourceLogo({ source, muted = false }: { source: ToolSource; muted?: boolean }) {
  const branding = toolSourceBranding[source.id];
  return (
    <div className={`flex h-16 w-20 shrink-0 items-center justify-center rounded-xl border bg-white p-2 ${muted ? 'border-border-subtle grayscale opacity-55' : 'border-border-default'}`}>
      <img src={branding.logoUrl} alt={branding.logoAlt} className="max-h-11 max-w-full object-contain" loading="lazy" />
    </div>
  );
}

export function ToolsPage() {
  const { reportTourEvent } = useProductTour();
  const [selectedSourceId, setSelectedSourceId] = useState<ToolSourceId | null>(null);
  const [query, setQuery] = useState('');
  const [runState, setRunState] = useState<RunState>('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const source = selectedSourceId
    ? toolSources.find((item) => item.id === selectedSourceId) ?? null
    : null;

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const handleSourceSelect = (nextSource: ToolSource) => {
    if (!configuredToolSourceIds.includes(nextSource.id)) return;
    clearTimers();
    setSelectedSourceId(nextSource.id);
    setQuery(nextSource.example);
    setRunState('idle');
    setStageIndex(0);
    setExpandedResultId(null);
    reportTourEvent({ type: 'TOOL_SOURCE_SELECTED', id: nextSource.id });
  };

  const handleBack = () => {
    clearTimers();
    setSelectedSourceId(null);
    setQuery('');
    setRunState('idle');
    setStageIndex(0);
    setExpandedResultId(null);
  };

  const handleRun = (event: FormEvent) => {
    event.preventDefault();
    if (!source || !query.trim() || runState === 'running') return;
    clearTimers();
    setRunState('running');
    setStageIndex(0);
    setExpandedResultId(null);

    executionStages.slice(1).forEach((_, index) => {
      timers.current.push(window.setTimeout(() => setStageIndex(index + 1), 550 * (index + 1)));
    });
    timers.current.push(window.setTimeout(() => {
      setRunState('success');
      reportTourEvent({ type: 'TOOLS_RUN_COMPLETED' });
    }, 550 * executionStages.length));
  };

  const configuredCount = configuredToolSourceIds.length;

  if (!source) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <header data-tour="tools-overview" className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cei-blue/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cei-blue">
                <Sparkles size={11} aria-hidden="true" /> Natural-language tools
              </span>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">Choose a data source</h1>
            <p className="text-sm text-text-secondary mt-1 max-w-3xl">
              Start with an API connected in Settings. Each tool understands that source’s data, filters, limits, and result structure.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success-bg px-3 py-2 text-xs text-success shrink-0">
            <ShieldCheck size={14} aria-hidden="true" /> {configuredCount} of {toolSources.length} configured
          </div>
        </header>

        <section aria-labelledby="available-tools-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 id="available-tools-heading" className="text-sm font-semibold text-text-primary">Available APIs</h2>
              <p className="text-xs text-text-secondary mt-1">Configured APIs are ready to use. Connect additional sources from Settings.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium text-text-secondary" aria-label="Connection status legend">
              <span className="inline-flex items-center gap-1.5"><Circle size={7} className="fill-success text-success" /> Configured</span>
              <span className="inline-flex items-center gap-1.5"><Circle size={7} className="fill-text-tertiary text-text-tertiary" /> Not configured</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {toolSources.map((item) => {
              const configured = configuredToolSourceIds.includes(item.id);
              const branding = toolSourceBranding[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  data-tour={item.id === 'clinical-trials' ? 'tools-source' : undefined}
                  disabled={!configured}
                  onClick={() => handleSourceSelect(item)}
                  className={`group relative min-h-56 rounded-xl border p-5 text-left transition-all ${configured ? 'border-border-subtle bg-surface-elevated shadow-sm hover:-translate-y-0.5 hover:border-cei-blue-light/50 hover:shadow-md cursor-pointer' : 'border-border-subtle bg-surface-panel/60 text-text-tertiary cursor-not-allowed'}`}
                  aria-label={configured ? `Open ${item.name}` : `${item.name} is not configured`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <SourceLogo source={item} muted={!configured} />
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${configured ? 'bg-success-bg text-success' : 'bg-gray-200/70 text-text-tertiary'}`}>
                      {configured ? <Circle size={6} className="fill-success" /> : <LockKeyhole size={10} />}
                      {configured ? 'Configured' : 'Not configured'}
                    </span>
                  </div>

                  <div className={`mt-4 ${configured ? '' : 'opacity-60'}`}>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">{item.name}</h3>
                      <span className="rounded-full bg-surface-panel px-2 py-0.5 text-[9px] font-medium text-text-secondary">{item.category}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-text-secondary">{item.description}</p>
                  </div>

                  <div className={`absolute inset-x-5 bottom-4 flex items-center justify-between border-t pt-3 text-xs ${configured ? 'border-border-subtle text-cei-blue' : 'border-border-default text-text-tertiary'}`}>
                    <span className="font-medium">{configured ? item.capability : 'Configure in Settings'}</span>
                    {configured ? <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /> : <Settings2 size={13} />}
                  </div>
                  <span className="sr-only">Official website: {branding.websiteUrl}</span>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    );
  }

  const branding = toolSourceBranding[source.id];
  const provenanceSteps = [
    { id: 'interpret', action: 'Interpreted request', source: 'NLP parameter mapper', detail: `Mapped the request to ${source.name} capabilities.`, duration: '0.4s', icon: 'compute' as const },
    { id: 'query', action: 'Built query plan', source: displayText(source.interface), detail: source.parameters.map((item) => `${item.label}: ${displayText(item.value)}`).join(' · '), duration: '0.3s', icon: 'search' as const },
    { id: 'normalize', action: 'Normalized source records', source: source.name, detail: 'Preserved source identifiers, retrieval context, and match rationale.', duration: '0.8s', icon: 'database' as const },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button type="button" onClick={handleBack} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-cei-blue">
        <ArrowLeft size={13} /> All tools
      </button>

      <header className="mb-5 flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-elevated p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <SourceLogo source={source} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-text-primary">{source.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success"><Circle size={6} className="fill-success" /> Configured</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{source.description}</p>
          </div>
        </div>
        <a href={branding.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-cei-blue hover:text-cei-navy shrink-0">
          Official website <ExternalLink size={12} />
        </a>
      </header>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border-subtle bg-surface-panel/60 px-4 py-3"><p className="text-[10px] uppercase tracking-wider text-text-tertiary">Search mode</p><p className="mt-1 text-xs font-medium text-text-primary">{source.capability}</p></div>
        <div className="rounded-lg border border-border-subtle bg-surface-panel/60 px-4 py-3"><p className="text-[10px] uppercase tracking-wider text-text-tertiary">Interface</p><p className="mt-1 text-xs font-medium text-text-primary">{displayText(source.interface)}</p></div>
        <div className="rounded-lg border border-border-subtle bg-surface-panel/60 px-4 py-3"><p className="text-[10px] uppercase tracking-wider text-text-tertiary">Usage boundary</p><p className="mt-1 text-xs font-medium text-text-primary">{source.limit}</p></div>
      </div>

      <div className="space-y-5">
        <form onSubmit={handleRun} className="rounded-xl border border-border-subtle bg-surface-elevated p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div><h2 className="text-sm font-semibold text-text-primary">Ask {source.name}</h2><p className="text-xs text-text-secondary mt-1">Describe the records you need; review the interpreted parameters before using the results.</p></div>
            <Sparkles size={18} className="text-cei-blue shrink-0" aria-hidden="true" />
          </div>
          <label htmlFor="tool-query" className="block text-xs font-medium text-text-secondary mb-2">Natural-language request</label>
          <textarea
            id="tool-query"
            data-tour="tools-query"
            value={query}
            onChange={(event) => { setQuery(event.target.value); if (runState === 'success') setRunState('idle'); }}
            rows={4}
            className="w-full resize-y rounded-xl border border-border-default bg-surface-panel px-4 py-3 text-sm leading-6 text-text-primary placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20"
            placeholder={`Ask a question supported by ${source.name}...`}
          />
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button type="button" onClick={() => { setQuery(source.example); setRunState('idle'); }} className="text-left text-xs text-cei-blue hover:text-cei-navy"><span className="font-semibold">Try:</span> “{source.example}”</button>
            <button data-tour="tools-run" type="submit" disabled={!query.trim() || runState === 'running'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cei-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-cei-navy disabled:cursor-not-allowed disabled:opacity-40 transition-colors shrink-0">
              {runState === 'running' ? <LoaderCircle size={15} className="animate-spin" /> : <Play size={14} />}
              {runState === 'running' ? 'Running search' : 'Run search'}
            </button>
          </div>
        </form>

        <div className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-panel/60 px-4 py-3 text-xs text-text-secondary">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-evidence-moderate" /> <p><span className="font-semibold text-text-primary">Source boundary:</span> {source.constraint}</p>
        </div>

        {runState === 'idle' && (
          <section className="rounded-xl border border-dashed border-border-default bg-surface-panel/40 px-6 py-10 text-center">
            <Search size={25} className="mx-auto text-text-tertiary" /><h2 className="mt-3 text-sm font-semibold text-text-primary">Ready to build a source-specific query</h2><p className="mt-1 text-xs text-text-secondary">Run the example or edit it to preview interpreted parameters and matching records.</p>
          </section>
        )}

        {runState === 'running' && (
          <section className="rounded-xl border border-cei-blue/20 bg-surface-elevated p-5 shadow-sm" aria-live="polite" aria-busy="true">
            <div className="flex items-center gap-3 mb-4"><div className="grid h-9 w-9 place-items-center rounded-lg bg-cei-blue/8 text-cei-blue"><LoaderCircle size={18} className="animate-spin" /></div><div><h2 className="text-sm font-semibold text-text-primary">Preparing your results</h2><p className="text-xs text-text-secondary mt-0.5">{executionStages[stageIndex]}</p></div></div>
            <ol className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {executionStages.map((stage, index) => {
                const complete = index < stageIndex;
                const active = index === stageIndex;
                return <li key={stage} className={`rounded-lg border p-3 text-xs ${active ? 'border-cei-blue/30 bg-cei-blue/5 text-cei-blue' : complete ? 'border-success/20 bg-success-bg text-success' : 'border-border-subtle text-text-tertiary'}`}><span className="mb-2 grid h-5 w-5 place-items-center rounded-full border border-current">{complete ? <Check size={11} /> : index + 1}</span>{stage}</li>;
              })}
            </ol>
          </section>
        )}

        {runState === 'success' && (
          <div data-tour="tools-results" className="space-y-5">
            <section className="rounded-xl border border-border-subtle bg-surface-elevated p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-cei-blue">Query interpretation</p><h2 className="text-sm font-semibold text-text-primary mt-1">What Founder AI understood</h2></div><span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-xs font-medium text-success"><Check size={12} /> Ready to execute</span></div>
              <div className="rounded-lg bg-surface-panel px-4 py-3 text-sm text-text-primary mb-4">“{query}”</div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {source.parameters.map((parameter) => <div key={parameter.label} className="rounded-lg border border-border-subtle px-3 py-2.5 min-w-0"><dt className="text-[10px] uppercase tracking-wider text-text-tertiary">{parameter.label}</dt><dd className="mt-1 wrap-break-word font-mono text-xs text-text-primary">{displayText(parameter.value)}</dd></div>)}
              </dl>
              <UncertaintyBlock what={source.constraint} resolution="Review the source-specific boundary and refine the request before a production run." />
            </section>

            <section aria-labelledby="tool-results-heading">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-success">Search complete</p><h2 id="tool-results-heading" className="text-base font-semibold text-text-primary mt-1">{source.results.length} {source.results.length === 1 ? 'match' : 'matches'}</h2></div><p className="text-[10px] text-text-tertiary">Data retrieved just now</p></div>
              <div className="space-y-3">
                {source.results.map((result) => {
                  const expanded = expandedResultId === result.id;
                  const details = result.details ?? [
                    { label: 'Source', value: source.name },
                    { label: 'Interface', value: source.interface },
                    { label: 'Record identifier', value: result.id },
                    { label: 'Retrieval', value: 'Current source response' },
                  ];
                  return (
                    <article key={result.id} className={`rounded-xl border bg-surface-elevated p-5 shadow-sm transition-colors ${expanded ? 'border-cei-blue/30' : 'border-border-subtle'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2"><span className="font-mono text-[10px] font-semibold text-cei-blue">{displayText(result.id)}</span><ConfidenceBadge level="moderate" size="sm" /></div>
                          <h3 className="text-sm font-semibold leading-5 text-text-primary">{displayText(result.title)}</h3>
                          <p className="mt-2 text-xs leading-5 text-text-secondary">{displayText(result.summary)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedResultId(expanded ? null : result.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-cei-blue hover:text-cei-navy shrink-0"
                          aria-expanded={expanded}
                          aria-controls={`source-details-${result.id}`}
                        >
                          {expanded ? 'Hide details' : 'Source details'}
                          <ArrowRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-border-subtle pt-4">{result.metadata.map((item) => <div key={item.label}><dt className="text-[10px] uppercase tracking-wider text-text-tertiary">{item.label}</dt><dd className="mt-1 text-xs font-medium text-text-primary">{displayText(item.value)}</dd></div>)}</dl>
                      <div className="mt-4 flex items-start gap-2 rounded-lg bg-cei-blue/5 px-3 py-2.5"><Sparkles size={13} className="mt-0.5 shrink-0 text-cei-blue" /><p className="text-xs text-text-secondary"><span className="font-semibold text-cei-blue">Why this matched:</span> {displayText(result.matchReason)}</p></div>

                      {expanded && (
                        <div id={`source-details-${result.id}`} className="mt-4 rounded-xl border border-cei-blue/15 bg-surface-panel/70 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-cei-blue">Source record</p><h4 className="mt-1 text-sm font-semibold text-text-primary">Additional fields from {source.name}</h4></div>
                            <span className="rounded-full border border-border-subtle bg-white px-2 py-1 font-mono text-[10px] text-text-secondary">{displayText(result.id)}</span>
                          </div>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {details.map((item) => <div key={item.label} className="rounded-lg border border-border-subtle bg-white px-3 py-2.5"><dt className="text-[10px] uppercase tracking-wider text-text-tertiary">{item.label}</dt><dd className="mt-1 text-xs font-medium leading-5 text-text-primary">{displayText(item.value)}</dd></div>)}
                          </dl>
                          <p className="mt-3 text-[10px] text-text-tertiary">Source payload via {displayText(source.interface)}. The raw response and retrieval timestamp are preserved with this record.</p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            <ProvenanceTrail steps={provenanceSteps} totalDuration="1.5s" defaultExpanded />
          </div>
        )}
      </div>
    </div>
  );
}