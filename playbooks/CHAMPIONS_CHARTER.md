# AI Engineering Commons — Champions Charter
**Telia E&C AI · April 2026**

> This document defines what a CoE champion is, what is expected of them, the house rules for the programme, and how to be effective in the role. Read this before your first champions session.

---

## Table of Contents

1. [What is a champion?](#what-is-a-champion)
2. [Why champions matter](#why-champions-matter)
3. [What is expected of you](#what-is-expected)
4. [House rules](#house-rules)
5. [What you get in return](#what-you-get)
6. [The monthly champion sync](#monthly-sync)
7. [How to raise issues and contribute](#contributing)
8. [The commons — what it is and is not](#the-commons)
9. [Frequently asked questions](#faq)
10. [Your champion checklist](#checklist)

---

## What is a champion? {#what-is-a-champion}

A champion is the AI engineering point of contact within their team. It is not a separate job — it is an additional responsibility taken on by a senior engineer or tech lead who wants to help their team work better.

Champions are the bridge between the CoE Core team and the engineering teams using the commons. They are the first person a teammate talks to when something does not work, and the first person to tell the CoE when something needs to change.

**A champion is not:**
- A trainer or instructor — they do not run workshops
- A gatekeeper — they do not approve or reject AI use
- An expert who has all the answers — they learn alongside the team
- A full-time role — it is approximately 2-3 hours per week on average

**A champion is:**
- The person who keeps the project context files current
- The person who runs `npx aec update` when a new commons version ships
- The person who feeds back to the CoE what is and is not working
- The person who helps a new teammate get set up on day 1

---

## Why champions matter {#why-champions-matter}

The commons is a shared platform. Without champions, adoption depends entirely on individual engineers discovering it on their own — which means inconsistent usage, stale project context files, and no feedback loop to improve the system.

With champions, each team has someone who:

- Keeps `.ai/project/` files accurate — which is what makes AI outputs project-specific rather than generic
- Picks up new commons versions quickly — so the whole team benefits from improvements without each engineer having to act individually
- Surfaces real friction — which is how the commons gets better over time

The quality of AI assistance a team gets is directly proportional to how well their project context files are maintained. That is the champion's most important job.

---

## What is expected of you {#what-is-expected}

### Weekly (ongoing)

**Keep project context accurate.**
The files in `.ai/project/` are the foundation of everything. If `MODULE_REGISTRY.md` lists a module that no longer exists, or `INTEGRATION_MAP.md` is missing a new integration, every agent command produces worse output. Check these files whenever the codebase changes significantly.

```
Weekly check:
  [ ] MODULE_REGISTRY.md reflects current modules (no missing, no ghost modules)
  [ ] INTEGRATION_MAP.md lists all active integrations
  [ ] TECH_DEBT_REGISTRY.md has current High severity items
  [ ] SRE_SERVICE_CONFIG.md SLO thresholds match current agreements
```

**Run `npx aec update` after commons releases.**
When CoE Core tags a new version, run this in your project and commit the result:

```powershell
npm update @telia-company/ai-engineering-common
npx aec update
git add CLAUDE.md .github/copilot-instructions.md .github/prompts/ .cursorrules
git commit -m "chore: update ai-engineering-common to v[N]"
git push
```

This ensures everyone on the team gets new and improved prompt files automatically.

### Weekly

**Attend the champion sync** (or send a delegate).
The weekly sync is 60 minutes. See [The weekly champion sync](#weekly-sync) for what to expect.

**Send a one-paragraph feedback summary to the CoE.**
What worked well this month. What was frustrating. What you wish existed. This is how the commons roadmap is built.

### When something breaks

**Diagnose before escalating.**
Most issues are one of:
- Project context files are stale — run `npx aec update`
- A tool is not toggled on in Copilot — check the tools panel
- Context window is full — start a new session
- The wrong project is open in VS Code — open the project root, not a parent folder

If you have tried the basics and it still does not work — raise a GitHub issue on `ai-engineering-common` or bring it to the monthly sync.

### When a teammate asks for help

**Help them, do not do it for them.**
The goal is for engineers to be able to run the commands themselves. Walk through it together the first time — do not just run the commands on their behalf.

**Point to the tutorial first.**
`CHAMPIONS_TUTORIAL.md` in the demo project root covers every step with troubleshooting. Send that before writing a custom explanation.

---

## House rules {#house-rules}

These apply to everyone in the champions programme — champions and CoE Core alike.

### 1. HITL gates are not optional

Every gate in `HITL_PROTOCOL.md` exists for a reason. Gates cannot be bypassed "just this once" or "because we are in a hurry". If a gate is slowing work down and it should not, raise it as feedback — do not skip it.

The HITL gates are what makes AI-assisted engineering safe at scale. Removing them removes the safety.

### 2. Project context files are shared infrastructure

`.ai/project/` files belong to the whole team, not the champion alone. When they are wrong, the whole team gets worse AI output. Keeping them accurate is a team responsibility — the champion coordinates it, but everyone contributes.

### 3. Generated content is reviewed before use

The AI generates a first draft. Engineers review it. The human is always accountable for what goes into production — not the AI. "The AI wrote it" is not an acceptable explanation for a security issue in a PR.

### 4. Feedback goes through the commons, not around it

If a command is not working well, raise a GitHub issue or bring it to the monthly sync. Do not quietly stop using the command and work around it — that hides a real problem from the CoE.

### 5. Credentials never go in git

This applies everywhere — in `.ai/project/` files, in code, in commit messages, in PR descriptions. The Secrets Scan Agent will catch it, but it is better not to commit secrets in the first place. See `SECRETS_GUIDE.md`.

### 6. Champions represent their team, not just themselves

When a champion gives feedback to the CoE, it should reflect the team's experience — not just their own. Talk to teammates before the monthly sync. Ask what is frustrating them. Bring that.

### 7. The commons is a shared platform — contributions are welcome

If your team has written a prompt or agent that would benefit other teams, contribute it. See `CONTRIBUTION_GUIDE.md` for how. The commons gets better when teams share what they have built.

---

## What you get in return {#what-you-get}

**Early access to new features.**
Champions see new commons capabilities before they are released. You get to test them and give feedback that shapes the final release.

**A direct line to CoE Core.**
Questions that would take days to route through the normal channel get answered at the monthly sync or directly by a CoE Core member.

**Recognition.**
Champions are recognised in the internal engineering newsletter and on the CoE Confluence space. Your name is in the champion register.

**Influence over the roadmap.**
The commons roadmap is built from champion feedback. If your team repeatedly struggles with something, that goes to the top of the roadmap. Champions who give specific, actionable feedback have the most influence.

**A community.**
The champion network is Telia's most active engineering community. Champions across NO, SE, and FI markets share what they are building, what is working, and what is not.

---

## The monthly champion sync {#weekly-sync}

**Cadence:** Every thursday, 60 minutes.
**Format:** Video call — all champions invited. Minutes posted to Confluence.

### Agenda

```
0:00 — 0:10   New releases and what changed (CoE Core)
0:10 — 0:30   Champion feedback round (5 min per champion — see below)
0:30 — 0:40   Open issues and blockers
0:40 — 0:50   Roadmap preview — what is coming next quarter
0:50 — 0:60   Actions and close
```

### Your 5 minutes

Each champion gets 5 minutes. Come prepared with:

1. **What worked well** this month — one specific example
2. **What was frustrating** — one specific example with steps to reproduce
3. **What your team wishes existed** — one command or capability that is missing

Vague feedback ("it could be better") is not useful. Specific feedback ("when we run `/write-spec` on stories that have external integrations, the spec does not mention DPA requirements — it should") goes directly into the backlog.

### If you cannot attend

Send a delegate or send your 3 points to the CoE Lead before the sync. Your feedback is included in the agenda even if you are not there.

---

## How to raise issues and contribute {#contributing}

### Raising issues

For any problem with a command, a prompt file, or an agent:

```
1. Check CHAMPIONS_TUTORIAL.md troubleshooting section first
2. Try to reproduce with a minimal example
3. Raise a GitHub issue on ai-engineering-common
   Title: [Command name] [brief description of problem]
   Body: Steps to reproduce, expected output, actual output
4. Label: bug (for broken behaviour) or enhancement (for missing capability)
```


### Contributing a fix or new capability

See `CONTRIBUTION_GUIDE.md` for the full process. The short version:

```
1. Fork ai-engineering-common
2. Create a branch: fix/[description] or feat/[description]
3. Follow PROMPT_LIBRARY_STANDARDS.md for any prompt file changes
4. Open a PR with self-review checklist completed
5. Two CoE Core approvals required before merge
```

The most valuable contributions come from champions who have used the commons in their team and found a gap. You do not need to be on the CoE Core team to contribute.

---

## The commons — what it is and is not {#the-commons}

### What it is

The commons is a shared engineering framework — a set of prompt files, agent skill files, project context templates, and a CLI — that gives every Telia engineering team access to the same AI-assisted engineering capabilities.

It lives at `github.com/telia-company/ai-engineering-common` and is installed via:

```powershell
npm install @telia-company/ai-engineering-common
npx aec init
```

It is open to contributions from any Telia engineer.

### What it is not

**Not a replacement for engineering judgement.**
The commons generates first drafts. Engineers review, correct, and are accountable for everything that goes into production.

**Not a way to skip the SDLC.**
The commons makes the SDLC faster, not shorter. Gates still happen. Reviews still happen. The difference is that the mechanical parts (spec generation, code generation, test generation, review checklisting) are handled by agents — freeing engineers to focus on the decisions only humans can make.

**Not a product that is "done".**
The commons is a living platform. It improves from champion feedback. Every release adds new capabilities and fixes known gaps. Staying current with `npm update` matters.

**Not a company policy.**
Using the commons is not mandated. Teams adopt it because it makes their work faster and higher quality — not because they have to. Champions help their teams see the value; they do not enforce adoption.

---

## Frequently asked questions {#faq}

**Q: I am not the most senior engineer on my team. Can I still be a champion?**

Yes. Champions are selected based on enthusiasm and willingness to help teammates — not seniority. Many of the most effective champions are mid-level engineers who have tried every command and know exactly where the friction is.

**Q: How much time does it actually take?**

Approximately 2-3 hours per week when the commons is being actively adopted by the team. After initial adoption, it drops to about 1 hour per week — mostly keeping project files current and attending the monthly sync.

**Q: My team uses Cursor, not Copilot. Does the commons work?**

Yes. The commons generates `.cursorrules` as well as `copilot-instructions.md`. See `CURSOR_SETUP.md` in the playbooks. Note that Cursor MCP support may be restricted by company policy — check with IT department.

**Q: What if my team does not want to use the commons?**

Do not force it. Start with one willing engineer and one use case — bug triage or spec generation tend to have the highest immediate impact. Let the results speak. Adoption follows demonstrated value.

**Q: A command produced wrong output. Should I raise a bug?**

First check: are the `.ai/project/` files accurate and committed? Most "wrong output" issues are caused by stale or empty project context files. If the files are correct and the output is still wrong — yes, raise a bug on GitHub.

**Q: Can I modify the prompt files for my team?**

You can override prompt files by committing a local version to `.github/prompts/` in your project. Local files take precedence over the commons version. However — if your change would benefit all teams, please contribute it back via a PR to the commons rather than keeping it local.

**Q: What is the difference between a champion and a CoE Core member?**

CoE Core members maintain the commons itself — they write and review the agent skill files, manage releases, and run the champion programme. Champions are embedded in engineering teams and focus on adoption and feedback. Champions become CoE Core contributors by submitting PRs to the commons.

---

## Your champion checklist {#checklist}

Complete this before next champions session:

### Setup

```
[ ] Commons demo project cloned and opened in VS Code
    git clone https://github.com/telia-company/ai-engineering-commons-demo
    code ai-engineering-commons-demo

[ ] Copilot Chat tools configured (User Settings JSON):
    "github.copilot.chat.agent.fileEditing": true
    "github.copilot.chat.agent.runTasks": true
    "github.copilot.chat.agent.defaultTools": [
        "edit", "execute", "read", "search",
        "confluence-mcp", "jira-mcp", "io.github.github/github-mcp-server"
    ]

[ ] Workspace trust confirmed -- demo project folder in bold under Trusted Folders
    Ctrl+Shift+P → Workspaces: Manage Workspace Trust

[ ] .env created and credentials set
    cd ai-engineering-commons-demo
    .\setup-env.ps1 -SetPermanent
    .\setup-env.ps1 -Verify   (all green)

[ ] Jira MCP verified
    In Copilot Chat Agent mode: @jira-mcp get my issues

[ ] Confluence MCP verified
    In Copilot Chat Agent mode: @confluence-mcp search for pages in space ECAI
```

### Knowledge

```
[ ] Read CHAMPIONS_TUTORIAL.md (the full tutorial, not just the quick reference)
[ ] Completed the tutorial end-to-end at least once
[ ] Read SDLC_SCENARIOS.md -- know which commands belong to which scenario
[ ] Know the 3 most common troubleshooting steps
[ ] Know how to raise a GitHub issue on ai-engineering-common
```

### Your team

```
[ ] Your team knows you are the champion
[ ] You know who the backup champion is (in case you are unavailable)
[ ] .ai/project/ files for your main project are filled in and committed
[ ] npx aec check passes (no MISSING or STUB warnings)
[ ] Your Jira project key and Confluence space key are in .ai/project/JIRA_CONFIG.md
```

---

*Champions Charter v1.0 · Telia E&C AI · April 2026*
*Questions: raise a GitHub issue or bring to the monthly champion sync*
