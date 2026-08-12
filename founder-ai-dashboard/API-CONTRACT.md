# API Contract

Proposed interface for the backend engineering team. All mock data in `src/mocks/` follows these shapes.

## Common Types

```typescript
// Every response includes confidence and provenance
interface BaseResponse {
  requestId: string;
  status: 'completed' | 'partial' | 'failed' | 'running';
  startedAt: string; // ISO 8601
  completedAt?: string;
  error?: ErrorDetail;
}

interface ErrorDetail {
  code: string;
  message: string;
  retriable: boolean;
  failedSource?: string;
}

type EvidenceStrength = 'strong' | 'moderate' | 'weak' | 'conflict' | 'missing';
type SourceType = 'pubmed' | 'database' | 'trial' | 'patent' | 'preprint' | 'web';

interface Citation {
  id: string;
  label: string;          // Human-readable short label (e.g., "PMID 38291045")
  sourceType: SourceType;
  url?: string;           // Direct link to source
  title?: string;         // Full title of source
  authors?: string;       // Abbreviated author list
  year?: string;
  relevantPassage?: string; // The specific text supporting the claim
}

interface ProvenanceStep {
  id: string;
  action: string;         // What was done (e.g., "Queried ClinVar for TP53 R175H")
  source: string;         // Which service (e.g., "ClinVar API")
  duration?: string;      // How long it took
  parameters?: Record<string, string>; // What was sent
  icon?: 'search' | 'database' | 'compute';
}

interface Uncertainty {
  what: string;           // What is unknown
  resolution: string;     // What would resolve it
}
```

## Session Management

```typescript
// POST /api/sessions
interface CreateSessionRequest {
  query?: string;         // Natural language question
  taskId?: string;        // From task taxonomy
  mode: 'science' | 'business';
}

interface CreateSessionResponse extends BaseResponse {
  sessionId: string;
  routingDecision: string;  // Plain-language explanation of what the system will do
  taskType: string;
  estimatedDuration?: string;
}

// GET /api/sessions/:id
interface SessionResponse extends BaseResponse {
  session: {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'partial';
    mode: 'science' | 'business';
    createdAt: string;
    updatedAt: string;
    taskType: string;
    messages: Message[];
  };
}
```

## Research / Conversational Interface

```typescript
// POST /api/sessions/:id/messages
interface SendMessageRequest {
  content: string;
}

// Response is streamed via SSE
interface MessageEvent {
  type: 'routing' | 'section_start' | 'section_content' | 'section_complete' | 'done' | 'error';
  data: RoutingEvent | SectionEvent | DoneEvent | ErrorDetail;
}

interface RoutingEvent {
  message: string;        // "This looks like a target validation question..."
}

interface SectionEvent {
  sectionId: string;
  title: string;
  content: string;        // Incremental text (for streaming)
  confidence: EvidenceStrength;
  citations: Citation[];
  uncertainties?: Uncertainty[];
  conflict?: ConflictData;
}

interface ConflictData {
  topic: string;
  positions: [{
    position: string;
    summary: string;
    sources: Citation[];
  }, {
    position: string;
    summary: string;
    sources: Citation[];
  }];
}

interface DoneEvent {
  provenance: ProvenanceStep[];
  totalDuration: string;
  followUps: string[];
  reviewRequired?: {
    reviewerType: string;
    reason: string;
  };
}
```

## Target Assessment

```typescript
// GET /api/sessions/:id/outputs/target-assessment
interface TargetAssessmentResponse extends BaseResponse {
  target: {
    gene: string;
    variant?: string;
    indication: string;
  };
  overallConclusion: {
    text: string;
    confidence: EvidenceStrength;
    citations: Citation[];
  };
  supporting: Array<{
    text: string;
    confidence: EvidenceStrength;
    citations: Citation[];
  }>;
  contradicting: Array<{
    text: string;
    confidence: EvidenceStrength;
    citations: Citation[];
  }>;
  pathwayContext: {
    text: string;
    citations: Citation[];
    networkData?: any; // For visualization
  };
  evidenceGaps: Uncertainty[];
  suggestedNextSteps: string[];
  reviewRequired: {
    reviewerType: string;
    reason: string;
  };
  provenance: ProvenanceStep[];
}
```

## Variant Evidence Report

```typescript
// GET /api/sessions/:id/outputs/variant-report
interface VariantReportResponse extends BaseResponse {
  variant: {
    gene: string;
    proteinChange: string;    // e.g., "p.V600E"
    cdnaChange: string;       // e.g., "c.1799T>A"
    genomicLocation: string;  // e.g., "chr7:140753336"
    assembly: string;         // e.g., "GRCh38"
    dbSnpId?: string;
    variantType: string;      // e.g., "missense"
  };
  clinicalSignificance: {
    classification: string;   // e.g., "Pathogenic"
    reviewStatus: string;
    confidence: EvidenceStrength;
    citations: Citation[];
    text: string;
  };
  populationFrequency: {
    alleleFrequency: number | null;
    source: string;
    confidence: EvidenceStrength;
    citations: Citation[];
    text: string;
  };
  cancerActionability?: {
    evidenceLevel: string;
    therapies: string[];
    confidence: EvidenceStrength;
    citations: Citation[];
    text: string;
  };
  functionalImpact: {
    confidence: EvidenceStrength;
    citations: Citation[];
    text: string;
  };
  proteinContext: {
    domain: string;
    text: string;
    citations: Citation[];
  };
  reviewRequired: {
    reviewerType: string;
    reason: string;
  };
  provenance: ProvenanceStep[];
}
```

## Regulatory Brief

```typescript
// GET /api/sessions/:id/outputs/regulatory-brief
interface RegulatoryBriefResponse extends BaseResponse {
  product: {
    description: string;
    intendedUse: string;
    vertical: string;
  };
  pathwayRecommendation: {
    pathway: string;          // e.g., "De Novo"
    rationale: string;
    confidence: EvidenceStrength;
    citations: Citation[];
  };
  pathwayComparison: Array<{
    pathway: string;
    fit: string;
    timeline: string;
    keyRequirement: string;
  }>;
  evidenceReadiness: Array<{
    item: string;
    ready: boolean;
  }>;
  marketSizing: {
    tam: number;
    sam: number;
    som: number;
    assumptions: Array<{
      label: string;
      value: string;
      unit?: string;
      source?: string;
      editable: boolean;
    }>;
    citations: Citation[];
  };
  reimbursement: {
    text: string;
    uncertainties: Uncertainty[];
    citations: Citation[];
  };
  reviewRequired: {
    reviewerType: string;
    reason: string;
  };
  provenance: ProvenanceStep[];
}
```

## Cross-Domain Pipeline

```typescript
// POST /api/pipelines
interface CreatePipelineRequest {
  question: string;
  mode: 'science' | 'business';
}

interface CreatePipelineResponse extends BaseResponse {
  pipelineId: string;
  plan: Array<{
    stepId: string;
    label: string;
    description: string;
    estimatedDuration: string;
    requiresApproval: boolean;
  }>;
  estimatedTotalDuration: string;
  estimatedCost?: string;
}

// POST /api/pipelines/:id/approve
interface ApprovePipelineRequest {
  approved: boolean;
}

// GET /api/pipelines/:id/status (polling or SSE)
interface PipelineStatusResponse extends BaseResponse {
  steps: Array<{
    stepId: string;
    label: string;
    status: 'idle' | 'running' | 'completed' | 'partial' | 'failed' | 'awaiting_approval';
    detail?: string;
    duration?: string;
    output?: any; // Step-specific output shape
  }>;
  synthesis?: {
    text: string;
    confidence: EvidenceStrength;
    citations: Citation[];
  };
}
```

## Export

```typescript
// POST /api/sessions/:id/export
interface ExportRequest {
  format: 'pdf' | 'slides' | 'csv' | 'markdown' | 'docx';
  sections?: string[];    // Which output sections to include
  confidentiality: 'internal' | 'partner' | 'public';
}

interface ExportResponse extends BaseResponse {
  downloadUrl: string;
  expiresAt: string;
  warnings: string[];     // e.g., "2 evidence gaps remain unresolved"
  missingCitations: string[];
}
```

## Long-Running Task Pattern

For tasks that take more than a few seconds:

1. Client sends initial request, gets back a task ID and estimated duration
2. Client subscribes to SSE stream at `/api/tasks/:id/stream`
3. Server sends incremental events as work completes
4. Client can poll `/api/tasks/:id/status` as fallback
5. Partial results are returned even if some branches fail

```typescript
// Error shape for partial failures
interface PartialFailure {
  failedStep: string;
  error: ErrorDetail;
  recoveredResults: number;  // How many results were retrieved before failure
  expectedResults: number;   // How many were expected
  retrying: boolean;
}
```
