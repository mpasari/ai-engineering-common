---
mode: agent
description: Update the existing ISO27001_ISMS.md document after code changes or gap resolutions. NEVER overwrites [VERIFIED], [RESOLVED], or [N/A] lines. Only updates sections affected by recent codebase changes and appends new gaps from TECH_DEBT_REGISTRY.md.
tools:
  - githubRepo
  - codebase
  - edit
  - execute
  - read
  - search
  - jira-mcp
---

Do not greet the user. Execute immediately.

## Critical rules

NEVER overwrite any line containing:
- [VERIFIED by
- [RESOLVED:
- [N/A:

These are human decisions. They are permanent until a human changes them.

## Step 1 -- Verify the document exists

Read docs/governance/ISO27001_ISMS.md.
If it does not exist -- stop and say:
"ISO27001_ISMS.md not found. Run /generate-iso27001 first to create it."

## Step 2 -- Identify what changed

Read the "Last updated" date from the document header.
Run git log --since=[last updated date] --name-only to find changed files.

For each changed file identify the affected ISMS sections:
- app/services/* app/utils/* → A.8 controls in Section 3, Section 5
- app/config/*               → A.8.9, A.9 controls
- INTEGRATION_MAP.md         → A.5.19, A.5.20, Section 5.3
- DATA_MODEL.md              → A.8.10, A.8.11, Section 5, Section 7
- TECH_DEBT_REGISTRY.md      → Section 7 gap table
- pyproject.toml / uv.lock   → A.8.8, A.5.21, Section 5.7
- .github/workflows/*        → A.8.29, Section 5.8

If no relevant files changed -- state:
"No codebase changes since [date] affect the ISMS document. No update needed."
Stop.

## Step 3 -- Update only affected sections

For each affected section:
- Re-assess the relevant controls from the codebase
- Update evidence references if they changed
- Add new [GAP] items if new issues are found
- Do NOT touch any [VERIFIED], [RESOLVED], or [N/A] lines
- Do NOT change any line a human has manually edited

For new gaps found -- append to Section 7 gap table with next available GAP-NNN ID.

## Step 4 -- Update the changelog and header

Add a new row to the changelog table:

| [today's date] | /update-iso27001 | [brief description of what changed] |

Update the "Last updated" date in the document header.

## Step 5 -- Tell the engineer

State:
1. Sections updated: [list]
2. New gaps found: [N] (descriptions)
3. Evidence references updated: [N]
4. Items that could not be auto-updated (need human review): [list]
5. Git commands:

```
git add docs/governance/ISO27001_ISMS.md
git commit -m "docs: update ISO27001_ISMS.md

Changed sections: [list]
New gaps: [N]
Triggered by: [list of changed files]"
```
