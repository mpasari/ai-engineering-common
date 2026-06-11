# AI Engineering Commons — Compliance Playbook
# Version: 1.0
# Owner: CoE Core
# Last updated: 2026-06-11
#
# This playbook covers the complete compliance journey for a software product
# operating in the European market. It covers GDPR, EU AI Act, ISO 27001,
# NIS2, and DORA using the /compliance-* command family.
#
# Scope: product-level compliance -- not organisational certification.
# The commands assess what THIS product does, not your organisation's ISMS.

---

## Overview

The compliance commands are organised in three layers:

```
Layer 1 -- Understand
  /compliance-scan              Produces PRODUCT_OVERVIEW.md (prerequisite for all)

Layer 2 -- Assess
  /compliance-gdpr              GDPR assessment
  /compliance-ai-act            EU AI Act assessment
  /compliance-iso27001          ISO 27001 full ISMS (all 93 controls)
  /compliance-nis2              NIS2 Article 21 measures
  /compliance-dora              DORA ICT risk management
  /compliance-owasp             OWASP LLM Top 10

Layer 3 -- Certify / Share
  /compliance-brief-dpa         For legal/procurement teams
  /compliance-brief-security    For security teams/CISOs
  /compliance-brief-ai          For compliance/risk teams
  /compliance-brief-nis2        For regulated sector customers
  /compliance-brief-dora        For financial sector customers
  /compliance-brief-executive   For board/executive audiences

Maintenance
  /compliance-update [standard or all]   Update after code changes
  /compliance-status                     Dashboard -- where you stand
```

---

## Before you start -- configure PRODUCT_GOVERNANCE.md

**This is the most important step. Do it before running any command.**

`PRODUCT_GOVERNANCE.md` stores governance decisions that cannot come from code:
lawful basis, retention periods, SLA targets, processor DPA status, AI provider
data handling, applicable regulations. Every compliance command reads it.

Without it filled in, commands generate `[CONFIRM]` placeholders.
With it filled in, documents come out substantially complete.

```powershell
cd [your-repo]
code .ai\project\PRODUCT_GOVERNANCE.md
```

**Fill in these fields as a minimum before running compliance commands:**

```
[ ] Product name, product owner, Tech Lead, Security Lead, DPO contact
[ ] Applicable regulations (GDPR yes/no, EU AI Act yes/no + risk category,
    NIS2 yes/no, DORA yes/no)
[ ] GDPR lawful basis for each processing activity
[ ] Data retention period for each entity in DATA_MODEL.md
[ ] DPA status for each processor in INTEGRATION_MAP.md
[ ] LLM provider name and whether they retain prompt data
[ ] SLA targets (availability, RTO, RPO)
[ ] Supervisory authority contact
```

Fields you cannot answer yet -- leave as `[placeholder]`.
The commands will flag them as `[VERIFY]` items.

**Commit before running any compliance commands:**

```powershell
git add .ai\project\PRODUCT_GOVERNANCE.md
git commit -m "chore: fill in PRODUCT_GOVERNANCE.md for compliance commands"
```

---

## Phase 1 — Understand (run once)

### Step 1 -- Run the product scan

**Who:** Tech Lead
**Time:** 15-20 minutes
**When:** Once, before any assessment

In Copilot Chat Agent mode:

```
/compliance-scan
```

**What it does:**
Reads all `.ai/project/` files and scans the codebase to produce a
plain-language summary of what the product does, what data it processes,
what AI components it uses, and what external systems it connects to.

**Output:** `docs/governance/PRODUCT_OVERVIEW.md`

**Before continuing:**
Read PRODUCT_OVERVIEW.md. Verify accuracy with the Tech Lead.
Correct anything that is wrong -- assessments built on an inaccurate
overview will have inaccurate findings.

```
[ ] System description is accurate
[ ] Personal data categories are correctly identified
[ ] All external processors are listed
[ ] AI components are correctly described
[ ] Applicable regulations are correctly inferred
```

**Commit:**
```powershell
git add docs/governance/PRODUCT_OVERVIEW.md
git commit -m "docs: compliance scan -- product overview"
```

---

## Phase 2 — Assess

Run assessments in priority order based on your immediate customer needs.
If a financial sector customer is asking -- run GDPR, DORA, and ISO 27001 first.
If an AI governance question -- run EU AI Act and OWASP first.
If no specific driver -- run in the order below.

### Step 2a -- GDPR assessment

**Who:** Tech Lead + DPO review of findings
**Time:** 10-15 minutes to generate, then DPO review time for decisions

```
/compliance-gdpr
```

**Output:** `docs/governance/GDPR_ASSESSMENT.md`

**Four sections:**
- **Section A -- Findings:** Every GDPR requirement assessed. Status per requirement.
- **Section B -- Open Items:** Auto-generated list of all gaps with criticality and owner type.
- **Section C -- Resolution Log:** Fill in when gaps are resolved. Never overwritten.
- **Section D -- Status:** Compliance percentage and brief readiness.

**After generating:**
1. Read Section B. Send `[GAP-Critical]` items to DPO immediately.
2. For each `[GAP-Critical]` with owner type `DPO decision` -- schedule a decision
3. For each `[GAP-Critical]` with owner type `Engineer` -- create a Jira story
4. Type `APPROVED C01 GDPR` to auto-create Jira stories for Critical/High gaps

**When DPO makes a retention or lawful basis decision:**
1. Update `.ai/project/PRODUCT_GOVERNANCE.md` with the decision
2. Commit the update via PR
3. Run `/compliance-update gdpr` to sync the decision into the assessment

### Step 2b -- EU AI Act assessment

**Who:** Tech Lead + product owner review
**Time:** 10 minutes

```
/compliance-ai-act
```

**Output:** `docs/governance/EU_AI_ACT_ASSESSMENT.md`

**Key things to verify:**
- Risk category is correctly classified (Minimal / Limited / High)
- Customer-facing AI disclosure is in place
- Human oversight mechanism (Gate C01) is documented as evidence

### Step 2c -- OWASP LLM Top 10 assessment

**Who:** Tech Lead (engineering focus)
**Time:** 10-15 minutes (codebase scan)

```
/compliance-owasp
```

**Output:** `docs/governance/OWASP_ASSESSMENT.md`

This is the most technical assessment. It scans the codebase and
references specific files and line numbers. Engineering gaps produce
Jira stories directly.

### Step 2d -- ISO 27001 assessment

**Who:** Tech Lead + Security Lead
**Time:** 20-30 minutes to generate

```
/compliance-iso27001
```

**Output:** `docs/governance/ISO27001_ISMS.md`

**Important:** This document is generated ONCE and then maintained.
Never run `/compliance-iso27001` again -- use `/compliance-update iso27001`.
The document contains human decisions that would be lost if regenerated.

**After generating:**
1. Read the Mandatory ISMS Documents section -- policies that need to be created
2. Section A organises all 93 controls -- focus on Critical gaps first
3. For A.7 (physical controls) -- most will be `[N/A: Cloud-hosted]` which is correct
4. For A.6 (people controls) -- most require `Management decision` owner type

### Step 2e -- NIS2 assessment (if applicable)

Run if your product is part of essential/important entity infrastructure
or if customers from regulated sectors are asking.

```
/compliance-nis2
```

**Output:** `docs/governance/NIS2_ASSESSMENT.md`

### Step 2f -- DORA assessment (if applicable)

Run if you serve financial sector customers.

```
/compliance-dora
```

**Output:** `docs/governance/DORA_ASSESSMENT.md`

---

## Phase 3 — Prioritise and remediate

After running assessments, you will have a collection of gaps.
This phase is about working through them systematically.

### Step 3 -- Check compliance status

```
/compliance-status
```

This gives you a dashboard across all standards showing:
- Compliance percentage per standard
- Count of Critical/High/Medium/Low open items
- Which briefs are ready to share
- The single most important action to take next

### Step 4 -- Work through the open items

**Priority order:**

1. **Critical items with owner type `DPO decision` or `Management decision`**
   Schedule a meeting. These cannot be resolved without a human decision.
   Document the decision in `PRODUCT_GOVERNANCE.md`.
   Run `/compliance-update all` after each decision.

2. **Critical items with owner type `Engineer`**
   These are code changes. Create stories via `APPROVED C01 [STANDARD]`.
   Resolve in the current sprint if possible.
   After the PR merges, run `/compliance-update [standard]`.

3. **High items with owner type `Security Lead`**
   Policy documents (Information Security Policy, Incident Response Procedure).
   Create the document, save to `docs/governance/policies/`.
   Run `/compliance-update iso27001` after creating.

4. **High items with owner type `Tech Lead`**
   Configuration and process gaps.
   Resolve and document in `PRODUCT_GOVERNANCE.md` or codebase.

5. **Medium and Low items**
   Add to backlog. Resolve over current and next quarter.

### Step 5 -- Update assessments after changes

Every time a gap is resolved:

```powershell
# After code change is merged:
/compliance-update [standard]

# After PRODUCT_GOVERNANCE.md is updated:
/compliance-update all
```

When an item is confirmed as resolved, add it to **Section C -- Resolution Log**
in the relevant assessment document:

```markdown
| ID | Resolved by | Date | Evidence | Notes |
| GDPR-003 | Anna K (DPO) | 2026-07-15 | PRODUCT_GOVERNANCE.md line 45 | 90 days retention, legal obligation basis |
```

---

## Phase 4 — Generate customer briefs

Once Critical items are resolved (or you need to share despite open items):

### Step 6 -- Generate the relevant brief

**For a customer asking about data processing:**
```
/compliance-brief-dpa
```

**For a security questionnaire:**
```
/compliance-brief-security
```

**For AI governance questions:**
```
/compliance-brief-ai
```

**For NIS2-regulated sector customers:**
```
/compliance-brief-nis2
```

**For financial sector (DORA) customers:**
```
/compliance-brief-dora
```

**For board or executive reporting:**
```
/compliance-brief-executive
```

**Every brief includes a readiness indicator:**

```
✓ READY TO SHARE              All critical items resolved
⚠ SHARE WITH CAVEATS          N critical items still open -- flagged in document
✗ NOT STARTED                 Required assessment not yet run
```

Briefs are always generated -- even with open gaps. The gaps are
prominently flagged inline throughout the document and listed in the
Open Items Summary at the end. You decide whether to share it.

---

## Phase 5 — Ongoing maintenance

### When code changes

After every PR that changes security controls, data handling, or integrations:

```powershell
/compliance-update all
```

Check if any items moved from COMPLIANT to GAP (regression) or from GAP to VERIFY (improvement).

### When governance decisions change

After updating `PRODUCT_GOVERNANCE.md` (new retention decision, DPA confirmed, etc.):

```powershell
/compliance-update all
```

The update command reads the new decisions and closes the relevant open items automatically.

### Quarterly

Run `/compliance-status` in the first sprint of each quarter.
Review Section B open items across all assessments.
Update Q3 priorities based on remaining gaps.
Regenerate briefs if significant progress was made.

---

## Summary: document structure

All assessments are saved to `docs/governance/`:

```
docs/
  governance/
    PRODUCT_OVERVIEW.md          ← Foundation (Layer 1)
    GDPR_ASSESSMENT.md           ← Layer 2
    EU_AI_ACT_ASSESSMENT.md      ← Layer 2
    ISO27001_ISMS.md             ← Layer 2 (living document, never regenerated)
    NIS2_ASSESSMENT.md           ← Layer 2
    DORA_ASSESSMENT.md           ← Layer 2
    OWASP_ASSESSMENT.md          ← Layer 2
    briefs/
      DPA_BRIEF.md               ← Layer 3
      SECURITY_BRIEF.md          ← Layer 3
      AI_GOVERNANCE_BRIEF.md     ← Layer 3
      NIS2_BRIEF.md              ← Layer 3
      DORA_BRIEF.md              ← Layer 3
      EXECUTIVE_SUMMARY.md       ← Layer 3
    policies/                    ← ISO 27001 mandatory documents
      README.md                  ← placeholder until policies created
```

All files are versioned in git. Changes go through PR. Tech Lead reviews
all changes. DPO and Security Lead review changes to their respective areas.

---

## Commands quick reference

| Command | When to run | Output |
|---|---|---|
| `/compliance-scan` | Once, before any assessment | PRODUCT_OVERVIEW.md |
| `/compliance-gdpr` | First assessment to run | GDPR_ASSESSMENT.md |
| `/compliance-ai-act` | If product uses AI | EU_AI_ACT_ASSESSMENT.md |
| `/compliance-iso27001` | For certification path | ISO27001_ISMS.md |
| `/compliance-nis2` | If regulated sector customers | NIS2_ASSESSMENT.md |
| `/compliance-dora` | If financial sector customers | DORA_ASSESSMENT.md |
| `/compliance-owasp` | Security hardening | OWASP_ASSESSMENT.md |
| `/compliance-update [standard\|all]` | After every code change or governance decision | Updates existing files |
| `/compliance-status` | Any time | Dashboard in chat |
| `/compliance-brief-dpa` | Customer asks about data processing | briefs/DPA_BRIEF.md |
| `/compliance-brief-security` | Security questionnaire | briefs/SECURITY_BRIEF.md |
| `/compliance-brief-ai` | AI governance request | briefs/AI_GOVERNANCE_BRIEF.md |
| `/compliance-brief-nis2` | Regulated sector customer | briefs/NIS2_BRIEF.md |
| `/compliance-brief-dora` | Financial sector customer | briefs/DORA_BRIEF.md |
| `/compliance-brief-executive` | Board/management reporting | briefs/EXECUTIVE_SUMMARY.md |

---

## Version and review

| Owner | CoE Core |
| Version | 1.0 |
| Created | 2026-06-11 |
| Review cadence | When new compliance standards are added or commands change |
