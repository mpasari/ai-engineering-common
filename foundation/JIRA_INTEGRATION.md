# JIRA_INTEGRATION.md
# AI Engineering Commons -- Jira Integration Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + Delivery Manager representatives

---

## 1. Purpose

This file defines how every agent in the ai-engineering-commons system
reads from and writes to Jira. It covers field names, issue types,
project keys, workflow transitions, permitted operations, and the
conventions that make Jira the shared source of truth for all planning,
tracking, and delivery work.

Referenced by:
- `AGENT.md` section 9 -- listed as a required integration file
- `TOOLS_MANIFEST.md` -- T-JIRA tools reference this file for permitted scope
- All agent skill files that interact with Jira

Agents must not hard-code Jira field IDs, project keys, or workflow
transition IDs. All values come from this file. When Jira configuration
changes, only this file needs updating -- not individual agent skill files.

---

## 2. Jira instance configuration

| Setting | Value |
|---|---|
| Jira instance type | Jira Cloud |
| Base URL | https://telia-company.atlassian.net |
| Authentication | API token via environment variable JIRA_API_TOKEN |
| API version | REST API v3 |
| Default timezone | Europe/Stockholm (CET/CEST) |

**API base path:**
```
https://telia-company.atlassian.net/rest/api/3
```

**Authentication header:**
```
Authorization: Basic {base64(email:api_token)}
Content-Type: application/json
```

---

## 3. Project keys

Agents use project keys to scope their operations. An agent must never
create or modify issues in a project not listed here without explicit
human approval via a HITL gate.

| Project key | Project name | Primary team | Agent write access |
|---|---|---|---|
| AIENG | AI Engineering Commons | CoE Core | All commons agents |
| [TEAM-KEY] | [Team project name] | [Team name] | Team-scoped agents |

**Note for project setup:** Replace `[TEAM-KEY]` and `[Team name]` with
the actual project keys used in your Jira instance. Each development team
consuming the commons adds their project key to this table via a PR to
their project-layer `OVERRIDES/JIRA_INTEGRATION.md` file.

---

## 4. Issue types

### 4.1 Standard issue types agents use

| Issue type | When created | Typical creator agent |
|---|---|---|
| Story | New feature or change request broken into a user-facing deliverable | Story Drafter |
| Bug | Defect reported by user, QA, or monitoring | Bug Triage |
| Task | Technical work that is not user-facing (e.g. infra setup, doc update) | Story Drafter, Planning |
| Epic | Group of related stories spanning multiple sprints | Story Drafter (from BA input) |
| Problem | Known issue under investigation or accepted with no fix planned | Problem Management |
| Incident | Active production incident being managed | Incident Response, SRE |
| Security | Security vulnerability or compliance finding | Vuln Scan, CVE Triage, Security Review |
| Spike | Time-boxed investigation with a defined question to answer | Story Drafter |

### 4.2 Issue type -- do not use

| Issue type | Reason |
|---|---|
| Sub-task | Use Story with parent Epic link instead |
| Change Request (legacy) | Use Story with label `change-request` instead |
| Improvement | Use Story with label `improvement` instead |

---

## 5. Standard field definitions

### 5.1 Core fields all agents read and write

| Field name | Jira field ID | Type | Notes |
|---|---|---|---|
| Summary | `summary` | String | Max 255 characters |
| Description | `description` | Atlassian Document Format (ADF) | Use ADF builder for structured content |
| Issue type | `issuetype` | Object with `name` | Use names from section 4 |
| Status | `status` | Read-only -- use transitions | See section 7 |
| Priority | `priority` | Object with `name` | P0, P1, P2, P3 |
| Assignee | `assignee` | Object with `accountId` | Use account ID not display name |
| Reporter | `reporter` | Object with `accountId` | Set to agent service account |
| Labels | `labels` | Array of strings | See section 6 for standard labels |
| Components | `components` | Array of objects with `name` | See section 5.3 |
| Sprint | `sprint` | Custom field | See section 5.2 |
| Story points | `story_points` | Custom field | See section 5.2 |
| Epic link | `epic_link` | Custom field | See section 5.2 |
| Fix version | `fixVersions` | Array of objects | Set by Release Agent |

### 5.2 Custom field IDs

Custom field IDs vary per Jira instance. These are the standard custom
fields used across all Telia projects. Teams must verify their instance
field IDs and update their project-layer override if different.

| Field name | Custom field key | Type | Used by |
|---|---|---|---|
| Story points | `customfield_10016` | Number | Estimation Agent, Planning Agent |
| Sprint | `customfield_10020` | Sprint object | Planning Agent |
| Epic link | `customfield_10014` | String (epic key) | Story Drafter |
| Acceptance criteria | `customfield_10032` | String (text) | Spec Writer, Story Drafter |
| Root cause | `customfield_10033` | String (text) | Bug Triage, Problem Management |
| KEDB ID | `customfield_10034` | String | Problem Management |
| CVE ID | `customfield_10035` | String | Vuln Scan, CVE Triage |
| Affected service | `customfield_10036` | String | Bug Triage, Problem Management, SRE |
| Review date | `customfield_10037` | Date | Problem Management |
| Decision maker | `customfield_10038` | String | Problem Management |
| SRE suppression ID | `customfield_10039` | String | Problem Management, SRE |

**Fallback:** If a custom field ID is not available in the project,
agents write the value as a structured section in the issue Description
field using the heading format: `**[Field name]:** [value]`

### 5.3 Standard components

Components are used to route issues to the correct team and filter
agent-scoped searches. Every issue created by an agent must have at
least one component set.

| Component name | Scope |
|---|---|
| `ai-agents` | Issues related to AI agent behaviour |
| `backend` | Java or C# service issues |
| `frontend` | React or Angular UI issues |
| `infrastructure` | DevOps, CI/CD, cloud infrastructure |
| `data` | Database, migrations, data model |
| `security` | Security and compliance issues |
| `kafka` | Event-driven and messaging issues |
| `observability` | Monitoring, alerting, dashboards |
| `documentation` | Confluence, API docs, runbooks |

---

## 6. Standard labels

Labels are used for filtering, reporting, and agent-scoped queries.
Agents must apply the appropriate labels from this list when creating
or updating issues. Do not create new labels without CoE approval.

### 6.1 Workflow labels

| Label | When to apply |
|---|---|
| `ai-generated` | Applied to every issue created by an agent |
| `ai-reviewed` | Applied when Peer Review Agent has reviewed the associated PR |
| `awaiting-hitl` | Applied when an agent is waiting at a HITL gate |
| `hitl-approved` | Applied when a HITL gate has been approved |
| `hitl-rejected` | Applied when a HITL gate was rejected |
| `agent-blocked` | Applied when an agent cannot proceed due to missing input |

### 6.2 Content labels

| Label | When to apply |
|---|---|
| `security` | Security-related issue |
| `performance` | Performance-related issue |
| `accessibility` | Accessibility-related issue |
| `breaking-change` | Change that breaks existing API or behaviour |
| `change-request` | Issue originated as a formal change request |
| `tech-debt` | Issue related to known technical debt |
| `regression` | Bug that was previously fixed and has recurred |
| `dependency-update` | Library or framework version update |
| `known-error` | Issue linked to a KEDB known error record |
| `compliance` | Regulatory or compliance-driven issue |

### 6.3 Severity labels (incidents and security)

| Label | Meaning |
|---|---|
| `severity-p0` | Critical -- immediate production impact |
| `severity-p1` | High -- significant production degradation |
| `severity-p2` | Medium -- partial impact or workaround available |
| `severity-p3` | Low -- minor issue or cosmetic |

### 6.4 CVE severity labels

| Label | CVSS range |
|---|---|
| `cve-critical` | 9.0 -- 10.0 |
| `cve-high` | 7.0 -- 8.9 |
| `cve-medium` | 4.0 -- 6.9 |
| `cve-low` | 0.1 -- 3.9 |

---

## 7. Workflow transitions

Agents use named transitions, not status names or IDs, to move issues
through their workflow. Named transitions are more stable than IDs
across Jira configuration changes.

### 7.1 Standard story and bug workflow

```
Backlog --> To Do --> In Progress --> In Review --> Done
                                  --> Blocked

Transitions agents may trigger:
  "Start Progress"    -- Backlog/To Do --> In Progress
  "Submit for Review" -- In Progress --> In Review
  "Block"             -- Any --> Blocked (requires blocking issue link)
  "Unblock"           -- Blocked --> previous status

Transitions requiring HITL gate (human only):
  "Close"  -- In Review --> Done (requires gate D01 approval)
  "Reopen" -- Done --> To Do
```

### 7.2 Incident workflow

```
Open --> Investigating --> Identified --> Monitoring --> Resolved --> Closed

Transitions agents may trigger:
  "Start Investigation" -- Open --> Investigating (SRE, Incident Response)
  "Identify Root Cause" -- Investigating --> Identified
  "Begin Monitoring"    -- Identified --> Monitoring
  "Resolve"             -- Monitoring --> Resolved

Transitions requiring HITL gate (human only):
  "Declare P0/P1"  -- Open --> Investigating (gate E04)
  "Close Incident" -- Resolved --> Closed (requires post-mortem link, gate E05)
```

### 7.3 Problem workflow

```
New --> Under Investigation --> Known Error --> Accepted / Deferred --> Resolved

Transitions agents may trigger:
  "Begin Investigation" -- New --> Under Investigation
  "Confirm Root Cause"  -- Under Investigation --> Known Error (gate E03 required)

Transitions requiring HITL gate (human only):
  "Accept - No Fix"  -- Known Error --> Accepted (gate E01)
  "Defer Fix"        -- Known Error --> Deferred (gate E02)
  "Resolve"          -- Any --> Resolved (gate E01/E02 reversal)
```

---

## 8. Issue creation templates

Agents use these templates when creating issues. They are Atlassian
Document Format (ADF) structures expressed here as readable markdown --
agents convert to ADF when calling the Jira API.

### 8.1 Story template

```markdown
## Description
[What the user needs and why. Written from the user's perspective.]

## Acceptance criteria
Given [context]
When [action]
Then [expected outcome]

Given [context]
When [action]
Then [expected outcome]

## Technical notes
[Any technical constraints, dependencies, or implementation guidance
 known at story creation time.]

## Dependencies
- Blocked by: [ticket number or "none"]
- Blocks: [ticket number or "none"]

## Definition of done
- [ ] Code complete and reviewed
- [ ] Unit tests passing (coverage >= threshold)
- [ ] Integration tests passing
- [ ] Security review passed
- [ ] Accessibility check passed (if UI)
- [ ] Confluence spec updated
- [ ] Deployed to staging

---
Generated by: [Agent name] (commons v[version])
Generated at: [ISO 8601 timestamp]
Source: [Meeting notes reference / epic key / CR ticket]
```

### 8.2 Bug report template

```markdown
## Summary
[One sentence describing what is broken]

## Environment
- Service: [Service name and version]
- Environment: [Production / Staging / Dev]
- Affected users: [All / Subset -- describe subset]
- First observed: [ISO 8601 timestamp]

## Steps to reproduce
1. [Step one]
2. [Step two]
3. [Step three]

## Expected behaviour
[What should happen]

## Actual behaviour
[What actually happens]

## Evidence
- Error message: [exact error text]
- Log reference: [Loki/Grafana URL or log excerpt]
- Screenshot: [URL or "not available"]

## Root cause hypothesis
[Agent's initial hypothesis based on triage -- marked as hypothesis,
 not confirmed cause]

## KEDB check
[Matching KEDB entry: KEDB-XXXX / No matching known error found]

---
Generated by: Bug Triage Agent (commons v[version])
Generated at: [ISO 8601 timestamp]
Triage confidence: [High / Medium / Low]
```

### 8.3 Security issue template

```markdown
## Vulnerability summary
[One sentence describing the vulnerability]

## CVE details
- CVE ID: [CVE-YYYY-NNNNN or "Internal finding"]
- CVSS score: [Score and vector]
- Severity: [Critical / High / Medium / Low]
- CWE: [CWE-NNN -- category name]

## Affected components
- Service: [Service name]
- Library: [Library name and version]
- File / endpoint: [Path or URL]

## Exploitability assessment
[Is this exploitable in the Telia context? What conditions are required?]

## Remediation
- Recommended fix: [Upgrade to version X / Apply patch / Code change]
- Estimated effort: [Hours]
- SLA deadline: [Date based on severity -- see DEPENDENCY_POLICY.md section 6.2]

## Workaround
[Temporary mitigation if fix is not immediate, or "None available"]

---
Generated by: [Vuln Scan Agent / CVE Triage Agent] (commons v[version])
Generated at: [ISO 8601 timestamp]
Scan reference: [Scan ID or "Manual finding"]
```

### 8.4 Problem record template

```markdown
## Problem description
[What happens and under what conditions]

## Linked incidents
- [INCIDENT-XXX] -- [Date] -- [Impact summary]
- [INCIDENT-YYY] -- [Date] -- [Impact summary]

## Root cause
[Confirmed root cause or "Under investigation"]

## Fix decision
- Decision: [Fix now / Defer to sprint XX / Accept -- no fix]
- Reason category: [From PROBLEM_DECISION_GUIDE.md section 2]
- Rationale: [One paragraph justification]
- Decision maker: [Name and role]
- Decision date: [ISO 8601 date]
- Review date: [ISO 8601 date -- maximum 6 months from decision]

## Workaround
[Steps for users or support team -- or "None required"]

## SRE suppression
- Suppression active: [Yes / No]
- Suppression rule ID: [KEDB-XXXX / "Not applicable"]

---
Generated by: Problem Management Agent (commons v[version])
Generated at: [ISO 8601 timestamp]
```

---

## 9. JQL queries agents use

Standard JQL queries that agents run frequently. Agents must use these
exact queries to ensure consistent results and avoid accidental scope creep.

```
-- Stories ready for development (in the current sprint, no open blockers)
project = [PROJECT-KEY] AND issuetype = Story AND status = "To Do"
AND sprint in openSprints() AND "Blocked by" is EMPTY

-- Open bugs by severity
project = [PROJECT-KEY] AND issuetype = Bug AND status != Done
ORDER BY priority ASC, created DESC

-- Open security issues with breached SLA
project = [PROJECT-KEY] AND issuetype = Security AND status != Done
AND due <= now() ORDER BY priority ASC

-- Active incidents
project = [PROJECT-KEY] AND issuetype = Incident
AND status not in (Resolved, Closed) ORDER BY priority ASC

-- Known errors due for review
project = [PROJECT-KEY] AND issuetype = Problem
AND status = Accepted AND "Review date" <= now()

-- Issues awaiting HITL gate approval
project = [PROJECT-KEY] AND labels = "awaiting-hitl"
AND status != Done ORDER BY updated ASC

-- Dependency-blocked stories
project = [PROJECT-KEY] AND issuetype = Story
AND status = Blocked ORDER BY updated ASC
```

---

## 10. Rate limiting and error handling

### 10.1 Rate limit behaviour

Jira Cloud enforces rate limits per API token. Agents must handle
rate limit responses gracefully.

| Response code | Meaning | Agent action |
|---|---|---|
| 429 Too Many Requests | Rate limit hit | Wait for Retry-After header value, then retry |
| 503 Service Unavailable | Jira temporarily unavailable | Retry with exponential backoff (max 3 retries) |
| 400 Bad Request | Invalid request | Log the error, do not retry, flag to human |
| 401 Unauthorized | Token expired or invalid | Stop, flag authentication error to human |
| 403 Forbidden | Insufficient permissions | Stop, flag permission error to human |
| 404 Not Found | Issue or project does not exist | Stop, flag to human -- do not create a replacement |

### 10.2 Exponential backoff

```
Retry 1: wait 2 seconds
Retry 2: wait 4 seconds
Retry 3: wait 8 seconds
After retry 3: flag failure to human, do not retry further
```

---

## 11. Agent service account

All agents authenticate to Jira using a shared service account.
Individual agent actions are distinguished by the comment header
and label `ai-generated`, not by separate accounts.

| Setting | Value |
|---|---|
| Service account email | ai-agents@telia-company.com |
| Display name | AI Engineering Agent |
| Token storage | Azure Key Vault -- secret name: jira-api-token |
| Token rotation | Quarterly -- DevOps responsibility |
| Permissions | Project Member on all permitted projects |

---

## 12. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core + Delivery Manager representatives |
| Review cadence | Quarterly -- or when Jira configuration changes |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead, Delivery Manager representative |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
