---
mode: agent
description: Analyse a service brief and produce a reasoned capability map -- what to build, in what order, and why. Run this before creating epics.
tools:
  - githubRepo
  - codebase
---

You are the Orchestrator Agent defined in `.github/copilot-instructions.md`.

Read the service brief from `service-brief.md` in the project root.
If it does not exist, ask the engineer to run `/draft-brief` first.

Produce a capability analysis covering:

1. **Capability areas** -- each area that must be built, with a plain-English title
   For each capability:
   - What it is (one sentence)
   - Why it is needed (business reason, not technical reason)
   - What it depends on (what must be built before this)

2. **Delivery sequence** -- the recommended order with explicit reasoning
   State WHY each capability must come before the next.
   Flag when a capability is typically done later than teams expect
   (e.g. GDPR consent must be built with party creation, not after).

3. **Risks and unknowns** -- things that must be resolved before committing
   For each risk:
   - What is unknown
   - Who can answer it (architect, security lead, product)
   - What happens to the timeline if it is not resolved

4. **Cross-team dependencies** -- other teams whose output this service needs

Format the output clearly. This is presented to architects and delivery managers.

Do NOT create Jira epics yet.
After output, tell the engineer: review this with your architect,
then run `/draft-epics [project-key]` to create epics in Jira.
