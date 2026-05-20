# M3 — Brownfield Discovery Tutorial
# AI Engineering Commons — Champions Programme
# Version: 1.0
# Last updated: 2026-05-14
# Prerequisite: M1 completed (Confluence and Jira MCP working)

---

## What you will achieve by the end of this tutorial

By the end of M3 you will have:
- Your team's real codebase scanned across 7 automated phases
- A complete module registry with Active/Legacy/Deprecated classification
- All external integrations mapped with protocol and auth method
- PII fields and personal data identified automatically
- A tech debt registry with High/Medium/Low severity items
- A demo Jira project updated with your real findings

**Time to complete:** 3-4 hours (scan 15-20 min + Phase 2 enrichment 2-3 hrs)
**Difficulty:** Intermediate
**Prerequisites:** M1 complete
**Next milestone:** M4 — DEEP Analysis

---

## Why this matters

Most teams inherit codebases they do not fully understand.
New engineers spend weeks reading old code before they can touch anything safely.
GDPR obligations hide in legacy data handling. Credentials get committed years ago
and nobody notices.

The brownfield scan surfaces all of this in 15 minutes -- automatically.
No manual documentation effort. No archaeology. Just answers.

---

## Ground rules (important -- read before starting)

```
READ from:   Your real Jira project (read-only)
             Your real Confluence space (read-only)

WRITE to:    Demo Jira: SPOCKT only (team: SPOCK Common)
             Demo Confluence: ECAI space only
             Local demo branch only

NEVER:       Push generated files to the real repository origin
             Create tickets in your real Jira project
             Write to your team's real Confluence space
```

This means you can run this safely on any codebase.
If anything goes wrong, nothing in production is affected.

---

## Step 1 — Clone your repository and create a demo branch

**What to do:**

```powershell
git clone https://github.com/telia-company/[your-repo].git
cd [your-repo]
git checkout -b ai-commons-demo
```

**What you should see:**
```
Switched to a new branch 'ai-commons-demo'
```

**Why a separate branch:**
All generated files (.ai/project/, .github/, CLAUDE.md) stay on this branch.
The main/master branch of your real repository is never touched.
You can repeat this demo as many times as you want without any impact.

**Important:** Never run `git push origin ai-commons-demo` during a demo run.

---

## Step 2 — Install the commons

**What to do:**

Corporate network blocks the npm registry. Use npm link instead:

```powershell
# Step 2a -- Link from your local commons clone (one-time setup)
cd "C:\...\ai-engineering-common"
npm link

# Step 2b -- In your repo
cd [your-repo]
npm link @telia-company/ai-engineering-common

# Step 2c -- Verify
npx aec version
```

**What you should see:**
```
@telia-company/ai-engineering-common v1.0.0
```

**Why npm link instead of npm install:**
The Telia corporate network proxy blocks requests to registry.npmjs.org.
npm link creates a symbolic link from your repo to the locally cloned commons package.
No network request needed.

---

## Step 3 — Initialise the commons

**What to do:**

```powershell
npx aec init
```

**What you should see:**
```
aec v1.0.0 -- initialising project
----------------------------------
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
```

These files are all empty stubs. The brownfield scan will fill them in.

---

## Step 4 — Configure JIRA_CONFIG.md

**What to do:**
Open `.ai/project/JIRA_CONFIG.md` and replace the content with:

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
Real Jira project:     [YOUR-REAL-PROJECT-KEY]
Real board type:       [Scrum or Kanban]
Real Confluence space: [YOUR-REAL-SPACE-KEY]

IMPORTANT: All Jira writes go to SPOCKT only.
           All Confluence writes go to ECAI only.
"@
```

Replace `[YOUR-REAL-PROJECT-KEY]` and `[YOUR-REAL-SPACE-KEY]` with your actual values.

**Why this matters:**
Every Jira write command reads this file first.
This is what ensures stories go to SPOCKT (demo) not your real project.

---

## Step 5 — Replace copilot-instructions.md with lean version

**What to do:**

```powershell
Set-Content -Path ".github\copilot-instructions.md" -Encoding UTF8 -Value @"
# AI Engineering Commons -- Copilot Instructions
# Project: [your-repo] brownfield discovery (demo run)

## Rules
- Execute commands immediately when triggered via prompt files
- Save all outputs to files in the project root
- Read .ai/project/JIRA_CONFIG.md before any Jira operation
- Write to demo project SPOCKT and ECAI space only -- never real systems
- Never hard delete -- soft delete only

## MCP tools
- jira-mcp: demo writes to SPOCKT, reads from real project
- confluence-mcp: demo writes to ECAI space
"@

# Verify it is lean
(Get-Content ".github\copilot-instructions.md").Count
# Should show: 17
```

**Why this step:**
The generated copilot-instructions.md contains 3500+ lines of agent skill files.
This exhausts 80% of the context window before you type a single word,
causing constant conversation compaction and confusing behaviour.
The lean 17-line version keeps the context window under 5%.

---

## Step 6 — Open in VS Code and run the scan

**What to do:**

```powershell
code .
```

Open Copilot Chat (`Ctrl+Alt+I`) → Agent mode → verify all tools are ON.

Then type:

```
/run-brownfield-scan
```

**What happens during the 7 phases:**

**Phase 1 — Language and framework detection (~1 min)**
Reads: pom.xml, build.gradle, package.json, Dockerfile
Detects: primary language, framework version, CI tools

**Phase 2 — Module mapping (~3 min)**
Reads: directory structure, git commit history per directory
Classifies each module as:
- Active: has commits in the last 90 days
- Legacy: no commits in 90+ days (verify manually -- see Step 8)
- Deprecated: explicitly marked or empty

**Phase 3 — Integration discovery (~3 min)**
Reads: HTTP client config, Kafka config, external URLs
Maps: all inbound and outbound integrations

**Phase 4 — Data model and PII discovery (~3 min)**
Reads: entity classes, database schemas, migration files, flat files
Flags: columns and files likely to contain personal data

**Phase 5 — Tech debt identification (~2 min)**
Reads: dependency versions, TODO/FIXME comments, outdated drivers
Produces: numbered list TD-001 to TD-NNN with severity

**Phase 6 — Credential scan (~2 min)**
Reads: all source files
Two possible outcomes:
- Finds nothing: continues to Phase 7
- Finds production credential: STOPS COMPLETELY
  (see troubleshooting section)
- Finds test credential: logs as Medium severity, continues

**Phase 7 — Write output files (~2 min)**
Writes: all .ai/project/ files with real content
Presents: summary of all findings

**Total time: 15-20 minutes for a large repo**

---

## Step 7 — Accept the file edits

After the scan, each .ai/project/ file will have a pending Copilot edit
shown as a diff (green = new content, red = old template text).

**What to do:**
For each file open in the editor, look for the **Keep / Undo** buttons.
Click **Keep** to accept the scan content.

Do this for:
- ARCHITECTURE_OVERVIEW.md
- MODULE_REGISTRY.md
- INTEGRATION_MAP.md
- KAFKA_TOPICS.md (if applicable)
- DATA_MODEL.md
- TECH_DEBT_REGISTRY.md

---

## Step 8 — Commit the scan results

**What to do (always in the terminal, not through Copilot):**

```powershell
git add .ai\ .github\ CLAUDE.md .cursorrules
git status    # Verify what is staged
git commit -m "chore: AI Engineering Commons brownfield scan -- [your-repo]

[paste the Phase 1-7 summary from the scan output]
Status: Phase 2 enrichment pending
NOT pushed to origin -- demo branch only"
```

**Important:** Git commands always run in the PowerShell terminal.
Never run git add, git commit, or git push through Copilot Agent mode.
Copilot may stage and commit files before you have reviewed them.

---

## Step 9 — Verify context loaded correctly

**What to do:**
In Copilot Chat type:

```
What project is this? List all modules with their status,
key integrations, and top 3 tech debt items.
```

**What you should see:**
Copilot accurately describes your codebase -- module names, integration systems,
the actual tech debt items from the scan.

**If Copilot gives generic output:**
The .ai/project/ files may not have been committed yet.
Run `git status` -- if files show as untracked, commit them first.

---

## Step 10 — Verify Legacy module classifications

**Why this step is critical:**
The scan classifies modules as Legacy based on commit count.
Low commit count does not always mean Legacy -- some modules are
deliberately stable (shared libraries, infrastructure code).

**What to do:**
For each module classified as Legacy, run in the terminal:

```powershell
git log --format="%h %ad %an -- %s" --date=short -- [module-name]/ | head -10
```

If recent commits appear (within the last 12 months) -- the module is Active, not Legacy.
Correct it manually in MODULE_REGISTRY.md.

**Rule of thumb for reliable Legacy classification (all three must be true):**
1. No commits in 12+ months
2. No dependency updates in the same period
3. Not imported by any Active module

---

## Step 11 — Investigate any PII flat files found

**What to do:**
If the scan flagged a flat file containing personal data (SSNs, emails, phone numbers):

```
Read the file [filename] found in Phase 4.
Tell me:
1. Which class loads this file
2. Which script or process generates it
3. What personal data it contains
4. Whether old copies could accumulate in backup directories
```

**Why this matters:**
Runtime-only PII files (files that exist on the server but are not committed to git)
are often MORE dangerous than committed files because:
- No git history means no audit trail
- Backup copies accumulate undetected
- Access control is rarely documented

If you find one -- create a Jira story in SPOCKT immediately.

---

## Step 12 — Create tech debt stories in demo Jira

**What to do:**
For each High severity item in TECH_DEBT_REGISTRY.md:

```
Using jira-mcp, create a story in project SPOCKT with:
Summary: [TECH DEBT] [TD-NNN]: [description]
Type: Story
Team: SPOCK Common
Labels: ai-engineering-commons-test, tech-debt, [your-repo-name]
Description: [paste the relevant TECH_DEBT_REGISTRY.md entry]
```

**What you should see:**
Each story created with a SPOCKT key.
Open Jira and verify they appear under team SPOCK Common.

---

## Step 13 — Share your findings

**What to do:**
Post in the AI Champions CoE Teams channel with:

1. How many modules were found
2. How many were Active / Legacy / Deprecated
3. The top 3 tech debt items
4. The most surprising finding
5. Whether any credentials were found (yes/no only -- do not share the actual credential)
6. How long the scan took

This is what completes M3. Your findings help the whole group learn.

---

## Step 14 — Mark your M3 milestone

1. Open the Champions Register:
   https://itwiki.atlassian.teliacompany.net/spaces/ECA/pages/1279990780
2. Add `✓ (May-26)` in your M3 Brownfield column
3. Save

**You have completed M3. ✓**

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| npm install ETIMEDOUT | Corporate network blocks npm | Use npm link (Step 2) |
| Phase 6 stops -- credential found | Production secret in source code | Contact Security Lead. Do not continue until credential is rotated. |
| Module wrongly classified Legacy | Low commit count heuristic | Run git log manually (Step 10) and correct MODULE_REGISTRY.md |
| Copilot cannot find files | Files not committed | git add + git commit before next command |
| Context window at 80%+ | copilot-instructions.md too large | Replace with lean version (Step 5) |
| Keep/Undo buttons visible | Pending Copilot edits | Click Keep on each file before committing |
| Git commit ran through Copilot | Clicked Allow on Copilot git proposal | Always click Skip on Copilot git proposals. Run git in terminal. |

---

## What to do if Phase 6 finds a production credential

If the scan stops in Phase 6 with a production credential finding:

1. Note the file path (not the credential value)
2. Close the scan output -- do not share it in chat or screenshots
3. Contact your Security Lead immediately
4. The credential must be rotated before you continue
5. The file must be cleaned from git history (not just deleted)
6. Only continue the scan after the Security Lead confirms the rotation is complete

This is not a failure -- finding it is exactly what the scan is designed to do.

---

## Next step

You are ready for **M4 — DEEP Analysis**.

In M4 you will run a deep analysis on the highest-risk module in your repository.
The AI will map every entry point, every hidden dependency, every implicit business rule,
and create Jira stories for the findings automatically.

**M4 tutorial:** M4-deep-analysis-tutorial.md
