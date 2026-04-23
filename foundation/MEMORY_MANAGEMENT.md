# MEMORY_MANAGEMENT.md
# AI Engineering Commons -- Agent Memory Management
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Purpose

This file defines how agents in the ai-engineering-commons system store,
retrieve, and expire context across sessions, tasks, and agent boundaries.
AI agents have no persistent memory between sessions by default -- this
file defines the structured workarounds that give the system the appearance
and behaviour of memory without relying on any single model's context window.

Referenced by:
- `MULTI_AGENT_SETUP.md` section 9 -- context management across agents
- `AGENT_HANDOVER.md` section 6 -- where handover packages are stored
- All agent skill files -- each declares which memory tiers it uses
- `agents/ORCHESTRATOR_AGENT.md` -- manages memory across long tasks

---

## 2. The four-tier memory model

Agent memory is organised into four tiers based on scope, persistence,
and access speed. Agents choose the appropriate tier based on how long
the information needs to persist and who needs to access it.

```
Tier 1 -- In-context (session)
  Scope:       Current agent session only
  Persistence: Lost when session ends
  Capacity:    Up to context window limit (see CONTEXT_WINDOW_STRATEGY.md)
  Access:      Immediate -- no retrieval step
  Use for:     Active task state, current file content, reasoning in progress

Tier 2 -- Task state (Jira + GitHub)
  Scope:       Single task or PR lifecycle
  Persistence: Until ticket or PR is closed
  Capacity:    Unlimited (stored externally)
  Access:      T-JIRA-01 or T-GIT-04 (read), T-JIRA-05 or T-GIT-05 (write)
  Use for:     Handover packages, HITL gate state, intermediate outputs

Tier 3 -- Project knowledge (Confluence)
  Scope:       Project team and all agents
  Persistence: Until page is archived or deleted
  Capacity:    Unlimited
  Access:      T-CONF-01 or T-CONF-04 (read), T-CONF-02 or T-CONF-03 (write)
  Use for:     Specs, architecture, runbooks, KEDB, decisions

Tier 4 -- Commons knowledge (ai-engineering-common repo)
  Scope:       All teams and all agents across the organisation
  Persistence: Version-controlled -- permanent until explicitly removed
  Capacity:    Unlimited
  Access:      T-GIT-01 (read), T-GIT-02 (write -- CoE only)
  Use for:     Standards, agent skill files, templates, integration guides
```

---

## 3. Tier 1 -- In-context memory

### 3.1 What lives in context

The agent's active context window contains:
- The current task description and goal
- The relevant commons files loaded for this task
- The handover package received (if resuming a task)
- Files read during this session
- Agent outputs produced so far in this session
- The conversation or instruction history

### 3.2 Context loading order

When an agent starts a task, it loads context in this order:

```
1. AGENT.md                           -- always first
2. HITL_PROTOCOL.md                   -- always second
3. Agent's own skill file             -- always third
4. Task-relevant commons files        -- as declared in skill file
5. Handover package (if resuming)     -- from Tier 2
6. Project-layer files                -- from .ai/project/
7. Task-specific files                -- read as needed during task
```

Items 1-3 are fixed. Items 4-7 are loaded selectively to stay within
context window limits. See CONTEXT_WINDOW_STRATEGY.md for selection rules.

### 3.3 Context expiry

In-context memory expires when:
- The agent session ends
- The context window is exhausted (triggers compression -- see section 3.4)
- The task is completed

### 3.4 Context compression

When the context window approaches its limit during a long task, the
agent compresses older content:

```
Compression strategy:
1. Summarise completed steps into a compact completion log
   (one line per completed action with output reference)
2. Drop detailed file content that has already been acted on
   (the file is still accessible via Tier 2/3 if needed again)
3. Keep current task state, active decisions, and open questions
4. Keep the handover package template populated with current state
5. Write a Tier 2 state snapshot before dropping any context
```

The compressed summary replaces the detailed history but preserves
all decision outcomes. The Orchestrator manages compression for
multi-agent tasks.

---

## 4. Tier 2 -- Task state memory (Jira and GitHub)

Tier 2 is the persistence layer for active tasks. It is the bridge
between agent sessions and the source of truth for task recovery.

### 4.1 Jira ticket as task state store

Every task managed by agents has a primary Jira ticket. The agent
stores state in the ticket's comments using the handover package
format from AGENT_HANDOVER.md.

**Naming convention for state comments:**

```
[AGENT STATE -- {Handover ID}]

{Full handover package content}

[END AGENT STATE]
```

The `[AGENT STATE]` and `[END AGENT STATE]` markers make state
comments programmatically identifiable. Agents search for these
markers when recovering task state from a ticket.

**State comment lifecycle:**
- Created: when an agent pauses at a HITL gate or session ends
- Updated: when the task resumes and progress is made
- Closed: when the task is complete (final state comment added with COMPLETED marker)
- Retained: for 90 days after ticket closure for audit purposes

### 4.2 GitHub PR as code state store

For tasks that produce code, the PR is a state store for the
code-level progress:

| PR state | What it signals |
|---|---|
| Draft PR | Code generation in progress -- not ready for review |
| Ready for review | Code generation complete -- agent review in progress |
| Changes requested | Human review requested changes -- agent resumes |
| Approved | Human approved -- ready to merge (HITL gate D01 passed) |
| Merged | Task complete -- triggers downstream agents |

Agents use PR labels (per GITHUB_INTEGRATION.md section 5.3) as
additional state signals that are visible without reading comments.

### 4.3 State recovery from Tier 2

When an agent session starts and receives a ticket reference without
a handover package, it recovers state by:

```
1. Read all comments on the Jira ticket
2. Find the most recent [AGENT STATE -- {ID}] comment
3. Parse the handover package from that comment
4. Verify the completed work list against actual state
   (check files exist, PRs are open, Confluence pages exist)
5. Report any discrepancies before proceeding
6. Continue from the NEXT ACTION field of the recovered package
```

---

## 5. Tier 3 -- Project knowledge memory (Confluence)

Confluence is the long-term project knowledge store. Unlike Tier 2
(task-specific, temporary), Tier 3 content is intended to persist
and be reused across many tasks.

### 5.1 What agents write to Tier 3

| Content type | When written | Owner agent | Expires |
|---|---|---|---|
| Technical spec | After spec approval | Spec Writer | When feature is deprecated |
| ADR | After Architect approval | Arch Doc | Never -- superseded not deleted |
| Architecture overview | After epic completion or monthly | Arch Doc | Never -- updated in place |
| Runbook | After service deployment | Release, Documentation | When service is decommissioned |
| KEDB workaround | After known error accepted | Problem Management | When known error resolved |
| Incident record | During incident | Incident Response | Never -- audit record |
| Post-mortem | After incident resolved | Incident Response | Never -- audit record |
| Onboarding guide | After brownfield discovery | Onboarding | When team structure changes |
| Sprint report | End of sprint | Stakeholder Report | 12 months |

### 5.2 What agents read from Tier 3

Agents read Confluence before taking action to avoid conflicts with
existing decisions. The key reads are:

| Agent | What it reads | Why |
|---|---|---|
| Spec Writer | Existing specs in the project space | Detect conflicts with existing design |
| Code Gen | Technical spec for the current story | Generate compliant code |
| Dependency Mapper | All specs mentioning the affected service | Map impact scope |
| Arch Doc | Existing architecture pages | Update without duplicating |
| Problem Management | KEDB entries | Check for duplicate known errors |
| Bug Triage | KEDB entries | Check for known error match |
| Onboarding Agent | All pages in the project space | Guide new engineer |

### 5.3 Confluence search strategy

When agents need to find relevant content, they use CQL search
(per CONFLUENCE_INTEGRATION.md section 8) rather than navigating
the page hierarchy manually. This is faster and more reliable for
large Confluence spaces.

**Preferred search pattern:**
```
type = page AND label = "{content-type-label}"
AND space = "{space-key}" AND text ~ "{search-term}"
ORDER BY lastModified DESC LIMIT 10
```

---

## 6. Tier 4 -- Commons knowledge (the repository)

The commons repository is the organisation-wide knowledge base that
all agents read for standards, patterns, and protocols.

### 6.1 What lives in Tier 4

- All foundation files (this file, AGENT.md, standards files, etc.)
- All agent skill files (agents/)
- All command prompts (commands/)
- All SDLC guides (sdlc/)
- Security standards (security/)
- CoE governance (coe/)
- Project-layer templates (templates/)

### 6.2 Commons read strategy

Agents read commons files using T-UTIL-01 (local file system) because
the commons is installed via npm and available at the local path
`node_modules/@telia-company/ai-engineering-common/` in every
consuming project.

Direct file path reads are faster and more reliable than GitHub API
reads for commons content.

```javascript
// Agents read commons files via local path
const agentFile = readFile('.ai/commons/agents/CODE_GEN_AGENT.md');
const standards = readFile('.ai/commons/foundation/CODING_STANDARDS.md');
```

### 6.3 Tier 4 is read-only for all agents except CoE

Only the CoE Core team may write to the commons repository. All
other agents are read-only consumers of Tier 4 content. Project-
specific overrides go into `.ai/project/OVERRIDES/` (Tier 2 scope)
not into the commons itself.

---

## 7. Memory patterns for common scenarios

### 7.1 Long-running epic (multiple sprints)

```
Sprint 1:
  Orchestrator starts task, loads epic context into Tier 1
  Per-story work committed to Tier 2 (Jira tickets, PRs)
  Epic-level decisions written to Tier 3 (Confluence spec)
  Session ends -- Tier 1 cleared

Sprint 2 (new session):
  Orchestrator receives epic ticket reference
  Reads Tier 2: finds last state comment, recovers handover package
  Reads Tier 3: loads approved spec and architecture pages
  Loads only current sprint's stories into Tier 1
  Continues from recovered NEXT ACTION
```

### 7.2 Interrupted code generation

```
Code Gen Agent starts generating -- Tier 1 active
Context window approaches limit at file 7 of 12
  -> Compresses completed files into summary
  -> Writes Tier 2 state: "Files 1-6 complete, file 7 incomplete"
  -> Commits completed files to feature branch (Tier 2 via GitHub)
  -> Session ends

New session:
  Code Gen Agent receives handover package from Tier 2
  Reads committed files from GitHub (Tier 2) to verify state
  Loads only files 7-12 into context
  Continues from file 7
```

### 7.3 SRE Agent signal correlation

The SRE Agent has a special memory requirement -- it needs to correlate
signals over time across observation cycles.

```
Cycle 1 (session 1):
  SRE Agent observes signal A from service X
  Signal A is below threshold -- no action
  Writes to SRE_DECISION_LOG.md: "Signal A observed, below threshold"
  Session ends

Cycle 2 (session 2, 60 seconds later):
  SRE Agent observes signal A again, now above threshold
  Reads SRE_DECISION_LOG.md: finds previous observation
  Determines: signal is trending up, not a spike
  Routes to Tier 2 action (Tier 2 -- Alertmanager webhook context)

Correlation window: SRE Agent reads last 15 minutes of decision log
to detect trends that span multiple observation cycles.
```

### 7.4 KEDB known error lifecycle

```
Problem detected -- Tier 2 (Jira problem record created)
Root cause confirmed -- Tier 3 (Confluence RCA page written)
Accepted known error:
  -> Tier 2: Jira problem ticket updated (accepted status)
  -> Tier 3: Confluence workaround page created
  -> Tier 4: SRE_SUPPRESSION_RULES.md updated (commons repo via CoE PR)

Known error resolved:
  -> Tier 4: SRE_SUPPRESSION_RULES.md entry removed (commons PR)
  -> Tier 3: Workaround page archived
  -> Tier 2: Jira problem ticket closed
```

---

## 8. Memory expiry and cleanup

### 8.1 Automatic expiry rules

| Memory tier | Content | Expiry |
|---|---|---|
| Tier 1 | All content | Session end |
| Tier 2 | Jira state comments | 90 days after ticket closure |
| Tier 2 | GitHub PR content | Never deleted -- audit record |
| Tier 3 | Sprint reports | 12 months |
| Tier 3 | Technical specs | When feature is deprecated |
| Tier 3 | ADRs | Never deleted -- superseded, not deleted |
| Tier 3 | KEDB workarounds | When known error resolved |
| Tier 3 | Incident records | Never deleted -- audit record |
| Tier 3 | Post-mortems | Never deleted -- audit record |
| Tier 4 | All content | Managed by CoE versioning |

### 8.2 GDPR and personal data in memory

Personal data must not persist in any memory tier beyond its retention
period as defined in COMPLIANCE_STANDARDS.md. Specific rules:

- Tier 1: personal data in context is cleared at session end automatically
- Tier 2: Jira comments containing personal data must be scrubbed
  within 30 days if the data subject exercises their right to erasure
- Tier 3: Confluence pages containing personal data must have retention
  labels applied so they appear in the quarterly retention review
- Tier 4: Commons files must never contain personal data

Agents must apply PRIVACY_GUARDRAILS.md scrubbing rules before writing
any content to Tier 2 or Tier 3.

---

## 9. Memory access by agent group

| Agent group | Tier 1 | Tier 2 read | Tier 2 write | Tier 3 read | Tier 3 write | Tier 4 |
|---|---|---|---|---|---|---|
| G01 Orchestration | Yes | Yes | Yes | Yes | No | Read |
| G02 Planning | Yes | Yes | Yes | Yes | Yes | Read |
| G03 Specification | Yes | Yes | Yes | Yes | Yes | Read |
| G04 Engineering | Yes | Yes | Yes | Yes | No | Read |
| G05 QA and testing | Yes | Yes | Yes | Yes | No | Read |
| G06 Event-driven | Yes | Yes | Limited | Yes | No | Read |
| G07 Security | Yes | Yes | Yes | Yes | Yes | Read |
| G08 Review/release | Yes | Yes | Yes | Yes | Yes | Read |
| G09 Documentation | Yes | Yes | No | Yes | Yes | Read |
| G10 Module mgmt | Yes | Yes | Yes | Yes | Yes | Read |
| G11 Infrastructure | Yes | Yes | Yes | Yes | Yes | Read |
| G12 Operations | Yes | Yes | Yes | Yes | Yes | Read (SRE also writes Tier 4 suppression rules via CoE) |

---

## 10. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
