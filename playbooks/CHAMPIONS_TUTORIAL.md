# AI Engineering Commons -- Champions Tutorial
# Party Information Management: From Idea to Delivery
# Version: 1.1.0
# Created: 2026-04-29
# Author: Telia E&C AI Team

---

## Welcome

This tutorial walks you through the complete AI-assisted engineering
journey for the Telia Party Information Management system -- from a
rough idea to Jira epics and stories with full acceptance criteria.

You will use GitHub Copilot Agent Mode in VS Code with the AI Engineering
Commons framework. Every step produces a real output saved to your project
and committed to git so nothing is ever lost between sessions.

**Time required:** 45-60 minutes.
**Complete section 1 before starting section 2.**

---

## Section 1 -- Setup checklist

### 1.1 Software

```
[ ] VS Code 1.99 or later -- Help > About > Version
[ ] GitHub Copilot extension installed and signed in
    Check: Copilot icon in VS Code status bar (bottom)
[ ] GitHub Copilot Chat extension installed
```

### 1.2 Access

```
[ ] GitHub Copilot licence active (Business or Enterprise)
[ ] Jira access -- note your project key
[ ] Confluence access to the ECAI space
    https://itwiki.atlassian.teliacompany.net/spaces/ECAI
```

### 1.3 Clone the demo project

```powershell
git clone https://github.com/telia-company/ai-engineering-commons-demo.git
cd ai-engineering-commons-demo
code .
```

### 1.4 Verify Jira MCP is connected

```
1. Open Copilot Chat: Ctrl+Alt+I
2. Switch to Agent mode (dropdown at top of chat panel)
3. Type: @jira-mcp get my issues
4. Expected: your Jira issues appear
```

### 1.5 Verify Confluence MCP is connected

```
1. In Copilot Chat Agent mode:
   @confluence-mcp search for pages in space ECAI
2. Expected: pages from the ECAI space appear
```

Both must work before proceeding.

---

## Two things to know before you start

### Thing 1: Copilot shows a capabilities menu at the start of each session

When you open a new Copilot Chat session and run a command, Copilot
may first show a menu listing available commands. This is normal.

**When you see the menu -- do not start over.** Type in the same session:

```
Execute the command I just triggered. Create the file now.
```

The menu only appears once per session. All subsequent commands
in the same session execute directly.

### Thing 2: You must click Accept to save files

When Copilot creates a file it shows the content as a diff in the
chat panel with an **Accept** button. You must click Accept for
the file to be written to disk.

If Copilot shows file content without an Accept button, type:

```
Write this file to the project root now.
```

Then click Accept when the diff appears.

---

## Section 2 -- The idea

Every journey starts with a rough idea -- not a backlog or a spec.

For this tutorial:

> We need a master data system for Telia party information.
> Parties are B2C customers, B2B businesses, and B2O operators
> across Norway, Sweden, and Finland. Currently party data is
> scattered across BSS, CRM, and billing systems with no single
> source of truth. We need TMForum-aligned APIs with full GDPR
> consent management and audit trail.
> Tech: Java backend, React frontend.

---

## Section 3 -- Step 1: Draft the service brief

**What this step does:**
Structures the rough idea into a formal service brief with scope,
constraints, and open questions. Saves as `service-brief.md`.

**How long:** 5 minutes.

### 3.1 Open a new session

```
1. Copilot Chat: Ctrl+Alt+I
2. Click + for a new session
3. Select Agent mode
4. Click tools icon (two wrenches) -- verify jira-mcp and
   confluence-mcp are Running
5. If you see "Start it now?" for other MCPs -- click Skip
```

### 3.2 Run the command

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

### 3.3 If you see a capabilities menu

Type in the same session:

```
Execute the /draft-brief command now using the input I provided.
Create service-brief.md in the project root.
```

### 3.4 Accept the file

Click **Accept** when the `service-brief.md` diff appears.

If no Accept button appears:
```
Write service-brief.md to the project root now.
```

### 3.5 Verify

```powershell
Test-Path "service-brief.md"    # Must return: True
(Get-Content "service-brief.md").Count    # Must be 40+
```

### 3.6 Answer the open questions

Open `service-brief.md` and add this section at the bottom:

```markdown
## Answers to open questions

1. **Golden record:** This service IS the golden record.
   BSS, CRM, and billing read from here. They do not write here.

2. **Migration:** Party IDs not unique today. Deduplication is Phase 2.
   Phase 1 handles net-new parties only.

3. **TMForum version:** TMF632 v5 target. v4 acceptable initially.

4. **UI scope:** Internal ops tool for Telia staff.
   Customer service agents, compliance officers, data stewards.

5. **Consent scope:** GDPR Art. 6 + Art. 9.
   Marketing consent managed by a separate platform.

6. **National IDs:**
   NO: personnummer 11 digits, D-number 11 digits
   SE: personnummer 10 digits
   FI: henkilotunnus 11 chars (HETU)

7. **SLA:** 99.9% availability. RTO 4h. RPO 1h.

8. **Kafka consumers:** BSS and CRM have no consumers yet.
   Each team builds their own consumer.

9. **Owning team:** Platform Engineering long-term.
   Party MDM squad delivers initial build.

10. **Jira project:** Create project key PARTY.
    Use ECAI Confluence space for specs and ADRs.
```

Save: Ctrl+S

### 3.7 Commit

```powershell
git add service-brief.md
git commit -m "docs: service brief for Party Information Management"
git push origin main
```

**Checkpoint:** Brief is in git. Safe to close VS Code.

---

## Section 4 -- Step 2: Analyse capabilities

**What this step does:**
Reads `service-brief.md` and produces a reasoned capability map --
what to build, in what order, and why. Saves as `capability-analysis.md`.

**How long:** 5 minutes.

### 4.1 Run the command

```
/analyse-capabilities
```

If you see the capabilities menu first:

```
Execute /analyse-capabilities now. Read service-brief.md
and create capability-analysis.md in the project root.
```

### 4.2 Accept the file

Click **Accept** when the `capability-analysis.md` diff appears.

### 4.3 Verify

```powershell
Test-Path "capability-analysis.md"    # Must return: True
```

### 4.4 Review the output

Open `capability-analysis.md` and check:

```
[ ] 6-8 capability areas in dependency order
[ ] Audit trail is NOT last -- it must precede consent management
[ ] React UI is last -- it does not block any system integration
[ ] Risks table has real owners
[ ] Cross-team dependency table is complete
```

Edit the file directly if anything needs correcting.

### 4.5 Update status and commit

In `capability-analysis.md`, check the first status box:

```markdown
## Status
- [x] Drafted (AI)
- [ ] Reviewed with Architect
- [ ] Reviewed with Delivery Manager
- [ ] Sequence agreed -- ready for /draft-epics
```

```powershell
git add capability-analysis.md
git commit -m "docs: capability analysis for Party Information Management"
git push origin main
```

**Checkpoint:** Share `capability-analysis.md` with your architect
and DM. After the review meeting, update the Decision log and
check the remaining status boxes. Only then run `/draft-epics`.

---

## Section 5 -- Step 3: Create Jira epics

**What this step does:**
Creates Jira epics with business outcome statements from the
agreed capability analysis.

**How long:** 5-8 minutes.

### 5.1 Find your project key

```
@jira-mcp list projects I have access to
```

### 5.2 Run the command

```
/draft-epics PARTY
```

Replace PARTY with your actual project key.

### 5.3 Review the proposed epics

Copilot shows all epics before creating anything. Check:

```
[ ] Titles are business outcomes, not technical tasks
    GOOD: "Party records can be searched via a single API"
    BAD:  "Implement TMF632 CRUD"
[ ] Order matches the capability analysis sequence
[ ] Each epic has a clear done definition
```

When ready:
```
Yes, create these epics in Jira.
```

### 5.4 Verify and commit

Open Jira -- you should see 8 epics. Note the epic keys.

```powershell
git add epics.md
git commit -m "docs: epic register -- epics created in Jira"
git push origin main
```

---

## Section 6 -- Step 4: Create stories for Epic 1

**What this step does:**
Decomposes the first epic into sprint-sized stories with
Given/When/Then ACs. Creates them in Jira.

**How long:** 5-8 minutes.

**Rule:** Only decompose the epic you are about to start.
Never decompose all epics upfront.

### 6.1 Run the command

```
/draft-stories PARTY-1
```

Replace PARTY-1 with your actual first epic key.

### 6.2 Review the proposed stories

```
[ ] Each story is completable in one sprint (1-5 points)
[ ] Each story has a happy path AC, an error AC, and an auth AC
[ ] Stories are sequenced by dependency
    (database migration story always before API story)
```

When ready:
```
Yes, create these stories in Jira.
```

### 6.3 Verify and commit

Open Jira. Navigate to Epic 1. You should see 4-6 stories
with full Given/When/Then ACs.

```powershell
git add stories-PARTY-1.md
git commit -m "docs: stories for PARTY-1 foundation epic"
git push origin main
```

---

## Section 7 -- Step 5: Write a technical spec

**What this step does:**
Generates a technical specification in Confluence from a Jira story.
The spec must be approved (Gate C01) before any code is generated.

**How long:** 5-8 minutes.

### 7.1 Run the command

```
/write-spec PARTY-2
```

Replace PARTY-2 with your first story key.

### 7.2 Gate C01 -- Tech Lead review

Review the spec Copilot created in Confluence:

```
[ ] API design matches TMForum naming conventions
[ ] Personal data fields have documented GDPR lawful basis
[ ] Security section is complete
[ ] All story ACs are reflected in the spec
```

When satisfied:
```
APPROVED C01
```

### 7.3 Verify

Open the ECAI Confluence space -- a new spec page should exist.
The Jira story should link to it.

---

## Section 8 -- What you have produced

```
Git:
  service-brief.md        structured idea + answered questions
  capability-analysis.md  8 capabilities in delivery order
  epics.md                epic register with Jira keys
  stories-PARTY-1.md      stories with full AC detail

Jira:
  8 epics with business outcome statements
  4-6 stories under Epic 1 with Given/When/Then ACs

Confluence (ECAI):
  Technical spec for first story (Gate C01 approved)
```

All from one rough idea paragraph. Five commands. 45 minutes.

---

## Section 9 -- Recovering from a closed session

All artefacts are in git. Nothing is lost.

In a new session type:

```
Read service-brief.md and capability-analysis.md from the project root.
Tell me where we are in the delivery journey and what the next step is.
```

Copilot reads the files and orients itself immediately.

---

## Section 10 -- Continuing the journey

For each story in your sprint:

```
/write-spec [story-key]          Spec in Confluence (Gate C01)
/generate-migration [story-key]  DB migration (Gate C04, if needed)
/generate-code [story-key]       Code from approved spec
/review-pr [pr-number]           Automated peer review (Gate D01)
/validate-story [story-key]      AC execution -- story to Done
```

---

## Section 11 -- Troubleshooting

| Problem | Fix |
|---|---|
| Copilot shows capabilities menu | Type: "Execute the command I just triggered. Create the file now." |
| File shown in chat but not saved | Click Accept, or type: "Write this file to the project root now." |
| MCP not responding | View > Output > MCP for errors. Restart VS Code. |
| Session closed, context lost | Open new session. Type: "Read service-brief.md and tell me where we are." |
| Wrong Confluence space | Check .vscode/mcp.json -- confluence-mcp URL |

---

## Section 12 -- Quick reference

| Command | Output |
|---|---|
| /draft-brief | service-brief.md |
| /analyse-capabilities | capability-analysis.md |
| /draft-epics [key] | epics.md + Jira epics |
| /draft-stories [key] | stories-[key].md + Jira stories |
| /write-spec [key] | Confluence spec page |
| /generate-code [key] | Code PR |
| /review-pr [number] | PR review comment |
| /validate-story [key] | Story status updated |
| /triage-bug [key] | Jira bug enriched |
| /explain-module [name] | Module analysis in chat |

---

## Section 13 -- Feedback

After completing this tutorial please share:
- What worked smoothly
- What needed extra steps not in this guide
- Commands you wish existed

Send to: [CoE Slack channel]
Or raise a GitHub issue: telia-company/ai-engineering-common/issues

---

| Owner | CoE Core -- E&C AI Team |
| Version | 1.1.0 -- updated from live testing 2026-04-29 |
| Next review | After first champion cohort completes tutorial |

---

## Appendix A -- If Copilot cannot write files

Some GitHub Copilot Enterprise configurations restrict agents from
writing files directly. If you see the message:

> "I don't have a file-write tool available in this session"

This means your organisation's Copilot policy restricts file editing
in Agent mode. The commands still work -- Copilot generates the correct
content -- but you must save the files manually.

### How to save manually

When Copilot produces file content in the chat:

1. In VS Code Explorer, right-click the project root
2. Select "New File"
3. Type the filename (e.g. `service-brief.md`)
4. Open the file
5. Copy the content block from the Copilot chat
6. Paste into the file
7. Save: Ctrl+S
8. Commit immediately:

```powershell
git add [filename]
git commit -m "docs: [description]"
git push origin main
```

### Why committing immediately matters

Copilot reads your project files via the git index. Files that exist
on disk but are not committed are invisible to Copilot's search.
Always commit new files immediately so the next command can find them.

### Asking your GitHub admin to enable file writing

If you want Copilot to write files automatically, ask your GitHub
Enterprise admin to check:

```
Organisation Settings > Copilot > Policies > Agent file editing
```

This is a per-organisation setting. If enabled, Copilot will write
files directly without manual copy-paste.

### The manual save workflow

With file-write restricted, the flow for each step becomes:

```
1. Run /draft-brief [idea]
2. Copilot generates content in chat
3. You create the file manually and paste the content
4. Commit the file
5. Run /analyse-capabilities
6. Repeat
```

This adds about 2 minutes per step. The content quality is identical --
only the file creation is manual.

---

## Appendix B -- VS Code configuration for file writing

For Copilot Agent mode to write files directly to your project,
three things must be configured. Verify all three before starting
the tutorial.

### B.1 User Settings JSON (Ctrl+Shift+P → Open User Settings JSON)

Add these two lines inside the root JSON object:

```json
"github.copilot.chat.agent.fileEditing": true,
"github.copilot.chat.agent.runTasks": true
```

These settings allow Copilot Agent to create and edit files in your
workspace and run terminal tasks (tests, builds etc.).

### B.2 Workspace trust

The demo project folder must be trusted:

```
Ctrl+Shift+P → Workspaces: Manage Workspace Trust
```

Verify the demo project path appears in bold under
"Trusted Folders & Workspaces". If it does not appear,
click "Add Folder" and add the demo project root.

### B.3 Copilot Chat version

Version 0.45.1 or later is required for reliable agent file writing.

```
Ctrl+Shift+X → search "GitHub Copilot Chat" → check Version field
```

If older than 0.45.1 -- click the update button.

### B.4 Verify all three are correct

After confirming all three, close VS Code completely and reopen
the demo project. This ensures the settings are fully applied
before starting the tutorial.

### B.5 If file writing still fails after all three are set

Some GitHub Copilot Enterprise organisation policies restrict
agent file editing regardless of user settings. If you see:

> "I don't have a file-write tool available in this session"

Contact your GitHub Enterprise admin and ask them to check:
```
Organisation Settings > Copilot > Policies > Agent capabilities
```

In the meantime, use the manual save workflow from Appendix A.
