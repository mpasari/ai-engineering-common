# BROWNFIELD_DISCOVERY_PLAYBOOK.md
# Playbooks -- Onboarding an existing codebase to AI Engineering Commons
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04-30
# Owner: CoE Core

---

## Purpose

This playbook guides a team through installing the AI Engineering Commons
into an existing (brownfield) codebase. The goal is to go from zero AI
context to full AI-assisted delivery in 1-2 days without disrupting the
current sprint.

**Safe to repeat:** This playbook can be run multiple times on the same
repository. Running it again refreshes the project-layer files with
updated analysis.

---

## Ground rules for demo and testing runs

When running this as a demo or first-time test:

```
READ from:   Your real Jira project (read-only -- we pull ticket context)
             Your real Confluence space (read-only -- we read existing docs)

WRITE to:    Demo Jira project: SPOCKT (team: SPOCK Common)
             Demo Confluence space: ECAI
             Local files only (no push to the real repository)

Never:       Push generated files to the real repo during a demo run
             Create tickets in the real Jira project
             Write to production Confluence spaces
```

This means the team can run the full journey safely, see real results,
and repeat as many times as needed before committing to the real repo.

---

## Prerequisites

```
[ ] VS Code 1.99 or later installed
[ ] GitHub Copilot Chat v0.45.1 or later
[ ] Node.js 18 or later: node --version
[ ] Git installed and authenticated
[ ] Access to the brownfield repository (clone or local copy)
[ ] Jira MCP connected and working:
    In Copilot Chat Agent mode: @jira-mcp get my issues
[ ] Confluence MCP connected and working:
    In Copilot Chat Agent mode: @confluence-mcp search for pages in space ECAI
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

## Phase 1 -- Install and scan (Day 1 morning, ~2 hours)

### Step 1.1 -- Clone the repository (demo mode)

For demo and testing runs, work in a local clone. Do NOT push back to origin.

```powershell
# Clone the repository you want to analyse
git clone https://github.com/telia-company/[your-repo].git
cd [your-repo]

# Create a local demo branch -- all work stays here
git checkout -b ai-commons-demo
```

### Step 1.2 -- Install the commons

```powershell
# Install the commons package
npm install @telia-company/ai-engineering-common

# Initialise -- creates .ai/project/ stubs and .github/prompts/ commands
npx aec init

# Verify the stubs were created
Get-ChildItem ".ai\project\"
```

You should see these stub files created:
```
ARCHITECTURE_OVERVIEW.md  (empty -- to be filled by scan)
MODULE_REGISTRY.md        (empty -- to be filled by scan)
INTEGRATION_MAP.md        (empty -- to be filled by scan)
DATA_MODEL.md             (empty -- to be filled by scan)
KAFKA_TOPICS.md           (empty -- to be filled by scan)
TECH_DEBT_REGISTRY.md     (empty -- to be filled by scan)
FEATURE_ENV_CONFIG.md     (empty -- fill manually after scan)
SRE_SERVICE_CONFIG.md     (empty -- fill manually after scan)
JIRA_CONFIG.md            (empty -- fill manually)
```

### Step 1.3 -- Configure JIRA_CONFIG.md for demo

Open `.ai/project/JIRA_CONFIG.md` and fill in the demo project details:

```markdown
## Jira project configuration

Project key:        SPOCKT
Project name:       SPOCK T (demo project)
Jira base URL:      https://jira.atlassian.teliacompany.net
Board type:         Scrum
Default issue type: Story

Note: This is the DEMO project used for safe testing.
Real project key: [YOUR-REAL-PROJECT-KEY] (read-only during demo)

## Custom field mappings

Development Team field:
  Field ID:         customfield_12725
  Value for demos:  SPOCK Common

## Real project reference (read-only)

Real Jira project:     [YOUR-REAL-PROJECT-KEY]
Real Confluence space: [YOUR-REAL-SPACE-KEY]
These are used for READING context only.
All writes go to SPOCKT and ECAI during demo runs.
```

### Step 1.4 -- Open in VS Code and run the brownfield scan

```powershell
code .
```

Open Copilot Chat (Ctrl+Alt+I) → Agent mode. Verify all tools are ON.

Then type:

```
/run-brownfield-scan
```

**What happens during the 7-phase scan:**

```
Phase 1: Language and framework detection
  Reads: pom.xml, package.json, *.csproj, Dockerfile
  Outputs: stack, framework versions, CI tool

Phase 2: Repository structure mapping
  Reads: all source directories
  Maps: modules to Active / Legacy / Deprecated status
         (Active = committed to in last 90 days)
         (Legacy = no commits in 90+ days)
  Writes: .ai/project/MODULE_REGISTRY.md

Phase 3: Integration discovery
  Reads: HTTP client configuration, Kafka config, external URLs
  Writes: .ai/project/INTEGRATION_MAP.md
          .ai/project/KAFKA_TOPICS.md

Phase 4: Data model and PII discovery
  Reads: entity classes, database schemas, migration files
  Flags: columns likely to contain personal data
  Writes: .ai/project/DATA_MODEL.md

Phase 5: Technical debt identification
  Reads: file sizes, TODO/FIXME comments, dependency versions
  Identifies: large files, outdated dependencies, commented-out code
  Writes: .ai/project/TECH_DEBT_REGISTRY.md

Phase 6: Credential and secrets scan
  Reads: all source files
  Applies: credential pattern matching
  STOPS COMPLETELY if any credential is found
  (Credential must be rotated before Phase 7 can continue)

Phase 7: Documentation and output
  Writes: remaining .ai/project/ files
  Creates: Confluence architecture overview page in ECAI space
  Presents: Gate C01 for Tech Lead review
```

**Watch the output carefully during Phase 6.** If it stops, a credential
was found. See the troubleshooting section.

---

## Phase 2 -- Review and enrich (Day 1 afternoon, ~2 hours)

The scan produces a good baseline but cannot discover everything.
The Tech Lead reviews and corrects each file.

### Step 2.1 -- Review MODULE_REGISTRY.md

Open `.ai/project/MODULE_REGISTRY.md` and verify:

```
[ ] All modules are listed (none missing)
[ ] Active / Legacy / Deprecated status is correct
[ ] Module descriptions are accurate
[ ] No ghost modules (directories that are not really modules)
[ ] Owner team is correct for each module
```

Common issues the scan gets wrong:
- Test directories listed as modules (remove them)
- Generated code directories listed as active modules (mark as generated)
- Shared library directories listed incorrectly

### Step 2.2 -- Review INTEGRATION_MAP.md

```
[ ] All external systems are named (not just "external-api")
[ ] DPA status for each integration (default is Unknown -- flag for Security Lead)
[ ] Auth method for each integration
[ ] Both inbound AND outbound integrations listed
```

For the demo: DPA status will be Unknown for all integrations initially.
This is correct -- it becomes a follow-up action for the Security Lead.

### Step 2.3 -- Review DATA_MODEL.md

```
[ ] All database tables are listed
[ ] PII fields correctly flagged
[ ] Retention policies (blank initially -- flag as follow-up)
[ ] Relationships between tables noted
```

### Step 2.4 -- Fill in FEATURE_ENV_CONFIG.md manually

The scan cannot discover how to start the test environment. Fill this in:

```markdown
## Test environment

TEST_ENV_BASE_URL=http://localhost:8080
Health check: GET http://localhost:8080/health

## How to start

[paste the exact commands to start the local test environment]
e.g.:
  docker-compose up -d
  Wait 30 seconds
  curl http://localhost:8080/health

## Test users

[list test accounts -- never real subscriber data]
TEST_USER_VIEWER: viewer@example.com / viewer-local-only
TEST_USER_EDITOR: editor@example.com / editor-local-only
```

### Step 2.5 -- Regenerate tool configs and verify

```powershell
npx aec update
```

Then verify in Copilot Chat:

```
What project is this? List all modules, their status, key integrations,
and any high-risk areas I should know about before writing code.
```

Expected: Copilot accurately describes the codebase.
If it gives generic output: the project-layer files need more content.

### Step 2.6 -- Commit the baseline (demo branch only)

```powershell
git add .ai\ .github\ CLAUDE.md .cursorrules
git commit -m "chore: install AI Engineering Commons and baseline discovery

Generated by /run-brownfield-scan on [date].
Tech Lead review: pending.
Status: Phase 2 enrichment in progress."
```

---

## Phase 3 -- Deep analysis of risky modules (Day 2 morning)

### Step 3.1 -- Identify high-risk modules

Open `.ai/project/MODULE_REGISTRY.md` and note all modules marked:
- **Legacy** status
- **High** or **Critical** risk score from the scan

For each high-risk module, run a deep analysis:

```
/explain-module [module-name] DEEP
```

The DEEP analysis produces:
- Full call graph from every entry point
- Business rules and invariants the module enforces
- Hidden coupling with other modules or shared databases
- Refactoring prerequisites (what must change before this can be touched)
- Specific warnings for the team

**Important:** Do not skip this step. Teams consistently underestimate
Legacy module risk. The DEEP analysis surfaces hidden dependencies that
cause production incidents when the module is modified without understanding.

### Step 3.2 -- Document findings in MODULE_REGISTRY.md

After each DEEP analysis, add the key findings to MODULE_REGISTRY.md:

```markdown
| [module-name] | Legacy | High | [team] | [description]
Known risks: [paste key findings from DEEP analysis]
Do not modify without: [prerequisites from DEEP analysis]
```

### Step 3.3 -- Create tech debt stories in demo Jira

For each High severity tech debt item from TECH_DEBT_REGISTRY.md:

```
Using jira-mcp, create a tech debt story in project SPOCKT with:
- Summary: [TECH DEBT] [module-name]: [description of debt]
- Type: Story
- Team: SPOCK Common
- Label: ai-engineering-commons-test, tech-debt
- Description: [paste the relevant TECH_DEBT_REGISTRY.md entry]
```

These stories represent the team's real debt, documented in the
demo Jira project. They can be migrated to the real Jira project
after the demo run is validated.

### Step 3.4 -- Dependency vulnerability scan

In Copilot Chat:

```
Scan the dependencies in this project for known CVEs.
Check pom.xml (or package.json) against the OWASP vulnerability database.
List any Critical or High severity findings with CVE IDs.
Create Jira stories in project SPOCKT for each Critical finding.
```

---

## Phase 4 -- Read from real Jira and Confluence

This is where the demo gets powerful -- reading real context from the
team's existing Jira and Confluence while writing only to the demo project.

### Step 4.1 -- Read existing Jira stories for context

```
@jira-mcp search issues in project [REAL-PROJECT-KEY]
where status = "Ready" and type = "Story"
limit 10
```

This returns real stories from the team's backlog. The AI can read
these for context -- understanding what the team is currently working on,
what the ACs look like, and how stories are structured.

### Step 4.2 -- Read existing Confluence documentation

```
@confluence-mcp search for pages in space [REAL-SPACE-KEY]
about [service-name] architecture
```

If the team has architecture documentation in Confluence, Copilot reads it
and can cross-reference it with the scan findings. Discrepancies between
documented architecture and actual code are flagged automatically.

### Step 4.3 -- Analyse a real story end-to-end (demo mode)

Pick a real story from the team's backlog that is in Ready status.

```
@jira-mcp get issue [REAL-PROJECT-KEY-NNN]

Using the story above, run the full /write-spec protocol but:
- Write the spec to Confluence space ECAI (not the real space)
- Create any Jira tickets in project SPOCKT (not the real project)
- This is a demo run -- no changes to production systems
```

Copilot reads the real story, generates a real technical spec based on
the actual codebase context, but writes everything to the demo space.

The team can then compare:
- What they would have written manually vs what the AI generated
- What gaps the AI found (missing ACs, security considerations, GDPR flags)
- How long the spec generation took vs their manual process

---

## Phase 5 -- First real story (Week 1 end)

After the demo run is validated and the team is comfortable:

### Step 5.1 -- Choose the right starter story

Criteria for the first real AI-assisted story:
```
[ ] Module is marked Active (not Legacy) in MODULE_REGISTRY.md
[ ] Test coverage is Medium or High (from scan)
[ ] Story is 3 points or fewer
[ ] No cross-team dependencies
[ ] Tech Lead understands the module well
```

Avoid for the first story:
- Any Legacy or Critical risk module
- Database migrations (do these after the team is comfortable with code gen)
- Authentication changes (high risk, gate C05 required)
- Stories with unclear ACs

### Step 5.2 -- Run the full journey on the real repo

When ready to work on the real repository (not just demo mode):

```powershell
# Switch to a feature branch on the real repo
git checkout main
git pull
git checkout -b feature/[JIRA-KEY]-[description]

# The .ai/project/ files are already committed from Phase 1-2
# Run the full new feature journey
```

Follow the NEW_FEATURE_JOURNEY.md playbook from this point.

---

## Repeating the demo

This playbook is designed to be run multiple times:

```
Run 1: Tech Lead + CoE champion (understand the codebase)
Run 2: Full engineering team (see the tools in action)
Run 3: Management / DM (show the output and speed)
```

For each repeat run:
1. Check out a fresh clone of the `ai-commons-demo` branch
2. The `.ai/project/` files are already committed -- skip Phase 1
3. Start from Phase 3 (deep analysis) or Phase 4 (real story demo)
4. Everything writes to SPOCKT and ECAI -- no production impact

---

## Tracking two repos simultaneously

When running this playbook on two different repos at the same time:

```
Repo A: [repo-name-A]
  Demo branch: ai-commons-demo-A
  Demo Jira label: repo-a-brownfield
  Confluence parent: [ECAI page for Repo A]

Repo B: [repo-name-B]
  Demo branch: ai-commons-demo-B
  Demo Jira label: repo-b-brownfield
  Confluence parent: [ECAI page for Repo B]
```

Use the label field in Jira to distinguish stories from each repo.
Use separate Confluence parent pages for each repo's documentation.

Update this playbook after each run with observations:
- What the scan found vs what was expected
- Which modules were incorrectly classified
- What the DEEP analysis surfaced that the team did not know
- How long each phase took

---

## Brownfield discovery checklist

**Phase 1 -- Install and scan:**
```
[ ] Repository cloned to demo branch (ai-commons-demo)
[ ] npx aec init completed
[ ] JIRA_CONFIG.md filled with SPOCKT details
[ ] /run-brownfield-scan completed (all 7 phases)
[ ] No credentials found in Phase 6 (or rotated if found)
[ ] Gate C01 presented and reviewed by Tech Lead
[ ] Baseline committed to demo branch
```

**Phase 2 -- Enrich:**
```
[ ] MODULE_REGISTRY.md verified and corrected
[ ] INTEGRATION_MAP.md all systems named (no "unknown-api")
[ ] DATA_MODEL.md PII fields identified
[ ] FEATURE_ENV_CONFIG.md filled in manually
[ ] npx aec update run and committed
[ ] Copilot describes the codebase accurately
```

**Phase 3 -- Deep analysis:**
```
[ ] All Legacy and High-risk modules analysed with DEEP
[ ] Findings documented in MODULE_REGISTRY.md
[ ] Tech debt stories created in SPOCKT
[ ] Dependency scan run
```

**Phase 4 -- Real story demo:**
```
[ ] Real Jira stories read for context
[ ] Real Confluence docs read and cross-referenced
[ ] One real story run through /write-spec in demo mode
[ ] Team compares AI output vs manual process
[ ] Observations documented
```

**Ready for real work:**
```
[ ] Team comfortable with the commands
[ ] First real story selected (low-risk criteria met)
[ ] Tech Lead has approved moving to real repo
[ ] .ai/project/ files are accurate and up to date
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Phase 6 stops -- credential found | Exposed secret in source code | Rotate the credential immediately. Remove from code. Git history rewrite may be needed. Contact Security Lead. |
| Module registry has wrong modules | Large monorepo confuses scan | Edit MODULE_REGISTRY.md manually. Remove test/ and generated/ directories. |
| Copilot gives generic output after update | Project-layer files not detailed enough | Add more content to ARCHITECTURE_OVERVIEW.md and MODULE_REGISTRY.md descriptions. |
| /explain-module returns little output | Module is a thin wrapper | Ask: "Where is the actual business logic for [module]?" |
| Test environment fails to start | Missing dependency in docker-compose | Add all dependencies to docker-compose.yml and update FEATURE_ENV_CONFIG.md. |
| Jira field error when creating stories | Wrong custom field ID | Update JIRA_CONFIG.md -- run jira-mcp search fields for SPOCKT. |

---

## Observations log

Use this section to track findings as you run the playbook on real repos.
Update after each session.

### Repo A: [repo-name]
```
Date of run:
Phase 1 duration:
Phase 2 duration:
Modules found:
Legacy modules:
High-risk modules:
Credentials found (yes/no):
Tech debt items (High severity):
Dependency CVEs found:
Biggest surprise:
What the scan missed:
Team reaction:
```

### Repo B: [repo-name]
```
Date of run:
Phase 1 duration:
Phase 2 duration:
Modules found:
Legacy modules:
High-risk modules:
Credentials found (yes/no):
Tech debt items (High severity):
Dependency CVEs found:
Biggest surprise:
What the scan missed:
Team reaction:
```

---

## Version and review

| File owner | CoE Core |
| Version | 1.0.0 |
| Created | 2026-04-30 |
| Review cadence | After each brownfield run -- update with observations |
| Next review | After first two real brownfield runs complete |
