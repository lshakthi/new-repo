import { ConfidenceBadge, CitationChip, ReviewGate, ExportCard } from '../design-system';
import { useApp } from '../context/AppContext';

export function VariantReportPage() {
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
          <h1 className="text-xl font-semibold text-text-primary">Variant Evidence Report</h1>
          <p className="text-sm text-text-secondary mt-1">BRAF p.V600E (rs113488022) · Generated Aug 7, 2026</p>
        </div>
        <ConfidenceBadge level="strong" />
      </div>

      {/* Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Identity and nomenclature</h3>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Gene</dt>
              <dd className="text-text-primary font-medium">BRAF (ENSG00000157764)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Protein change</dt>
              <dd className="text-text-primary font-mono text-xs">p.Val600Glu (V600E)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">cDNA change</dt>
              <dd className="text-text-primary font-mono text-xs">c.1799T&gt;A</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Genomic (GRCh38)</dt>
              <dd className="text-text-primary font-mono text-xs">chr7:140753336 A&gt;T</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">dbSNP</dt>
              <dd className="text-text-primary font-mono text-xs">rs113488022</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Variant type</dt>
              <dd className="text-text-primary">Missense (substitution)</dd>
            </div>
          </dl>
        </div>

        <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Location in protein</h3>
          <p className="text-sm text-text-primary mb-2">
            The V600E mutation falls within the kinase activation segment of BRAF. This residue is critical for maintaining the inactive conformation. The glutamic acid substitution mimics phosphorylation and locks BRAF in a constitutively active state.
          </p>
          <div className="h-16 bg-gradient-to-r from-surface-panel via-evidence-strong-bg to-surface-panel rounded border border-border-subtle flex items-center justify-center relative mt-2">
            <div className="absolute left-[60%] w-1 h-full bg-evidence-weak/50"></div>
            <span className="text-[10px] text-text-tertiary">Kinase domain (residues 457-717) · V600 marked</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            <CitationChip id="up-braf" label="UniProt P15056" sourceType="database" onClick={handleCitationClick} />
          </div>
        </div>
      </div>

      {/* Clinical significance */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-primary">Clinical significance</h3>
          <ConfidenceBadge level="strong" size="sm" />
        </div>
        <p className="text-sm text-text-primary mb-2">
          <span className="font-semibold text-evidence-weak">Pathogenic</span> in ClinVar (review status: criteria provided, multiple submitters, no conflicts). This is one of the most well-characterized oncogenic driver mutations, present in approximately 50% of melanomas, 10% of colorectal cancers, and various other tumor types.
        </p>
        <div className="flex gap-1.5">
          <CitationChip id="cv-braf" label="ClinVar VCV000013961" sourceType="database" onClick={handleCitationClick} />
          <CitationChip id="cosmic-braf" label="COSMIC: 27% all BRAF" sourceType="database" onClick={handleCitationClick} />
        </div>
      </div>

      {/* Population frequency */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-primary">Population frequency</h3>
          <ConfidenceBadge level="strong" size="sm" />
        </div>
        <p className="text-sm text-text-primary">
          Not observed in the gnomAD v4.1 general population dataset (0 alleles in 251,152 total). This is consistent with its role as a somatic oncogenic driver rather than a heritable polymorphism.
        </p>
        <div className="flex gap-1.5 mt-2">
          <CitationChip id="gn-braf" label="gnomAD v4.1: absent" sourceType="database" onClick={handleCitationClick} />
        </div>
      </div>

      {/* Cancer actionability */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-primary">Cancer actionability</h3>
          <ConfidenceBadge level="strong" size="sm" />
        </div>
        <p className="text-sm text-text-primary mb-2">
          CIViC Level A evidence: BRAF V600E predicts response to vemurafenib and dabrafenib (FDA-approved BRAF inhibitors) in melanoma. Level B evidence for combination with MEK inhibitors (trametinib). Also actionable in NSCLC, thyroid cancer, and hairy cell leukemia with FDA-approved therapies.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <CitationChip id="civic-braf" label="CIViC EID 883" sourceType="database" onClick={handleCitationClick} />
          <CitationChip id="fda-vem" label="FDA label: vemurafenib" sourceType="database" onClick={handleCitationClick} />
          <CitationChip id="nccn-mel" label="NCCN Melanoma v4.2026" sourceType="web" onClick={handleCitationClick} />
        </div>
      </div>

      {/* Functional impact */}
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-primary">Predicted functional impact</h3>
          <ConfidenceBadge level="strong" size="sm" />
        </div>
        <p className="text-sm text-text-primary">
          Constitutive activation of the RAS-RAF-MEK-ERK signaling cascade. The V600E substitution disrupts the hydrophobic interactions that stabilize the inactive kinase conformation, resulting in approximately 500-fold elevated kinase activity compared to wild-type BRAF.
        </p>
      </div>

      {/* Review gate */}
      <ReviewGate
        reviewerType="clinical geneticist or molecular tumor board"
        reason="This variant report contains clinical significance and therapeutic actionability information. Clinical decisions about treatment selection should be made by qualified professionals using validated clinical-grade assays."
      />

      {/* Export */}
      <div className="mt-6">
        <ExportCard
          title="Variant Evidence Report: BRAF V600E"
          description="Complete evidence dossier with nomenclature, frequency, clinical significance, actionability, and functional impact."
          formats={['pdf', 'markdown', 'docx']}
        />
      </div>

      {/* Sample notice */}
      <div className="mt-6 px-4 py-2.5 bg-amber-50/50 border border-amber-200/40 rounded-lg">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Sample data for demonstration.</span> This variant report uses the well-characterized BRAF V600E mutation for prototype evaluation.
        </p>
      </div>
    </div>
  );
}
