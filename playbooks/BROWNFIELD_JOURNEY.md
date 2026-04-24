# BROWNFIELD_JOURNEY.md
# Playbooks -- End-to-end journey: onboarding an existing codebase
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## Overview

Use this playbook when your team takes ownership of an existing
codebase that has no `.ai/project/` files and no commons setup.
The goal is to go from zero to a fully context-aware commons setup
in 1-2 days so all subsequent work benefits from AI assistance.

**Tools needed:** Claude Code (with GitHub MCP at minimum)
**Time:** Half a day for discovery, half a day for cleanup and validation

---

## Phase 1 -- Initial scan (2-3 hours)

### Step 1.1 -- Clone and install commons

```powershell
# Clone the existing repository
git clone https://github.com/telia-company/[existing-repo].git
cd [existing-repo]

# Install commons
npm install @telia-company/ai-engineering-common
npx aec init

# This creates empty stubs in .ai/project/
# Do NOT fill them in yet -- the brownfield scan does this
```

### Step 1.2 -- Run the brownfield scan

```
# In Claude Code:
RUN_BROWNFIELD_SCAN
```

**What the scan does (7 phases, 30-60 min for medium codebase):**

```
Phase 1: Language and framework detection
  Reads pom.xml / package.json / *.csproj
  Identifies: Java 17 Spring Boot, TypeScript React, etc.

Phase 2: Repository structure mapping
  Maps directories to modules, identifies Active vs Legacy status
  Generates: MODULE_REGISTRY.md

Phase 3: Integration discovery
  Scans for HTTP clients, Kafka producers/consumers, database config
  Generates: INTEGRATION_MAP.md, KAFKA_TOPICS.md

Phase 4: Data model discovery
  Finds @Entity classes, TypeORM entities, EF Core models
  Flags: PII fields without retention policy
  Generates: DATA_MODEL.md

Phase 5: Technical debt identification
  Finds: large files, TODO/FIXME, outdated dependencies
  Creates: TECH_DEBT_REGISTRY.md, Jira tasks for High severity items

Phase 6: Security check
  Applies credential patterns to all source files
  !! STOPS if credentials found -- rotation required before Phase 7

Phase 7: Documentation output
  Writes all .ai/project/ files
  Creates Confluence architecture overview page (draft)
  Presents gate C01 for Tech Lead review
```

Watch the phase output in Claude Code. Phase 6 is the critical one --
if it stops, you have exposed credentials and must deal with that
before continuing.

### Step 1.3 -- Gate C01: Tech Lead reviews discovery output

After Phase 7 completes:

**Tech Lead reviews:**

```
.ai/project/MODULE_REGISTRY.md
  -- Are all modules listed? Are any missing?
  -- Is the Legacy/Active status correct?

.ai/project/INTEGRATION_MAP.md
  -- Are all integrations listed?
  -- DPA status is likely Unknown for all -- flag for Security Lead

.ai/project/DATA_MODEL.md
  -- Are PII fields correctly identified?
  -- Add retention policies for any PII fields found

.ai/project/TECH_DEBT_REGISTRY.md
  -- Review High severity items
  -- Prioritise which to address in next sprint
```

Approve by replying `APPROVED C01` or via Jira comment.

---

## Phase 2 -- Enrich the project-layer files (2-4 hours)

The scan produces a good baseline but it cannot discover everything.
The Tech Lead and champion fill in the gaps.

### Step 2.1 -- Verify and complete MODULE_REGISTRY.md

```
For each module the scan identified:
  [ ] One-sentence description is accurate
  [ ] Status (Active/Legacy/Deprecated) is correct
  [ ] Owner team is correct
  [ ] Known risks / tech debt section is filled in

Add any modules the scan missed:
  -- Modules in non-standard locations
  -- External shared libraries your team maintains
  -- Infrastructure-as-code directories that contain logic
```

### Step 2.2 -- Complete INTEGRATION_MAP.md

The scan finds HTTP clients and Kafka consumers but may not know
which external system they connect to. Fill in:

```
For each integration found:
  [ ] System name (not just "external-api" but the actual system)
  [ ] DPA status (confirm with Security Lead -- default to Unknown)
  [ ] Auth method (how does authentication work?)
  [ ] SLA (what availability does the partner guarantee?)
```

### Step 2.3 -- Add retention policies to DATA_MODEL.md

The scan flags PII fields but does not know the retention policy.
For each flagged field, add the retention policy per COMPLIANCE_STANDARDS.md:

```
  COMMENT ON COLUMN [table].[column]
    IS 'Personal data. Retention: active account + 7 years. Anonymise on account deletion.';
```

This must be done before any migration that touches PII columns.

### Step 2.4 -- Fill in FEATURE_ENV_CONFIG.md

The scan cannot know how to start the test environment. Fill this in manually.

```
# In FEATURE_ENV_CONFIG.md:
TEST_ENV_BASE_URL=http://localhost:8080

How to start:
  docker-compose up -d
  Wait 30 seconds
  curl http://localhost:8080/health

Test users: [describe the test accounts]
```

### Step 2.5 -- Regenerate tool configs

```powershell
npx aec update

# Verify context quality
# In Claude Code:
What project is this? List the modules, their status, and known risks.
```

Expected: Claude accurately describes the codebase from the filled-in files.

---

## Phase 3 -- Deep-dive on risky modules

The brownfield scan automatically calls the Legacy Explainer for
High and Critical risk modules. Review its output carefully.

### Step 3.1 -- Review high-risk module analyses

```
# In Claude Code:
EXPLAIN_MODULE [high-risk-module-name] DEEP
```

Deep analysis (30-60 minutes) produces:
- Full call graph from every entry point
- Invariants the module enforces
- Hidden coupling with other modules or shared databases
- Refactoring prerequisites

Review this with the team before anyone touches the Legacy module.
Document key findings in TECH_DEBT_REGISTRY.md.

### Step 3.2 -- Create tech debt stories

For each High severity tech debt item:

```
# In Claude Code:
Create a Jira tech debt story for: [paste TECH_DEBT_REGISTRY.md item]
```

This creates a properly structured Jira story linked to the relevant
KEDB entry. The team prioritises these in sprint planning.

---

## Phase 4 -- Security and compliance triage

### Step 4.1 -- Dependency vulnerability check

```
# In Claude Code:
CHECK_DEPENDENCIES
```

The Vuln Scan and CVE Triage agents scan all dependencies, check
against NVD, and create Jira security tickets for Critical and High findings.
Gate E09 is presented for Security Lead approval of the remediation plan.

### Step 4.2 -- DPA status for all integrations

For every integration in INTEGRATION_MAP.md with DPA = Unknown:

```
# In Claude Code:
What integrations in this project have unknown DPA status?
Create Jira tasks for Security Lead to confirm DPA for each.
```

### Step 4.3 -- PII retention policy audit

```
# In Claude Code:
Which tables in DATA_MODEL.md have PII fields without retention policies?
Create Jira tasks for each missing retention policy.
```

---

## Phase 5 -- First sprint on the existing codebase

With the discovery complete, the team is ready to work. The flow is
the same as NEW_FEATURE_JOURNEY.md but with one additional step:

Always run `EXPLAIN_MODULE [module]` before any story that touches
that module. For Legacy or High-risk modules, run DEEP analysis.

For the first sprint, recommend picking:
- One low-risk feature story (Active module, good test coverage)
- One tech debt story (from the TECH_DEBT_REGISTRY.md High items)

This gives the team confidence in the tooling while also making a
dent in the debt.

---

## Brownfield checklist

```
Phase 1 -- Discovery:
  [ ] npx aec init run
  [ ] RUN_BROWNFIELD_SCAN completed (all 7 phases)
  [ ] No exposed credentials found (Phase 6 passed)
  [ ] Gate C01 approved by Tech Lead

Phase 2 -- Enrichment:
  [ ] MODULE_REGISTRY.md verified and completed
  [ ] INTEGRATION_MAP.md completed (no Unknown system names)
  [ ] DATA_MODEL.md has retention policies for PII fields
  [ ] FEATURE_ENV_CONFIG.md filled in and test environment verified
  [ ] npx aec update run and committed

Phase 3 -- Deep analysis:
  [ ] High-risk modules analysed (EXPLAIN_MODULE DEEP)
  [ ] Tech debt stories created for High severity items

Phase 4 -- Security:
  [ ] CHECK_DEPENDENCIES run and remediation plan approved
  [ ] DPA tasks created for Unknown integrations
  [ ] PII retention policy tasks created

Phase 5 -- Ready to work:
  [ ] npx aec check passes (no MISSING or STUB warnings)
  [ ] Claude describes the codebase accurately in Claude Code session
  [ ] First feature story delivered end-to-end using NEW_FEATURE_JOURNEY.md
```

---

## Common brownfield problems

```
"RUN_BROWNFIELD_SCAN stops at Phase 6"
  -- Exposed credential found. Rotate it, remove from code, then retry.
  -- If in git history: contact Security Lead.

"MODULE_REGISTRY.md has wrong modules"
  -- Scan uses directory heuristics. Large monorepos may confuse it.
  -- Edit MODULE_REGISTRY.md manually to correct.

"EXPLAIN_MODULE returns no useful information"
  -- Module is a thin wrapper with all logic elsewhere.
  -- Ask Claude Code: "Where is the actual business logic for [module]?"

"TEST_ENV fails to start after FEATURE_ENV_CONFIG.md is filled in"
  -- Missing external dependency (database not in docker-compose).
  -- Add all dependencies to docker-compose.test.yml.
```

---

## Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
