# CONTEXT_WINDOW_STRATEGY.md

# AI Engineering Commons -- Context Window Strategy

# Version: 1.0.0

# Status: Active

# Last updated: 2026-04

# Owner: CoE Core

---

## 1. Purpose

This file defines how agents in the ai-engineering-commons system
manage their context window during task execution. It covers what to
load, in what order, how to select when everything does not fit, how
to chunk large tasks, and when and how to compress context that is no
longer needed.

Referenced by:

- `MEMORY_MANAGEMENT.md` section 3 -- Tier 1 in-context memory
- `MULTI_AGENT_SETUP.md` section 9 -- context management across agents
- All agent skill files -- each declares its context loading rules
- `agents/ORCHESTRATOR_AGENT.md` -- manages context across long tasks

Agents that do not manage their context window carefully will either
fail mid-task when the window fills, or produce lower-quality output
by keeping irrelevant content in context. This file prevents both.

---

## 2. Context window reference

Different AI models have different context window sizes. Agents must
be aware of which model they are using and manage accordingly.


| Model                   | Approximate context window | Practical usable limit                  |
| ----------------------- | -------------------------- | --------------------------------------- |
| Claude Sonnet (current) | 200,000 tokens             | 180,000 tokens (reserve 20k for output) |
| Claude Haiku (current)  | 200,000 tokens             | 180,000 tokens                          |
| GPT-4o                  | 128,000 tokens             | 110,000 tokens                          |
| GPT-4o mini             | 128,000 tokens             | 110,000 tokens                          |
| Azure OpenAI GPT-4      | 128,000 tokens             | 110,000 tokens                          |


**Token estimation rules (rough guide):**

- 1 token is approximately 4 characters of English text
- A typical foundation file (AGENT.md, SECURITY_STANDARDS.md) is 3,000-5,000 tokens
- A typical technical spec page is 2,000-4,000 tokens
- A typical code file (200 lines Java) is approximately 2,000 tokens
- A full AGENT_REGISTRY.md is approximately 8,000 tokens

**Practical budget for a standard task:**

```
Fixed overhead (always loaded):
  AGENT.md                      ~4,000 tokens
  HITL_PROTOCOL.md              ~3,500 tokens
  Agent skill file              ~3,000 tokens
  Handover package (if any)     ~1,000 tokens
  ------------------------------------
  Fixed total                   ~11,500 tokens

Available for task content:     ~168,500 tokens (Claude) or ~98,500 tokens (GPT-4)
Reserve for output generation:  ~20,000 tokens
Practical working budget:       ~148,500 tokens (Claude) or ~78,500 tokens (GPT-4)
```

---

## 3. Context loading rules

### 3.1 Always load (fixed overhead)

Every agent loads these files at the start of every session in this order:

```
1. foundation/AGENT.md
2. foundation/HITL_PROTOCOL.md
3. agents/{this-agent-skill-file}.md
4. Handover package (if resuming a task)
```

These four items are never omitted and never summarised. They are the
operating constraints and identity of the agent.

### 3.2 Conditionally load (task-relevant standards)

Load these only when the task type requires them. Do not load all
standards files for every task.


| Task type                       | Load these additional files                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| Code generation (Java)          | CODING_STANDARDS.md, SECURITY_STANDARDS.md, PERFORMANCE_GUIDELINES.md  |
| Code generation (TypeScript)    | CODING_STANDARDS.md, SECURITY_STANDARDS.md, ACCESSIBILITY_STANDARDS.md |
| Code generation (C#)            | CODING_STANDARDS.md, SECURITY_STANDARDS.md                             |
| API design or spec writing      | API_DESIGN_STANDARDS.md, CODING_STANDARDS.md                           |
| Security review                 | SECURITY_STANDARDS.md, PRIVACY_GUARDRAILS.md                           |
| Accessibility review            | ACCESSIBILITY_STANDARDS.md, CODING_STANDARDS.md                        |
| Dependency change               | DEPENDENCY_POLICY.md                                                   |
| Any task touching personal data | PRIVACY_GUARDRAILS.md, COMPLIANCE_STANDARDS.md                         |
| Observability or SRE work       | GRAFANA_INTEGRATION.md, SRE files                                      |
| Jira operations                 | JIRA_INTEGRATION.md                                                    |
| Confluence operations           | CONFLUENCE_INTEGRATION.md                                              |
| GitHub operations               | GITHUB_INTEGRATION.md                                                  |


### 3.3 Load on demand (read when needed)

These are large files that should only be loaded when a specific
reference to them is encountered during a task:

- AGENT_REGISTRY.md -- only if routing to another agent is needed
- MULTI_AGENT_SETUP.md -- only if orchestration decisions are needed
- MEMORY_MANAGEMENT.md -- only if context management decisions are needed
- Individual agent skill files -- only when calling that agent

### 3.4 Never load unnecessarily

These files should rarely be in context during routine tasks:

- AGENT_REGISTRY.md -- 40 agents, 8,000 tokens -- heavy, load only when routing
- MULTI_AGENT_SETUP.md -- 6,000 tokens -- load only for Orchestrator
- All standards files simultaneously -- never load all at once
- Project files not relevant to the current task

---

## 4. Content prioritisation when budget is tight

When the available budget after fixed overhead is insufficient to load
all required content, apply this prioritisation:

### 4.1 Priority order

```
Priority 1 (never drop):
  - AGENT.md
  - HITL_PROTOCOL.md
  - Agent skill file
  - Active handover package
  - Current task instructions

Priority 2 (drop last):
  - The specific standard most relevant to the current task
  - The primary input file (the spec, the code, the ticket being processed)

Priority 3 (compress before dropping):
  - Secondary standards files
  - Previous step outputs (summarise to key decisions only)
  - Reference files consulted earlier in the task

Priority 4 (drop first):
  - Files read but not yet acted on
  - Older handover packages (superseded by current)
  - Completed step details (keep summary only)
```

### 4.2 Summarisation before dropping

Before dropping any Priority 3 content from context, the agent creates
a one-paragraph summary capturing the key facts and decisions from that
content. The summary replaces the full content in context.

```
Example: A 3,000 token technical spec is summarised to 200 tokens:

"Spec PROJ-412: Add POST /api/v1/orders/{id}/cancel endpoint.
Status-update only (no soft-delete). Reason field mandatory (max 500 chars).
Only PENDING or PROCESSING orders can be cancelled.
Auth: existing OAuth2 scope 'orders:write'. No new data stored."
```

The full spec remains available in Confluence (Tier 3) if the agent
needs to re-read specific sections.

---

## 5. Chunking strategies for large tasks

Some tasks are inherently too large to complete in a single context
window. These must be decomposed into chunks before starting.

### 5.1 When to chunk


| Scenario                             | Chunk strategy                                       |
| ------------------------------------ | ---------------------------------------------------- |
| Brownfield codebase with 50+ files   | Module-by-module, one chunk per module               |
| Epic with 20+ stories                | Sprint-by-sprint, one chunk per sprint               |
| Large refactor across 30 files       | File-group-by-file-group, maximum 10 files per chunk |
| Vulnerability scan of large manifest | Dependency-group-by-group (test / compile / runtime) |
| Long test suite generation           | Class-by-class, one chunk per source class           |


### 5.2 Chunk design rules

```
1. Each chunk must be independently executable
   -- the agent can complete chunk N without chunk N+1 being in context

2. Each chunk produces a concrete output
   -- committed files, Jira comments, Confluence updates

3. Chunk outputs are stored in Tier 2 before the next chunk starts
   -- never rely on context carrying over between chunks

4. The first thing each chunk does is read its predecessor's output
   -- from Tier 2, not from context

5. Chunks are explicitly sized before starting
   -- agent declares: "This task will be completed in N chunks"
   -- this declaration goes into the Jira ticket at task start
```

### 5.3 Chunk handover format

At the end of each chunk, the agent writes a lightweight state update
to the Jira ticket:

```
[CHUNK {N} of {TOTAL} COMPLETE -- {Handover ID}]

Completed in this chunk:
- [Output 1] -- [Location/reference]
- [Output 2] -- [Location/reference]

Starting state for next chunk:
- [What next chunk should read first]
- [What decisions carry forward]

Next chunk action:
- [Exact first action of next chunk]

[END CHUNK STATE]
```

---

## 6. Context management for specific agent types

### 6.1 Orchestrator Agent context strategy

The Orchestrator manages context differently from specialist agents
because it coordinates multiple agents across long tasks.

```
Orchestrator context at task start:
  Fixed overhead (AGENT.md, HITL_PROTOCOL.md, skill file)
  + MULTI_AGENT_SETUP.md (routing rules -- always needed)
  + Journey flow chain for this task (from MULTI_AGENT_SETUP.md section 4)
  + Task handover package (if resuming)
  + Jira ticket for the primary task

Orchestrator does NOT load:
  - Specialist agent skill files (each agent loads its own)
  - Standards files (each specialist agent loads relevant ones)
  - Code or spec files (passed in handover packages to specialists)

Orchestrator maintains:
  - Task progress tracker in Jira (Tier 2)
  - One-line status per completed step
  - Current position in the journey flow chain
```

### 6.2 SRE Agent context strategy

The SRE Agent runs in rapid 60-second cycles. Its context is minimal
by design to maximise speed.

```
SRE Agent context per cycle (target: under 20,000 tokens):
  Fixed overhead (AGENT.md, HITL_PROTOCOL.md, skill file) ~10,500 tokens
  + SRE_SUPPRESSION_RULES.md (essential for KEDB check) ~2,000 tokens
  + SRE_AUTONOMY_BUDGET.md (essential for tier decision) ~2,000 tokens
  + Current observation data (Grafana panel values, alerts) ~2,000 tokens
  + Last 15 minutes of SRE_DECISION_LOG.md (trend detection) ~3,000 tokens
  -----------------------------------------------------------------------
  Total target: ~19,500 tokens

The SRE Agent does NOT load:
  - Architecture files
  - Standards files
  - Jira ticket history
  - Confluence pages

It reads Confluence runbook URLs only when producing a Tier 3 escalation
package, and only fetches the specific runbook page, not the full space.
```

### 6.3 Code Gen Agent context strategy

Code generation needs the spec and the relevant standards -- but
rarely needs the full project context.

```
Code Gen Agent context for a typical story:
  Fixed overhead                                         ~11,500 tokens
  + CODING_STANDARDS.md                                  ~5,000 tokens
  + SECURITY_STANDARDS.md (section 2 and 8 only)        ~3,000 tokens
  + PERFORMANCE_GUIDELINES.md (section 2 and 8 only)    ~2,500 tokens
  + Technical spec for current story                     ~3,000 tokens
  + Existing code files to be modified (if any)          ~4,000 tokens
  + BACKEND_PATTERNS.md or FRONTEND_PATTERNS.md          ~3,000 tokens
  -----------------------------------------------------------------------
  Total: ~32,000 tokens

The Code Gen Agent does NOT load:
  - Full AGENT_REGISTRY.md
  - Other stories or specs not related to this task
  - Architecture overview (unless spec references it explicitly)
  - Compliance or accessibility files (unless generating UI or handling PII)
```

### 6.4 Peer Review Agent context strategy

PR review requires the diff and the relevant checklists -- not full
standards documents.

```
Peer Review Agent context:
  Fixed overhead                                         ~11,500 tokens
  + PR diff (file changes only -- not full file content) ~5,000-15,000 tokens
  + CODING_STANDARDS.md section 7 checklist only         ~1,000 tokens
  + SECURITY_STANDARDS.md section 8 checklist only       ~1,500 tokens
  + PERFORMANCE_GUIDELINES.md section 8 checklist only   ~1,000 tokens
  + ACCESSIBILITY_STANDARDS.md section 6 checklist (if UI) ~1,000 tokens
  -----------------------------------------------------------------------
  Total: ~21,000-31,000 tokens

The Peer Review Agent loads only the checklist sections of standards
files, not the full files. It loads the full file only if a specific
rule in the checklist requires clarification.
```

---

## 7. Context quality rules

### 7.1 What makes good context

- **Relevant**: every item in context is needed for the current step
- **Current**: no stale file content (re-read if in doubt)
- **Minimal**: no more than needed -- smaller context = faster, cheaper, more focused
- **Structured**: fixed overhead first, then task content, then reference material

### 7.2 Anti-patterns to avoid


| Anti-pattern                                 | Problem                                                | Fix                                                    |
| -------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| Loading all standards files for every task   | Wastes tokens on irrelevant content                    | Load only task-relevant files per section 3.2          |
| Keeping full file content after acting on it | Context fills, older content pushed out                | Summarise after acting, store full content in Tier 2/3 |
| Loading AGENT_REGISTRY.md for every task     | 8,000 tokens for routing info only needed occasionally | Load on demand when routing decision needed            |
| Re-reading files that have not changed       | Wastes tokens                                          | Cache knowledge of what was read this session          |
| No state write before session end            | Task is lost if session ends unexpectedly              | Write Tier 2 state at every meaningful checkpoint      |
| Loading entire Confluence space              | Thousands of tokens of irrelevant content              | Use CQL search to find specific pages                  |


---

## 8. Monitoring context efficiency

The Orchestrator tracks context efficiency across multi-step tasks.
After each step it notes:

```
Step {N} context usage: {tokens used} / {window limit}
Content loaded: {list of files}
Content compressed: {list of summaries created}
Tier 2 writes: {list of state snapshots written}
```

If context usage exceeds 70% of the window limit at the start of a
step (before loading task content), the Orchestrator triggers a
compression pass before proceeding.

---

## 9. Version and review


| Attribute       | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| File owner      | CoE Core                                                                   |
| Review cadence  | Quarterly -- or when new AI models with different window sizes are adopted |
| Last reviewed   | 2026-04                                                                    |
| Next review due | 2026-04                                                                    |
| Approvers       | CoE Lead                                                                   |
| Change process  | PR to ai-engineering-common, 2 CoE approvals required                      |


