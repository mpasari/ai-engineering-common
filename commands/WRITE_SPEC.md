# WRITE_SPEC.md
# Command: WRITE_SPEC
# Category: Specification
# Agent: A07 Spec Writer Agent
# Version: 1.0.0

---

## What this command does

Generates a structured technical specification in Confluence from an
approved Jira story. Runs pre-spec compliance checks, checks for
conflicts with existing specs, and presents gate C01 for Tech Lead review.

---

## When to use it

- Story is in Ready state and gate C01 spec approval is required
- Before code generation begins on any non-trivial story

---

## Required inputs

```
Jira story key (required)
Example: WRITE_SPEC PROJ-412
```

---

## Usage

```
WRITE_SPEC PROJ-412
```

---

## What to expect

1. Spec Writer reads story, ACs, and linked context
2. Runs pre-spec compliance checks (GDPR, DPA, auth changes)
3. Searches for existing spec conflicts
4. Generates spec using standard template in Confluence
5. Presents gate C01 for Tech Lead approval
6. After C01: Orchestrator routes to Code Gen Agent

---

## Output

- Technical spec page in Confluence (ENG space)
- Jira story updated with spec link
- Gate C01 presented for Tech Lead review
- Any compliance gaps raised as separate Jira tasks

---

## Notes

- Stories with personal data fields trigger pre-spec GDPR checks
- New integrations trigger DPA verification (gate B02)
- Auth changes trigger Security Lead spec review (gate C05)
- Spec is not overwritten after approval -- status footer updated only
