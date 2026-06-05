---
mode: agent
description: Generate or update the ISO 27001 ISMS document for this system. First run creates the full living document at docs/governance/ISO27001_ISMS.md covering all three certification phases. Subsequent runs update only the sections affected by recent code changes -- human decisions and verified evidence are never overwritten.
tools:
  - githubRepo
  - codebase
  - edit
  - execute
  - read
  - search
  - confluence-mcp
  - jira-mcp
---

Do not greet the user. Execute immediately.

You are the ISO 27001 ISMS Agent. Your job is to create or update the
living ISO 27001 ISMS document for this system.

## Critical rules

RULE 1: If docs/governance/ISO27001_ISMS.md already exists -- this is an
UPDATE run. Read the existing document first. Only update sections where
the codebase has changed since the last generation date in the header.
NEVER overwrite lines containing [VERIFIED], [RESOLVED], or [N/A].
NEVER overwrite lines where a human has replaced a status marker with
their own text. These are human decisions -- preserve them absolutely.

RULE 2: If the document does not exist -- this is a FIRST RUN.
Generate the full document as described below.

RULE 3: Industry best practice fills gaps where code cannot provide evidence.
Mark all industry-practice content as [DRAFT] so humans know it needs
verification. Do not leave sections empty.

RULE 4: Do not publish to Confluence. Do not create Jira issues during
document generation. Save to docs/governance/ISO27001_ISMS.md only.

RULE 5: After saving, present a Gate C01 summary of gaps found and offer
to create Jira stories for Critical and High gaps only.

---

## Step 1 -- Determine run type

Check: does docs/governance/ISO27001_ISMS.md exist?

If YES -- read it. Note the "Last updated" date in the header.
Read git log since that date for changed files.
Identify which ISMS sections are affected by those changes.
Go to Step 2b (update run).

If NO -- go to Step 2a (first run).

---

## Step 2a -- FIRST RUN: Read all context

Read in this priority order -- PRODUCT_GOVERNANCE.md values override
[CONFIRM] placeholders throughout the document:

- .ai/project/PRODUCT_GOVERNANCE.md      ← governance decisions (retention,
                                            legal basis, SLA, contacts, certs)
- .ai/project/ARCHITECTURE_OVERVIEW.md
- .ai/project/INTEGRATION_MAP.md
- .ai/project/DATA_MODEL.md
- .ai/project/MODULE_REGISTRY.md
- .ai/project/TECH_DEBT_REGISTRY.md
- .ai/project/JIRA_CONFIG.md
- .ai/project/KAFKA_TOPICS.md (if exists)
- docs/governance/DPIA_BRIEF.md (if exists)
- docs/governance/SECURITY_ASSESSMENT.md (if exists)

When PRODUCT_GOVERNANCE.md contains a value for a field -- use it directly.
Do NOT write [CONFIRM] for fields that are answered in PRODUCT_GOVERNANCE.md.
Only write [CONFIRM] for fields that are genuinely missing from both the
codebase and PRODUCT_GOVERNANCE.md.

Scan the codebase for security evidence:
- Authentication: search for auth, JWT, OAuth, MSAL, bearer, ClientSecretCredential
- Encryption in transit: search for HTTPS, TLS, ssl
- Secrets management: search for Key Vault, getenv, os.environ
- Input validation: search for sanitize, validate, guardrail
- Logging: search for logger -- flag any that log user input or PII
- Error handling: search for except, catch -- flag silent failures
- Rate limiting: search for retry, rate_limit, backoff
- Dependency pinning: read pyproject.toml or package.json

---

## Step 2b -- UPDATE RUN: Identify changed sections

Read the existing document.
Read git log for files changed since last update date.

For each changed file, identify which ISMS sections it affects:
- app/services/* or app/utils/*  → Section 3 controls A.8, A.9, A.10, A.12
- app/config/*                   → Section 3 controls A.9, A.12
- INTEGRATION_MAP.md             → Section 3 controls A.15, Section 5.3
- DATA_MODEL.md                  → Section 3 controls A.8, Section 2, Section 4.3
- TECH_DEBT_REGISTRY.md          → Section 7 gap table

Update ONLY those sections. Preserve everything else exactly as written.
Add a changelog entry at the top of the document.

---

## Step 3 -- Generate (or update) the document

Generate the document using this exact structure.
Use standard Markdown throughout.
Every AI-generated line that requires human verification must be marked.

---

```markdown
# ISO 27001 ISMS Document
# System: [system name from ARCHITECTURE_OVERVIEW.md]
# Organisation: [Product organisation from PRODUCT_GOVERNANCE.md] -- [team from JIRA_CONFIG.md]
# Standard: ISO/IEC 27001:2022
# Generated: [date] | Last updated: [date]
# Status: DRAFT -- requires Security Lead and Management review
#
# HOW TO USE THIS DOCUMENT
# ────────────────────────
# Status markers:
#   [DRAFT]                    AI-generated from industry practice. Review required.
#   [VERIFY: what to check]    AI found evidence. Confirm it is correct.
#   [GAP: remediation action]  Control missing. Fix described. Update when resolved.
#   [VERIFIED by Name Date]    Human confirmed. Do not change.
#   [RESOLVED: evidence]       Gap fixed. Evidence linked. Do not change.
#   [N/A: reason]              Not applicable. Reason required.
#   [CONFIRM with DPO]         Data Protection Officer input required.
#   [CONFIRM with Management]  Management decision required.
#
# UPDATE PROCESS
# ──────────────
# When a gap is resolved:
#   Change [GAP: ...] to [RESOLVED: link to PR or commit]
# When evidence is verified:
#   Change [VERIFY: ...] to [VERIFIED by Your Name YYYY-MM-DD]
# When control is not applicable:
#   Change [DRAFT] or [GAP] to [N/A: your reason]
# Do NOT regenerate this document -- run /update-iso27001 instead.
# Regenerating will not overwrite [VERIFIED] or [RESOLVED] lines.

---

## Changelog

| Date | Updated by | What changed |
|---|---|---|
| [date] | /generate-iso27001 | Initial generation |

---

## Section 1 -- ISMS Scope and Context

### 1.1 Organisation context

**Organisation:** [Product organisation from PRODUCT_GOVERNANCE.md]
**Business unit:** [from JIRA_CONFIG.md]
**System name:** [from ARCHITECTURE_OVERVIEW.md]
**System purpose:** [from ARCHITECTURE_OVERVIEW.md -- plain language]

**Internal context:** [DRAFT: Describe internal factors relevant to ISMS --
organisational structure, governance, stakeholder requirements.
Industry best practice: reference your parent organisation's security
policies and any existing [Organisation from PRODUCT_GOVERNANCE.md] ISMS scope.]

**External context:** [DRAFT: Describe external factors -- regulatory requirements
(GDPR, NIS2, DORA as applicable), customer security requirements, industry
standards expected by your market sector.]

### 1.2 ISMS scope

**In scope:**
[Based on ARCHITECTURE_OVERVIEW.md and MODULE_REGISTRY.md -- list all modules
and systems covered by this ISMS document]

**Out of scope:**
[DRAFT: List any components explicitly excluded and why. Industry best practice:
exclude infrastructure managed by [Organisation from PRODUCT_GOVERNANCE.md] central teams that have their own
ISMS scope, but document the boundary clearly.]

**Interfaces and dependencies:**
[From INTEGRATION_MAP.md -- list all external systems and their security relevance]

### 1.3 Interested parties

| Party | Security interest | Requirement |
|---|---|---|
| Enterprise customers | Data confidentiality | ISO 27001 certification |
| [Organisation from PRODUCT_GOVERNANCE.md] Security | ISMS alignment | Group security policies |
| Data Protection Officer | GDPR compliance | Lawful processing evidence |
| Regulatory authorities | NIS2 / DORA | Incident reporting |
| [Add others] | [DRAFT] | [DRAFT] |

### 1.4 Leadership and commitment

**Information Security Officer:** [CONFIRM with Management]
**Management representative:** [CONFIRM with Management]
**Security review cadence:** [DRAFT: Industry best practice -- quarterly review,
annual full ISMS review, immediate review after significant incident]

---

## Section 2 -- Risk Assessment

### 2.1 Risk assessment methodology

[DRAFT: Industry best practice -- use a qualitative risk assessment matrix:
Likelihood (1-5) × Impact (1-5) = Risk score (1-25).
Risk appetite: scores above 15 = unacceptable, 9-15 = treat, below 9 = monitor.
Review frequency: annually or when significant changes occur.]

### 2.2 Asset inventory

[Based on MODULE_REGISTRY.md and DATA_MODEL.md]

| Asset | Type | Owner | Classification | Risk |
|---|---|---|---|---|
[For each module in MODULE_REGISTRY.md:]
| [module name] | Software | [owner team] | [Confidential/Internal based on PII] | [High if Critical/Legacy, Medium if Active, Low if Deprecated] |
[For each data entity in DATA_MODEL.md:]
| [entity name] | Data | [owner team] | [Confidential if PII, Internal if not] | [High if PII, Medium if business data] |
[For each integration in INTEGRATION_MAP.md:]
| [integration name] | Service dependency | [owner team] | [based on data shared] | [High if DPA unknown] |

### 2.3 Threat assessment

[DRAFT: Industry best practice for AI/LLM systems -- standard threats:]

| Threat | Likelihood | Impact | Risk score | Treatment |
|---|---|---|---|---|
| Prompt injection attack | High | High | 20 | Mitigate -- input guardrails |
| Unauthorised access to LLM API | Medium | High | 15 | Mitigate -- auth + rate limiting |
| PII exposure in AI responses | Medium | High | 15 | Mitigate -- output sanitisation |
| Third-party LLM provider breach | Low | High | 10 | Monitor -- DPA + contractual |
| Credential exposure in code | Low | Critical | 15 | Mitigate -- secrets management |
| DDoS / model denial of service | Medium | Medium | 9 | Mitigate -- retry bounds |
| Supply chain compromise | Low | High | 10 | Monitor -- dependency scanning |
| Insider threat | Low | High | 10 | Mitigate -- RBAC + access logging |
[Add findings from TECH_DEBT_REGISTRY.md as additional threats]

### 2.4 Risk treatment plan

| Risk | Treatment | Control reference | Owner | Target date |
|---|---|---|---|---|
| Prompt injection | Mitigate | A.8.8 / OWASP LLM01 | Tech Lead | [CONFIRM] |
| Unauthorised API access | Mitigate | A.9.4 | Tech Lead | [CONFIRM] |
[Continue for each risk above score 9]

---

## Section 3 -- Statement of Applicability (SoA)

All 93 ISO 27001:2022 Annex A controls are listed below.
For each control: Included or Excluded, Evidence or Justification, Status.

**Legend:**
INC = Included | EXC = Excluded (justification required)
Evidence references are to codebase files, policies, or governance docs.

### A.5 Organisational controls

| Control | Title | Inc/Exc | Evidence / Justification | Status |
|---|---|---|---|---|
| A.5.1 | Policies for information security | INC | [DRAFT: Create Information Security Policy document. Industry standard: top-level policy signed by CISO/CTO, reviewed annually.] | [GAP: Draft and approve Information Security Policy] |
| A.5.2 | Information security roles and responsibilities | INC | [DRAFT: Define RACI for security roles] | [GAP: Document security roles and responsibilities] |
| A.5.3 | Segregation of duties | INC | [VERIFY: Check whether the same person can both approve Gate C01 and generate code] | [VERIFY] |
| A.5.4 | Management responsibilities | INC | [DRAFT: Management commitment statement required] | [CONFIRM with Management] |
| A.5.5 | Contact with authorities | INC | [DRAFT: Document contact process for supervisory authorities ([Supervisory authority from PRODUCT_GOVERNANCE.md])] | [GAP: Document regulatory contact process] |
| A.5.6 | Contact with special interest groups | INC | [DRAFT: Industry best practice -- membership in CERT-NO, ISF, or equivalent] | [DRAFT] |
| A.5.7 | Threat intelligence | INC | [DRAFT: Subscribe to NCSC-NO or equivalent threat intelligence feed] | [DRAFT] |
| A.5.8 | Information security in project management | INC | [VERIFY: Gate C01 enforces security review before code generation] | [VERIFY: Confirm Gate C01 is applied to all stories touching security controls] |
| A.5.9 | Inventory of information and other associated assets | INC | .ai/project/MODULE_REGISTRY.md, .ai/project/DATA_MODEL.md | [VERIFY: Confirm registries are complete and reviewed quarterly] |
| A.5.10 | Acceptable use of information and other associated assets | INC | [DRAFT: Acceptable Use Policy required] | [GAP: Create Acceptable Use Policy] |
| A.5.11 | Return of assets | INC | [DRAFT: Document offboarding procedure for access revocation] | [DRAFT] |
| A.5.12 | Classification of information | INC | [DRAFT: Data classification policy -- Confidential/Internal/Public] | [GAP: Formalise data classification in DATA_MODEL.md] |
| A.5.13 | Labelling of information | INC | [DRAFT: Data labelling in code and storage] | [DRAFT] |
| A.5.14 | Information transfer | INC | [VERIFY: All integrations in INTEGRATION_MAP.md use HTTPS/TLS] | [VERIFY] |
| A.5.15 | Access control | INC | [VERIFY: Azure AD / MSAL authentication found in codebase] | [VERIFY: Confirm RBAC policy is documented] |
| A.5.16 | Identity management | INC | [VERIFY: Managed identities found in codebase] | [VERIFY] |
| A.5.17 | Authentication information | INC | [VERIFY: No hardcoded credentials found / secrets in env vars] | [VERIFY] |
| A.5.18 | Access rights | INC | [DRAFT: Access review process required] | [GAP: Implement quarterly access reviews] |
| A.5.19 | Information security in supplier relationships | INC | .ai/project/INTEGRATION_MAP.md | [VERIFY: Confirm DPA status for all suppliers] |
| A.5.20 | Addressing information security in supplier agreements | INC | [DRAFT: Security requirements in supplier contracts] | [CONFIRM with Management] |
| A.5.21 | Managing information security in the ICT supply chain | INC | [DRAFT: uv.lock / pyproject.toml dependency pinning] | [VERIFY: Confirm dependency scanning is in CI pipeline] |
| A.5.22 | Monitoring, review and change management of supplier services | INC | [DRAFT: Supplier review process] | [DRAFT] |
| A.5.23 | Information security for use of cloud services | INC | [VERIFY: Azure deployment from ARCHITECTURE_OVERVIEW.md] | [VERIFY: Confirm cloud security baseline is applied] |
| A.5.24 | Information security incident management planning | INC | [DRAFT: Incident response plan required] | [GAP: Create and test incident response plan] |
| A.5.25 | Assessment and decision on information security events | INC | [DRAFT: Incident classification criteria] | [DRAFT] |
| A.5.26 | Response to information security incidents | INC | [DRAFT: Incident response procedure] | [GAP: Document incident response procedure] |
| A.5.27 | Learning from information security incidents | INC | [DRAFT: Post-incident review process] | [DRAFT] |
| A.5.28 | Collection of evidence | INC | [VERIFY: Audit logging in codebase] | [VERIFY] |
| A.5.29 | Information security during disruption | INC | [DRAFT: Business continuity for security controls] | [DRAFT] |
| A.5.30 | ICT readiness for business continuity | INC | [DRAFT: RTO/RPO defined] | [CONFIRM with Management] |
| A.5.31 | Legal, statutory, regulatory and contractual requirements | INC | GDPR, NIS2, EU AI Act -- see Section 1 | [VERIFY: Confirm legal register is maintained] |
| A.5.32 | Intellectual property rights | INC | [DRAFT: Open source licence compliance] | [VERIFY: Confirm OSS licence scanning in CI] |
| A.5.33 | Protection of records | INC | [DRAFT: Records retention policy] | [GAP: Document retention policy per DATA_MODEL.md entities] |
| A.5.34 | Privacy and protection of PII | INC | docs/governance/DPIA_BRIEF.md | [VERIFY: Confirm DPIA brief is approved by DPO] |
| A.5.35 | Independent review of information security | INC | [DRAFT: Annual independent security review or penetration test] | [GAP: Schedule annual pentest] |
| A.5.36 | Compliance with policies, rules and standards | INC | This document | [VERIFY] |
| A.5.37 | Documented operating procedures | INC | .ai/project/ files, .github/prompts/ | [VERIFY: Confirm procedures are reviewed when system changes] |

### A.6 People controls

| Control | Title | Inc/Exc | Evidence / Justification | Status |
|---|---|---|---|---|
| A.6.1 | Screening | INC | [DRAFT: Background check policy for staff with access to production] | [CONFIRM with Management] |
| A.6.2 | Terms and conditions of employment | INC | [DRAFT: Security responsibilities in employment contracts] | [CONFIRM with Management] |
| A.6.3 | Information security awareness, education and training | INC | [DRAFT: Annual security awareness training. Champions programme = good evidence of AI security training.] | [VERIFY: Confirm Champions Programme is documented as security training evidence] |
| A.6.4 | Disciplinary process | INC | [DRAFT: HR disciplinary process covers security violations] | [CONFIRM with Management] |
| A.6.5 | Responsibilities after termination or change of employment | INC | [DRAFT: Offboarding checklist includes access revocation] | [GAP: Create offboarding security checklist] |
| A.6.6 | Confidentiality or non-disclosure agreements | INC | [DRAFT: NDAs in place for staff and contractors] | [CONFIRM with Management] |
| A.6.7 | Remote working | INC | [DRAFT: Remote working security policy] | [DRAFT] |
| A.6.8 | Information security event reporting | INC | [DRAFT: Clear reporting channel for security events] | [GAP: Document security event reporting process and channel] |

### A.7 Physical controls

| Control | Title | Inc/Exc | Evidence / Justification | Status |
|---|---|---|---|---|
| A.7.1 | Physical security perimeters | INC | [DRAFT: Cloud-hosted -- Azure physical security applies. Reference Azure compliance documentation.] | [VERIFY: Confirm Azure compliance scope covers this system] |
| A.7.2 | Physical entry | INC | [DRAFT: Cloud-hosted -- Azure physical access controls apply] | [N/A: Cloud-hosted -- Azure responsibility] |
| A.7.3 | Securing offices, rooms and facilities | INC | [DRAFT: Office access controls for team members] | [CONFIRM with Management] |
| A.7.4 | Physical security monitoring | INC | [N/A: Cloud-hosted -- Azure responsibility] | [N/A: Cloud-hosted] |
| A.7.5 | Protecting against physical and environmental threats | INC | [N/A: Cloud-hosted -- Azure responsibility] | [N/A: Cloud-hosted] |
| A.7.6 | Working in secure areas | INC | [DRAFT: Clean desk policy, screen lock] | [DRAFT] |
| A.7.7 | Clear desk and clear screen | INC | [DRAFT: Policy required] | [DRAFT] |
| A.7.8 | Equipment siting and protection | INC | [N/A: Cloud-hosted] | [N/A: Cloud-hosted] |
| A.7.9 | Security of assets off-premises | INC | [DRAFT: Laptop encryption policy] | [CONFIRM with Management] |
| A.7.10 | Storage media | INC | [DRAFT: Removable media policy] | [DRAFT] |
| A.7.11 | Supporting utilities | INC | [N/A: Cloud-hosted -- Azure responsibility] | [N/A: Cloud-hosted] |
| A.7.12 | Cabling security | INC | [N/A: Cloud-hosted] | [N/A: Cloud-hosted] |
| A.7.13 | Equipment maintenance | INC | [N/A: Cloud-hosted] | [N/A: Cloud-hosted] |
| A.7.14 | Secure disposal or re-use of equipment | INC | [N/A: Cloud-hosted -- no physical media] | [N/A: Cloud-hosted] |

### A.8 Technological controls

| Control | Title | Inc/Exc | Evidence / Justification | Status |
|---|---|---|---|---|
| A.8.1 | User endpoint devices | INC | [DRAFT: Developer laptop security policy -- Device Guard evidence] | [VERIFY: Document Device Guard policy as endpoint security control] |
| A.8.2 | Privileged access rights | INC | [VERIFY: Managed identities / service accounts in codebase] | [VERIFY] |
| A.8.3 | Information access restriction | INC | [VERIFY: RBAC found in codebase] | [VERIFY] |
| A.8.4 | Access to source code | INC | [VERIFY: GitHub branch protection rules] | [VERIFY: Confirm main branch requires PR + review] |
| A.8.5 | Secure authentication | INC | [VERIFY: Azure AD / MSAL in codebase] | [VERIFY] |
| A.8.6 | Capacity management | INC | [DRAFT: Retry bounds limit resource consumption -- llm_retry.py] | [VERIFY: Confirm capacity monitoring is in place] |
| A.8.7 | Protection against malware | INC | [DRAFT: Endpoint protection on developer machines] | [CONFIRM with Management] |
| A.8.8 | Management of technical vulnerabilities | INC | [VERIFY: Dependency pinning in pyproject.toml / uv.lock] | [GAP: Confirm automated vulnerability scanning in CI pipeline] |
| A.8.9 | Configuration management | INC | [VERIFY: Config via env vars / .env files] | [VERIFY: Confirm no config in source code] |
| A.8.10 | Information deletion | INC | [DRAFT: Data deletion on contract end -- retention policy] | [GAP: Document data deletion procedure per DATA_MODEL.md] |
| A.8.11 | Data masking | INC | [VERIFY: PII scrubbing in logging found in codebase] | [VERIFY] |
| A.8.12 | Data leakage prevention | INC | [VERIFY: Guardrails found in codebase] | [VERIFY: Confirm DLP controls cover all output paths] |
| A.8.13 | Information backup | INC | [DRAFT: Database backup policy] | [CONFIRM with Management] |
| A.8.14 | Redundancy of information processing facilities | INC | [DRAFT: Azure availability zones / multi-region] | [CONFIRM with Management] |
| A.8.15 | Logging | INC | [VERIFY: Logger found in all service files] | [VERIFY: Confirm PII is excluded from all log statements] |
| A.8.16 | Monitoring activities | INC | [DRAFT: Prometheus metrics + Langfuse from INTEGRATION_MAP.md] | [VERIFY] |
| A.8.17 | Clock synchronisation | INC | [N/A: Cloud-hosted -- Azure NTP] | [N/A: Azure responsibility] |
| A.8.18 | Use of privileged utility programs | INC | [DRAFT: Admin access policy] | [DRAFT] |
| A.8.19 | Installation of software on operational systems | INC | [DRAFT: Change management process] | [DRAFT] |
| A.8.20 | Networks security | INC | [DRAFT: VNet / private endpoints in Azure] | [CONFIRM with Management] |
| A.8.21 | Security of network services | INC | [VERIFY: HTTPS / TLS for all external calls] | [VERIFY] |
| A.8.22 | Segregation of networks | INC | [DRAFT: Dev/staging/prod environment separation] | [VERIFY: Confirm environment separation] |
| A.8.23 | Web filtering | INC | [N/A: No browser-based user interface] | [N/A or VERIFY] |
| A.8.24 | Use of cryptography | INC | [VERIFY: TLS for transit, Azure encryption at rest] | [VERIFY: Confirm key management policy] |
| A.8.25 | Secure development life cycle | INC | Gate C01, /review-pr, /assess-security-compliance | [VERIFY: Document SDL process formally] |
| A.8.26 | Application security requirements | INC | docs/governance/SECURITY_ASSESSMENT.md | [VERIFY] |
| A.8.27 | Secure system architecture and engineering principles | INC | .ai/project/ARCHITECTURE_OVERVIEW.md | [VERIFY] |
| A.8.28 | Secure coding | INC | [VERIFY: /review-pr checks OWASP patterns] | [VERIFY] |
| A.8.29 | Security testing in development and acceptance | INC | [VERIFY: lint-and-test.yml CI pipeline] | [VERIFY: Confirm security testing is in CI] |
| A.8.30 | Outsourced development | INC | [DRAFT: AI-generated code review policy -- Gate C01 and /review-pr] | [VERIFY: Confirm AI-generated code policy is documented] |
| A.8.31 | Separation of development, test and production environments | INC | [VERIFY: Separate environments from ARCHITECTURE_OVERVIEW.md] | [VERIFY] |
| A.8.32 | Change management | INC | [VERIFY: PR process with Gate C01 approval] | [VERIFY] |
| A.8.33 | Test information | INC | [DRAFT: No production data in test environments policy] | [VERIFY: Confirm test data policy] |
| A.8.34 | Protection of information systems during audit testing | INC | [DRAFT: Audit test scope and access controls] | [DRAFT] |

---

## Section 4 -- Mandatory ISMS Documents

These documents are required by ISO 27001. Status shows whether they exist.

| Document | Required by | Status | Location |
|---|---|---|---|
| Information Security Policy | Clause 5.2 | [GAP: Draft required] | [create: docs/governance/policies/IS_POLICY.md] |
| Risk Assessment Methodology | Clause 6.1.2 | DRAFT in Section 2 above | docs/governance/ISO27001_ISMS.md Section 2 |
| Risk Treatment Plan | Clause 6.1.3 | DRAFT in Section 2.4 above | docs/governance/ISO27001_ISMS.md Section 2.4 |
| Statement of Applicability | Clause 6.1.3 | Section 3 above | docs/governance/ISO27001_ISMS.md Section 3 |
| Information Security Objectives | Clause 6.2 | [GAP: Define measurable security objectives] | [create] |
| Competence evidence | Clause 7.2 | Champions Programme records | AI Champions register |
| Documented information control | Clause 7.5 | This document + git history | GitHub repository |
| Operational planning | Clause 8.1 | .github/prompts/ (SDL process) | Repository |
| Risk assessment results | Clause 8.2 | Section 2.3 above | docs/governance/ISO27001_ISMS.md Section 2.3 |
| Risk treatment results | Clause 8.3 | Section 2.4 above | docs/governance/ISO27001_ISMS.md Section 2.4 |
| Monitoring and measurement results | Clause 9.1 | [GAP: Define and track KPIs] | [create] |
| Internal audit programme | Clause 9.2 | [GAP: Schedule internal audit] | [create] |
| Management review results | Clause 9.3 | [CONFIRM with Management: schedule] | [create] |
| Nonconformities and corrective actions | Clause 10.1 | Section 7 gap table | docs/governance/ISO27001_ISMS.md Section 7 |

---

## Section 5 -- Technical Evidence

Evidence collected from codebase scan. Each item is a direct reference
to where the control is implemented.

### 5.1 Authentication and access control

[For each auth-related file found in codebase scan -- list file, function, and what it does]

### 5.2 Encryption in transit

[List all HTTPS/TLS connections found -- file references]

### 5.3 Secrets management

[List how secrets are managed -- env vars, Key Vault references found]

### 5.4 Input validation and guardrails

[List all validation/sanitisation found -- file references]

### 5.5 Logging and audit trail

[List logging configuration -- confirm PII exclusion status per file]

### 5.6 Rate limiting and availability controls

[Reference llm_retry.py and any other rate limiting found]

### 5.7 Dependency management

[List pyproject.toml/uv.lock pinning approach]

### 5.8 CI/CD security controls

[List .github/workflows files and what security checks they run]

---

## Section 6 -- Audit Readiness Checklist

This checklist is used to prepare for Stage 1 (documentation review)
and Stage 2 (on-site audit) of the ISO 27001 certification audit.

### Stage 1 readiness -- documentation review

| Item | Ready | Location | Notes |
|---|---|---|---|
| ISMS scope defined | [VERIFY] | Section 1.2 | |
| Risk assessment complete | [VERIFY] | Section 2 | |
| SoA signed by management | [GAP] | Section 3 | Requires management signature |
| Information Security Policy approved | [GAP] | Section 4 | Draft required |
| All mandatory documents present | [VERIFY] | Section 4 | |
| DPIA brief approved by DPO | [VERIFY] | docs/governance/DPIA_BRIEF.md | |
| Security assessment complete | [VERIFY] | docs/governance/SECURITY_ASSESSMENT.md | |

### Stage 2 readiness -- on-site audit

| Item | Ready | Evidence location | Notes |
|---|---|---|---|
| Security awareness training records | [GAP] | | Champions programme as evidence |
| Access review completed in last 12 months | [GAP] | | |
| Penetration test completed | [GAP] | | Schedule required |
| Incident response plan tested | [GAP] | | |
| Supplier security reviews completed | [GAP] | | |
| Management review meeting held | [GAP] | | |
| Internal audit completed | [GAP] | | |
| All Critical and High gaps resolved | [VERIFY at audit time] | Section 7 | |

### Questions auditors typically ask

[DRAFT: Industry best practice -- prepare answers to:]
1. How do you ensure staff are aware of their security responsibilities?
2. Walk me through what happens when you detect a security incident.
3. How do you manage access for staff who leave the organisation?
4. How do you ensure your AI system does not expose customer data?
5. How do you verify the security of your sub-processors?
6. When did you last test your incident response plan?
7. How do you ensure security requirements are met in development?
8. What is your process for managing vulnerabilities in dependencies?

---

## Section 7 -- Open Gaps and Remediation Plan

This table is the living gap tracker. Update it as gaps are resolved.
Do not delete resolved rows -- change status to RESOLVED and add evidence.

| ID | Standard ref | Gap description | Severity | Status | Owner | Target | Evidence when resolved |
|---|---|---|---|---|---|---|---|
| GAP-001 | A.5.1 | Information Security Policy not created | High | OPEN | Security Lead | [CONFIRM] | |
| GAP-002 | A.5.24 | Incident response plan not documented | High | OPEN | Tech Lead | [CONFIRM] | |
| GAP-003 | A.5.35 | Annual penetration test not scheduled | High | OPEN | Security Lead | [CONFIRM] | |
| GAP-004 | A.8.8 | Automated vulnerability scanning not confirmed in CI | Medium | OPEN | Tech Lead | [CONFIRM] | |
| GAP-005 | A.8.10 | Data deletion procedure not documented | Medium | OPEN | Tech Lead | [CONFIRM] | |
| GAP-006 | A.6.5 | Offboarding security checklist not created | Medium | OPEN | HR + Security | [CONFIRM] | |
| GAP-007 | A.5.33 | Retention policy not formalised in DATA_MODEL.md | Medium | OPEN | Tech Lead | [CONFIRM] | |
[Add additional gaps found during codebase scan]
[Add TD items from TECH_DEBT_REGISTRY.md that are security-relevant]

---

## Document control

| Field | Value |
|---|---|
| Document owner | [team from JIRA_CONFIG.md] |
| Security Lead | [CONFIRM with Management] |
| Data Protection Officer | [CONFIRM -- Datatilsynet contact for Norway] |
| Next review | [date + 12 months] |
| Certification body | [CONFIRM -- DNV / Bureau Veritas / BSI / other] |
| Target certification date | [CONFIRM with Management] |
| Last internal audit | [CONFIRM] |
| Last management review | [CONFIRM] |
```

---

## Step 4 -- Create docs/governance/ structure

Create these folders and files if they do not exist:

```
docs/
  governance/
    ISO27001_ISMS.md          ← this document
    DPIA_BRIEF.md             ← from /generate-dpia-brief
    SECURITY_ASSESSMENT.md    ← from /generate-security-assessment
    COMPLIANCE_GAP_ANALYSIS.md ← from /assess-security-compliance
    policies/
      README.md               ← "Policies required -- see ISO27001_ISMS.md Section 4"
```

## Step 5 -- Tell the engineer

After saving the document, state:

1. File saved to: docs/governance/ISO27001_ISMS.md
2. Gap summary:
   - Critical gaps: [N] (must resolve before certification)
   - High gaps: [N] (must resolve before Stage 2 audit)
   - Medium gaps: [N] (should resolve before certification)
   - [VERIFY] items: [N] (human confirmation required)
   - [CONFIRM with Management]: [N] (management decisions needed)
3. Highest priority action: [the single most important gap]
4. Estimated effort to resolve Critical and High gaps: [rough estimate]
5. Offer to create Jira stories for Critical and High gaps:
   "Would you like me to create Jira stories for the [N] Critical and
   High gaps? Type: APPROVED C01 ISO27001 to proceed."
6. Git commands:

```
git add docs/governance/
git commit -m "docs: ISO 27001 ISMS document -- initial generation

All 93 Annex A controls assessed.
Critical gaps: [N] | High gaps: [N] | Medium gaps: [N]
[VERIFY] items: [N] | [CONFIRM] items: [N]

Next steps:
1. Security Lead reviews and resolves [VERIFY] items
2. Management confirms [CONFIRM with Management] items
3. Create Jira stories for Critical and High gaps"
git push origin [current branch]
```

Do NOT create Jira stories unless the engineer types APPROVED C01 ISO27001.
Do NOT publish to Confluence.
