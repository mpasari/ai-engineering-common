# MULTI_AGENT_SETUP.md
# AI Engineering Commons -- Multi-Agent Topology and Routing
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Purpose

This file defines how the 40 agents in the ai-engineering-commons system
are organised, how tasks are routed between them, and how they coordinate
across journey flows. The Orchestrator Agent (A01) reads this file as its
primary routing guide.

Referenced by:
- `agents/ORCHESTRATOR_AGENT.md` -- primary consumer
- `AGENT_REGISTRY.md` -- agent definitions that this file routes between
- `AGENT_HANDOVER.md` -- handover format used at every routing point
- All agent skill files -- each references its position in the topology

This file answers three questions for the Orchestrator:
1. Which agent handles a given task type?
2. Which agents work in sequence for a given journey flow?
3. What happens when an agent cannot complete its task?

---

## 2. Topology overview

The agent system has three layers:

```
Layer 1 -- Orchestration
  A01 Orchestrator        -- routes all tasks
  A02 Cross-team Coord    -- monitors cross-team dependencies (parallel)

Layer 2 -- Specialist agents (invoked by Orchestrator)
  G02 Planning            -- A03 Planning, A04 Story Drafter,
                             A05 Estimation, A06 Dependency Mapper
  G03 Specification       -- A07 Spec Writer, A08 AC Executor
  G04 Engineering         -- A09 Code Gen, A10 Refactor, A11 Legacy Explainer,
                             A12 Data Migration, A13 Greenfield Scaffold,
                             A14 Brownfield Discovery
  G05 QA and testing      -- A15 Test Gen, A16 Feature Validation,
                             A17 Bug Triage, A18 Performance, A19 Accessibility
  G06 Event-driven        -- A20 Kafka Skill, A21 Event Schema
  G07 Security            -- A22 Security Review, A23 Vuln Scan, A24 CVE Triage,
                             A25 Secrets Scan, A26 Compliance
  G08 Review and release  -- A27 Peer Review, A28 Release, A29 Pipeline
  G09 Documentation       -- A30 Documentation, A31 Arch Doc,
                             A32 Stakeholder Report, A33 Onboarding
  G10 Module management   -- A34 Module Lifecycle, A35 Feature Management
  G11 Infrastructure      -- A36 Infra, A37 Observability Setup
  G12 Operations          -- A38 SRE, A39 Incident Response, A40 Problem Management

Layer 3 -- Always-on autonomous agents (not routed -- self-triggering)
  A38 SRE Agent           -- continuous observe-analyse-decide-act loop
  A02 Cross-team Coord    -- periodic dependency health check
```

---

## 3. Task routing rules

The Orchestrator uses these rules to select the first agent for any task.
Rules are evaluated top to bottom -- first match wins.

### 3.1 Primary routing table

| Task keyword or context | First agent | Journey flow |
|---|---|---|
| "bug", "defect", "error reported", "not working" | A17 Bug Triage | J01 |
| "change request", "CR", "modify existing" | A06 Dependency Mapper | J02 |
| "new feature", "implement story", "build" | A07 Spec Writer | J03 |
| "epic", "PI planning", "large scope" | A06 Dependency Mapper | J04 |
| "integration", "connect to", "third-party API" | A06 Dependency Mapper | J05 |
| "slow", "performance", "latency", "SLO breach" | A18 Performance | J06 |
| "vulnerability", "CVE", "security scan" | A23 Vuln Scan | J07 |
| "upgrade", "library update", "version bump" | A06 Dependency Mapper | J08 |
| "partner changed", "integration broke", "API changed" | A06 Dependency Mapper | J09 |
| "new project", "greenfield", "start from scratch" | A13 Greenfield Scaffold | J10 |
| "existing codebase", "brownfield", "take over" | A14 Brownfield Discovery | J11 |
| "incident", "production down", "P0", "P1" | A39 Incident Response | J12 |
| "database migration", "schema change" | A12 Data Migration | J13 |
| "new engineer", "onboarding", "first day" | A33 Onboarding | J14 |
| "known error", "problem record", "KEDB" | A40 Problem Management | J15 |
| "generate tests", "test coverage" | A15 Test Gen | J03 subset |
| "review PR", "check code" | A27 Peer Review | J03 subset |
| "release notes", "changelog" | A28 Release | J03 subset |
| "architecture doc", "C4 diagram" | A31 Arch Doc | any |
| "feature flag", "rollout" | A35 Feature Management | any |
| "compliance report", "audit" | A26 Compliance | any |
| "sprint report", "PI report" | A32 Stakeholder Report | any |
| "standup", "sprint plan" | A03 Planning | any |
| "estimate", "story points" | A05 Estimation | any |
| "scaffold infra", "new environment" | A36 Infra | J10 subset |
| "set up monitoring", "dashboards" | A37 Observability Setup | J10 subset |

### 3.2 Ambiguous task resolution

When a task matches multiple routing rules or is unclear, the Orchestrator:

1. Identifies the top 2-3 matching rules
2. Asks the human one clarifying question: "Is this task about [A] or [B]?"
3. Routes based on the human's response
4. Never guesses or picks arbitrarily

---

## 4. Journey flow agent chains

Each journey flow is a defined sequence of agent invocations. The
Orchestrator follows these chains, creating handover packages at each
transition and presenting HITL gates as defined.

### J01 -- Bug fix chain

```
Entry: Bug ticket created in Jira

A17 Bug Triage
  -> A40 Problem Management (KEDB check -- is this a known error?)
     [If known error: suppress, link to KEDB, close. Done.]
  -> A11 Legacy Explainer (if affected code is unfamiliar)
  -> [HITL: engineer confirms root cause]
  -> A09 Code Gen (generate fix)
  -> A15 Test Gen (generate regression test)
  -> A22 Security Review (scan fix diff)
  -> A27 Peer Review (review PR)
  -> [HITL gate D01: Tech Lead approves PR]
  -> A28 Release (patch release notes)

Exit: Bug ticket closed, regression test in suite
```

### J02 -- Change request chain

```
Entry: CR ticket raised by stakeholder or BA

A06 Dependency Mapper (impact analysis)
  -> [HITL gate B01-B08 if architectural decision required]
  -> A07 Spec Writer (technical spec)
  -> [HITL gate C01: Tech Lead approves spec]
  -> A04 Story Drafter (break CR into stories)
  -> A05 Estimation (estimate each story)
  -> [HITL: BA and Tech Lead refine stories in backlog]
  -> Per story: J03 New feature chain

Exit: CR stories delivered and deployed
```

### J03 -- New feature chain

```
Entry: Story in Ready state (ACs defined, no open blockers)

A07 Spec Writer (technical spec)
  -> A06 Dependency Mapper (conflict check)
  -> [HITL gate C01: Tech Lead approves spec]
  -> [HITL gate C02: BA confirms ACs are correct]
  -> A09 Code Gen (generate code)
  -> A15 Test Gen (generate test suite)
  -> A16 Feature Validation (execute ACs)
     -> A08 AC Executor (per AC)
     -> A20 Kafka Skill (if event-driven ACs)
     -> A19 Accessibility (if UI feature)
  -> A22 Security Review (scan PR)
  -> A25 Secrets Scan (scan PR)
  -> A27 Peer Review (review PR)
  -> [HITL gate D01: Tech Lead approves PR]
  -> A30 Documentation (update Confluence)
  -> A28 Release (release notes)

Exit: Story closed, feature deployed to staging
```

### J04 -- New epic chain

```
Entry: Epic created in Jira from PI planning

A01 Orchestrator + A06 Dependency Mapper (dependency graph)
  -> [HITL gate B01: Architect approves if new service needed]
  -> A07 Spec Writer (epic-level spec)
  -> [HITL gate C06: Architect and DM approve epic spec]
  -> A04 Story Drafter (full story breakdown)
  -> A05 Estimation (estimate all stories)
  -> [HITL: PI planning refinement]
  -> A35 Feature Management (feature flag scaffolding)
  -> Per story: J03 chain (Orchestrator coordinates across stories)
  -> A31 Arch Doc (update architecture docs post-epic)
  -> A32 Stakeholder Report (epic completion report)

Exit: Epic closed, all stories delivered, architecture docs updated
```

### J05 -- New integration chain

```
Entry: Integration requirement identified in story or CR

A06 Dependency Mapper (check existing integrations)
  -> [HITL gate B02: Architect approves integration approach]
  -> A07 Spec Writer (API contract draft)
  -> [HITL gate C03: Tech Lead and partner confirm contract]
  -> A21 Event Schema (if Kafka-based integration)
  -> A09 Code Gen (adapter and client code)
  -> A25 Secrets Scan (verify no credentials in code)
  -> A22 Security Review (auth and transport security check)
  -> A15 Test Gen (contract tests)
  -> A20 Kafka Skill (event-based contract tests if applicable)
  -> A27 Peer Review (review PR)
  -> [HITL gate D01: Tech Lead approves PR]
  -> A30 Documentation (integration guide in Confluence)

Exit: Integration live, contract tests passing, docs updated
```

### J06 -- Performance issue chain

```
Entry: SLO breach detected or performance ticket raised

A18 Performance (analyse metrics and code)
  -> A11 Legacy Explainer (if slow path is in unfamiliar code)
  -> [HITL: engineer confirms root cause]
  -> A09 Code Gen (optimised fix or index migration)
  -> A15 Test Gen (load test scenarios)
  -> A22 Security Review (verify fix does not introduce vulnerabilities)
  -> A27 Peer Review (review PR)
  -> [HITL gate D01: Tech Lead approves PR]

Exit: SLO restored, load test added to CI pipeline
```

### J07 -- Vulnerability scan chain

```
Entry: Scheduled scan, CVE advisory, or audit requirement

A23 Vuln Scan (scan all package manifests)
  -> A25 Secrets Scan (full scan alongside vuln scan)
  -> A24 CVE Triage (classify and prioritise findings)
  -> [Auto: Jira security tickets created per finding]
  -> [HITL gate E09: Security Lead approves remediation plan]
  -> A09 Code Gen (patches and upgrades per finding)
  -> A15 Test Gen (security regression tests)
  -> A27 Peer Review (review each patch PR)
  -> [HITL gate D01: Tech Lead approves each patch PR]

Exit: All critical and high findings closed, scan report in Confluence
```

### J08 -- Library upgrade chain

```
Entry: Dependabot PR, EOL notice, or planned upgrade decision

A06 Dependency Mapper (impact scope across all modules)
  -> [HITL: Tech Lead approves upgrade scope and strategy]
  -> A10 Refactor (migration per module, staged commits)
  -> A23 Vuln Scan (scan new library version for its own CVEs)
  -> A15 Test Gen (updated regression suite)
  -> A19 Accessibility (if UI library upgrade)
  -> A27 Peer Review (per module PR)
  -> [HITL gate D01: Tech Lead approves each module PR]
  -> A30 Documentation (update coding standards references)

Exit: All modules on new version, old version removed
```

### J09 -- Dependent integration changed chain

```
Entry: Partner breaking change notice or contract test failure

A06 Dependency Mapper (blast radius across services)
  -> [Auto: Jira impact ticket created]
  -> [HITL: Architect and Tech Lead assess impact and approach]
  -> A07 Spec Writer (delta spec for what changed)
  -> [HITL gate C03: Updated contract confirmed with partner]
  -> A10 Refactor (adapter update to new contract)
  -> A21 Event Schema (if Kafka schema changed)
  -> A22 Security Review (new contract security check)
  -> A25 Secrets Scan (check for credential rotation if auth changed)
  -> A15 Test Gen (updated contract tests)
  -> A27 Peer Review (review PR)
  -> [HITL gate D01: Tech Lead approves PR]
  -> [HITL: Tech Lead notifies partner that our side is updated]

Exit: Adapter live, contract tests passing, partner notified
```

### J10 -- Greenfield project kickoff chain

```
Entry: New project brief approved

A13 Greenfield Scaffold
  -> [HITL gate B01: Architect approves initial service design]
  -> A36 Infra (infrastructure scaffolding)
  -> A37 Observability Setup (dashboards and alerts)
  -> A07 Spec Writer (initial architecture spec)
  -> [HITL gate B05: Architect finalises initial ADRs]
  -> A31 Arch Doc (Confluence space setup and architecture page)
  -> A04 Story Drafter (first sprint stories from brief)
  -> A05 Estimation (estimate first sprint)
  -> A29 Pipeline (CI/CD workflow setup)
  -> A35 Feature Management (feature flag scaffolding if needed)

Exit: Repo ready, Confluence space set up, first sprint planned
```

### J11 -- Brownfield discovery chain

```
Entry: Team takes over existing codebase

A14 Brownfield Discovery
  -> A11 Legacy Explainer (deep analysis per module)
  -> A23 Vuln Scan (audit legacy dependency stack)
  -> A26 Compliance (assess regulatory exposure in legacy code)
  -> [HITL gate C01: Tech Lead reviews discovery report]
  -> A31 Arch Doc (draft architecture overview from discovery output)
  -> A33 Onboarding (generate onboarding guide for new team members)

Exit: Architecture documented, risks identified, team onboarded
```

### J12 -- Production incident chain

```
Entry: SRE Agent Tier 4 escalation or manual P0/P1 declaration

[HITL gate E04: Tech Lead and SRE Lead declare severity]
A39 Incident Response
  -> A38 SRE (continues monitoring, feeds signals to war room)
  -> A18 Performance (root cause analysis support)
  -> A11 Legacy Explainer (if failing code is unfamiliar)
  -> [Incident resolved]
  -> [HITL gate E05: Post-mortem approved by Tech Lead and DM]
  -> A40 Problem Management (create problem record if recurring)
  -> A15 Test Gen (prevention regression test)

Exit: Incident closed, post-mortem complete, prevention ticket created
```

### J13 -- Data migration chain

```
Entry: Schema change required by feature spec

A12 Data Migration
  -> [HITL gate C04: Tech Lead and DBA approve migration plan]
  -> [Dry-run executed against test database]
  -> A22 Security Review (sensitive data field changes)
  -> A27 Peer Review (review migration scripts)
  -> [HITL gate D01: Tech Lead approves migration PR]
  -> [HITL gate A03: Production migration approved by Tech Lead + DBA]

Exit: Migration deployed, schema updated, rollback script verified
```

### J14 -- New engineer onboarding chain

```
Entry: New engineer joins the team

A33 Onboarding
  -> A14 Brownfield Discovery output (if available -- read only)
  -> A11 Legacy Explainer (codebase orientation questions)

Exit: Engineer has personalised onboarding guide and first ticket suggested
Note: No HITL gates -- fully informational flow
```

### J15 -- Problem management chain

```
Entry: Recurring incident, post-mortem raises problem, or SRE Tier 3 repeat

A40 Problem Management
  -> [HITL gate E03: Tech Lead confirms root cause]
  -> [HITL gate E01 or E02: Tech Lead decides fix vs defer vs accept]
  -> [If accepted/deferred:]
     -> SRE suppression rule written
     -> Workaround page created in Confluence
  -> [If fix now:]
     -> Route to J01 or J03 depending on fix scope
  -> [Periodic review at review date:]
     -> A40 re-evaluates with updated context
     -> Human decides: extend, fix, or escalate

Exit: KEDB entry in stable state (accepted, deferred, or resolved)
```

---

## 5. Parallel agent execution

Some tasks benefit from running agents in parallel. The Orchestrator
manages parallel execution for these patterns:

### 5.1 Parallel security checks on PR open

When a PR is opened, these three agents run in parallel rather than
sequentially:

```
PR opened
  |-- A22 Security Review  (in parallel)
  |-- A25 Secrets Scan     (in parallel)
  |-- A19 Accessibility    (in parallel, if UI code changed)
  |
  --> A27 Peer Review (waits for all three to complete before summarising)
```

### 5.2 Parallel story generation

When breaking down an epic into stories, Story Drafter and Estimation
run in parallel per story (not sequentially across stories):

```
A04 Story Drafter generates story 1 --> A05 Estimation estimates story 1
A04 Story Drafter generates story 2 --> A05 Estimation estimates story 2
(parallel per story, not sequential across all stories)
```

### 5.3 Parallel documentation after feature merge

```
Feature merged
  |-- A30 Documentation  (feature docs in Confluence)    (in parallel)
  |-- A28 Release        (release notes)                 (in parallel)
  |-- A31 Arch Doc       (if architecture changed)       (in parallel)
```

---

## 6. Escalation paths

When an agent cannot complete its task, it follows this escalation path:

### 6.1 Standard escalation

```
Agent encounters blocker
  -> Agent produces HITL gate output with blocker description
  -> Orchestrator notifies the required human approver
  -> Task pauses -- state saved per AGENT_HANDOVER.md
  -> Human resolves blocker and provides approval signal
  -> Orchestrator resumes task from saved state
```

### 6.2 Agent failure (technical error)

```
Agent produces an error (not a HITL gate -- an actual failure)
  -> Agent logs the failure with full context
  -> Orchestrator creates a Jira task: "Agent failure -- [task] -- [agent]"
  -> Orchestrator notifies Tech Lead and CoE Lead
  -> Task is marked as requiring human intervention
  -> CoE investigates and either fixes the agent or completes the task manually
```

### 6.3 Confidence-based escalation

When an agent's confidence in its output is below the threshold defined
in its skill file:

```
Agent confidence: Low
  -> Agent flags output with CONFIDENCE: LOW marker
  -> Output is produced but marked as draft requiring human review
  -> Orchestrator adds additional reviewers to any PR generated
  -> HITL gate D01 is strengthened: requires 2 human approvals not 1
```

---

## 7. Agent communication rules

### 7.1 Direct agent-to-agent calls

Agents may call other agents directly without routing through the
Orchestrator only when:
- The call is listed in the calling agent's `Calls:` field in AGENT_REGISTRY.md
- The task context is fully contained in a single handover package
- The receiving agent does not need additional context from the Orchestrator

Examples of permitted direct calls:
- Peer Review Agent calls Security Review Agent directly
- Code Gen Agent calls Test Gen Agent directly
- Feature Validation Agent calls AC Executor Agent directly

### 7.2 All other routing goes through Orchestrator

For any routing not listed in an agent's `Calls:` field, the Orchestrator
must be involved. Agents do not invoke arbitrary other agents.

### 7.3 Handover package required

Every agent-to-agent call must include a complete handover package
as defined in AGENT_HANDOVER.md. Direct calls without a handover
package are not permitted -- the receiving agent must have sufficient
context to operate without relying on shared memory.

---

## 8. Always-on agent behaviour

Two agents run continuously without being triggered by the Orchestrator:

### 8.1 SRE Agent (A38)

The SRE Agent runs its observe-analyse-decide-act loop on a 60-second
interval regardless of other activity. It operates independently of
the Orchestrator. The Orchestrator only becomes involved when the SRE
Agent reaches Tier 3 or Tier 4 -- at which point the SRE Agent calls
the Incident Response Agent directly (listed in its `Calls:` field).

The SRE Agent writes to SRE_DECISION_LOG.md after every action,
including Tier 1 silent self-heals. This log is the audit trail for
all autonomous SRE actions.

### 8.2 Cross-team Coordinator Agent (A02)

The Cross-team Coordinator runs a weekly dependency health check across
all active PI stories. It runs independently of the Orchestrator but
reports to Delivery Managers via Jira comments. The Orchestrator is
not involved in routine dependency checks.

---

## 9. Context window management across agents

When a task spans many agent steps (e.g. a large epic spanning 20+
stories), the full task history becomes too large to pass between agents.
The Orchestrator manages this by:

1. Maintaining a compressed task summary that grows with each step
2. Each handover package contains only the minimum context for the
   next step (per AGENT_HANDOVER.md principle 2.3)
3. Completed steps are summarised in a Jira comment -- agents read
   this comment to reconstruct history if needed
4. The Orchestrator never passes the full history to a specialist agent
   unless the specialist explicitly needs it

See `MEMORY_MANAGEMENT.md` and `CONTEXT_WINDOW_STRATEGY.md` for the
detailed protocols.

---

## 10. Adding a new agent to the topology

When a new agent is added to the commons:

1. Add the agent to AGENT_REGISTRY.md with its `Calls:` and `HITL gates:` fields
2. Add routing rules to section 3.1 of this file if the agent is a primary handler
3. Add the agent to the relevant journey flow chains in section 4 if applicable
4. Add the agent to relevant parallel execution patterns in section 5 if applicable
5. Update AGENT_REGISTRY.md `Calls:` fields for any existing agents that call the new agent
6. Open a PR with all changes -- 2 CoE approvals required

---

## 11. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly -- or when agents or journey flows change |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
