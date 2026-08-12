# Open Questions

Assumptions made during prototype design, phrased as questions for the customer.

---

## Branding and Identity

1. The prototype uses a simple "CEI" text mark in a navy square. Should the full CEI Gateway logo (with the bridge/arch mark) be used, or does CEI want a separate product identity for the dashboard?

2. Should the product be called "Founder AI Science Dashboard" (current), "CEI Science Dashboard," or something else?

3. The color palette is derived from ceigateway.com but adapted for data-density needs. Does CEI have formal brand guidelines with specific hex values, or is the website the source of truth?

---

## Provider and Infrastructure

4. The Settings page shows three AI providers (AWS Bedrock, Anthropic direct, OpenAI). Is the user selecting between these, or is this admin-level configuration invisible to founders?

5. The backend architecture diagram shows API key validation and subscription tokens. Should the prototype mock a login state, or is the demo always "logged in"?

6. Are there data sources that require per-user API keys (e.g., Benchling, Ginkgo Cloud Lab), versus shared keys the platform manages? This affects whether we show "Connect your Benchling account" in settings.

---

## Content and Scope

7. The requirements mention "confidentiality as a visible state." What are the actual confidentiality levels CEI uses? The prototype assumes: Internal only, Shareable with partners, Public. Is this correct?

8. The requirements state "require clear human approval for spending, safety-sensitive work, or irreversible actions." At prototype stage, should we mock cost estimates and approval modals, or leave these as the text description "Requires approval"?

9. For the patent/FTO screen, CEI's private patent vector database (~4,000 patents) is referenced. Should the prototype mock results from this, or only from public patent sources (PatentsView/Google Patents)?

10. The use case catalog notes Claude Science has no Windows client. Does CEI expect the dashboard to serve Windows users? This affects our responsive/platform testing scope.

---

## User and Audience

11. The scope doc names three specific stakeholders (Michelle Howard, Rob Howard, Don Weber). Are there other reviewers for the prototype who would have different expectations?

12. Should the onboarding flow show for every new user, or only on first visit? Can a user re-run it to change their profile/vertical?

13. The requirements mention "team" in several places (e.g., "allow results to be reviewed, saved, shared"). Is multi-user collaboration in scope for the prototype, or is this a single-user demo?

14. How many concurrent sessions should a user be able to maintain? The prototype assumes unlimited, with the most recent shown on the home dashboard.

---

## Workflow and Flow

15. When a cross-domain pipeline step fails, should the system automatically retry, wait for user instruction, or offer both options?

16. The "Answer a Big Question" pipeline shows a plan for approval. Is there a cost threshold above which approval is mandatory, or is approval always required for multi-step pipelines?

17. Should the export "Requires review before external use" gate be a hard block (cannot export until someone reviews) or a soft acknowledgment (user clicks "I understand")?

18. Should watchlist alerts be delivered only in-dashboard, or also via email/Slack? This affects the monitoring UI design.

---

## Data and Demo

19. The prototype uses TP53 R175H, BRAF V600E, and a cfDNA CRC diagnostic as sample scenarios. Are these acceptable for the stakeholder demo, or does CEI want scenarios from actual portfolio companies?

20. Should the demo include a scenario from each vertical (diagnostics, devices, therapeutics), or is the current mix (therapeutics + diagnostics) sufficient?

21. The use case catalog marks some capabilities as "compute-gated" (needing GPUs). How should the prototype represent a task that would require paid compute in production? As a note? As a cost estimate? As a gated flow?

---

## Timeline and Handoff

22. The scope doc shows a 7-week timeline. Is this prototype the "Week 1: UI/UX concepts" deliverable, or is it meant to carry through "Week 4: Founder workflow implementation"?

23. Who receives this prototype for engineering handoff? The API-CONTRACT.md document is shaped for a backend team, but should it be more or less detailed?

24. Does the CIC team prefer a specific component library or framework constraint beyond what was specified (React, TypeScript, Vite, Tailwind)?
