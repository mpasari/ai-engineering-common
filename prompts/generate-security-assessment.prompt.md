---
mode: agent
description: Generate a pre-filled security assessment document from project context files. Covers GDPR, ISO 27001, NIS2, DORA, EU AI Act, OWASP LLM Top 10, and common enterprise vendor questionnaire domains. Saves to docs/governance/SECURITY_ASSESSMENT.md.
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

You are the Security Assessment Agent. Your job is to produce a pre-filled
security assessment document that answers the questions enterprise customers
ask before signing a DPA, NDA, or MSA with a vendor.

The audience is procurement officers, security teams, and legal counsel --
not developers. Write in plain business language throughout.

## Step 1 -- Read all project context

Read:
- .ai/project/JIRA_CONFIG.md
- .ai/project/ARCHITECTURE_OVERVIEW.md
- .ai/project/INTEGRATION_MAP.md
- .ai/project/DATA_MODEL.md
- .ai/project/MODULE_REGISTRY.md
- .ai/project/TECH_DEBT_REGISTRY.md
- docs/governance/DPIA_BRIEF.md (if it exists)

Also read the codebase for security signals:
- Authentication patterns (search for auth, JWT, OAuth, MSAL, Azure AD)
- Encryption in transit (search for TLS, HTTPS, ssl)
- Secrets management (search for Key Vault, env vars, secrets)
- Logging patterns (search for logger, audit, log)
- Input validation (search for sanitize, validate, guardrail)

## Step 2 -- Generate the security assessment

---

# Security Assessment
# System: [system name from ARCHITECTURE_OVERVIEW.md]
# Team: [team from JIRA_CONFIG.md]
# Generated: [date] | Version: 1.0
# Status: DRAFT -- requires Tech Lead and Security Lead review before sharing
#
# Instructions for reviewer:
# Lines marked [CONFIRM] require human verification before sharing externally.
# Lines marked [GAP] identify missing controls that must be addressed or accepted.
# Lines marked [N/A] are not applicable to this system.

---

## Section 1 -- System Overview

**System name:** [from ARCHITECTURE_OVERVIEW.md]
**Purpose:** [plain language description]
**Deployment environment:** [Azure / GCP / AWS / On-premises -- from INTEGRATION_MAP.md]
**Data classification:** [Confidential / Internal / Public -- based on DATA_MODEL.md PII content]
**AI components:** [Yes/No -- describe if yes]
**Go-live date:** [CONFIRM with Tech Lead]
**System owner:** [team from JIRA_CONFIG.md]

---

## Section 2 -- Data Processing

### 2.1 Personal data processed

[List categories from DATA_MODEL.md in plain language]

| Data category | Purpose | Legal basis | Retention |
|---|---|---|---|
| [category] | [why] | [GDPR Art 6 basis] | [period or GAP] |

### 2.2 Special category data (GDPR Article 9)

[State explicitly whether any special category data is processed.
If DATA_MODEL.md does not mention health, biometric, political, or
religious data -- state: "No special category personal data is processed."]

### 2.3 Data subject rights

| Right | Supported | How | SLA |
|---|---|---|---|
| Access (Art 15) | [Yes/No/Partial] | [CONFIRM] | [CONFIRM] |
| Rectification (Art 16) | [Yes/No/Partial] | [CONFIRM] | [CONFIRM] |
| Erasure (Art 17) | [Yes/No/Partial] | [CONFIRM] | [CONFIRM] |
| Portability (Art 20) | [Yes/No/Partial] | [CONFIRM] | [CONFIRM] |
| Objection (Art 21) | [Yes/No/Partial] | [CONFIRM] | [CONFIRM] |

### 2.4 Sub-processors

[List every external system from INTEGRATION_MAP.md that processes personal data]

| Sub-processor | Data shared | Location | DPA in place | Audit certification |
|---|---|---|---|---|
| [system] | [data types] | [EU/Non-EU] | [Yes/No/Unknown] | [ISO 27001/SOC2/Unknown] |

---

## Section 3 -- Access Control

### 3.1 Authentication

[Based on codebase scan -- describe auth mechanism in plain language]

| Control | Status | Notes |
|---|---|---|
| Multi-factor authentication required | [Yes/No -- CONFIRM] | |
| Single Sign-On (SSO) | [Yes/No -- from codebase] | |
| Identity provider | [Azure AD / Google / Other -- from codebase] | |
| Session timeout | [CONFIRM] | |
| Privileged access managed separately | [CONFIRM] | |

### 3.2 Authorisation

| Control | Status | Notes |
|---|---|---|
| Role-based access control | [Yes/No -- from codebase] | |
| Principle of least privilege enforced | [CONFIRM] | |
| Access reviews conducted | [CONFIRM -- cadence?] | |
| Service accounts use managed identities | [Yes/No -- from codebase] | |

---

## Section 4 -- Data Security

### 4.1 Encryption

| Control | Status | Standard |
|---|---|---|
| Encryption in transit | [Yes -- from HTTPS/TLS in codebase] | TLS 1.2+ |
| Encryption at rest | [CONFIRM] | AES-256 |
| Key management | [Key Vault / CONFIRM] | |
| Database encryption | [CONFIRM] | |

### 4.2 Secrets management

[Based on codebase scan -- are secrets in env vars, Key Vault, or hardcoded?]

| Control | Status |
|---|---|
| No credentials hardcoded in source | [Yes/No -- from codebase scan] |
| Secrets stored in vault/secret manager | [CONFIRM] |
| Secret rotation policy | [CONFIRM] |

---

## Section 5 -- AI-Specific Controls

[Complete this section only if the system uses AI/LLM components.
If not -- state "This system does not use AI or LLM components."]

### 5.1 EU AI Act classification

| Question | Answer |
|---|---|
| Risk category | [Minimal / Limited / High -- based on use case] |
| Transparency disclosure to users | [Yes -- users informed they are interacting with AI / CONFIRM] |
| Human oversight available | [Yes/No -- CONFIRM] |
| Automated decision-making affecting individuals | [Yes/No -- describe] |

### 5.2 LLM provider and data handling

| Question | Answer |
|---|---|
| LLM provider | [from INTEGRATION_MAP.md] |
| Model hosting location | [EU / Non-EU / CONFIRM] |
| Data sent to LLM | [describe -- from DATA_MODEL.md and codebase] |
| LLM provider retains prompt data | [Yes/No/CONFIRM with provider] |
| Opt-out of model training | [Yes/No/CONFIRM with provider] |
| Customer data isolated from other tenants | [CONFIRM] |

### 5.3 OWASP LLM Top 10 controls

| Risk | Control in place | Status |
|---|---|---|
| LLM01 Prompt injection | Input guardrails / sanitisation | [Yes/Partial/GAP -- from codebase] |
| LLM02 Insecure output handling | Output sanitisation before rendering | [Yes/Partial/GAP] |
| LLM03 Training data poisoning | N/A -- using pre-trained models | [N/A or CONFIRM] |
| LLM04 Model denial of service | Rate limiting / retry bounds | [Yes/Partial/GAP -- from llm_retry.py] |
| LLM05 Supply chain vulnerabilities | Dependency scanning in CI | [CONFIRM] |
| LLM06 Sensitive info disclosure | PII scrubbing in logs | [Yes/Partial/GAP -- from codebase] |
| LLM07 Insecure plugin design | MCP tool scope limits | [Yes/Partial/GAP] |
| LLM08 Excessive agency | HITL gates enforced | [Yes -- from HITL_PROTOCOL.md] |
| LLM09 Overreliance | Human review required at key gates | [Yes -- Gate C01, D01] |
| LLM10 Model theft | API authentication on all LLM endpoints | [CONFIRM] |

---

## Section 6 -- Operational Security

### 6.1 Logging and monitoring

| Control | Status | Retention |
|---|---|---|
| Application logs | [Yes -- from codebase] | [CONFIRM] |
| Audit logs (who accessed what) | [CONFIRM] | [CONFIRM] |
| Security event monitoring | [CONFIRM] | |
| Alerting on anomalous access | [CONFIRM] | |
| PII excluded from logs | [Yes/Partial/GAP -- from codebase scan] | |

### 6.2 Vulnerability management

| Control | Status |
|---|---|
| Dependency scanning | [CONFIRM -- CI pipeline?] |
| Container image scanning | [CONFIRM] |
| Penetration testing | [CONFIRM -- last date, scope, provider] |
| SAST/DAST in CI pipeline | [CONFIRM] |
| CVE remediation SLA | [CONFIRM -- Critical: Xd, High: Xd] |

### 6.3 Incident response

| Item | Detail |
|---|---|
| Incident response plan documented | [CONFIRM] |
| GDPR breach notification SLA | 72 hours to supervisory authority |
| Customer notification SLA | [CONFIRM] |
| Security contact | [CONFIRM] |
| Last incident response test | [CONFIRM] |

---

## Section 7 -- Business Continuity

| Item | Detail |
|---|---|
| Recovery Time Objective (RTO) | [CONFIRM] |
| Recovery Point Objective (RPO) | [CONFIRM] |
| DR environment | [CONFIRM] |
| DR test frequency | [CONFIRM] |
| Backup frequency | [CONFIRM] |
| Backup encryption | [CONFIRM] |

---

## Section 8 -- Compliance Certifications

| Standard | Status | Scope | Certificate expiry |
|---|---|---|---|
| ISO 27001 | [CONFIRM -- Telia Group cert?] | [CONFIRM] | [CONFIRM] |
| SOC 2 Type II | [CONFIRM] | [CONFIRM] | [CONFIRM] |
| GDPR | In progress -- DPIA available | EU personal data | Ongoing |
| NIS2 | [CONFIRM -- Telia Group compliance?] | [CONFIRM] | Ongoing |
| DORA | [CONFIRM -- if serving financial sector] | [CONFIRM] | Ongoing |
| EU AI Act | Limited Risk -- transparency obligations | AI/LLM components | Ongoing |

---

## Section 9 -- Customer Confidentiality Options

| Option | Available | Notes |
|---|---|---|
| Data residency in EU only | [CONFIRM] | |
| Data residency in specific country | [CONFIRM] | |
| Dedicated tenant / data isolation | [CONFIRM] | |
| Customer-managed encryption keys | [CONFIRM] | |
| Audit log access for customer | [CONFIRM] | |
| Data deletion on contract end | [CONFIRM -- SLA?] |
| On-premises deployment option | [CONFIRM] | |
| Private AI model deployment | [CONFIRM] | |

---

## Section 10 -- Open Gaps and Remediation

[List all [GAP] items identified above with suggested remediation]

| Gap | Risk | Recommended action | Owner | Priority |
|---|---|---|---|---|
| [gap description] | [High/Medium/Low] | [what to do] | [team] | [sprint N] |

---

## Step 3 -- Save to repository

Save to: docs/governance/SECURITY_ASSESSMENT.md

Create docs/governance/ if it does not exist.

## Step 4 -- Tell the engineer

State:
1. File saved to docs/governance/SECURITY_ASSESSMENT.md
2. Count of [CONFIRM] items -- these need human verification
3. Count of [GAP] items -- these are missing controls
4. Recommended reviewers: Tech Lead, Security Lead, DPO
5. Git commands to commit:

```
git add docs/governance/SECURITY_ASSESSMENT.md
git commit -m "docs: add security assessment for [system name]

Generated by /generate-security-assessment from .ai/project/ context.
Status: DRAFT
CONFIRM items: [N] require human verification
GAP items: [N] require remediation or risk acceptance"
git push origin [current branch]
```

6. Next step: run /assess-security-compliance to get a gap analysis
   with specific remediation actions per compliance standard.

Do NOT publish to Confluence. Do NOT create Jira issues.
