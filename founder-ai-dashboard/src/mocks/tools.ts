import type { SourceType } from '../design-system';

export type ToolSourceId =
  | 'pubmed'
  | 'clinical-trials'
  | 'biorxiv'
  | 'medrxiv'
  | 'chembl'
  | 'open-targets'
  | 'cms-coverage'
  | 'icd-10'
  | 'npi-registry'
  | 'pubchem';

export interface ToolSourceBranding {
  logoUrl: string;
  logoAlt: string;
  websiteUrl: string;
}

export const configuredToolSourceIds: ToolSourceId[] = [
  'pubmed',
  'clinical-trials',
  'chembl',
  'open-targets',
];

export const toolSourceBranding: Record<ToolSourceId, ToolSourceBranding> = {
  pubmed: {
    logoUrl: 'https://pubmed.ncbi.nlm.nih.gov/favicon.ico',
    logoAlt: 'PubMed official mark',
    websiteUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
  },
  'clinical-trials': {
    logoUrl: 'https://clinicaltrials.gov/assets/images/ctg-footer-logo.svg',
    logoAlt: 'ClinicalTrials.gov logo',
    websiteUrl: 'https://clinicaltrials.gov/',
  },
  biorxiv: {
    logoUrl: 'https://www.biorxiv.org/sites/default/files/biorxiv_logo_homepage.png',
    logoAlt: 'bioRxiv logo',
    websiteUrl: 'https://www.biorxiv.org/',
  },
  medrxiv: {
    logoUrl: 'https://www.medrxiv.org/sites/default/files/medRxiv_homepage_logo.png',
    logoAlt: 'medRxiv logo',
    websiteUrl: 'https://www.medrxiv.org/',
  },
  chembl: {
    logoUrl: 'https://www.ebi.ac.uk/chembl/favicon.ico',
    logoAlt: 'ChEMBL official mark',
    websiteUrl: 'https://www.ebi.ac.uk/chembl/',
  },
  'open-targets': {
    logoUrl: 'https://opentargets.org/assets/img/branding/OT_logo_colour_RGB.png',
    logoAlt: 'Open Targets logo',
    websiteUrl: 'https://platform.opentargets.org/',
  },
  'cms-coverage': {
    logoUrl: 'https://www.cms.gov/themes/custom/cms_evo/logo.svg',
    logoAlt: 'Centers for Medicare and Medicaid Services logo',
    websiteUrl: 'https://www.cms.gov/medicare/coverage/database-overview',
  },
  'icd-10': {
    logoUrl: 'https://www.who.int/ResourcePackages/WHO/assets/dist/images/logos/en/h-logo-blue.svg',
    logoAlt: 'World Health Organization logo',
    websiteUrl: 'https://icd.who.int/',
  },
  'npi-registry': {
    logoUrl: 'https://npiregistry.cms.hhs.gov/favicon.ico',
    logoAlt: 'NPPES NPI Registry official mark',
    websiteUrl: 'https://npiregistry.cms.hhs.gov/',
  },
  pubchem: {
    logoUrl: 'https://pubchem.ncbi.nlm.nih.gov/favicon.ico',
    logoAlt: 'PubChem official mark',
    websiteUrl: 'https://pubchem.ncbi.nlm.nih.gov/',
  },
};

export interface ToolParameter {
  label: string;
  value: string;
}

export interface ToolResult {
  id: string;
  title: string;
  summary: string;
  metadata: ToolParameter[];
  details?: ToolParameter[];
  matchReason: string;
  sourceType: SourceType;
}

export interface ToolSource {
  id: ToolSourceId;
  name: string;
  category: string;
  capability: string;
  description: string;
  interface: string;
  access: string;
  limit: string;
  constraint: string;
  example: string;
  parameters: ToolParameter[];
  results: ToolResult[];
}

export const toolSources: ToolSource[] = [
  {
    id: 'pubmed',
    name: 'PubMed',
    category: 'Literature',
    capability: 'Keyword search',
    description: 'Biomedical citations, abstracts, indexing terms, and publication metadata.',
    interface: 'NCBI E-utilities',
    access: 'Public · optional API key',
    limit: '3 requests/sec without a key · 10 with a key',
    constraint: 'PubMed primarily returns citations and abstracts, not guaranteed full text.',
    example: 'Find review articles about liquid biopsy for early pancreatic cancer published since 2022.',
    parameters: [
      { label: 'Endpoint', value: 'ESearch → EFetch' },
      { label: 'Search term', value: 'liquid biopsy AND pancreatic cancer' },
      { label: 'Article type', value: 'Review' },
      { label: 'Publication date', value: '2022–present' },
    ],
    results: [
      {
        id: 'DEMO-PMID-001',
        title: 'Liquid biopsy approaches in early pancreatic cancer',
        summary: 'Sample review citation covering circulating biomarkers and early-detection evidence.',
        metadata: [{ label: 'Record', value: 'Review article' }, { label: 'Published', value: '2025' }, { label: 'Journal', value: 'Demo Oncology Review' }],
        details: [{ label: 'Authors', value: 'Chen A, Rivera M, Patel S' }, { label: 'DOI', value: '10.demo/pmid.001' }, { label: 'MeSH terms', value: 'Liquid Biopsy; Pancreatic Neoplasms; Early Diagnosis' }, { label: 'Abstract status', value: 'Available' }],
        matchReason: 'Title and abstract match both the disease and early-detection concepts.',
        sourceType: 'pubmed',
      },
      {
        id: 'DEMO-PMID-002',
        title: 'Circulating tumor DNA biomarkers for pancreatic neoplasms',
        summary: 'Sample systematic review of ctDNA performance across detection and monitoring studies.',
        metadata: [{ label: 'Record', value: 'Systematic review' }, { label: 'Published', value: '2024' }, { label: 'Journal', value: 'Sample Cancer Biomarkers' }],
        details: [{ label: 'Authors', value: 'Morgan L, Shah D' }, { label: 'DOI', value: '10.demo/pmid.002' }, { label: 'MeSH terms', value: 'Circulating Tumor DNA; Biomarkers' }, { label: 'Abstract status', value: 'Available' }],
        matchReason: 'Matches liquid-biopsy biomarkers, pancreatic cancer, and the requested publication window.',
        sourceType: 'pubmed',
      },
      {
        id: 'DEMO-PMID-003',
        title: 'Extracellular vesicles as early detection markers in pancreatic cancer',
        summary: 'Sample review comparing extracellular vesicle assays and validation cohorts.',
        metadata: [{ label: 'Record', value: 'Narrative review' }, { label: 'Published', value: '2023' }, { label: 'Journal', value: 'Demo Translational Medicine' }],
        details: [{ label: 'Authors', value: 'Okafor N, Lin J, Garcia P' }, { label: 'DOI', value: '10.demo/pmid.003' }, { label: 'MeSH terms', value: 'Extracellular Vesicles; Pancreatic Cancer' }, { label: 'Abstract status', value: 'Available' }],
        matchReason: 'The review covers a liquid-biopsy modality and early pancreatic cancer detection.',
        sourceType: 'pubmed',
      },
      {
        id: 'DEMO-PMID-004',
        title: 'Multi-analyte blood tests for pancreatic cancer screening',
        summary: 'Sample evidence review of protein, DNA, and RNA marker combinations.',
        metadata: [{ label: 'Record', value: 'Review article' }, { label: 'Published', value: '2025' }, { label: 'Journal', value: 'Example Diagnostics' }],
        details: [{ label: 'Authors', value: 'Taylor R, Singh K' }, { label: 'DOI', value: '10.demo/pmid.004' }, { label: 'MeSH terms', value: 'Blood Tests; Screening; Multi-omics' }, { label: 'Abstract status', value: 'Available' }],
        matchReason: 'Includes blood-based detection, pancreatic cancer, and recent review evidence.',
        sourceType: 'pubmed',
      },
      {
        id: 'DEMO-PMID-005',
        title: 'Clinical readiness of liquid biopsy for pancreatic malignancy',
        summary: 'Sample scoping review of analytical validity, cohorts, and implementation gaps.',
        metadata: [{ label: 'Record', value: 'Scoping review' }, { label: 'Published', value: '2022' }, { label: 'Journal', value: 'Demo Precision Oncology' }],
        details: [{ label: 'Authors', value: 'Williams E, Brown T' }, { label: 'DOI', value: '10.demo/pmid.005' }, { label: 'MeSH terms', value: 'Liquid Biopsy; Clinical Validation' }, { label: 'Abstract status', value: 'Available' }],
        matchReason: 'Directly evaluates clinical use of liquid biopsy within the requested date range.',
        sourceType: 'pubmed',
      },
    ],
  },
  {
    id: 'clinical-trials',
    name: 'ClinicalTrials.gov',
    category: 'Clinical research',
    capability: 'Structured search',
    description: 'Clinical study records including status, phase, sponsor, interventions, and locations.',
    interface: 'REST API v2',
    access: 'Public · no API key',
    limit: 'Opaque page-token pagination · no published numeric rate',
    constraint: 'Only fields present in the source record are returned; posted results may be absent.',
    example: 'Find recruiting Phase 2 trials studying KRAS G12C inhibitors in the United States.',
    parameters: [
      { label: 'Endpoint', value: 'GET /studies' },
      { label: 'Condition / term', value: 'KRAS G12C' },
      { label: 'Intervention', value: 'inhibitor' },
      { label: 'Status', value: 'RECRUITING' },
      { label: 'Phase', value: 'PHASE2' },
      { label: 'Location', value: 'United States' },
    ],
    results: [
      {
        id: 'DEMO-NCT-001',
        title: 'A Phase 2 study of a KRAS G12C inhibitor in advanced solid tumors',
        summary: 'Illustrative interventional study evaluating response and safety in adults with a qualifying KRAS G12C alteration.',
        metadata: [{ label: 'Status', value: 'Recruiting' }, { label: 'Phase', value: 'Phase 2' }, { label: 'Sponsor', value: 'Example Biopharma' }, { label: 'Locations', value: '8 U.S. sites' }],
        details: [{ label: 'Study type', value: 'Interventional' }, { label: 'Allocation', value: 'Non-randomized' }, { label: 'Primary outcome', value: 'Objective response rate' }, { label: 'Last updated', value: 'July 2026' }, { label: 'Has results', value: 'No' }, { label: 'Enrollment', value: '84 participants' }],
        matchReason: 'Explicit KRAS G12C intervention, Phase 2 design, recruiting status, and U.S. locations.',
        sourceType: 'trial',
      },
      {
        id: 'DEMO-NCT-002',
        title: 'Combination therapy for KRAS G12C-positive non-small cell lung cancer',
        summary: 'Illustrative study of a targeted inhibitor combination in previously treated participants.',
        metadata: [{ label: 'Status', value: 'Recruiting' }, { label: 'Phase', value: 'Phase 2' }, { label: 'Sponsor', value: 'Sample Therapeutics' }, { label: 'Locations', value: '5 U.S. sites' }],
        details: [{ label: 'Study type', value: 'Interventional' }, { label: 'Allocation', value: 'Randomized' }, { label: 'Primary outcome', value: 'Progression-free survival' }, { label: 'Last updated', value: 'June 2026' }, { label: 'Has results', value: 'No' }, { label: 'Enrollment', value: '126 participants' }],
        matchReason: 'Matches the molecular alteration, trial phase, active recruitment, and geography.',
        sourceType: 'trial',
      },
      {
        id: 'DEMO-NCT-003',
        title: 'Targeted treatment for KRAS G12C-mutated colorectal cancer',
        summary: 'Illustrative multicenter study assessing a KRAS inhibitor-based regimen.',
        metadata: [{ label: 'Status', value: 'Recruiting' }, { label: 'Phase', value: 'Phase 2' }, { label: 'Sponsor', value: 'Demo Cancer Network' }, { label: 'Locations', value: '12 U.S. sites' }],
        details: [{ label: 'Study type', value: 'Interventional' }, { label: 'Allocation', value: 'Single group' }, { label: 'Primary outcome', value: 'Disease control rate' }, { label: 'Last updated', value: 'August 2026' }, { label: 'Has results', value: 'No' }, { label: 'Enrollment', value: '68 participants' }],
        matchReason: 'Contains all requested structured criteria and a directly relevant intervention.',
        sourceType: 'trial',
      },
      {
        id: 'DEMO-NCT-004',
        title: 'KRAS G12C inhibitor monotherapy in previously treated lung cancer',
        summary: 'Illustrative open-label study focused on safety, response durability, and resistance markers.',
        metadata: [{ label: 'Status', value: 'Recruiting' }, { label: 'Phase', value: 'Phase 2' }, { label: 'Sponsor', value: 'Northstar Oncology' }, { label: 'Locations', value: '7 U.S. sites' }],
        details: [{ label: 'Study type', value: 'Interventional' }, { label: 'Allocation', value: 'Single group' }, { label: 'Primary outcome', value: 'Confirmed response rate' }, { label: 'Last updated', value: 'May 2026' }, { label: 'Has results', value: 'No' }, { label: 'Enrollment', value: '92 participants' }],
        matchReason: 'The mutation, treatment class, phase, status, and country all match.',
        sourceType: 'trial',
      },
      {
        id: 'DEMO-NCT-005',
        title: 'Adaptive combination study for KRAS G12C-mutated solid tumors',
        summary: 'Illustrative basket trial evaluating targeted combinations across multiple tumor types.',
        metadata: [{ label: 'Status', value: 'Recruiting' }, { label: 'Phase', value: 'Phase 2' }, { label: 'Sponsor', value: 'Example Research Alliance' }, { label: 'Locations', value: '10 U.S. sites' }],
        details: [{ label: 'Study type', value: 'Interventional' }, { label: 'Allocation', value: 'Adaptive cohorts' }, { label: 'Primary outcome', value: 'Cohort-specific response' }, { label: 'Last updated', value: 'August 2026' }, { label: 'Has results', value: 'No' }, { label: 'Enrollment', value: '150 participants' }],
        matchReason: 'This recruiting Phase 2 basket study includes the requested alteration and geography.',
        sourceType: 'trial',
      },
    ],
  },
  {
    id: 'biorxiv',
    name: 'bioRxiv',
    category: 'Preprints',
    capability: 'Date / DOI lookup',
    description: 'Life-science preprints, versions, categories, funding, and publication links.',
    interface: 'bioRxiv content API',
    access: 'Public · no API key',
    limit: '30 detail records per page',
    constraint: 'The documented API does not provide general keyword search. Preprints are not necessarily peer reviewed.',
    example: 'Show neuroscience preprints posted in the last 7 days.',
    parameters: [{ label: 'Endpoint', value: '/details/biorxiv/7d/0/json' }, { label: 'Interval', value: 'Last 7 days' }, { label: 'Category', value: 'Neuroscience' }, { label: 'Cursor', value: '0' }],
    results: [{ id: 'DEMO-BIORXIV-001', title: 'Sample neuroscience preprint', summary: 'Illustrative recent preprint metadata with version and publication-link fields.', metadata: [{ label: 'Version', value: '1' }, { label: 'Category', value: 'Neuroscience' }, { label: 'Status', value: 'Preprint' }], matchReason: 'Falls within the selected date interval and category.', sourceType: 'preprint' }],
  },
  {
    id: 'medrxiv',
    name: 'medRxiv',
    category: 'Preprints',
    capability: 'Date / DOI lookup',
    description: 'Health-science preprints, versions, categories, funding, and publication links.',
    interface: 'bioRxiv content API',
    access: 'Public · no API key',
    limit: '30 detail records per page',
    constraint: 'The documented API does not provide general keyword search. Medical preprints are preliminary evidence.',
    example: 'Show infectious disease preprints posted in the last 10 days.',
    parameters: [{ label: 'Endpoint', value: '/details/medrxiv/10d/0/json' }, { label: 'Interval', value: 'Last 10 days' }, { label: 'Category', value: 'Infectious Diseases' }, { label: 'Cursor', value: '0' }],
    results: [{ id: 'DEMO-MEDRXIV-001', title: 'Sample infectious disease preprint', summary: 'Illustrative preliminary medical evidence with explicit version metadata.', metadata: [{ label: 'Version', value: '2' }, { label: 'Category', value: 'Infectious Diseases' }, { label: 'Status', value: 'Preprint' }], matchReason: 'Matches the supported date interval and category filters.', sourceType: 'preprint' }],
  },
  {
    id: 'chembl',
    name: 'ChEMBL',
    category: 'Chemistry',
    capability: 'Resource lookup',
    description: 'Molecules, targets, assays, mechanisms, indications, and bioactivity measurements.',
    interface: 'ChEMBL Data Web Services',
    access: 'Public read access',
    limit: 'Limit/offset pagination · bulk release recommended at scale',
    constraint: 'Measurements from different assay contexts are not automatically comparable.',
    example: 'Find molecules tested against EGFR with reported IC50 values below 100 nM.',
    parameters: [{ label: 'Resource', value: 'activity' }, { label: 'Target', value: 'EGFR (resolve to ChEMBL ID)' }, { label: 'Endpoint type', value: 'IC50' }, { label: 'Value filter', value: '< 100 nM' }],
    results: [
      { id: 'DEMO-CHEMBL-001', title: 'Sample EGFR bioactivity record A', summary: 'Illustrative normalized activity linked to its molecule, target, assay, and source document.', metadata: [{ label: 'Endpoint', value: 'IC50' }, { label: 'Value', value: '42 nM' }, { label: 'Assay type', value: 'Binding' }], details: [{ label: 'Molecule ID', value: 'DEMO-CHEMBL-MOL-101' }, { label: 'Target ID', value: 'DEMO-CHEMBL-TARGET-1' }, { label: 'Assay ID', value: 'DEMO-CHEMBL-ASSAY-41' }, { label: 'Relation', value: '=' }, { label: 'pChEMBL', value: '7.38' }], matchReason: 'Resolved target and normalized activity satisfy the requested threshold.', sourceType: 'database' },
      { id: 'DEMO-CHEMBL-002', title: 'Sample EGFR bioactivity record B', summary: 'Illustrative biochemical assay record for a distinct small-molecule series.', metadata: [{ label: 'Endpoint', value: 'IC50' }, { label: 'Value', value: '18 nM' }, { label: 'Assay type', value: 'Biochemical' }], details: [{ label: 'Molecule ID', value: 'DEMO-CHEMBL-MOL-208' }, { label: 'Target ID', value: 'DEMO-CHEMBL-TARGET-1' }, { label: 'Assay ID', value: 'DEMO-CHEMBL-ASSAY-52' }, { label: 'Relation', value: '=' }, { label: 'pChEMBL', value: '7.74' }], matchReason: 'EGFR target assignment and normalized potency fall below 100 nM.', sourceType: 'database' },
      { id: 'DEMO-CHEMBL-003', title: 'Sample EGFR cellular activity record', summary: 'Illustrative cell-based activity with explicit assay context and provenance.', metadata: [{ label: 'Endpoint', value: 'IC50' }, { label: 'Value', value: '76 nM' }, { label: 'Assay type', value: 'Cell-based' }], details: [{ label: 'Molecule ID', value: 'DEMO-CHEMBL-MOL-315' }, { label: 'Target ID', value: 'DEMO-CHEMBL-TARGET-1' }, { label: 'Assay ID', value: 'DEMO-CHEMBL-ASSAY-63' }, { label: 'Cell line', value: 'Demo EGFR-driven line' }, { label: 'pChEMBL', value: '7.12' }], matchReason: 'Cellular IC50 remains inside the requested potency threshold.', sourceType: 'database' },
      { id: 'DEMO-CHEMBL-004', title: 'Sample covalent EGFR inhibitor activity', summary: 'Illustrative binding record retaining the original relation and units.', metadata: [{ label: 'Endpoint', value: 'IC50' }, { label: 'Value', value: '< 25 nM' }, { label: 'Assay type', value: 'Binding' }], details: [{ label: 'Molecule ID', value: 'DEMO-CHEMBL-MOL-422' }, { label: 'Target ID', value: 'DEMO-CHEMBL-TARGET-1' }, { label: 'Assay ID', value: 'DEMO-CHEMBL-ASSAY-74' }, { label: 'Relation', value: '<' }, { label: 'Original units', value: 'nM' }], matchReason: 'Qualified activity is still clearly below the requested upper bound.', sourceType: 'database' },
      { id: 'DEMO-CHEMBL-005', title: 'Sample mutant-selective EGFR activity', summary: 'Illustrative assay against a defined EGFR variant context.', metadata: [{ label: 'Endpoint', value: 'IC50' }, { label: 'Value', value: '9 nM' }, { label: 'Assay type', value: 'Functional' }], details: [{ label: 'Molecule ID', value: 'DEMO-CHEMBL-MOL-529' }, { label: 'Target ID', value: 'DEMO-CHEMBL-TARGET-V2' }, { label: 'Assay ID', value: 'DEMO-CHEMBL-ASSAY-85' }, { label: 'Variant', value: 'Demo mutant context' }, { label: 'pChEMBL', value: '8.05' }], matchReason: 'Target family and normalized potency match, with variant context preserved.', sourceType: 'database' },
    ],
  },
  {
    id: 'open-targets',
    name: 'Open Targets',
    category: 'Target evidence',
    capability: 'Entity resolution',
    description: 'Target, disease, drug, genetics, safety, and association evidence.',
    interface: 'GraphQL API',
    access: 'Public · no documented key',
    limit: 'Optimized for one entity or association per query',
    constraint: 'Systematic multi-entity analysis should use downloads or BigQuery.',
    example: 'Show evidence connecting BRCA2 with breast cancer.',
    parameters: [{ label: 'Step 1', value: 'Resolve BRCA2 and breast cancer IDs' }, { label: 'Step 2', value: 'Query target-disease association' }, { label: 'Target ID', value: 'Resolved Ensembl ID' }, { label: 'Disease ID', value: 'Resolved EFO ID' }],
    results: [
      { id: 'DEMO-OT-001', title: 'BRCA2 — breast cancer association', summary: 'Illustrative association summary combining bounded genetics and known-drug evidence fields.', metadata: [{ label: 'Entity', value: 'Target–disease association' }, { label: 'Evidence areas', value: 'Genetics, literature' }, { label: 'Score', value: '0.91' }], details: [{ label: 'Target ID', value: 'DEMO-ENSG-BRCA2' }, { label: 'Disease ID', value: 'DEMO-EFO-BREAST' }, { label: 'Top datasource', value: 'Genetic associations' }, { label: 'Release', value: 'Demo snapshot' }], matchReason: 'Both user terms resolve to stable entities with a direct association.', sourceType: 'database' },
      { id: 'DEMO-OT-002', title: 'BRCA2 somatic mutation evidence', summary: 'Illustrative evidence row summarizing tumor sequencing observations.', metadata: [{ label: 'Entity', value: 'Evidence row' }, { label: 'Evidence area', value: 'Somatic mutations' }, { label: 'Score', value: '0.84' }], details: [{ label: 'Target ID', value: 'DEMO-ENSG-BRCA2' }, { label: 'Disease ID', value: 'DEMO-EFO-BREAST' }, { label: 'Datasource', value: 'Cancer genomics' }, { label: 'Release', value: 'Demo snapshot' }], matchReason: 'The evidence row links the resolved target and disease entities.', sourceType: 'database' },
      { id: 'DEMO-OT-003', title: 'BRCA2 germline genetics evidence', summary: 'Illustrative inherited-variant evidence contributing to the association.', metadata: [{ label: 'Entity', value: 'Evidence row' }, { label: 'Evidence area', value: 'Genetic association' }, { label: 'Score', value: '0.79' }], details: [{ label: 'Target ID', value: 'DEMO-ENSG-BRCA2' }, { label: 'Disease ID', value: 'DEMO-EFO-BREAST' }, { label: 'Datasource', value: 'Germline genetics' }, { label: 'Release', value: 'Demo snapshot' }], matchReason: 'Resolved BRCA2 evidence is explicitly connected to breast cancer.', sourceType: 'database' },
      { id: 'DEMO-OT-004', title: 'BRCA2 literature-supported association', summary: 'Illustrative curated literature evidence supporting target relevance.', metadata: [{ label: 'Entity', value: 'Evidence row' }, { label: 'Evidence area', value: 'Literature' }, { label: 'Score', value: '0.73' }], details: [{ label: 'Target ID', value: 'DEMO-ENSG-BRCA2' }, { label: 'Disease ID', value: 'DEMO-EFO-BREAST' }, { label: 'Datasource', value: 'Curated literature' }, { label: 'Release', value: 'Demo snapshot' }], matchReason: 'Curated publications use the same resolved target and disease identifiers.', sourceType: 'database' },
      { id: 'DEMO-OT-005', title: 'BRCA2 tractability and safety context', summary: 'Illustrative target annotation returned alongside association evidence.', metadata: [{ label: 'Entity', value: 'Target annotation' }, { label: 'Evidence area', value: 'Tractability, safety' }, { label: 'Score', value: 'Context only' }], details: [{ label: 'Target ID', value: 'DEMO-ENSG-BRCA2' }, { label: 'Annotation', value: 'Target context' }, { label: 'Datasource', value: 'Platform annotations' }, { label: 'Release', value: 'Demo snapshot' }], matchReason: 'Provides decision context for the target resolved from the original question.', sourceType: 'database' },
    ],
  },
  {
    id: 'cms-coverage',
    name: 'CMS Coverage Database',
    category: 'Coverage policy',
    capability: 'Document lookup',
    description: 'National and local Medicare coverage policies, versions, and related documents.',
    interface: 'CMS Coverage REST API v1.6',
    access: 'Public · some routes require a one-hour license token',
    limit: 'Endpoint-specific opaque pagination',
    constraint: 'Coverage varies by jurisdiction and effective date and is not a guarantee of payment.',
    example: 'Find national coverage documents related to next-generation sequencing.',
    parameters: [{ label: 'Document scope', value: 'National coverage' }, { label: 'Concept', value: 'Next-generation sequencing' }, { label: 'License', value: 'Not required for selected route' }, { label: 'Version handling', value: 'Preserve document version' }],
    results: [{ id: 'DEMO-NCD-001', title: 'Sample national coverage document for sequencing', summary: 'Illustrative policy record with version, effective-date, and source-link metadata.', metadata: [{ label: 'Type', value: 'NCD' }, { label: 'Jurisdiction', value: 'National' }, { label: 'Version', value: 'Demo v1' }], matchReason: 'Document title and policy scope match the sequencing concept.', sourceType: 'database' }],
  },
  {
    id: 'icd-10',
    name: 'ICD-10',
    category: 'Clinical coding',
    capability: 'Code lookup',
    description: 'WHO ICD-10 and U.S. ICD-10-CM code and hierarchy discovery.',
    interface: 'NLM Clinical Tables (U.S.)',
    access: 'Public for ICD-10-CM · WHO requires OAuth',
    limit: 'NLM: 500/page and 7,500 retrievable/query',
    constraint: 'WHO ICD-10 and U.S. ICD-10-CM are related but not interchangeable.',
    example: 'Find U.S. ICD-10-CM diagnosis codes related to pulmonary tuberculosis.',
    parameters: [{ label: 'Code system', value: 'U.S. ICD-10-CM' }, { label: 'Search terms', value: 'pulmonary tuberculosis' }, { label: 'Release', value: 'Current demo edition' }, { label: 'Count', value: '20' }],
    results: [{ id: 'DEMO-ICD-001', title: 'Sample pulmonary tuberculosis code', summary: 'Illustrative code lookup preserving the code system and release context.', metadata: [{ label: 'System', value: 'ICD-10-CM' }, { label: 'Code', value: 'DEMO-A15.X' }, { label: 'Edition', value: 'Demo release' }], matchReason: 'Preferred label contains both requested clinical concepts.', sourceType: 'database' }],
  },
  {
    id: 'npi-registry',
    name: 'NPI Registry',
    category: 'Providers',
    capability: 'Structured search',
    description: 'Public provider identifiers, names, taxonomies, and locations.',
    interface: 'NPPES Read API v2.1',
    access: 'Public · no API key',
    limit: '200/request · at most 1,200 accessible per search',
    constraint: 'NPI enumeration is not proof of current licensure, credentialing, enrollment, or sanctions status.',
    example: 'Find cardiologists in Phoenix, Arizona.',
    parameters: [{ label: 'Taxonomy', value: 'Cardiology' }, { label: 'City', value: 'Phoenix' }, { label: 'State', value: 'AZ' }, { label: 'Limit', value: '20' }],
    results: [{ id: 'DEMO-NPI-001', title: 'Sample cardiology practice', summary: 'Illustrative provider-directory record with minimized public location data.', metadata: [{ label: 'Type', value: 'Organization' }, { label: 'Taxonomy', value: 'Cardiology' }, { label: 'Location', value: 'Phoenix, AZ' }], matchReason: 'Primary taxonomy and practice location match the requested criteria.', sourceType: 'database' }],
  },
  {
    id: 'pubchem',
    name: 'PubChem',
    category: 'Chemistry',
    capability: 'Compound lookup',
    description: 'Compound identifiers, structures, properties, synonyms, assays, and targets.',
    interface: 'PUG REST / PUG View',
    access: 'Public · no API key',
    limit: 'Maximum requested usage 5 requests/sec',
    constraint: 'Expensive structure searches may return an asynchronous list key for polling.',
    example: 'Show the molecular formula, weight, and synonyms for aspirin.',
    parameters: [{ label: 'Input', value: 'Compound name: aspirin' }, { label: 'Operation', value: 'Properties + synonyms' }, { label: 'Output', value: 'JSON' }, { label: 'Async handling', value: 'Poll ListKey if returned' }],
    results: [{ id: 'DEMO-CID-001', title: 'Aspirin', summary: 'Illustrative compact compound property response and synonym list.', metadata: [{ label: 'Formula', value: 'C9H8O4' }, { label: 'Molecular weight', value: '180.16' }, { label: 'Record type', value: 'Compound' }], matchReason: 'The preferred compound name resolves directly to a single sample record.', sourceType: 'database' }],
  },
];

export const executionStages = [
  'Interpreting natural-language intent',
  'Building source-specific parameters',
  'Searching the selected source',
  'Normalizing records and provenance',
];