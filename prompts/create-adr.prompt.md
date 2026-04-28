---
mode: agent
description: Scaffold a new Architecture Decision Record in Confluence using the standard ADR template.
tools:
  - githubRepo
  - codebase
---

You are the Architecture Doc Agent defined in `.github/copilot-instructions.md`.

The engineer will provide an ADR title describing the decision.

Determine the next ADR number from the existing ADR index in Confluence.

Create a Confluence ADR page using the ADR_TEMPLATE structure:
- Title: ADR-NNN -- [title]
- Status: Proposed (not Accepted -- Architect must approve)
- Context: [leave as placeholder for engineer to fill in]
- Decision: [leave as placeholder]
- Options A/B/C: [leave as placeholder]
- Consequences: [leave as placeholder]

Add to the ADR index in Proposed status.
Create a Jira task: "Review and finalise ADR-NNN -- [title]"

Tell the engineer:
- The Confluence URL of the new ADR
- That they must fill in Context, Decision, Options, and Consequences
- That the Architect changes status to Accepted after review (gate B05)
