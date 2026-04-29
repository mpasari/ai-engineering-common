# AI Engineering Commons -- Champions Tutorial
# Party Information Management: From Idea to Delivery
# Version: 1.2.0
# Created: 2026-04-29
# Author: Telia E&C AI Team

---

## Welcome

This tutorial walks you through the complete AI-assisted engineering
journey for the Telia Party Information Management system -- from a
rough idea to Jira epics and stories with full acceptance criteria.

**Time required:** 45-60 minutes.
**Complete section 1 before starting.**

---

## Section 1 -- Setup checklist

### 1.1 Software

```
[ ] VS Code 1.99 or later
    Check: Help > About > Version

[ ] GitHub Copilot Chat extension v0.45.1 or later
    Check: Extensions (Ctrl+Shift+X) > GitHub Copilot Chat > Version

[ ] Node.js 18 or later
    Check: node --version in terminal
```

### 1.2 VS Code settings (required for file writing)

Open VS Code User Settings JSON (`Ctrl+Shift+P` → Open User Settings JSON)
and verify these two lines exist:

```json
"github.copilot.chat.agent.fileEditing": true,
"github.copilot.chat.agent.runTasks": true
```

If they are missing -- add them and restart VS Code.

### 1.3 Workspace trust

```
Ctrl+Shift+P → Workspaces: Manage Workspace Trust
```

The demo project folder must appear in **bold** under Trusted Folders.
If not -- click Add Folder and add the project root.

### 1.4 Access

```
[ ] GitHub Copilot licence active (Business or Enterprise)
[ ] Jira access to project SPOCKT
    URL: https://jira.atlassian.teliacompany.net/projects/SPOCKT
[ ] Confluence access to ECAI space
    URL: https://itwiki.atlassian.teliacompany.net/spaces/ECAI
```

### 1.5 Clone the demo project

```powershell
git clone https://github.com/telia-company/ai-engineering-commons-demo.git
cd ai-engineering-commons-demo
code .
```

### 1.6 Verify Jira MCP

```
1. Open Copilot Chat: Ctrl+Alt+I
2. Switch to Agent mode
3. Click tools icon (two wrenches) -- verify jira-mcp is toggled ON
4. Type: @jira-mcp get my issues
5. Expected: your Jira issues appear
```

### 1.7 Verify Confluence MCP

```
1. In Copilot Chat Agent mode:
   @confluence-mcp search for pages in space ECAI
2. Expected: pages from ECAI space appear
```

Both must work before proceeding.

---

## Two things to know before you start

### Thing 1: Copilot may show a capabilities menu at session start

When you open a new Copilot Chat session and run a command, Copilot
may first show a menu. Type in the same session:

```
Execute the command I just triggered. Create the file now.
```

The menu only appears once per session.

### Thing 2: Copilot may not write files automatically

If your organisation's Copilot policy restricts file writing, Copilot
will show the file content in the chat but not save it to disk.

When this happens:
1. Right-click the project root in VS Code Explorer
2. Select "New File"
3. Name it exactly as instructed (e.g. `service-brief.md`)
4. Copy the content from the chat
5. Paste into the file and save (`Ctrl+S`)
6. **Commit immediately** -- Copilot reads committed files only

This adds 2 minutes per step. See Appendix A for full details.

---

## Section 2 -- The idea

```
We need a master data system for Telia party information.
Parties are B2C customers, B2B businesses, and B2O operators
across Norway, Sweden, and Finland. Currently party data is
scattered across BSS, CRM, and billing systems with no single
source of truth. We need TMForum-aligned APIs with full GDPR
consent management and audit trail.
Tech: Java backend, React frontend.
```

---

## Section 3 -- Step 1: Draft the service brief

**Output:** `service-brief.md`
**Time:** 5 minutes

### 3.1 Open a new session

```
1. Copilot Chat: Ctrl+Alt+I
2. Click + for a new session
3. Select Agent mode
4. Click tools icon -- skip any "Start it now?" prompts
   except jira-mcp and confluence-mcp
5. Check context window (hover over bottom bar) -- must be under 10%
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

If you see a capabilities menu first:
```
Execute the /draft-brief command now. Create service-brief.md.
```

### 3.3 Save the file

If Copilot wrote the file automatically -- verify:
```powershell
Test-Path "service-brief.md"    # Must return True
```

If Copilot showed the content in chat but did not write it:
1. New File → `service-brief.md` in project root
2. Paste content → Save

### 3.4 Answer the open questions

Open `service-brief.md` and add this section at the bottom:

```markdown
## Answers to open questions

1. **Golden record:** This service IS the golden record.
   BSS, CRM, and billing read from here -- they do not write here.

2. **Migration:** Party IDs not unique today. Deduplication is Phase 2.
   Phase 1 handles net-new parties only.

3. **TMForum version:** TMF632 v5 target. v4 acceptable initially.

4. **UI scope:** Full read/write for customer service agents and data
   stewards. Read-only plus audit log for compliance officers.

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

10. **Jira/Confluence:** Jira SPOCKT (team SPOCK Common).
    Confluence space ECAI.
```

### 3.5 Commit

```powershell
git add service-brief.md
git commit -m "docs: service brief with answered open questions"
git push origin main
```

---

## Section 4 -- Step 2: Analyse capabilities

**Output:** `capability-analysis.md`
**Time:** 5 minutes

### 4.1 Run (same session)

```
/analyse-capabilities
```

### 4.2 Save the file

If not written automatically -- create `capability-analysis.md` manually
and paste the content from chat.

### 4.3 Review

```
[ ] 6-8 capability areas in dependency order
[ ] Audit trail is NOT last
[ ] React UI is last
[ ] Risks table has real owners
```

### 4.4 Update status and commit

In `capability-analysis.md` check the first status box:
```markdown
- [x] Drafted (AI)
```

```powershell
git add capability-analysis.md
git commit -m "docs: capability analysis -- 8 capabilities in delivery order"
git push origin main
```

---

## Section 5 -- Step 3: Create Jira epics

**Output:** `epics.md` + 8 Jira epics
**Time:** 5-8 minutes

### 5.1 Run (same session)

```
/draft-epics SPOCKT
```

### 5.2 Review proposed epics

Copilot shows all epics before creating. Check:
```
[ ] Titles are business outcomes not technical tasks
[ ] Order matches capability analysis sequence
[ ] Each epic has a done definition
```

Type: `Yes, create these epics`

### 5.3 Save epics.md

If not written automatically -- create `epics.md` manually.
The file must include the Journey state table:

```markdown
## Journey state

| Step | Command | Output | Done |
|---|---|---|---|
| 1 | /draft-brief | service-brief.md | x |
| 2 | /analyse-capabilities | capability-analysis.md | x |
| 3 | /draft-epics SPOCKT | epics.md + Jira epics | x |
| 4 | /draft-stories [epic-1-key] | stories-[key].md | |
| 5 | /write-spec [story-key] | Confluence spec page | |
| 6 | /generate-code [story-key] | PR opened | |
| 7 | /review-pr [pr-number] | PR reviewed | |
| 8 | /validate-story [story-key] | Story -> Done | |

## Next step
/draft-stories [first-epic-key]
```

### 5.4 Commit

```powershell
git add epics.md
git commit -m "docs: epic register with journey state -- 8 epics created"
git push origin main
```

---

## Section 6 -- Step 4: Create stories for Epic 1

**Output:** `stories-[epic-key].md` + Jira stories
**Time:** 5-8 minutes

**Rule:** Only decompose the epic you are about to start.

### 6.1 Run (same session)

```
/draft-stories [first-epic-key]
```

### 6.2 Review proposed stories

```
[ ] Each story completable in one sprint (1-5 points)
[ ] Happy path AC + error AC + auth AC per story
[ ] Specific assertions (not "then it works")
[ ] Dependency sequence noted
[ ] Parallel opportunities flagged
```

Type: `Yes, create these stories`

### 6.3 Save stories file

If not written automatically -- create `stories-[epic-key].md` manually.

### 6.4 Verify epics.md is updated

Open `epics.md`. The Journey state table should show step 4 marked done
and the Next step updated. If not -- update it manually.

### 6.5 Commit

```powershell
git add stories-[epic-key].md epics.md
git commit -m "docs: stories for [epic-key] -- journey step 4 complete"
git push origin main
```

---

## Section 7 -- Step 5: Write a technical spec

**Output:** Confluence page in ECAI space
**Time:** 5-8 minutes

### 7.1 Run (same session)

Use the first story key (no dependencies -- the foundation story):

```
/write-spec [first-story-key]
```

### 7.2 Gate C01 -- Tech Lead review

Copilot creates the spec in Confluence and presents Gate C01.

Review:
```
[ ] API design matches TMForum naming
[ ] PII fields have GDPR lawful basis documented
[ ] Security section complete
[ ] All story ACs reflected in spec
```

Type: `APPROVED C01`

### 7.3 Update journey state

Open `epics.md`. Mark step 5 done. Update Next step to:
`/generate-code [story-key]`

Commit:
```powershell
git add epics.md
git commit -m "docs: spec approved for [story-key] -- journey step 5 complete"
git push origin main
```

---

## Section 8 -- What you have produced

```
Git:
  service-brief.md           structured idea + answered questions
  capability-analysis.md     8 capabilities in delivery order
  epics.md                   epic register with live journey state
  stories-[epic-key].md      stories with Given/When/Then ACs

Jira (SPOCKT):
  8 stories-as-epics with business outcome statements
  5 stories under Epic 1 with production-quality ACs
  Team: SPOCK Common on all created issues

Confluence (ECAI):
  Technical spec for first story (Gate C01 approved)
```

---

## Section 9 -- Recovering from a closed session

All artefacts are in git. In a new session:

```
Read epics.md and tell me where we are in the journey
and what the next command to run is.
```

Copilot reads `epics.md`, finds the journey state table,
and tells you exactly what to do next.

---

## Section 10 -- Continuing the journey

For each story:

```
/write-spec [story-key]          Spec (Gate C01)
/generate-migration [story-key]  DB migration (Gate C04 if needed)
/generate-code [story-key]       Code from approved spec
/review-pr [pr-number]           Peer review (Gate D01)
/validate-story [story-key]      AC execution -- story to Done
```

Update `epics.md` Journey state after each step.

---

## Section 11 -- Troubleshooting

| Problem | Fix |
|---|---|
| Capabilities menu appears | Type: "Execute the command I just triggered. Create the file now." |
| File not saved | Create manually, paste content, save, commit immediately |
| Context window above 50% | Start a new Copilot Chat session (+ button) |
| Copilot cannot find service-brief.md | Commit the file first -- Copilot reads git index only |
| Jira field error on creation | Check .ai/project/JIRA_CONFIG.md has correct field IDs |
| MCP not responding | View > Output > MCP. Restart VS Code. |
| Session closed | New session. Type: "Read epics.md and tell me where we are." |

---

## Section 12 -- Quick reference

| Command | Output | Auto-updates epics.md |
|---|---|---|
| /draft-brief | service-brief.md | No -- step 1 |
| /analyse-capabilities | capability-analysis.md | No -- step 2 |
| /draft-epics [key] | epics.md + Jira epics | Yes -- step 3 |
| /draft-stories [key] | stories-[key].md + Jira stories | Yes -- step 4 |
| /write-spec [key] | Confluence spec | Manual -- step 5 |
| /generate-code [key] | PR | Manual -- step 6 |
| /review-pr [number] | PR review | Manual -- step 7 |
| /validate-story [key] | Story done | Manual -- step 8 |

---

## Section 13 -- Feedback

Send to: [CoE Slack channel]
GitHub issues: telia-company/ai-engineering-common/issues

---

## Appendix A -- Manual file saving

When Copilot cannot write files automatically:

1. Right-click project root in VS Code Explorer
2. New File → name it exactly (e.g. `service-brief.md`)
3. Copy content from Copilot chat
4. Paste and save (`Ctrl+S`)
5. Commit immediately:
   ```powershell
   git add [filename]
   git commit -m "docs: [description]"
   git push origin main
   ```

**Why commit immediately:** Copilot reads project files via git index.
Uncommitted files are invisible to subsequent commands.

---

## Appendix B -- VS Code configuration for file writing

Three settings required for Copilot to write files automatically:

### B.1 User Settings JSON

`Ctrl+Shift+P` → Open User Settings JSON. Add:

```json
"github.copilot.chat.agent.fileEditing": true,
"github.copilot.chat.agent.runTasks": true
```

### B.2 Workspace trust

`Ctrl+Shift+P` → Workspaces: Manage Workspace Trust

Demo project folder must appear in **bold** under Trusted Folders.

### B.3 Copilot Chat version

Extensions → GitHub Copilot Chat → must be version 0.45.1 or later.

### B.4 If file writing still fails

Your GitHub Enterprise admin may need to enable agent capabilities:
```
Organisation Settings > Copilot > Policies > Agent capabilities
```

---

## Appendix C -- SPOCKT Jira field reference

These values are pre-configured in `.ai/project/JIRA_CONFIG.md`.
Agents read them automatically -- you do not need to specify them.

| Field | ID | Value for demos |
|---|---|---|
| Development Team | customfield_12725 | SPOCK Common |
| Story points | customfield_10016 | Set during refinement |
| Epic link | customfield_10014 | Set by /draft-stories |

Valid Development Team values:
`None`, `SPOCK Samurai`, `SPOCK Athena`, `SPOCK Product Mgmt`,
`SPOCK Common`, `SPOCK DevOps`

---

| Owner | CoE Core -- E&C AI Team |
| Version | 1.2.0 -- updated from live testing 2026-04-29 |
| Next review | After first champion cohort completes tutorial |
