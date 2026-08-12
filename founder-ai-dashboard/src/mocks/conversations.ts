import type { ProvenanceStep } from '../design-system';

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  sections?: ChatSection[];
  provenance?: ProvenanceStep[];
  totalDuration?: string;
  followUps?: string[];
}

export interface ChatSection {
  id: string;
  title: string;
  content: string;
  confidence: 'strong' | 'moderate' | 'weak' | 'conflict' | 'missing';
  citations?: Array<{ id: string; label: string; sourceType: 'pubmed' | 'database' | 'trial' | 'patent' | 'preprint' | 'web' }>;
  uncertainties?: Array<{ what: string; resolution: string }>;
  conflict?: {
    topic: string;
    positions: Array<{ position: string; summary: string }>;
  };
}

export interface TaskConversation {
  taskId: string;
  title: string;
  summary: string;
  messages: ChatMessage[];
}

export const taskConversations: Record<string, TaskConversation> = {
  'research-question': {
    taskId: 'research-question',
    title: 'CRISPR base editing off-target effects',
    summary: 'Base editing has lower off-target rates than traditional CRISPR-Cas9, but bystander edits within the editing window remain a concern. Recent work with engineered deaminases has reduced this significantly.',
    messages: [
      { id: 'rq-1', role: 'user', content: 'What is known about CRISPR base editing off-target effects?' },
      { id: 'rq-2', role: 'system', content: 'Searching PubMed, bioRxiv, and recent reviews on base editor specificity.' },
      { id: 'rq-3', role: 'assistant', content: '', sections: [
        {
          id: 'rq-s1', title: 'Overall off-target profile',
          content: 'Cytosine and adenine base editors (CBEs and ABEs) show substantially lower genome-wide off-target editing compared to traditional Cas9 nucleases. ABEs in particular have very few detectable DNA off-target sites. However, CBEs can cause guide-independent off-target C-to-U editing in both DNA and RNA.',
          confidence: 'strong',
          citations: [
            { id: 'rq-c1', label: 'PMID 37829104', sourceType: 'pubmed' },
            { id: 'rq-c2', label: 'Nature Biotech 2024 review', sourceType: 'pubmed' },
          ]
        },
        {
          id: 'rq-s2', title: 'Bystander editing within the window',
          content: 'The main specificity concern is bystander editing: unintended changes to other bases within the ~5 nucleotide editing window. This is particularly relevant for therapeutic applications where only one specific base should change. Newer "precision" editors like ABE8e-V106W narrow the window significantly.',
          confidence: 'moderate',
          citations: [
            { id: 'rq-c3', label: 'PMID 38291056', sourceType: 'pubmed' },
            { id: 'rq-c4', label: 'PMID 37654890', sourceType: 'preprint' },
          ]
        },
        {
          id: 'rq-s3', title: 'RNA off-target effects',
          content: 'Some CBE variants (particularly those using APOBEC1 deaminase) cause transcriptome-wide C-to-U RNA editing. Engineered variants like YE1 and SECURE-BE4 have dramatically reduced this, but it remains an area to characterize for any new editor before clinical use.',
          confidence: 'moderate',
          citations: [
            { id: 'rq-c5', label: 'PMID 36982234', sourceType: 'pubmed' },
          ]
        },
      ],
      provenance: [
        { id: 'rq-p1', action: 'Searched PubMed for base editing off-target', source: 'PubMed E-utilities', duration: '1.8s', icon: 'search' },
        { id: 'rq-p2', action: 'Retrieved 3 recent reviews', source: 'PubMed', duration: '0.9s', icon: 'database' },
        { id: 'rq-p3', action: 'Searched bioRxiv for 2024-2026 preprints', source: 'bioRxiv API', duration: '1.2s', icon: 'search' },
      ],
      totalDuration: '12 seconds',
      followUps: [
        'Which base editor has the lowest off-target rate?',
        'Compare CBE vs ABE specificity for therapeutic use.',
        'What assays detect base editor off-targets?',
      ]},
    ],
  },

  'check-sequence': {
    taskId: 'check-sequence',
    title: 'Sequence identification and QC',
    summary: 'Your sequence is a 1,247 bp DNA fragment encoding human hemoglobin subunit beta (HBB). GC content is 52.3%, within normal range. No obvious quality issues detected.',
    messages: [
      { id: 'cs-1', role: 'user', content: 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG...' },
      { id: 'cs-2', role: 'system', content: 'Detecting sequence type and running basic QC checks.' },
      { id: 'cs-3', role: 'assistant', content: '', sections: [
        {
          id: 'cs-s1', title: 'Sequence type and identity',
          content: 'This is a DNA sequence, 1,247 base pairs. BLAST alignment identifies it as human hemoglobin subunit beta (HBB), matching NM_000518.5 with 99.8% identity. The 0.2% difference is a single nucleotide at position 364.',
          confidence: 'strong',
          citations: [
            { id: 'cs-c1', label: 'NCBI BLAST hit', sourceType: 'database' },
            { id: 'cs-c2', label: 'RefSeq NM_000518.5', sourceType: 'database' },
          ]
        },
        {
          id: 'cs-s2', title: 'Quality metrics',
          content: 'GC content: 52.3% (normal for human coding sequence). No homopolymer runs longer than 5 bases. No unexpected stop codons in the primary reading frame. The sequence translates cleanly to a 147 amino acid protein matching hemoglobin beta.',
          confidence: 'strong',
          citations: [
            { id: 'cs-c3', label: 'UniProt P68871 (HBB_HUMAN)', sourceType: 'database' },
          ]
        },
        {
          id: 'cs-s3', title: 'Notable difference from reference',
          content: 'Position 364: G>A compared to reference. This corresponds to the sickle cell variant (HBB p.E6V, rs334) if confirmed. Recommend verifying whether this is intentional in your construct design.',
          confidence: 'moderate',
          citations: [
            { id: 'cs-c4', label: 'ClinVar: rs334', sourceType: 'database' },
          ]
        },
      ],
      provenance: [
        { id: 'cs-p1', action: 'Detected sequence type (DNA)', source: 'Local analysis', duration: '0.1s', icon: 'compute' },
        { id: 'cs-p2', action: 'Calculated GC content and k-mer stats', source: 'Local analysis', duration: '0.2s', icon: 'compute' },
        { id: 'cs-p3', action: 'BLAST search against nr database', source: 'NCBI BLAST', duration: '8.4s', icon: 'search' },
        { id: 'cs-p4', action: 'Translated and checked reading frame', source: 'Local analysis', duration: '0.1s', icon: 'compute' },
      ],
      totalDuration: '9 seconds',
      followUps: [
        'Is the G>A at position 364 the sickle cell mutation?',
        'Translate this sequence and show the protein.',
        'Design primers to amplify this region.',
      ]},
    ],
  },

  'target-assessment': {
    taskId: 'target-assessment',
    title: 'IL6R target assessment for rheumatoid arthritis',
    summary: 'IL6R is a well-validated target for RA with approved therapies (tocilizumab, sarilumab). Strong genetic and clinical evidence. The space is competitive but specific patient subgroups may be underserved.',
    messages: [
      { id: 'ta-1', role: 'user', content: 'Build a target validation scorecard for IL6R in rheumatoid arthritis.' },
      { id: 'ta-2', role: 'system', content: 'Pulling disease association, pathway context, approved compounds, and competitive landscape.' },
      { id: 'ta-3', role: 'assistant', content: '', sections: [
        {
          id: 'ta-s1', title: 'Disease association strength',
          content: 'IL6R has one of the strongest genetic associations with RA. The IL6R p.D358A variant (rs2228145) is protective against RA in GWAS, directly implicating IL-6 signaling in disease pathogenesis. Open Targets overall association score: 0.94.',
          confidence: 'strong',
          citations: [
            { id: 'ta-c1', label: 'Open Targets: IL6R-RA', sourceType: 'database' },
            { id: 'ta-c2', label: 'PMID 35231073 (GWAS)', sourceType: 'pubmed' },
          ]
        },
        {
          id: 'ta-s2', title: 'Clinical validation',
          content: 'Two approved anti-IL6R antibodies: tocilizumab (Actemra, Roche) and sarilumab (Kevzara, Sanofi/Regeneron). Both show efficacy in moderate-to-severe RA. This is definitive clinical validation that the target works.',
          confidence: 'strong',
          citations: [
            { id: 'ta-c3', label: 'FDA label: tocilizumab', sourceType: 'database' },
            { id: 'ta-c4', label: 'FDA label: sarilumab', sourceType: 'database' },
          ]
        },
        {
          id: 'ta-s3', title: 'Competitive landscape',
          content: 'The IL6/IL6R space is mature with two blockbuster biologics. New entrants would need differentiation: oral small molecule, better safety profile, subcutaneous convenience, or specific subpopulation focus. 4 active clinical trials for next-generation IL-6 pathway agents found on ClinicalTrials.gov.',
          confidence: 'moderate',
          citations: [
            { id: 'ta-c5', label: 'ClinicalTrials.gov search', sourceType: 'trial' },
            { id: 'ta-c6', label: 'ChEMBL: IL6R compounds', sourceType: 'database' },
          ]
        },
      ],
      provenance: [
        { id: 'ta-p1', action: 'Queried Open Targets for IL6R disease associations', source: 'Open Targets', duration: '1.1s', icon: 'database' },
        { id: 'ta-p2', action: 'Searched ClinicalTrials.gov for IL6R RA trials', source: 'CT.gov API', duration: '1.5s', icon: 'search' },
        { id: 'ta-p3', action: 'Queried ChEMBL for known IL6R compounds', source: 'ChEMBL', duration: '0.8s', icon: 'database' },
        { id: 'ta-p4', action: 'Searched PubMed for IL6R RA GWAS evidence', source: 'PubMed', duration: '1.9s', icon: 'search' },
      ],
      totalDuration: '22 seconds',
      followUps: [
        'What patient subgroups respond best to IL6R blockade?',
        'Are there oral small molecules targeting IL6R?',
        'Compare IL6R vs JAK inhibitors for RA.',
      ]},
    ],
  },

  'variant-interpretation': {
    taskId: 'variant-interpretation',
    title: 'BRCA2 c.5946delT interpretation',
    summary: 'BRCA2 c.5946delT is a pathogenic frameshift variant. It creates a premature stop codon, producing a truncated, non-functional BRCA2 protein. Associated with increased breast and ovarian cancer risk.',
    messages: [
      { id: 'vi-1', role: 'user', content: 'Is BRCA2 c.5946delT pathogenic?' },
      { id: 'vi-2', role: 'system', content: 'Querying ClinVar, gnomAD, and literature for this variant.' },
      { id: 'vi-3', role: 'assistant', content: '', sections: [
        {
          id: 'vi-s1', title: 'Clinical classification',
          content: 'Pathogenic in ClinVar with review status "reviewed by expert panel." This is a frameshift deletion that introduces a premature termination codon at position 1982 of the protein, resulting in loss of the critical DNA-binding domain.',
          confidence: 'strong',
          citations: [
            { id: 'vi-c1', label: 'ClinVar VCV000051088', sourceType: 'database' },
            { id: 'vi-c2', label: 'ENIGMA classification', sourceType: 'database' },
          ]
        },
        {
          id: 'vi-s2', title: 'Population frequency',
          content: 'Extremely rare in general population. gnomAD allele frequency: 0.000008 (2 alleles in 251,398). Consistent with a high-penetrance disease-causing variant, not a benign polymorphism.',
          confidence: 'strong',
          citations: [
            { id: 'vi-c3', label: 'gnomAD v4.1', sourceType: 'database' },
          ]
        },
        {
          id: 'vi-s3', title: 'Clinical significance',
          content: 'Carriers have significantly elevated lifetime risk for breast cancer (45-65%) and ovarian cancer (15-25%). Eligible for PARP inhibitor therapy (olaparib) if diagnosed with HER2-negative breast cancer or ovarian cancer. Qualifies for enhanced screening protocols.',
          confidence: 'strong',
          citations: [
            { id: 'vi-c4', label: 'NCCN Guidelines v3.2026', sourceType: 'web' },
            { id: 'vi-c5', label: 'PMID 37291045', sourceType: 'pubmed' },
          ]
        },
      ],
      provenance: [
        { id: 'vi-p1', action: 'Queried ClinVar for BRCA2 c.5946delT', source: 'ClinVar API', duration: '0.7s', icon: 'database' },
        { id: 'vi-p2', action: 'Queried gnomAD for population frequency', source: 'gnomAD', duration: '1.1s', icon: 'database' },
        { id: 'vi-p3', action: 'Searched PubMed for clinical evidence', source: 'PubMed', duration: '1.8s', icon: 'search' },
      ],
      totalDuration: '8 seconds',
      followUps: [
        'What screening is recommended for carriers?',
        'Is this variant common in any specific ancestry?',
        'What therapies target BRCA2-deficient tumors?',
      ]},
    ],
  },

  'regulatory-planning': {
    taskId: 'regulatory-planning',
    title: '510(k) pathway for a digital pathology device',
    summary: 'A 510(k) is likely viable for your device. Several predicate devices exist for AI-assisted digital pathology. Key requirement: demonstrate substantial equivalence to an FDA-cleared predicate.',
    messages: [
      { id: 'rp-1', role: 'user', content: 'What FDA pathway fits an AI-assisted digital pathology device for tumor detection?' },
      { id: 'rp-2', role: 'system', content: 'Checking FDA device classification, predicate devices, and recent clearances.' },
      { id: 'rp-3', role: 'assistant', content: '', sections: [
        {
          id: 'rp-s1', title: 'Recommended pathway',
          content: 'A 510(k) is the most appropriate pathway. Multiple AI-assisted pathology devices have been cleared via 510(k) under product code QKQ (digital pathology software). FDA has established expectations through recent clearances of Paige Prostate, PathAI, and similar products.',
          confidence: 'strong',
          citations: [
            { id: 'rp-c1', label: 'FDA product code QKQ', sourceType: 'database' },
            { id: 'rp-c2', label: 'K210785 (Paige Prostate)', sourceType: 'database' },
          ]
        },
        {
          id: 'rp-s2', title: 'Predicate devices',
          content: 'Three strong predicates identified: Paige Prostate (K210785), PathPresenter (K201610), and Philips IntelliSite (K200990). All cleared for whole-slide imaging with AI-assisted analysis. Your predicate choice depends on your specific intended use claim.',
          confidence: 'strong',
          citations: [
            { id: 'rp-c3', label: 'FDA 510(k) database', sourceType: 'database' },
          ]
        },
        {
          id: 'rp-s3', title: 'Key considerations',
          content: 'FDA expects a clinical validation study comparing your algorithm to pathologist ground truth. Locked algorithm required (no continuous learning post-clearance without new submission). Estimated review timeline: 90 days from acceptance. Total process typically 6-9 months including preparation.',
          confidence: 'moderate',
          citations: [
            { id: 'rp-c4', label: 'FDA AI/ML guidance 2024', sourceType: 'web' },
          ]
        },
      ],
      provenance: [
        { id: 'rp-p1', action: 'Searched FDA device classification for pathology AI', source: 'openFDA', duration: '1.3s', icon: 'database' },
        { id: 'rp-p2', action: 'Retrieved recent 510(k) clearances in QKQ category', source: 'FDA 510(k) database', duration: '2.1s', icon: 'search' },
        { id: 'rp-p3', action: 'Searched for relevant FDA guidance documents', source: 'FDA.gov', duration: '1.5s', icon: 'search' },
      ],
      totalDuration: '15 seconds',
      followUps: [
        'What clinical study design does FDA expect?',
        'How do I choose between these predicates?',
        'What does a 510(k) submission package include?',
      ]},
    ],
  },

  'compound-discovery': {
    taskId: 'compound-discovery',
    title: 'Known EGFR inhibitors landscape',
    summary: 'EGFR has a rich compound landscape with 4 generations of inhibitors. 47 compounds with reported binding data found in ChEMBL. The field is mature but resistance mutations create ongoing opportunities.',
    messages: [
      { id: 'cd-1', role: 'user', content: 'What known compounds exist against EGFR?' },
      { id: 'cd-2', role: 'system', content: 'Searching ChEMBL, PubChem, and clinical trial registries for EGFR-targeting compounds.' },
      { id: 'cd-3', role: 'assistant', content: '', sections: [
        {
          id: 'cd-s1', title: 'Approved EGFR inhibitors',
          content: 'Five FDA-approved small molecule EGFR inhibitors: erlotinib (1st gen), gefitinib (1st gen), afatinib (2nd gen), dacomitinib (2nd gen), and osimertinib (3rd gen). Osimertinib is now first-line standard of care for EGFR-mutant NSCLC.',
          confidence: 'strong',
          citations: [
            { id: 'cd-c1', label: 'ChEMBL target report: EGFR', sourceType: 'database' },
            { id: 'cd-c2', label: 'NCCN NSCLC v5.2026', sourceType: 'web' },
          ]
        },
        {
          id: 'cd-s2', title: 'Investigational compounds',
          content: '47 compounds with IC50 < 100nM against EGFR in ChEMBL. 12 currently in clinical trials. Most interesting recent entries target the C797S resistance mutation that emerges after osimertinib treatment. Amivantamab (bispecific antibody) represents an alternative modality.',
          confidence: 'moderate',
          citations: [
            { id: 'cd-c3', label: 'ChEMBL bioactivity data', sourceType: 'database' },
            { id: 'cd-c4', label: 'ClinicalTrials.gov: EGFR C797S', sourceType: 'trial' },
          ]
        },
        {
          id: 'cd-s3', title: 'Resistance and opportunity',
          content: 'The primary unmet need is EGFR C797S (acquired resistance to osimertinib), EGFR exon 20 insertions (limited response to current TKIs), and brain metastases penetration. These represent the whitespace for new compound development.',
          confidence: 'moderate',
          citations: [
            { id: 'cd-c5', label: 'PMID 38567891', sourceType: 'pubmed' },
          ]
        },
      ],
      provenance: [
        { id: 'cd-p1', action: 'Queried ChEMBL for EGFR target bioactivity', source: 'ChEMBL', duration: '1.4s', icon: 'database' },
        { id: 'cd-p2', action: 'Searched ClinicalTrials.gov for EGFR agents', source: 'CT.gov', duration: '1.8s', icon: 'search' },
        { id: 'cd-p3', action: 'Searched PubMed for EGFR resistance mechanisms', source: 'PubMed', duration: '2.1s', icon: 'search' },
      ],
      totalDuration: '18 seconds',
      followUps: [
        'Which compounds target EGFR C797S specifically?',
        'Compare osimertinib to newer 4th-gen inhibitors.',
        'Show the SAR for covalent EGFR inhibitors.',
      ]},
    ],
  },

  'clinical-landscape': {
    taskId: 'clinical-landscape',
    title: 'Active glioblastoma clinical trials',
    summary: '87 active trials found for glioblastoma. Immunotherapy combinations and targeted therapy dominate. Most are Phase 1/2. Notable gap: very few trials for recurrent GBM in elderly patients.',
    messages: [
      { id: 'cl-1', role: 'user', content: 'Who else is running trials in glioblastoma right now?' },
      { id: 'cl-2', role: 'system', content: 'Searching ClinicalTrials.gov for active glioblastoma studies.' },
      { id: 'cl-3', role: 'assistant', content: '', sections: [
        {
          id: 'cl-s1', title: 'Active trial landscape',
          content: '87 trials with status RECRUITING or ACTIVE_NOT_RECRUITING found for glioblastoma. 52% are Phase 1 or Phase 1/2, indicating the field is still largely exploratory. Top sponsors: NCI (14 trials), Bristol-Myers Squibb (6), Novartis (5), academic medical centers (38).',
          confidence: 'strong',
          citations: [
            { id: 'cl-c1', label: 'ClinicalTrials.gov: 87 results', sourceType: 'trial' },
          ]
        },
        {
          id: 'cl-s2', title: 'Dominant approaches',
          content: 'Immunotherapy combinations (checkpoint inhibitors + novel agents): 31 trials. CAR-T and cell therapy: 12 trials. Targeted kinase inhibitors: 9 trials. Tumor treating fields combinations: 7 trials. Oncolytic virus therapy: 5 trials.',
          confidence: 'strong',
          citations: [
            { id: 'cl-c2', label: 'ClinicalTrials.gov analysis', sourceType: 'trial' },
          ]
        },
        {
          id: 'cl-s3', title: 'Gaps and opportunities',
          content: 'Few trials specifically targeting recurrent GBM in patients over 65 (only 3 found). Limited representation of novel delivery methods beyond convection-enhanced delivery. Blood-brain barrier penetration remains the central pharmacological challenge across modalities.',
          confidence: 'moderate',
          citations: [
            { id: 'cl-c3', label: 'PMID 38901234', sourceType: 'pubmed' },
          ]
        },
      ],
      provenance: [
        { id: 'cl-p1', action: 'Searched ClinicalTrials.gov for glioblastoma, status: recruiting', source: 'CT.gov API v2', duration: '2.3s', icon: 'search' },
        { id: 'cl-p2', action: 'Categorized trials by intervention type', source: 'Local analysis', duration: '0.5s', icon: 'compute' },
      ],
      totalDuration: '10 seconds',
      followUps: [
        'Show me the Phase 3 trials only.',
        'Which companies are most active in GBM?',
        'What endpoints are being used in these trials?',
      ]},
    ],
  },

  'patent-fto': {
    taskId: 'patent-fto',
    title: 'ADC patent landscape (2023-2026)',
    summary: '412 patent applications filed in the antibody-drug conjugate space in the last 3 years. The space is crowded around HER2 and Trop-2 targets, but emerging targets (Nectin-4, CLDN18.2) have fewer filings.',
    messages: [
      { id: 'pf-1', role: 'user', content: 'Map patent filings in the ADC space over the last 3 years.' },
      { id: 'pf-2', role: 'system', content: 'Searching PatentsView and Google Patents for antibody-drug conjugate filings 2023-2026.' },
      { id: 'pf-3', role: 'assistant', content: '', sections: [
        {
          id: 'pf-s1', title: 'Filing volume and trend',
          content: '412 patent applications mentioning antibody-drug conjugates filed 2023-2026. Filing rate increased 34% year-over-year. Top assignees: Daiichi Sankyo (28 filings), AstraZeneca (22), Pfizer (19), Seagen/acquired by Pfizer (17), and numerous Chinese biotech firms collectively (89 filings).',
          confidence: 'moderate',
          citations: [
            { id: 'pf-c1', label: 'PatentsView search results', sourceType: 'patent' },
          ]
        },
        {
          id: 'pf-s2', title: 'Crowded versus open areas',
          content: 'Most crowded: HER2-targeting ADCs (67 filings), Trop-2 (43 filings), linker-payload chemistry for topoisomerase inhibitors (38 filings). Less crowded: Nectin-4 ADCs (8 filings), CLDN18.2 (6 filings), novel payload classes like TLR agonists (4 filings).',
          confidence: 'moderate',
          citations: [
            { id: 'pf-c2', label: 'PatentsView classification', sourceType: 'patent' },
            { id: 'pf-c3', label: 'Google Patents: ADC trends', sourceType: 'patent' },
          ]
        },
        {
          id: 'pf-s3', title: 'Key takeaway for your FTO',
          content: 'If your ADC uses a standard MMAE or DXd payload on a HER2 or Trop-2 target, freedom-to-operate risk is high and you should engage patent counsel early. If you are using a novel target or payload class, the filing density is lower and the landscape is more open. This is an early screen, not a legal opinion.',
          confidence: 'moderate',
          citations: [
            { id: 'pf-c4', label: 'PatentsView analysis', sourceType: 'patent' },
          ]
        },
      ],
      provenance: [
        { id: 'pf-p1', action: 'Searched PatentsView for ADC-related filings 2023-2026', source: 'PatentsView API', duration: '4.2s', icon: 'search' },
        { id: 'pf-p2', action: 'Categorized by target and payload type', source: 'Local analysis', duration: '1.1s', icon: 'compute' },
        { id: 'pf-p3', action: 'Cross-referenced with Google Patents for Chinese filings', source: 'Google Patents', duration: '3.8s', icon: 'search' },
      ],
      totalDuration: '28 seconds',
      followUps: [
        'Show me the Nectin-4 ADC patents specifically.',
        'Who holds the key linker technology patents?',
        'What is Daiichi Sankyo claiming in their recent filings?',
      ]},
    ],
  },
};

// Default fallback for tasks without specific mock data
export const defaultConversation: TaskConversation = {
  taskId: 'default',
  title: 'Research session',
  summary: 'I can help with this. Let me search the relevant databases and literature.',
  messages: [
    { id: 'df-1', role: 'user', content: 'Tell me about this topic.' },
    { id: 'df-2', role: 'system', content: 'Searching relevant sources for your question.' },
    { id: 'df-3', role: 'assistant', content: '', sections: [
      {
        id: 'df-s1', title: 'Overview',
        content: 'This is a sample response. In production, the system would search relevant databases and literature based on your specific question and return sourced findings here.',
        confidence: 'moderate',
        citations: []
      },
    ],
    followUps: [
      'Can you go deeper on this?',
      'What are the main open questions?',
      'How does this compare to alternatives?',
    ]},
  ],
};
