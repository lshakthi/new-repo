import type { ProvenanceStep } from '../design-system';

// ─────────────────────────────────────────────────────────────
// NCBI tool definitions
//
// These three tools map directly to the client's use cases:
//   1. Taxonomy lineage by organism name       (Entrez taxonomy)
//   2. Search sequences by name / keyword       (Entrez nuccore esearch/esummary)
//   3. Find matching sequences for a nucleotide string (BLAST blastn)
//
// The runners here return illustrative results shaped like real NCBI
// responses. In production these are the points where BioPython /
// E-utilities / BLAST calls would be wired in (see API-CONTRACT.md).
// ─────────────────────────────────────────────────────────────

export type NcbiToolId = 'taxonomy-lineage' | 'sequence-search' | 'blast-sequence';

export type NcbiInputKind = 'organism' | 'keyword' | 'nucleotides';

export interface NcbiTool {
  id: NcbiToolId;
  name: string;
  /** One-line question the tool answers, phrased the way a user would ask it. */
  question: string;
  /** Short label used on chips and menus. */
  short: string;
  description: string;
  inputKind: NcbiInputKind;
  inputLabel: string;
  placeholder: string;
  /** A ready-to-run example taken from the client's reference document. */
  example: string;
  /** NCBI interface this tool talks to. */
  interface: string;
  websiteUrl: string;
  /** Words that hint the user wants this tool, used for intent detection. */
  keywords: string[];
}

export const ncbiTools: NcbiTool[] = [
  {
    id: 'taxonomy-lineage',
    name: 'Taxonomy lineage',
    question: 'Find the taxonomy tree for an organism',
    short: 'Taxonomy',
    description: 'Look up an organism by name and return its NCBI taxon ID and full ancestral lineage.',
    inputKind: 'organism',
    inputLabel: 'Organism name',
    placeholder: 'e.g. Homo sapiens',
    example: 'Homo sapiens',
    interface: 'NCBI E-utilities · taxonomy',
    websiteUrl: 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi',
    keywords: ['taxonomy', 'taxon', 'lineage', 'organism', 'species', 'tree', 'ancestry', 'classification'],
  },
  {
    id: 'sequence-search',
    name: 'Sequence search',
    question: 'Search for sequences by name or keyword',
    short: 'Search sequences',
    description: 'Search the GenBank nucleotide database by gene name, description, or tags and list matching records.',
    inputKind: 'keyword',
    inputLabel: 'Search terms',
    placeholder: 'e.g. Homo sapiens MHC class I antigen (HLA-A)',
    example: 'Homo sapiens MHC class I antigen (HLA-A)',
    interface: 'NCBI E-utilities · nuccore',
    websiteUrl: 'https://www.ncbi.nlm.nih.gov/nuccore/',
    keywords: ['sequence', 'search', 'gene', 'genbank', 'nuccore', 'accession', 'name', 'tag', 'keyword'],
  },
  {
    id: 'blast-sequence',
    name: 'BLAST a sequence',
    question: 'Find sequences that match a string of nucleotides',
    short: 'BLAST',
    description: 'Align a raw nucleotide string against GenBank and return the closest matching sequences by score.',
    inputKind: 'nucleotides',
    inputLabel: 'Enter accession number(s), gi(s), or FASTA sequence(s)',
    placeholder: 'Paste a nucleotide sequence (spaces and FASTA headers are fine), e.g. agtgcgg ggtcgggagg gaaaccgcct ...',
    example:
      'agtgcggggtcgggagggaaaccgcctctgcggggagaagcaaggggccctcctggcgggggcgcaggaccgggggagccgcgccgggaggagggtcgggcaggtctcagccactgctcgcccccaggctcccactccatgaggtatttcttcacatccgtgtcccggcccggccgcggggagccccgcttcatcgccgtgggctacgtggacgacacgcagttcgtgcggttcgac',
    interface: 'NCBI BLAST · blastn',
    websiteUrl: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&BLAST_SPEC=GeoBlast&PAGE_TYPE=BlastSearch',
    keywords: ['blast', 'blastn', 'match', 'align', 'alignment', 'nucleotide', 'sequence', 'similar', 'homolog'],
  },
];

export function getNcbiTool(id: NcbiToolId): NcbiTool {
  const tool = ncbiTools.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown NCBI tool: ${id}`);
  return tool;
}

// ─── Intent detection ────────────────────────────────────────
// Given free text, decide which NCBI tool (if any) the user is reaching for.
// Returns the best matching tool id, or null when nothing is a clear fit.

const NUCLEOTIDE_RE = /^[acgtun\s]+$/i;

/**
 * Normalize a pasted nucleotide/FASTA input into a bare sequence string.
 * Drops FASTA header lines (">...") and any non-ACGTUN characters, mirroring
 * what BLAST accepts in its "Enter accession number(s), gi(s), or FASTA
 * sequence(s)" box.
 */
export function sanitizeNucleotides(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('>'))
    .join('')
    .replace(/[^acgtunACGTUN]/g, '')
    .toLowerCase();
}

export function detectNcbiTool(text: string): NcbiToolId | null {
  const raw = text.trim();
  if (!raw) return null;

  // A long, mostly-ACGT string (or FASTA) is almost certainly a BLAST query.
  const isFasta = raw.startsWith('>');
  const compact = raw.replace(/\s+/g, '');
  if (isFasta || (compact.length >= 20 && NUCLEOTIDE_RE.test(compact))) {
    return 'blast-sequence';
  }

  const lower = raw.toLowerCase();
  const scores = ncbiTools.map((tool) => ({
    id: tool.id,
    score: tool.keywords.reduce((sum, kw) => (lower.includes(kw) ? sum + 1 : sum), 0),
  }));
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best && best.score > 0 ? best.id : null;
}

// ─── Result shapes ───────────────────────────────────────────

export interface NcbiKeyValue {
  label: string;
  value: string;
  /** Optional external link; when set the value renders as an anchor. */
  href?: string;
}

export interface NcbiSequenceRecord {
  accession: string;
  title: string;
  length: string;
  score?: string;
  /** BLAST expect value (E-value) for the alignment. */
  eValue?: string;
  identity?: string;
  organism?: string;
  url: string;
  /** GenBank ORIGIN base-pair listing, when available for the record. */
  origin?: string;
}

export interface NcbiToolResult {
  toolId: NcbiToolId;
  query: string;
  headline: string;
  summary: string;
  /** For taxonomy: ordered lineage nodes. */
  lineage?: string[];
  taxon?: NcbiKeyValue[];
  /**
   * For taxonomy: the resolved taxon id and its nucleotide list. Lets the UI
   * offer an in-app pivot to "list nucleotide sequences for this taxon"
   * (equivalent to nuccore/?term=txid<id>).
   */
  taxonId?: string;
  nucleotideCount?: string;
  nucleotideListUrl?: string;
  /** For sequence search / BLAST: matching records. */
  records?: NcbiSequenceRecord[];
  provenance: ProvenanceStep[];
  totalDuration: string;
  /** Deep link to inspect the same query on the public NCBI site. */
  sourceUrl: string;
  sourceLabel: string;
}

// ─── Mock runners ────────────────────────────────────────────
// Realistic responses built from the reference document (taxon 9606,
// HLA-A gene, the sample HLA-A sequence). Unknown inputs fall back to a
// clearly-labeled illustrative response so the demo never dead-ends.

const HUMAN_LINEAGE = [
  'cellular organisms', 'Eukaryota', 'Opisthokonta', 'Metazoa', 'Eumetazoa',
  'Bilateria', 'Deuterostomia', 'Chordata', 'Craniata', 'Vertebrata',
  'Gnathostomata', 'Teleostomi', 'Euteleostomi', 'Sarcopterygii',
  'Dipnotetrapodomorpha', 'Tetrapoda', 'Amniota', 'Mammalia', 'Theria',
  'Eutheria', 'Boreoeutheria', 'Euarchontoglires', 'Primates', 'Haplorrhini',
  'Simiiformes', 'Catarrhini', 'Hominoidea', 'Hominidae', 'Homininae', 'Homo',
];

const KNOWN_TAXA: Record<string, { id: string; rank: string; lineage: string[]; nucleotides: string }> = {
  'homo sapiens': { id: '9606', rank: 'species', lineage: HUMAN_LINEAGE, nucleotides: '29,521,996' },
  human: { id: '9606', rank: 'species', lineage: HUMAN_LINEAGE, nucleotides: '29,521,996' },
  'mus musculus': {
    id: '10090', rank: 'species', nucleotides: '31,204,880',
    lineage: [...HUMAN_LINEAGE.slice(0, 22), 'Glires', 'Rodentia', 'Myomorpha', 'Muroidea', 'Muridae', 'Murinae', 'Mus', 'Mus'],
  },
  mouse: {
    id: '10090', rank: 'species', nucleotides: '31,204,880',
    lineage: [...HUMAN_LINEAGE.slice(0, 22), 'Glires', 'Rodentia', 'Myomorpha', 'Muroidea', 'Muridae', 'Murinae', 'Mus', 'Mus'],
  },
};

function runTaxonomy(query: string): NcbiToolResult {
  const key = query.trim().toLowerCase();
  const known = KNOWN_TAXA[key];
  const display = query.trim() || 'Homo sapiens';

  const id = known?.id ?? '000000';
  const lineage = known?.lineage ?? HUMAN_LINEAGE;
  const rank = known?.rank ?? 'species';
  const nucleotides = known?.nucleotides ?? '—';
  const knownNote = known
    ? ''
    : ' No exact match was resolved for this name, so an illustrative lineage is shown. Verify the organism spelling on NCBI.';

  // Per the reference doc: the nucleotide count links to the list of nucleotide
  // sequences for this taxon, e.g. nuccore/?term=txid9606
  const nucleotideListUrl = `https://www.ncbi.nlm.nih.gov/nuccore/?term=txid${id}`;

  return {
    toolId: 'taxonomy-lineage',
    query: display,
    headline: `${display} · taxon ${id}`,
    summary: `Resolved "${display}" to NCBI taxon ID ${id} (rank: ${rank}) with a ${lineage.length}-node lineage. There are ${nucleotides} nucleotide sequences in GenBank for this taxon.${knownNote}`,
    lineage,
    taxonId: id,
    nucleotideCount: nucleotides,
    nucleotideListUrl,
    taxon: [
      { label: 'Taxon ID', value: id },
      { label: 'Rank', value: rank },
      { label: 'Lineage depth', value: `${lineage.length} nodes` },
      { label: 'GenBank nucleotides', value: nucleotides, href: nucleotideListUrl },
    ],
    provenance: [
      { id: 'tx-1', action: `Searched taxonomy for "${display}"`, source: 'Entrez esearch (db=taxonomy)', duration: '0.6s', icon: 'search' },
      { id: 'tx-2', action: `Fetched taxonomy record ${id}`, source: 'Entrez efetch (db=taxonomy)', duration: '0.7s', icon: 'database' },
      { id: 'tx-3', action: 'Parsed lineage and nucleotide count from XML', source: 'Local analysis', duration: '0.1s', icon: 'compute' },
    ],
    totalDuration: '1.4s',
    sourceUrl: `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${id}`,
    sourceLabel: 'View on NCBI Taxonomy Browser',
  };
}

// GenBank ORIGIN block for PZ458665.1, exactly as shown in the reference doc.
const PZ458665_ORIGIN = `        1 tcccattggg tgtcgggttt ccagagaagc caatcagtgt cgtcgcggtc gctgttctaa
       61 agtccgcacg cacccaccgg gactcagatt ctccccagac gccgaggatg gccgtcatgg
      121 cgccccgaac cctcctcctg ctactctcgg gggtcctggc cctgacccag acctgggcgg
      181 gtgagtgcgg ggtcgggagg gaaaccgcct ctgcggggag aagcaagggg ccctcctggc
      241 gggggcgcag gaccggggga gccgcgccgg gaggagggtc gggcaggtct cagccactgc
      301 tcgcccccag gctcccactc catgaggtat ttcttcacat ccgtgtcccg gcccggccgc
      361 ggggagcccc gcttcatcgc cgtgggctac gtggacgaca cgcagttcgt gcggttcgac
      421 agcgacgccg cgagccagaa gatggagccg cgggcgccgt ggatagagca ggaggggccg`;

const HLA_RECORDS: NcbiSequenceRecord[] = [
  {
    accession: 'PZ458665.1',
    title: 'Homo sapiens isolate K_7476 MHC class I antigen (HLA-A) gene, HLA-A*01:01:01:01v2var allele, complete cds',
    length: '3,503 bp',
    organism: 'Homo sapiens',
    url: 'https://www.ncbi.nlm.nih.gov/nuccore/PZ458665.1',
    origin: PZ458665_ORIGIN,
  },
  {
    accession: 'PZ458664.1',
    title: 'Homo sapiens isolate K_7451 MHC class I antigen (HLA-A) gene, complete cds',
    length: '3,488 bp',
    organism: 'Homo sapiens',
    url: 'https://www.ncbi.nlm.nih.gov/nuccore/PZ458664.1',
  },
  {
    accession: 'NM_002116.8',
    title: 'Homo sapiens major histocompatibility complex, class I, A (HLA-A), mRNA',
    length: '1,098 bp',
    organism: 'Homo sapiens',
    url: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_002116.8',
  },
  {
    accession: 'KJ909486.1',
    title: 'Homo sapiens HLA-A*02:01 allele MHC class I antigen (HLA-A) gene, complete cds',
    length: '3,102 bp',
    organism: 'Homo sapiens',
    url: 'https://www.ncbi.nlm.nih.gov/nuccore/KJ909486.1',
  },
  {
    accession: 'AF148850.1',
    title: 'Homo sapiens MHC class I antigen (HLA-A) mRNA, complete cds',
    length: '1,101 bp',
    organism: 'Homo sapiens',
    url: 'https://www.ncbi.nlm.nih.gov/nuccore/AF148850.1',
  },
];

function runSequenceSearch(query: string): NcbiToolResult {
  const display = query.trim() || 'Homo sapiens MHC class I antigen (HLA-A)';

  // txid<n> scoped search: the taxonomy tool links here to list a taxon's
  // nucleotide sequences (nuccore/?term=txid9606).
  const txidMatch = display.match(/txid(\d+)/i);
  if (txidMatch) {
    const txid = txidMatch[1];
    const records = txid === '9606'
      ? HLA_RECORDS
      : HLA_RECORDS.slice(0, 3).map((r) => ({ ...r, title: `Illustrative nucleotide record for txid${txid} — ${r.title}` }));
    return {
      toolId: 'sequence-search',
      query: display,
      headline: `Nucleotide sequences for txid${txid}`,
      summary: `Listing GenBank nucleotide records for taxon ${txid}. Select any record to open its full GenBank entry, including the ORIGIN base pairs.`,
      records,
      provenance: [
        { id: 'sq-1', action: `Searched nuccore for txid${txid}`, source: 'Entrez esearch (db=nuccore)', duration: '1.0s', icon: 'search' },
        { id: 'sq-2', action: `Retrieved summaries for ${records.length} accessions`, source: 'Entrez esummary (db=nuccore)', duration: '0.8s', icon: 'database' },
      ],
      totalDuration: '1.8s',
      sourceUrl: `https://www.ncbi.nlm.nih.gov/nuccore/?term=txid${txid}`,
      sourceLabel: `Open txid${txid} nucleotide list on NCBI`,
    };
  }

  const matchesHla = /hla|mhc|antigen/i.test(display);
  const records = matchesHla
    ? HLA_RECORDS
    : HLA_RECORDS.slice(0, 3).map((r, i) => ({
        ...r,
        title: `Illustrative match ${i + 1} for "${display}" — ${r.title}`,
      }));

  return {
    toolId: 'sequence-search',
    query: display,
    headline: `${records.length} sequences matched "${display}"`,
    summary: matchesHla
      ? `Found ${records.length} GenBank nucleotide records matching the search terms, most annotated as human HLA-A.`
      : `Showing ${records.length} illustrative GenBank records. Refine the terms (gene, organism, allele) to narrow the search.`,
    records,
    provenance: [
      { id: 'sq-1', action: `Searched nuccore for "${display}"`, source: 'Entrez esearch (db=nuccore)', duration: '0.9s', icon: 'search' },
      { id: 'sq-2', action: `Retrieved summaries for ${records.length} accessions`, source: 'Entrez esummary (db=nuccore)', duration: '0.8s', icon: 'database' },
    ],
    totalDuration: '1.7s',
    sourceUrl: `https://www.ncbi.nlm.nih.gov/nuccore/?term=${encodeURIComponent(display)}`,
    sourceLabel: 'Open this search on NCBI Nucleotide',
  };
}

const BLAST_URL = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&BLAST_SPEC=GeoBlast&PAGE_TYPE=BlastSearch';

function runBlast(query: string): NcbiToolResult {
  // Accept spaced sequences and FASTA, exactly like the BLAST input box.
  const compact = sanitizeNucleotides(query);
  const bp = compact.length;
  const looksLikeHla = compact.includes('atgaggtat'); // motif from the sample HLA-A sequence

  // Illustrative blastn hits. Fields mirror the BioPython hint in the doc
  // (title, length, e_value, score) and are sorted by score, descending.
  const records: NcbiSequenceRecord[] = [
    { accession: 'PZ458665.1', title: 'Homo sapiens MHC HLA-A gene (MHC class I antigen, HLA-A*01:01), complete cds', length: '3,503 bp', score: '432', eValue: '0.0', identity: '100%', organism: 'Homo sapiens', url: 'https://www.ncbi.nlm.nih.gov/nuccore/PZ458665.1', origin: PZ458665_ORIGIN },
    { accession: 'KJ909486.1', title: 'Homo sapiens MHC HLA-A gene, HLA-A*02:01 allele, complete cds', length: '3,102 bp', score: '418', eValue: '0.0', identity: '99%', organism: 'Homo sapiens', url: 'https://www.ncbi.nlm.nih.gov/nuccore/KJ909486.1' },
    { accession: 'NM_002116.8', title: 'Homo sapiens major histocompatibility complex, class I, A (HLA-A), mRNA', length: '1,098 bp', score: '390', eValue: '2e-170', identity: '98%', organism: 'Homo sapiens', url: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_002116.8' },
    { accession: 'AF148850.1', title: 'Homo sapiens MHC HLA-A gene (MHC class I antigen), mRNA, complete cds', length: '1,101 bp', score: '371', eValue: '4e-160', identity: '97%', organism: 'Homo sapiens', url: 'https://www.ncbi.nlm.nih.gov/nuccore/AF148850.1' },
    { accession: 'MH453293.1', title: 'Homo sapiens MHC HLA-A gene, HLA-A*03:01 allele, partial cds', length: '2,987 bp', score: '355', eValue: '9e-152', identity: '96%', organism: 'Homo sapiens', url: 'https://www.ncbi.nlm.nih.gov/nuccore/MH453293.1' },
  ].sort((a, b) => Number(b.score) - Number(a.score));

  const hlaCount = records.filter((r) => /HLA-A/i.test(r.title)).length;

  return {
    toolId: 'blast-sequence',
    query: compact,
    headline: looksLikeHla ? 'Top hit: Homo sapiens MHC HLA-A gene' : `BLAST of a ${bp} bp sequence`,
    summary: looksLikeHla
      ? `Aligned the ${bp} bp query against the nr database with blastn. ${records.length} hits are sorted by matching score, and ${hlaCount} of ${records.length} are Homo sapiens MHC HLA-A gene records — the top match at 100% identity.`
      : `Aligned the ${bp} bp query against the nr database with blastn. ${records.length} illustrative hits are shown, sorted by matching score.`,
    records,
    provenance: [
      { id: 'bl-1', action: `Submitted ${bp} bp query to blastn`, source: 'NCBI BLAST (nr database)', duration: '8.2s', icon: 'search' },
      { id: 'bl-2', action: 'Parsed alignments and HSPs', source: 'Local analysis', duration: '0.3s', icon: 'compute' },
      { id: 'bl-3', action: `Ranked ${records.length} hits by score`, source: 'Local analysis', duration: '0.1s', icon: 'compute' },
    ],
    totalDuration: '8.6s',
    sourceUrl: BLAST_URL,
    sourceLabel: 'Open in NCBI BLAST (paste sequence, click Blast)',
  };
}

export function runNcbiTool(toolId: NcbiToolId, query: string): NcbiToolResult {
  switch (toolId) {
    case 'taxonomy-lineage':
      return runTaxonomy(query);
    case 'sequence-search':
      return runSequenceSearch(query);
    case 'blast-sequence':
      return runBlast(query);
  }
}
