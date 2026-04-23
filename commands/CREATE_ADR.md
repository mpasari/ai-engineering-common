# CREATE_ADR.md
# Command: CREATE_ADR
# Category: Architecture
# Agent: A31 Architecture Doc Agent
# Version: 1.0.0

---

## What this command does

Scaffolds a new Architecture Decision Record in Confluence with the
standard ADR structure (Context, Decision, Options, Consequences).
Adds it to the ADR index in Proposed status pending Architect review.

---

## When to use it

- A significant architectural decision needs to be documented
- At greenfield project setup (initial ADR set)
- When reversing or superseding a previous decision

---

## Required inputs

```
ADR title (required)
Context description (optional -- can fill in manually)

Example: CREATE_ADR "Use PostgreSQL for the orders service database"
         CREATE_ADR "Adopt Kafka for all async communication"
```

---

## Usage

```
CREATE_ADR "Use event sourcing for the order aggregate"
```

---

## Output

- Confluence ADR page: ADR-NNN -- [title]
  Status: Proposed
  Sections: Context, Decision (blank), Options A/B/C (blank), Consequences
- ADR index updated with new entry in Proposed section
- Jira task created: "Review and finalise ADR-NNN"

---

## Notes

- ADR content must be filled in by the engineer and Architect
- Status moves from Proposed to Accepted after Architect approval (gate B05)
- The agent scaffolds structure -- humans author the decisions
