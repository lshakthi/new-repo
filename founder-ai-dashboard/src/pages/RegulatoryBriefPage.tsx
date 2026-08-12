import { ConfidenceBadge, CitationChip, ReviewGate, AssumptionInput, ExportCard, UncertaintyBlock } from '../design-system';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

export function RegulatoryBriefPage() {
  const { setEvidencePanelOpen, setActiveSourceId } = useApp();
  const [assumptions, setAssumptions] = useState({
    prevalence: '140,000',
    testPrice: '$3,500',
    adoptionRate: '15%',
    timeTo510k: '6-9 months',
  });

  const handleCitationClick = (id: string) => {
    setActiveSourceId(id);
    setEvidencePanelOpen(true);
  };

  const tam = 140000 * 3500;
  const sam = tam * 0.4;
  const som = sam * (parseInt(assumptions.adoptionRate) / 100);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Regulatory and Commercialization Brief</h1>
          <p className="text-sm text-text-secondary mt-1">
            Product: Cell-free DNA liquid biopsy for early colorectal cancer detection · Generated Aug 10, 2026
          </p>
        </div>
        <ConfidenceBadge level="moderate" />
      </div>

      {/* Pathway recommendation */}
      <div className="bg-cei-blue/5 border border-cei-blue/15 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-cei-blue mb-2">Recommended regulatory pathway</h2>
        <p className="text-sm text-text-primary leading-relaxed mb-3">
          A <span className="font-semibold">De Novo classification</span> is the most likely pathway. No substantially equivalent predicate device exists for a blood-based cfDNA multi-cancer early detection test targeting CRC specifically. The FDA has issued De Novo authorizations for similar liquid biopsy concepts (Guardant Health Shield, 2024).
        </p>
        <div className="flex flex-wrap gap-1.5">
          <CitationChip id="fda-1" label="FDA De Novo DEN200081" sourceType="database" onClick={handleCitationClick} />
          <CitationChip id="fda-2" label="FDA Guidance: LDT Final Rule 2025" sourceType="web" onClick={handleCitationClick} />
        </div>
      </div>

      {/* Pathway comparison table */}
      <div className="border border-border-subtle rounded-lg overflow-hidden mb-6 bg-surface-elevated">
        <div className="px-4 py-3 border-b border-border-subtle bg-surface-panel/50">
          <h3 className="text-sm font-semibold text-text-primary">Pathway comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-left text-text-tertiary">
                <th className="px-4 py-2 font-medium">Pathway</th>
                <th className="px-4 py-2 font-medium">Fit for this product</th>
                <th className="px-4 py-2 font-medium">Timeline</th>
                <th className="px-4 py-2 font-medium">Key requirement</th>
              </tr>
            </thead>
            <tbody className="text-text-primary">
              <tr className="border-b border-border-subtle bg-cei-blue/3">
                <td className="px-4 py-2.5 font-semibold">De Novo</td>
                <td className="px-4 py-2.5"><span className="text-success font-medium">Best fit</span></td>
                <td className="px-4 py-2.5">~150-180 review days</td>
                <td className="px-4 py-2.5">Clinical validation study, special controls proposal</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="px-4 py-2.5 font-medium">510(k)</td>
                <td className="px-4 py-2.5"><span className="text-evidence-moderate font-medium">Unlikely</span></td>
                <td className="px-4 py-2.5">~90 review days</td>
                <td className="px-4 py-2.5">Substantially equivalent predicate (none identified)</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="px-4 py-2.5 font-medium">PMA</td>
                <td className="px-4 py-2.5"><span className="text-evidence-weak font-medium">Overly burdensome</span></td>
                <td className="px-4 py-2.5">~180-360+ review days</td>
                <td className="px-4 py-2.5">Full clinical trial, manufacturing validation</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium">LDT (lab-developed)</td>
                <td className="px-4 py-2.5"><span className="text-evidence-moderate font-medium">Interim option</span></td>
                <td className="px-4 py-2.5">Phased enforcement begins 2026</td>
                <td className="px-4 py-2.5">CLIA certification, state licenses, limited marketing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence gaps checklist */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Evidence and document readiness</h3>
        <div className="space-y-2">
          {[
            { label: 'Analytical validation (sensitivity, specificity, LOD)', done: true },
            { label: 'Clinical validation study protocol', done: true },
            { label: 'Clinical validation results (n >= 1,000)', done: false },
            { label: 'Intended use statement reviewed by regulatory counsel', done: false },
            { label: 'Quality management system (ISO 13485)', done: true },
            { label: 'Risk management file (ISO 14971)', done: false },
            { label: 'Software validation documentation', done: false },
            { label: 'Special controls proposal', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.done
                ? <CheckSquare size={14} className="text-success" />
                : <Square size={14} className="text-text-tertiary" />
              }
              <span className={`text-xs ${item.done ? 'text-text-primary' : 'text-text-secondary'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-3">3 of 8 items ready · 5 items need attention before submission</p>
      </div>

      {/* Market sizing with editable assumptions */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Market size estimate</h3>
        <p className="text-xs text-text-secondary mb-4">Every number below depends on the assumptions shown. Edit any assumption to see how the estimate changes.</p>

        <div className="space-y-2 mb-4">
          <AssumptionInput
            label="Annual new CRC cases (US)"
            value={assumptions.prevalence}
            source="ACS Cancer Statistics 2026"
            onChange={(v) => setAssumptions({ ...assumptions, prevalence: v })}
          />
          <AssumptionInput
            label="Average test price"
            value={assumptions.testPrice}
            source="Comparable: Guardant Shield list price"
            onChange={(v) => setAssumptions({ ...assumptions, testPrice: v })}
          />
          <AssumptionInput
            label="Assumed adoption rate (Year 3)"
            value={assumptions.adoptionRate}
            unit="%"
            source="Analogous screening test adoption curves"
            onChange={(v) => setAssumptions({ ...assumptions, adoptionRate: v })}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-surface-panel rounded-lg">
            <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">TAM</p>
            <p className="text-lg font-semibold text-text-primary">${(tam / 1e9).toFixed(1)}B</p>
            <p className="text-[10px] text-text-tertiary">All eligible patients × price</p>
          </div>
          <div className="text-center p-3 bg-surface-panel rounded-lg">
            <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">SAM</p>
            <p className="text-lg font-semibold text-text-primary">${(sam / 1e6).toFixed(0)}M</p>
            <p className="text-[10px] text-text-tertiary">Reachable through target channels</p>
          </div>
          <div className="text-center p-3 bg-surface-panel rounded-lg">
            <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">SOM (Yr 3)</p>
            <p className="text-lg font-semibold text-text-primary">${(som / 1e6).toFixed(0)}M</p>
            <p className="text-[10px] text-text-tertiary">At {assumptions.adoptionRate}% adoption</p>
          </div>
        </div>

        <div className="mt-3 flex gap-1.5">
          <CitationChip id="acs-1" label="ACS Statistics 2026" sourceType="web" onClick={handleCitationClick} />
          <CitationChip id="guard-1" label="Guardant pricing" sourceType="web" onClick={handleCitationClick} />
        </div>
      </div>

      {/* Reimbursement */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Reimbursement and coding</h3>
        <p className="text-sm text-text-primary leading-relaxed mb-3">
          No specific CPT code exists for a cfDNA-based CRC screening test. The most relevant existing codes are CPT 81528 (Cologuard, stool-based) and the proprietary laboratory analyses (PLA) path. A Category III (emerging technology) CPT code application or a PLA code is the realistic near-term path. Medicare coverage would require a local or national coverage determination (LCD/NCD).
        </p>
        <UncertaintyBlock
          what="Whether CMS will issue a coverage determination for blood-based CRC screening before the product launches."
          resolution="Monitor CMS MedCAC meetings and track the Guardant Shield coverage decision as a leading indicator."
        />
      </div>

      {/* Review gate */}
      <ReviewGate
        reviewerType="regulatory affairs consultant and reimbursement specialist"
        reason="This brief covers FDA regulatory pathway, reimbursement strategy, and market sizing. These areas require qualified professional review before use in business planning or investor materials."
      />

      {/* Export */}
      <div className="mt-6">
        <ExportCard
          title="Regulatory and Commercialization Brief"
          description="Pathway recommendation, evidence gaps, market model, and reimbursement strategy."
          formats={['pdf', 'slides', 'markdown', 'docx']}
          warnings={['5 evidence gaps unresolved', 'Market assumptions should be reviewed']}
        />
      </div>

      {/* Sample notice */}
      <div className="mt-6 px-4 py-2.5 bg-amber-50/50 border border-amber-200/40 rounded-lg">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Sample data for demonstration.</span> This regulatory brief uses a realistic cfDNA liquid biopsy scenario for prototype evaluation. Regulatory pathways, timelines, and market estimates are illustrative.
        </p>
      </div>
    </div>
  );
}
