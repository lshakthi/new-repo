import { useState } from 'react';
import { TaskProgress, ConfidenceBadge, CitationChip, ReviewGate, ExportCard } from '../design-system';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Play, Pause, AlertTriangle } from 'lucide-react';

export function PipelinePage() {
  const { setEvidencePanelOpen, setActiveSourceId } = useApp();
  const [approved, setApproved] = useState(false);

  const handleCitationClick = (id: string) => {
    setActiveSourceId(id);
    setEvidencePanelOpen(true);
  };

  const pipelineSteps = [
    { id: 's1', label: 'Variant evidence gathering (ClinVar, gnomAD, literature)', status: 'completed' as const, detail: '38s' },
    { id: 's2', label: 'Structural impact prediction (R175H on p53 DBD)', status: 'completed' as const, detail: '2m 14s' },
    { id: 's3', label: 'Target validation scorecard', status: 'completed' as const, detail: '1m 52s' },
    { id: 's4', label: 'Compound landscape (known inhibitors and modulators)', status: 'completed' as const, detail: '1m 8s' },
    { id: 's5', label: 'Patent and freedom-to-operate screen', status: 'partial' as const, detail: 'PatentsView timeout, retrying' },
    { id: 's6', label: 'Competitive trial landscape', status: 'running' as const },
    { id: 's7', label: 'Synthesis: connected decision package', status: 'idle' as const },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">End-to-End Evidence Pipeline</h1>
        <p className="text-sm text-text-secondary mt-1">
          Question: "Is TP53 R175H a viable therapeutic target? Build the complete case from variant through competitive landscape."
        </p>
      </div>

      {/* Plan approval (pre-execution) */}
      {!approved && (
        <div className="border border-cei-blue/20 bg-cei-blue/3 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-cei-blue mb-2">Proposed work plan</h2>
          <p className="text-xs text-text-secondary mb-3">
            This question requires multiple connected analyses. Review the plan below and approve to start.
          </p>
          <ol className="space-y-2 mb-4">
            {[
              'Gather variant evidence: ClinVar classification, population frequency, literature support',
              'Predict structural impact: model R175H effect on p53 DNA-binding domain stability',
              'Build target validation scorecard: disease association, pathway context, dependency data',
              'Survey compound landscape: known modulators, SAR data, competitive molecules',
              'Screen patent landscape: recent filings, freedom-to-operate signals',
              'Map competitive trials: active and completed studies targeting mutant p53',
              'Synthesize: connect all findings into one decision package with an overall recommendation',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-text-primary">
                <span className="text-text-tertiary font-mono w-4 flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setApproved(true)}
              className="px-4 py-2 rounded-lg bg-cei-blue text-white text-sm font-medium hover:bg-cei-navy transition-colors flex items-center gap-2"
            >
              <Play size={14} /> Approve and start
            </button>
            <span className="text-xs text-text-tertiary">Estimated time: 8-12 minutes · No spend required</span>
          </div>
        </div>
      )}

      {/* Progress (post-approval) */}
      {approved && (
        <>
          <TaskProgress steps={pipelineSteps} title="Pipeline progress" />

          {/* Partial failure notice */}
          <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-evidence-moderate-bg border border-evidence-moderate/20">
            <AlertTriangle size={16} className="text-evidence-moderate mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-evidence-moderate">Partial result on step 5</p>
              <p className="text-xs text-text-secondary mt-0.5">
                PatentsView API timed out during the patent search. 23 of ~40 expected results were retrieved. The system is retrying. The synthesis step will note which patent data may be incomplete.
              </p>
            </div>
          </div>

          {/* Completed branch summaries */}
          <div className="mt-6 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Completed findings</h2>

            {/* Branch 1: Variant */}
            <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success" />
                  <h3 className="text-sm font-semibold text-text-primary">Variant evidence</h3>
                </div>
                <ConfidenceBadge level="strong" size="sm" />
              </div>
              <p className="text-xs text-text-primary leading-relaxed">
                TP53 p.R175H is pathogenic (ClinVar, no conflicts), extremely rare in general population (gnomAD AF: 0.000004), and is the single most frequent TP53 hotspot in COSMIC. Gain-of-function mechanism is supported by 200+ publications.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <CitationChip id="cv-1" label="ClinVar VCV000012347" sourceType="database" onClick={handleCitationClick} />
                <CitationChip id="gn-1" label="gnomAD v4.1" sourceType="database" onClick={handleCitationClick} />
              </div>
            </div>

            {/* Branch 2: Structure */}
            <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success" />
                  <h3 className="text-sm font-semibold text-text-primary">Structural impact</h3>
                </div>
                <ConfidenceBadge level="moderate" size="sm" />
              </div>
              <p className="text-xs text-text-primary leading-relaxed">
                R175H disrupts a critical zinc-coordination residue in the p53 DNA-binding domain, causing global destabilization (predicted ΔΔG: +4.2 kcal/mol). The mutation shifts the protein from a folded to a molten-globule-like state at physiological temperature. This structural disruption is more severe than surface-contact mutations like R248W.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <CitationChip id="af-1" label="AlphaFold prediction" sourceType="database" onClick={handleCitationClick} />
                <CitationChip id="pm-struct" label="PMID 38901234" sourceType="pubmed" onClick={handleCitationClick} />
              </div>
              {/* Mock 3D placeholder */}
              <div className="mt-3 h-32 bg-gradient-to-br from-surface-panel to-border-subtle rounded-lg flex items-center justify-center border border-border-subtle">
                <p className="text-xs text-text-tertiary">3D structure comparison (wild-type vs. R175H) would render here</p>
              </div>
            </div>

            {/* Branch 3: Target validation */}
            <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success" />
                  <h3 className="text-sm font-semibold text-text-primary">Target validation</h3>
                </div>
                <ConfidenceBadge level="moderate" size="sm" />
              </div>
              <p className="text-xs text-text-primary leading-relaxed">
                Open Targets association score: 0.89 (strong). DepMap CRISPR essentiality: dependent in 34% of tested cancer lines. Oncology indication breadth: pancreatic, ovarian, breast (triple-negative), lung (NSCLC), and colorectal cancers show highest R175H prevalence. However, therapeutic tractability score is lower than the biological validation score, reflecting limited clinical success to date.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <CitationChip id="ot-1" label="Open Targets" sourceType="database" onClick={handleCitationClick} />
                <CitationChip id="dm-1" label="DepMap 24Q2" sourceType="database" onClick={handleCitationClick} />
              </div>
            </div>

            {/* Branch 4: Compounds */}
            <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success" />
                  <h3 className="text-sm font-semibold text-text-primary">Compound landscape</h3>
                </div>
                <ConfidenceBadge level="moderate" size="sm" />
              </div>
              <p className="text-xs text-text-primary leading-relaxed">
                12 compounds with reported activity against mutant p53 found in ChEMBL. APR-246 (eprenetapopt) is the most advanced (Phase 3 in MDS). PC14586 (rezatapopt) is Y220C-selective and does not target R175H. No R175H-specific small molecule has entered clinical trials. Three PROTAC programs are in preclinical stage per recent publications.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <CitationChip id="chembl-1" label="ChEMBL target report" sourceType="database" onClick={handleCitationClick} />
                <CitationChip id="nct-apr" label="NCT03745716" sourceType="trial" onClick={handleCitationClick} />
              </div>
            </div>
          </div>

          {/* Synthesis (when complete) */}
          <div className="mt-6 border-2 border-cei-blue/20 rounded-xl p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Pause size={14} className="text-text-tertiary" />
              <h2 className="text-sm font-semibold text-text-primary">Connected recommendation</h2>
              <span className="text-xs text-text-tertiary">(will generate when all branches complete)</span>
            </div>
            <p className="text-xs text-text-secondary italic">
              This section will synthesize findings across all branches into a single recommendation, explaining how the variant evidence, structural data, target validation, compound landscape, patent analysis, and competitive trials connect to answer your original question.
            </p>
          </div>

          {/* Review gate */}
          <div className="mt-6">
            <ReviewGate
              reviewerType="scientific advisor or target-selection committee"
              reason="This pipeline produces a complete target assessment intended to inform a research investment decision. All branches should be reviewed together, as partial branch failures may leave gaps in the overall recommendation."
            />
          </div>

          {/* Export */}
          <div className="mt-6">
            <ExportCard
              title="Cross-Domain Evidence Package: TP53 R175H"
              description="Connected decision package with variant evidence, structural analysis, target validation, compound landscape, and competitive context."
              formats={['pdf', 'slides', 'markdown']}
              warnings={[
                'Patent search incomplete (23/~40 results retrieved)',
                'Competitive trial landscape still running',
                'Synthesis section pending completion',
              ]}
            />
          </div>
        </>
      )}

      {/* Sample notice */}
      <div className="mt-6 px-4 py-2.5 bg-amber-50/50 border border-amber-200/40 rounded-lg">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Sample data for demonstration.</span> This pipeline shows the cross-domain evidence flow with realistic partial completion and failure states.
        </p>
      </div>
    </div>
  );
}
