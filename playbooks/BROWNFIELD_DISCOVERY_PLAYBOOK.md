# BROWNFIELD_DISCOVERY_PLAYBOOK.md
# Playbooks -- Onboarding an existing codebase to AI Engineering Commons
# Version: 1.1.0
# Status: Active
# Last updated: 2026-05-06
# Owner: CoE Core
# Updated from: Live run on BDL repo (Java 21, Groovy, Perl, TSQL, Shell, 6000 commits)

---

## Purpose

This playbook guides a team through installing the AI Engineering Commons
into an existing (brownfield) codebase. The goal is to go from zero AI
context to full AI-assisted delivery in 1-2 days without disrupting the
current sprint.

**Safe to repeat:** This playbook can be run multiple times on the same
repository. Running it again refreshes the project-layer files.

**Proven on:** BDL (Billing Delivery Platform) -- Java 21, Groovy,
Spring Boot 3.5.5, Gradle, MS SQL Server, Kafka, 6000+ commits, 19 modules.

---

## Ground rules for demo and testing runs

```
READ from:   Your real Jira project (read-only -- pull ticket context)
             Your real Confluence space (read-only -- read existing docs)

WRITE to:    Demo Jira project: SPOCKT (team: SPOCK Common)
             Demo Confluence space: ECAI
             Local files only (no push to the real repository)

Never:       Push generated files to the real repo during a demo run
             Create tickets in the real Jira project
             Write to production Confluence spaces
```

---

## Prerequisites

```
[ ] VS Code 1.99 or later
[ ] GitHub Copilot Chat v0.45.1 or later
[ ] Node.js 18 or later: node --version
[ ] Git installed and authenticated
[ ] Access to the brownfield repository (clone or local copy)
[ ] Jira MCP working: @jira-mcp get my issues
[ ] Confluence MCP working: @confluence-mcp search for pages in space ECAI
```

**VS Code settings (must be set before starting):**

Open VS Code User Settings JSON (Ctrl+Shift+P → Open User Settings JSON):

```json
"github.copilot.chat.agent.fileEditing": true,
"github.copilot.chat.agent.runTasks": true,
"github.copilot.chat.agent.defaultTools": [
    "edit", "execute", "read", "search",
    "confluence-mcp", "jira-mcp",
    "io.github.github/github-mcp-server"
]
```

---

## Phase 1 -- Install and scan (Day 1 morning, ~1 hour)

### Step 1.1 -- Clone the repository (demo mode)

```powershell
git clone https://github.com/telia-company/[your-repo].git
cd [your-repo]

# Create a local demo branch -- all work stays here, never push
git checkout -b ai-commons-demo
```

### Step 1.2 -- Install the commons

**Important:** Corporate networks block registry.npmjs.org.
Use npm link from the local commons clone instead:

```powershell
# First time only -- link the commons
cd "C:\Users\[user]\...\ai-engineering-common"
npm link

# In the brownfield repo
cd [your-repo]
npm link @telia-company/ai-engineering-common

# Verify
npx aec version
```

Then initialise:

```powershell
npx aec init
```

Expected output:
```
created  .ai/project/ARCHITECTURE_OVERVIEW.md
created  .ai/project/DATA_MODEL.md
created  .ai/project/FEATURE_ENV_CONFIG.md
created  .ai/project/INTEGRATION_MAP.md
created  .ai/project/JIRA_CONFIG.md
created  .ai/project/KAFKA_TOPICS.md
created  .ai/project/MODULE_REGISTRY.md
created  .ai/project/SRE_SERVICE_CONFIG.md
created  .ai/project/TECH_DEBT_REGISTRY.md
created  .github/prompts/  [22 prompt files]
updated  .github/copilot-instructions.md
updated  CLAUDE.md
updated  .cursorrules
```

### Step 1.3 -- Shrink copilot-instructions.md

The generated copilot-instructions.md contains 28+ sections which
exhausts the context window before you type anything.
Replace it with a lean version:

```powershell
Set-Content -Path ".github\copilot-instructions.md" -Encoding UTF8 -Value @"
# AI Engineering Commons -- Copilot Instructions
# Project: [repo-name] brownfield discovery (demo run)
# Stack: [detected stack]

## Rules
- Execute commands immediately when triggered via prompt files
- Save all outputs to files in the project root
- Read .ai/project/JIRA_CONFIG.md before any Jira operation
- Write to demo project SPOCKT and ECAI space only -- never real systems
- Never hard delete -- soft delete only
- Never store credentials in code

## MCP tools available
- jira-mcp: demo writes to SPOCKT, reads from real project
- confluence-mcp: demo writes to ECAI space
"@

(Get-Content ".github\copilot-instructions.md").Count
# Should show: 17
```

### Step 1.4 -- Configure JIRA_CONFIG.md

```powershell
Set-Content -Path ".ai\project\JIRA_CONFIG.md" -Encoding UTF8 -Value @"
## DEMO (write target -- safe for testing)
Project key:        SPOCKT
Jira base URL:      https://jira.atlassian.teliacompany.net
Board type:         Scrum
Default issue type: Story

Custom field mappings:
  Development Team: customfield_12725
  Value for demos:  SPOCK Common

## REAL PROJECT (read-only -- never write here)
Real Jira project:     [REAL-PROJECT-KEY]
Real board type:       [Scrum or Kanban]
Real Confluence space: [REAL-SPACE-KEY]

IMPORTANT: All Jira writes go to SPOCKT only.
           All Confluence writes go to ECAI only.
           Real project and space are READ ONLY.

## Repo-specific notes
Stack: [detected stack]
Board type: [Kanban/Scrum -- important for Kanban: no sprint concept]
"@
```

**Note on Kanban boards:** If the real project uses Kanban (not Scrum),
there are no sprints. Use JQL status filters instead of sprint queries:
`@jira-mcp search issues in project [KEY] where status = "In Progress"`

### Step 1.5 -- Run the brownfield scan

Open VS Code: `code .`

Open Copilot Chat (Ctrl+Alt+I) → Agent mode → verify all tools ON.

```
/run-brownfield-scan
```

**The 7 phases and what to expect:**

```
Phase 1: Language and framework detection
  Reads: pom.xml / build.gradle / package.json / Dockerfile
  Expected output: primary stack, framework version, CI tools
  From BDL: Java 21, Spring Boot 3.5.5, Gradle, SonarQube

Phase 2: Module mapping
  Reads: directory structure, git commit history per directory
  Classifies: Active (commits in 90 days) / Legacy / Deprecated
  Expected output: module list with commit counts
  From BDL: 19 modules -- document-messaging 609 commits (core module)
  Note: Commit count is a reliable risk proxy -- highest commits = most risk

Phase 3: Integration discovery
  Reads: HTTP clients, Kafka config, external URLs, SMTP/SMPP config
  Expected output: all inbound and outbound integrations
  From BDL: Kafka (5 topics), Kivra, TeliaSign, SMTP, SMPP, SQL Server

Phase 4: Data model and PII discovery
  Reads: JPA entities, database schemas, migration files, flat files
  Flags: PII fields AND flat files containing personal data
  From BDL: 6 JPA entities, SSNs in kivra-ssns.txt (GDPR action required)
  IMPORTANT: Flat files with PII (e.g. *ssn*.txt) are a critical GDPR finding

Phase 5: Technical debt identification
  Reads: dependency versions, TODO/FIXME comments, file sizes
  From BDL: 11 items -- jTDS 2014 driver, springdoc incompatibility, missing GDPR policy

Phase 6: Credential scan
  Reads: all source files
  Note: NOT all credential findings cause a stop.
        Severity determines response:
        -- Production credential: STOP, rotate immediately, do not continue
        -- Test credential with private IP: Medium severity, log as tech debt, continue
  From BDL: sa/bdl in test file pointing to 10.14.41.160 (private dev IP)
            Classified Medium -- logged as TD-004, scan continued

Phase 7: Write output files
  Writes: all .ai/project/ files
  Creates: Confluence architecture page draft in ECAI
```

**Timing from live run (6000-commit mixed-language repo):**
Phase 1-7 completed in approximately 15-20 minutes end to end.

### Step 1.6 -- Commit the scan results

```powershell
git add .ai\ .github\ CLAUDE.md .cursorrules
git commit -m "chore: AI Engineering Commons brownfield scan complete

[paste Phase 1-7 summary from scan output]
Status: Phase 2 enrichment pending"

# DO NOT push -- demo branch only
```

---

## Phase 2 -- Verify and enrich (Day 1 afternoon, ~2 hours)

### Step 2.1 -- Verify context is loaded correctly

In Copilot Chat:

```
What project is this? List all modules with their status,
key integrations, and top 3 tech debt items.
```

Expected: Copilot accurately describes the codebase.
If it gives generic output: check that the .ai/project/ files have content.

### Step 2.2 -- Investigate any PII flat files found

If the scan found flat files containing personal data (SSNs, emails etc.):

```
Read the file [filename] found in Phase 4.
Tell me:
1. How many records it contains
2. When it was last modified (git log)
3. Which modules read this file
4. Any documentation about where this data comes from
```

This is always the highest GDPR priority in a brownfield scan.

### Step 2.3 -- Verify Legacy module classification

For each module marked Legacy by the scan:

```
Show me the git log for [module-name] for the last 12 months.
Is it truly Legacy (no commits) or does it still receive occasional changes?
Who last committed and when?
```

### Step 2.4 -- Fill in FEATURE_ENV_CONFIG.md manually

The scan cannot discover how to start the test environment:

```
Read docker-compose.yml, README.md, and any setup scripts.
Fill in .ai/project/FEATURE_ENV_CONFIG.md with:
- How to start the local test environment
- Health check endpoint URL
- Test database details (no real credentials)
- Environment variables needed
```

### Step 2.5 -- Regenerate and commit

```powershell
npx aec update
git add .ai\ CLAUDE.md .cursorrules
git commit -m "chore: Phase 2 enrichment complete -- .ai/project/ files verified"
```

---

## Phase 3 -- Deep analysis of high-risk modules (Day 2 morning)

### Step 3.1 -- Identify modules for DEEP analysis

Priority order:
1. Highest commit count (most active = most business logic)
2. All Kafka consumer concentration (one module consuming all topics = SPoF)
3. Any module handling PII (SSNs, customer IDs, account numbers)
4. Any module marked Legacy with recent commits (contradiction = risk)

### Step 3.2 -- Run DEEP analysis

For each high-priority module:

```
/explain-module [module-name] DEEP
```

From BDL -- run in this order:
```
/explain-module document-messaging DEEP    ← core module, all Kafka topics
/explain-module kivra-enrichment DEEP      ← handles Swedish SSNs
/explain-module galaxy-data DEEP           ← Legacy, verify it is safe to ignore
```

### Step 3.3 -- Create tech debt stories in demo Jira

For each High severity tech debt item:

```
Using jira-mcp, create a story in project SPOCKT with:
Summary: [TECH DEBT] [TD-NNN]: [description]
Type: Story
Team: SPOCK Common
Label: ai-engineering-commons-test, tech-debt, [repo-name]
Description: [paste from TECH_DEBT_REGISTRY.md]
```

---

## Phase 4 -- Read real Jira and Confluence context

### Step 4.1 -- Read real Jira tickets for context

```
@jira-mcp search issues in project [REAL-PROJECT-KEY]
where status = "In Progress"
limit 5
```

For Kanban boards (no sprints):
```
@jira-mcp search issues in project [REAL-PROJECT-KEY]
where status in ("In Progress", "Ready", "To Do")
order by updated DESC
limit 10
```

### Step 4.2 -- Read real Confluence documentation

```
@confluence-mcp search for pages in space [REAL-SPACE-KEY]
about [service-name] architecture
```

Cross-reference what Confluence says vs what the scan found.
Discrepancies are valuable -- they show where documentation has drifted
from reality.

### Step 4.3 -- Run a real story end-to-end (demo mode)

Pick a real story from the team's backlog in Ready status.

```
@jira-mcp get issue [REAL-PROJECT-KEY-NNN]

Using the story above and the BDL codebase context, run /write-spec
but write the spec to Confluence space ECAI (not the real space)
and any Jira updates to project SPOCKT (not the real project).
This is a demo run -- no changes to production systems.
```

Compare AI output vs what the team would have written manually.

---

## Phase 5 -- First real story criteria

When the team is ready to use the commons on the real repo:

```
Good starter story criteria:
  [ ] Module is Active (not Legacy or Deprecated)
  [ ] Not document-messaging for the first story (too complex)
  [ ] Test coverage is Medium or High
  [ ] Story is 3 points or fewer
  [ ] No cross-team Kafka dependencies
  [ ] Tech Lead understands the module

Avoid for first story:
  [ ] document-messaging (core module, high blast radius)
  [ ] kivra-enrichment (PII handling, GDPR risk)
  [ ] galaxy-data (Legacy)
  [ ] old/ (Deprecated)
  [ ] Any TSQL/stored procedure changes
```

---

## Repeating the demo

This playbook is designed for multiple runs:

```
Run 1: Tech Lead + CoE champion (understand the codebase)
Run 2: Full engineering team (see tools in action)
Run 3: Management / DM (show output and speed)
```

For each repeat run the .ai/project/ files are already committed
to the demo branch. Skip Phase 1 and start from Phase 3 or 4.

---

## Observations log -- BDL repo (first run 2026-05-06)

```
Date of run:          2026-05-06
Phase 1 duration:     ~5 minutes
Full scan duration:   ~15-20 minutes
Modules found:        19
Active modules:       17
Legacy modules:       1 (galaxy-data)
Deprecated modules:   1 (old/)
Credentials found:    Yes -- test credential (Medium, did not stop scan)
Tech debt items:      11 (3 High, 4 Medium, 4 Low)

Top findings:
  - document-messaging: 609 commits, consumes ALL 5 Kafka topics (SPoF risk)
  - kivra-ssns.txt: Swedish SSNs in a flat file (GDPR -- no retention policy)
  - jTDS 2014 JDBC driver: unmaintained, no TLS 1.2+ support (security risk)
  - springdoc 1.8: incompatible with Spring Boot 3.5.5 (TD-001)
  - Hardcoded sa/bdl credential in test file (TD-004 Medium)

Biggest surprises:
  - 19 modules in one repo (larger than expected for this type of service)
  - All 5 Kafka topics consumed by a single module (concentration risk)
  - SSNs in a flat file -- no team member mentioned this during planning

What the scan missed:
  - TSQL stored procedures (need manual TSQL_INVENTORY step)
  - Perl scripts business logic (need manual /explain-module)
  - Shell script credential analysis (partial -- flagged one, may be more)

Team reaction: TBD (pending Phase 2 review session)
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| npm install ETIMEDOUT | Corporate network blocks npmjs.org | Use npm link from local commons clone |
| PowerShell heredoc fails silently | URL-encoded markdown links in command | Use Set-Content with @"..."@ syntax instead |
| Phase 6 stops completely | Production credential found | Rotate credential immediately. Contact Security Lead. Do not continue until rotated. |
| Phase 6 finds test credential | Hardcoded in test file | Log as Medium tech debt. Continue scan. Verify it is truly a dev IP not production. |
| Copilot gives generic output | Project-layer files not detailed enough | Check .ai/project/ files have real content from scan. Run npx aec update. |
| Context window exhausted | copilot-instructions.md too large | Replace with lean 17-line version (Step 1.3) |
| Kanban board -- no sprint queries work | Real project is Kanban not Scrum | Use status-based JQL: where status in ("In Progress", "Ready") |
| Module wrongly classified as Legacy | Low commit count but still active | Manually correct MODULE_REGISTRY.md status |
| Flat file with PII found | Personal data outside database | Highest GDPR priority -- investigate immediately (Step 2.2) |

---

## TSQL inventory (additional step for repos with stored procedures)

If the scan finds TSQL files, run this additional step after Phase 2:

```
Read all .sql, .tsql, and stored procedure files in this repository.
Create TSQL_INVENTORY.md in the project root with:
- Stored procedure name
- What it does (one sentence)
- Input parameters
- Whether it modifies data (SELECT vs INSERT/UPDATE/DELETE)
- Last modified date from git log
```

This surfaces database-embedded business logic that is otherwise invisible.

---

## Version and review

| File owner | CoE Core |
| Version | 1.1.0 |
| Created | 2026-04-30 |
| Updated | 2026-05-06 -- updated from live BDL run |
| Review cadence | After each brownfield run |
