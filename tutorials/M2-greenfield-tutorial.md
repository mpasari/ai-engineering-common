# M2 — Greenfield Tutorial
# AI Engineering Commons — Champions Programme
# Version: 1.0
# Last updated: 2026-05-14
# Prerequisite: M1 completed (Confluence and Jira MCP working)

---

## What you will achieve by the end of this tutorial

By the end of M2 you will have:
- A structured service brief generated from a rough idea
- A capability analysis with 6-8 capabilities in reasoned delivery order
- At least 3 Jira epics created in SPOCKT with business outcome statements
- Stories with Given/When/Then acceptance criteria created in Jira
- A technical spec published to the ECAI Confluence space

**Time to complete:** 60-90 minutes
**Difficulty:** Beginner
**Prerequisites:** M1 complete — Confluence and Jira MCP working
**Next milestone:** M3 — Brownfield Discovery

---

## Why this matters

Most engineering teams start delivery with a vague idea and jump straight into Jira.
Stories get created without clear acceptance criteria, epics have no business justification,
and the capability sequence is often wrong (consent built before audit trail, UI built before API).

This tutorial shows how AI can structure the thinking before a single ticket is created.
The output is not just faster -- it is more complete and more defensible.

---

## Before you start

**Clone the demo project:**

```powershell
git clone https://github.com/telia-company/ai-engineering-commons-demo.git
cd ai-engineering-commons-demo
code .
```

**Open Copilot Chat in Agent mode:**
- `Ctrl+Alt+I` to open
- Switch to Agent mode
- Verify confluence-mcp and jira-mcp are checked in the tools panel

---

## The idea we will use

For this tutorial we use a single paragraph as the starting point.
This is deliberately vague -- exactly like a real idea from a stakeholder meeting:

> We need a master data system for Telia party information.
> Parties are B2C customers, B2B businesses, and B2O operators
> across Norway, Sweden, and Finland. Currently party data is
> scattered across BSS, CRM, and billing systems with no single
> source of truth. We need TMForum-aligned APIs with full GDPR
> consent management and audit trail.
> Tech: Java backend, React frontend.

That is the input. Everything else is AI-generated and AI-structured.

---

## Step 1 — Run /draft-brief

**What to do:**
Type this in Copilot Chat and press Enter:

```
/draft-brief

We need a master data system for Telia party information.
Parties are B2C customers, B2B businesses, and B2O operators
across Norway, Sweden, and Finland. Currently party data is
scattered across BSS, CRM, and billing systems with no single
source of truth. We need TMForum-aligned APIs with full GDPR
consent management and audit trail.
Tech: Java backend, React frontend.
```

**What you should see:**
Copilot reads the input and creates `service-brief.md` in the project root.
The file contains:
- Service name
- Problem statement
- User types (B2C, B2B, B2O, Internal)
- What this service does
- What this service does NOT do
- Key constraints
- Tech stack
- Business drivers
- Open questions with assumed answers

**If Copilot shows a capabilities menu instead of executing:**
Type in the same session:
```
Execute the /draft-brief command now. Create service-brief.md immediately.
```

**Verify it worked:**
```powershell
Test-Path "service-brief.md"    # Should return: True
```

**Learning:**
The open questions section is the most valuable part. These are the things a good
architect would ask before any planning begins. The AI identifies them automatically
and makes reasonable assumptions so work can continue without waiting for answers.

---

## Step 2 — Answer the open questions

**What to do:**
Open `service-brief.md` in VS Code. Scroll to the Open questions section.
Add a new section at the bottom of the file:

```markdown
## Answers to open questions

1. **Golden record:** This service IS the golden record.
   BSS, CRM, and billing read from here -- they do not write here.

2. **Migration:** Party IDs not unique today. Deduplication is Phase 2.
   Phase 1 handles net-new parties only.

3. **TMForum version:** TMF632 v5 target. v4 acceptable initially.

4. **UI scope:** Full read/write for customer service agents and data stewards.
   Read-only plus audit log for compliance officers.

5. **Consent scope:** GDPR Art. 6 + Art. 9.
   Marketing consent managed by a separate platform.

6. **National IDs:**
   NO: personnummer 11 digits + D-number (first digit 4-7)
   SE: personnummer 10 digits (YYMMDD-XXXX)
   FI: HETU 11 chars (DDMMYYCZZZQ)

7. **SLA:** 99.9% availability. RTO 4h. RPO 1h.

8. **Kafka consumers:** BSS and CRM have no consumers yet.
   Each team builds their own.

9. **Owning team:** Platform Engineering long-term.
   Party MDM squad delivers initial build.

10. **Jira project:** SPOCKT (demo). Confluence space ECAI.
```

Save with `Ctrl+S`.

**Commit the file:**
```powershell
git add service-brief.md
git commit -m "docs: service brief for Party Information Management"
git push origin main
```

**Why commit before the next step:**
Copilot reads your project files through the git index.
A file that exists on disk but is not committed is invisible to Copilot's search.
Always commit before running the next command.

**Learning:**
The answers you provide here directly shape the capability analysis.
The AI will use these constraints (TMF632 v5, GDPR Art. 9, NO/SE/FI formats)
when deciding what to build and in what order.

---

## Step 3 — Run /analyse-capabilities

**What to do:**
In Copilot Chat type:

```
/analyse-capabilities
```

**What you should see:**
Copilot reads `service-brief.md` and creates `capability-analysis.md` with:
- 6-8 capability areas in a specific delivery order
- For each capability: what it is, why it is needed, what it depends on, risk if delayed
- Why this sequence (2-3 paragraphs of reasoning)
- Risks and unknowns table
- Cross-team dependencies table

**Example of what good output looks like:**

```
1. Service foundation and data model
   Why this order: Every other capability depends on a stable schema.
   Schema changes after audit logic cascade through the entire codebase.

2. TMF632 Party API (core CRUD)
   Why this order: BSS/CRM cannot integrate without this API existing.

3. Immutable audit trail
   Why this order: GDPR Art. 5(2) requires this from day one of go-live.
   Cannot be retrofitted after the fact.

4. GDPR consent management
   Why this order: MUST come after audit -- consent changes must themselves be audited.
```

**The critical sequencing note to look for:**
Audit trail (3) MUST precede consent management (4).
This is a compliance requirement most teams get wrong.

**Commit:**
```powershell
git add capability-analysis.md
git commit -m "docs: capability analysis for Party Information Management"
git push origin main
```

**Learning:**
Most teams build consent before audit and discover the problem in a compliance review.
The AI sequences correctly because it knows GDPR Art. 5(2) requires audit provenance
on consent changes. This is the kind of knowledge that usually lives only in your
most experienced architect's head.

---

## Step 4 — Create Jira epics

**What to do:**
In Copilot Chat type:

```
/draft-epics SPOCKT
```

**What you should see first:**
Copilot shows you ALL proposed epics for review BEFORE creating anything in Jira.
Check each epic title -- it should be a business outcome, not a technical task:

```
GOOD: "Party records can be created, read, updated, and searched via a single API"
BAD:  "Implement TMF632 CRUD endpoints"
```

When satisfied, type:
```
Yes, create these epics
```

**What you should see after:**
Copilot calls `jira_create_issue` for each epic and returns the Jira keys:

```
Created 8 epics:
SPOCKT-XXXXX: Party data schema -- foundation
SPOCKT-XXXXX: TMF632 Party API
...
```

Open Jira and verify the epics appear in project SPOCKT under team SPOCK Common.

**Commit epics.md:**
```powershell
git add epics.md
git commit -m "docs: epic register -- 8 epics created in Jira"
git push origin main
```

**Learning:**
Business outcome statements in epic titles matter more than you think.
They force the team to articulate what value is being delivered, not what code is being written.
"Party records can be searched" is testable. "Implement search endpoint" is not.

---

## Step 5 — Create stories for the first epic

**What to do:**
Replace SPOCKT-XXXXX with your actual first epic key:

```
/draft-stories SPOCKT-XXXXX
```

**What you should see:**
Copilot reads the epic from Jira and proposes 4-6 sprint-sized stories.
Each story should have:
- A clear title ("[Actor] can [do something]")
- Given/When/Then acceptance criteria
- A happy path AC
- An error/validation AC
- An auth AC (unauthenticated request returns 401)
- Story points
- Dependencies on other stories

Review each story. When satisfied:
```
Yes, create these stories
```

**Verify in Jira:**
Open your first epic in Jira. You should see 4-6 stories with full acceptance criteria.

**Commit:**
```powershell
git add stories-SPOCKT-XXXXX.md
git commit -m "docs: stories for foundation epic"
git push origin main
```

**Learning:**
Given/When/Then acceptance criteria are the single most important thing you can have
in a Jira story. They define exactly what "done" means before a developer writes
a single line of code. The AI generates them from the capability context automatically.

---

## Step 6 — Generate a technical spec

**What to do:**
Use the first story key (the one with no dependencies):

```
/write-spec SPOCKT-XXXXX
```

**What you should see:**
Copilot reads the story from Jira and creates a technical specification page
in the ECAI Confluence space. The spec includes:
- Business summary
- Scope (in and out)
- Acceptance criteria (copied from Jira)
- Technical approach
- API changes (if applicable)
- Data model changes (if applicable)
- Security considerations
- Non-functional requirements

After creating the page, Copilot presents **Gate C01**:

```
GATE C01 — Tech Lead review required

Confluence spec: [URL]
Jira story: [URL]

When you have reviewed the spec, type: APPROVED C01
```

**Review the spec in Confluence** -- does it match the story? Is anything missing?

When satisfied, type:
```
APPROVED C01
```

**Learning:**
Gate C01 is a mandatory checkpoint. No code is generated without an approved spec.
This is what prevents developers from interpreting requirements differently
from what was agreed. The AI enforces the gate -- it will not proceed without your approval.

---

## Step 7 — Mark your M2 milestone

**What to do:**
1. Open the Champions Register:
   https://itwiki.atlassian.teliacompany.net/spaces/ECA/pages/1279990780
2. Find your name
3. Add `✓ (May-26)` in the M2 Tutorial column
4. Save

**You have completed M2. ✓**

---

## What you produced

```
Git repository:
  service-brief.md        -- structured idea with answered questions
  capability-analysis.md  -- 8 capabilities in delivery order
  epics.md                -- epic register with Jira keys
  stories-[key].md        -- stories with full AC detail

Jira (SPOCKT):
  8 epics with business outcome statements
  4-6 stories under Epic 1 with Given/When/Then ACs

Confluence (ECAI):
  Technical spec for first story (Gate C01 approved)
```

All produced from one rough idea paragraph using 5 commands in 60-90 minutes.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Copilot shows capabilities menu | Type: "Execute the command I just triggered. Create the file now." |
| File not saved to disk | Check the edit tool is ON in the tools panel |
| Copilot cannot find service-brief.md | Commit the file first -- Copilot reads git index only |
| Jira field error on creation | Check .ai/project/JIRA_CONFIG.md has correct field IDs |
| Context window above 50% | Open a new Copilot Chat session (+) |

---

## Next step

You are ready for **M3 — Brownfield Discovery**.

In M3 you will run the same AI tooling on an existing codebase your team owns.
The AI will map all modules, find integrations, identify PII fields, and surface
tech debt -- all automatically in under 30 minutes.

**M3 tutorial:** M3-brownfield-tutorial.md
