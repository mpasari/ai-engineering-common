---
mode: agent
description: "Layer 2 -- Assess. GDPR assessment for this product. Covers lawful basis, data subject rights, retention, processor DPAs, breach process, privacy by design. Produces GDPR_ASSESSMENT.md with four sections: Findings, Open Items, Resolution Log, Status."
tools: [codebase, read, search, edit, execute, jira-mcp]
---

Do not greet. Execute immediately.

## Prerequisite check
Read docs/governance/PRODUCT_OVERVIEW.md.
If it does not exist: "PRODUCT_OVERVIEW.md not found. Run /compliance-scan first."

Read .ai/project/PRODUCT_GOVERNANCE.md for governance decisions already made.

## Check for existing assessment
If docs/governance/GDPR_ASSESSMENT.md exists:
"GDPR_ASSESSMENT.md already exists. Use /compliance-update gdpr to update it.
Run /compliance-update gdpr --force to regenerate (preserves Section C)."
Stop unless --force was passed.

## Assessment scope
Assess this product against GDPR (EU 2016/679) requirements.
This is a product-level assessment -- not an organisational GDPR programme.
Scope: what this specific product does with personal data.

## Codebase scan signals to check
- PII fields in DATA_MODEL.md and codebase (email, phone, name, user_id, msisdn)
- Log statements that include user input or personal data
- Data deletion endpoints or functions
- Consent capture mechanisms
- Data export/portability functions
- Encryption of stored PII fields
- PRODUCT_GOVERNANCE.md for: lawful basis decisions, retention decisions, DPA status per processor

## Generate GDPR_ASSESSMENT.md

```markdown
# GDPR Assessment
# Product: [from PRODUCT_OVERVIEW.md]
# Standard: GDPR (EU 2016/679)
# Generated: [date] | Last updated: [date]
# Based on: docs/governance/PRODUCT_OVERVIEW.md

---

## Section D -- Compliance Status
| Field | Value |
|---|---|
| Last assessed | [date] |
| Total requirements | [N] |
| Compliant | [N] ([%]) |
| Gap - Critical | [N] |
| Gap - High | [N] |
| Gap - Medium | [N] |
| Gap - Low | [N] |
| Pending verify | [N] |
| Brief readiness | [READY / NOT READY -- list blockers] |

---

## Section A -- Findings

### A1. Lawful basis (Art 6)
| ID | Processing activity | Personal data | Lawful basis | Status |
|---|---|---|---|---|
[For each processing activity in PRODUCT_GOVERNANCE.md or inferred from PRODUCT_OVERVIEW.md.
If lawful basis documented in PRODUCT_GOVERNANCE.md: COMPLIANT with reference.
If not documented: [GAP-Critical: Lawful basis not documented for this processing activity. DPO must confirm basis under Art 6(1).]]

### A2. Special category data (Art 9)
| ID | Requirement | Evidence | Status |
|---|---|---|---|
| GDPR-SC1 | No special category data processed without explicit consent or other Art 9(2) basis | [from PRODUCT_OVERVIEW.md] | [COMPLIANT if no special category data / GAP-Critical if yes and no basis] |

### A3. Data minimisation and purpose limitation (Art 5)
| ID | Requirement | Evidence | Status |
|---|---|---|---|
| GDPR-DM1 | Only necessary personal data collected for stated purpose | [from DATA_MODEL.md fields] | [COMPLIANT/PARTIAL/GAP] |
| GDPR-DM2 | Data not used for purposes beyond original collection | [from codebase] | [VERIFY: confirm no secondary use of personal data] |

### A4. Retention and deletion (Art 5(1)(e))
| ID | Entity | Retention period | Deletion method | Status |
|---|---|---|---|---|
[For each entity with PII in DATA_MODEL.md.
If retention defined in PRODUCT_GOVERNANCE.md: COMPLIANT with value.
If not defined: [GAP-Critical: Retention period not defined. DPO decision required.]]

### A5. Data subject rights (Art 15-22)
| ID | Right | Implementation | Status |
|---|---|---|---|
| GDPR-DSR1 | Right of access (Art 15) | [endpoint or process found / not found] | [COMPLIANT/GAP-High] |
| GDPR-DSR2 | Right to rectification (Art 16) | [found / not found] | [COMPLIANT/GAP-High] |
| GDPR-DSR3 | Right to erasure (Art 17) | [found / not found] | [COMPLIANT/GAP-High] |
| GDPR-DSR4 | Right to portability (Art 20) | [found / not found] | [COMPLIANT/GAP-Medium] |
| GDPR-DSR5 | Right to object (Art 21) | [found / not found] | [COMPLIANT/GAP-Medium] |

### A6. Processor and sub-processor obligations (Art 28)
| ID | Processor | DPA in place | Data shared | Status |
|---|---|---|---|---|
[For each external processor in PRODUCT_GOVERNANCE.md or INTEGRATION_MAP.md.
If DPA confirmed in PRODUCT_GOVERNANCE.md: COMPLIANT.
If DPA Unknown: [GAP-High: DPA not confirmed. Required before sharing personal data with this processor.]
If DPA No: [GAP-Critical: No DPA in place. Cannot legally share personal data with this processor.]]

### A7. Security of processing (Art 32)
| ID | Requirement | Evidence | Status |
|---|---|---|---|
| GDPR-SEC1 | Encryption in transit | [from PRODUCT_OVERVIEW.md security controls] | [COMPLIANT/GAP-High] |
| GDPR-SEC2 | Encryption at rest for PII | [from codebase] | [VERIFY/GAP-High] |
| GDPR-SEC3 | Access control to personal data | [from codebase auth scan] | [COMPLIANT/PARTIAL/GAP-High] |
| GDPR-SEC4 | PII excluded from application logs | [from codebase log scan] | [COMPLIANT/PARTIAL/GAP-High] |
| GDPR-SEC5 | Incident response process documented | [from PRODUCT_GOVERNANCE.md] | [COMPLIANT/GAP-High] |

### A8. Data breach notification (Art 33-34)
| ID | Requirement | Evidence | Status |
|---|---|---|---|
| GDPR-BR1 | 72-hour notification to supervisory authority | [from PRODUCT_GOVERNANCE.md] | [COMPLIANT/GAP-High] |
| GDPR-BR2 | Customer notification process documented | [from PRODUCT_GOVERNANCE.md] | [COMPLIANT/GAP-Medium] |
| GDPR-BR3 | Breach detection mechanism in place | [from codebase monitoring] | [VERIFY/GAP-Medium] |

### A9. Privacy by design (Art 25)
| ID | Requirement | Evidence | Status |
|---|---|---|---|
| GDPR-PBD1 | Data minimisation by default | [from codebase] | [VERIFY/GAP-Medium] |
| GDPR-PBD2 | Security review at spec stage (Gate C01) | Gate C01 in write-spec.prompt.md | COMPLIANT |
| GDPR-PBD3 | DPIA conducted for high-risk processing | [from PRODUCT_GOVERNANCE.md] | [COMPLIANT/GAP-High if AI processes personal data at scale] |

### A10. International transfers (Art 46)
| ID | Processor | Transfer basis | Destination | Status |
|---|---|---|---|---|
[For each processor outside EU/EEA from PRODUCT_GOVERNANCE.md.
If EU only: COMPLIANT.
If outside EU with SCCs or adequacy decision: COMPLIANT with reference.
If outside EU without basis: [GAP-Critical: No legal basis for international transfer.]]

---

## Section B -- Open Items
[Auto-generated from all GAP and VERIFY items in Section A above]

| ID | Requirement | Criticality | Owner type | Status | Resolved |
|---|---|---|---|---|---|
[list all GAP-* and VERIFY items here with owner type]

---

## Section C -- Resolution Log
[Fill in when items are resolved. Never overwritten by /compliance-update.]

| ID | Resolved by | Date | Evidence | Notes |
|---|---|---|---|---|

---

## How to update this document
- When code changes resolve a gap: run /compliance-update gdpr
- When DPO makes a retention decision: update PRODUCT_GOVERNANCE.md then run /compliance-update gdpr
- When an item is resolved: add a row to Section C above
- /compliance-update will sync Section B and Section D automatically
- /compliance-update will NEVER overwrite Section C
```

## After saving
1. State: file saved to docs/governance/GDPR_ASSESSMENT.md
2. List Critical gaps found and who owns each
3. State the single most important action to take first
4. Offer to create Jira stories: "Type APPROVED C01 GDPR to create Jira stories for Critical and High gaps"
5. Git commands to commit
