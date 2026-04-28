# NEW_FEATURE_JOURNEY.md
# Playbooks -- End-to-end journey: delivering a new feature
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## Overview

This is the most common journey. Use it whenever a new capability
needs to be built in an existing service. It covers the full cycle
from a product brief or Jira story through to merged and deployed code.

**Tools needed:** Claude Code (with Jira + Confluence MCP), VS Code + Copilot
**Time:** 2-4 hours for a 3-5 point story. 1-2 days for an 8-point story.

---

## Entry points

You start this journey from one of:

```
A) You have meeting notes or a product brief
   --> Start at Step 1 (create stories)

B) You have an existing Jira story in Ready status
   --> Start at Step 3 (explain module)

C) You have an approved spec already
   --> Start at Step 5 (generate code)
```

---

## Step 1 -- Create stories from a brief (if needed)

If you are starting from meeting notes or a product brief:

```
# In Claude Code:
DRAFT_STORIES

[paste meeting notes or feature brief here]
```

Claude Code creates Jira stories with Given/When/Then ACs, sequences
them by dependency, and presents gate C02 for BA/PO review.

**Gate C02:** BA or Product Owner reviews the ACs in Jira and approves.
Reply `APPROVED C02` in the gate output or approve via Jira comment.

---

## Step 2 -- Estimate the story (if not yet estimated)

```
# In Claude Code:
ESTIMATE_STORIES [STORY-KEY]
```

Claude Code suggests story points with reasoning based on:
- AC count and complexity
- Module status (Legacy modules get risk multipliers)
- Historical comparable stories

The suggestion appears as a Jira comment. Your team confirms or adjusts
during refinement -- the agent never sets the points directly.

---

## Step 3 -- Understand the code before touching it

Before writing a single line of code, orient yourself in the affected module.
This is the step most engineers skip and most regret.

```
# In Claude Code:
EXPLAIN_MODULE [module-name]
```

For a Standard depth analysis (default), Claude Code reads all source
files in the module and produces:
- Entry points and call graph
- Data flow (what goes in, what comes out)
- Test coverage estimate
- Risk level (Low / Medium / High / Critical)
- Modification guidance specific to your story

If the module is flagged as High or Critical risk -- stop and discuss
with your Tech Lead before proceeding. Do not skip this.

---

## Step 4 -- Check for cross-cutting impacts

If the story touches integrations, data models, or Kafka topics:

```
# In Claude Code:
# Check what else is affected by this change
What modules and integrations does [story key] affect?
Run a dependency analysis for PROJ-[NNN].
```

This internally invokes the Dependency Mapper Agent. If it finds:
- **Spec conflicts:** existing specs cover the same area -- review before proceeding
- **In-progress work conflicts:** coordinate merge timing with the other engineer
- **Cross-team dependencies:** the Cross-team Coordinator raises a task for the other team

---

## Step 5 -- Write the technical spec

```
# In Claude Code:
WRITE_SPEC [STORY-KEY]
```

Claude Code:
1. Reads the story, ACs, and project context from CLAUDE.md
2. Runs pre-spec compliance checks (GDPR, DPA, auth changes)
3. Checks for conflicts with existing Confluence specs
4. Generates the spec in Confluence using TECHNICAL_SPEC_TEMPLATE.md
5. Presents gate C01 for Tech Lead review

**Gate C01:** Tech Lead reviews the spec in Confluence.
- Check: API design follows API_DESIGN_STANDARDS.md
- Check: Data model changes include retention policy for PII fields
- Check: Security considerations are complete
- Approve by replying `APPROVED C01` in the gate output or via Jira comment

Typical Tech Lead review time: 15-30 minutes.

---

## Step 6 -- Generate database migration (if needed)

If the spec includes data model changes:

```
# In Claude Code:
GENERATE_MIGRATION [STORY-KEY]
```

Claude Code generates:
- Forward Flyway migration script
- Rollback script
- Execution plan in Confluence
- Dry-run result against test database

**Gate C04:** Tech Lead + DBA review the migration plan and approve.

---

## Step 7 -- Generate the code

```
# In Claude Code:
GENERATE_CODE [STORY-KEY]
```

Claude Code:
1. Reads the approved spec from Confluence
2. Reads existing code in the affected module (understands patterns in use)
3. Generates code in dependency order (domain -> application -> API)
4. Commits in logical steps to `feature/[STORY-KEY]-[description]`
5. Generates unit tests alongside the code
6. Opens a PR with a full description

While Claude Code generates, you can watch the commits appear in VS Code
source control panel. Each commit is focused and reviewable.

---

## Step 8 -- Refine the generated code (optional)

The generated code is production-ready but may need project-specific
tuning. Use Copilot or Cursor for this:

```
# In VS Code with Copilot:
# Select generated code and ask:
"Adjust this to match the pattern used in OrderController.java"
"Add the error handling we use in other service methods"

# In Cursor Composer:
"Align the generated code with the existing patterns in src/main/java/...
 Specifically, [describe what needs adjusting]"
```

---

## Step 9 -- Review the PR

```
# In Claude Code:
REVIEW_PR [PR-NUMBER]
```

Claude Code runs simultaneously:
- Peer review (CODING_STANDARDS, PERFORMANCE_GUIDELINES checklist)
- Security Review (S01-S20 security checklist)
- Secrets Scan (credential pattern check)
- Accessibility review (if UI code is present)

All findings appear as a consolidated PR comment with BLOCK/WARN/INFO
severity. BLOCK findings must be fixed before gate D01.

Fix any BLOCK findings using Copilot inline or Cursor Composer, push
to the same branch, and re-run `REVIEW_PR [PR-NUMBER]`.

**Gate D01:** Tech Lead reviews the PR in GitHub and approves.
The Tech Lead's focus: does the implementation match the approved spec?

---

## Step 10 -- Validate the story ACs

```
# In Claude Code:
VALIDATE_STORY [STORY-KEY]
```

Claude Code executes each AC against the test environment:
- Calls the API and asserts on the response
- Checks database state changes via API
- Runs Kafka event assertions for event-driven ACs
- Runs accessibility checks for UI code

Results appear as a Jira comment and PR comment.

If any AC fails: the story returns to In Progress. Claude Code tells
you exactly which assertion failed and what the actual vs expected
values were.

Fix the issue, push, and re-run `VALIDATE_STORY`.

When all ACs pass: story transitions to Done (or In Review for final
Tech Lead confirmation).

---

## Step 11 -- Update documentation

```
# In Claude Code:
REFRESH_ARCH_DOCS
```

If the feature added new integrations, modules, or APIs, the Architecture
Doc Agent updates the relevant Confluence pages automatically.

For significant features, the Documentation Agent also updates the
feature documentation and API docs.

---

## Step 12 -- Celebrate

The story is Done. The code is merged. The spec is marked Implemented.
The architecture docs are current.

Commit and push the regenerated tool configs if any project-layer
files were updated during the feature:

```powershell
npx aec update
git add CLAUDE.md .github/copilot-instructions.md .cursorrules
git commit -m "chore: update tool configs after [feature-name] feature"
git push
```

---

## Quick reference -- the commands in order

```
Step 1:  DRAFT_STORIES [brief]           (if no story exists)
Step 2:  ESTIMATE_STORIES [key]          (if not estimated)
Step 3:  EXPLAIN_MODULE [module]         (always do this)
Step 4:  (dependency analysis)           (if cross-cutting)
Step 5:  WRITE_SPEC [key]               (gate C01)
Step 6:  GENERATE_MIGRATION [key]       (if DB changes, gate C04)
Step 7:  GENERATE_CODE [key]
Step 8:  (Copilot/Cursor refinement)    (optional)
Step 9:  REVIEW_PR [pr-number]          (gate D01)
Step 10: VALIDATE_STORY [key]
Step 11: REFRESH_ARCH_DOCS
```

---

## HITL gates in this journey

| Gate | Step | Approver | What they check |
|---|---|---|---|
| C02 | 1 | BA / PO | ACs are correct and complete |
| C01 | 5 | Tech Lead | Spec is accurate and safe |
| C04 | 6 | Tech Lead + DBA | Migration is safe to run |
| D01 | 9 | Tech Lead | Code matches spec, no BLOCK findings |

All other decisions (what to build, priority, when to release) remain
with the product and delivery team.

---

## When things go wrong

```
WRITE_SPEC fails:
  Story not in Ready status / no ACs. Add ACs first, then retry.

GENERATE_CODE produces wrong patterns:
  The MODULE_REGISTRY.md is not filled in or CLAUDE.md is stale.
  Run npx aec update and retry.

VALIDATE_STORY fails with environment error:
  FEATURE_ENV_CONFIG.md is empty. Fill it in and start the test environment.

REVIEW_PR shows too many BLOCK findings:
  The spec was not followed or CODING_STANDARDS.md patterns were ignored.
  Open the findings in Copilot Chat and fix each one.

AC Fails unexpectedly:
  The test environment is in a bad state. Reset it and retry.
  docker-compose -f docker-compose.test.yml down -v && up -d
```

---

## Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
