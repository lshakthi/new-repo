import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Crown,
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

type RunState = 'idle' | 'running' | 'success';

const toolIcon: Record<NcbiToolId, typeof Dna> = {
  'taxonomy-lineage': ListTree,
  'sequence-search': GitBranch,
  'blast-sequence': Dna,
};

// Per-flow visual identity. Each NCBI tool gets its own accent color so the
// three result types read as distinct at a glance, while staying inside the
// CEI palette. `bar` is the left accent stripe; `tint`/`chip` theme the icon
// and small labels; `grad` is a soft header wash.
const flowAccent: Record<NcbiToolId, { bar: string; tint: string; chip: string; grad: string; label: string }> = {
  'taxonomy-lineage': {
    bar: 'bg-cei-blue',
    tint: 'bg-cei-blue/10 text-cei-blue',
    chip: 'bg-cei-blue/10 text-cei-blue',
    grad: 'from-cei-blue/8 to-transparent',
    label: 'Taxonomy',
  },
  'sequence-search': {
    bar: 'bg-teal-600',
    tint: 'bg-teal-600/10 text-teal-700',
    chip: 'bg-teal-600/10 text-teal-700',
    grad: 'from-teal-500/8 to-transparent',
    label: 'Nucleotide records',
  },
  'blast-sequence': {
    bar: 'bg-indigo-600',
    tint: 'bg-indigo-600/10 text-indigo-700',
    chip: 'bg-indigo-600/10 text-indigo-700',
    grad: 'from-indigo-500/8 to-transparent',
    label: 'Alignment hits',
  },
};

// ─── Taxonomic rank classification ───────────────────────────
// NCBI lineage nodes arrive as a flat list of names without ranks. We map the
// well-known major-rank taxon names to the Linnaean rank they represent, each
// with its own color, so the lineage reads as categorized levels (Domain →
// Kingdom → … → Species) rather than an undifferentiated chain. Names not in
// the map are intermediate clades shown in a neutral tint.
interface RankTier {
  rank: string;
  dot: string;   // marker/legend swatch bg
  chip: string;  // pill bg + text
}

const RANK_TIERS: Record<string, RankTier> = {
  domain: { rank: 'Domain', dot: 'bg-violet-500', chip: 'bg-violet-100 text-violet-800' },
  kingdom: { rank: 'Kingdom', dot: 'bg-sky-500', chip: 'bg-sky-100 text-sky-800' },
  phylum: { rank: 'Phylum', dot: 'bg-teal-500', chip: 'bg-teal-100 text-teal-800' },
  class: { rank: 'Class', dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-800' },
  order: { rank: 'Order', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800' },
  family: { rank: 'Family', dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-800' },
  genus: { rank: 'Genus', dot: 'bg-rose-500', chip: 'bg-rose-100 text-rose-800' },
  species: { rank: 'Species', dot: 'bg-cei-gold', chip: 'bg-cei-gold text-white' },
};

// Which lineage node name anchors each major rank (for the common vertebrate
// lineage). Matched case-insensitively; the final node is always Species.
const RANK_BY_NAME: Record<string, keyof typeof RANK_TIERS> = {
  eukaryota: 'domain',
  bacteria: 'domain',
  archaea: 'domain',
  metazoa: 'kingdom',
  viridiplantae: 'kingdom',
  fungi: 'kingdom',
  chordata: 'phylum',
  arthropoda: 'phylum',
  mammalia: 'class',
  aves: 'class',
  'actinopteri': 'class',
  insecta: 'class',
  primates: 'order',
  rodentia: 'order',
  carnivora: 'order',
  hominidae: 'family',
  muridae: 'family',
  homo: 'genus',
  mus: 'genus',
  pan: 'genus',
};

function rankFor(name: string, isLeaf: boolean): RankTier | null {
  if (isLeaf) return RANK_TIERS.species;
  const key = RANK_BY_NAME[name.trim().toLowerCase()];
  return key ? RANK_TIERS[key] : null;
}

// Color a nucleotide string by base (A/C/G/T/U) for the ORIGIN viewer.
const BASE_COLOR: Record<string, string> = {
  a: 'text-emerald-600',
  c: 'text-blue-600',
  g: 'text-amber-600',
  t: 'text-rose-600',
  u: 'text-fuchsia-600',
};

// Strength color for the BLAST identity gauge, from percent identity.
function identityTone(pct: number): { bar: string; text: string } {
  if (pct >= 98) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
  if (pct >= 90) return { bar: 'bg-lime-500', text: 'text-lime-700' };
  if (pct >= 80) return { bar: 'bg-amber-500', text: 'text-amber-700' };
  return { bar: 'bg-orange-500', text: 'text-orange-700' };
}

// Render an ORIGIN block on a dark terminal, coloring each base while leaving
// the numbered gutter and spacing intact. Splits on base runs so React keys
// stay stable and non-base characters (digits, spaces) keep their muted color.
let colorKey = 0;
function colorizeOrigin(text: string): ReactNode[] {
  const tokens = text.split(/([acgtunACGTUN]+)/);
  return tokens.map((tok) => {
    if (!tok) return null;
    const isBases = /^[acgtunACGTUN]+$/.test(tok);
    if (!isBases) {
      return <span key={colorKey++} className="text-white/35">{tok}</span>;
    }
    return (
      <span key={colorKey++}>
        {tok.split('').map((ch) => (
          <span key={colorKey++} className={BASE_COLOR[ch.toLowerCase()] ?? 'text-white/70'}>{ch}</span>
        ))}
      </span>
    );
  });
}

// Run a tool against the live NCBI APIs (with mock fallback inside ncbiApi).
function callNcbi(
  toolId: NcbiToolId,
  value: string,
  onProgress: (status: string) => void,
  live?: boolean,
): Promise<NcbiToolResult> {
  switch (toolId) {
    case 'taxonomy-lineage':
      return fetchTaxonomy(value);
    case 'sequence-search':
      return fetchSequenceSearch(value);
    case 'blast-sequence':
      // Instant illustrative result by default; live (slow) BLAST only on demand.
      return fetchBlast(value, onProgress, { live });
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
  const [copiedAccession, setCopiedAccession] = useState<string | null>(null);
  const [status, setStatus] = useState('Calling NCBI');
  const runToken = useRef(0);
  const didAutoRun = useRef(false);

  const execute = async (runToolId: NcbiToolId, runValue: string, live = false) => {
    if (!runValue.trim() || runState === 'running') return;
    const token = ++runToken.current;
    setExpandedRecord(null);
    setOrigins({});
    setLoadingOrigin(null);
    setRunState('running');
    setResult(null);
    setStatus(
      runToolId === 'blast-sequence' && live
        ? 'Submitting to live BLAST (this can take a while)'
        : 'Calling NCBI',
    );

    const res = await callNcbi(runToolId, runValue, (s) => {
      if (token === runToken.current) setStatus(s);
    }, live);

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

  const copyOrigin = async (accession: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccession(accession);
      window.setTimeout(() => setCopiedAccession((cur) => (cur === accession ? null : cur)), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context); silently ignore.
    }
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
  const accent = flowAccent[activeToolId];

  return (
    <div className="relative flex rounded-xl border border-cei-blue/20 bg-surface-elevated shadow-sm overflow-hidden">
      {/* Per-flow accent stripe */}
      <div className={`w-1 shrink-0 ${accent.bar}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
      {/* Tool header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-gradient-to-r ${accent.grad}`}>
        <div className={`grid h-8 w-8 place-items-center rounded-lg shrink-0 ${accent.tint}`}>
          <Icon size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{tool.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${accent.chip}`}>{accent.label}</span>
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
          <div className={`overflow-hidden rounded-lg border border-cei-blue/20 bg-gradient-to-r ${accent.grad}`}>
            <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-cei-blue">
              <LoaderCircle size={14} className="animate-spin shrink-0" />
              <span>{status}…</span>
            </div>
            {/* Indeterminate progress sweep */}
            <div className="h-0.5 w-full overflow-hidden bg-cei-blue/10">
              <div className={`h-full w-1/3 ${accent.bar} animate-[ncbi-sweep_1.4s_ease-in-out_infinite]`} />
            </div>
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
            {/* Opt-in to the slow, live BLAST when the shown result is illustrative. */}
            {result.toolId === 'blast-sequence' && !result.live && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => execute('blast-sequence', value, true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cei-blue/30 px-2.5 py-1.5 text-[11px] font-medium text-cei-blue hover:bg-cei-blue/5 transition-colors"
                >
                  <Play size={11} /> Run live BLAST
                </button>
                <span className="text-[11px] text-text-tertiary">Queries NCBI directly; can take 15–40s.</span>
              </div>
            )}
          </div>

          {/* Taxonomy: key facts as a stat strip */}
          {result.taxon && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.taxon.map((t) => (
                <div key={t.label} className="relative overflow-hidden rounded-lg border border-cei-blue/15 bg-gradient-to-b from-cei-blue/5 to-transparent px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-text-tertiary">{t.label}</p>
                  {t.href ? (
                    <a
                      href={t.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-cei-blue hover:text-cei-navy break-words"
                    >
                      {t.value} <ExternalLink size={10} className="shrink-0" />
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm font-semibold text-text-primary break-words">{t.value}</p>
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
          {result.lineage && (() => {
            const lineage = result.lineage;
            // Collect the major ranks present, in lineage order, for the legend.
            const tiersPresent = lineage
              .map((n, i) => rankFor(n, i === lineage.length - 1))
              .filter((t, i, arr): t is RankTier => !!t && arr.findIndex((x) => x?.rank === t?.rank) === i);
            return (
              <div className="rounded-lg border border-border-subtle bg-surface-panel/40 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <ListTree size={12} className="text-cei-blue" />
                    <p className="text-[9px] uppercase tracking-wider text-text-tertiary">Lineage · classified by rank</p>
                  </div>
                  <span className="text-[9px] text-text-tertiary">{lineage.length} levels</span>
                </div>

                {/* Rank legend: one swatch per major rank present. */}
                {tiersPresent.length > 0 && (
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {tiersPresent.map((t) => (
                      <span key={t.rank} className="inline-flex items-center gap-1">
                        <span className={`h-2 w-2 rounded-full ${t.dot}`} aria-hidden="true" />
                        <span className="text-[9px] font-medium text-text-secondary">{t.rank}</span>
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-border-default" aria-hidden="true" />
                      <span className="text-[9px] text-text-tertiary">clade</span>
                    </span>
                  </div>
                )}

                {/* Indented hierarchy: a rank-label gutter keeps every name
                    aligned, while recognized ranks step-indent to show nesting.
                    A colored dot on a shared rail marks each rank; clades sit
                    flush and muted. The organism is the highlighted final row. */}
                <div className="relative">
                  {lineage.map((node, i) => {
                    const total = lineage.length;
                    const isLeaf = i === total - 1;
                    const tier = rankFor(node, isLeaf);
                    // Step indent only advances at recognized ranks, so the tree
                    // nests meaningfully without runaway indentation from clades.
                    const step = lineage.slice(0, i).filter((n) => rankFor(n, false)).length;
                    const indent = Math.min(step, 7) * 14;
                    return (
                      <div key={`${node}-${i}`} className="flex items-stretch">
                        {/* rank-label gutter */}
                        <div className="w-16 shrink-0 pr-2 text-right">
                          {tier && (
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${tier.chip.split(' ').find((c) => c.startsWith('text-')) ?? 'text-text-tertiary'}`}>
                              {tier.rank}
                            </span>
                          )}
                        </div>
                        {/* node + name, indented by depth */}
                        <div className="flex items-center gap-2 py-0.5" style={{ paddingLeft: `${indent}px` }}>
                          <span
                            className={`shrink-0 rounded-full ${
                              isLeaf
                                ? 'h-2.5 w-2.5 bg-cei-gold ring-2 ring-cei-gold/30'
                                : tier
                                  ? `h-2 w-2 ${tier.dot}`
                                  : 'h-1.5 w-1.5 bg-border-default'
                            }`}
                            aria-hidden="true"
                          />
                          {isLeaf ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-cei-gold/12 px-2 py-0.5">
                              <span className="text-[12px] font-semibold text-cei-navy">{node}</span>
                            </span>
                          ) : (
                            <span className={`text-[11px] leading-4 ${tier ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                              {node}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Records: BLAST hits render as a ranked leaderboard, sequence-search
              records as DNA-accented cards. Both share the ORIGIN viewer. */}
          {result.records && result.records.length > 0 && (
            <div className="space-y-2">
              {result.records.map((rec, idx) => {
                const isOpen = expandedRecord === rec.accession;
                const fetched = origins[rec.accession];
                const originText = rec.origin ?? (fetched ?? undefined);
                const isLoading = loadingOrigin === rec.accession;
                const unavailable = !rec.origin && fetched === null;
                const isBlast = result.toolId === 'blast-sequence';
                const isTop = isBlast && idx === 0;
                const pct = rec.identity ? parseInt(rec.identity, 10) : undefined;
                const tone = pct != null ? identityTone(pct) : null;

                return (
                  <div
                    key={rec.accession}
                    className={`overflow-hidden rounded-xl border transition-all ${
                      isTop
                        ? 'border-cei-gold/40 bg-gradient-to-br from-cei-gold/8 to-transparent shadow-sm'
                        : isOpen
                          ? 'border-cei-blue/30 bg-surface-panel/40'
                          : 'border-border-subtle bg-surface-panel/30 hover:border-cei-blue/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 px-3 py-3">
                      {/* Rank badge (BLAST) or DNA glyph (sequence search) */}
                      {isBlast ? (
                        <div
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                            isTop ? 'bg-cei-gold text-white' : 'bg-indigo-600/10 text-indigo-700'
                          }`}
                          aria-hidden="true"
                        >
                          {isTop ? <Crown size={13} /> : idx + 1}
                        </div>
                      ) : (
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-600/10 text-teal-700" aria-hidden="true">
                          <Dna size={14} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-cei-blue">{rec.accession}</span>
                          {isTop && (
                            <span className="rounded-full bg-cei-gold/15 px-1.5 py-0.5 text-[9px] font-semibold text-cei-gold">Top match</span>
                          )}
                          {rec.organism && (
                            <span className="rounded-full bg-surface-elevated px-1.5 py-0.5 text-[9px] font-medium text-text-secondary border border-border-subtle italic">
                              {rec.organism}
                            </span>
                          )}
                          <span className="text-[10px] text-text-tertiary">{rec.length}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-text-primary">{rec.title}</p>

                        {/* BLAST identity/score gauge */}
                        {isBlast && pct != null && tone && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 max-w-[180px] overflow-hidden rounded-full bg-border-subtle">
                              <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`text-[10px] font-semibold ${tone.text}`}>{rec.identity} identity</span>
                            {rec.score && <span className="text-[10px] text-text-tertiary">· score {rec.score}</span>}
                            {rec.eValue && <span className="text-[10px] text-text-tertiary">· E {rec.eValue}</span>}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-3">
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
                      <div className="border-t border-border-subtle bg-cei-navy/[0.02] px-3 py-2.5">
                        <div className="mb-1.5 flex items-center justify-between">
                          <p className="text-[9px] uppercase tracking-wider text-text-tertiary">ORIGIN · nucleotide base pairs</p>
                          {originText && (
                            <button
                              type="button"
                              onClick={() => copyOrigin(rec.accession, originText)}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-text-tertiary hover:text-cei-blue"
                            >
                              {copiedAccession === rec.accession
                                ? <><Check size={10} /> Copied</>
                                : <><Copy size={10} /> Copy</>}
                            </button>
                          )}
                        </div>
                        {isLoading ? (
                          <div className="flex items-center gap-2 rounded-md bg-surface-panel px-3 py-2 text-[11px] text-text-secondary">
                            <LoaderCircle size={12} className="animate-spin shrink-0" /> Fetching sequence from NCBI…
                          </div>
                        ) : originText ? (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md bg-cei-navy/95 px-3 py-1.5 mb-1.5 text-[9px] font-medium">
                            {(['a', 'c', 'g', 't'] as const).map((b) => (
                              <span key={b} className={`${BASE_COLOR[b]} uppercase`}>{b} <span className="text-white/40 normal-case">{b === 'a' ? 'adenine' : b === 'c' ? 'cytosine' : b === 'g' ? 'guanine' : 'thymine'}</span></span>
                            ))}
                          </div>
                        ) : null}
                        {!isLoading && originText && (
                          <pre className="overflow-x-auto rounded-md bg-cei-navy px-3 py-2 font-mono text-[10px] leading-4">{colorizeOrigin(originText)}</pre>
                        )}
                        {!isLoading && !originText && unavailable && (
                          <p className="text-[11px] text-text-tertiary italic">
                            Sequence could not be retrieved in-app.{' '}
                            <a href={rec.url} target="_blank" rel="noreferrer" className="text-cei-blue hover:text-cei-navy underline">
                              Open the GenBank record
                            </a>{' '}
                            to view it.
                          </p>
                        )}
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
    </div>
  );
}
