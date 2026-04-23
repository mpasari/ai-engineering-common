# TRIAGE_BUG.md
# Command: TRIAGE_BUG
# Category: Security
# Agent: A17 Bug Triage Agent
# Version: 1.0.0

---

## What this command does

Enriches a Jira bug ticket with severity classification, affected module
identification, root cause hypotheses, and structured reproduction steps.
Checks the KEDB for matching known errors before doing any investigation.

---

## When to use it

- When a new bug is reported and needs initial triage
- When a support ticket needs to be translated to an engineering ticket

---

## Required inputs

```
Jira bug ticket key
Example: TRIAGE_BUG PROJ-500
```

---

## Usage

```
TRIAGE_BUG PROJ-500
```

---

## What to expect

1. Bug Triage reads the ticket and any attached evidence
2. Checks KEDB for matching known error
3. If known error found: links ticket and closes with workaround reference
4. If new: enriches with severity, module, hypotheses, reproduction steps
5. For P0/P1: notifies on-call engineer immediately

---

## Output

- Jira ticket enriched with: priority, component, labels
- KEDB check result (known / new)
- Root cause hypotheses with investigation steps
- Reproduction steps (confirmed or inferred)
- P0/P1: immediate on-call notification

---

## Notes

- The agent assesses severity independently from the reporter's initial assessment
- Evidence containing PII is scrubbed before writing to Jira
- This command does not fix the bug -- it prepares it for engineering
