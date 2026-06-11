---
mode: agent
description: "Maintenance -- Update one or all compliance assessment documents after code changes or governance decisions. Usage: /compliance-update [gdpr|ai-act|iso27001|nis2|dora|owasp|all]. Reads git log since last update, re-scans affected sections, syncs Section B open items, reads new PRODUCT_GOVERNANCE.md decisions. NEVER overwrites Section C (Resolution Log) or any [CONFIRMED]/[RESOLVED]/[N/A] lines."
tools: [codebase, read, search, edit, execute]
---

Do not greet. Execute immediately.

## Step 1 -- Determine scope
Parse the argument: gdpr | ai-act | iso27001 | nis2 | dora | owasp | all

If 'all': update every assessment file that exists under docs/governance/.
If a specific standard: update that file only.

## Step 2 -- For each target file

### 2a -- Verify the file exists
If docs/governance/[STANDARD]_ASSESSMENT.md (or ISO27001_ISMS.md) does not exist:
"[file] not found. Run /compliance-[standard] first to generate it."
Skip this file, continue with others if 'all'.

### 2b -- Read the existing document
Note the "Last updated" date from the header.
Read the entire document. Identify all [CONFIRMED], [RESOLVED], and [N/A] lines -- these are LOCKED.

### 2c -- Identify what changed in the codebase
Run: git log --since="[last updated date]" --name-only --pretty=format:""
Filter to relevant files for this standard:

GDPR / ISO27001: app/services/ app/utils/ app/config/ INTEGRATION_MAP.md DATA_MODEL.md
AI_ACT: app/services/ (LLM calls) PRODUCT_GOVERNANCE.md
NIS2 / DORA: INTEGRATION_MAP.md PRODUCT_GOVERNANCE.md .github/workflows/
OWASP: app/services/ app/utils/ (any file with LLM calls, logging, auth)

If no relevant files changed:
"No changes since [date] affect [standard]. No update needed."
Still update Section D statistics and Last updated date.

### 2d -- Re-assess changed sections only
For each changed file, re-assess the controls it affects.
Update only those rows in Section A.
Rules:
- If a row was [CONFIRMED by ...]: DO NOT TOUCH IT even if codebase changed
- If a row was [RESOLVED: ...]: DO NOT TOUCH IT
- If a row was [N/A: ...]: DO NOT TOUCH IT
- If a row was [GAP-*] and the codebase now shows evidence: change to [VERIFY: confirm fix in file:line]
- If a row was COMPLIANT and evidence has been removed: change to [GAP-High: previously evidenced control no longer found]
- If a new file introduces a new gap: add a new row

### 2e -- Read PRODUCT_GOVERNANCE.md for new decisions
Compare current PRODUCT_GOVERNANCE.md to what was in place at last update.
For any new retention periods, DPA confirmations, lawful basis decisions:
- Find the matching gap in Section A
- Change from [GAP-*] to [VERIFY: confirm [field] decision matches PRODUCT_GOVERNANCE.md entry at [line]]

### 2f -- Regenerate Section B from Section A
Read every GAP-* and VERIFY item in Section A.
Remove from Section B any items that are now [CONFIRMED], [RESOLVED], or [N/A].
Add any new GAP-* or VERIFY items found in Section A.
Keep existing OPEN status for unchanged items.

### 2g -- Update Section D statistics
Recount all status values in Section A.
Update the compliance percentage and gap counts.
Update "Last updated" date.
Update "Brief readiness" based on whether any Critical items remain open.

### 2h -- Add changelog entry
Add a row to the Changelog:
| [today] | /compliance-update [standard] | [brief description of what changed] |

## Step 3 -- Tell the engineer
For each file updated:
1. What sections changed
2. New gaps found (if any)
3. Items that moved from GAP to VERIFY (code fixes found)
4. Items that still need human resolution
5. Git commands:
```
git add docs/governance/[files changed]
git commit -m "docs: update compliance assessments

Standards updated: [list]
New gaps: [N]
Resolved by code: [N]
Trigger: [files changed in recent commits]"
```
