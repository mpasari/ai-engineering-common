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

After each DEEP analysis completes, save the output to a file:

```
Save the DEEP analysis you just produced to
.ai/project/deep/[module-name]-DEEP.md in the project root.
```

Then commit:

```powershell
git add .ai\project\deepgit commit -m "docs: DEEP analysis for [module-name]"
```

This preserves the analysis for future sessions and team members.
Future Copilot sessions can read these files instead of re-running
the full DEEP analysis (which takes several minutes per module).

**What to look for in DEEP output:**

```
[ ] Silent exception handling in Kafka consumers (no DLQ = messages dropped)
[ ] @Qualifier or @ConditionalOnProperty beans used without null-guards
[ ] Duplicated business rules in multiple classes or modules
[ ] File locks / PID files without operational runbook
[ ] Shared database tables with no documented ownership
[ ] Scheduled or async threads with no external alerting on failure
[ ] Startup failures on missing directories or files
[ ] Two independent implementations of the same business rule
```

Each finding becomes a tech debt story in the demo Jira project.

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

## Phase 3 key findings -- DEEP analysis lessons from BDL live run

### DEEP analysis surfaces what code review cannot

The /explain-module DEEP command on document-messaging (249 classes,
609 commits) produced findings that would take a senior engineer weeks
to piece together manually:

**What DEEP finds that normal code review misses:**
- Silent failure modes (exceptions caught and swallowed)
- Latent bugs in conditional code paths (NPEs on unconfigured beans)
- Duplicated business rules across modules
- Operational runbook gaps (crash recovery, lock files)
- Shared database table ownership boundaries
- Thread model risks (busy-wait loops, no load testing)

### No DLQ is the most dangerous pattern in event-driven systems

From BDL: BaseConsumer.consume() catches all exceptions and returns.
A mapping error permanently drops the invoice delivery message with
no alert, no retry, no dead-letter record.

During peak billing cycles this means failed deliveries are invisible.
The team may not know invoices were never sent until customers complain.

**Add to Phase 3 checklist:** Always check Kafka consumer error handling.
If no DLQ strategy exists -- create a High severity tech debt story
before any consumer changes are made.

### Latent bugs in optional Spring beans

From BDL: @Qualifier("alpha") and @Qualifier("c2b") beans are optional.
If not configured, a null dereference occurs at runtime when a specific
customer routing path is hit. The bug is invisible in normal operation.

**DEEP analysis identifies these by tracing @ConditionalOnProperty and
@Qualifier injection points.** Look for: optional beans used without
null-guards in task classes.

### Duplicated business rules indicate future divergence

From BDL: Phone number normalisation (+46 stripping) implemented
independently in Ace.sendCallback() and BrmEventMapper.
Two implementations of the same rule will eventually diverge --
one will be updated, the other forgotten.

**DEEP identifies this by finding semantically similar code blocks
in different modules.** Each duplication should become a tech debt story.

### Single instance lock files need operational runbooks

From BDL: document-messaging acquires a FileLock at startup.
If the service crashes, the lock file remains and the service
refuses to restart until manually deleted. No runbook documents this.

**Add to Phase 3 checklist:** For any service using file locks,
PID files, or singleton patterns -- verify an operational runbook
exists for crash recovery before declaring the module safe to modify.

### Shared database tables require coordinated release process

From BDL: 8 DAOs in document-messaging write to NetBill DB tables
also written by bdlx-api and netbilldb-service. Schema changes break
all three services simultaneously.

**Add to INTEGRATION_MAP.md:** Document shared database tables as
integrations, not just HTTP/Kafka connections. Each shared table
needs an ownership record (which service owns the schema).

### DEEP analysis output should be committed to the repo

The DEEP analysis for each critical module should be saved as a
markdown file in `.ai/project/deep/` so future sessions and team
members can reference it without re-running the analysis.

```
.ai/project/deep/
  document-messaging-DEEP.md
  kivra-enrichment-DEEP.md
  [other critical modules]
```

---

## Phase 4 -- Read real Jira and Confluence (Day 2, ~1 hour)

This phase connects the brownfield findings to the team's actual sprint work.
It is the most powerful demo moment -- the AI reads a real ticket and
cross-references it with findings from the DEEP analysis automatically.

### Step 4.1 -- Read real Jira for backlog context

For Kanban boards (no sprints), use status-based JQL:

```
@jira-mcp search issues in project [REAL-PROJECT-KEY]
where status in ("In Progress", "To Do")
order by updated DESC
limit 5
```

Note: "Ready" may not be a valid status in all projects.
The MCP will report invalid statuses and retry with valid ones automatically.

From BDL: TDMT uses Kanban. "Ready" was invalid -- MCP retried with
"In Progress" and "To Do". 20 matching issues returned.

### Step 4.2 -- Pick a story that touches a DEEP-analysed module

Choose a story that touches a module you ran DEEP on.
This creates the most compelling demo -- the AI can cross-reference
live findings against a real ticket.

From BDL: TDMT-103 "Add MSISDN to SMS for depleted data bucket"
touches BrmEventMapper and BrmEventConsumer -- both analysed in the
document-messaging DEEP. This created a direct link between TD-008
(phone normalisation duplicated) and the story being specced.

### Step 4.3 -- Read the full story

```
@jira-mcp get issue [REAL-PROJECT-KEY-NNN]
```

Read the full description, acceptance criteria, linked features,
and any attachments. The AI uses all of this in spec generation.

### Step 4.4 -- Generate the spec in demo mode

```
Using the context from [REAL-PROJECT-KEY-NNN] and the DEEP analysis
in .ai/project/deep/[module]-DEEP.md, generate a technical spec.

Write the spec to Confluence space ECAI under parent page 1289964045.
Do not update the real Jira ticket.
Do not create tickets in the real project.
This is demo mode -- write to ECAI and SPOCKT only.
```

**What a good spec produces automatically:**

The AI cross-references the story against all brownfield findings and surfaces:

1. Tech debt conflicts: which known TD items affect this story
2. Architectural decisions required before implementation
3. GDPR implications of the change (new PII fields, lawful basis)
4. Encoding or locale risks (e.g. Swedish characters in SMS)
5. Missing information the team must resolve before coding starts
6. Gate C01 presentation for Tech Lead approval

**From BDL -- TDMT-103 spec surfaced:**
- RISK (HIGH): TD-008 -- this story would create a THIRD phone normalisation
  implementation. Fix TD-008 in same PR recommended.
- DECISION: [user name] placeholder not feasible without BRM schema change
- DECISION: DbTemplate token syntax unknown -- must query DB first
- ENCODING RISK: å ä ö are GSM-7 extended chars -- 160-char SMS becomes 153
- Gate C01 presented automatically

Confluence page created: https://itwiki.atlassian.teliacompany.net/pages/viewpage.action?pageId=1296160892

### Step 4.5 -- Evidence files to show

After Phase 4, these are the files to show as evidence:

```
Confluence (ECAI space):
  SPEC: TDMT-103 -- Add MSISDN to SMS for depleted data bucket
  URL: https://itwiki.atlassian.teliacompany.net/pages/viewpage.action?pageId=1296160892
  Shows: Full technical spec with cross-referenced TD findings

Jira (SPOCKT):
  SPOCKT-24430 to SPOCKT-24436
  Shows: 7 stories auto-created from brownfield findings

Local files:
  .ai/project/deep/document-messaging-DEEP.md  ← 249-class analysis
  .ai/project/deep/kivra-enrichment-DEEP.md    ← PII/GDPR analysis
  .ai/project/TECH_DEBT_REGISTRY.md            ← TD-001 to TD-014
  .ai/project/MODULE_REGISTRY.md               ← 19 modules with status
  .ai/project/INTEGRATION_MAP.md               ← all integrations with DPA status
  .ai/project/KAFKA_TOPICS.md                  ← 5 topics with consumer details
```

---

## Phase 5 -- First real story criteria (Week 1 end)

After the demo run is validated, these criteria determine which story
is safe to start with AI assistance on the real repo.

### Starter story selection criteria

```
MUST be true:
  [ ] Module is Active in MODULE_REGISTRY.md
  [ ] Module has Medium or High test coverage (from DEEP analysis)
  [ ] Story is 3 points or fewer
  [ ] No cross-module Kafka dependencies
  [ ] Tech Lead understands the module well

AVOID for first story:
  [ ] document-messaging (core module, high blast radius, no DLQ)
  [ ] kivra-enrichment (PII handling, crash risk, no null-safety)
  [ ] Any module marked with refactoring prerequisites in DEEP analysis
  [ ] Database migrations (do these after team is comfortable with code gen)
  [ ] Authentication changes (gate C05 required)
```

### What makes a good first story

The ideal first story touches a leaf module (no downstream consumers),
has clear Given/When/Then ACs already written, and does not modify
any shared database tables.

From BDL, good first story candidates:
- A story in `api` module (Active, REST-only, limited blast radius)
- A story in `robin-export` (SFTP writer, isolated, lower risk)
- Any story in `libraries` (shared utils, highly testable)

Avoid for first story:
- Any story touching `document-messaging` until TD-006 (DLQ) is fixed
- Any story touching `kivra-enrichment` until TD-012 (null-safety) is fixed

### Running the first real story

When the criteria are met, switch to the real repo:

```powershell
# On the real repo (not the demo branch)
git checkout main
git pull
git checkout -b feature/[REAL-JIRA-KEY]-[description]

# The .ai/project/ files are already there from the demo branch
# Copy them to main before starting
git checkout ai-commons-demo -- .ai/project/
git add .ai/project/
git commit -m "chore: add AI Engineering Commons project context"
```

Then follow the NEW_FEATURE_JOURNEY.md playbook.

---

## Complete evidence guide -- what to show at each phase

This section maps each phase to the exact files and URLs to show
as evidence during a team demo or champions presentation.

### Phase 1 evidence
```
File: .ai/project/MODULE_REGISTRY.md
Show: 19 modules with Active/Deprecated status and commit counts
Say:  "This was empty 15 minutes ago. The scan filled it in automatically."

File: .ai/project/TECH_DEBT_REGISTRY.md
Show: TD-001 to TD-011, first 3 items (High severity)
Say:  "11 tech debt items found. 3 High priority. The team knew about some,
       not all of them."

File: .ai/project/INTEGRATION_MAP.md
Show: Kivra, TeliaSign, SMTP, SMPP, SQL Server entries
Say:  "Every external system mapped with protocol and auth method."
```

### Phase 2 evidence
```
Jira: SPOCKT-24430
Show: [GDPR] Document and enforce retention policy for kivra-ssns.txt
Say:  "Swedish personnummer in a runtime flat file. No retention policy.
       Found in 2 minutes of investigation. Created in Jira automatically."

File: .ai/project/MODULE_REGISTRY.md
Show: galaxy-data entry -- reclassified from Legacy to Active
Say:  "The scan said Legacy. Git log said Active. Java 21 upgrade in 2025.
       We corrected it."
```

### Phase 3 evidence
```
File: .ai/project/deep/document-messaging-DEEP.md
Show: Risk level CRITICAL. Entry points table. Invariants section.
Say:  "249 classes. The AI mapped every entry point, every invariant,
       and every hidden dependency. Then created Jira stories for the risks."

Jira: SPOCKT-24431
Show: [CRITICAL] No DLQ -- silent message drop
Say:  "Invoice delivery failures during billing cycles are completely
       invisible. No alert fires. No engineer knows. Found by the AI."

Jira: SPOCKT-24434
Show: [CRITICAL] KivraSsns crashes billing run on corrupt SSN file
Say:  "One corrupt file crashes the entire Kivra billing cycle with no
       recovery. Trivial to fix. Never documented until now."
```

### Phase 4 evidence
```
Jira: TDMT-103 (real production ticket -- read only)
Show: The story description -- MSISDN in SMS for depleted data bucket
Say:  "This is a real ticket from your board. Unassigned. To Do."

Confluence: ECAI space -- SPEC: TDMT-103
URL: https://itwiki.atlassian.teliacompany.net/pages/viewpage.action?pageId=1296160892
Show: The three decisions section and the encoding risk
Say:  "The AI read the ticket, read the DEEP analysis, and caught that
       this story would create a THIRD phone normalisation implementation --
       a problem the team did not know existed. And it caught the Swedish
       character encoding risk before any code was written."

File: .ai/project/deep/document-messaging-DEEP.md
Show: Invariant 4 -- phone normalisation section
Say:  "This is where the connection came from. The DEEP analysis documented
       the duplication. The spec picked it up automatically."
```

---

## Phase 2 key findings -- lessons from BDL live run

### PII flat files are runtime-only (not in git)

The scan flagged `kivra-ssns.txt` as a PII file but it does not exist
in the repository -- it is a runtime-only file deployed to the server.

When a flagged PII file is not in git, investigate the runtime:

```
In Copilot Chat:
"The scan flagged [filename] as a PII file but it is not in git.
Find the class that loads this file and tell me:
1. Where the file is expected at runtime
2. Which script or process generates it
3. What data it contains
4. Whether old copies could accumulate in backup directories"
```

Runtime-only PII files are often MORE dangerous than committed files:
- No git history means no audit trail
- Backup copies accumulate undetected
- Access control is rarely documented
- The generation script may have its own GDPR implications

From BDL: kivra-ssns.txt generated by kivra_checker.sh each billing
cycle. No retention policy documented anywhere. Created TD-005 (SPOCKT-24430).

### Crash risk from PII file loading without error handling

Look for classes that load PII files at startup with no null-safety.
A corrupt PII file that crashes a business-critical process is both
a reliability risk and a data integrity risk.

From BDL: KivraSsns.java loads SSNs into HashSet with no null-safety.
Corrupt file throws RuntimeException at startup, crashing billing cycle.

### Legacy classification requires recency AND content check

The scan classified galaxy-data as Legacy based on low commit count.
Git log revealed 8 commits since 2024 including Java 21 upgrade and
Gradle 9.1 migration -- clearly Active.

Reliable Legacy signals (all three must be true):
- No commits in 12+ months
- No dependency updates in the same period
- No import references in Active modules

Low commit count alone is not sufficient for Legacy classification.
Always check commit recency and content before accepting the scan result.

From BDL: galaxy-data reclassified Active. All 19 modules are Active
or Deprecated -- no truly Legacy modules in this repository.

### Jira MCP self-corrects on field validation errors

When creating stories, the MCP may fail on the first attempt with
"Development Team is required". It searches for the correct field
format and retries automatically. Wait for the retry rather than
intervening. From BDL: SPOCKT-24430 created after two automatic retries.

### Git commands must run in the terminal, not through Copilot

When Copilot proposes a git commit via the Allow/Skip button, click Skip.
Always run git add, git commit, git push manually in the terminal.
Running git through Copilot commits files before you can review what
is staged.

### Keep/Undo buttons in editor are pending Copilot edits

After /run-brownfield-scan, each generated .ai/project/ file has a
pending Copilot edit (Keep/Undo). These must be accepted before running
git commit. Check every .ai/project/ file for Keep/Undo buttons after
the scan completes.

---

## Observations log -- BDL repo (first run 2026-05-06)

```
Date of run:          2026-05-06
Phase 1 duration:     ~5 minutes
Full scan duration:   ~15-20 minutes
Modules found:        19
Active modules:       18 (galaxy-data reclassified from Legacy after Phase 2 check)
Legacy modules:       0 (galaxy-data had 8 commits since 2024 -- reclassified Active)
Deprecated modules:   1 (old/)
Credentials found:    Yes -- test credential sa/bdl in test file (Medium, did not stop scan)
Tech debt items:      11 (3 High, 4 Medium, 4 Low) + TD-005 added in Phase 2

Phase 1 top findings:
  - document-messaging: 609 commits, consumes ALL 5 Kafka topics (SPoF risk)
  - kivra-ssns.txt: Swedish SSNs in a flat file (GDPR -- no retention policy)
  - jTDS 2014 JDBC driver: unmaintained, no TLS 1.2+ support (security risk TD-002)
  - springdoc 1.8: incompatible with Spring Boot 3.5.5 (TD-001)
  - Hardcoded sa/bdl credential in test file (TD-004 Medium)

Phase 2 additional findings:
  - kivra-ssns.txt is runtime-only (not in git) -- generated by kivra_checker.sh
  - KivraSsns.java loads SSNs with no null-safety -- crash risk on corrupt file
  - galaxy-data wrongly classified Legacy -- has 8 commits since 2024 (reclassified)
  - Jira MCP self-corrected on field error -- SPOCKT-24430 created after 2 retries

Demo Jira stories created:
  - SPOCKT-24430: [GDPR] Document and enforce retention policy for kivra-ssns.txt

Phase 3 in progress:
  - /explain-module document-messaging DEEP running

Biggest surprises:
  - 19 modules in one repo (larger than expected)
  - All 5 Kafka topics consumed by a single module (concentration risk)
  - SSNs in a runtime flat file -- no team member mentioned this during planning
  - galaxy-data is Active not Legacy despite low commit count

What the scan missed:
  - Correct Legacy classification (needs manual git log verification)
  - Runtime-only PII files (scan flags the reference but not the runtime file)
  - Crash risk in PII file loader (surfaced by Phase 2 investigation)

Playbook improvements made after this run:
  - npm link as primary install method
  - Lean copilot-instructions.md step added
  - Phase 6 severity guidance (not all findings stop scan)
  - Phase 2 Legacy verification step added
  - Runtime PII file investigation added
  - Keep/Undo button acceptance step added
  - Git commands must run in terminal (not Copilot) added
  - Jira MCP self-correction behaviour documented

Phase 3 DEEP analysis results:
  document-messaging (249 classes, 609 commits):
    - SPOCKT-24431 (TD-012): No DLQ -- messages silently dropped [CRITICAL]
    - SPOCKT-24432 (TD-013): Phone normalisation duplicated [ARCH]
    - SPOCKT-24433 (TD-014): Latent NPE alpha/c2b channels [BUG]
  kivra-enrichment (CLI batch, Java 21, no Spring):
    - SPOCKT-24434 (TD-012): KivraSsns crashes billing run on corrupt file [CRITICAL]
    - SPOCKT-24435 (TD-013): Silent partial output with exit code 0 [HIGH]
    - SPOCKT-24436 (TD-014): getCustID()==SSN coupling undocumented [ARCH]

Total demo Jira stories created: 7
  SPOCKT-24430 to SPOCKT-24436
  Labels: bdl-brownfield, ai-engineering-commons-test

Agent self-correction observed:
  - TD numbering clash: agent detected TD-009/011 already claimed,
    automatically used TD-012/014 instead. No engineer intervention needed.

explain-module.prompt.md updated during run:
  - DEEP mode now autonomous: creates Jira stories without asking
  - Saves output to .ai/project/deep/ automatically
  - States next step without waiting for input

Team reaction: TBD (pending team review session)
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
| Version | 1.5.0 |
| Created | 2026-04-30 |
| Updated | 2026-05-06 -- full journey Phase 1-4 complete with evidence guide |
| Review cadence | After each brownfield run |
