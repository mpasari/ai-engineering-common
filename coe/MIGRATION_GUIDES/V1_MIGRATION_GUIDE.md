# V1_MIGRATION_GUIDE.md
# CoE -- Migration guide for teams adopting commons v1.0.0
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Purpose

This guide helps teams that are new to the commons, or teams that have
been using an earlier internal version, adopt v1.0.0 correctly. It
covers installation, project-layer file setup, and the first week of
use.

---

## 2. Prerequisites

```
[ ] Node.js 18 or higher installed
[ ] npm access to GitHub Packages (GITHUB_TOKEN with read:packages)
[ ] Git repository exists for your project
[ ] Tech Lead has read AGENT.md and HITL_PROTOCOL.md
```

The Tech Lead must understand the HITL gate system before the team
starts using the commons. Gates that are bypassed or ignored create
compliance gaps that are difficult to audit retroactively.

---

## 3. Installation

```powershell
# Step 1: Configure npm to use GitHub Packages for the telia-company scope
# Add to your project's .npmrc file:
$npmrc = "@telia-company:registry=https://npm.pkg.github.com`n//npm.pkg.github.com/:_authToken=`${GITHUB_TOKEN}"
Set-Content -Path ".npmrc" -Value $npmrc

# Step 2: Set your GitHub token (get from GitHub Settings > Developer settings > PAT)
$env:GITHUB_TOKEN = "ghp_your_token_here"

# Step 3: Install the commons
npm install @telia-company/ai-engineering-common

# Step 4: Bootstrap the project
npx aec init

# Step 5: Verify the project-layer files were created
dir .ai\project\
```

---

## 4. Project-layer file setup (Week 1 priority)

After `npx aec init`, fill in these files in priority order:

### Priority 1 -- Fill in before using any agents (Day 1)

```
.ai/project/ARCHITECTURE_OVERVIEW.md
  -- What your service does (2-3 sentences)
  -- Technology stack (language, framework, database)
  -- Key constraints for agents

.ai/project/MODULE_REGISTRY.md
  -- List every module in your codebase
  -- Set correct status (Active / Legacy / Deprecated)
  -- One sentence description per module
```

After filling these in: run `npx aec update`. The generated CLAUDE.md
will now give agents project-specific context.

### Priority 2 -- Fill in before sprint 2

```
.ai/project/INTEGRATION_MAP.md
  -- Every external system your service calls or is called by
  -- DPA status for each integration

.ai/project/DATA_MODEL.md
  -- Every database table your service owns
  -- Flag any PII fields with retention policy

.ai/project/TECH_DEBT_REGISTRY.md
  -- High severity debt items only (to start)
  -- Link to known KEDB entries if applicable
```

### Priority 3 -- Fill in before going to production

```
.ai/project/FEATURE_ENV_CONFIG.md
  -- How to start the test environment
  -- Health check endpoint
  -- Test user credentials (never real subscriber data)

.ai/project/SRE_SERVICE_CONFIG.md
  -- Service tier (critical / standard / best-effort)
  -- Any SLO overrides from the defaults
  -- On-call Slack channel
```

---

## 5. First week commands

These are the commands to start with in week 1:

```
Day 1-2: Orientation
  npx aec check            -- validate project files are filled in
  npx aec list agents      -- see all available agents
  EXPLAIN_MODULE [module]  -- understand a module before touching it

Day 3-5: First sprint
  DRAFT_STORIES [brief]    -- create stories from a feature brief
  WRITE_SPEC PROJ-NNN      -- generate a spec for an approved story
  REVIEW_PR [PR-number]    -- run automated peer review
```

Do not try to use all commands in week 1. Start with the three most
impactful for your current sprint and build from there.

---

## 6. Common first-week issues

| Issue | Cause | Fix |
|---|---|---|
| CLAUDE.md is empty or very short | Project-layer files are still stubs | Fill in ARCHITECTURE_OVERVIEW.md and MODULE_REGISTRY.md, then npx aec update |
| Agent gives generic advice not specific to our project | CLAUDE.md not loaded in Claude Code | Verify CLAUDE.md is in the repo root, restart Claude Code session |
| WRITE_SPEC fails | Story not in Ready status or no ACs | Add Given/When/Then ACs to the Jira story first |
| REVIEW_PR gives no security findings | Test PR had no security-sensitive code | Try on a PR that touches auth, database, or external calls |
| npx aec check shows all STUB | Project-layer files not filled in yet | Expected -- fill in the files, run aec update |

---

## 7. Getting help

```
Your CoE champion:  [Ask your Tech Lead who the champion is]
Monthly sync:       [Ask your champion for the invite link]
GitHub issues:      https://github.com/telia-company/ai-engineering-common/issues
Contribution guide: coe/CONTRIBUTION_GUIDE.md
```

---

## 8. Version and review

| File owner | CoE Core |
| Review cadence | Per major version |
| Approvers | CoE Lead |
