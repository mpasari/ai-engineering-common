# AI Engineering Commons — Sprint Integration Recipe
# Version: 1.0
# Owner: CoE Core — Mrinal Pasari
# Status: Active
# Last updated: 2026-05-28

---

## Purpose

This recipe describes how to integrate the AI Engineering Commons into a team's
normal agile delivery process. It defines who does what, when they do it, and
what the expected output is at each step.

Following this recipe, a team of 8 engineers running 2-week sprints can expect:
- 93% reduction in specification and documentation cost per feature
- 20-30% reduction in PR review cycle time by sprint 3
- Consistent Gate C01 governance enforcement across all stories
- Full brownfield context available to every developer from day one

---

## Prerequisites

Before the first AI-assisted sprint begins, confirm:

```
[ ] Tech Lead has completed M3 (brownfield scan) and M4 (DEEP analysis)
[ ] .ai/project/ files are committed to main branch
[ ] JIRA_CONFIG.md is configured for the real project (not demo mode)
[ ] Team norms document agreed (see One-Time Tasks section)
[ ] Product Owner has completed M1 (VS Code + MCP setup)
[ ] CoE Champion is available to support for the first 2 sprints
[ ] Definition of Done updated to include Gate C01 requirement
```

---

## One-Time Setup Tasks

Done once before the first AI-assisted sprint. Never repeated unless the team
changes significantly or the codebase undergoes major structural change.

---

### OT-1 — Configure JIRA_CONFIG.md First

**Owner:** Tech Lead
**Time:** 15 minutes
**When:** Before running the brownfield scan -- this must be done first

The brownfield scan reads JIRA_CONFIG.md when writing every output file.
If JIRA_CONFIG.md is not configured before the scan runs, every registry
file will have the wrong owner, project key, and team name. Correcting
this after the scan is manual rework. Configure it first.

**This is a one-time task. Do it before running the scan.**

**Find your real values first:**

```
Project key:
  Open Jira → your team board → project key is in the URL
  Example: jira.atlassian.teliacompany.net/jira/software/projects/NOCT → key is NOCT

Team name and valid values:
  In Copilot Chat Agent mode:
  "@jira-mcp search fields for project [YOUR-KEY]"
  Find customfield_12725 and note all valid option values for Development Team

Confluence space key:
  Open your team Confluence space → space key is in the URL
  Example: itwiki.atlassian.teliacompany.net/spaces/AIC → key is AIC

Confluence parent page ID:
  Open the Confluence page where specs should be written under
  Click ··· → Page Information → copy the numeric Page ID from the URL
```

After `npx aec init`, fill in two configuration files:

**1. `.ai/project/JIRA_CONFIG.md`** -- Jira and Confluence connection settings

**2. `.ai/project/PRODUCT_GOVERNANCE.md`** -- product governance decisions

PRODUCT_GOVERNANCE.md is read by all compliance and governance commands
(/generate-dpia-brief, /generate-security-assessment, /generate-iso27001).
Fill it in now so those commands produce complete output instead of
placeholder [CONFIRM] markers. Key fields to fill in now:

```
Product name, Product owner, Tech Lead, Security Lead, DPO
Applicable regulations (GDPR lawful basis, EU AI Act risk category)
Data retention decisions per entity
Third-party processors and DPA status
SLA targets (availability, RTO, RPO)
LLM provider data handling confirmation
```

Fields you cannot answer yet (certification dates, pentest dates) -- leave
as placeholders and update when the information is available.

After `npx aec init`, open `.ai/project/JIRA_CONFIG.md` and fill in
your real values. The file already has the correct structure -- just
update the placeholder values:

```
Project key:        [YOUR-REAL-PROJECT-KEY]     e.g. NOCT
Project name:       [YOUR-REAL-PROJECT-NAME]
Board type:         [Scrum or Kanban]

Development Team field:
  Value:            [YOUR-REAL-TEAM-NAME]        e.g. AI
  All valid values:
    - [paste the values from jira-mcp field search]

Confluence space:      [YOUR-SPACE-KEY]          e.g. AIC
Confluence parent:     [PAGE-ID]                 e.g. 1313364211
```

**Important:** Use `Value:` not `Value for demos:` -- the commons
reads this field when generating the JIRA summary in copilot-instructions.md.

**Do not leave any `[placeholder]` values unfilled.**

**Verify before continuing:**

```powershell
Get-Content ".ai\project\JIRA_CONFIG.md" | Select-Object -First 15
# Must show your real project key and team name
# Must NOT show SPOCK Common or placeholder text
```

Save the file. Do not run the scan until this check passes.

---

### OT-2 — Brownfield Scan and DEEP Analysis

**Owner:** Tech Lead
**Supported by:** CoE Champion
**Time:** Half day
**When:** After OT-1 -- JIRA_CONFIG.md must be configured first

**What to do:**

```powershell
# Clone the team repo and create the AI branch
git clone https://github.com/telia-company/[team-repo].git
cd [team-repo]
git checkout -b ai-commons-setup

# Install the commons
cd "C:\...\ai-engineering-common"
npm link
cd [team-repo]
npm link @telia-company/ai-engineering-common

# Initialise
npx aec init

# Configure JIRA_CONFIG.md (OT-1) before continuing
# Then verify it is configured correctly:
Get-Content ".ai\project\JIRA_CONFIG.md" | Select-Object -First 10
# Should show your real project key and team name -- not SPOCK Common
```

Open VS Code. In Copilot Chat Agent mode:
```
/run-brownfield-scan
```

**Important: The scan writes your real team name into every output file.**
**Verify JIRA_CONFIG.md is correct before running the scan.**

After the scan completes, review every `.ai/project/` file in this order:

**MODULE_REGISTRY.md -- highest priority:**
For every module in the registry:
```
[ ] Classification is correct (Active / Legacy / Deprecated)
[ ] Description accurately reflects what the module does
[ ] Owner team shows YOUR-REAL-TEAM-NAME (not SPOCK Common)
[ ] Risk level is justified
```

For each module the scan classified as Legacy -- verify with git log:
```powershell
git log --format="%h %ad %an -- %s" --date=short -- [module]/ | Select-Object -First 10
```
If there are commits in the last 12 months -- reclassify as Active.

**INTEGRATION_MAP.md:**
```
[ ] All external systems are named (not just "external-api")
[ ] Protocol and auth method are correct for each integration
[ ] Both inbound AND outbound integrations are listed
[ ] DPA status is noted (Unknown is acceptable initially)
```

**DATA_MODEL.md:**
```
[ ] All database tables are listed
[ ] PII fields are correctly flagged
[ ] Relationships between tables are noted
[ ] Retention policies are documented or flagged as missing
```

**TECH_DEBT_REGISTRY.md:**
```
[ ] Severity ratings are reasonable
[ ] TD items reference real files and classes (not hallucinated paths)
[ ] Owner shows YOUR-REAL-TEAM-NAME (not SPOCK Common)
[ ] No duplicate items
```

**KAFKA_TOPICS.md (if applicable):**
```
[ ] All topics are listed
[ ] Consumer and producer modules are correctly identified
```

**ARCHITECTURE_OVERVIEW.md:**
```
[ ] The system description is accurate
[ ] The module map reflects reality
[ ] Any incorrect statements are corrected
```

Only after ALL files are verified should you continue to DEEP analysis.

---

**DEEP Analysis -- run for ALL Active modules:**

Run DEEP analysis in priority order:
1. Highest commit count first
2. Any module consuming multiple Kafka topics
3. Any module handling PII
4. All remaining Active modules

```
/explain-module [module-name] DEEP
```

For each DEEP analysis:
```
[ ] Output saved to .ai/project/deep/[module-name]-DEEP.md
[ ] Tech Lead has read and verified the findings
[ ] Any Critical or High findings are in TECH_DEBT_REGISTRY.md
[ ] Refactoring prerequisites are documented
```

Do NOT run `npx aec update` between DEEP analyses.
Copilot reads `.ai/project/` files directly from disk.
Run `npx aec update` once after ALL DEEP analyses are complete.

When all Active modules are done:

```powershell
# Stage all commons-generated files
git add .ai\project\                          # brownfield scan + DEEP analysis output
git add .github\prompts\                      # all slash commands
git add .github\copilot-instructions.md       # lean identity + JIRA summary
git add .github\prompts\.aec-checksums.json   # prompt sync tracking

# Verify what is staged -- check nothing unexpected is included
git status

git commit -m "chore: AI Engineering Commons setup -- OT-1 and OT-2 complete

JIRA_CONFIG.md: configured for [YOUR-PROJECT-KEY] / [YOUR-TEAM-NAME] / [YOUR-SPACE]
Brownfield scan: [N] modules found ([N] Active, [N] Legacy, [N] Deprecated)
DEEP analysis: [N] Active modules analysed
Tech debt items: [N] ([N] Critical, [N] High, [N] Medium, [N] Low)
All .ai/project/ files reviewed and confirmed accurate by Tech Lead"

git push origin ai-commons-setup
# Raise PR to main -- Tech Lead reviews and merges
```

Then run once to refresh copilot-instructions.md with the fully populated project files:

```powershell
npx aec update
```

Then create all tech debt stories in one batch:

```
/create-tech-debt-stories
```

This reads all DEEP files and TECH_DEBT_REGISTRY.md, deduplicates findings,
and presents Gate C01 for Tech Lead review before creating any Jira stories.

**Output (only after Tech Lead verification):**
- `.ai/project/MODULE_REGISTRY.md` -- all modules classified and verified
- `.ai/project/TECH_DEBT_REGISTRY.md` -- all debt items with Jira keys
- `.ai/project/INTEGRATION_MAP.md` -- all integrations verified
- `.ai/project/DATA_MODEL.md` -- PII fields identified and verified
- `.ai/project/deep/[module]-DEEP.md` -- one file per Active module
- Everything merged to main via PR

### OT-3 — Agree Team AI Engineering Norms

**Owner:** Tech Lead (facilitates)
**Participants:** Full team
**Time:** 30 minutes
**When:** As part of team agreements, before sprint 1

Agree and document the following as a one-page team norm:

**Expected on every story (not optional):**
- PO runs `/write-spec` during refinement prep
- Tech Lead reviews Gate C01 async before planning
- Developer runs `/review-pr` before requesting human review

**Optional per story (team decides based on risk):**
- `/generate-code` -- used on all Active module stories by default
  Skip for: Legacy modules, database migrations, authentication changes
- `/generate-tests` -- used whenever /generate-code is used

**Gate C01 SLA:**
- PO submits spec to Confluence at least 24 hours before planning
- Tech Lead reviews and approves or requests changes before planning starts
- Stories without an approved Gate C01 do not enter the sprint

**Who can approve Gate C01:**
- Tech Lead (primary)
- Senior Architect (secondary when Tech Lead is unavailable)

Store this norm in the team's Confluence space under Team Agreements.

---

### OT-4 — Update Definition of Done

**Owner:** Tech Lead
**Time:** 5 minutes
**When:** Before sprint 1

Add to the team's existing Definition of Done:

```
AI Engineering Commons requirements:
[ ] For stories in Active modules: /write-spec was run and Gate C01 was
    approved by Tech Lead before coding started
[ ] /review-pr was run and all BLOCK findings were resolved
[ ] .ai/project/MODULE_REGISTRY.md is still accurate for touched modules
```

---

## Sprint Ceremonies

---

### Refinement Preparation (2 days before refinement)

**Owner:** Product Owner
**Supported by:** CoE Champion (first 2 sprints, then PO runs independently)
**Trigger:** Any story marked Ready for refinement consideration

**What the PO does:**

For each Ready story, open VS Code with the team repo, then in Copilot Chat:

```
@jira-mcp get issue [YOUR-PROJECT-KEY-NNN]

Using this story and the project context in .ai/project/,
run /write-spec and write the spec to Confluence space [YOUR-SPACE]
under the parent page [PAGE-ID].

Do not generate code. This is spec only.
```

**Review the spec for business accuracy:**
```
[ ] The spec correctly describes what the story is asking for
[ ] The acceptance criteria match the original Jira story
[ ] Any AI findings (RISK, DECISION, GDPR, ENCODING) are noted
[ ] The Confluence page is in the correct space (not ECAI demo space)
```

If the AI misunderstood the business intent -- add a comment to the Confluence
spec page and flag it for the Tech Lead review.

**Notify the Tech Lead:**
Send a Teams message or Jira comment with the Confluence spec URL and the
deadline for Gate C01 review (24 hours before refinement).

**Output:**
- Technical spec in Confluence for each Ready story
- Gate C01 presented and awaiting Tech Lead approval
- Any business intent corrections noted in comments

---

### Gate C01 Review (Async -- 24 hours before refinement)

**Owner:** Tech Lead
**Trigger:** PO sends spec URL for review
**Time:** 15-30 minutes per story

---

**What is Gate C01 and where does it live?**

Gate C01 is a section at the **bottom of the Confluence spec page** that
`/write-spec` generates automatically. It is not a separate Jira ticket,
a separate Confluence page, or an external system. It lives on the same
Confluence page as the technical spec for that story.

When the spec is first generated, the Gate C01 section looks like this:

```
=== GATE C01 ===
Status: PENDING APPROVAL

Tech Lead: [name from JIRA_CONFIG.md]
Story: [Jira story link]
Spec page: [this page URL]

Decisions required before implementation:
  1. [technical decision or risk identified by AI]
  2. [technical decision or risk identified by AI]

To approve: type APPROVED C01 [story key] in Copilot Chat
To request changes: type CHANGES C01 [story key] [feedback]
=== END GATE C01 ===
```

When the Tech Lead approves, the section is updated to:

```
=== GATE C01 ===
Status: APPROVED
Approved by: [Tech Lead name]
Approved on: [date]
=== END GATE C01 ===
```

**How to find all pending Gate C01 approvals:**
Search Confluence in your space for pages containing "Status: PENDING APPROVAL".
This shows every story spec awaiting Tech Lead review.

**Audit trail:**
The Confluence page history records who approved and when.
This is the governance record for every story that goes through the AI workflow.

---

**What the Tech Lead does:**

Open the Confluence spec page sent by the PO. Review:

```
[ ] Affected modules are correctly identified in MODULE_REGISTRY.md
[ ] Tech debt conflicts are accurately noted (cross-reference TECH_DEBT_REGISTRY.md)
[ ] Architectural decisions are sound
[ ] GDPR implications are correctly flagged
[ ] The implementation approach respects DEEP analysis refactoring prerequisites
[ ] The spec was not written to the wrong Confluence space
```

**If the spec is correct -- approve in Copilot Chat:**

```
APPROVED C01 [YOUR-PROJECT-KEY-NNN]
```

The Gate C01 section on the Confluence spec page updates to APPROVED.
The story is cleared to enter the sprint.

**If the spec needs changes -- request revision in Copilot Chat:**

```
CHANGES C01 [YOUR-PROJECT-KEY-NNN]
[specific technical feedback -- be precise about which class, module, or decision]
```

Example:
```
CHANGES C01 TDMT-103
The phone normalisation fix should go in BrmEventMapper not Ace.sendCallback().
The spec has the location wrong. Please correct and re-present Gate C01.
```

The AI revises the spec, the Gate C01 section updates to CHANGES REQUESTED,
and the PO is notified to review the revision before the next planning cycle.

**Stories without an approved Gate C01 do not enter the sprint.**

---

### Sprint Planning

**Owner:** Tech Lead + Product Owner
**Trigger:** Regular sprint planning ceremony

**What changes from current process:**

Instead of discussing stories from scratch, the team reviews the already-approved
spec for each story. Planning becomes:
- Confirming the implementation approach in the approved spec
- Assigning the story to a developer
- Estimating based on the spec (which now includes affected classes and complexity)

**Questions to ask for each story:**
- Does the approved spec match what we want to build this sprint?
- Are there any dependencies not captured in the spec?
- Is the assigned developer comfortable with the affected modules?

Stories enter the sprint with an approved spec already in Confluence.
Developers do not start from a blank page.

---

### During the Sprint — Story Implementation

**Owner:** Developer
**Trigger:** Developer moves story to In Progress

**Step 1 — Read the approved spec**

Before writing any code, open the Confluence spec page linked in the Jira story.
Read the full spec. Understand what modules are affected and what decisions were made.

**Step 2 — Create a feature branch**

```powershell
git checkout main
git pull
git checkout -b feature/[YOUR-PROJECT-KEY-NNN]-[short-description]
```

**Step 3 — Run /generate-code**

In Copilot Chat Agent mode:
```
/generate-code [YOUR-PROJECT-KEY-NNN]
```

Copilot reads the approved spec and generates code in the correct modules.

**What to check when it finishes:**
```powershell
git diff        # Review every changed file
git status      # Check nothing unexpected was touched
```

```
[ ] Only the expected files were modified
[ ] The code follows existing patterns in the module
[ ] No credentials or personal data hardcoded
[ ] Logic matches what the spec described
```

**Step 4 — Run /generate-tests**

```
/generate-tests [YOUR-PROJECT-KEY-NNN]
```

**Step 5 — Run the test suite**

```powershell
./gradlew test        # Java / Gradle
npm test              # Node
```

Fix any test failures before moving on. If the AI-generated tests fail -- the
spec may have missed a constraint. Update the spec and re-run.

**Step 6 — Run /review-pr**

Before opening a PR, run the AI review:
```
/review-pr
```

Read the report. Address all BLOCK findings before opening the PR.
For WARN findings -- either fix them or add a comment explaining why you left them.

**Step 7 — Open the PR**

```powershell
git push origin feature/[YOUR-PROJECT-KEY-NNN]-[short-description]
```

Include in the PR description:
- Link to the approved Confluence spec
- Link to the Jira story
- Summary of /review-pr findings and how they were resolved
- Any WARN findings left with justification

---

### Code Review (PR)

**Owner:** Reviewer (assigned developer)
**Trigger:** PR opened with /review-pr report attached

**What the reviewer focuses on:**

The AI has already checked:
- Null safety and error handling
- Naming conventions
- Obvious security patterns
- Test coverage gaps
- Coding standard adherence

The human reviewer focuses on:
- **Business logic correctness** -- does the code do what the story intended?
- **Architectural decisions** -- are the module boundaries respected?
- **WARN findings** -- are the justifications reasonable?
- **Edge cases** -- did the developer consider failure modes?

**What to expect:**
PR review cycle time should reduce by 20-30% by sprint 3 as reviewers
no longer spend time on mechanical findings.

---

### Sprint Retrospective

**Owner:** Full team
**Trigger:** End of each sprint

**Three standing AI Engineering retro questions:**

**1. Gate C01 value:**
Which stories had Gate C01 findings that were not in the original ticket?
What was the finding? Did it prevent a bug or save implementation time?
> Target: more than half of stories should have at least one finding per sprint.
> If none -- the brownfield context files may be out of date.

**2. Code generation quality:**
Did any /generate-code output require significant manual correction?
If yes -- what was missing from the spec or the .ai/project/ files?
> This drives improvement of the brownfield context files.

**3. Context accuracy:**
Is MODULE_REGISTRY.md still accurate after this sprint?
Did we touch any modules that need updating in TECH_DEBT_REGISTRY.md?
> Tech Lead updates .ai/project/ files as a retro action item if needed.

---

## Per-Story Decision Tree

```
Story arrives in Backlog / Ready
             │
             ▼
   Is the story in an Active module?
   (Check MODULE_REGISTRY.md)
             │
    ┌────────┴──────────┐
    │                   │
   NO                  YES
    │                   │
    ▼                   ▼
Manual only.      PO runs /write-spec
Do not use        (refinement prep,
/generate-code.   2 days before)
See Tech Lead           │
for guidance.           ▼
                  Gate C01 presented
                        │
                        ▼
                  Tech Lead reviews async
                  (24hrs before planning)
                        │
                 ┌──────┴──────┐
                 │             │
             CHANGES       APPROVED
             C01              │
                 │             ▼
             PO revises   Story enters sprint
             spec              │
                               ▼
                          Developer reads spec
                          creates feature branch
                               │
                               ▼
                          /generate-code
                               │
                               ▼
                          /generate-tests
                               │
                               ▼
                          Run test suite
                          Fix failures
                               │
                               ▼
                          /review-pr
                          Fix BLOCK findings
                               │
                               ▼
                          Open PR with spec link
                          and review report
                               │
                               ▼
                          Human review:
                          business logic +
                          WARN findings
                               │
                               ▼
                          Merge to main
```

---

## Role Summary

| Role | One-time tasks | Per sprint |
|---|---|---|
| **Tech Lead** | OT-1 Brownfield scan + DEEP · OT-2 JIRA_CONFIG.md · OT-3 Team norms · OT-4 Definition of Done | Gate C01 review async (per story) · APPROVED / CHANGES C01 · Update .ai/project/ files in retro |
| **Product Owner** | M1 setup (VS Code + MCP) | /write-spec on each Ready story · Review spec for business accuracy · Notify Tech Lead of Gate C01 deadline |
| **CoE Champion** | Supports Tech Lead on OT-1 | Supports PO on /write-spec (first 2 sprints) · Keeps .ai/project/ files accurate · Escalates harness issues to CoE |
| **Developer** | — | Reads approved spec before coding · /generate-code · /generate-tests · /review-pr · Fixes BLOCKs before PR |
| **Reviewer** | — | Reviews business logic and WARN findings · Faster review cycle |

---

## What to Measure

Three lightweight metrics. No new tooling needed -- all from Jira and Confluence.

### Metric 1 — Gate C01 Finding Rate

**What:** Percentage of stories where Gate C01 surfaces at least one finding
not present in the original Jira ticket.

**How to measure:** After each sprint, the PO or CoE Champion reviews the
Gate C01 sections of that sprint's specs and counts stories with new findings.

**Target:**
- Sprint 1: >30% (team is learning)
- Sprint 2: >50%
- Sprint 3+: >60% sustained

**Why it matters:** If the rate drops -- the .ai/project/ files are out of date
or the stories are too vague. Both are fixable.

---

### Metric 2 — PR Review Cycle Time

**What:** Average time from PR opened to PR approved.

**How to measure:** Jira reports → Time in Code Review status.
Compare sprint 1 baseline against sprint 3 and sprint 6.

**Target:**
- Sprint 3: 20% reduction vs baseline
- Sprint 6: 30% reduction vs baseline

**Why it matters:** This is the most visible metric for managers.
Faster review cycles mean faster delivery.

---

### Metric 3 — Story Point Accuracy

**What:** Ratio of estimated points to actual points per sprint.

**How to measure:** Sprint velocity report in Jira.
Compare estimation accuracy sprint-over-sprint.

**Target:**
- Improvement trend from sprint 3 onwards
- Fewer stories that blow their estimates due to unexpected technical complexity

**Why it matters:** Better specs mean better estimates. The Gate C01 findings
surface the complexity before the developer starts -- not halfway through.

---

## Ramp-up Schedule

| Sprint | Focus | Expected state |
|---|---|---|
| Before sprint 1 | OT-1 to OT-4 complete | Brownfield scan done, JIRA_CONFIG.md live, norms agreed |
| Sprint 1 | Full recipe on 2-3 stories | Team learns the flow. CoE Champion supports PO and Developer |
| Sprint 2 | Full recipe on all Active module stories | PO runs /write-spec independently. Tech Lead approves async. |
| Sprint 3 | Baseline metrics established | Gate C01 finding rate and PR review cycle time being tracked |
| Sprint 6 | Business as usual | AI Engineering Commons is the default, not the exception |

---

## What Can Go Wrong and How to Fix It

| Problem | Cause | Fix |
|---|---|---|
| Gate C01 has no findings | .ai/project/ files out of date | Tech Lead runs npx aec update and re-scans changed modules |
| /generate-code produces wrong module | MODULE_REGISTRY.md inaccurate | Tech Lead corrects the registry and re-runs affected story |
| PO spec misses business intent | Story ACs too vague | PO adds more detail to Jira story before running /write-spec |
| Tech Lead bottleneck on Gate C01 | Too many stories per sprint | Senior Architect can co-approve. Or reduce story count per sprint. |
| Developer rewrites most of generated code | Spec approved but incomplete | Add a CHANGES C01 cycle. Better to fix the spec than the code. |
| MCP writes to wrong Jira project | JIRA_CONFIG.md misconfigured | Tech Lead updates JIRA_CONFIG.md and commits to main |
| Context window error on /write-spec | copilot-instructions.md too large | Replace with lean 17-line version (see M3 tutorial troubleshooting) |

---

## What Makes a Good Story

This section defines what a story is and is not, so that `/write-spec` produces
useful output. The AI spec quality is directly proportional to the story quality.
A vague or oversized story produces a vague or oversized spec.

---

### The definition of a story

A story is a unit of work that:

```
✓ Can be completed by one developer in one sprint (max 5 points)
✓ Has a clear, testable outcome that a non-developer can verify
✓ Touches one primary module (may have minor impact on others)
✓ Has Given / When / Then acceptance criteria
✓ Can be deployed independently without breaking other stories
✓ Has no more than 3 decisions required before implementation starts
```

A story is written in the form:

> **As a** [user type]
> **I want to** [do something specific]
> **So that** [business outcome]

The acceptance criteria answer: how will we know this is done?

---

### What a story is NOT

| This is NOT a story | What it is | What to do |
|---|---|---|
| "Build the invoicing module" | Epic | Break into 6-10 stories using the capability breakdown below |
| "Migrate to Spring Boot 3" | Technical epic | Break into stories per module (one migration story per affected module) |
| "Improve system performance" | Theme / initiative | Define a measurable target first, then break into stories |
| "Fix all Kivra-related bugs" | Bug batch | Each bug is a separate story or defect |
| "Implement TMF632 API" | Feature | Break into stories per endpoint or capability |
| "Add MSISDN to all SMS templates" | Feature | Break into one story per template or one story per channel |
| "Refactor document-messaging" | Technical debt epic | Break into stories per finding from DEEP analysis |

**Rule of thumb:** If you cannot write three Given/When/Then ACs for it in
5 minutes -- it is not a story yet. Break it down first.

---

### How to break an epic into stories

Use this sequence:

**Step 1 -- Run /analyse-capabilities on the epic**

Pass the Jira epic key directly -- no service-brief.md needed:

```
/analyse-capabilities [EPIC-KEY]
```

The AI fetches the epic from Jira, reads the codebase context from
.ai/project/, and breaks the epic into 6-10 capability areas in
delivery sequence order with dependency reasoning and tech debt
prerequisites. Output is saved to capability-analysis.md.

**Step 2 -- Run /draft-epics to create sub-epics if needed**

For large features (more than 10 stories), create sub-epics first:
one per capability area. Each sub-epic then contains 3-5 stories.

**Step 3 -- Run /draft-stories per capability**

```
/draft-stories [EPIC-KEY]
```

The AI proposes 3-6 sprint-sized stories per epic, each with
Given/When/Then ACs and dependency ordering.

**Step 4 -- Apply the story checklist before accepting**

For each proposed story, verify:
```
[ ] Completable in one sprint by one developer
[ ] Touches one primary module
[ ] Has at least 3 AC statements (happy path, error case, auth/permission)
[ ] Has no more than 5 story points
[ ] Does not depend on another story in the same sprint
    (unless both are assigned to the same developer)
```

---

### Is a reported issue (bug) a story?

**It depends on what the fix requires.**

| Situation | Treatment |
|---|---|
| Fix is a single class change, under 2 hours | Defect -- use /triage-bug + /generate-code + /review-pr (no spec, no Gate C01) |
| Fix requires understanding of 2+ modules | Story -- run /write-spec, Gate C01 required |
| Fix requires a design decision (e.g. DLQ strategy) | Story with Tech Lead involvement -- run /write-spec |
| Fix touches PII handling or security logic | Story -- Gate C01 mandatory regardless of size |
| Root cause is a known tech debt item (from TECH_DEBT_REGISTRY.md) | Story -- link to the TD item in the Jira story |
| Root cause is unknown -- needs investigation | Spike first, then a story once scope is understood |

**Practical rule:** If you would normally ask another developer to review the
fix before merging -- it is a story and `/write-spec` should be run on it.

**AI workflow for defects (single class, under 2 hours):**

No spec, no Gate C01. Use the lighter command set:

```
Step 1: /triage-bug [JIRA-KEY]
        AI reads the bug report, identifies root cause,
        names the exact class and method to change,
        proposes the fix and the test to add.

Step 2: Developer reads triage output and confirms diagnosis.
        If the root cause is wrong -- add more detail to the
        Jira bug report and run /triage-bug again.

Step 3: /generate-code [JIRA-KEY]
        AI generates the fix based on the triage output.

Step 4: /review-pr
        AI reviews the fix. Address all BLOCK findings.

Step 5: Open PR with triage output and review report attached.
```

The triage output replaces the spec for small defects. It is shorter
(root cause + fix + test) but gives the reviewer and the AI enough
context to generate and review correctly.

**When a defect escalates to a story:**
If `/triage-bug` output reveals that the fix requires changes to 2+
modules, touches PII handling, or has an architectural decision embedded
in it -- stop. Convert the defect to a story and run the full recipe.

---

### Story sizing guide

A story point measures **relative complexity** -- not time. It combines
effort, uncertainty, and risk. Teams use the Fibonacci sequence:
1, 2, 3, 5, 8, 13 -- where each number is roughly twice the complexity
of the previous one.

| Points | What it means | AI workflow |
|---|---|---|
| 1 | Trivial -- one file, well-understood, no decisions | /write-spec optional. /review-pr expected. |
| 2 | Small -- 2-3 files, clear path, one module | /write-spec recommended. Full recipe. |
| 3 | Standard -- 3-5 files, one primary module | Full recipe. Gate C01 required. |
| 5 | Complex -- multiple modules, some uncertainty | Full recipe. Tech Lead reviews Gate C01 carefully. Consider splitting if Gate C01 has 3+ decisions. |
| 8 | This is not a story -- too large or too uncertain | Run /write-spec to understand scope, then split. See AI-Assisted Sizing below. |
| 13 | This is an epic, not a story | Run /analyse-capabilities first, then /draft-stories. |

---

### AI-Assisted Story Sizing and Splitting

**How the AI helps estimate:**

Run `/write-spec` before estimating. The spec output contains exactly the
information needed to size accurately:
- Number of affected classes
- Number of modules touched (primary vs secondary)
- Number of Gate C01 decisions required
- Tech debt items that must be resolved first
- Hidden coupling identified in DEEP analysis

Use this output in refinement to estimate. The team is no longer guessing
from a ticket description -- they are estimating from a technical analysis.

**AI sizing signals:**

| Signal in spec or Gate C01 | Suggested action |
|---|---|
| 1-2 modules affected, 0-1 decisions | Size as 2-3 points |
| 2-3 modules affected, 2-3 decisions | Size as 3-5 points |
| 3+ modules affected | Size as 5 points then consider splitting |
| Gate C01 has 4+ decisions required | Story is too large -- split before sizing |
| Spec references a refactoring prerequisite from DEEP analysis | Cannot be sized until prerequisite is resolved -- park the story |
| Spec touches a Legacy module | Add 2 points for uncertainty -- or resolve DEEP prerequisites first |

**Automatic split recommendation:**

After `/write-spec` runs, ask Copilot:

```
Based on the spec you just produced for [JIRA-KEY],
does this story need to be split?
If yes, propose how to split it into 2-3 smaller stories
each completable in one sprint, each with its own
Given/When/Then acceptance criteria.
Write the proposed stories to Jira project [YOUR-PROJECT-KEY].
```

Copilot reads the spec and identifies natural split points --
typically by capability area, by module, or by separating
the data layer change from the API layer change.

**When splitting is mandatory (not optional):**
```
[ ] Gate C01 has 4 or more decisions required
[ ] The spec touches 3 or more modules as primary owner
[ ] The story has a refactoring prerequisite that is itself
    unresolved work (e.g. no DLQ exists yet -- TD-006)
[ ] The story estimate would be 8 points or higher
[ ] The story has both a database migration AND an API change
    (always split these -- they have different risk profiles)
```

---

### What Gate C01 cannot fix

Gate C01 catches technical risks in a well-defined story. It cannot fix:

- A story so large the AI cannot determine where to start
- Missing acceptance criteria (AI will flag this but cannot invent them)
- Stories that depend on schema changes not yet designed
- Stories in Legacy or Deprecated modules without refactoring prerequisites resolved

If Gate C01 produces 5+ decisions required -- the story is probably too large
or too vague. Send it back to the PO for refinement before approving.

---

## Keeping .ai/project/ Files Accurate

The `.ai/project/` files are the AI's memory of your codebase. If they drift
from reality, every downstream command (spec, code, review) produces output
based on a false picture of the system. Accuracy is not a one-time activity --
it is an ongoing responsibility owned by the Tech Lead.

---

### What causes drift

| File | Common causes of drift |
|---|---|
| MODULE_REGISTRY.md | New modules added, old modules deprecated, modules renamed, ownership changes |
| INTEGRATION_MAP.md | New external systems integrated, existing integrations changed or removed, auth methods updated |
| DATA_MODEL.md | Schema changes, new PII fields added, retention policies defined |
| TECH_DEBT_REGISTRY.md | Tech debt resolved, new debt introduced, severity changes, Jira story completed |
| KAFKA_TOPICS.md | New topics added, consumers changed, topics deprecated |
| ARCHITECTURE_OVERVIEW.md | Major architectural changes, new services added, patterns changed |

---

### Triggers for updating each file

Each trigger is owned by a specific role. No trigger should require a manual
reminder -- it should be a natural part of the existing process.

**MODULE_REGISTRY.md**

| Trigger | Owner | Action |
|---|---|---|
| New module created (new directory, new service) | Tech Lead | Add module entry with classification, description, owner |
| Module deprecated or archived | Tech Lead | Change classification to Deprecated, add deprecation date |
| Module ownership changes | Tech Lead | Update owner team field |
| Sprint retro identifies wrong classification | Tech Lead (retro action) | Correct classification, re-run DEEP if now Active |

**INTEGRATION_MAP.md**

| Trigger | Owner | Action |
|---|---|---|
| New external system integrated | Developer (story author) | Add entry after story is merged |
| Existing integration removed | Developer (story author) | Remove entry after story is merged |
| Auth method changes | Developer (story author) | Update auth field |
| DPA status confirmed by Security Lead | Tech Lead | Update DPA status from Unknown to Confirmed/Not Required |

**DATA_MODEL.md**

| Trigger | Owner | Action |
|---|---|---|
| Database schema migration merged | Developer (migration author) | Update affected table entries |
| New PII field added | Developer (story author) | Add field with PII flag and retention policy |
| Retention policy defined for existing PII field | Tech Lead | Update retention policy entry |
| Table removed | Developer (story author) | Remove entry |

**TECH_DEBT_REGISTRY.md**

| Trigger | Owner | Action |
|---|---|---|
| Tech debt story completed and merged | Developer (story author) | Mark TD item as Resolved with date |
| New High severity debt found during development | Developer (who found it) | Add TD item and create Jira story |
| DEEP analysis identifies new findings | Tech Lead (after DEEP run) | Add findings to registry with Jira story keys |
| Sprint retro surfaces new debt | Tech Lead (retro action) | Add TD item |

**KAFKA_TOPICS.md**

| Trigger | Owner | Action |
|---|---|---|
| New Kafka topic added | Developer (story author) | Add topic entry with consumer and producer |
| Topic deprecated | Developer (story author) | Mark as deprecated |
| New consumer added to existing topic | Developer (story author) | Update consumer list |

**ARCHITECTURE_OVERVIEW.md**

| Trigger | Owner | Action |
|---|---|---|
| Major architectural change merged | Tech Lead | Update overview section and module map |
| New service added to the ecosystem | Tech Lead | Add to system diagram and integration map |
| Sprint retro identifies outdated description | Tech Lead (retro action) | Update the affected section |

---

### Automated context update after a PR merges

Instead of relying on developers to remember to update `.ai/project/` files,
use the `/update-context` command after every PR that introduces a known change
to the architecture, data model, or integrations.

**Who runs it:** The developer who authored the PR, immediately after merge.
**When:** Within the same working day as the merge. Not deferred to retro.

**What to do:**

```
/update-context

The PR that just merged ([branch name / PR link]) introduced these changes:
- [describe what changed: new integration, schema change, new module, etc.]

Review the .ai/project/ files and propose specific updates to:
- MODULE_REGISTRY.md if a module was added, deprecated, or changed ownership
- INTEGRATION_MAP.md if a new external system was added or an existing one changed
- DATA_MODEL.md if the schema changed or a new PII field was added
- TECH_DEBT_REGISTRY.md if a TD item was resolved or a new one introduced
- KAFKA_TOPICS.md if a new topic was added or a consumer changed

Only propose changes you are confident about based on the diff.
Flag anything uncertain for Tech Lead review.
```

Copilot reads the git diff, compares it against the existing `.ai/project/` files,
and proposes specific line-level updates to each affected file.

The developer reviews the proposals, accepts the accurate ones, rejects any
hallucinations, and raises a PR for Tech Lead approval.

**The update PR:**

```powershell
git checkout main
git pull
git checkout -b chore/update-ai-project-[pr-number]

# Accept Copilot's proposed changes to .ai/project/ files
# Regenerate tool configs
npx aec update

git add .ai\projectgit commit -m "chore: update .ai/project/ context after PR [number]

Changed:
  [file]: [what changed and why]
  [file]: [what changed and why]

Trigger: PR [number] -- [brief description of code change]
Proposed by: /update-context
Verified by: [developer name]
Tech Lead review required: yes"

git push origin chore/update-ai-project-[pr-number]
# Raise PR -- Tech Lead reviews and merges
```

**Tech Lead reviews and approves all `.ai/project/` PRs.**
These are not cosmetic changes -- an inaccurate `.ai/project/` file
directly affects the quality of every spec and generated code output.

**What /update-context cannot detect automatically:**
- Retention policy decisions (these require a human decision)
- DPA status changes (these require Security Lead input)
- Ownership changes (these require a management decision)
- Severity changes to existing tech debt (these require Tech Lead judgment)

For these -- the developer flags them in the PR description and the
Tech Lead makes the decision during review.

---

### Quarterly full re-scan

Once per quarter, the Tech Lead runs a full brownfield re-scan to catch
any drift that was not caught by the trigger-based updates above.

```
/run-brownfield-scan
```

After the re-scan:
1. Diff the output against the current `.ai/project/` files
2. Accept changes that are genuine improvements
3. Reject changes that are scan errors (the scan is a first draft -- see OT-1)
4. Run DEEP analysis on any module where the scan found significant changes
5. Commit verified changes via PR

**Quarterly re-scan owner:** Tech Lead
**Scheduled as:** A recurring calendar item in the first sprint of each quarter

---

### The accuracy rule

> If you would not use a document that you knew was 6 months out of date
> to make an architectural decision -- do not let the `.ai/project/` files
> become that document.

The `.ai/project/` files are only as valuable as they are accurate.
An outdated MODULE_REGISTRY.md is worse than no MODULE_REGISTRY.md --
because it produces confident but wrong AI output.

---

## Version and Review

| Owner | CoE Core — Mrinal Pasari |
| Version | 1.0 |
| Created | 2026-05-28 |
| Review cadence | After each team's first 3 sprints |
| Feedback | AI Champions CoE Teams channel |
