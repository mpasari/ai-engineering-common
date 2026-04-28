# COMPLIANCE_STANDARDS.md

# AI Engineering Commons — Regulatory and Compliance Standards

# Version: 1.0.0

# Status: Active

# Last updated: 2026-04

# Owner: Security Lead + Legal/Compliance + CoE Core

---

## 1. Purpose

This file defines the regulatory and compliance requirements that apply to
all software built, reviewed, or modified with the assistance of agents in
the ai-engineering-commons system. It also defines which AI model providers
are approved for use, under what data classification conditions, and what
the audit trail requirements are for AI-assisted decisions.

Referenced by:

- `PRIVACY_GUARDRAILS.md` section 7 — for approved model provider routing
- `SECURITY_STANDARDS.md` section 10 — for regulatory basis of security rules
- `agents/COMPLIANCE_AGENT.md` — for audit report generation
- `agents/PROBLEM_MGMT_AGENT.md` — for regulatory constraint as a known
error reason
- All agents — for understanding the regulatory context of their outputs

---

## 2. Applicable regulations

Telia Group operates across multiple Nordic and European markets. The
following regulations apply to all software built on this platform.

### 2.1 General Data Protection Regulation (GDPR)

**Regulation:** EU 2016/679, effective May 2018
**Scope:** Any processing of personal data of EU/EEA residents
**Key requirements for engineering:**


| Requirement        | Engineering implication                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lawful basis       | Every feature that processes personal data must have a documented lawful basis (consent, contract, legal obligation, legitimate interest) before development begins           |
| Data minimisation  | Collect only the data fields strictly necessary for the stated purpose — agents must flag any data model that collects more than the spec requires                            |
| Purpose limitation | Data collected for purpose A must not be reused for purpose B without a new lawful basis — cross-purpose data flows require legal review                                      |
| Storage limitation | Personal data must not be retained beyond its defined retention period — all data models must include a retention policy                                                      |
| Right to erasure   | Any system storing personal data must support deletion by individual identifier — agents must generate soft-delete or anonymisation logic alongside any personal data storage |
| Data portability   | Personal data must be exportable in a machine-readable format — relevant for customer-facing systems                                                                          |
| Privacy by design  | Privacy controls are built in from the start, not added at the end — agents must generate privacy controls in the first iteration, not as a follow-up                         |


**GDPR breach notification:** If a security or privacy incident may involve
personal data exposure, the 72-hour notification window to the relevant
supervisory authority begins from the moment of discovery. Engineering teams
must notify the Security Lead and Legal immediately, not after investigation
is complete.

### 2.2 Norwegian Personal Data Act (Personopplysningsloven)

**Regulation:** Norwegian implementation of GDPR, effective July 2018
**Additional requirements beyond GDPR:**

- The Norwegian Data Protection Authority (Datatilsynet) is the lead
supervisory authority for Telia Norway processing
- Norwegian national identification numbers (fødselsnummer) are considered
sensitive personal data and require explicit legal basis for processing
- Health data processing requires notification to Datatilsynet in most cases
- Data transfers outside the EEA require Standard Contractual Clauses or
adequacy decision — cloud provider data residency must be verified

### 2.3 ePrivacy Directive (Cookie Law) — 2002/58/EC

**Scope:** Electronic communications, cookies, traffic data, location data
**Key requirements:**


| Requirement                       | Engineering implication                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Consent for cookies               | Non-essential cookies require prior informed consent — agents must not generate cookie-setting code without consent gate |
| Traffic data                      | Call detail records, IP addresses, and browsing behaviour are traffic data subject to strict retention limits            |
| Location data                     | Subscriber location may only be processed with consent or for specific permitted purposes                                |
| Confidentiality of communications | Interception and monitoring of communications requires explicit legal basis                                              |


### 2.4 Telecom-specific regulation

**Applicable frameworks:**


| Framework                                 | Scope                                                                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| EU Electronic Communications Code (EECC)  | Network access, consumer rights, security obligations for telecom operators                     |
| NIS2 Directive (EU 2022/2555)             | Cybersecurity requirements for essential entities — Telia is classified as essential under NIS2 |
| PTS (Post- och telestyrelsen) regulations | Swedish telecom regulator requirements for Telia Sweden                                         |
| Nkom (Nasjonal kommunikasjonsmyndighet)   | Norwegian telecom regulator requirements for Telia Norway                                       |
| BEREC guidelines                          | European regulatory consistency requirements                                                    |


**NIS2 engineering implications:**

- Incident reporting to national authorities within 24 hours for significant
incidents (initial notification), 72 hours for full report
- Supply chain security — third-party software components must be assessed
for security risk (feeds into DEPENDENCY_POLICY.md)
- Minimum security measures are mandatory, not optional — maps to
SECURITY_STANDARDS.md requirements
- Senior management accountability for cybersecurity — audit trails of
security decisions are a legal requirement

### 2.5 Lawful interception (ETSI LI standards)

Telia as a telecom operator is legally required to support lawful
interception under national law in each operating country.

**Engineering rules — absolute prohibitions:**

- No AI agent may process, generate, view, or analyse any data related
to lawful interception operations
- No AI-generated code may touch lawful interception interfaces,
databases, or communication channels
- Lawful interception systems are explicitly excluded from the scope of
ai-engineering-commons and must never be referenced in prompts
- Any agent that receives input containing lawful interception data must
apply the PRIVACY STOP procedure immediately

These rules are non-negotiable and supersede any task instruction.

---

## 3. Approved AI model providers

This section defines which AI providers agents may route prompts to,
based on the data classification of the content being processed.

### 3.1 Data classification tiers


| Tier         | Definition                                            | Examples                                                |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------- |
| Public       | Information intended for public release               | Marketing copy, public API docs, open-source code       |
| Internal     | Business information not for public release           | Internal specs, architecture docs, non-sensitive code   |
| Confidential | Sensitive business or personal information            | Customer data references, financial data, employee data |
| Restricted   | Highest sensitivity — regulatory or legal constraints | CDRs, lawful interception, legal hold material          |


### 3.2 Approved providers by data tier


| Provider                         | Public          | Internal        | Confidential        | Restricted  |
| -------------------------------- | --------------- | --------------- | ------------------- | ----------- |
| Azure OpenAI (Sweden Central)    | ✓ Approved      | ✓ Approved      | ✓ Approved with DPA | ✗ Forbidden |
| Azure OpenAI (other EU regions)  | ✓ Approved      | ✓ Approved      | Review required     | ✗ Forbidden |
| Claude API (Anthropic) via Azure | ✓ Approved      | ✓ Approved      | Review required     | ✗ Forbidden |
| GitHub Copilot (enterprise)      | ✓ Approved      | ✓ Approved      | ✗ Forbidden         | ✗ Forbidden |
| OpenAI API (direct)              | ✓ Approved      | Review required | ✗ Forbidden         | ✗ Forbidden |
| Any non-EU hosted provider       | Review required | Review required | ✗ Forbidden         | ✗ Forbidden |
| On-premises models (Telia infra) | ✓ Approved      | ✓ Approved      | ✓ Approved          | ✓ Approved  |


**DPA = Data Processing Agreement in place. Contact Security Lead to verify
current DPA status before routing Confidential data.**

**Review required = submit a request to Security Lead with the specific use
case before using. Do not route until approval is confirmed in writing.**

### 3.3 How agents determine routing

Agents assess content against these questions before routing any prompt:

1. Does the content contain personal data as defined in PRIVACY_GUARDRAILS.md
  section 2.1? → If yes: route to Azure OpenAI Sweden Central only, or
   use on-premises model. Do not route to GitHub Copilot or direct APIs.
2. Does the content contain telecom subscriber data (CDR, IMSI, IMEI,
  location)? → If yes: use on-premises models only. Do not route externally.
3. Does the content relate to lawful interception? → If yes: PRIVACY STOP.
  Do not process at all.
4. Is the content purely code with no personal data, credentials, or
  subscriber references? → Route to any approved provider for Internal tier.

When in doubt, route to the most restrictive approved option, not the most
convenient one.

---

## 4. AI decision audit requirements

As AI agents make recommendations and take actions on behalf of engineers,
a minimum audit trail is required for regulatory and governance purposes.

### 4.1 What must be logged for every agent action

Every agent action that results in a change to a system — creating a Jira
ticket, writing code, updating Confluence, executing a runbook step — must
produce a log entry containing:


| Field              | Required value                                                                        |
| ------------------ | ------------------------------------------------------------------------------------- |
| `timestamp`        | ISO 8601 UTC                                                                          |
| `agent_id`         | Agent name and commons version (from AGENT.md section 8 header)                       |
| `action_type`      | Category: code_generation, ticket_creation, confluence_write, runbook_execution, etc. |
| `journey_flow`     | Journey flow ID if applicable (J01–J15)                                               |
| `jira_ticket`      | Linked Jira ticket number if applicable                                               |
| `hitl_gate_passed` | Boolean — was a HITL gate cleared before this action                                  |
| `human_approver`   | Name/ID of the human who approved at the HITL gate, if applicable                     |
| `input_data_tier`  | Data classification tier of the input (Public/Internal/Confidential)                  |
| `model_provider`   | Which AI provider processed the prompt                                                |
| `outcome`          | Success/Failure/Partial                                                               |
| `output_reference` | Reference to the output (PR number, Confluence page ID, Jira ticket ID)               |


### 4.2 What must NOT be logged

- The content of prompts (may contain sensitive data)
- The full text of AI-generated outputs (may contain sensitive data)
- Personal data of any kind
- Credentials or secrets
- The contents of HITL gate decisions beyond approve/reject

### 4.3 Log retention

AI decision audit logs must be retained for a minimum of 2 years. This
aligns with NIS2 incident evidence requirements and internal audit cycles.
Logs are stored in the centralised logging platform, not in the repository.

### 4.4 Who can access audit logs


| Role                | Access level                                                           |
| ------------------- | ---------------------------------------------------------------------- |
| Security Lead       | Full read access — all agents, all teams                               |
| CoE Lead            | Full read access — all agents, all teams                               |
| Delivery Manager    | Read access — their team's agents only                                 |
| External auditor    | Read access — provided via controlled export, not direct system access |
| Individual engineer | Read access — their own agent actions only                             |
| AI agents           | No access — agents do not read audit logs                              |


---

## 5. Privacy by design requirements

Every feature that processes personal data must satisfy these requirements
before the Spec Writer Agent generates a technical spec. These are
pre-conditions, not post-conditions.

### 5.1 Required documentation before spec generation


| Document                           | Where                                         |
| ---------------------------------- | --------------------------------------------- |
| Lawful basis for each data field   | Jira story or linked Confluence spec          |
| Data retention period              | Data model section of technical spec          |
| Data subject rights implementation | Technical spec (erasure, portability, access) |
| Third-party data sharing           | Integration spec if data leaves Telia systems |
| Data residency                     | Explicitly stated in NFR section of spec      |


The Spec Writer Agent checks for these sections before generating a spec
for any feature touching personal data. If any are missing, the agent
produces a checklist of what is needed rather than proceeding.

### 5.2 Retention policy implementation

Every data model that stores personal data must include:

```java
// Example — user record with retention policy
@Entity
public class UserProfile {
    @Id
    private UUID id;

    private String displayName;         // retained while account active
    private String email;               // retained while account active

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;    // soft delete timestamp

    @Column(name = "anonymised_at")
    private LocalDateTime anonymisedAt; // when PII was replaced with pseudonyms

    @Column(name = "retention_expires_at")
    private LocalDateTime retentionExpiresAt; // when record must be purged
}
```

The Data Migration Agent must generate the corresponding retention
enforcement job alongside any data model that stores personal data.

### 5.3 Right to erasure implementation pattern

```java
// Required pattern — anonymise rather than delete where referential
// integrity requires the record to exist
@Transactional
public void anonymiseUserData(UUID userId) {
    UserProfile user = userRepository.findById(userId).orElseThrow();
    user.setDisplayName("Deleted User");
    user.setEmail("deleted+" + UUID.randomUUID() + "@deleted.invalid");
    // Replace all PII fields with non-identifying values
    user.setAnonymisedAt(LocalDateTime.now());
    userRepository.save(user);
    // Publish event so downstream services can anonymise their copies
    eventPublisher.publish(new UserAnonymisedEvent(userId));
    log.info("User {} anonymised per erasure request", userId);
}
```

Agents must generate the anonymisation event alongside the anonymisation
logic, so downstream services that hold copies of the data are notified.

---

## 6. Third-party and supply chain compliance

### 6.1 Software Bill of Materials (SBOM)

NIS2 requires awareness of supply chain risk. All services must maintain
an SBOM. The Pipeline Agent must generate SBOM output as part of the
build pipeline for every service.

```yaml
# Required in every service pipeline
- name: Generate SBOM
  uses: anchore/sbom-action@v0
  with:
    format: spdx-json
    output-file: sbom.spdx.json
```

The Vuln Scan Agent uses the SBOM as its input for dependency scanning.

### 6.2 Third-party data processors

Any third-party service that receives personal data from Telia systems
must have a Data Processing Agreement (DPA) in place before integration.
The Spec Writer Agent checks the INTEGRATION_MAP.md for the DPA field
on any integration that involves personal data. If the DPA field is
empty, the agent blocks spec generation and raises a Jira task to obtain
the DPA.

### 6.3 Open source licence compliance

The Dependency Policy defines permitted licences. Agents must not generate
code that introduces GPL v3 or AGPL dependencies into proprietary services.
Permitted licences for production dependencies: MIT, Apache 2.0, BSD 2/3
clause, ISC, LGPL (with isolation). Any other licence requires Legal review.

---

## 7. Incident and breach response obligations

### 7.1 Notification timelines


| Event type                              | Notification target                  | Timeline                           |
| --------------------------------------- | ------------------------------------ | ---------------------------------- |
| GDPR personal data breach               | Datatilsynet (Norway) / IMY (Sweden) | 72 hours from discovery            |
| NIS2 significant incident (initial)     | National CSIRT                       | 24 hours from discovery            |
| NIS2 significant incident (full report) | National CSIRT                       | 72 hours from discovery            |
| NIS2 final report                       | National CSIRT                       | 1 month after initial notification |
| Internal security incident              | Security Lead                        | Immediately on discovery           |
| Customer-affecting incident             | Customer notification per SLA        | Per contract terms                 |


### 7.2 What constitutes a significant incident under NIS2

An incident is significant if it has caused or can cause:

- Severe operational disruption to the service
- Financial loss to the organisation
- Significant damage to other natural or legal persons
- The incident affected more than a defined threshold of users or systems

The Security Lead makes the significance determination. Engineering teams
must report all incidents immediately and not pre-filter based on their
own significance assessment.

### 7.3 Evidence preservation

When an incident is declared:

- Do not delete or overwrite any logs, configurations, or data
- Do not restart or reprovisioning affected systems without Security Lead approval
- Capture system state immediately: running processes, network connections,
memory dumps if requested
- The Incident Response Agent produces an evidence preservation checklist
at incident declaration

---

## 8. Compliance checks agents must perform

### 8.1 Pre-spec checks (Spec Writer Agent)

Before generating a technical spec for any feature:


| Check                                                      | Action if failed                                        |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| Personal data identified in spec → lawful basis documented | Block spec generation, raise Jira task for legal review |
| Integration with new third party → DPA confirmed           | Block spec generation, raise Jira task for DPA          |
| Data leaves EEA → adequacy or SCC confirmed                | Block spec generation, flag to Security Lead            |
| Retention policy defined for any personal data stored      | Add retention policy section to spec before proceeding  |


### 8.2 Pre-merge checks (Peer Review Agent)

Before approving any PR:


| Check                                                 | Severity |
| ----------------------------------------------------- | -------- |
| No personal data hardcoded in tests or fixtures       | BLOCK    |
| Audit log generated for all agent actions in this PR  | WARN     |
| Retention policy enforced if new personal data stored | BLOCK    |
| SBOM generation present in pipeline if new service    | WARN     |
| No unapproved open source licences introduced         | BLOCK    |


### 8.3 Ongoing checks (Compliance Agent — quarterly)


| Check                                                   | Output                                     |
| ------------------------------------------------------- | ------------------------------------------ |
| All active integrations have current DPA                | Report of expired or missing DPAs          |
| SBOM for all services is current                        | Report of services missing SBOM generation |
| AI decision audit logs complete for review period       | Audit log summary for compliance review    |
| Known errors with regulatory constraint reason reviewed | KEDB export for legal review               |
| Open source licences in current dependencies            | Licence compliance report                  |


---

## 9. Version and review


| Attribute        | Value                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| File owner       | Security Lead + Legal/Compliance + CoE Core                                                                             |
| Review cadence   | Quarterly minimum — or immediately on regulatory change                                                                 |
| Last reviewed    | 2026-04                                                                                                                 |
| Next review due  | 2026-04                                                                                                                 |
| Approvers        | Security Lead, Legal/Compliance representative, CoE Lead                                                                |
| Change process   | PR to ai-engineering-commons, Security Lead + Legal approval required                                                   |
| Regulatory basis | GDPR (EU 2016/679), Personopplysningsloven, ePrivacy Directive 2002/58/EC, NIS2 (EU 2022/2555), EECC, ETSI LI standards |


---

## 10. Contacts


| Role                          | Responsibility                                                      |
| ----------------------------- | ------------------------------------------------------------------- |
| Security Lead                 | Technical security decisions, incident response, provider approvals |
| Legal/Compliance              | Regulatory interpretation, DPA management, breach notification      |
| Data Protection Officer (DPO) | GDPR accountability, supervisory authority liaison                  |
| CoE Lead                      | AI-specific compliance, audit trail governance                      |


*Specific contact names and details are maintained in the internal contact
directory, not in this file, to avoid stale information.*