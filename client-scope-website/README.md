# Client Project Scope Website

A standalone, client-facing scoping document derived from `../Context/notes.md`.

## Scope model

- **In Scope:** Reach Goals 1–4 — evidence lookup, document drafting, monitoring, and the connected pipeline.
- **Future Enhancements:** Stretch Goal 5 — approved, repeatable large calculations after the core foundation is stable.
- **Shared standards:** source traceability, visible confidence, explicit assumptions, human review, and workflow provenance.

## Run locally

No dependencies or build step are required. Open `index.html` directly in a browser.

For a local HTTP server, from this directory run:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Discussion features

- Switch between separate **Current scope** and **Future scope** tabs.
- Review a simple overview of all ten planned API integrations in the Current scope tab.
- Expand each reach goal to review its capabilities and intended outcome.
- Use **Print scope** for a clean printable/PDF version.

## Source documents

Primary: `Context/notes.md`. Product posture and safeguards were cross-checked against `Context/simplified-requirements-for-cs-stakeholders.md`. This page is a planning boundary, not a representation of completed functionality.
