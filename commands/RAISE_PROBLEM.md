# RAISE_PROBLEM.md
# Command: RAISE_PROBLEM
# Category: Operations
# Agent: A40 Problem Management Agent
# Version: 1.0.0

---

## What this command does

Creates a KEDB problem record for a recurring issue. Manages the full
lifecycle: root cause documentation, fix decision (fix now / defer /
accept), workaround page creation, and SRE suppression rule to prevent
alert fatigue.

---

## When to use it

- Same incident pattern has recurred 3+ times
- After a post-mortem identifies a systemic issue
- When an on-call alert keeps firing for a known issue

---

## Required inputs

```
One of:
  -- Incident ticket keys: RAISE_PROBLEM PROJ-INC-001, PROJ-INC-002
  -- Brief description: RAISE_PROBLEM "Memory leak on batch job startup"
  -- Jira alert ticket: RAISE_PROBLEM PROJ-ALERT-045
```

---

## Usage

```
RAISE_PROBLEM PROJ-INC-001, PROJ-INC-002, PROJ-INC-003

or

RAISE_PROBLEM "Orders service high latency on Monday mornings"
```

---

## What to expect

1. Problem Management checks KEDB for existing record (prevents duplicates)
2. Creates Jira Problem ticket (KEDB-NNN)
3. Creates Confluence KEDB page with symptom and evidence
4. Presents gate E03 for Tech Lead root cause confirmation
5. Presents gate E01 for fix decision (fix / defer / accept)
6. Writes SRE suppression rule after decision
7. Creates review reminder for 6 months

---

## Output

- Jira Problem ticket: KEDB-NNN
- Confluence KEDB page with workaround
- SRE suppression rule (after fix decision)
- Cleanup reminder task

---

## Notes

- Accepted known errors are reviewed every 6 months -- never permanent
- Option A (fix now) creates a Jira story in the current sprint
- Option C (accept) requires written justification at gate E01
