# AGENT_REGISTRY.md
# AI Engineering Commons -- Agent Registry
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Purpose

This file is the authoritative registry of all 40 agents in the
ai-engineering-commons system. The Orchestrator Agent reads this file
to determine which specialist agent to invoke for any given task. Every
agent skill file references this registry for cross-agent routing.

Each entry defines:
- Agent identity and skill file path
- Primary responsibility and trigger conditions
- Permitted tool access (subset of TOOLS_MANIFEST.md)
- Input and output contracts
- HITL gates that apply
- Which other agents it may call

When a new agent is added to the commons, it must be registered here
before any other agent can route tasks to it.

---

## 2. Registry format

Each agent entry follows this structure:

```
Agent ID:     Unique identifier used in handover packages and logs
Name:         Human-readable name
Skill file:   Path to the agent's skill file in the commons
Group:        Functional group (see section 3)
Trigger:      What causes this agent to be invoked
Inputs:       What the agent needs to start
Outputs:      What the agent produces
Tools:        Permitted tool IDs from TOOLS_MANIFEST.md
Calls:        Other agents this agent may invoke
HITL gates:   Gates from HITL_PROTOCOL.md that apply to this agent
Status:       Active / Draft / Deprecated
```

---

## 3. Agent groups

| Group ID | Group name | Agent count |
|---|---|---|
| G01 | Orchestration | 2 |
| G02 | Planning | 4 |
| G03 | Specification | 2 |
| G04 | Engineering | 6 |
| G05 | QA and testing | 5 |
| G06 | Event-driven | 2 |
| G07 | Security | 5 |
| G08 | Review and release | 3 |
| G09 | Documentation and architecture | 4 |
| G10 | Module and feature management | 2 |
| G11 | Infrastructure and observability | 2 |
| G12 | Operations | 3 |

---

## 4. G01 -- Orchestration agents

### A01 -- Orchestrator Agent

```
Agent ID:    A01
Name:        Orchestrator Agent
Skill file:  agents/ORCHESTRATOR_AGENT.md
Group:       G01 -- Orchestration
Version:     1.0.0
Status:      Active

Trigger:
  - Any multi-step task initiated by a human
  - Journey flow start (J01-J15)
  - Agent handover requiring routing decision
  - HITL gate resumption requiring next-agent selection

Inputs:
  - Human task description or Jira ticket reference
  - Journey flow ID (optional -- Orchestrator infers if not provided)
  - AGENT_HANDOVER.md package (if resuming interrupted task)

Outputs:
  - Routed task to appropriate specialist agent
  - AGENT_HANDOVER.md package at each routing point
  - Task completion summary to human

Tools:
  - T-JIRA-01 (read ticket)
  - T-JIRA-02 (search issues)
  - T-JIRA-05 (add comment -- for handover packages)
  - T-CONF-01 (read page)
  - T-CONF-04 (search)
  - T-GIT-01 (read repo)
  - T-AI-01 (inference)
  - T-UTIL-01 (file read)

Calls:
  - Any agent in this registry based on task routing rules
  - Consults MULTI_AGENT_SETUP.md for routing decisions

HITL gates:
  - None specific to Orchestrator -- enforces gates defined by specialist agents
  - Logs all gate interactions for audit trail
```

---

### A02 -- Cross-team Coordinator Agent

```
Agent ID:    A02
Name:        Cross-team Coordinator Agent
Skill file:  agents/CROSSTEAM_COORD_AGENT.md
Group:       G01 -- Orchestration
Version:     1.0.0
Status:      Active

Trigger:
  - PI planning dependency mapping requested
  - Dependency-blocked Jira ticket detected
  - Sprint dependency at risk of slipping
  - Scheduled weekly dependency health check

Inputs:
  - PI plan or sprint board reference
  - List of teams and their project keys
  - Dependency tracking Jira tickets

Outputs:
  - Dependency risk report (Jira comment + Confluence page)
  - Re-sequencing suggestions when dependencies slip
  - Escalation to Delivery Managers when blockers are unresolvable

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-04, T-JIRA-05
  - T-CONF-01, T-CONF-03, T-CONF-04
  - T-AI-01

Calls:
  - A03 (Planning) for sprint impact analysis
  - A06 (Dependency Mapper) for technical dependency detail

HITL gates:
  - None -- advisory output only, humans make re-sequencing decisions
```

---

## 5. G02 -- Planning agents

### A03 -- Planning Agent

```
Agent ID:    A03
Name:        Planning Agent
Skill file:  agents/PLANNING_AGENT.md
Group:       G02 -- Planning
Version:     1.0.0
Status:      Active

Trigger:
  - Sprint start -- generate sprint plan
  - Sprint end -- generate sprint summary and retrospective draft
  - PI planning session -- generate PI increment report
  - Daily -- generate async standup from Jira board state

Inputs:
  - Jira sprint or board reference
  - Team capacity (from CAPACITY_PLANNING_TEMPLATE.md)
  - Velocity history

Outputs:
  - Sprint plan summary (Confluence + Jira)
  - Sprint retrospective draft (Confluence)
  - PI increment report (Confluence)
  - Async standup update (Jira comment or Slack message)

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-04, T-JIRA-05
  - T-CONF-01, T-CONF-02, T-CONF-03, T-CONF-04
  - T-AI-01

Calls:
  - A05 (Estimation) for velocity-adjusted estimates
  - A02 (Cross-team Coordinator) for dependency flagging

HITL gates:
  - None -- advisory outputs only
```

---

### A04 -- Story Drafter Agent

```
Agent ID:    A04
Name:        Story Drafter Agent
Skill file:  agents/STORY_DRAFTER_AGENT.md
Group:       G02 -- Planning
Version:     1.0.0
Status:      Active

Trigger:
  - Meeting notes or brief provided for story creation
  - Epic breakdown requested
  - CR ticket requiring story decomposition

Inputs:
  - Meeting notes, brief, or CR ticket reference
  - Epic key (if stories belong to an epic)
  - Target sprint (optional)

Outputs:
  - Jira stories with summary, description, ACs, and labels
  - Stories linked to epic and sequenced by dependency
  - Estimation request sent to Estimation Agent

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-03, T-JIRA-04, T-JIRA-05
  - T-CONF-01, T-CONF-04
  - T-AI-01
  - T-UTIL-01

Calls:
  - A05 (Estimation) for initial story point suggestion
  - A06 (Dependency Mapper) for cross-story dependency check

HITL gates:
  - C02 -- BA or Product Owner confirms ACs before stories are finalised
```

---

### A05 -- Estimation Agent

```
Agent ID:    A05
Name:        Estimation Agent
Skill file:  agents/ESTIMATION_AGENT.md
Group:       G02 -- Planning
Version:     1.0.0
Status:      Active

Trigger:
  - Story Drafter requests estimation for new stories
  - Backlog refinement session
  - Manual estimation request on a specific ticket

Inputs:
  - Jira story key(s) to estimate
  - Historical velocity data (from Jira)
  - Reference stories for calibration

Outputs:
  - Story point suggestion with reasoning
  - Similar historical stories cited as reference
  - Confidence level (High / Medium / Low)

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-05
  - T-AI-01

Calls:
  - None -- estimation is a terminal action

HITL gates:
  - None -- estimates are advisory, humans set final points
```

---

### A06 -- Dependency Mapper Agent

```
Agent ID:    A06
Name:        Dependency Mapper Agent
Skill file:  agents/DEPENDENCY_MAPPER_AGENT.md
Group:       G02 -- Planning
Version:     1.0.0
Status:      Active

Trigger:
  - CR, epic, or upgrade requiring impact analysis
  - New integration being introduced (J05)
  - Library upgrade impact assessment (J08)

Inputs:
  - CR, epic, or story key
  - Library or integration name (for upgrade/change scenarios)
  - Scope boundary (which services to include in analysis)

Outputs:
  - Dependency map (Confluence page)
  - Conflict report (Jira comment)
  - List of affected services and specs
  - Blast radius assessment

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-05
  - T-CONF-01, T-CONF-04
  - T-GIT-01
  - T-AI-01
  - T-UTIL-01

Calls:
  - None -- dependency mapping is a terminal analysis action

HITL gates:
  - B02 (for new integrations)
  - B04 (if new unapproved dependency found)
```

---

## 6. G03 -- Specification agents

### A07 -- Spec Writer Agent

```
Agent ID:    A07
Name:        Spec Writer Agent
Skill file:  agents/SPEC_WRITER_AGENT.md
Group:       G03 -- Specification
Version:     1.0.0
Status:      Active

Trigger:
  - Story approved and in Ready state (J03)
  - CR approved for implementation (J02)
  - Epic-level spec requested (J04)

Inputs:
  - Jira story or epic key
  - Existing Confluence specs for context
  - TECHNICAL_SPEC_TEMPLATE.md
  - API_DESIGN_STANDARDS.md (for API sections)

Outputs:
  - Technical spec page in Confluence
  - OpenAPI spec draft (if API changes involved)
  - Pre-spec compliance checks (GDPR, DPA) raised as Jira tasks if needed

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-03, T-JIRA-05
  - T-CONF-01, T-CONF-02, T-CONF-03, T-CONF-04
  - T-GIT-01
  - T-AI-01
  - T-UTIL-01

Calls:
  - A06 (Dependency Mapper) for conflict check before writing
  - A08 (AC Executor) to validate that ACs are machine-testable

HITL gates:
  - C01 -- Tech Lead approves spec before code generation begins
  - C05 -- Security Lead approves if spec includes auth or data changes
  - C07 -- Test strategy gate if new feature area
```

---

### A08 -- AC Executor Agent

```
Agent ID:    A08
Name:        AC Executor Agent
Skill file:  agents/AC_EXECUTOR_AGENT.md
Group:       G03 -- Specification
Version:     1.0.0
Status:      Active

Trigger:
  - Feature Validation Agent initiates AC execution
  - QA Engineer requests AC validation on a specific story

Inputs:
  - Jira story key with Given/When/Then ACs
  - Test environment endpoint
  - Authentication credentials for test environment

Outputs:
  - Pass/fail result per AC with evidence (response body, log excerpt)
  - Executable test code generated from ACs
  - Jira comment with AC execution report
  - PR comment if triggered during PR review

Tools:
  - T-JIRA-01, T-JIRA-05
  - T-AI-01
  - T-UTIL-03 (HTTP for test environment calls)
  - T-UTIL-04 (sandboxed code execution)

Calls:
  - A20 (Kafka Skill) if ACs involve event-driven behaviour
  - A16 (Feature Validation) to report results

HITL gates:
  - None -- AC execution is automated and advisory
```

---

## 7. G04 -- Engineering agents

### A09 -- Code Gen Agent

```
Agent ID:    A09
Name:        Code Gen Agent
Skill file:  agents/CODE_GEN_AGENT.md
Group:       G04 -- Engineering
Version:     1.0.0
Status:      Active

Trigger:
  - Spec approved at gate C01 (J03, J04)
  - Bug root cause confirmed and fix approach approved (J01)
  - Refactoring task assigned (J08)

Inputs:
  - Approved Confluence spec URL
  - Jira ticket key
  - Target language and framework (Java, TypeScript, C#)
  - CODING_STANDARDS.md, SECURITY_STANDARDS.md, PERFORMANCE_GUIDELINES.md

Outputs:
  - Generated code committed to feature branch
  - Unit test stubs alongside generated code
  - PR opened with description (via Peer Review Agent)
  - Commit with Agent trailer per GITHUB_INTEGRATION.md section 6.1

Tools:
  - T-JIRA-01, T-JIRA-04, T-JIRA-05
  - T-CONF-01
  - T-GIT-01, T-GIT-02, T-GIT-03
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A15 (Test Gen) after code is generated
  - A27 (Peer Review) after tests are generated
  - A22 (Security Review) if security-sensitive code is generated

HITL gates:
  - D01 -- Tech Lead approves PR before merge
  - D04 -- Tech Lead review required if legacy code was touched
```

---

### A10 -- Refactor Agent

```
Agent ID:    A10
Name:        Refactor Agent
Skill file:  agents/REFACTOR_AGENT.md
Group:       G04 -- Engineering
Version:     1.0.0
Status:      Active

Trigger:
  - Tech debt ticket assigned
  - Library upgrade requiring code migration (J08)
  - Integration changed requiring adapter update (J09)

Inputs:
  - Refactoring scope (files, modules, or patterns)
  - Target patterns (from CODING_STANDARDS.md or spec)
  - Rollback checkpoint requirement

Outputs:
  - Refactored code committed in staged commits per module
  - Each stage committed as a separate reversible checkpoint
  - PR per module for large multi-file refactors

Tools:
  - T-JIRA-01, T-JIRA-04, T-JIRA-05
  - T-CONF-01
  - T-GIT-01, T-GIT-02, T-GIT-03
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A15 (Test Gen) to update tests after refactor
  - A27 (Peer Review) after each module PR

HITL gates:
  - D01 -- Tech Lead approves each module PR
  - D03 -- Tech Lead review required after multi-file refactor completes
```

---

### A11 -- Legacy Explainer Agent

```
Agent ID:    A11
Name:        Legacy Explainer Agent
Skill file:  agents/LEGACY_EXPLAINER_AGENT.md
Group:       G04 -- Engineering
Version:     1.0.0
Status:      Active

Trigger:
  - Code Gen Agent or Refactor Agent encounters unfamiliar code
  - Engineer requests codebase orientation
  - Brownfield Discovery Agent delegates module analysis

Inputs:
  - File path, module name, or entry point to analyse
  - Depth of analysis required (surface / standard / deep)

Outputs:
  - Module map: entry points, call graph, dependencies
  - Risk assessment: complexity, coupling, test coverage gaps
  - Tech debt hotspots identified and linked to TECH_DEBT_REGISTRY.md

Tools:
  - T-GIT-01
  - T-CONF-01, T-CONF-04
  - T-AI-01
  - T-UTIL-01

Calls:
  - None -- analysis is a terminal action
  - Results consumed by Code Gen, Refactor, Brownfield Discovery agents

HITL gates:
  - None -- analysis is informational
```

---

### A12 -- Data Migration Agent

```
Agent ID:    A12
Name:        Data Migration Agent
Skill file:  agents/DATA_MIGRATION_AGENT.md
Group:       G04 -- Engineering
Version:     1.0.0
Status:      Active

Trigger:
  - Schema change required by feature spec
  - Data model change in J13 (Data migration journey)

Inputs:
  - Current schema definition
  - Target schema definition
  - Migration strategy preference (expand-contract / direct)
  - Target database type (PostgreSQL, SQL Server)

Outputs:
  - Migration script (Flyway or Liquibase)
  - Rollback script
  - Dry-run execution report (test environment only)
  - Zero-downtime execution plan in Confluence

Tools:
  - T-JIRA-01, T-JIRA-05
  - T-CONF-01, T-CONF-02
  - T-GIT-01, T-GIT-02
  - T-AI-01
  - T-UTIL-01, T-UTIL-02, T-UTIL-04 (dry-run only)

Calls:
  - A27 (Peer Review) after migration script is generated
  - A22 (Security Review) if migration involves sensitive data fields

HITL gates:
  - C04 -- Tech Lead and DBA approve migration plan
  - A03 -- Production database migration (Tech Lead + DBA)
```

---

### A13 -- Greenfield Scaffold Agent

```
Agent ID:    A13
Name:        Greenfield Scaffold Agent
Skill file:  agents/GREENFIELD_SCAFFOLD_AGENT.md
Group:       G04 -- Engineering
Version:     1.0.0
Status:      Active

Trigger:
  - New project kickoff (J10)
  - New service creation within an existing project

Inputs:
  - Project brief or architecture decision
  - Service name, domain, tech stack selection
  - Team name and project key

Outputs:
  - GitHub repository created with standard structure
  - CLAUDE.md, copilot-instructions.md, .cursorrules generated
  - Initial ADR set seeded in Confluence
  - First sprint stories created in Jira
  - CI/CD pipeline scaffolded via Pipeline Agent

Tools:
  - T-JIRA-03, T-JIRA-04, T-JIRA-05
  - T-CONF-02, T-CONF-03
  - T-GIT-01, T-GIT-02, T-GIT-03
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A04 (Story Drafter) for initial sprint stories
  - A29 (Pipeline) for CI/CD workflow generation
  - A37 (Observability Setup) for initial monitoring setup

HITL gates:
  - B01 -- Architect approves new service creation
  - B05 -- Architect finalises initial ADRs
```

---

### A14 -- Brownfield Discovery Agent

```
Agent ID:    A14
Name:        Brownfield Discovery Agent
Skill file:  agents/BROWNFIELD_DISCOVERY_AGENT.md
Group:       G04 -- Engineering
Version:     1.0.0
Status:      Active

Trigger:
  - Team takes over an existing codebase (J11)
  - Manual brownfield scan requested via RUN_BROWNFIELD_SCAN command

Inputs:
  - Repository reference or local path
  - Scope (full codebase / specific modules)
  - Existing documentation references (if any)

Outputs:
  - Language and framework detection report
  - Module boundary map
  - Undocumented integration list
  - Risk-scored tech debt map
  - Seeded MODULE_REGISTRY.md and TECH_DEBT_REGISTRY.md
  - Confluence architecture overview page (draft)

Tools:
  - T-GIT-01
  - T-CONF-02, T-CONF-04
  - T-JIRA-03, T-JIRA-05
  - T-AI-01
  - T-UTIL-01

Calls:
  - A11 (Legacy Explainer) for module-level deep analysis
  - A23 (Vuln Scan) to audit legacy dependency stack
  - A31 (Arch Doc) to draft initial architecture page

HITL gates:
  - C01 -- Tech Lead reviews discovery report before team uses it
```

---

## 8. G05 -- QA and testing agents

### A15 -- Test Gen Agent

```
Agent ID:    A15
Name:        Test Gen Agent
Skill file:  agents/TEST_GEN_AGENT.md
Group:       G05 -- QA and testing
Version:     1.0.0
Status:      Active

Trigger:
  - Code Gen Agent completes code generation
  - QA Engineer requests test generation for existing code
  - KEDB entry closed (regression test required)

Inputs:
  - Generated or existing code files
  - Acceptance criteria from Jira story
  - Test framework (JUnit, Jest, NUnit)
  - Coverage threshold from TEST_STRATEGY.md

Outputs:
  - Unit test suite committed alongside code
  - Integration test stubs
  - Test data fixtures (via GENERATE_MOCK_DATA command)
  - Coverage report reference

Tools:
  - T-JIRA-01, T-JIRA-05
  - T-GIT-01, T-GIT-02
  - T-AI-01
  - T-UTIL-01, T-UTIL-02, T-UTIL-04

Calls:
  - A20 (Kafka Skill) if event-driven behaviour needs testing
  - A16 (Feature Validation) to register tests for AC execution

HITL gates:
  - D05 -- Tech Lead and QA Lead review if coverage drops below threshold
```

---

### A16 -- Feature Validation Agent

```
Agent ID:    A16
Name:        Feature Validation Agent
Skill file:  agents/FEATURE_VALIDATION_AGENT.md
Group:       G05 -- QA and testing
Version:     1.0.0
Status:      Active

Trigger:
  - Story moved to QA column in Jira
  - PR opened with feature code (automated trigger)

Inputs:
  - Jira story key (to read ACs)
  - Test environment configuration (FEATURE_ENV_CONFIG.md)
  - PR branch reference

Outputs:
  - AC pass/fail report in Jira comment
  - AC pass/fail report in PR comment
  - Failed ACs linked back to Jira story for re-opening

Tools:
  - T-JIRA-01, T-JIRA-04, T-JIRA-05
  - T-GIT-01, T-GIT-05
  - T-AI-01
  - T-UTIL-03, T-UTIL-04

Calls:
  - A08 (AC Executor) for each AC in the story
  - A20 (Kafka Skill) for event-driven ACs
  - A19 (Accessibility) for UI feature ACs

HITL gates:
  - None -- validation results are advisory
  - Failed ACs cause story to return to In Progress (automated transition)
```

---

### A17 -- Bug Triage Agent

```
Agent ID:    A17
Name:        Bug Triage Agent
Skill file:  agents/BUG_TRIAGE_AGENT.md
Group:       G05 -- QA and testing
Version:     1.0.0
Status:      Active

Trigger:
  - New Jira Bug ticket created
  - Jira automation rule on Bug issue type

Inputs:
  - Jira bug ticket key
  - KEDB (via Problem Management Agent check)
  - Module registry for affected service identification

Outputs:
  - Enriched Jira bug ticket (severity, affected module, root cause hypothesis)
  - KEDB match result (known error or new issue)
  - Reproduction steps drafted in ticket

Tools:
  - T-JIRA-01, T-JIRA-04, T-JIRA-05, T-JIRA-06
  - T-CONF-01, T-CONF-04
  - T-GIT-01
  - T-AI-01

Calls:
  - A40 (Problem Management) to check KEDB for matching known error
  - A11 (Legacy Explainer) if bug is in unfamiliar legacy code

HITL gates:
  - None -- triage output is advisory, engineer confirms before acting
```

---

### A18 -- Performance Agent

```
Agent ID:    A18
Name:        Performance Agent
Skill file:  agents/PERFORMANCE_AGENT.md
Group:       G05 -- QA and testing
Version:     1.0.0
Status:      Active

Trigger:
  - Jira performance ticket created (J06)
  - SRE Agent detects SLO breach related to latency or throughput
  - PR opened touching database access or external calls

Inputs:
  - Jira performance ticket or SRE signal reference
  - Code files to analyse (for PR review mode)
  - Grafana metrics (for incident mode)

Outputs:
  - Root cause analysis with specific code locations
  - Fix recommendations with code examples
  - Load test scenarios generated (via TEST_STRATEGY.md targets)

Tools:
  - T-JIRA-01, T-JIRA-05
  - T-CONF-01
  - T-GIT-01
  - T-OBS-01, T-OBS-02
  - T-AI-01
  - T-UTIL-01

Calls:
  - A11 (Legacy Explainer) for unfamiliar performance-critical code
  - A09 (Code Gen) after root cause is confirmed and fix approved

HITL gates:
  - None for analysis -- human confirms before fix is generated
```

---

### A19 -- Accessibility Agent

```
Agent ID:    A19
Name:        Accessibility Agent
Skill file:  agents/ACCESSIBILITY_AGENT.md
Group:       G05 -- QA and testing
Version:     1.0.0
Status:      Active

Trigger:
  - PR opened with UI code changes
  - Feature Validation Agent delegates UI AC execution

Inputs:
  - UI code files (React, Angular, HTML)
  - ACCESSIBILITY_STANDARDS.md checklist A01-A18

Outputs:
  - Accessibility review report in PR comment
  - BLOCK findings prevent merge (via Peer Review Agent)
  - WARN findings noted for Tech Lead review

Tools:
  - T-JIRA-05
  - T-GIT-01, T-GIT-05
  - T-AI-01
  - T-UTIL-01, T-UTIL-04

Calls:
  - None -- accessibility review is a terminal action

HITL gates:
  - A08 items in ACCESSIBILITY_STANDARDS.md section 6 trigger D02
```

---

## 9. G06 -- Event-driven agents

### A20 -- Kafka Skill Agent

```
Agent ID:    A20
Name:        Kafka Skill Agent
Skill file:  agents/KAFKA_SKILL_AGENT.md
Group:       G06 -- Event-driven
Version:     1.0.0
Status:      Active

Trigger:
  - Feature Validation or AC Executor delegates event-driven AC
  - Test Gen Agent needs Kafka test support
  - Schema validation requested

Inputs:
  - Topic name (from KAFKA_TOPICS.md)
  - Expected event schema (from schema registry)
  - Test event payload
  - Assertion definition (expected output event)

Outputs:
  - Test event produced to topic (test/staging only)
  - Assertion result (event received within timeout: pass/fail)
  - Schema compliance report
  - DLQ message count check

Tools:
  - T-JIRA-05
  - T-MSG-01, T-MSG-02, T-MSG-03
  - T-AI-01

Calls:
  - A21 (Event Schema) for schema validation
  - None for test execution -- terminal action

HITL gates:
  - None -- all Kafka operations are test/staging only
  - Production Kafka access is permanently forbidden for this agent
```

---

### A21 -- Event Schema Agent

```
Agent ID:    A21
Name:        Event Schema Agent
Skill file:  agents/EVENT_SCHEMA_AGENT.md
Group:       G06 -- Event-driven
Version:     1.0.0
Status:      Active

Trigger:
  - New Kafka topic being created
  - Schema change PR opened
  - Integration introducing or modifying events

Inputs:
  - Current schema version (from schema registry)
  - Proposed schema change
  - Compatibility mode (BACKWARD / FORWARD / FULL)

Outputs:
  - Schema compatibility assessment (compatible / breaking)
  - Breaking change report with affected consumers
  - Schema migration guide in Confluence (if breaking)
  - Schema registry update (if compatible change)

Tools:
  - T-JIRA-03, T-JIRA-05
  - T-CONF-02
  - T-GIT-01, T-GIT-05
  - T-MSG-01
  - T-AI-01

Calls:
  - None -- schema analysis is a terminal action

HITL gates:
  - B06 -- Architect and Tech Lead must approve breaking schema changes
```

---

## 10. G07 -- Security agents

### A22 -- Security Review Agent

```
Agent ID:    A22
Name:        Security Review Agent
Skill file:  agents/SECURITY_REVIEW_AGENT.md
Group:       G07 -- Security
Version:     1.0.0
Status:      Active

Trigger:
  - PR opened with code changes
  - Spec approved containing auth or data model changes
  - Code Gen Agent flags security-sensitive generation

Inputs:
  - PR diff or code files
  - SECURITY_STANDARDS.md checklist S01-S20
  - OWASP Top 10 checks

Outputs:
  - Security review report in PR comment
  - BLOCK findings require Security Lead acknowledgement before merge
  - WARN findings noted for Tech Lead review

Tools:
  - T-JIRA-05
  - T-GIT-01, T-GIT-05
  - T-AI-01
  - T-UTIL-01

Calls:
  - A25 (Secrets Scan) on every PR review
  - None -- review is a terminal action

HITL gates:
  - D02 -- Security Lead must acknowledge BLOCK findings
  - A04 -- Security Lead approval for changes to auth configuration
  - A06 -- Security Lead approval for changes to security configuration
```

---

### A23 -- Vuln Scan Agent

```
Agent ID:    A23
Name:        Vulnerability Scan Agent
Skill file:  agents/VULN_SCAN_AGENT.md
Group:       G07 -- Security
Version:     1.0.0
Status:      Active

Trigger:
  - Scheduled weekly scan of all project dependencies
  - CVE advisory received for a library in use
  - PR opened modifying dependency files
  - Brownfield Discovery Agent requests legacy audit

Inputs:
  - Package manifest files (pom.xml, package.json, .csproj)
  - CVE database (via T-UTIL-03 to NVD or Snyk API)
  - DEPENDENCY_POLICY.md approved library list

Outputs:
  - Vulnerability report grouped by severity
  - Jira security tickets auto-created for Critical and High
  - KEDB check for each finding (known vs new)

Tools:
  - T-JIRA-03, T-JIRA-04, T-JIRA-05
  - T-GIT-01
  - T-AI-01
  - T-UTIL-01, T-UTIL-03

Calls:
  - A24 (CVE Triage) to classify and prioritise findings
  - A40 (Problem Management) to check KEDB for known findings

HITL gates:
  - E09 -- Security Lead approves remediation plan
```

---

### A24 -- CVE Triage Agent

```
Agent ID:    A24
Name:        CVE Triage Agent
Skill file:  agents/CVE_TRIAGE_AGENT.md
Group:       G07 -- Security
Version:     1.0.0
Status:      Active

Trigger:
  - Vuln Scan Agent produces raw findings
  - Security Lead requests triage of specific CVE

Inputs:
  - Raw vulnerability findings from Vuln Scan Agent
  - MODULE_REGISTRY.md for blast radius assessment
  - DEPENDENCY_POLICY.md for SLA deadlines

Outputs:
  - Classified findings (Critical / High / Medium / Low / False positive)
  - Exploitability assessment in Telia context
  - Remediation plan with SLA deadlines
  - Jira security tickets updated with classification

Tools:
  - T-JIRA-01, T-JIRA-04, T-JIRA-05
  - T-AI-01
  - T-UTIL-03

Calls:
  - None -- triage is a terminal action before human review

HITL gates:
  - E09 -- Security Lead approves remediation plan after triage
```

---

### A25 -- Secrets Scan Agent

```
Agent ID:    A25
Name:        Secrets Scan Agent
Skill file:  agents/SECRETS_SCAN_AGENT.md
Group:       G07 -- Security
Version:     1.0.0
Status:      Active

Trigger:
  - Every PR opened (automatic)
  - Every git push to any branch
  - Scheduled full git history scan (monthly)

Inputs:
  - Git diff (PR scan) or full git history (scheduled scan)
  - PRIVACY_GUARDRAILS.md credential patterns

Outputs:
  - Secrets detection report
  - BLOCK finding on PR if secret detected
  - Immediate rotation recommendation for any exposed credential

Tools:
  - T-JIRA-03, T-JIRA-05
  - T-GIT-01, T-GIT-05
  - T-AI-01

Calls:
  - None -- detection is a terminal action

HITL gates:
  - D02 -- Any detected secret triggers Security Lead review immediately
```

---

### A26 -- Compliance Agent

```
Agent ID:    A26
Name:        Compliance Agent
Skill file:  agents/COMPLIANCE_AGENT.md
Group:       G07 -- Security
Version:     1.0.0
Status:      Active

Trigger:
  - Quarterly compliance review scheduled
  - Audit request received
  - New data processing activity introduced (gate E07)

Inputs:
  - Jira audit log entries
  - GitHub commit history with Agent trailers
  - Confluence KEDB and architecture pages
  - COMPLIANCE_STANDARDS.md requirements

Outputs:
  - Compliance report (Confluence)
  - KEDB audit export for Legal
  - Expired DPA list (Jira tasks for renewal)
  - Missing SBOM report

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-03, T-JIRA-05
  - T-CONF-01, T-CONF-02, T-CONF-04
  - T-GIT-01
  - T-AI-01

Calls:
  - None -- compliance reporting is a terminal action

HITL gates:
  - E06 -- Security Lead and Legal approve compliance exception requests
  - E07 -- DPO or Security Lead approves new data processing activity
  - E08 -- Security Lead and CoE Lead approve audit evidence package
```

---

## 11. G08 -- Review and release agents

### A27 -- Peer Review Agent

```
Agent ID:    A27
Name:        Peer Review Agent
Skill file:  agents/PEER_REVIEW_AGENT.md
Group:       G08 -- Review and release
Version:     1.0.0
Status:      Active

Trigger:
  - PR opened or updated
  - Code Gen or Refactor Agent completes work

Inputs:
  - PR diff
  - CODING_STANDARDS.md, SECURITY_STANDARDS.md,
    PERFORMANCE_GUIDELINES.md, ACCESSIBILITY_STANDARDS.md checklists

Outputs:
  - Structured PR review comment (BLOCK / WARN / INFO items)
  - PR description generated if not present
  - PR labels applied (ai-reviewed, awaiting-human-review)

Tools:
  - T-JIRA-05
  - T-GIT-01, T-GIT-04, T-GIT-05
  - T-AI-01
  - T-UTIL-01

Calls:
  - A22 (Security Review) for security checklist items
  - A19 (Accessibility) for UI code checklist items
  - A18 (Performance) for performance checklist items

HITL gates:
  - D01 -- Human Tech Lead approval required before merge
  - D02 -- Security Lead acknowledgement for security BLOCK findings
```

---

### A28 -- Release Agent

```
Agent ID:    A28
Name:        Release Agent
Skill file:  agents/RELEASE_AGENT.md
Group:       G08 -- Review and release
Version:     1.0.0
Status:      Active

Trigger:
  - Merge to main branch completed
  - Release tag created
  - Hotfix deployed

Inputs:
  - Merged PR list since last release
  - Closed Jira tickets linked to merged PRs
  - Previous CHANGELOG.md

Outputs:
  - Release notes (Confluence + GitHub release)
  - CHANGELOG.md update
  - Rollback risk analysis
  - Deployment runbook generated (if not existing)

Tools:
  - T-JIRA-01, T-JIRA-02, T-JIRA-05
  - T-CONF-01, T-CONF-02, T-CONF-03
  - T-GIT-01, T-GIT-03, T-GIT-06
  - T-AI-01

Calls:
  - A29 (Pipeline) if CI/CD workflow needs updating for release
  - A30 (Documentation) for Confluence release notes page

HITL gates:
  - A02 -- Production deployment (Tech Lead + DevOps)
  - A10 -- Rollback decision (Tech Lead)
```

---

### A29 -- Pipeline Agent

```
Agent ID:    A29
Name:        Pipeline Agent
Skill file:  agents/PIPELINE_AGENT.md
Group:       G08 -- Review and release
Version:     1.0.0
Status:      Active

Trigger:
  - New service created (scaffold CI/CD)
  - Pipeline failure detected
  - Dependabot configuration needed

Inputs:
  - Service name, language, deployment target
  - PIPELINE_STANDARDS.md
  - Existing workflow files (for failure diagnosis)

Outputs:
  - GitHub Actions workflow files committed to feature branch
  - Dependabot configuration
  - Pipeline failure diagnosis in Jira comment
  - Remediation steps for failed pipeline

Tools:
  - T-JIRA-01, T-JIRA-05
  - T-GIT-01, T-GIT-02, T-GIT-06, T-GIT-07
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A22 (Security Review) for security scan workflow components
  - A27 (Peer Review) after workflow files are generated

HITL gates:
  - D01 -- Tech Lead approves pipeline PR
```

---

## 12. G09 -- Documentation and architecture agents

### A30 -- Documentation Agent

```
Agent ID:    A30
Name:        Documentation Agent
Skill file:  agents/DOCUMENTATION_AGENT.md
Group:       G09 -- Documentation and architecture
Version:     1.0.0
Status:      Active

Trigger:
  - Feature merged to main
  - Spec approved and implemented
  - API changed

Inputs:
  - Merged PR reference
  - Approved Confluence spec
  - Existing documentation pages

Outputs:
  - Updated Confluence feature documentation
  - API documentation updated
  - Code comments generated alongside code

Tools:
  - T-JIRA-01
  - T-CONF-01, T-CONF-02, T-CONF-03, T-CONF-04
  - T-GIT-01
  - T-AI-01
  - T-UTIL-01

Calls:
  - A31 (Arch Doc) if merged changes affect architecture

HITL gates:
  - None -- documentation updates are advisory
```

---

### A31 -- Architecture Doc Agent

```
Agent ID:    A31
Name:        Architecture Doc Agent
Skill file:  agents/ARCH_DOC_AGENT.md
Group:       G09 -- Documentation and architecture
Version:     1.0.0
Status:      Active

Trigger:
  - Merged PR flagged as architecture-affecting
  - ADR created or status changed
  - Monthly architecture review scheduled
  - Brownfield Discovery completes initial scan

Inputs:
  - Merged PRs since last update
  - MODULE_REGISTRY.md, INTEGRATION_MAP.md
  - Existing architecture pages in Confluence

Outputs:
  - Updated C4 architecture diagrams in Confluence (technical view)
  - Updated stakeholder architecture summary (non-technical view)
  - ADR index updated

Tools:
  - T-JIRA-01
  - T-CONF-01, T-CONF-02, T-CONF-03, T-CONF-04
  - T-GIT-01
  - T-AI-01
  - T-UTIL-01

Calls:
  - A32 (Stakeholder Report) for non-technical summary generation

HITL gates:
  - B05 -- Architect finalises ADRs
```

---

### A32 -- Stakeholder Report Agent

```
Agent ID:    A32
Name:        Stakeholder Report Agent
Skill file:  agents/STAKEHOLDER_REPORT_AGENT.md
Group:       G09 -- Documentation and architecture
Version:     1.0.0
Status:      Active

Trigger:
  - Sprint end
  - PI increment end
  - Management report requested

Inputs:
  - Sprint velocity and completion data from Jira
  - Active KEDB entries from Problem Management
  - Upcoming features from epic backlog

Outputs:
  - Non-technical sprint/PI summary in Confluence
  - Known issues summary for stakeholders
  - Upcoming features preview

Tools:
  - T-JIRA-01, T-JIRA-02
  - T-CONF-01, T-CONF-02, T-CONF-03, T-CONF-04
  - T-AI-01

Calls:
  - None -- reporting is a terminal action

HITL gates:
  - None -- reports are advisory and reviewed by DM before sharing
```

---

### A33 -- Onboarding Agent

```
Agent ID:    A33
Name:        Onboarding Agent
Skill file:  agents/ONBOARDING_AGENT.md
Group:       G09 -- Documentation and architecture
Version:     1.0.0
Status:      Active

Trigger:
  - New engineer joins the team (J14)
  - START_ONBOARDING command issued

Inputs:
  - Engineer name and role
  - MODULE_REGISTRY.md, ARCHITECTURE_OVERVIEW.md
  - Brownfield Discovery output (if available)

Outputs:
  - Personalised onboarding guide in Confluence
  - Suggested first Jira tickets to explore
  - Codebase orientation walkthrough

Tools:
  - T-JIRA-01, T-JIRA-02
  - T-CONF-01, T-CONF-02, T-CONF-04
  - T-GIT-01
  - T-AI-01

Calls:
  - A11 (Legacy Explainer) for codebase orientation questions

HITL gates:
  - None -- onboarding is informational
```

---

## 13. G10 -- Module and feature management agents

### A34 -- Module Lifecycle Agent

```
Agent ID:    A34
Name:        Module Lifecycle Agent
Skill file:  agents/MODULE_LIFECYCLE_AGENT.md
Group:       G10 -- Module and feature management
Version:     1.0.0
Status:      Active

Trigger:
  - New module registered
  - Module deprecation decision made
  - Module API version change

Inputs:
  - Module name, owner, tech stack, status
  - Consuming teams and services list
  - Deprecation timeline (if applicable)

Outputs:
  - MODULE_REGISTRY.md updated
  - Deprecation notices sent to consuming teams (Jira tasks)
  - Migration guidance generated in Confluence

Tools:
  - T-JIRA-03, T-JIRA-05
  - T-CONF-02, T-CONF-03
  - T-GIT-01, T-GIT-02
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A06 (Dependency Mapper) to identify all consumers of deprecated module
  - A30 (Documentation) to update module documentation

HITL gates:
  - B07 -- Architect and Tech Lead approve module deprecation
```

---

### A35 -- Feature Management Agent

```
Agent ID:    A35
Name:        Feature Management Agent
Skill file:  agents/FEATURE_MANAGEMENT_AGENT.md
Group:       G10 -- Module and feature management
Version:     1.0.0
Status:      Active

Trigger:
  - New feature flag required for a feature
  - Feature rollout percentage change requested
  - Feature flag cleanup (post full rollout)

Inputs:
  - Feature name and scope
  - Rollout strategy (percentage / module / market)
  - Cleanup deadline

Outputs:
  - Feature flag scaffolding code committed
  - Rollout plan documented in Confluence
  - Cleanup reminder Jira task created

Tools:
  - T-JIRA-03, T-JIRA-05
  - T-CONF-02
  - T-GIT-01, T-GIT-02
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - None -- feature flag management is terminal

HITL gates:
  - None for flag creation
  - D01 for code commit containing flag (standard PR gate)
```

---

## 14. G11 -- Infrastructure and observability agents

### A36 -- IaC / Infra Agent

```
Agent ID:    A36
Name:        IaC / Infrastructure Agent
Skill file:  agents/INFRA_AGENT.md
Group:       G11 -- Infrastructure and observability
Version:     1.0.0
Status:      Active

Trigger:
  - New service created (greenfield or brownfield)
  - New environment needed
  - Infrastructure spec updated

Inputs:
  - Service name, resource requirements, environment targets
  - Existing infrastructure as code in repo
  - IAC_STANDARDS.md from security folder

Outputs:
  - Terraform/Bicep/Helm files committed to feature branch
  - GitHub Actions deployment workflow generated
  - Infrastructure PR opened for review

Tools:
  - T-JIRA-05
  - T-CONF-01
  - T-GIT-01, T-GIT-02, T-GIT-03
  - T-INFRA-01
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A22 (Security Review) for IaC security review
  - A29 (Pipeline) for deployment workflow integration

HITL gates:
  - B01 -- Architect approves new infrastructure design
  - D01 -- Tech Lead approves IaC PR
  - A02 -- Production infrastructure changes (Tech Lead + DevOps)
```

---

### A37 -- Observability Setup Agent

```
Agent ID:    A37
Name:        Observability Setup Agent
Skill file:  agents/OBSERVABILITY_AGENT.md
Group:       G11 -- Infrastructure and observability
Version:     1.0.0
Status:      Active

Trigger:
  - New service created
  - Service instrumentation updated

Inputs:
  - Service name, SLA targets from SRE_SERVICE_CONFIG.md
  - PERFORMANCE_GUIDELINES.md section 7 (default targets)
  - GRAFANA_INTEGRATION.md section 3 (standard panels)

Outputs:
  - Grafana dashboard created
  - Alert rules created
  - SRE_DASHBOARD_REGISTRY.md updated via PR
  - Confluence runbook pages created per alert

Tools:
  - T-JIRA-03, T-JIRA-05
  - T-CONF-02, T-CONF-03
  - T-GIT-01, T-GIT-02, T-GIT-03
  - T-OBS-01, T-OBS-03
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A31 (Arch Doc) to register service in architecture docs

HITL gates:
  - D01 -- Tech Lead approves SRE_DASHBOARD_REGISTRY PR
```

---

## 15. G12 -- Operations agents

### A38 -- SRE Agent

```
Agent ID:    A38
Name:        SRE Agent
Skill file:  agents/SRE_AGENT.md
Group:       G12 -- Operations
Version:     1.0.0
Status:      Active

Trigger:
  - Continuous -- always running on observation loop
  - Alertmanager webhook received
  - Manual SRE_DIAGNOSE command

Inputs:
  - Grafana dashboard panel data (SRE_DASHBOARD_REGISTRY)
  - Alertmanager webhook payloads
  - SRE_SUPPRESSION_RULES.md (KEDB suppression check)
  - SRE_AUTONOMY_BUDGET.md (permitted actions)

Outputs:
  - Tier 1: Silent self-heal action + SRE_DECISION_LOG entry
  - Tier 2: Self-heal action + Slack notification + Jira ticket
  - Tier 3: Diagnosis package to on-call + Jira P1 ticket
  - Tier 4: War room activation via Incident Response Agent

Tools:
  - T-JIRA-03, T-JIRA-04, T-JIRA-05
  - T-CONF-03
  - T-GIT-06
  - T-OBS-01, T-OBS-02
  - T-INFRA-02 (Tier 1 and 2 only -- within autonomy budget)
  - T-MSG-01
  - T-AI-01

Calls:
  - A39 (Incident Response) for Tier 4 escalation
  - A40 (Problem Management) for recurring signal pattern detection
  - A18 (Performance) for latency/throughput signal analysis

HITL gates:
  - A07 -- Tier 2 notification acknowledged by on-call
  - A08 -- Tier 3 escalation acknowledged by on-call and Tech Lead
  - A09 -- Tier 4 war room activated by Tech Lead and SRE Lead
  - A10 -- Rollback decision always requires Tech Lead
```

---

### A39 -- Incident Response Agent

```
Agent ID:    A39
Name:        Incident Response Agent
Skill file:  agents/INCIDENT_RESPONSE_AGENT.md
Group:       G12 -- Operations
Version:     1.0.0
Status:      Active

Trigger:
  - SRE Agent Tier 4 escalation
  - Manual P0/P1 incident declared by Tech Lead

Inputs:
  - SRE Agent signal package
  - Severity level (P0 / P1)
  - Affected services and blast radius

Outputs:
  - Jira incident ticket created
  - Confluence war room page opened
  - Stakeholder notifications sent
  - Live timeline maintained during incident
  - Post-mortem template created on resolution

Tools:
  - T-JIRA-03, T-JIRA-04, T-JIRA-05, T-JIRA-06
  - T-CONF-02, T-CONF-03
  - T-GIT-01
  - T-OBS-01, T-OBS-02
  - T-AI-01

Calls:
  - A38 (SRE) for continued signal monitoring during incident
  - A40 (Problem Management) post-incident for problem record creation
  - A18 (Performance) for root cause analysis support

HITL gates:
  - E04 -- Tech Lead and SRE Lead declare severity
  - E05 -- Post-mortem action items approved by Tech Lead and DM
```

---

### A40 -- Problem Management Agent

```
Agent ID:    A40
Name:        Problem Management Agent
Skill file:  agents/PROBLEM_MGMT_AGENT.md
Group:       G12 -- Operations
Version:     1.0.0
Status:      Active

Trigger:
  - Same incident pattern recurs 3+ times
  - SRE Agent Tier 3 signal has no runbook and has fired before
  - Post-mortem raises a new problem
  - Manual RAISE_PROBLEM command

Inputs:
  - Linked incident ticket references
  - SRE signal history
  - Root cause analysis from Incident Response Agent

Outputs:
  - Jira problem record created (KEDB entry)
  - Root cause draft in Confluence
  - Workaround page in Confluence
  - SRE suppression rule written to SRE_SUPPRESSION_RULES.md
  - Periodic review reminder Jira task created

Tools:
  - T-JIRA-01, T-JIRA-03, T-JIRA-04, T-JIRA-05
  - T-CONF-01, T-CONF-02, T-CONF-03, T-CONF-04
  - T-GIT-01, T-GIT-02
  - T-OBS-02
  - T-AI-01
  - T-UTIL-01, T-UTIL-02

Calls:
  - A17 (Bug Triage) for KEDB check on new bug tickets
  - A15 (Test Gen) when known error is resolved (add regression test)

HITL gates:
  - E01 -- Tech Lead and SRE Lead approve accepted known error
  - E02 -- Tech Lead approves deferred fix decision
  - E03 -- Tech Lead confirms root cause before problem is classified
```

---

## 16. Registry maintenance

### 16.1 Adding a new agent

1. Write the agent skill file in `agents/`
2. Add the registry entry to this file following the format in section 2
3. Update `MULTI_AGENT_SETUP.md` with routing rules for the new agent
4. Open a PR to ai-engineering-common with both file changes
5. Two CoE approvals required before merge
6. Commons released as a minor version bump

### 16.2 Deprecating an agent

1. Change `Status` to `Deprecated` in this registry
2. Add a deprecation notice to the agent skill file
3. Update `MULTI_AGENT_SETUP.md` to remove routing to the deprecated agent
4. Notify all teams via CoE Slack channel
5. Remove after 2 sprint grace period

### 16.3 Registry version

This registry is versioned with the commons. The registry version must
match the commons version in `COMMONS_VERSION.md`. When an agent is
added or removed, the commons version bumps at minimum a minor version.

---

## 17. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly -- or when agents are added or deprecated |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
