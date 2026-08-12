export interface TaskGroup {
  id: string;
  title: string;
  description: string;
  tasks: TaskDefinition[];
  sciencePriority: number; // lower = shown first in science mode
  businessPriority: number;
}

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  examples: string[];
  useCaseRefs: number[]; // reference to source use case numbers
  estimatedTime?: string;
  requiresApproval?: boolean;
}

export const mockTaskGroups: TaskGroup[] = [
  {
    id: 'understand-science',
    title: 'Understand the Science',
    description: 'Research questions, validate sequences, and find public data.',
    sciencePriority: 1,
    businessPriority: 3,
    tasks: [
      {
        id: 'research-question',
        title: 'Research a scientific question',
        description: 'Get a cited, evidence-backed answer to any scientific question about a gene, target, pathway, mechanism, or research topic.',
        examples: [
          'What is known about CRISPR base editing off-target effects?',
          'What is the mechanism of action of pembrolizumab?',
          'Has anyone published on CDK4/6 inhibitor resistance mechanisms?',
        ],
        useCaseRefs: [1, 2, 3, 4, 5],
        estimatedTime: '30 seconds to 3 minutes',
      },
      {
        id: 'check-sequence',
        title: 'Check and understand a sequence',
        description: 'Identify, validate, and characterize a DNA, RNA, protein, antibody, or construct sequence.',
        examples: [
          'What protein does this DNA sequence encode?',
          'Does this construct match its reference sequence?',
          'Run a BLAST search for this unknown protein.',
        ],
        useCaseRefs: [6, 7, 8, 9, 10],
        estimatedTime: '15 seconds to 2 minutes',
      },
      {
        id: 'find-public-data',
        title: 'Find and prepare public data',
        description: 'Locate, download, and normalize public biomedical datasets from NCBI, GEO, SRA, and other repositories.',
        examples: [
          'Find RNA-seq data for colorectal cancer vs. normal tissue.',
          'Download the GRCh38 reference genome annotation package.',
          'Get FASTQ files for SRA accession SRR12345678.',
        ],
        useCaseRefs: [118, 119, 127, 128],
        estimatedTime: '1 to 5 minutes',
      },
    ],
  },
  {
    id: 'validate-target',
    title: 'Validate a Target',
    description: 'Build a defensible case for pursuing or rejecting a biological target.',
    sciencePriority: 2,
    businessPriority: 4,
    tasks: [
      {
        id: 'target-assessment',
        title: 'Assess a biological target',
        description: 'Evaluate whether a target is biologically relevant, disease-linked, mechanistically plausible, and experimentally worth pursuing.',
        examples: [
          'Build a target validation scorecard for IL6R in rheumatoid arthritis.',
          'What is the evidence that CDK12 is a good oncology target?',
          'Compare TP53 druggability evidence across sources.',
        ],
        useCaseRefs: [26, 29, 30, 31, 43, 97, 98, 101],
        estimatedTime: '2 to 5 minutes',
      },
      {
        id: 'variant-interpretation',
        title: 'Interpret a genetic variant',
        description: 'Get a complete evidence dossier for a named genetic variant, covering frequency, clinical significance, cancer actionability, and predicted functional impact.',
        examples: [
          'What is known about TP53 p.R175H?',
          'Is BRCA2 c.5946delT pathogenic?',
          'Check the clinical significance of rs121913529.',
        ],
        useCaseRefs: [17, 18, 19, 20, 21, 22, 25, 123],
        estimatedTime: '1 to 3 minutes',
      },
    ],
  },
  {
    id: 'look-at-molecules',
    title: 'Look at Molecules',
    description: 'Predict structures, visualize interactions, and prioritize compounds.',
    sciencePriority: 3,
    businessPriority: 6,
    tasks: [
      {
        id: 'structure-prediction',
        title: 'Predict or view a 3D structure',
        description: 'Predict, compare, simulate, and visualize molecular structures when experimental data is limited.',
        examples: [
          'Predict the structure of this novel protein sequence.',
          'How does the R175H mutation affect TP53 structure?',
          'Dock imatinib into the ABL1 kinase domain.',
        ],
        useCaseRefs: [11, 12, 14, 15, 16, 91, 92],
        estimatedTime: '2 to 15 minutes',
        requiresApproval: true,
      },
      {
        id: 'compound-discovery',
        title: 'Discover and rank compounds',
        description: 'Find, compare, and prioritize therapeutic compounds for a target or starting molecule.',
        examples: [
          'What known compounds exist against EGFR?',
          'Rank these 5 candidate inhibitors by drug-likeness and predicted binding.',
          'Flag toxicity and off-target risks for this compound series.',
        ],
        useCaseRefs: [32, 34, 35, 36, 37, 38, 39, 93, 103],
        estimatedTime: '2 to 8 minutes',
      },
    ],
  },
  {
    id: 'map-path-to-market',
    title: 'Map the Path to Market',
    description: 'Plan regulatory strategy, assess the landscape, and screen IP.',
    sciencePriority: 5,
    businessPriority: 1,
    tasks: [
      {
        id: 'regulatory-planning',
        title: 'Plan regulatory and reimbursement strategy',
        description: 'Identify the likely approval path, evidence requirements, reimbursement options, and market size for a bioscience product.',
        examples: [
          'What FDA pathway fits a cfDNA liquid biopsy for CRC screening?',
          'Is there a CPT code for our genetic test?',
          'Estimate the TAM for a first-line NSCLC companion diagnostic.',
        ],
        useCaseRefs: [61, 62, 63, 64, 65, 66, 104, 105],
        estimatedTime: '3 to 8 minutes',
      },
      {
        id: 'clinical-landscape',
        title: 'Assess clinical and diagnostic landscape',
        description: 'Understand active trials, diagnostic tests, pharmacogenomic evidence, or pathogen surveillance relevant to your indication.',
        examples: [
          'Who else is running trials in glioblastoma right now?',
          'What genetic tests exist for Lynch syndrome?',
          'Is the BA.2.86 SARS-CoV-2 variant still circulating?',
        ],
        useCaseRefs: [40, 42, 102, 126],
        estimatedTime: '1 to 4 minutes',
      },
      {
        id: 'patent-fto',
        title: 'Screen patents and freedom to operate',
        description: 'Get an early view of novelty, overlap, and licensing opportunities before committing legal resources.',
        examples: [
          'Is there prior art for our TP53 conformational corrector approach?',
          'Map patent filings in the ADC space over the last 3 years.',
          'Who has complementary technology we could license?',
        ],
        useCaseRefs: [56, 57, 58, 59, 60],
        estimatedTime: '3 to 8 minutes',
      },
    ],
  },
  {
    id: 'watch-landscape',
    title: 'Watch the Landscape',
    description: 'Monitor competitors, publications, trials, and market changes.',
    sciencePriority: 6,
    businessPriority: 2,
    tasks: [
      {
        id: 'competitor-monitoring',
        title: 'Monitor competitors and science',
        description: 'Track meaningful changes in trials, pipelines, patents, publications, and competitor activity.',
        examples: [
          'Set up monitoring for Novartis activity in TP53 space.',
          'Alert me when new TP53 papers are published.',
          'What changed in my competitive landscape this month?',
        ],
        useCaseRefs: [67, 68, 69, 70, 71, 117],
        estimatedTime: 'Ongoing (alerts delivered)',
      },
    ],
  },
  {
    id: 'produce-deliverable',
    title: 'Produce a Deliverable',
    description: 'Turn research into documents, figures, and packages ready to share.',
    sciencePriority: 4,
    businessPriority: 5,
    tasks: [
      {
        id: 'scientific-documents',
        title: 'Create scientific documents and figures',
        description: 'Generate grants, manuscripts, reviewer responses, diagrams, and publication-ready figures from your analysis.',
        examples: [
          'Draft a specific aims section for an NIH R01 on our TP53 approach.',
          'Generate a publication figure from this differential expression result.',
          'Prepare a reviewer response using our existing evidence.',
        ],
        useCaseRefs: [47, 50, 51, 52, 53, 54, 55, 112, 113],
        estimatedTime: '3 to 10 minutes',
      },
      {
        id: 'investor-materials',
        title: 'Prepare investor and partner materials',
        description: 'Assemble data room sections, diligence responses, board updates, and pitch content from existing research.',
        examples: [
          'Build the science section of our data room.',
          'Answer this investor question about our mechanism.',
          'Generate an investor update with competitive context.',
        ],
        useCaseRefs: [72, 73, 74, 75, 76],
        estimatedTime: '5 to 15 minutes',
      },
    ],
  },
  {
    id: 'cross-domain',
    title: 'Answer a Big Question',
    description: 'Connect multiple types of research and analysis into one decision package.',
    sciencePriority: 7,
    businessPriority: 7,
    tasks: [
      {
        id: 'end-to-end-pipeline',
        title: 'Run an end-to-end evidence pipeline',
        description: 'Start with one important question and get a connected decision package that brings together research, analysis, and recommendations.',
        examples: [
          'Is TP53 R175H a viable therapeutic target? Build the complete case.',
          'Should we pursue a 510(k) or De Novo for our diagnostic, and what evidence do we need?',
          'Evaluate this compound series from target validation through patent landscape.',
        ],
        useCaseRefs: [77, 78, 80],
        estimatedTime: '10 to 30 minutes',
        requiresApproval: true,
      },
    ],
  },
];
