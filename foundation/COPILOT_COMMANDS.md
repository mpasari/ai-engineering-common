# COPILOT_COMMANDS.md
# Foundation -- Command definitions for GitHub Copilot Agent Mode
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core
#
# This file is included in copilot-instructions.md by the CLI.
# Every command defined here is available to engineers by typing
# the command name in Copilot Agent mode -- no prompt engineering needed.
#
# HOW COMMANDS WORK IN COPILOT:
# Engineer types: WRITE_SPEC PROJ-412
# Copilot reads this file, finds the WRITE_SPEC definition,
# executes the full protocol using the Jira MCP to read the story,
# generates the spec, creates the Confluence page, and presents gate C01.
# The engineer typed 2 words. The framework does the rest.

---

## AVAILABLE COMMANDS

Type any command below in Copilot Agent mode. Replace placeholders with real values.

---

### IDEATION AND PLANNING COMMANDS

---

#### DRAFT_BRIEF

Triggers the Orchestrator Agent to help you write a product service brief from a rough idea.

Usage:
```
DRAFT_BRIEF

[paste your rough idea, problem statement, or meeting notes here]
```

What happens:
1. Orchestrator reads your input and asks clarifying questions
2. Structures it into a formal service brief covering:
   - Problem statement and business drivers
   - User types (B2C / B2B / B2O / internal)
   - What the service does and does NOT do
   - Key constraints (compliance, integration, data)
3. Saves the brief as party-management-brief.md in the project root
4. Flags open questions that need answers before epics can be created

---

#### ANALYSE_CAPABILITIES

Triggers the Orchestrator Agent to analyse a service brief and produce a
reasoned capability map -- what needs to be built, in what order, and why.
This is the step between a brief and epics. It is the most important step.

Usage:
```
ANALYSE_CAPABILITIES

[paste brief or reference #file:party-management-brief.md]
```

What happens:
1. Orchestrator reads the brief
2. Identifies capability areas with business reasoning (not just task names)
3. Sequences capabilities by dependency with explicit justification
4. Flags risks and unknowns that must be resolved before committing
5. Does NOT create any Jira tickets -- output is for review first

Review the output with your architect and DM before proceeding to DRAFT_EPICS.

---

#### DRAFT_EPICS [project-key]

Converts an agreed capability map into Jira epics with business value statements.
Only run this after ANALYSE_CAPABILITIES output has been reviewed and agreed.

Usage:
```
DRAFT_EPICS PROJ

[paste the agreed capability map or reference #file:capability-map.md]
```

What happens:
1. Story Drafter Agent reads the capability map
2. For each capability, creates a Jira epic with:
   - One-sentence summary (not a task name -- a business outcome)
   - 2-3 sentence description explaining the business value
   - Epic-level done definition
3. Creates epics in Jira via MCP (shows each one for approval before creating)
4. Does NOT create stories -- epics only

---

#### DRAFT_STORIES [epic-key]

Decomposes a single Jira epic into sprint-sized stories with Given/When/Then ACs.
Only decompose the epic you are working on next -- never decompose all epics upfront.

Usage:
```
DRAFT_STORIES PROJ-1
```

What happens:
1. Story Drafter Agent reads the epic from Jira via MCP
2. Decomposes into stories sized for one sprint each
3. Writes Given/When/Then acceptance criteria for each story
4. Sequences stories by dependency within the epic
5. Outputs stories for review BEFORE creating them in Jira
6. On approval: creates stories in Jira via MCP (gate C02)

---

#### ESTIMATE_STORIES [story-keys]

Provides calibrated story point suggestions with transparent reasoning.

Usage:
```
ESTIMATE_STORIES PROJ-10 PROJ-11 PROJ-12
```

What happens:
1. Estimation Agent reads each story from Jira
2. Searches for comparable completed stories in the last 90 days
3. Posts estimate suggestion as Jira comment with full reasoning
4. Flags stories that are too large (split recommendation)
5. Flags low-confidence estimates (spike recommendation)

---

#### REQUEST_SPRINT_PLAN [sprint-name]

Generates a data-driven sprint plan from the current Jira board state.

Usage:
```
REQUEST_SPRINT_PLAN
```

What happens:
1. Planning Agent reads current sprint from Jira via MCP
2. Calculates committed vs recommended capacity (80% of avg velocity)
3. Checks for dependency-blocked stories
4. Identifies high-risk stories
5. Publishes sprint plan to Confluence and posts Jira link

---

### SPECIFICATION AND DESIGN COMMANDS

---

#### WRITE_SPEC [story-key]

Generates a technical specification from an approved Jira story.
The most important command -- always run before GENERATE_CODE.

Usage:
```
WRITE_SPEC PROJ-10
```

What happens:
1. Spec Writer Agent reads the story and ACs from Jira via MCP
2. Runs pre-spec compliance checks (GDPR, DPA, auth changes)
3. Checks for conflicts with existing Confluence specs
4. Generates spec in Confluence using TECHNICAL_SPEC_TEMPLATE structure
5. Presents gate C01 for Tech Lead review

After gate C01 is approved: run GENERATE_CODE.

---

#### REVIEW_SPEC [story-key or Confluence URL]

Reviews an existing spec for completeness, consistency, and compliance.

Usage:
```
REVIEW_SPEC PROJ-10
```

---

#### ANALYSE_IMPACT [story-key]

Analyses the blast radius of a proposed change before spec or code is written.
Run this for any story that touches integrations, shared data models, or Kafka.

Usage:
```
ANALYSE_IMPACT PROJ-10
```

What happens:
1. Dependency Mapper Agent identifies all affected modules
2. Checks for conflicts with in-progress work
3. Identifies cross-team dependencies
4. Flags any gate requirements (B02 new integration, B06 breaking schema)

---

### ENGINEERING COMMANDS

---

#### GENERATE_CODE [story-key]

Generates production-ready code from an approved technical specification.
Requires gate C01 to be approved on the spec first.

Usage:
```
GENERATE_CODE PROJ-10
```

What happens:
1. Code Gen Agent reads the approved spec from Confluence via MCP
2. Reads existing code in the affected module for pattern context
3. Generates code in the correct layer order (domain -> application -> API)
4. Copilot shows diffs for each file -- you approve each one
5. Generates unit tests alongside the code
6. Presents for peer review

---

#### GENERATE_TESTS [story-key or file-path]

Generates a complete test suite for a story or specific file.

Usage:
```
GENERATE_TESTS PROJ-10
```

---

#### GENERATE_MIGRATION [story-key]

Generates Flyway migration script, rollback script, and execution plan.

Usage:
```
GENERATE_MIGRATION PROJ-10
```

What happens:
1. Data Migration Agent reads the spec data model changes section
2. Generates forward migration with PII column retention comments
3. Generates rollback script
4. Generates zero-downtime execution plan
5. Presents gate C04 for Tech Lead and DBA approval

---

#### EXPLAIN_MODULE [module-name]

Analyses a module and explains its structure, call graph, and risks.
Run this BEFORE touching any unfamiliar module.

Usage:
```
EXPLAIN_MODULE party-domain
EXPLAIN_MODULE party-domain DEEP
```

---

#### REVIEW_PR [pr-number]

Runs a full automated peer review of a pull request.

Usage:
```
REVIEW_PR 42
```

What happens (all in parallel):
1. Peer Review Agent applies CODING_STANDARDS checklist
2. Security Review Agent applies S01-S20 security checklist
3. Secrets Scan Agent checks for exposed credentials
4. Accessibility Agent checks UI code (if present)
5. Consolidated review comment posted to PR with BLOCK / WARN / INFO findings

---

### QUALITY AND VALIDATION COMMANDS

---

#### VALIDATE_STORY [story-key]

Executes all acceptance criteria against the test environment.

Usage:
```
VALIDATE_STORY PROJ-10
```

What happens:
1. Feature Validation Agent reads ACs from Jira
2. Checks test environment health
3. Executes each AC as HTTP or Kafka test
4. Reports PASS / FAIL / BLOCKED / SKIP per AC with evidence
5. Transitions story to Done (all pass) or In Progress (any fail)

---

#### REVIEW_SECURITY [file-path or PR-number]

Applies the full security checklist to a file or PR.

Usage:
```
REVIEW_SECURITY PR:42
REVIEW_SECURITY src/main/java/com/telia/party/api/PartyController.java
```

---

#### TRIAGE_BUG [bug-key]

Enriches a Jira bug ticket with severity, root cause hypotheses, and reproduction steps.

Usage:
```
TRIAGE_BUG PROJ-500
```

What happens:
1. Bug Triage Agent reads the bug from Jira
2. Checks KEDB for matching known error (if found: surfaces workaround, done)
3. If new: identifies affected module, classifies severity, generates hypotheses
4. For P0/P1: notifies on-call engineer immediately

---

### OPERATIONS COMMANDS

---

#### DECLARE_INCIDENT [description]

Initiates the formal incident response process.

Usage:
```
DECLARE_INCIDENT "Party API returning 500 errors -- all users affected"
DECLARE_INCIDENT P0 "Party service unavailable since 14:30"
```

---

#### SRE_DIAGNOSE [service-name]

Analyses a production signal and produces a structured diagnosis.

Usage:
```
SRE_DIAGNOSE party-management-service
```

---

#### RAISE_PROBLEM [incident-keys]

Creates a KEDB problem record for a recurring issue.

Usage:
```
RAISE_PROBLEM PROJ-500 PROJ-523 PROJ-541
```

---

### DOCUMENTATION AND ARCHITECTURE COMMANDS

---

#### REFRESH_ARCH_DOCS

Updates Confluence architecture documentation from current project files.

Usage:
```
REFRESH_ARCH_DOCS
```

---

#### CREATE_ADR [title]

Scaffolds a new Architecture Decision Record in Confluence.

Usage:
```
CREATE_ADR "Use PostgreSQL as the primary party data store"
```

---

#### REVIEW_EVENT_SCHEMA [topic-name]

Assesses whether a Kafka schema change is backward compatible or breaking.

Usage:
```
REVIEW_EVENT_SCHEMA party.party.created
```

---

### PROJECT SETUP COMMANDS

---

#### START_ONBOARDING [name] [role]

Generates a personalised onboarding guide for a new engineer.

Usage:
```
START_ONBOARDING name="Anna" role="backend"
```

---

#### RUN_BROWNFIELD_SCAN

Executes the 7-phase brownfield discovery scan on the current codebase.

Usage:
```
RUN_BROWNFIELD_SCAN
```

---

## COMMAND CHAINING -- TYPICAL JOURNEYS

These are the sequences to follow for common scenarios.
Type commands in order. Wait for each output before running the next.

### New idea to first epic (ideation)
```
DRAFT_BRIEF           -- structure the rough idea
ANALYSE_CAPABILITIES  -- reason about what needs building and why
DRAFT_EPICS [key]     -- create agreed epics in Jira
```

### Epic to working code (delivery)
```
DRAFT_STORIES [epic-key]       -- decompose epic into stories
ESTIMATE_STORIES [story-keys]  -- get sizing
EXPLAIN_MODULE [module]        -- understand before touching
WRITE_SPEC [story-key]         -- generate spec (gate C01)
GENERATE_MIGRATION [story-key] -- if DB changes needed (gate C04)
GENERATE_CODE [story-key]      -- generate code from spec
REVIEW_PR [pr-number]          -- automated peer review (gate D01)
VALIDATE_STORY [story-key]     -- AC execution -> Done
```

### Bug to fix
```
TRIAGE_BUG [bug-key]     -- enrich and classify
EXPLAIN_MODULE [module]  -- understand before fixing
GENERATE_TESTS [bug-key] -- write regression test first
REVIEW_PR [pr-number]    -- review the fix
VALIDATE_STORY [bug-key] -- confirm ACs pass
```

---

## QUICK REFERENCE CARD

| Command | What it does | When to use |
|---|---|---|
| DRAFT_BRIEF | Structure a rough idea | Start of ideation |
| ANALYSE_CAPABILITIES | Reason about what to build | After brief, before epics |
| DRAFT_EPICS | Create Jira epics | After capability review |
| DRAFT_STORIES | Create Jira stories | Week before a sprint |
| ESTIMATE_STORIES | Suggest story points | During refinement |
| WRITE_SPEC | Generate technical spec | Before any coding |
| GENERATE_CODE | Generate code from spec | After spec approved |
| GENERATE_MIGRATION | Generate DB migration | When spec has DB changes |
| REVIEW_PR | Automated peer review | After opening a PR |
| VALIDATE_STORY | Run AC tests | When story is in QA |
| TRIAGE_BUG | Enrich a bug ticket | When bug is reported |
| EXPLAIN_MODULE | Understand a module | Before touching code |
| SRE_DIAGNOSE | Diagnose a production issue | When alert fires |
| DECLARE_INCIDENT | Start incident response | P0 or P1 in production |
