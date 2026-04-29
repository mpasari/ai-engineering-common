# AI Engineering Commons -- Champions Tutorial
# Party Information Management: From Idea to Delivery
# Version: 1.0.0
# Created: 2026-04-29
# Author: Telia E&C AI Team

---

## Welcome

This tutorial walks you through the complete AI-assisted engineering
journey for the Telia Party Information Management system -- from a
rough idea to Jira epics and stories with full acceptance criteria.

You will use GitHub Copilot Agent Mode in VS Code with the AI Engineering
Commons framework. Every step is a real command that produces a real
output saved to your project.

**Time required:** 45-60 minutes for the full tutorial.
**Prerequisite:** Complete the setup checklist in section 1 before starting.

---

## Section 1 -- Setup checklist

Complete every item before starting section 2.

### 1.1 Software

```
[ ] VS Code installed (version 1.99 or later)
    Check: Help > About > Version
[ ] GitHub Copilot extension installed
    Check: Extensions panel (Ctrl+Shift+X) > search "GitHub Copilot"
[ ] GitHub Copilot Chat extension installed
[ ] Node.js 18+ installed
    Check: node --version in terminal
```

### 1.2 Access

```
[ ] GitHub Copilot licence active
    Check: Copilot icon in VS Code status bar (bottom) -- not strikethrough
[ ] Jira access to project PARTY (or your project key)
    Check: open https://[your-jira]/projects/PARTY in browser
[ ] Confluence access to ECAI space
    Check: open https://itwiki.atlassian.teliacompany.net/spaces/ECAI
```

### 1.3 Project setup

```powershell
# Clone the demo project
git clone https://github.com/telia-company/ai-engineering-commons-demo.git
cd ai-engineering-commons-demo

# Open in VS Code
code .
```

### 1.4 Verify Jira MCP is connected

```
1. Open Copilot Chat: Ctrl+Alt+I
2. Switch to Agent mode (dropdown at top of chat panel)
3. Type: @jira-mcp get my issues
4. Expected: list of your Jira issues appears
   If error: check with your CoE champion -- MCP may need enabling
```

### 1.5 Verify Confluence MCP is connected

```
1. In Copilot Chat Agent mode type:
   @confluence-mcp search for pages in space ECAI
2. Expected: list of pages in the ECAI Confluence space
   If error: check with your CoE champion
```

If both MCPs respond -- you are ready. Proceed to section 2.

---

## Section 2 -- The idea

Every engineering journey starts with a rough idea -- not a backlog,
not a spec, not a Jira epic. Just a problem statement.

Here is the idea for this tutorial:

> We need a master data system for Telia party information.
> Parties are B2C customers, B2B businesses, and B2O operators
> across Norway, Sweden, and Finland. Currently party data is
> scattered across BSS, CRM, and billing systems with no single
> source of truth. We need TMForum-aligned APIs with full GDPR
> consent management and audit trail.
> Tech: Java backend, React frontend.

This is deliberately vague. That is realistic. The AI's job is to
help you structure it before any planning begins.

---

## Section 3 -- Step 1: Draft the service brief

**What this step does:**
Turns the rough idea into a structured service brief with explicit
scope, constraints, and open questions. Saves it as `service-brief.md`.

**How long:** 3-5 minutes.

### 3.1 Open a new Copilot Chat session

```
1. In VS Code, open Copilot Chat: Ctrl+Alt+I
2. Click the + button to start a new session
3. Select Agent mode from the dropdown
4. Verify confluence-mcp and jira-mcp show as Running
   (click the tools icon -- two wrenches -- to check)
```

### 3.2 Run the command

Type `/draft-brief` in the chat input, then press Enter.

When Copilot asks for the idea (or immediately after the command),
paste the idea from section 2.

**What to expect:**
- Copilot reads your input
- Creates `service-brief.md` in the project root
- Lists 8-10 open questions with assumed answers
- Tells you the next step

**Check it worked:**
```powershell
# In VS Code terminal (Ctrl+`)
Test-Path "service-brief.md"   # Should return True
Get-Content "service-brief.md" | Measure-Object -Line  # Should be 40+ lines
```

### 3.3 Answer the open questions

Open `service-brief.md` in VS Code. Scroll to the "Open questions" section.
Review each assumed answer and correct any that are wrong for your context.

For this tutorial, use these answers:

```
1. System of record: This IS the golden record. All writes go here first.
2. Migration: Party IDs not unique across systems. Deduplication is Phase 2.
3. TMForum version: TMF632 v5 target. v4 acceptable for initial release.
4. UI scope: Internal ops tool for Telia staff -- not customer facing.
5. Consent scope: GDPR Art. 6 and Art. 9. Marketing consent lives elsewhere.
6. National IDs: NO personnummer 11 digits. SE personnummer 10 digits.
   FI henkilotunnus 11 chars.
7. SLA: 99.9% availability. RTO 4 hours. RPO 1 hour.
8. Kafka consumers: BSS and CRM do NOT yet have Kafka consumers.
9. Owning team: Platform Engineering long-term. Party MDM squad builds it.
10. Jira project: Create project key PARTY in Jira.
```

Add these answers to the bottom of `service-brief.md` under a new section:

```markdown
## Answers to open questions
1. **Golden record:** This service IS the golden record. All writes here first.
   BSS/CRM/billing are consumers.
2. **Migration:** Party IDs not unique today. Deduplication in Phase 2.
3. **TMForum version:** TMF632 v5 target. v4 acceptable initially.
4. **UI scope:** Internal ops tool. Customer service, compliance officers,
   data stewards.
5. **Consent scope:** GDPR Art. 6 + Art. 9. Marketing consent managed elsewhere.
6. **National IDs:** NO: personnummer 11 digits, D-number 11 digits.
   SE: personnummer 10 digits. FI: henkilotunnus 11 chars.
7. **SLA:** 99.9% availability. RTO 4h. RPO 1h.
8. **Kafka consumers:** BSS and CRM have no consumers yet. Each team's
   responsibility to build.
9. **Owning team:** Platform Engineering long-term. Party MDM squad initial build.
10. **Jira project:** Create project PARTY. Use ECAI Confluence space.
```

Save the file (`Ctrl+S`).

### 3.4 Commit

```powershell
git add service-brief.md
git commit -m "docs: add service brief for Party Information Management

Created by /draft-brief command with open questions answered.
Status: ready for capability analysis."
git push origin main
```

**Checkpoint:** `service-brief.md` is committed. If you close VS Code
right now and come back tomorrow, the brief is not lost.

---

## Section 4 -- Step 2: Analyse capabilities

**What this step does:**
Reads `service-brief.md` and produces a reasoned capability map --
what needs to be built, in what order, and why. Saves it as
`capability-analysis.md`.

**How long:** 3-5 minutes.

**Why this step matters:**
Most teams jump from brief to Jira backlog and create tasks named
after technical components. This step forces explicit sequencing
decisions with business reasoning before any ticket is created.

### 4.1 Run the command

In Copilot Chat Agent mode, type:

```
/analyse-capabilities
```

**What to expect:**
- Copilot reads `service-brief.md`
- Produces 6-8 capability areas in dependency order
- Explains why each capability must come before the next
- Identifies risks and cross-team dependencies
- Creates `capability-analysis.md` in the project root

**Check it worked:**
```powershell
Test-Path "capability-analysis.md"   # Should return True
```

### 4.2 Review the output

Open `capability-analysis.md`. Check:

```
[ ] Are all 8 capability areas present?
[ ] Does the sequence make sense? (Foundation before API, API before audit,
    audit before consent -- NOT audit last)
[ ] Are the risks specific and owned by real teams?
[ ] Are the cross-team dependencies complete?
```

If something is wrong or missing -- edit `capability-analysis.md`
directly. The AI produced a first draft. You own the content.

### 4.3 Update the status

In `capability-analysis.md`, find the Status section and check the first box:

```markdown
## Status
- [x] Drafted (AI)
- [ ] Reviewed with Architect
- [ ] Reviewed with Delivery Manager
- [ ] Sequence agreed -- ready for /draft-epics
```

### 4.4 Commit

```powershell
git add capability-analysis.md
git commit -m "docs: add capability analysis for Party Information Management

8 capabilities in delivery order.
Status: Drafted -- pending architect and DM review."
git push origin main
```

**Checkpoint:** `capability-analysis.md` is committed. Share this file
with your architect and delivery manager. Update the Decision log and
status checkboxes after the review meeting.

---

## Section 5 -- Step 3: Create Jira epics

**What this step does:**
Reads `capability-analysis.md` and creates 8 Jira epics with business
value statements -- not technical task names.

**How long:** 5-8 minutes.
**Requires:** Jira MCP connected, project key confirmed.

### 5.1 Verify your Jira project key

```
# In Copilot Chat:
@jira-mcp list projects I have access to
```

Note your project key. For this tutorial we use `PARTY`.

### 5.2 Run the command

In Copilot Chat Agent mode, type:

```
/draft-epics PARTY
```

**What to expect:**
- Copilot reads `capability-analysis.md`
- Shows you all 8 epics for review BEFORE creating anything
- Waits for your approval
- On approval: creates each epic in Jira one by one
- Saves `epics.md` to the project root

**Review the proposed epics carefully.** Check:
```
[ ] Each epic title is a business outcome, not a task name
    Good: "Party records can be searched and managed via a single API"
    Bad:  "Implement TMF632 CRUD endpoints"
[ ] Epics are in the same order as the capability analysis
[ ] Each epic has a clear done definition
```

When satisfied, type: `Yes, create these epics`

### 5.3 Verify in Jira

Open Jira and navigate to your project. You should see 8 epics.
Note the epic keys (e.g. PARTY-1 through PARTY-8).

### 5.4 Commit

```powershell
git add epics.md
git commit -m "docs: add epic register -- 8 epics created in Jira PARTY project"
git push origin main
```

---

## Section 6 -- Step 4: Create stories for Epic 1

**What this step does:**
Decomposes the first epic (Foundation) into sprint-sized stories
with Given/When/Then acceptance criteria. Creates them in Jira.

**How long:** 5-8 minutes.

**Important:** Only decompose the epic you are about to work on.
Never decompose all epics upfront -- requirements will change.

### 6.1 Run the command

Replace `PARTY-1` with your actual first epic key:

```
/draft-stories PARTY-1
```

**What to expect:**
- Copilot reads the epic from Jira
- Reads `.ai/project/` files for architectural context
- Proposes 4-6 stories in dependency order
- Each story has Given/When/Then ACs
- Waits for your approval before creating

**Review the proposed stories.** Check:
```
[ ] Each story is sprint-sized (1-5 points, completable in one sprint)
[ ] ACs are verifiable (each Then clause is testable)
[ ] Stories are sequenced by dependency
[ ] Auth AC present on every API-related story
```

When satisfied, type: `Yes, create these stories`

### 6.2 Verify in Jira

Open Jira. Navigate to your first epic. You should see 4-6 stories
linked to it, each with full acceptance criteria.

### 6.3 Commit

```powershell
git add stories-PARTY-1.md
git commit -m "docs: add stories for PARTY-1 foundation epic"
git push origin main
```

---

## Section 7 -- Step 5: Write a technical spec

**What this step does:**
Reads a Jira story and generates a full technical specification in
Confluence. The spec must be approved (Gate C01) before code generation.

**How long:** 5-8 minutes.
**Requires:** Confluence MCP connected to ECAI space.

### 7.1 Run the command

Replace `PARTY-2` with your first story key (the local dev setup story):

```
/write-spec PARTY-2
```

**What to expect:**
- Copilot reads the story and ACs from Jira
- Checks for GDPR and security implications
- Generates a technical spec
- Creates a Confluence page in the ECAI space
- Presents Gate C01 for Tech Lead approval

**Gate C01 -- Tech Lead review:**
The spec is not approved automatically. You (as Tech Lead) must review:
```
[ ] API design matches TMForum standards
[ ] Data model changes include PII retention policy
[ ] Security considerations are complete
[ ] Spec matches the story ACs exactly
```

When satisfied, type: `APPROVED C01`

### 7.2 Verify in Confluence

Open the ECAI Confluence space. You should see a new spec page
linked in the Jira story.

---

## Section 8 -- What you have now

After completing sections 3-7, you have:

```
project root/
  service-brief.md          -- the structured idea with answered questions
  capability-analysis.md    -- 8 capabilities in reasoned delivery order
  epics.md                  -- epic register with Jira keys
  stories-PARTY-1.md        -- stories with full ACs for epic 1

Jira/
  8 epics in PARTY project
  4-6 stories under PARTY-1 with Given/When/Then ACs

Confluence (ECAI space)/
  Technical spec for first story (pending Gate C01 approval)
```

All of this was produced from one rough idea paragraph using
5 commands over 45 minutes.

---

## Section 9 -- Continuing the journey

The remaining commands follow the same pattern.
For each story in your sprint:

```
1. /write-spec [story-key]       Gate C01: Tech Lead approves spec
2. /generate-migration [story-key]  Gate C04: if DB changes needed
3. /generate-code [story-key]    Generates code from approved spec
4. /review-pr [pr-number]        Gate D01: automated peer review
5. /validate-story [story-key]   Runs ACs against test environment
```

---

## Section 10 -- Troubleshooting

### Copilot shows a command menu instead of executing

This means the model read the project context and responded
with a summary of available commands instead of running the one
you typed. Fix:

```
Type this in the chat:
"[paste your original instruction again]
Do not list commands. Execute this now and save the output to a file."
```

### MCP tool not responding

```
1. Check View > Output > MCP for error messages
2. Verify environment variables:
   .\setup-env.ps1 -Verify
3. Restart VS Code completely
4. Try again in a new Copilot Chat session
```

### File not saved after command

```
1. Check the project root: Get-ChildItem *.md
2. If missing, ask Copilot:
   "Save [file] to the project root now"
3. Commit immediately after it is saved
```

### Session closed and lost context

```
1. All artefacts are in git -- nothing is lost
2. Open a new Copilot Chat session
3. Type: "Read service-brief.md and capability-analysis.md
   and tell me where we are in the journey"
4. Copilot will orient itself from the committed files
```

---

## Section 11 -- Quick reference

| Command | What it does | Output file |
|---|---|---|
| /draft-brief | Structure rough idea into service brief | service-brief.md |
| /analyse-capabilities | Capability map with sequencing | capability-analysis.md |
| /draft-epics [key] | Create Jira epics | epics.md |
| /draft-stories [epic-key] | Create Jira stories with ACs | stories-[key].md |
| /write-spec [story-key] | Technical spec in Confluence | Gate C01 |
| /generate-code [story-key] | Code from approved spec | PR opened |
| /review-pr [number] | Automated peer review | Gate D01 |
| /validate-story [story-key] | Run ACs against test env | Story -> Done |
| /triage-bug [bug-key] | Enrich bug ticket | Jira updated |
| /explain-module [name] | Understand code before touching | Chat output |

---

## Section 12 -- Feedback

After completing this tutorial, share your feedback with the CoE:
- What worked well
- What was confusing
- What commands you wish existed
- Any errors or inaccuracies in this guide

Send feedback to: [CoE Slack channel or email]
Or raise a GitHub issue: telia-company/ai-engineering-common/issues

Your feedback improves the commons for all Telia engineering teams.

---

| Document owner | CoE Core -- E&C AI Team |
| Version | 1.0.0 |
| Created | 2026-04-29 |
| Review cadence | After each champion cohort completes the tutorial |
EOF