# Design Rationale

## Information Architecture

The dashboard is organized around **what the founder wants to accomplish**, never around which tool performs the work.

### Four-Layer Model (from requirements)

1. **Evidence layer** (invisible to user): literature databases, public biomedical APIs, private patent data
2. **Analysis layer** (invisible to user): sequence, structure, variant, omics, target, compound, and business/regulatory workflows
3. **Orchestration layer** (visible only as progress): routing, compute, provenance, failure handling, safety gates
4. **Delivery layer** (primary user surface): research briefs, scorecards, evidence reports, planning documents, figures, and interactive views

### Global Shell

- **Left rail**: navigation (home, task launcher, research, history, library, watchlist, workspaces, settings) plus recent sessions
- **Top bar**: universal ask field, mode switch (Science/Business), connection health indicator, profile
- **Evidence panel**: slides in from right when a citation is clicked, showing source detail without losing reading position in the main content
- **Main content**: varies by route, always scrollable

### Task Taxonomy

Seven groups organized by outcome:

| Group | Founder language | Source use cases |
|-------|-----------------|-----------------|
| Understand the Science | Research, sequence check, data prep | #1-5, #6-10, #118-128 |
| Validate a Target | Target assessment, variant interpretation, omics | #17-31, #43, #96-101 |
| Look at Molecules | Structure prediction, compound ranking | #11-16, #32-39, #91-93 |
| Map the Path to Market | Regulatory, clinical landscape, patents | #40, #42, #56-66, #102-105, #126 |
| Watch the Landscape | Competitor and ecosystem monitoring | #67-71, #117 |
| Produce a Deliverable | Documents, figures, investor materials | #47, #50-55, #72-76, #112-113 |
| Answer a Big Question | Cross-domain evidence pipeline | #77-78, #80 |

## Task Routing Model

The "just ask" input is the primary entry. When a user types a question:

1. System classifies the intent (displayed lightly to the user)
2. System determines which task type, databases, and analysis steps are needed
3. If ambiguous, asks one clarifying question with a default
4. Task executes, tools remain invisible, progress is visible

The user never selects a tool, model, API, or compute configuration.

## Evidence and Uncertainty Patterns

### Citation-first design

Every substantive claim carries an inline CitationChip. Clicking it opens the evidence panel showing the specific supporting passage. Two clicks from claim to source verification.

### Confidence as layout, not footnote

ConfidenceBadge appears at the section level. Five states: Strong, Moderate, Limited, Conflicting, Missing. Each is paired with both an icon and a label (never color alone).

### Conflict surfacing

When sources disagree, SourceConflictView presents both positions side-by-side with their respective supporting citations. The user sees the disagreement without the system hiding it.

### Uncertainty as actionable

UncertaintyBlock names what is unknown AND what would resolve it. Never just "this is uncertain."

### Review gates

ReviewGate is a layout element, not disclaimer text. It appears where the high-impact claim lives, names the type of expert needed, and cannot be dismissed (only acknowledged).

## Two-Mode Approach

Science mode and Business mode share the same:
- Session model and workspace
- Evidence panel and citation system
- History and deliverables library
- All task groups (nothing is locked)

They differ in:
- Default task group ordering (science leads with research/validation; business leads with regulatory/landscape)
- Output format defaults (science: full methods; business: executive summary)
- Reading level (science: technical with glossary links; business: plain language, jargon explained inline)
- Export defaults (science: data/figures/notebooks; business: slides/memos/data room sections)

Switching modes never loses session state.

## Screen-to-Use-Case Mapping

| Screen | Primary use cases served |
|--------|------------------------|
| Conversational Research | #1-5, #81-85, #116 (research questions) |
| Target Assessment | #7 (target validation) |
| Variant Evidence Report | #5 (variants and mutations) |
| Regulatory Brief | #10 (path to market) |
| Pipeline | #16 (cross-domain) |
| Task Launcher | Entry for all 16 |
| Home Dashboard | Session continuity, alerts from #14 |
| Settings | Provider config, data handling |
| Onboarding | First-time guided setup |

## What Was Deliberately Left Out

- **Heavy molecular rendering**: No 3D viewer library. Structure views use clear placeholder boxes. Adding Mol* or NGL would add weight without demonstrating the interaction pattern.
- **Real authentication flow**: No auth provider. Profile is mocked.
- **Full watchlist/monitoring config**: Placeholder page. The pattern is clear from the alerts on the home dashboard.
- **Deliverable builder wizard**: Export cards demonstrate the concept. A full drag-and-drop document builder would be a separate sprint.
- **Compute cost estimation and approval modal**: Referenced in the pipeline page's approval step, but a production implementation would need real pricing data.
- **Mobile layout**: The audience is desktop-first (lab workstations, office). Tablet breakpoints are handled in CSS but not fully tested.

## Design System

### Typography
- Inter for all UI text (clean, legible at small sizes, wide weight range)
- JetBrains Mono for identifiers, sequences, variant notation, code

### Color System
Semantic tokens tied to meaning:
- Evidence strength: teal (strong), amber (moderate), red (weak), purple (conflict), gray (missing)
- Status: orange (review required), indigo (confidential), green (success/connected)
- Surfaces: warm off-white base, white elevation, subtle borders

### Primitive Components
Ten reusable primitives that compose into all output screens:
CitationChip, ConfidenceBadge, ReviewGate, ProvenanceTrail, UncertaintyBlock, AssumptionInput, SourceConflictView, TaskProgress, StreamingText, ExportCard
