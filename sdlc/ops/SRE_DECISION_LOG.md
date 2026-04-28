# SRE_DECISION_LOG.md
# SDLC -- Ops Stage -- SRE Agent Decision Log
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + SRE Lead
#
# This file template is used by:
#   - SRE Agent (A38) -- writes a new entry per decision cycle
#
# In production: this file lives in Confluence (OPS space) and is
# updated by the SRE Agent via T-CONF-03 (Confluence update tool).
# This template shows the format of each entry.

---

## Log format

Each entry written by the SRE Agent follows this structure:

```markdown
## [ISO 8601 timestamp UTC] -- [Service name]

**Cycle:** [Observation cycle number]
**Signal:** [Alert name or metric] -- [Current value] vs [SLO threshold]
**Suppression check:** [Not suppressed / Suppressed by KEDB-NNN]
**Tier decision:** [1 / 2 / 3 / 4 / No action]
**Tier reason:** [One sentence explaining why this tier was chosen]

**Action taken:** [Description of Kubernetes operation, or "None"]
**Action outcome:** [Metric value 60 seconds after action, or "Pending"]

**HITL gate:** [None / A07 raised / A08 raised / A09 raised]
**Jira ticket:** [None / PROJ-NNN created]

---
```

---

## Log retention

The decision log is append-only. Entries are never modified or deleted.
Retention: 90 days (rolling). Entries older than 90 days are archived
to Azure Blob Storage by an automated job.

---

## Accessing the log

In production: Confluence > OPS space > SRE Decision Log
Direct URL: [update with Confluence URL when created]

For incident investigation, filter by service and time range:
```
Site:OPS AND title:"SRE Decision Log"
# Then use browser search (Ctrl+F) for service name + date range
```

---

## Log review

The SRE Lead reviews the decision log monthly for:
- Actions that did not resolve the signal (repeated Tier 1 = Tier 2)
- Tier 3 signals that should have suppression rules
- Gaps in coverage (signals not caught by registered panels)

Findings from the log review are added to TECH_DEBT_REGISTRY.md
or raise a new KEDB entry via the Problem Management Agent.

---

## Version and review

| File owner | CoE Core + SRE Lead |
| Review cadence | Monthly |
