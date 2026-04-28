# CHAMPION_GUIDE.md
# CoE -- AI Engineering Champion Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. What is a CoE champion?

A CoE champion is the point of contact for AI-assisted engineering
within their team. They are not a separate role -- they are a senior
engineer or tech lead who takes on additional responsibility for
helping their team get value from the commons.

Champions are the bridge between the CoE Core team and the engineering
teams using the commons. They surface team-specific needs, feed back
on what is working and what is not, and help colleagues who are new
to AI-assisted engineering.

---

## 2. Champion responsibilities

### 2.1 Onboarding new team members

When a new engineer joins the team:
- Walk them through `npx aec init` and the project-layer files
- Recommend using `START_ONBOARDING` to generate their onboarding guide
- Show them the three tool config files (CLAUDE.md, copilot-instructions.md, .cursorrules)
- Explain which commands they will use most in the first sprint

### 2.2 Keeping the project-layer files current

The project-layer files in `.ai/project/` are only as useful as they
are accurate. The champion owns the accuracy of these files for their
team:

```
Monthly check:
  [ ] MODULE_REGISTRY.md reflects all current modules (no missing, no ghost modules)
  [ ] INTEGRATION_MAP.md lists all active integrations
  [ ] TECH_DEBT_REGISTRY.md has current High severity items
  [ ] SRE_SERVICE_CONFIG.md SLO thresholds match current agreements

After each sprint:
  [ ] Run npx aec update after any significant architecture change
  [ ] Commit updated tool configs so all engineers get the same context
```

### 2.3 Running npx aec update after commons releases

When CoE Core releases a new version of the commons:

```powershell
# In your project
npm update @telia-company/ai-engineering-common
npx aec update
git add CLAUDE.md .github/copilot-instructions.md .cursorrules
git commit -m "chore: update ai-engineering-common to v[N.N.N]"
git push
```

This ensures the whole team benefits from commons improvements
without each engineer having to update manually.

### 2.4 Feeding back to CoE Core

Champions are the primary source of feedback on the commons. Provide
feedback when:
- An agent produces consistently wrong or unhelpful output
- A guide does not match your team's tech stack
- A command is missing that your team would use frequently
- A HITL gate is blocking work without clear value

Feedback channels:
- Raise a GitHub issue on ai-engineering-common
- Bring to the monthly CoE champion sync
- Open a PR directly if the fix is clear (see CONTRIBUTION_GUIDE.md)

### 2.5 Monthly champion sync

CoE Core runs a monthly 45-minute sync with all champions. Agenda:
- New releases and what changed
- Champion feedback round (5 min per champion)
- Blockers and open issues
- Roadmap preview

Champions are expected to attend or send a delegate. Minutes are
posted to the CoE Confluence space.

---

## 3. Champion toolkit

### 3.1 Daily commands to know

These are the commands your team will use most. Know them well enough
to demo them:

```
WRITE_SPEC PROJ-NNN          -- generate a spec from an approved story
GENERATE_CODE PROJ-NNN       -- generate code from an approved spec
REVIEW_PR 142                -- peer review a pull request
TRIAGE_BUG PROJ-500          -- enrich a bug ticket
VALIDATE_STORY PROJ-NNN      -- run AC execution
SRE_DIAGNOSE order-service   -- diagnose a production signal
```

### 3.2 Diagnosing tool config issues

When a teammate reports that Claude Code or Copilot is not giving
project-aware suggestions:

```powershell
# Step 1: Check if CLAUDE.md exists and has content
Get-Content CLAUDE.md | Select-Object -First 5
# Should show AGENT.md content, not empty

# Step 2: Check project-layer files are filled in
npx aec check
# Should show OK for all files, not STUB or MISSING

# Step 3: Regenerate tool configs
npx aec update

# Step 4: In Claude Code -- verify context is loaded
# Open a new Claude Code session and ask:
# "What project is this and what modules does it have?"
# The answer should reflect MODULE_REGISTRY.md content
```

### 3.3 Helping engineers use commands correctly

When a command does not produce the expected result, the most common
causes are:

```
WRITE_SPEC PROJ-NNN fails:
  -- Story is not in Ready status (ACs must be present)
  -- Gate C01 has not been set up -- check HITL_PROTOCOL.md

GENERATE_CODE fails:
  -- Spec has not been approved at gate C01
  -- .ai/project/ARCHITECTURE_OVERVIEW.md is not filled in

VALIDATE_STORY fails with environment error:
  -- FEATURE_ENV_CONFIG.md is empty or has placeholder content
  -- Test environment is not running
```

### 3.4 Tracking AI adoption in your team

Use these Jira queries to measure adoption:

```
JQL -- stories where AI generated the code:
  project = [PROJECT-KEY] AND labels = "ai-generated"
  AND issuetype = Story AND status = Done

JQL -- PRs reviewed by the Peer Review Agent:
  project = [PROJECT-KEY] AND labels = "ai-reviewed"
  AND issuetype = Story AND status = Done

JQL -- gate approvals this sprint:
  project = [PROJECT-KEY] AND labels = "hitl-approved"
  AND updated >= -14d
```

Report these numbers monthly to the CoE at the champion sync.

---

## 4. Becoming a champion

There is no formal certification. Champions are nominated by their
Tech Lead or DM and confirmed by the CoE Lead.

Prerequisites:
- Familiar with the commons and at least 3 sprint cycles using it
- Comfortable running `npx aec` commands and explaining them to others
- Has contributed at least one PR or substantial feedback to the commons
- Willing to attend the monthly champion sync

To nominate yourself or a colleague: email the CoE Lead or raise it
at the monthly sync.

---

## 5. Champion network

| Market / Team | Champion | Contact |
|---|---|---|
| [Add your team here] | [Name] | [email or Slack] |

Champions: add your name to this table via a PR to the commons.

---

## 6. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
