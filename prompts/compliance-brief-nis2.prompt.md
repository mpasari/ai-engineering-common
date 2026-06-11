---
mode: agent
description: "Layer 3 -- Certify. NIS2 Brief. Customers from essential or important entities (energy, telecoms, finance, health) who need to verify their ICT provider's NIS2 compliance. Reads NIS2_ASSESSMENT.md and generates a customer-shareable brief with readiness indicator. Open gaps are prominently flagged -- document is always generated but gaps are visible."
tools: [codebase, read, search, edit]
---

Do not greet. Execute immediately.

## Prerequisite check
Read docs/governance/PRODUCT_OVERVIEW.md.
If not found: "Run /compliance-scan first."

Read these assessment files:
- docs/governance/NIS2_ASSESSMENT.md

If any required assessment file is missing:
"[file] not found. Run /compliance-[standard] first."
[For executive summary: generate with whatever assessments are available]

## Step 1 -- Check open items
From the assessment files, collect all items in Section B where Status = OPEN.
Classify by criticality: Critical / High / Medium / Low.

## Step 2 -- Determine readiness
- READY TO SHARE: zero Critical items open
- SHARE WITH CAVEATS: Critical items open but generating with prominent flags
- NOT STARTED: no assessment files found

Always generate the brief. Never refuse. Make gaps impossible to miss.

## Step 3 -- Generate brief

Save to docs/governance/briefs/NIS2_BRIEF.md.
Create docs/governance/briefs/ if it does not exist.

```markdown
# NIS2 Brief
# Product: [from PRODUCT_OVERVIEW.md]
# Generated: [date] | Version: [N]
# Audience: Customers from essential or important entities (energy, telecoms, finance, health) who need to verify their ICT provider's NIS2 compliance.

---

## ⚠ READINESS INDICATOR

[If zero Critical items open:]
> ✓ READY TO SHARE
> All critical items resolved. [N] medium/low items remain -- see Section: Open Items.

[If Critical items open:]
> ⚠ SHARE WITH CAVEATS -- [N] CRITICAL ITEMS UNRESOLVED
> This document contains unresolved gaps marked throughout.
> Do not share externally without review by [Security Lead / DPO / Tech Lead].
> Critical items:
> - [ID]: [description] (Owner: [owner type])
> [list all Critical items]

---

1. Product scope in NIS2 context
2. Cybersecurity risk management approach
3. Incident classification and detection
4. Incident notification timelines
5. Business continuity and recovery
6. Supply chain security controls
7. Cryptography and authentication
8. Security testing and auditing
9. NIS2 compliance contact

[Generate each section in plain language for the target audience.
Where a gap exists, embed it inline with a visible marker:]

> ⚠ [GAP-Critical: description] -- unresolved, owner: [type]

[Where evidence exists but not confirmed:]
> ⚠ [VERIFY: description] -- pending confirmation

[Where item is resolved and confirmed:]
> ✓ [description] -- confirmed [date if available]

---

## Open Items Summary

| ID | Item | Criticality | Status | Owner type |
|---|---|---|---|---|
[All open items from Section B of source assessments]

---

## Document information
| Field | Value |
|---|---|
| Based on assessments | [list with dates] |
| Readiness status | [READY / SHARE WITH CAVEATS -- N critical] |
| Last updated | [date] |
| Review required by | [Security Lead / DPO / Tech Lead] |
| Next update | Run /compliance-update all then /compliance-brief-nis2 |
```

## Step 4 -- Tell the engineer
1. File saved: docs/governance/briefs/NIS2_BRIEF.md
2. Readiness: [READY / N Critical items flagged]
3. If gaps: list them and who needs to resolve each
4. Git commands:
```
git add docs/governance/briefs/NIS2_BRIEF.md
git commit -m "docs: nis2 brief generated

Readiness: [READY / N critical gaps]
Based on: [assessment files and dates]"
```
