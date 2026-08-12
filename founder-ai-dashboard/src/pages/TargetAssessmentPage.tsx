import { ConfidenceBadge, CitationChip, ReviewGate, UncertaintyBlock, ExportCard } from '../design-system';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export function TargetAssessmentPage() {
  const { setEvidencePanelOpen, setActiveSourceId } = useApp();

  const handleCitationClick = (id: string) => {
    setActiveSourceId(id);
    setEvidencePanelOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Target Assessment: TP53 (R175H context)</h1>
          <p className="text-sm text-text-secondary mt-1">
            Indication: Solid tumors with TP53 R175H mutation · Generated Aug 12, 2026
          </p>
        </div>
        <ConfidenceBadge level="moderate" />
      </div>

      {/* Overall conclusion */}
      <div className="bg-cei-blue/5 border border-cei-blue/15 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-cei-blue mb-2">Overall conclusion</h2>
        <p className="text-sm text-text-primary leading-relaxed">
          TP53 R175H is biologically validated as a driver across multiple tumor types with strong genetic and functional evidence. However, therapeutic tractability remains uncertain. The target is worth pursuing with a differentiated approach (degradation or synthetic lethality) rather than conformational rescue alone, given recent clinical setbacks with APR-246 monotherapy.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <CitationChip id="cit-1" label="Open Targets score: 0.89" sourceType="database" onClick={handleCitationClick} />
          <CitationChip id="cit-2" label="DepMap essential in 34% lines" sourceType="database" onClick={handleCitationClick} />
        </div>
      </div>

      {/* Scorecard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Supporting evidence */}
        <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-success" />
            <h3 className="text-sm font-semibold text-text-primary">Supporting evidence</h3>
          </div>
          <ul className="space-y-2">
            {[
              { text: 'Pathogenic classification with no conflicts in ClinVar (multiple submitters)', confidence: 'strong' as const },
              { text: 'Gain-of-function mechanism well-characterized in vitro and in vivo', confidence: 'strong' as const },
              { text: 'Present in ~4.6% of all somatic TP53 mutations (high addressable prevalence)', confidence: 'strong' as const },
              { text: 'Cancer dependency confirmed in DepMap CRISPR screens', confidence: 'strong' as const },
              { text: 'Multiple therapeutic modalities under active clinical investigation', confidence: 'moderate' as const },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <ConfidenceBadge level={item.confidence} size="sm" showLabel={false} />
                <span className="text-xs text-text-primary">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contradicting / risk evidence */}
        <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={16} className="text-evidence-weak" />
            <h3 className="text-sm font-semibold text-text-primary">Contradicting or risk evidence</h3>
          </div>
          <ul className="space-y-2">
            {[
              { text: 'APR-246 monotherapy showed limited clinical efficacy in solid tumors', confidence: 'moderate' as const },
              { text: 'R175H causes global domain unfolding (harder to rescue than contact mutants)', confidence: 'moderate' as const },
              { text: 'No selective small molecule for R175H specifically (current assets are pan-mutant)', confidence: 'weak' as const },
              { text: 'Recent Novartis and Regeneron patent filings suggest growing competition', confidence: 'moderate' as const },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <ConfidenceBadge level={item.confidence} size="sm" showLabel={false} />
                <span className="text-xs text-text-primary">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pathway context */}
        <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-evidence-moderate" />
            <h3 className="text-sm font-semibold text-text-primary">Pathway and network context</h3>
          </div>
          <p className="text-xs text-text-secondary mb-2">
            TP53 sits at the hub of DNA damage response, apoptosis, cell cycle arrest, and senescence pathways. R175H GOF interactions expand the network to include p63/p73 family members and chromatin remodelers.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <CitationChip id="react-1" label="Reactome: TP53 network" sourceType="database" onClick={handleCitationClick} />
            <CitationChip id="string-1" label="STRING: 47 high-conf partners" sourceType="database" onClick={handleCitationClick} />
          </div>
        </div>

        {/* Evidence gaps */}
        <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-evidence-missing" />
            <h3 className="text-sm font-semibold text-text-primary">Evidence gaps</h3>
          </div>
          <div className="space-y-2">
            <UncertaintyBlock
              what="No co-crystal structure of a small molecule bound specifically to R175H mutant p53."
              resolution="Commission or find a published crystal structure of compound-bound R175H DBD."
            />
            <UncertaintyBlock
              what="In vivo efficacy data for degrader or synthetic-lethality approaches in R175H models is limited."
              resolution="Review preclinical data packages from recent conference presentations (AACR 2026)."
            />
          </div>
        </div>
      </div>

      {/* Suggested next steps */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Suggested next steps</h3>
        <div className="space-y-2">
          {[
            'Request structural prediction of R175H with confidence assessment',
            'Screen known compounds for R175H-selective binding (virtual docking)',
            'Build a patent landscape map for TP53 conformational correctors',
            'Compare R175H dependency across tumor types in DepMap',
          ].map((step, i) => (
            <button
              key={i}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md border border-border-subtle hover:border-cei-blue-light/30 hover:bg-surface-panel/50 transition-all group"
            >
              <ArrowRight size={12} className="text-text-tertiary group-hover:text-cei-blue-light" />
              <span className="text-xs text-text-secondary group-hover:text-text-primary">{step}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Review gate */}
      <ReviewGate
        reviewerType="scientific advisory board or oncology expert"
        reason="This target assessment informs a go/no-go research investment decision. The evidence summary should be reviewed by a domain expert before committing significant resources."
      />

      {/* Export */}
      <div className="mt-6">
        <ExportCard
          title="Target Assessment: TP53 R175H"
          description="Complete scorecard with supporting evidence, contradictions, gaps, and next steps."
          formats={['pdf', 'slides', 'markdown']}
          warnings={['2 evidence gaps remain unresolved', 'Structural prediction not yet completed']}
        />
      </div>

      {/* Sample data notice */}
      <div className="mt-6 px-4 py-2.5 bg-amber-50/50 border border-amber-200/40 rounded-lg">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Sample data for demonstration.</span> This target assessment uses realistic TP53 R175H data for prototype evaluation. Identifiers, scores, and evidence are illustrative.
        </p>
      </div>
    </div>
  );
}
