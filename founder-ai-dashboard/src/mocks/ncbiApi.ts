import type { NcbiSequenceRecord, NcbiToolResult } from './ncbiTools';
import { runNcbiTool, sanitizeNucleotides } from './ncbiTools';

// ─────────────────────────────────────────────────────────────
// Live NCBI API client
//
// Calls the public NCBI E-utilities and BLAST endpoints directly from the
// browser so users get real results in-app, without following external links.
//
//   - Taxonomy      : esearch (JSON) + efetch (XML lineage)
//   - Sequence search: esearch + esummary (JSON)
//   - BLAST          : blastn submit + poll (async RID flow)
//
// Every call has a timeout and falls back to the illustrative mock result
// (runNcbiTool) if the network or API is unavailable, so a demo never
// dead-ends. Failures are surfaced via result.live = false + result.notice.
// ─────────────────────────────────────────────────────────────

// In the browser we route through the Vite dev proxy (see vite.config.ts) so
// calls are same-origin. This is what makes the BLAST flow work in-app: the
// public BLAST endpoint sends no CORS headers, so a direct browser call is
// blocked and the app would otherwise fall back to illustrative data.
// Outside the browser (or if the proxy is absent) we use the public URLs.
const USE_PROXY = typeof window !== 'undefined';
const EUTILS = USE_PROXY ? '/ncbi-eutils' : 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const BLAST = USE_PROXY ? '/ncbi-blast' : 'https://blast.ncbi.nlm.nih.gov/Blast.cgi';
// Identify the client to NCBI per their usage guidelines.
const TOOL = 'founder-ai-dashboard';
const EMAIL = 'support@founder-ai.example';

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function eutilsUrl(path: string, params: Record<string, string>): string {
  const search = new URLSearchParams({ tool: TOOL, email: EMAIL, ...params });
  return `${EUTILS}/${path}?${search.toString()}`;
}

// ─── Taxonomy ────────────────────────────────────────────────

export async function fetchTaxonomy(organism: string): Promise<NcbiToolResult> {
  const started = performance.now();
  try {
    // 1. Resolve organism name → taxon id
    const searchRes = await fetchWithTimeout(
      eutilsUrl('esearch.fcgi', { db: 'taxonomy', term: organism, retmode: 'json' }),
      8000,
    );
    if (!searchRes.ok) throw new Error(`esearch ${searchRes.status}`);
    const searchJson = await searchRes.json();
    const id: string | undefined = searchJson?.esearchresult?.idlist?.[0];
    if (!id) throw new Error('no taxon id');

    // 2. Fetch the taxonomy record (XML) and parse the lineage
    const fetchRes = await fetchWithTimeout(
      eutilsUrl('efetch.fcgi', { db: 'taxonomy', id, retmode: 'xml' }),
      8000,
    );
    if (!fetchRes.ok) throw new Error(`efetch ${fetchRes.status}`);
    const xml = await fetchRes.text();
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    const scientificName = doc.querySelector('Taxon > ScientificName')?.textContent?.trim() || organism;
    const rank = doc.querySelector('Taxon > Rank')?.textContent?.trim() || 'no rank';
    const lineageText = doc.querySelector('Taxon > Lineage')?.textContent?.trim() || '';
    const lineageNodes = doc.querySelectorAll('LineageEx > Taxon > ScientificName');
    const lineage = lineageNodes.length
      ? Array.from(lineageNodes).map((n) => n.textContent?.trim() || '').filter(Boolean).concat(scientificName)
      : lineageText.split(';').map((s) => s.trim()).filter(Boolean).concat(scientificName);

    const nucleotideListUrl = `https://www.ncbi.nlm.nih.gov/nuccore/?term=txid${id}`;
    const duration = ((performance.now() - started) / 1000).toFixed(1);

    return {
      toolId: 'taxonomy-lineage',
      query: scientificName,
      headline: `${scientificName} · taxon ${id}`,
      summary: `Resolved "${scientificName}" to NCBI taxon ID ${id} (rank: ${rank}) with a ${lineage.length}-node lineage, retrieved live from NCBI.`,
      lineage,
      taxonId: id,
      nucleotideCount: 'View list',
      nucleotideListUrl,
      taxon: [
        { label: 'Taxon ID', value: id },
        { label: 'Rank', value: rank },
        { label: 'Lineage depth', value: `${lineage.length} nodes` },
        { label: 'GenBank nucleotides', value: 'View list', href: nucleotideListUrl },
      ],
      provenance: [
        { id: 'tx-1', action: `Searched taxonomy for "${organism}"`, source: 'Entrez esearch (db=taxonomy)', duration: '—', icon: 'search' },
        { id: 'tx-2', action: `Fetched taxonomy record ${id}`, source: 'Entrez efetch (db=taxonomy)', duration: '—', icon: 'database' },
        { id: 'tx-3', action: 'Parsed lineage from XML', source: 'Local analysis', duration: '—', icon: 'compute' },
      ],
      totalDuration: `${duration}s`,
      sourceUrl: `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${id}`,
      sourceLabel: 'View on NCBI Taxonomy Browser',
      live: true,
    };
  } catch {
    return withFallbackNotice(runNcbiTool('taxonomy-lineage', organism));
  }
}

// ─── Sequence search ─────────────────────────────────────────

export async function fetchSequenceSearch(term: string): Promise<NcbiToolResult> {
  const started = performance.now();
  try {
    const searchRes = await fetchWithTimeout(
      eutilsUrl('esearch.fcgi', { db: 'nuccore', term, retmax: '8', retmode: 'json' }),
      8000,
    );
    if (!searchRes.ok) throw new Error(`esearch ${searchRes.status}`);
    const searchJson = await searchRes.json();
    const idList: string[] = searchJson?.esearchresult?.idlist ?? [];
    const total: string = searchJson?.esearchresult?.count ?? String(idList.length);
    if (idList.length === 0) {
      return {
        ...emptySequenceResult(term),
        summary: `No GenBank nucleotide records matched "${term}". Try different terms (gene, organism, allele).`,
        live: true,
      };
    }

    // esummary for titles / lengths
    const sumRes = await fetchWithTimeout(
      eutilsUrl('esummary.fcgi', { db: 'nuccore', id: idList.join(','), retmode: 'json' }),
      8000,
    );
    if (!sumRes.ok) throw new Error(`esummary ${sumRes.status}`);
    const sumJson = await sumRes.json();
    const uids: string[] = sumJson?.result?.uids ?? idList;
    const records: NcbiSequenceRecord[] = uids.map((uid) => {
      const doc = sumJson.result[uid] ?? {};
      const accession = doc.accessionversion || doc.caption || uid;
      return {
        accession,
        title: doc.title || '(no title)',
        length: doc.slen ? `${Number(doc.slen).toLocaleString()} bp` : '—',
        organism: doc.organism,
        url: `https://www.ncbi.nlm.nih.gov/nuccore/${accession}`,
      };
    });

    // Pull the actual base pairs for the top record so the user sees a
    // sequence in-app immediately, without following a link to GenBank.
    if (records[0]) {
      const origin = await fetchSequenceOrigin(records[0].accession);
      if (origin) records[0].origin = origin;
    }

    const duration = ((performance.now() - started) / 1000).toFixed(1);
    return {
      toolId: 'sequence-search',
      query: term,
      headline: `${Number(total).toLocaleString()} sequences matched "${term}"`,
      summary: `Retrieved ${records.length} of ${Number(total).toLocaleString()} GenBank nucleotide records live from NCBI. Expand any record to read its sequence right here.`,
      records,
      provenance: [
        { id: 'sq-1', action: `Searched nuccore for "${term}"`, source: 'Entrez esearch (db=nuccore)', duration: '—', icon: 'search' },
        { id: 'sq-2', action: `Retrieved summaries for ${records.length} accessions`, source: 'Entrez esummary (db=nuccore)', duration: '—', icon: 'database' },
      ],
      totalDuration: `${duration}s`,
      sourceUrl: `https://www.ncbi.nlm.nih.gov/nuccore/?term=${encodeURIComponent(term)}`,
      sourceLabel: 'Open this search on NCBI Nucleotide',
      live: true,
    };
  } catch {
    return withFallbackNotice(runNcbiTool('sequence-search', term));
  }
}

// ─── Sequence content (efetch) ───────────────────────────────
// Pull the actual base pairs for a record so the user can read the
// sequence in-app instead of following the GenBank link. Returns a
// GenBank-style ORIGIN block (numbered, 10-base groups) built from the
// FASTA payload, or null if the fetch fails.

const originCache = new Map<string, string | null>();

export async function fetchSequenceOrigin(accession: string): Promise<string | null> {
  if (originCache.has(accession)) return originCache.get(accession) ?? null;
  try {
    const res = await fetchWithTimeout(
      eutilsUrl('efetch.fcgi', { db: 'nuccore', id: accession, rettype: 'fasta', retmode: 'text' }),
      10000,
    );
    if (!res.ok) throw new Error(`efetch ${res.status}`);
    const fasta = await res.text();
    const origin = fastaToOrigin(fasta);
    originCache.set(accession, origin);
    return origin;
  } catch {
    originCache.set(accession, null);
    return null;
  }
}

// Convert a FASTA payload into a GenBank ORIGIN block: strips the header,
// then lays the bases out in 6 groups of 10 per line with a right-aligned
// position index, matching the format shown on GenBank records.
function fastaToOrigin(fasta: string): string | null {
  const seq = fasta
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('>'))
    .join('')
    .replace(/[^acgtunACGTUN]/gi, '')
    .toLowerCase();
  if (!seq) return null;

  const lines: string[] = [];
  for (let i = 0; i < seq.length; i += 60) {
    const chunk = seq.slice(i, i + 60);
    const groups = chunk.match(/.{1,10}/g) ?? [];
    const index = String(i + 1).padStart(9, ' ');
    lines.push(`${index} ${groups.join(' ')}`);
  }
  return lines.join('\n');
}

function emptySequenceResult(term: string): NcbiToolResult {
  return {
    toolId: 'sequence-search',
    query: term,
    headline: `No matches for "${term}"`,
    summary: '',
    records: [],
    provenance: [
      { id: 'sq-1', action: `Searched nuccore for "${term}"`, source: 'Entrez esearch (db=nuccore)', duration: '—', icon: 'search' },
    ],
    totalDuration: '—',
    sourceUrl: `https://www.ncbi.nlm.nih.gov/nuccore/?term=${encodeURIComponent(term)}`,
    sourceLabel: 'Open this search on NCBI Nucleotide',
  };
}

// ─── BLAST ───────────────────────────────────────────────────
// The public BLAST URL API is asynchronous: submit returns a Request ID (RID),
// then the client polls until the search is READY, then fetches results.
// This can take tens of seconds. onProgress lets the UI show status.

// BLAST is a queued compute job at NCBI and genuinely takes ~15-40s. To keep
// the default flow instant, we return the illustrative result immediately and
// only run the live (slow) submit/poll path when `live` is explicitly set —
// e.g. when the user clicks "Run live BLAST".
export async function fetchBlast(
  sequence: string,
  onProgress?: (status: string) => void,
  options?: { live?: boolean },
): Promise<NcbiToolResult> {
  if (!options?.live) {
    // Instant path: no network round-trip. Returns the HLA-A-dominated,
    // score-sorted list the client expects, with the top hit's base pairs
    // already inline (the mock carries an ORIGIN block).
    return runNcbiTool('blast-sequence', sequence);
  }
  return fetchBlastLive(sequence, onProgress);
}

async function fetchBlastLive(
  sequence: string,
  onProgress?: (status: string) => void,
): Promise<NcbiToolResult> {
  const started = performance.now();
  const query = sanitizeNucleotides(sequence);
  try {
    onProgress?.('Submitting query to BLAST');
    const submitBody = new URLSearchParams({
      CMD: 'Put',
      PROGRAM: 'blastn',
      DATABASE: 'nt',
      QUERY: query,
      HITLIST_SIZE: '10',
    });
    const submitRes = await fetchWithTimeout(BLAST, 15000, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: submitBody.toString(),
    });
    if (!submitRes.ok) throw new Error(`submit ${submitRes.status}`);
    const submitText = await submitRes.text();
    const rid = /RID = (\S+)/.exec(submitText)?.[1];
    if (!rid) throw new Error('no RID');

    // Poll for completion (bounded).
    const maxWaitMs = 90000;
    const pollEvery = 5000;
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      await new Promise((r) => window.setTimeout(r, pollEvery));
      onProgress?.('Waiting for BLAST results');
      const statusRes = await fetchWithTimeout(
        `${BLAST}?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=${rid}`,
        15000,
      );
      const statusText = await statusRes.text();
      if (/Status=READY/.test(statusText)) {
        if (/ThereAreHits=no/.test(statusText)) {
          throw new Error('no hits');
        }
        break;
      }
      if (/Status=FAILED/.test(statusText) || /Status=UNKNOWN/.test(statusText)) {
        throw new Error('blast failed');
      }
    }

    onProgress?.('Fetching alignments');
    const resultRes = await fetchWithTimeout(
      `${BLAST}?CMD=Get&FORMAT_TYPE=JSON2_S&RID=${rid}`,
      20000,
    );
    if (!resultRes.ok) throw new Error(`result ${resultRes.status}`);
    const resultJson = await resultRes.json();
    const search = resultJson?.BlastOutput2?.[0]?.report?.results?.search
      ?? resultJson?.BlastOutput2?.report?.results?.search;
    const hits: any[] = search?.hits ?? [];
    if (hits.length === 0) throw new Error('no hits parsed');

    const records: NcbiSequenceRecord[] = hits.slice(0, 10).map((hit) => {
      const desc = hit.description?.[0] ?? {};
      const hsp = hit.hsps?.[0] ?? {};
      const accession = desc.accession || desc.id || 'unknown';
      const identity = hsp.identity && hsp.align_len
        ? `${Math.round((hsp.identity / hsp.align_len) * 100)}%`
        : undefined;
      return {
        accession,
        title: desc.title || '(no title)',
        length: hit.len ? `${Number(hit.len).toLocaleString()} bp` : '—',
        score: hsp.bit_score ? String(Math.round(hsp.bit_score)) : undefined,
        eValue: hsp.evalue != null ? String(hsp.evalue) : undefined,
        identity,
        organism: desc.sciname,
        url: `https://www.ncbi.nlm.nih.gov/nuccore/${accession}`,
      };
    });

    // Fetch the base pairs for the best hit so the alignment target is
    // readable in-app rather than only as a link to GenBank.
    onProgress?.('Fetching top hit sequence');
    if (records[0]) {
      const origin = await fetchSequenceOrigin(records[0].accession);
      if (origin) records[0].origin = origin;
    }

    const duration = ((performance.now() - started) / 1000).toFixed(0);
    return {
      toolId: 'blast-sequence',
      query,
      headline: `Top hit: ${records[0].title}`,
      summary: `Aligned the ${query.length} bp query against the nt database with blastn (live). ${records.length} hits are sorted by matching score. Expand any hit to read its sequence right here.`,
      records,
      provenance: [
        { id: 'bl-1', action: `Submitted ${query.length} bp query to blastn`, source: 'NCBI BLAST (nt database)', duration: '—', icon: 'search' },
        { id: 'bl-2', action: 'Polled until search READY', source: 'NCBI BLAST', duration: '—', icon: 'compute' },
        { id: 'bl-3', action: `Parsed ${records.length} hits (JSON2)`, source: 'Local analysis', duration: '—', icon: 'compute' },
      ],
      totalDuration: `${duration}s`,
      sourceUrl: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&BLAST_SPEC=GeoBlast&PAGE_TYPE=BlastSearch',
      sourceLabel: 'Open in NCBI BLAST',
      live: true,
    };
  } catch {
    return withFallbackNotice(runNcbiTool('blast-sequence', sequence));
  }
}

function withFallbackNotice(result: NcbiToolResult): NcbiToolResult {
  return {
    ...result,
    live: false,
    notice: 'Live NCBI request was unavailable (network, CORS, or timeout). Showing an illustrative result instead.',
  };
}
