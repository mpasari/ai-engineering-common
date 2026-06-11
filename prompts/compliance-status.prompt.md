---
mode: agent
description: "Maintenance -- Dashboard. Reads all compliance assessment files and briefs to produce a single status view showing where you stand across all standards, which items are open, and what the next action is. Run any time to see your compliance posture."
tools: [codebase, read, search, edit]
---

Do not greet. Execute immediately.

## Step 1 -- Read all compliance documents
Read every file that exists under docs/governance/:
- PRODUCT_OVERVIEW.md
- GDPR_ASSESSMENT.md
- EU_AI_ACT_ASSESSMENT.md
- ISO27001_ISMS.md
- NIS2_ASSESSMENT.md
- DORA_ASSESSMENT.md
- OWASP_ASSESSMENT.md
- briefs/DPA_BRIEF.md
- briefs/SECURITY_BRIEF.md
- briefs/AI_GOVERNANCE_BRIEF.md
- briefs/NIS2_BRIEF.md
- briefs/DORA_BRIEF.md
- briefs/EXECUTIVE_SUMMARY.md

For each file that exists, count:
- COMPLIANT items
- PARTIAL items
- GAP items (Critical / High / Medium / Low)
- VERIFY items (pending human confirmation)
- RESOLVED items

If a file does not exist, status = NOT STARTED.

## Step 2 -- Output the status dashboard

Print directly in chat (do not save to file -- this is always live output):

```
═══════════════════════════════════════════════════════════
COMPLIANCE STATUS  ·  [product name]  ·  [date]
═══════════════════════════════════════════════════════════

ASSESSMENTS
───────────────────────────────────────────────────────────
Standard       Progress   Compliant  Partial  GAP-C  GAP-H  GAP-M  GAP-L  VERIFY
GDPR           [bar 0-100%] [N]       [N]      [N]    [N]    [N]    [N]    [N]
EU AI Act      ...
ISO 27001      ...
NIS2           ...
DORA           ...
OWASP LLM      ...

(C=Critical  H=High  M=Medium  L=Low)

BRIEFS READY TO SHARE
───────────────────────────────────────────────────────────
DPA Brief          [✓ READY / ⚠ N gaps / ✗ NOT STARTED]
Security Brief     [✓ READY / ⚠ N gaps / ✗ NOT STARTED]
AI Governance      [✓ READY / ⚠ N gaps / ✗ NOT STARTED]
NIS2 Brief         [✓ READY / ⚠ N gaps / ✗ NOT STARTED]
DORA Brief         [✓ READY / ⚠ N gaps / ✗ NOT STARTED]
Executive Summary  [✓ READY / ⚠ N gaps / ✗ NOT STARTED]

OPEN CRITICAL ITEMS (must resolve before any brief is clean)
───────────────────────────────────────────────────────────
[ID]  [Standard]  [Description]  [Owner type]

NEXT RECOMMENDED ACTION
───────────────────────────────────────────────────────────
[Single most important action to take right now, with the command to run]

═══════════════════════════════════════════════════════════
```

If no compliance files exist at all:
"No compliance assessments found. Start with: /compliance-scan"
