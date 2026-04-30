# AI Engineering Commons — SDLC Scenarios
**Telia E&C AI · Champions Reference · April 2026**

> This document describes every engineering scenario the AI Engineering Commons framework covers. For each scenario it explains what triggers it, which slash commands to run, which agents are involved, and what guardrails are built in automatically. Engineers type one command — the framework handles the rest.

---

## Table of Contents

1. [How to read this document](#how-to-read)
2. [Scenario 01 — New Feature Delivery](#scenario-01)
3. [Scenario 02 — Bug Fix](#scenario-02)
4. [Scenario 03 — New Service (Greenfield)](#scenario-03)
5. [Scenario 04 — Brownfield Codebase Discovery](#scenario-04)
6. [Scenario 05 — Performance Issue](#scenario-05)
7. [Scenario 06 — Security Finding](#scenario-06)
8. [Scenario 07 — Database Migration](#scenario-07)
9. [Scenario 08 — Engineer Onboarding](#scenario-08)
10. [Scenario 09 — Production Incident](#scenario-09)
11. [Scenario 10 — Architecture Decision](#scenario-10)
12. [HITL Gate Reference](#hitl-gates)
13. [Agent Reference](#agent-reference)
14. [Quick Command Reference](#quick-reference)

---

## How to read this document {#how-to-read}

Each scenario follows the same structure:

| Section | What it tells you |
|---|---|
| **Trigger** | What situation or event starts this workflow |
| **Purpose** | What problem this scenario solves |
| **Steps** | The commands to run in order |
| **HITL Gates** | Where a human must approve before the workflow continues |
| **Agents involved** | Which AI agent skill files are active |
| **Guardrails** | What security, compliance, and quality checks are built in automatically |
| **Output** | What is produced at the end |

### How commands work

Engineers type a slash command in GitHub Copilot Chat (Agent mode):

```
/write-spec SPOCKT-412
```

Copilot reads the project context from `.ai/project/` files, applies the relevant agent skill file, calls Jira and Confluence via MCP, and executes the full protocol. The engineer types two words. The framework does the rest.

### HITL gates

Every gate is a human approval checkpoint. The AI presents the gate output and waits. Work does not continue until a human approves.

```
◆ = HITL gate — human approval required before next step
```

---

## Scenario 01 — New Feature Delivery {#scenario-01}

### Trigger
Product brief, meeting notes, a Jira story, or a stakeholder request. Any new capability to be built.

### Purpose
Take a rough idea through the full delivery lifecycle — from brief to merged, validated code — with security, compliance, and quality built in at every step.

### Steps

```
/draft-brief          Structure the idea into a formal service brief
/analyse-capabilities Identify what needs building and in what order
◆ Architect review    Review capability sequence before creating epics
/draft-epics [key]    Create Jira epics with business outcome statements
/draft-stories [key]  Decompose first epic into sprint-sized stories with ACs
◆ BA/PO review        Confirm acceptance criteria are correct (Gate C02)
/write-spec [key]     Generate technical specification in Confluence
◆ Tech Lead review    Approve the spec before code is generated (Gate C01)
/generate-code [key]  Generate production-ready code from the approved spec
/review-pr [number]   Run automated peer review — security, performance, style
◆ Tech Lead review    Approve the PR (Gate D01)
/validate-story [key] Execute all acceptance criteria against test environment
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| C02 | BA or Product Owner | Acceptance criteria are correct and testable |
| C01 | Tech Lead | Spec is accurate, safe, and complete |
| D01 | Tech Lead | Code matches spec, no BLOCK findings |

### Agents involved

- **Orchestrator Agent** — routes the workflow and manages gate sequencing
- **Story Drafter Agent** — creates epics and stories with Given/When/Then ACs
- **Spec Writer Agent** — generates technical specifications with pre-spec compliance checks
- **Code Gen Agent** — reads the approved spec and generates layered code (domain → application → API)
- **Peer Review Agent** — applies S01-S20 security checklist and P01-P15 performance checklist
- **Feature Validation Agent** — executes ACs against the test environment

### Guardrails (automatic)

- GDPR pre-spec check — flags personal data fields before spec is written
- DPA check — flags new external integrations that need data processing agreement
- S01-S20 security checklist on every PR
- Secrets scan on every PR — zero tolerance for exposed credentials
- TMForum schema validation for API changes
- AC execution — story cannot close without all ACs passing

### Output

```
service-brief.md          Committed to project root
capability-analysis.md    Committed to project root
epics.md                  Committed + 8 epics in Jira
stories-[key].md          Committed + stories in Jira with Given/When/Then ACs
Confluence spec page      Linked to Jira story
Feature branch + PR       Code committed, PR reviewed
Story status              Done (all ACs passed)
```

---

## Scenario 02 — Bug Fix {#scenario-02}

### Trigger
Bug reported in Jira, Slack alert, customer complaint, or a failing test in CI.

### Purpose
Turn a vague bug report into an enriched, classified ticket — then fix it with a mandatory regression test so it cannot recur.

### Steps

```
/triage-bug [key]     Enrich the bug: severity (P0-P3), affected module, root cause hypotheses
/explain-module [name] Understand the code before touching it
/write-spec [key]     Generate fix specification
◆ Tech Lead review    Approve the fix approach (Gate C01)
/generate-tests [key] Write the regression test first (red → green discipline)
/generate-code [key]  Generate the fix
/review-pr [number]   Automated peer review
◆ Tech Lead review    Approve the PR (Gate D01)
/validate-story [key] Confirm all ACs pass including the regression test
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| C01 | Tech Lead | Fix approach is correct and does not introduce new issues |
| D01 | Tech Lead | Fix is minimal, regression test is meaningful |

### Agents involved

- **Bug Triage Agent** — classifies severity, identifies affected module, checks KEDB for known error match
- **Legacy Explainer Agent** — explains the affected code before any changes are made
- **Spec Writer Agent** — generates the fix specification
- **Test Gen Agent** — writes the regression test (must fail before fix, pass after)
- **Code Gen Agent** — generates the minimal fix
- **Peer Review Agent** — reviews the fix PR

### Guardrails (automatic)

- KEDB check — if this bug has occurred before, the workaround is surfaced immediately and no new investigation is needed
- Severity classification P0-P3 — P0 triggers immediate on-call notification
- Regression test is mandatory — a bug fix without a regression test is rejected at Gate D01
- Secrets scan on every PR

### Output

```
Jira ticket             Enriched with severity, module, hypotheses, reproduction steps
Confluence spec         Fix approach documented
Regression test         Committed alongside the fix
PR                      Reviewed, Gate D01 approved
Jira story              Done with regression test linked as evidence
KEDB entry              Created if this is a recurring bug pattern
```

---

## Scenario 03 — New Service (Greenfield) {#scenario-03}

### Trigger
Business decision to build a net-new service. Architect approval has been obtained or is being sought.

### Purpose
Scaffold a production-ready new service with correct structure, CI/CD, observability, and initial architecture documentation — before a single line of business logic is written.

### Steps

```
◆ Architect approval  Present gate B01 — new service justified and approach agreed
/draft-epics [key]    Create foundation epics in Jira
npx aec init          Bootstrap the project with commons framework
                      Creates .ai/project/ files, .github/prompts/, CLAUDE.md
Fill .ai/project/     Engineer fills in ARCHITECTURE_OVERVIEW.md, MODULE_REGISTRY.md etc.
npx aec update        Regenerate tool configs with project context
◆ ADR review          Architect approves initial technology ADRs (Gate B05)
/draft-stories [key]  Create foundation sprint stories
/write-spec [key]     Spec each foundation story
/setup-observability  Create Grafana dashboards, alert rules, Confluence runbooks
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| B01 | Architect | New service is justified, approach is correct |
| B05 | Architect | Technology ADRs are sound before code begins |

### Agents involved

- **Orchestrator Agent** — manages the greenfield sequence
- **Story Drafter Agent** — creates foundation epics and stories
- **Arch Doc Agent** — generates initial C4 architecture pages and ADR scaffolds
- **Observability Setup Agent** — creates Grafana dashboards and alert runbooks

### Guardrails (automatic)

- Architect gate before any code — no scaffold without B01 approval
- ADR required for every major technology choice
- SECURITY_BASELINE.md compliance before first deployment
- Observability must be configured before production deployment
- No production deployment without SRE Agent registration

### Output

```
GitHub repository       Scaffolded with correct structure
.ai/project/ files      Filled in — agents have project context from day 1
CLAUDE.md               Generated — full agent context for Claude Code
.github/prompts/        22 slash commands available in Copilot
Initial ADRs            Published to Confluence, status Proposed → Accepted
Foundation stories      In Jira with Given/When/Then ACs
Grafana dashboards      Overview and SLO dashboards live
Confluence runbooks     One per alert rule
```

---

## Scenario 04 — Brownfield Codebase Discovery {#scenario-04}

### Trigger
Team inherits an existing codebase with no `.ai/project/` files, no commons setup, and limited documentation.

### Purpose
Discover the full structure of an unfamiliar codebase in one automated scan — populating all project context files so every subsequent AI interaction is project-aware from the start.

### Steps

```
npx aec init          Install commons and create stub project files
/run-brownfield-scan  Execute 7-phase automated discovery scan
◆ Tech Lead review    Review and correct discovered content (Gate C01)
Fill gaps             Engineer adds what the scan could not discover
npx aec update        Regenerate tool configs with discovered context
/explain-module DEEP  Deep analysis of any High or Critical risk modules
/raise-problem        Create KEDB entries for High severity tech debt
CHECK_DEPENDENCIES    Scan all dependencies for CVEs — triage findings
```

### The 7 scan phases

| Phase | What it does |
|---|---|
| 1 | Language and framework detection |
| 2 | Repository structure mapping — Active vs Legacy module classification |
| 3 | Integration discovery — HTTP clients, Kafka, database connections |
| 4 | Data model discovery — entity classes, PII field identification |
| 5 | Technical debt identification — large files, TODO/FIXME, outdated deps |
| 6 | **Credential scan — STOPS if exposed credentials found** |
| 7 | Output all `.ai/project/` files, create Confluence architecture page (draft) |

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| C01 | Tech Lead | Discovered content is accurate — correct module status, DPA status, PII classification |
| E09 | Security Lead | Dependency vulnerability remediation plan approved |

### Agents involved

- **Brownfield Discovery Agent** — runs the 7-phase scan
- **Legacy Explainer Agent** — deep analysis of High/Critical risk modules
- **Vuln Scan Agent** — CVE triage on all dependencies
- **Dependency Mapper Agent** — maps cross-module and cross-service dependencies
- **Problem Management Agent** — creates KEDB entries for High severity debt

### Guardrails (automatic)

- Phase 6 halts on credential detection — rotation required before proceeding
- PII fields identified and flagged for retention policy
- High/Critical risk modules flagged before anyone touches them
- DPA status checked for all external integrations

### Output

```
.ai/project/MODULE_REGISTRY.md      All modules with Active/Legacy/Deprecated status
.ai/project/INTEGRATION_MAP.md      All integrations with DPA status
.ai/project/DATA_MODEL.md           All entities with PII field flags
.ai/project/TECH_DEBT_REGISTRY.md   High severity debt items
Confluence architecture page         Draft C4 Level 1 and Level 2 (pending Tech Lead review)
Jira tech debt stories               One per High severity item
```

---

## Scenario 05 — Performance Issue {#scenario-05}

### Trigger
Grafana alert fires — P95 latency above SLO threshold, error budget burning, or throughput degradation detected.

### Purpose
Move from a production signal to a root cause hypothesis to a validated fix — faster than manual investigation, with performance standards enforced on the fix.

### Steps

```
/sre-diagnose [service] Read Grafana signals, correlate with recent deployments
                        Produce ranked root cause hypotheses
/explain-module [name]  Understand the affected code before changing it
/write-spec [key]       Generate performance fix specification
◆ Tech Lead review      Approve the fix approach (Gate C01)
/generate-code [key]    Generate the fix
/review-pr [number]     Review PR — P01-P15 performance checklist applied
◆ Tech Lead review      Approve the PR (Gate D01)
/validate-story [key]   Confirm fix resolves the performance AC
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| C01 | Tech Lead | Root cause is correct, fix approach is sound |
| D01 | Tech Lead | Fix is correct, no new N+1 queries or unbounded lists introduced |

### Agents involved

- **SRE Agent** — reads Grafana signals, correlates deployment timing, produces diagnosis package
- **Performance Agent** — applies P01-P15 checklist to the fix
- **Legacy Explainer Agent** — explains the affected module if unfamiliar
- **Spec Writer Agent** — generates the performance fix spec
- **Peer Review Agent** — reviews the fix PR

### Guardrails (automatic)

- P01-P15 performance checklist on every PR — N+1 queries, missing pagination, missing timeouts are BLOCK findings
- Runbook linked to alert before the alert exists in production
- SLO dashboard auto-updated when fix is deployed
- Root cause hypothesis ranked by probability — engineer does not start from a blank page

### Output

```
Grafana diagnosis       Signals, deployment correlation, ranked hypotheses
Confluence spec         Fix approach documented
PR                      Reviewed with P01-P15 applied
SLO dashboard           Updated to reflect new performance baseline
Story                   Done with performance regression test committed
```

---

## Scenario 06 — Security Finding {#scenario-06}

### Trigger
Secrets scan, SAST tool, CVE in dependency, or Peer Review Agent returns a BLOCK finding on a PR.

### Purpose
Ensure every security finding is classified, routed to the right approver, fixed with the correct urgency, and documented — with zero tolerance for BLOCK findings reaching main branch.

### Steps

```
/scan-secrets [path]      Scan for exposed credentials — BLOCK if found
                          If credential found: rotate immediately (assume compromised)
/review-security [file]   Apply S01-S20 security checklist to file or PR
◆ Security Lead review    BLOCK findings require Security Lead approval (Gate D02)
/write-spec [key]         Generate security fix specification
◆ Security Lead review    Auth/security changes need Security Lead sign-off (Gate C05)
/generate-code [key]      Generate the fix
/review-pr [number]       Peer review — confirm BLOCK findings resolved
◆ Tech Lead review        Approve the PR (Gate D01)
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| D02 | Security Lead | BLOCK security finding acknowledged, remediation plan approved |
| C05 | Security Lead | Auth or security-critical change is safe |
| D01 | Tech Lead | All BLOCK findings resolved, no new issues introduced |

### Agents involved

- **Secrets Scan Agent** — scans for 15+ credential patterns including AWS keys, GitHub PATs, JWT secrets
- **Security Review Agent** — applies full S01-S20 checklist
- **CVE Triage Agent** — classifies CVE severity, identifies affected code paths
- **Vuln Scan Agent** — scans dependency tree against NVD

### Guardrails (automatic)

- Credential rotation is mandatory on any exposure — assuming compromise
- S01-S20 applied to every PR regardless of risk level
- No merge with any BLOCK finding — pipeline fails
- SECURITY_BASELINE.md compliance checked before production deployment
- Suppression files require Security Lead approval with mandatory expiry date

### Security checklist categories (S01-S20)

| S01-S12 | BLOCK — must fix before merge |
|---|---|
| S01 | No hardcoded credentials |
| S02 | All endpoints authenticated |
| S03 | Input validation on all user input |
| S04 | Parameterised queries — no SQL concatenation |
| S05 | HTTPS only, TLS 1.2+ |
| S06 | No PII in logs |
| S07 | CSRF protection on state-changing endpoints |
| S08 | Secure headers (HSTS, CSP, X-Frame-Options) |
| S09 | No dangerous functions (eval, exec, system) |
| S10 | Rate limiting on public endpoints |
| S11 | Error messages do not expose internals |
| S12 | No unpatched Critical/High CVEs in dependencies |

| S13-S20 | WARN — Tech Lead awareness required |
|---|---|
| S13 | JWT algorithm is RS256 or ES256 (not HS256) |
| S14 | Session timeout configured |
| S15 | Dependency suppressions have expiry dates |
| ... | |

### Output

```
Jira security ticket    Created for every BLOCK finding
Credential rotation     Completed before any other work continues
Security review comment Posted to PR with BLOCK/WARN/INFO classification
Fix PR                  All BLOCKs resolved, Gate D01 approved
SECURITY_BASELINE check Completed before next production deployment
```

---

## Scenario 07 — Database Migration {#scenario-07}

### Trigger
A story or spec requires adding a table, adding a column, changing a data type, or any other schema change.

### Purpose
Generate a safe, zero-downtime database migration with a mandatory rollback script — applied through the correct expand-contract pattern when needed, with DBA approval before execution.

### Steps

```
/write-spec [key]         Spec the feature including data model changes
◆ Tech Lead review        Approve the spec including data model section (Gate C01)
/generate-migration [key] Generate Flyway forward migration + rollback script + execution plan
◆ Tech Lead + DBA review  Approve migration before it runs anywhere (Gate C04)
/generate-code [key]      Generate code alongside the migration
/review-pr [number]       Review PR — migration validation applied
◆ Tech Lead review        Approve the PR (Gate D01)
/validate-story [key]     Execute ACs including migration correctness assertions
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| C01 | Tech Lead | Data model changes are correct, PII fields documented |
| C04 | Tech Lead + DBA | Migration is safe to run, rollback is correct, downtime risk assessed |
| D01 | Tech Lead | Migration and code are consistent |

### Agents involved

- **Spec Writer Agent** — generates spec with data model section including PII retention policy
- **Data Migration Agent** — generates Flyway scripts with safety checks
- **Peer Review Agent** — validates migration patterns

### Guardrails (automatic)

- Every PII column must have a retention comment — migration fails Gate C04 without it
- Rollback script is mandatory for every forward migration — no exceptions
- NOT NULL column additions automatically flagged — expand-contract pattern required
- Hard DELETE is blocked — soft delete with `deleted_at` timestamp only
- Migration version numbering checked — no gaps or conflicts with existing history
- DBA approval gate (C04) before migration runs in any environment

### Migration safety checks

| Check | Rule |
|---|---|
| PII classification | Every personal data column has GDPR classification comment |
| Retention policy | Every personal data column has retention period documented |
| Rollback | Every migration has a working rollback script |
| NOT NULL | New NOT NULL columns use expand-contract (default value first, constraint later) |
| Hard delete | Any DELETE statement triggers BLOCK finding |
| Index coverage | New FK columns and common WHERE columns have corresponding indexes |

### Output

```
V{N}__description.sql       Forward migration committed
V{N}__rollback_description.sql  Rollback script committed
Confluence execution plan   Zero-downtime steps documented
Gate C04 approval           DBA sign-off recorded in Jira
PR                          Reviewed and Gate D01 approved
Story                       Done with migration correctness assertion in test suite
```

---

## Scenario 08 — Engineer Onboarding {#scenario-08}

### Trigger
New engineer joins the team — day 1 or first week.

### Purpose
Get a new engineer productive quickly with a personalised guide, oriented in the codebase, and through their first PR — using AI assistance from the start.

### Steps

```
/start-onboarding name="[name]" role="[backend|frontend|fullstack]"
                          Generate personalised onboarding guide in Confluence
/explain-module [name]    Orient in the most important modules before touching code
                          High/Critical risk modules are flagged with specific guidance
Starter story             Pick a low-risk story from the backlog (Active module, good coverage)
/write-spec [key]         Generate spec for the starter story
◆ Tech Lead review        Approve the spec (Gate C01)
/generate-code [key]      Generate the code
/review-pr [number]       Full automated review of first PR
◆ Tech Lead review        Approve the first PR (Gate D01)
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| C01 | Tech Lead | First spec is correct — coaching opportunity |
| D01 | Tech Lead | First PR meets standards — explicit coaching on any WARNs |

### Agents involved

- **Onboarding Agent** — generates personalised Confluence onboarding guide with week-by-week plan
- **Legacy Explainer Agent** — explains modules the engineer will touch, flags risks
- **Story Drafter Agent** — identifies suitable starter stories from the backlog
- **Peer Review Agent** — provides detailed, educational review of the first PR

### Guardrails (automatic)

- High/Critical risk modules are flagged before day 1 — new engineer never accidentally touches dangerous code first
- TECH_DEBT_REGISTRY surfaced in onboarding — known risks visible from the start
- AI tooling setup included in the onboarding guide — engineer is commons-enabled from day 1
- First PR receives the same full automated review as any PR — no shortcuts

### Output

```
Confluence onboarding guide   Week 1-4 plan, key contacts, module orientation, AI tooling setup
Module analysis               Entry points, risks, and guidance for modules engineer will touch
Starter story                 In Jira with ACs — appropriate scope for first sprint
First PR                      Reviewed with educational commentary on any WARNs
Story                         Done — engineer has completed a full delivery cycle in week 1-2
```

---

## Scenario 09 — Production Incident {#scenario-09}

### Trigger
Production alert fires for P0 (service down, data loss, all users affected) or P1 (major feature broken, significant user impact).

### Purpose
Coordinate a structured incident response — from declaration through diagnosis and fix — with compliance obligations checked, stakeholders informed, and the root cause documented to prevent recurrence.

### Steps

```
/declare-incident [P0|P1] "[description]"
◆ Gate A09                Confirm P0 or P1 classification before proceeding
                          On P0: NIS2 and GDPR notification obligations checked immediately
                          Jira incident ticket created, Confluence war room page opened
                          Stakeholder notification sent with Jira and Confluence links
/sre-diagnose [service]   Diagnose from Grafana signals — ranked hypotheses in 5 minutes
                          5-minute (P0) or 10-minute (P1) timeline updates begin automatically
/generate-code [key]      Generate hotfix from approved spec
/review-pr [number]       Expedited review — BLOCK findings only (WARNs waived by Tech Lead)
◆ Tech Lead review        Approve hotfix PR (Gate D01)
/raise-problem            Create KEDB problem record — root cause, workaround, fix decision
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| A09 | On-call Tech Lead | P0 or P1 classification confirmed — prevents false alarms using full incident process |
| D01 | Tech Lead | Hotfix is safe to deploy — expedited but not skipped |

### Agents involved

- **Incident Response Agent** — manages declaration, stakeholder comms, timeline updates, compliance checks
- **SRE Agent** — reads Grafana, correlates deployments, produces diagnosis package
- **Problem Management Agent** — creates KEDB record, documents root cause, records fix decision
- **Peer Review Agent** — expedited review focusing on BLOCK findings only

### Guardrails (automatic)

- NIS2 notification obligations checked for P0 — regulatory deadline flagged if applicable
- GDPR notification checked if personal data may be involved
- Timeline updates run automatically — stakeholders never need to chase for status
- KEDB auto-match — if this pattern has occurred before, the workaround is surfaced immediately
- Runbook must exist before alert fires — alerts without runbooks are rejected during observability setup
- Post-incident: problem record created automatically — recurring issues cannot be ignored

### Incident severity guide

| Severity | Criteria | Response time | Timeline updates |
|---|---|---|---|
| P0 | Production down, data loss, all users | Immediate | Every 5 minutes |
| P1 | Major feature broken, significant subset | < 15 minutes | Every 10 minutes |
| P2 | Feature degraded, workaround available | < 1 hour | Every 30 minutes |
| P3 | Minor issue, no user impact | Next business day | On resolution |

### Output

```
Jira incident ticket        Created with P0/P1 label and severity classification
Confluence war room page    Live timeline, stakeholders, diagnosis, actions
Stakeholder notification    Sent to on-call, DM, and relevant stakeholders
Grafana diagnosis           Ranked hypotheses linked from war room page
Hotfix PR                   Reviewed and deployed
KEDB problem record         Root cause documented, fix decision recorded
Post-incident review        Scheduled automatically for P0 and P1
```

---

## Scenario 10 — Architecture Decision {#scenario-10}

### Trigger
A significant technical choice that is hard to reverse — technology selection, architectural pattern, integration approach, or deviation from Telia standards.

### Purpose
Ensure every major technical decision is documented with context, options considered, and reasoning — so future engineers understand why, not just what. Validated against the Tech Radar before commitment.

### Steps

```
/create-adr "[title]"     Scaffold an ADR page in Confluence (status: Proposed)
/analyse-impact [key]     Assess blast radius — which teams and systems are affected
                          Tech Radar checked — flag if proposed technology is on Hold
◆ Architect review        Review and approve the ADR (Gate B05)
                          ADR status changes from Proposed → Accepted
/refresh-arch-docs        Update C4 Level 1 and Level 2 Confluence pages
                          Update ADR index
Tech Radar PR             If decision introduces a new technology, raise PR to update radar
```

### HITL Gates

| Gate | Approver | What they check |
|---|---|---|
| B05 | Architect | Decision is sound, alternatives were genuinely considered, consequences are accepted |

### Agents involved

- **Arch Doc Agent** — scaffolds ADR using standard template, updates C4 diagrams and ADR index
- **Dependency Mapper Agent** — identifies affected teams and systems
- **Orchestrator Agent** — manages the approval routing

### Guardrails (automatic)

- Tech Radar checked before commitment — Hold technologies require explicit justification
- ADR stays Proposed until Architect approves — no implementation before Gate B05
- C4 diagrams auto-updated on integration or module changes
- Breaking changes flagged to all downstream consumers before implementation
- ADR index kept current — no orphaned decisions

### ADR structure (auto-generated)

Every ADR scaffold includes:

```
Status:           Proposed → Accepted (after Gate B05)
Context:          Why this decision is needed now
Decision:         What was decided (one sentence)
Options considered: A (chosen), B, C with pros/cons
Consequences:     Positive, negative, and accepted risks
Review date:      When to revisit (default: 12 months)
```

### Output

```
Confluence ADR page         Published with all sections, status Proposed
Dependency impact analysis  Affected teams notified
Confluence C4 pages         Updated to reflect architectural change
ADR index                   Updated with new entry
Tech Radar PR               Raised if new technology introduced (if applicable)
Gate B05 record             Architect approval documented in Confluence
```

---

## HITL Gate Reference {#hitl-gates}

All gates are defined in `foundation/HITL_PROTOCOL.md`. This table summarises the gates referenced across the 10 scenarios.

| Gate | Stage | Approver | Purpose |
|---|---|---|---|
| A09 | Operations | On-call Tech Lead | Incident severity classification |
| B01 | Planning | Architect | New service justified and approach agreed |
| B02 | Planning | Security Lead | New external integration — DPA required |
| B05 | Planning | Architect | Technology ADRs approved before coding |
| C01 | Spec | Tech Lead | Technical specification approved before code generation |
| C02 | Spec | BA or Product Owner | Acceptance criteria correct and complete |
| C04 | Spec | Tech Lead + DBA | Database migration safe to run |
| C05 | Spec | Security Lead | Auth or security-critical change approved |
| D01 | Engineering | Tech Lead | PR approved — no BLOCK findings |
| D02 | Engineering | Security Lead | Security BLOCK finding acknowledged and remediation plan agreed |
| E09 | Operations | Security Lead | Dependency vulnerability remediation plan approved |

---

## Agent Reference {#agent-reference}

The commons includes 40 specialist agent skill files. The most commonly used agents across the 10 scenarios:

| Agent | ID | Primary scenarios |
|---|---|---|
| Orchestrator Agent | A01 | 01, 03, 10 |
| Story Drafter Agent | A03 | 01, 02, 03, 08 |
| Legacy Explainer Agent | A05 | 02, 04, 05, 08 |
| Dependency Mapper Agent | A06 | 04, 10 |
| Spec Writer Agent | A07 | 01, 02, 05, 06, 07 |
| Code Gen Agent | A09 | 01, 02, 06, 07, 09 |
| Bug Triage Agent | A11 | 02 |
| Brownfield Discovery Agent | A14 | 04 |
| Performance Agent | A19 | 05 |
| Secrets Scan Agent | A25 | 06 |
| Security Review Agent | A22 | 06 |
| CVE Triage Agent | A23 | 06 |
| Vuln Scan Agent | A24 | 04, 06 |
| Peer Review Agent | A27 | 01, 02, 05, 06, 07, 08, 09 |
| Incident Response Agent | A28 | 09 |
| SRE Agent | A29 | 05, 09 |
| Problem Management Agent | A30 | 02, 09 |
| Arch Doc Agent | A31 | 03, 10 |
| Onboarding Agent | A33 | 08 |
| Data Migration Agent | A35 | 07 |
| Feature Validation Agent | A36 | 01, 02, 07 |

---

## Quick Command Reference {#quick-reference}

| Command | Scenario | What it does |
|---|---|---|
| `/draft-brief` | 01, 03 | Structure rough idea into formal service brief |
| `/analyse-capabilities` | 01, 03 | Capability map with sequencing and risks |
| `/draft-epics [key]` | 01, 03 | Create Jira epics with business outcome statements |
| `/draft-stories [key]` | 01, 02, 03, 08 | Decompose epic into sprint stories with ACs |
| `/write-spec [key]` | 01-07 | Technical spec in Confluence — triggers Gate C01 |
| `/generate-code [key]` | 01, 02, 06, 07, 09 | Code from approved spec |
| `/generate-migration [key]` | 07 | Flyway migration + rollback + execution plan |
| `/generate-tests [key]` | 02 | Test suite — regression tests for bug fixes |
| `/review-pr [number]` | 01-09 | Automated peer review — security, performance, style |
| `/validate-story [key]` | 01, 02, 05, 07 | Execute ACs against test environment |
| `/triage-bug [key]` | 02 | Enrich bug — severity, module, KEDB check |
| `/explain-module [name]` | 02, 04, 05, 08 | Understand code before touching it |
| `/run-brownfield-scan` | 04 | 7-phase codebase discovery |
| `/sre-diagnose [service]` | 05, 09 | Production signal diagnosis |
| `/scan-secrets [path]` | 06 | Credential and secret detection |
| `/review-security [file]` | 06 | S01-S20 security checklist |
| `/declare-incident [severity]` | 09 | Start formal incident response |
| `/raise-problem [keys]` | 02, 09 | Create KEDB problem record |
| `/create-adr "[title]"` | 10 | Scaffold Architecture Decision Record |
| `/analyse-impact [key]` | 10 | Blast radius analysis |
| `/refresh-arch-docs` | 01, 03, 10 | Update C4 Confluence pages |
| `/start-onboarding` | 08 | Personalised engineer onboarding guide |

---

*Generated by the Telia E&C AI team · April 2026 · commons v1.0.0*
*Repository: github.com/telia-company/ai-engineering-common*
