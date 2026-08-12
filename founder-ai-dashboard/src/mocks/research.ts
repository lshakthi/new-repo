import type { ProvenanceStep } from '../design-system';

export interface ResearchMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sections?: ResponseSection[];
  provenance?: ProvenanceStep[];
  totalDuration?: string;
  followUps?: string[];
}

export interface ResponseSection {
  id: string;
  title: string;
  content: string;
  confidence: 'strong' | 'moderate' | 'weak' | 'conflict' | 'missing';
  citations?: Citation[];
  uncertainties?: Array<{ what: string; resolution: string }>;
  conflict?: {
    topic: string;
    positions: [ConflictPosition, ConflictPosition];
  };
}

export interface Citation {
  id: string;
  label: string;
  sourceType: 'pubmed' | 'database' | 'trial' | 'patent' | 'preprint' | 'web';
}

interface ConflictPosition {
  position: string;
  summary: string;
  sources: Citation[];
}

export const mockResearchConversation: ResearchMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'What is known about TP53 p.R175H as a therapeutic target? Is this variant worth pursuing?',
    timestamp: '2026-08-12T09:15:00Z',
  },
  {
    id: 'msg-2',
    role: 'system',
    content: 'This looks like a target validation question. I will pull variant evidence, disease association, pathway context, structural impact, and competitive landscape.',
    timestamp: '2026-08-12T09:15:02Z',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: '',
    timestamp: '2026-08-12T09:15:45Z',
    sections: [
      {
        id: 'sec-1',
        title: 'Variant identity and clinical significance',
        content: 'TP53 p.R175H (rs28934578) is a missense mutation in the DNA-binding domain of the p53 tumor suppressor protein. It is classified as pathogenic in ClinVar with review status "criteria provided, multiple submitters, no conflicts." This is one of the most frequently observed TP53 hotspot mutations in human cancer, accounting for approximately 4.6% of all somatic TP53 mutations reported in COSMIC.',
        confidence: 'strong',
        citations: [
          { id: 'cit-1', label: 'ClinVar VCV000012347', sourceType: 'database' },
          { id: 'cit-2', label: 'COSMIC TP53 database', sourceType: 'database' },
          { id: 'cit-3', label: 'PMID 38291045', sourceType: 'pubmed' },
        ],
      },
      {
        id: 'sec-2',
        title: 'Gain-of-function mechanism',
        content: 'Unlike simple loss-of-function TP53 mutations, R175H confers gain-of-function (GOF) properties. The mutant protein accumulates at high levels in tumor cells and actively promotes proliferation, survival, genomic instability, and metastasis through interactions with other transcription factors and chromatin remodelers. Multiple studies demonstrate that R175H-mutant p53 can bind and inactivate p63 and p73 family members, broadening its oncogenic effect beyond simple loss of wild-type p53 function.',
        confidence: 'strong',
        citations: [
          { id: 'cit-4', label: 'PMID 37845621', sourceType: 'pubmed' },
          { id: 'cit-5', label: 'PMID 36982104', sourceType: 'pubmed' },
          { id: 'cit-6', label: 'Nature Rev Cancer 2024', sourceType: 'pubmed' },
        ],
      },
      {
        id: 'sec-3',
        title: 'Therapeutic approaches under investigation',
        content: 'Three main strategies are being pursued to target TP53 R175H: (1) Small molecules that restore wild-type conformation, such as APR-246 (eprenetapopt), which has reached Phase 3 trials in MDS/AML. (2) Proteolysis-targeting chimeras (PROTACs) designed to degrade mutant p53. (3) Synthetic lethality approaches exploiting the DNA damage repair defects that R175H creates. A Phase 2 trial of APR-246 in solid tumors completed in 2025 showed modest single-agent activity but encouraging combination signals.',
        confidence: 'moderate',
        citations: [
          { id: 'cit-7', label: 'NCT03745716 (APR-246)', sourceType: 'trial' },
          { id: 'cit-8', label: 'PMID 39102847', sourceType: 'pubmed' },
          { id: 'cit-9', label: 'PMID 38567234', sourceType: 'pubmed' },
        ],
        uncertainties: [
          {
            what: 'Whether conformational correction is achievable for R175H specifically (a structural mutant) versus contact mutants like R248W.',
            resolution: 'Direct structural data comparing compound binding to R175H versus other hotspot mutants in co-crystal structures.',
          },
        ],
      },
      {
        id: 'sec-4',
        title: 'Competitive and patent landscape',
        content: 'The TP53 reactivation space is active but not crowded at the clinical stage. APR-246/eprenetapopt (Aprea Therapeutics) is the most advanced clinical asset. PMV Pharmaceuticals (PC14586/rezatapopt) targets the Y220C mutation specifically, not R175H. Several recent patent filings cover small-molecule TP53 conformational correctors broadly.',
        confidence: 'moderate',
        citations: [
          { id: 'cit-10', label: 'US20260198234A1', sourceType: 'patent' },
          { id: 'cit-11', label: 'NCT05891234 (Novartis)', sourceType: 'trial' },
          { id: 'cit-12', label: 'Aprea 2025 Annual Report', sourceType: 'web' },
        ],
        conflict: {
          topic: 'Whether TP53 R175H is druggable by small molecules',
          positions: [
            {
              position: 'Druggable with conformational correction',
              summary: 'APR-246 and next-generation molecules have shown in-vitro restoration of wild-type folding in R175H. Structural studies suggest the zinc-binding site can be re-stabilized.',
              sources: [
                { id: 'cit-8', label: 'PMID 39102847', sourceType: 'pubmed' },
                { id: 'cit-13', label: 'PMID 38901234', sourceType: 'pubmed' },
              ],
            },
            {
              position: 'Fundamentally undruggable by this approach',
              summary: 'R175H causes global unfolding of the DNA-binding domain, unlike point-contact mutants. The conformational change may be too severe for small-molecule rescue. Clinical failure of APR-246 monotherapy supports this view.',
              sources: [
                { id: 'cit-14', label: 'PMID 37654321', sourceType: 'pubmed' },
                { id: 'cit-15', label: 'PMID 38123456', sourceType: 'preprint' },
              ],
            },
          ],
        },
      },
      {
        id: 'sec-5',
        title: 'Population frequency',
        content: 'This variant is extremely rare in the general population (gnomAD allele frequency: 0.000003981, 1 allele in 251,152 total). It is classified as somatic in the vast majority of cancer occurrences, though germline TP53 R175H is observed in Li-Fraumeni syndrome families.',
        confidence: 'strong',
        citations: [
          { id: 'cit-16', label: 'gnomAD v4.1', sourceType: 'database' },
          { id: 'cit-17', label: 'ClinVar germline', sourceType: 'database' },
        ],
      },
    ],
    provenance: [
      { id: 'p-1', action: 'Queried ClinVar for TP53 R175H', source: 'ClinVar API', duration: '0.8s', icon: 'database' },
      { id: 'p-2', action: 'Queried gnomAD for population frequency', source: 'gnomAD GraphQL', duration: '1.2s', icon: 'database' },
      { id: 'p-3', action: 'Searched PubMed for TP53 R175H gain-of-function', source: 'PubMed E-utilities', duration: '2.1s', icon: 'search' },
      { id: 'p-4', action: 'Queried CIViC for therapeutic evidence', source: 'CIViC API', duration: '0.9s', icon: 'database' },
      { id: 'p-5', action: 'Searched ClinicalTrials.gov for TP53 reactivation trials', source: 'CT.gov API v2', duration: '1.5s', icon: 'search' },
      { id: 'p-6', action: 'Retrieved Open Targets disease associations', source: 'Open Targets GraphQL', duration: '1.1s', icon: 'database' },
    ],
    totalDuration: '38 seconds',
    followUps: [
      'Show me the structural impact of R175H on p53 protein folding.',
      'Compare this target to other TP53 hotspot mutations for druggability.',
      'What experiments would close the key evidence gaps?',
      'Build a target validation scorecard I can share with investors.',
    ],
  },
];
