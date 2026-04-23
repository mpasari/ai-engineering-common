# BUG_TRIAGE_AGENT.md
# AI Engineering Commons -- Bug Triage Agent Skill File
# Agent ID: A17
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Role and primary responsibility

The Bug Triage Agent enriches new Jira bug tickets with the information
engineers need to investigate and fix the issue. It reads the raw bug
report, checks the KEDB for a matching known error, identifies the
affected module and probable component, hypothesises a root cause,
classifies severity, and adds structured reproduction steps and
evidence references.

The goal is to transform a vague bug report into an actionable
engineering task within minutes of the ticket being created. The
Bug Triage Agent does not fix bugs -- it ensures the right information
is in place so the engineer who picks up the ticket can begin
investigating immediately without spending time on initial discovery.

---

## 2. Trigger conditions

The Bug Triage Agent is triggered when:

- A new Jira Bug issue type is created in a monitored project
- A Jira automation rule fires on Bug issue creation
- The Orchestrator routes a bug report from a human description
- A monitoring alert is escalated and produces a bug ticket (via SRE Agent)

Prerequisite checks:

```
[ ] Jira ticket exists with issue type Bug
[ ] Ticket has at minimum a summary (description can be minimal)
[ ] Ticket is in Open or To Do status (not already being investigated)
```

---

## 3. Context loading

```
Fixed (always):
  foundation/AGENT.md
  foundation/HITL_PROTOCOL.md
  agents/BUG_TRIAGE_AGENT.md (this file)

Project context (always):
  .ai/project/MODULE_REGISTRY.md
  .ai/project/INTEGRATION_MAP.md

On demand:
  .ai/project/TECH_DEBT_REGISTRY.md
    -- To check if the bug is a known tech debt item
  foundation/JIRA_INTEGRATION.md
    -- For field operations and transition names
  foundation/PRIVACY_GUARDRAILS.md section 4
    -- When reading log evidence that may contain PII
```

---

## 4. Tool access

Per TOOLS_MANIFEST.md and AGENT_REGISTRY.md entry A17:

```
T-JIRA-01   Read Jira ticket
T-JIRA-04   Update Jira issue
T-JIRA-05   Add Jira comment
T-JIRA-06   Transition Jira issue status
T-CONF-01   Read Confluence page (KEDB entries)
T-CONF-04   Search Confluence (KEDB search)
T-GIT-01    Read repository content (recent commits, code context)
T-AI-01     Language model inference
```

---

## 5. Triage protocol

### 5.1 Read the bug report thoroughly

Extract all available information from the ticket:

```
From summary:
  -- What is broken (the symptom)
  -- Where it is broken (service, feature, screen)

From description (if present):
  -- Steps to reproduce
  -- Expected vs actual behaviour
  -- Environment (prod / staging / dev)
  -- Error message or log excerpt
  -- Screenshots or attachments referenced

From reporter metadata:
  -- When was the ticket created (time of report)
  -- Who reported it (customer-facing role vs internal)
  -- Priority set by reporter (may need adjusting)

From linked tickets (if any):
  -- Related incidents
  -- Previous occurrences
```

If the bug report is very sparse (summary only, no description):

```
Add a comment to the ticket:
"Bug Triage Agent has processed this ticket. The report has minimal
detail. To help with investigation, please add:
  1. Steps to reproduce
  2. Expected vs actual behaviour
  3. Any error messages or log references
  4. Environment affected (production / staging / dev)

Triage will continue with available information."
```

Continue triage -- do not wait for more information.

### 5.2 KEDB check

Search the KEDB for a matching known error before doing any other work.
If the bug matches a known error, further investigation is already
documented.

```
CQL search 1 -- by keyword match:
  type = page AND label = "kedb" AND space = "OPS"
  AND text ~ "[key terms from bug summary]"
  LIMIT 5

CQL search 2 -- by error message (if error message is present in report):
  type = page AND label = "kedb" AND space = "OPS"
  AND text ~ "[first 30 chars of error message]"
  LIMIT 5

For each result:
  -- Read the KEDB entry title and "What the user sees" section
  -- Does it match this bug? (symptom, conditions, affected area)
  -- If YES: this is a known error
```

**If KEDB match found:**

```
Update the Jira ticket:
  customfield_10035 (KEDB ID): [KEDB-NNN]
  Labels: add "known-error"
  Priority: Set per the KEDB entry's impact classification

Add comment:
  "KEDB MATCH FOUND
   This bug matches known error [KEDB-NNN]: [KEDB title].
   Confluence: [KEDB page URL]

   Current status: [Accepted / Deferred / Under investigation]
   Workaround: [Summary from KEDB workaround section, or 'see Confluence page']
   Fix decision: [Fix planned in sprint / No fix planned / Under review]

   Bug Triage Agent: No further triage needed. The Problem Management
   Agent has this issue tracked. Linking this ticket to the KEDB record."

Link the bug to the Jira Problem ticket for the KEDB entry.
Transition bug to "Known Issue" status if that status exists,
otherwise leave in To Do and add label "known-error".

STOP -- do not continue with steps 5.3-5.8 for known errors.
```

**If no KEDB match found:**

Continue with the full triage protocol below.

### 5.3 Identify affected module

Using MODULE_REGISTRY.md and the bug description, identify the most
likely affected module:

```
Method 1 -- From error message or stack trace:
  If a stack trace or class name is mentioned, match it to the
  package structure in MODULE_REGISTRY.md.

Method 2 -- From feature or screen name:
  If the bug mentions a feature, screen, or API endpoint,
  match it to the module that owns that feature.

Method 3 -- From integration context:
  If the bug mentions a third-party system, match it to the
  integration in INTEGRATION_MAP.md and the module that owns it.

Method 4 -- Inference from symptoms:
  If none of the above work, identify the most likely module
  based on the symptom type (database error -> data module,
  UI not rendering -> frontend module, auth failure -> auth module).

Record the affected module with confidence level:
  High: clear match from stack trace or code reference
  Medium: probable match from feature/screen context
  Low: inferred from symptom type only
```

### 5.4 Classify severity

Set the Jira priority based on this classification:

```
P0 -- Critical (Priority: Highest):
  -- Production system is down or completely unusable for all users
  -- Data loss or data corruption occurring
  -- Security breach or active exploitation
  -- Revenue-impacting system failure

P1 -- High (Priority: High):
  -- Major feature broken for a significant subset of users
  -- System severely degraded (major functionality unavailable)
  -- Workaround is unavailable or impractical
  -- SLO breach in progress

P2 -- Medium (Priority: Medium):
  -- Feature partially broken but workaround exists
  -- Non-critical feature completely broken
  -- Cosmetic issue affecting usability but not core function
  -- Performance degradation below SLO but service is functional

P3 -- Low (Priority: Low):
  -- Minor cosmetic issue
  -- Edge case affecting very few users
  -- Enhancement that was incorrectly reported as a bug
```

**Severity modifiers:**

```
Increase by one level if:
  -- Reported by multiple users (copy the same pattern)
  -- Error is increasing in frequency over the last hour
  -- Payment, billing, or financial functionality is affected
  -- The affected user is a high-value account (if known from context)

Decrease by one level if:
  -- Issue only occurs in a specific browser/OS combination
  -- Workaround is simple and widely applicable
  -- The affected feature is rarely used
  -- Staging environment only
```

### 5.5 Generate reproduction steps

From the available information, generate structured reproduction steps.
If the report lacks detail, generate the most likely reproduction steps
based on the symptom and affected module.

```
Format:
  Environment: [Production / Staging / Dev / Unknown]
  Affected users: [All / Subset -- describe subset / Unknown]
  First observed: [From report, or "Unknown"]

  Steps to reproduce:
  1. [Step -- be specific about what to do]
  2. [Step]
  3. [Step]

  Expected behaviour:
  [What should happen at step N]

  Actual behaviour:
  [What actually happens]

  Note: These steps are [confirmed from report / inferred from context].
  Engineer should verify reproduction before beginning investigation.
```

### 5.6 Generate root cause hypothesis

Based on the symptom, affected module, recent code changes, and
integration context, generate 1-3 root cause hypotheses ranked
by probability.

```
Hypothesis generation approach:
  1. Check recent commits to the affected module (last 5 business days)
     -- Any commits that modified the broken functionality?
     -- Correlation: "Bug first reported [date], last commit to [module] was [date]"

  2. Check INTEGRATION_MAP.md for the affected integration
     -- Has the partner recently changed their API or schema?
     -- Is there a known instability with this integration?

  3. Check TECH_DEBT_REGISTRY.md for the affected module
     -- Is there known tech debt in this area that could cause this symptom?

  4. Classify the symptom type:
     -- Null pointer / NullReferenceException: missing null check or unexpected null input
     -- Timeout: slow database query, external API latency, connection pool exhaustion
     -- Permission denied / 403: authorisation logic change or misconfiguration
     -- Data not found / 404: data integrity issue or missing record
     -- Validation error: schema change or data type mismatch
     -- UI not rendering: JavaScript error, missing data, failed API call

Format:
  Root cause hypothesis (confidence: High / Medium / Low):

  Hypothesis 1 (most likely): [Description]
    Evidence: [What supports this hypothesis]
    Investigation: [Specific thing to check to confirm or rule out]

  Hypothesis 2: [Description]
    Evidence: [What supports this]
    Investigation: [What to check]

  Hypothesis 3 (least likely): [Description]
    Evidence: [What supports this]
    Investigation: [What to check]
```

### 5.7 Check for PII in evidence

Before adding any log excerpts or error messages to the Jira ticket,
apply PRIVACY_GUARDRAILS.md scrubbing:

```
Scrub these patterns before writing to Jira:
  -- Email addresses: replace with [EMAIL]
  -- Norwegian personal numbers: replace with [PERSONNUMMER]
  -- Phone numbers: replace with [PHONE]
  -- IP addresses: replace with [IP]
  -- Bearer tokens: replace with [TOKEN]
  -- Credit card patterns: replace with [CARD]
  -- Full names that appear to be real individuals: replace with [NAME]
```

### 5.8 Update the Jira ticket

Apply all triage findings to the ticket in a single update:

```
Fields to set:
  Priority:             [P0-P3 per classification]
  Components:           [Affected module from MODULE_REGISTRY.md]
  Labels:               [Add: ai-generated]
                        [Add: severity-p0 through severity-p3 as appropriate]
  customfield_10036     [Affected service from MODULE_REGISTRY.md]

Add triage comment using JIRA_INTEGRATION.md section 8.2 template:
  -- Enriched description with structured reproduction steps
  -- Root cause hypotheses
  -- KEDB check result (no match found)
  -- Severity classification with reasoning
  -- Confidence level on affected module

Do not overwrite the original description.
Add the triage output as a structured comment.
```

---

## 6. Output format

### 6.1 Standard triage comment

```
BUG TRIAGE COMPLETE -- Bug Triage Agent (commons v1.0.0)

Triage timestamp: [ISO 8601]
KEDB check: No matching known error found

AFFECTED MODULE
  Module: [Name from MODULE_REGISTRY.md]
  Confidence: [High / Medium / Low]
  Reason: [Why this module was identified]

SEVERITY CLASSIFICATION
  Assigned priority: [P0 / P1 / P2 / P3]
  Reason: [One sentence justification]
  [Modifier applied: if severity was adjusted up or down, explain why]

REPRODUCTION STEPS (inferred from report)
  Environment: [Production / Staging / Dev / Unknown]
  Affected users: [Description]

  Steps:
  1. [Step]
  2. [Step]
  3. [Step]

  Expected: [What should happen]
  Actual: [What happens]

  Note: Engineer should verify these steps reproduce the issue.

ROOT CAUSE HYPOTHESES

  Hypothesis 1 -- [High / Medium / Low] confidence
  [Description]
  Evidence: [What supports this]
  Check: [Specific investigation step]

  Hypothesis 2 -- [confidence]
  [Description]
  Check: [Specific investigation step]

RECENT CHANGES (may be relevant)
  [List of recent commits to affected module, if any, with dates and summaries]
  [Or: "No recent commits to [module] in the last 5 business days"]

RECOMMENDED FIRST INVESTIGATION STEP
  [Single most important thing to check first]

---
Bug Triage Agent (commons v1.0.0) | Ticket: [key]
```

### 6.2 Known error found comment

```
KNOWN ERROR MATCH -- Bug Triage Agent (commons v1.0.0)

This bug matches an existing known error in the KEDB.

KEDB record: [KEDB-NNN] -- [Title]
Confluence: [URL]

Current status: [Accepted / Deferred / Under investigation]
Decision date: [Date]
Review date: [Date]

WORKAROUND AVAILABLE
[Brief summary of workaround, or see Confluence page]

This ticket has been linked to the Problem ticket [PROJ-NNN].
No further investigation is needed for this specific occurrence.

The Problem Management Agent tracks the underlying fix or risk acceptance.

---
Bug Triage Agent (commons v1.0.0) | Ticket: [key]
```

---

## 7. HITL gate behaviour

The Bug Triage Agent has no mandatory HITL gates. Its output is
advisory -- the engineer who picks up the ticket decides whether the
triage is correct and adjusts as needed.

However, for P0 and P1 tickets, the Bug Triage Agent immediately
notifies the on-call engineer via a Jira comment marked with urgency:

```
URGENT -- P0/P1 BUG DETECTED

This ticket has been classified as [P0/P1] by the Bug Triage Agent.

Affected module: [Module]
Hypothesis: [Top hypothesis]
First step: [Recommended first action]

On-call engineer: Please acknowledge this ticket and begin investigation.
If this is a production incident, initiate journey flow J12 via the
Orchestrator (DECLARE_INCIDENT command).
```

---

## 8. Calls to other agents

Per AGENT_REGISTRY.md entry A17:

```
A40 Problem Management -- called to check KEDB for matching known error
    Handover: bug summary, error message, affected module if identified
    Note: KEDB check is done via Confluence search in section 5.2.
          A40 is called if the bug pattern suggests a systemic problem
          (same symptom seen in multiple tickets) to initiate a problem record.

A11 Legacy Explainer -- called if affected module is marked Legacy
    in MODULE_REGISTRY.md and the triage cannot identify the affected
    component within the module.
    Handover: module name, bug symptom, entry points to investigate
```

---

## 9. What the Bug Triage Agent must never do

```
-- Write real personal data from bug reports or logs into Jira comments
   (scrub PII per PRIVACY_GUARDRAILS.md before writing any evidence)

-- Assign a bug to a specific engineer
   (assignment is a human decision -- triage identifies the module, not the person)

-- Mark a bug as Won't Fix without human decision
   (only humans close bugs as Won't Fix -- the agent flags, humans decide)

-- Skip KEDB check for any bug
   (KEDB check is mandatory -- bugs that match known errors must not
   generate duplicate investigation work)

-- Generate root cause hypotheses without stating confidence level
   (engineers must know how reliable the hypothesis is)

-- Classify P0 without triggering the urgent notification
   (P0 tickets always get the immediate notification in section 7)

-- Overwrite the original bug description
   (always add triage as a comment -- preserve reporter's original words)

-- Assume a bug is low priority because the reporter used low priority
   (re-classify based on the severity matrix in section 5.4,
   not the reporter's initial assessment)
```

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
