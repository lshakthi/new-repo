# Demo Script

Three end-to-end click paths for stakeholder review. Each takes under four minutes and requires no typing.

---

## Demo 1: Science Path (Target Validation)

**Persona**: Dr. Sarah Chen, therapeutics founder, Science mode
**Question**: "Is TP53 R175H worth pursuing as a therapeutic target?"
**Duration**: ~3 minutes

### Steps

1. **Start at Home** (`/`)
   - Point out: welcome greeting, recent sessions, alerts panel showing competitor trial change and new publication.
   - Note the mode switch is set to "Science."

2. **Click "TP53 target validation" session** (first item in recent sessions)
   - Lands on Research page (`/research`)
   - Show: the original question, the routing message ("This looks like a target validation question..."), and the structured response.

3. **Walk through the response sections**:
   - Section 1 (Variant identity): Note the "Strong evidence" badge and the ClinVar/COSMIC citation chips.
   - Section 3 (Therapeutic approaches): Note the "Moderate evidence" badge and the uncertainty block explaining what would resolve it.
   - Section 4 (Competitive landscape): Show the Source Conflict View where experts disagree on druggability. Point out both positions are shown with their respective citations.

4. **Click a citation chip** (e.g., "PMID 38291045")
   - Evidence panel slides in from right. Show the source title, authors, journal, and the specific relevant passage.
   - Point out: two clicks from claim to source verification.

5. **Show the Review Gate**
   - Scroll to the orange banner: "Qualified review recommended: oncologist or clinical geneticist."
   - Note: it names the specific expert type and cannot be dismissed.

6. **Show the Provenance Trail**
   - Expand "What I did": six steps, six different databases queried, total duration 38 seconds.
   - Note: every query is logged, every source named.

7. **Navigate to Target Assessment** (`/target-assessment`)
   - Show the scorecard layout: overall conclusion, supporting evidence, contradicting evidence, pathway context, evidence gaps.
   - Point out: assumptions are clearly stated, gaps name what would resolve them.

---

## Demo 2: Business Path (Regulatory Strategy)

**Persona**: Same founder, switching to Business mode
**Question**: "What FDA pathway fits our cfDNA liquid biopsy?"
**Duration**: ~3 minutes

### Steps

1. **Switch to Business mode** (click "Business" toggle in top bar)
   - Note: nothing reloads, no state is lost, just the mode indicator changes.

2. **Navigate to Regulatory Brief** (`/regulatory`)
   - Show the pathway recommendation: "De Novo classification is the most likely pathway."
   - Note the citation chips linking to FDA precedent (DEN200081).

3. **Walk through the pathway comparison table**
   - Four pathways compared: De Novo (best fit), 510(k) (unlikely), PMA (overly burdensome), LDT (interim option).
   - Point out: plain language, not regulatory jargon. Timeline estimates included.

4. **Show the evidence readiness checklist**
   - 3 of 8 items ready. Five items flagged as needing attention.
   - Note: this is actionable. The founder knows exactly what to do.

5. **Interact with the market sizing model**
   - Show the editable assumptions: prevalence, test price, adoption rate.
   - Click the edit icon on "Assumed adoption rate" and change from 15% to 20%.
   - Note: the SOM updates live. Every number is traceable to its assumption.

6. **Show the Review Gate**
   - "Regulatory affairs consultant and reimbursement specialist should review this."
   - Note: decision support framing is consistent throughout.

7. **Show the Export Card**
   - Formats available: PDF, Slides, Markdown, Word.
   - Warnings displayed: "5 evidence gaps unresolved," "Market assumptions should be reviewed."
   - Note: the system warns you before you export incomplete work.

---

## Demo 3: Cross-Domain Pipeline (The Flagship)

**Persona**: Same founder, deciding whether to commit resources
**Question**: "Build the complete case for TP53 R175H, from variant evidence through competitive landscape."
**Duration**: ~4 minutes

### Steps

1. **Navigate to Pipeline** (`/pipeline`)
   - Show the proposed work plan: seven connected steps, clear descriptions.
   - Note: "Estimated time: 8-12 minutes. No spend required."

2. **Click "Approve and start"**
   - The plan disappears, replaced by the Task Progress component.
   - Show: steps 1-4 completed (with durations), step 5 partial, step 6 running, step 7 idle.

3. **Show the partial failure**
   - Orange banner: "PatentsView API timed out. 23 of ~40 expected results were retrieved."
   - Note: the failure is named, not hidden. The user knows exactly what is incomplete.

4. **Walk through completed branch summaries**
   - Variant evidence (Strong): ClinVar, gnomAD, COSMIC all checked.
   - Structural impact (Moderate): R175H destabilizes the DNA-binding domain. Placeholder for 3D view.
   - Target validation (Moderate): Open Targets score 0.89, DepMap data, but tractability score is lower.
   - Compound landscape (Moderate): 12 known compounds, APR-246 most advanced, no R175H-specific molecule in clinic.

5. **Show the pending synthesis**
   - Note: the system will not generate a recommendation until all branches complete. It does not rush to a conclusion with incomplete data.

6. **Show the Review Gate and Export Card**
   - Review gate names "scientific advisory board or target-selection committee."
   - Export warnings list: patent search incomplete, trial landscape still running, synthesis pending.
   - Note: the export explicitly prevents sharing incomplete work without acknowledgment.

7. **Key takeaway for stakeholders**
   - One question produced a connected, multi-source decision package.
   - The user approved a plan, watched progress, saw a failure named honestly, and can export a partial result or wait for completion.
   - No tools, APIs, or compute were selected by the user at any point.

---

## Bonus: Quick Navigation Demo (30 seconds)

- From any screen, type in the top bar ask field.
- Show the Task Launcher (`/tasks`): expand a group, see task descriptions and example queries.
- Show Onboarding (`/onboarding`): three steps, ends with a real first task.
- Show Settings (`/settings`): provider connections, data source health, confidentiality controls.
