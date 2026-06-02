# M4 — DEEP Module Analysis Tutorial
# AI Engineering Commons — Champions Programme
# Version: 1.0
# Last updated: 2026-05-14
# Prerequisite: M3 completed (brownfield scan done, .ai/project/ files committed)

---

## What you will achieve by the end of this tutorial

By the end of M4 you will have:
- A complete DEEP analysis of your codebase's highest-risk module
- Every entry point, hidden dependency, and implicit business rule documented
- Jira stories automatically created for Critical and High findings
- A saved analysis file your whole team can reference

**Time to complete:** 2-4 hours
**Difficulty:** Intermediate
**Prerequisites:** M3 complete
**Next milestone:** M5 — Real Story Spec

---

## Why this matters

Code review tells you what the code does today.
DEEP analysis tells you what the code assumes, what it enforces silently,
and what will break if you touch it without understanding it first.

In the BDL live session, DEEP analysis of document-messaging (249 classes, 609 commits)
found in under 10 minutes:
- Invoice delivery failures are completely invisible (no Dead Letter Queue)
- A latent NPE that fires on a specific customer routing path
- Phone number normalisation implemented independently in two places
- A file lock that prevents service restart after a crash

None of these were in any documentation. All were found automatically.

---

## Step 1 — Identify the right module to analyse first

**What to do:**
Open `.ai/project/MODULE_REGISTRY.md` and identify:

1. The module with the highest commit count (most active = most business logic)
2. Any module that consumes all Kafka topics (single point of failure)
3. Any module that handles PII (SSNs, customer IDs, account numbers)

Start with the highest commit count module. This is almost always the core
delivery engine of the service.

**Why this order:**
High commit count means the module has been modified frequently over years.
Frequent modification means accumulated business rules, workarounds, and implicit
assumptions that nobody has written down.

---

## Step 2 — Run the DEEP analysis

**What to do:**
In Copilot Chat Agent mode type:

```
/explain-module [module-name] DEEP
```

Replace [module-name] with the module directory name from MODULE_REGISTRY.md.

**This will take several minutes.** The AI is reading every class in the module,
running git log to understand the history, and building a complete picture.
Do not interrupt it.

**What the DEEP analysis produces (9 sections):**

**1. Purpose**
What business problem this module solves in plain language.

**2. Entry points**
Every way data enters this module -- Kafka consumers, REST endpoints,
scheduled jobs, file watchers, IMAP polling, etc.

**3. Call graph**
How data flows through the module from entry to output.

**4. External dependencies**
Every external system with protocol and authentication method.

**5. Test coverage estimate**
Count of test vs main classes. Which areas are untested.

**6. Risk level**
Critical / High / Medium / Low with specific factors listed.

**7. Invariants**
Implicit business rules enforced in code but never documented.
These are the most valuable findings -- things like:
"Only one instance can run (file lock on startup)"
"Commands are fire-and-forget with no retry"
"Template resolution falls back silently -- unknown template drops message"

**8. Hidden coupling**
Shared databases, compile dependencies, file system paths shared with
other modules. Changes here will break other things.

**9. Refactoring prerequisites**
Ordered list of what MUST be done before the module can be safely changed.

---

## Step 3 — Save the DEEP analysis to a file

**What to do:**
After the analysis appears in chat, type:

```
Save the DEEP analysis you just produced to
.ai/project/deep/[module-name]-DEEP.md in the project root.
Include at the top: risk level, date, and which Jira stories were created.
```

**Commit:**
```powershell
mkdir -Force ".ai\project\deep"
git add .ai\project\deep\
git commit -m "docs: DEEP analysis for [module-name]"
```

**Why save it:**
The DEEP analysis takes several minutes to generate.
Saving it means future sessions and team members can read it without re-running.
It also means your Tech Lead and architect can review it without being in a Copilot session.

---

## Step 4 — Review the findings checklist

After reading the DEEP output, check for these specific patterns:

```
[ ] Silent exception handling in Kafka consumers
    (exceptions caught and swallowed = messages dropped silently)

[ ] Optional Spring beans (@ConditionalOnProperty, @Qualifier)
    used without null-guards in task classes
    (latent NPE on specific code paths)

[ ] The same business rule implemented in two or more places
    (will diverge over time -- create a story to consolidate)

[ ] File locks, PID files, or singleton patterns
    with no documented crash recovery runbook

[ ] Shared database tables written by multiple services
    (schema changes break all services simultaneously)

[ ] Scheduled or async jobs with no external alerting on failure
    (failures invisible until a customer complains)

[ ] Configuration that is hardcoded instead of externalised
    (requires code change to switch environments)
```

Each finding that matches creates a tech debt story.

---

## Step 5 — Jira stories are created automatically

The updated `/explain-module DEEP` prompt creates Jira stories automatically
for Critical and High findings without asking for approval.

**What you should see:**
After the analysis, Copilot calls `jira_create_issue` for each finding
and returns the story keys:

```
Created 3 stories in SPOCKT:
SPOCKT-XXXXX: [CRITICAL] No DLQ -- silent message drop (TD-006)
SPOCKT-XXXXX: [BUG] Latent NPE in DeliveryTask (TD-007)
SPOCKT-XXXXX: [ARCH] Business rule duplicated in two mappers (TD-008)
```

Open Jira and verify the stories appear under SPOCK Common.

**If stories were not created automatically:**
The prompt file may be the older version. Create them manually:

```
Using jira-mcp, create a story in project SPOCKT with:
Summary: [CRITICAL] [module-name]: [finding description] (TD-NNN)
Type: Story
Team: SPOCK Common
Labels: ai-engineering-commons-test, brownfield-deep-analysis
Description: [paste the finding detail from the DEEP analysis]
```

---

## Step 6 — Update TECH_DEBT_REGISTRY.md

**What to do:**
Open `.ai/project/TECH_DEBT_REGISTRY.md` and add the new findings
with their Jira story keys. This keeps the registry as the single
source of truth for all known debt.

**Commit:**
```powershell
git add .ai\project\TECH_DEBT_REGISTRY.md
git commit -m "docs: TECH_DEBT_REGISTRY updated with DEEP findings"
```

---

## Step 7 — Mark your M4 milestone

1. Open the Champions Register
2. Add `✓ (May-26)` in your M4 DEEP column
3. Save

**You have completed M4. ✓**

---

## Troubleshooting

| Problem | Fix |
|---|---|
| DEEP analysis takes too long | Normal for large modules. Wait -- do not interrupt. |
| DEEP gives shallow output | Module may be a thin wrapper. Ask: "Where is the actual business logic for [module]?" |
| Jira stories not created automatically | Use older manual prompt -- see Step 5 |
| TD numbering clashes | Agent detects this and auto-assigns next available number |

---

## Next step

You are ready for **M5 — Real Story Spec**.

---
---

# M5 — Real Story Spec Tutorial
# Prerequisite: M3 and M4 complete

---

## What you will achieve by the end of this tutorial

By the end of M5 you will have:
- A real story from your team's Jira backlog read and analysed
- A full technical spec generated in the ECAI Confluence space
- At least one finding surfaced that the team had not identified
- Gate C01 presented for Tech Lead review

**Time to complete:** 1-2 hours
**Prerequisites:** M3 and M4 complete

---

## Why this matters

The spec generation step is where the brownfield investment pays off.
The AI reads your real ticket, reads the DEEP analysis of the affected module,
and automatically surfaces conflicts between what the ticket asks for
and what the codebase can safely support.

In the BDL live session, a single real ticket (TDMT-103) produced:
- A RISK finding: the story would create a THIRD phone normalisation implementation
- A DECISION: a placeholder in the SMS text was not implementable without a BRM schema change
- An ENCODING RISK: Swedish characters reduce SMS length from 160 to 153 chars
- Gate C01 with all three decisions documented before any code was written

None of these were in the original ticket.

---

## Step 1 — Read your real Jira backlog

**What to do:**
In Copilot Chat type:

```
@jira-mcp search issues in project [YOUR-REAL-PROJECT-KEY]
where status in ("In Progress", "To Do", "Ready")
order by updated DESC
limit 5
```

**Note for Kanban boards:**
If your project uses Kanban (not Scrum), "Ready" may not be a valid status.
Use:
```
where status in ("In Progress", "To Do")
```

**What you should see:**
A list of 5 real tickets from your team's backlog.

---

## Step 2 — Pick the right story

**Good story criteria for M5:**
```
✓ Touches a module you ran DEEP on in M4
✓ Is 3 points or fewer
✓ Has some description in Jira (not empty)
✓ Is not a database migration
✓ Is not an authentication change
```

The best story for this exercise is one that touches the core module
from your M4 DEEP analysis. This is where the AI can cross-reference
the findings and produce the most valuable spec.

---

## Step 3 — Read the full story details

**What to do:**

```
@jira-mcp get issue [YOUR-REAL-PROJECT-KEY-NNN]
```

Read the full output: description, acceptance criteria, linked features, labels.

---

## Step 4 — Generate the spec in demo mode

**What to do:**

```
Using the context from [YOUR-REAL-PROJECT-KEY-NNN] and the DEEP analysis
in .ai/project/deep/[module-name]-DEEP.md,
generate a technical spec for this story.

Write the spec to Confluence space ECAI under parent page 1289964045.
Title: SPEC: [YOUR-REAL-PROJECT-KEY-NNN] -- [story summary]

Do not update the real Jira ticket.
Do not create tickets in [YOUR-REAL-PROJECT-KEY].
This is demo mode -- write to ECAI and SPOCKT only.
```

**What you should see:**
Copilot reads the story, reads the DEEP analysis, and creates a spec page
in the ECAI Confluence space. Then it presents Gate C01.

**The finding that proves the value:**
Look for any of these in the spec output:
- A RISK badge referencing a tech debt item from TECH_DEBT_REGISTRY.md
- A DECISION required before implementation can start
- A GDPR implication of the change
- An encoding, locale, or format risk
- A cross-team dependency not mentioned in the ticket

If the AI surfaces any of these -- that is a finding the team did not have
before this exercise. That is the value of connecting the spec to the DEEP analysis.

---

## Step 5 — Review Gate C01

The spec ends with Gate C01:

```
GATE C01 — Tech Lead review required

Confluence spec: [URL]
Review the spec. When satisfied, type: APPROVED C01
To request changes, type: CHANGES C01 followed by your feedback
```

Open the Confluence URL shown in the output and read the spec carefully.

**Check these things:**

```
[ ] The spec accurately describes what the story asks for
[ ] The affected classes and modules are correct
[ ] Any tech debt conflicts are noted
[ ] GDPR implications are addressed if relevant
[ ] The spec was written to ECAI (not your real Confluence space)
[ ] Any Jira stories created went to SPOCKT (not your real project)
```

**Stop here. Do not type APPROVED C01.**

Gate C01 is where M5 ends. Approving it and generating code is M6.
The full Gate C01 approval and code generation process is covered in:

**M6 tutorial:** M6-codegen-tutorial.md

---

## Step 6 — Document what the AI found that you did not know

Before marking M5 complete, write a short note answering:
- What story did you use?
- What did the AI surface that was not in the original ticket?
- Would this have been caught before coding started without the AI?

Post this in the AI Champions CoE Teams channel.
This is the most valuable output of M5 -- your real finding on your real codebase.
It is what convinces other teams to try it.

---

## Step 6 — Document what the AI found that you did not know

**What to do:**
Write a short note (3-5 sentences) answering:
- What story did you use?
- What did the AI surface that was not in the original ticket?
- Would this have been caught before coding started without the AI?

Post this in the AI Champions CoE Teams channel.

This is the most valuable output of M5 -- your real finding on your real codebase.
It is what convinces other teams to try it.

---

## Step 7 — Mark your M5 milestone

1. Open the Champions Register
2. Add `✓ (May-26)` in your M5 Real Story column
3. Save

**You have completed M5. ✓**

---

## What you have now

After completing M1 through M5 you have:
- A fully configured AI development environment
- Experience with the full greenfield journey (idea to spec)
- Your own codebase scanned and documented
- Your highest-risk module fully analysed with Jira stories created
- A real story specced with findings your team did not have before

You are now equipped to guide your team through any of these scenarios.
That is what being a champion means.

---

## Next steps

**M6 — Code Generation:**
Open M6-codegen-tutorial.md to complete the Gate C01 approval,
run `/generate-code`, and review the generated PR with `/review-pr`.

**M7 — Onboard a Colleague:**
Walk a colleague through M1. Be their support while they complete M2.
That is the multiplier.
