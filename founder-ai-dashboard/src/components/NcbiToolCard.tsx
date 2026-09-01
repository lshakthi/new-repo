import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  ExternalLink,
  LoaderCircle,
  Play,
  Repeat2,
  Dna,
  GitBranch,
  ListTree,
} from 'lucide-react';
import { ProvenanceTrail } from '../design-system';
import { getNcbiTool } from '../mocks/ncbiTools';
import type { NcbiToolId, NcbiToolResult } from '../mocks/ncbiTools';
import { fetchBlast, fetchSequenceOrigin, fetchSequenceSearch, fetchTaxonomy } from '../mocks/ncbiApi';

// A raw nucleotide/FASTA string should always go to BLAST, never a keyword
// search. This guards against a sequence being pasted into the wrong tool
// (e.g. "Sequence search"), which would otherwise return "no matches".
function looksLikeSequence(text: string): boolean {
  const raw = text.trim();
  if (!raw) return false;
  if (raw.startsWith('>')) return true; // FASTA
  const compact = raw.replace(/\s+/g, '');
  return compact.length >= 20 && /^[acgtun]+$/i.test(compact);
}

type RunState = 'idle' | 'running' | 'success';

const toolIcon: Record<NcbiToolId, typeof Dna> = {
  'taxonomy-lineage': ListTree,
  'sequence-search': GitBranch,
  'blast-sequence': Dna,
};

// Run a tool against the live NCBI APIs (with mock fallback inside ncbiApi).
function callNcbi(
  toolId: NcbiToolId,
  value: string,
  onProgress: (status: string) => void,
): Promise<NcbiToolResult> {
  switch (toolId) {
    case 'taxonomy-lineage':
      return fetchTaxonomy(value);
    case 'sequence-search':
      return fetchSequenceSearch(value);
    case 'blast-sequence':
      return fetchBlast(value, onProgress);
  }
}

interface NcbiToolCardProps {
  toolId: NcbiToolId;
  /** Prefills the input; falls back to the tool's example when empty. */
  initialValue?: string;
  /** Auto-run on mount (used when intent is unambiguous). */
  autoRun?: boolean;
}

export function NcbiToolCard({ toolId, initialValue, autoRun = false }: NcbiToolCardProps) {
  // The active tool can change in-place (e.g. taxonomy → sequence list for a taxon).
  const [activeToolId, setActiveToolId] = useState<NcbiToolId>(toolId);
  const tool = getNcbiTool(activeToolId);
  const [value, setValue] = useState((initialValue ?? '').trim() || getNcbiTool(toolId).example);
  const [runState, setRunState] = useState<RunState>('idle');
  const [result, setResult] = useState<NcbiToolResult | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  // ORIGIN base pairs fetched on demand, keyed by accession. `null` = fetched
  // but unavailable; a string = the sequence to show in-app.
  const [origins, setOrigins] = useState<Record<string, string | null>>({});
  const [loadingOrigin, setLoadingOrigin] = useState<string | null>(null);
  const [status, setStatus] = useState('Calling NCBI');
  const runToken = useRef(0);
  const didAutoRun = useRef(false);

  const execute = async (requestedToolId: NcbiToolId, runValue: string) => {
    if (!runValue.trim() || runState === 'running') return;

    // A pasted nucleotide sequence always belongs in BLAST. If it landed in a
    // keyword/organism tool, reroute to BLAST so the user still gets matches.
    const runToolId: NcbiToolId =
      requestedToolId !== 'blast-sequence' && looksLikeSequence(runValue)
        ? 'blast-sequence'
        : requestedToolId;
    if (runToolId !== activeToolId) setActiveToolId(runToolId);

    const token = ++runToken.current;
    setExpandedRecord(null);
    setOrigins({});
    setLoadingOrigin(null);
    setRunState('running');
    setResult(null);
    setStatus(runToolId === 'blast-sequence' ? 'Submitting to BLAST (this can take a while)' : 'Calling NCBI');

    const res = await callNcbi(runToolId, runValue, (s) => {
      if (token === runToken.current) setStatus(s);
    });

    // Ignore results from a superseded run.
    if (token !== runToken.current) return;
    setResult(res);
    setRunState('success');
  };

  // Pivot the card to a different NCBI tool (e.g. list a taxon's sequences),
  // updating the input and re-running in place.
  const runAs = (nextToolId: NcbiToolId, nextValue: string) => {
    setActiveToolId(nextToolId);
    setValue(nextValue);
    execute(nextToolId, nextValue);
  };

  // Expand a record and, if we don't already have its sequence, pull the
  // base pairs from NCBI so the user reads them in-app (no link-out needed).
  const toggleRecord = async (accession: string, presetOrigin?: string) => {
    if (expandedRecord === accession) {
      setExpandedRecord(null);
      return;
    }
    setExpandedRecord(accession);
    if (presetOrigin || origins[accession] !== undefined) return;
    setLoadingOrigin(accession);
    const origin = await fetchSequenceOrigin(accession);
    setOrigins((prev) => ({ ...prev, [accession]: origin }));
    setLoadingOrigin(null);
  };

  useEffect(() => {
    if (autoRun && !didAutoRun.current) {
      didAutoRun.current = true;
      execute(activeToolId, value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    execute(activeToolId, value);
  };

  const Icon = toolIcon[activeToolId];
  const isSequence = tool.inputKind === 'nucleotides';

  return (
    <div className="rounded-xl border border-cei-blue/20 bg-surface-elevated shadow-sm overflow-hidden">
      {/* Tool header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-cei-blue/5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-cei-blue/10 text-cei-blue shrink-0">
          <Icon size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{tool.name}</p>
            <span className="rounded-full bg-surface-panel px-2 py-0.5 text-[9px] font-medium text-text-secondary">NCBI</span>
          </div>
          <p className="text-xs text-text-secondary truncate">{tool.question}</p>
        </div>
        <a
          href={tool.websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-cei-blue hover:text-cei-navy shrink-0"
        >
          Source <ExternalLink size={11} />
        </a>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3">
        <label htmlFor={`ncbi-${toolId}`} className="block text-[11px] font-medium text-text-secondary mb-1.5">
          {tool.inputLabel}
        </label>
        {isSequence ? (
          <textarea
            id={`ncbi-${toolId}`}
            value={value}
            onChange={(e) => { setValue(e.target.value); if (runState === 'success') setRunState('idle'); }}
            rows={3}
            spellCheck={false}
            className="w-full resize-y rounded-lg border border-border-default bg-surface-panel px-3 py-2 font-mono text-xs leading-5 text-text-primary placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20 break-all"
            placeholder={tool.placeholder}
          />
        ) : (
          <input
            id={`ncbi-${toolId}`}
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); if (runState === 'success') setRunState('idle'); }}
            className="w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20"
            placeholder={tool.placeholder}
          />
        )}
        <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <button
            type="button"
            onClick={() => { setValue(tool.example); setRunState('idle'); }}
            className="text-left text-[11px] text-text-tertiary hover:text-cei-blue transition-colors"
          >
            <span className="font-medium">Try example</span>
          </button>
          <button
            type="submit"
            disabled={!value.trim() || runState === 'running'}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cei-blue px-3.5 py-2 text-xs font-medium text-white hover:bg-cei-navy disabled:cursor-not-allowed disabled:opacity-40 transition-colors shrink-0"
          >
            {runState === 'running'
              ? <><LoaderCircle size={13} className="animate-spin" /> Running</>
              : runState === 'success'
                ? <><Repeat2 size={13} /> Run again</>
                : <><Play size={12} /> Run</>}
          </button>
        </div>
      </form>

      {/* Live status */}
      {runState === 'running' && (
        <div className="px-4 pb-4" aria-live="polite" aria-busy="true">
          <div className="flex items-center gap-2 rounded-lg border border-cei-blue/20 bg-cei-blue/5 px-3 py-2.5 text-xs text-cei-blue">
            <LoaderCircle size={14} className="animate-spin shrink-0" />
            <span>{status}…</span>
          </div>
        </div>
      )}

      {/* Results */}
      {runState === 'success' && result && (
        <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-medium text-success">
                <Check size={10} /> Done · {result.totalDuration}
              </span>
              {result.live ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-cei-blue/10 px-2 py-0.5 text-[10px] font-medium text-cei-blue">
                  Live from NCBI
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-evidence-moderate/10 px-2 py-0.5 text-[10px] font-medium text-evidence-moderate">
                  Illustrative data
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-text-primary">{result.headline}</p>
            <p className="text-xs text-text-secondary mt-0.5 leading-5">{result.summary}</p>
            {result.notice && (
              <p className="text-[11px] text-text-tertiary mt-1 italic">{result.notice}</p>
            )}
          </div>

          {/* Taxonomy: key facts + lineage */}
          {result.taxon && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.taxon.map((t) => (
                <div key={t.label} className="rounded-lg border border-border-subtle bg-surface-panel/50 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-text-tertiary">{t.label}</p>
                  {t.href ? (
                    <a
                      href={t.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-cei-blue hover:text-cei-navy break-words"
                    >
                      {t.value} <ExternalLink size={10} className="shrink-0" />
                    </a>
                  ) : (
                    <p className="mt-0.5 text-xs font-medium text-text-primary break-words">{t.value}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Taxonomy → nucleotide list pivot (nuccore/?term=txid<id>) */}
          {result.taxonId && result.nucleotideCount && (
            <button
              type="button"
              onClick={() => runAs('sequence-search', `txid${result.taxonId}`)}
              className="w-full flex items-center gap-3 rounded-lg border border-cei-blue/20 bg-cei-blue/5 px-3 py-2.5 text-left hover:bg-cei-blue/10 transition-colors"
            >
              <GitBranch size={15} className="text-cei-blue shrink-0" />
              <span className="flex-1 text-xs text-text-primary">
                List the <span className="font-semibold">{result.nucleotideCount}</span> nucleotide sequences in GenBank for taxon {result.taxonId}
              </span>
              <span className="text-[11px] font-medium text-cei-blue">Open list</span>
            </button>
          )}
          {result.lineage && (
            <div className="rounded-lg border border-border-subtle bg-surface-panel/40 px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-wider text-text-tertiary mb-1.5">Lineage (root → organism)</p>
              <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
                {result.lineage.map((node, i) => (
                  <li key={`${node}-${i}`} className="flex items-center">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] ${
                      i === result.lineage!.length - 1
                        ? 'bg-cei-blue/10 font-semibold text-cei-blue'
                        : 'text-text-secondary'
                    }`}>{node}</span>
                    {i < result.lineage!.length - 1 && <span className="text-text-tertiary mx-0.5">›</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Sequence records (search + BLAST) */}
          {result.records && (
            <div className="space-y-1.5">
              {result.records.map((rec) => {
                const isOpen = expandedRecord === rec.accession;
                // Prefer an ORIGIN that came with the result, else one we
                // fetched on demand. `null` means fetched-but-unavailable.
                const fetched = origins[rec.accession];
                const originText = rec.origin ?? (fetched ?? undefined);
                const isLoading = loadingOrigin === rec.accession;
                const unavailable = !rec.origin && fetched === null;
                return (
                  <div
                    key={rec.accession}
                    className={`rounded-lg border bg-surface-panel/40 transition-colors ${isOpen ? 'border-cei-blue/30' : 'border-border-subtle'}`}
                  >
                    <div className="flex items-start gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-cei-blue">{rec.accession}</span>
                          {rec.score && (
                            <span className="rounded-full bg-surface-elevated px-1.5 py-0.5 text-[9px] font-medium text-text-secondary border border-border-subtle">
                              score {rec.score}{rec.identity ? ` · ${rec.identity} id` : ''}{rec.eValue ? ` · E ${rec.eValue}` : ''}
                            </span>
                          )}
                          <span className="text-[10px] text-text-tertiary">{rec.length}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-text-primary">{rec.title}</p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleRecord(rec.accession, rec.origin)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-cei-blue hover:text-cei-navy"
                            aria-expanded={isOpen}
                          >
                            {isOpen ? 'Hide sequence' : 'View sequence'}
                            <ArrowRight size={11} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                          </button>
                          <a
                            href={rec.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-text-tertiary hover:text-cei-blue"
                          >
                            GenBank record <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Sequence (GenBank ORIGIN) shown inline — no link-out needed */}
                    {isOpen && (
                      <div className="border-t border-border-subtle px-3 py-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-text-tertiary mb-1.5">ORIGIN — nucleotide base pairs</p>
                        {isLoading ? (
                          <div className="flex items-center gap-2 rounded-md bg-surface-panel px-3 py-2 text-[11px] text-text-secondary">
                            <LoaderCircle size={12} className="animate-spin shrink-0" /> Fetching sequence from NCBI…
                          </div>
                        ) : originText ? (
                          <pre className="overflow-x-auto rounded-md bg-surface-panel px-3 py-2 font-mono text-[10px] leading-4 text-text-secondary">{originText}</pre>
                        ) : unavailable ? (
                          <p className="text-[11px] text-text-tertiary italic">
                            Sequence could not be retrieved in-app.{' '}
                            <a href={rec.url} target="_blank" rel="noreferrer" className="text-cei-blue hover:text-cei-navy underline">
                              Open the GenBank record
                            </a>{' '}
                            to view it.
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Provenance + source link */}
          <ProvenanceTrail steps={result.provenance} totalDuration={result.totalDuration} />
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cei-blue hover:text-cei-navy"
          >
            {result.sourceLabel} <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}
