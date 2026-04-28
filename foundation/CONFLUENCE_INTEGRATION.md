# CONFLUENCE_INTEGRATION.md

# AI Engineering Commons -- Confluence Integration Guide

# Version: 1.0.0

# Status: Active

# Last updated: 2026-04

# Owner: CoE Core + Tech Lead representatives

---

## 1. Purpose

This file defines how every agent in the ai-engineering-commons system
reads from and writes to Confluence. It covers space keys, page
hierarchies, templates, content conventions, and the rules that ensure
Confluence remains the reliable source of truth for technical
documentation, specifications, runbooks, and architecture records.

Referenced by:

- `AGENT.md` section 9 -- listed as a required integration file
- `TOOLS_MANIFEST.md` -- T-CONF tools reference this file for permitted scope
- `agents/SPEC_WRITER_AGENT.md` -- primary Confluence writer
- `agents/DOCUMENTATION_AGENT.md` -- feature and API documentation
- `agents/ARCH_DOC_AGENT.md` -- architecture documentation
- `agents/STAKEHOLDER_REPORT_AGENT.md` -- non-technical summaries
- `agents/PROBLEM_MGMT_AGENT.md` -- KEDB and workaround pages

---

## 2. Confluence instance configuration


| Setting                  | Value                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Confluence instance type | Confluence Cloud                                                                     |
| Base URL                 | [https://telia-company.atlassian.net/wiki](https://telia-company.atlassian.net/wiki) |
| Authentication           | API token via environment variable CONFLUENCE_API_TOKEN                              |
| API version              | REST API v2 (preferred) with v1 fallback                                             |
| Default timezone         | Europe/Stockholm (CET/CEST)                                                          |


**API base paths:**

```
REST v2: https://telia-company.atlassian.net/wiki/api/v2
REST v1: https://telia-company.atlassian.net/wiki/rest/api
```

**Authentication header:**

```
Authorization: Basic {base64(email:api_token)}
Content-Type: application/json
```

---

## 3. Space structure

Agents operate within permitted spaces only. Writing to a space not
listed here requires explicit human approval via a HITL gate.

### 3.1 Permitted spaces


| Space key | Space name             | Primary purpose                       | Agent write access                         |
| --------- | ---------------------- | ------------------------------------- | ------------------------------------------ |
| AIENG     | AI Engineering Commons | Commons documentation, CoE artifacts  | CoE agents                                 |
| ARCH      | Architecture           | System architecture, ADRs, tech radar | Arch Doc Agent                             |
| ENG       | Engineering            | Technical specs, coding guides        | Spec Writer, Documentation                 |
| OPS       | Operations             | Runbooks, incident records, KEDB      | SRE, Incident Response, Problem Management |
| PROJ      | [Project space]        | Project-specific documentation        | Project-scoped agents                      |


**Note for project setup:** Each team consuming the commons adds their
project space key to their project-layer `OVERRIDES/CONFLUENCE_INTEGRATION.md`
file. The commons default uses `PROJ` as a placeholder.

### 3.2 Space hierarchy conventions

Every space follows this top-level page structure. Agents must create
new pages under the correct parent to maintain the hierarchy.

```
[Space root]
  |-- Getting started
  |-- Architecture
  |   |-- System overview
  |   |-- Architecture Decision Records
  |   |   |-- ADR-001 -- [title]
  |   |   |-- ADR-002 -- [title]
  |   |-- C4 diagrams
  |   |-- Tech radar
  |-- Specifications
  |   |-- [Feature area]
  |   |   |-- [Feature spec]
  |   |   |-- [Feature spec]
  |-- API documentation
  |   |-- [Service name] API
  |-- Runbooks
  |   |-- [Service name]
  |   |   |-- Deployment runbook
  |   |   |-- Incident runbooks
  |-- Known errors (KEDB)
  |   |-- KEDB-001 -- [title]
  |   |-- KEDB-002 -- [title]
  |-- Meeting notes
  |-- Team
```

---

## 4. Page creation rules

### 4.1 Required page metadata

Every page created by an agent must include:

```
Title:    [Descriptive title -- see section 4.2 for naming conventions]
Space:    [Space key from section 3]
Parent:   [Parent page ID -- never create at root level]
Labels:   [At least one label from section 5]
```

### 4.2 Page title conventions


| Page type             | Title format                           | Example                                     |
| --------------------- | -------------------------------------- | ------------------------------------------- |
| Technical spec        | [Feature name] -- Technical spec       | Order cancellation -- Technical spec        |
| ADR                   | ADR-[NNN] -- [Decision title]          | ADR-042 -- Use Kafka for async order events |
| Runbook               | [Service] -- [Scenario] runbook        | Orders service -- Deployment runbook        |
| API docs              | [Service name] API -- v[N]             | Orders API -- v1                            |
| KEDB entry            | KEDB-[NNN] -- [Problem title]          | KEDB-007 -- Memory leak on batch job start  |
| Incident record       | INC-[date] -- [Summary]                | INC-20250115 -- Auth service unavailable    |
| Post-mortem           | POST-MORTEM -- [date] -- [Summary]     | POST-MORTEM -- 20250115 -- Auth outage      |
| Architecture overview | [System name] -- Architecture overview | Orders system -- Architecture overview      |
| Sprint report         | Sprint [N] -- [Team] -- Report         | Sprint 42 -- Orders team -- Report          |


### 4.3 Page versioning

Confluence tracks page versions automatically. Agents must:

- Always read the current page version before updating
- Pass the current version number in the update request
- Never use version 0 or assume version 1 for existing pages
- Include a meaningful version comment: `"Updated by [Agent name] -- [one line reason]"`

### 4.4 Preserving human-authored content

When updating an existing page, agents must not overwrite human-authored
sections without explicit instruction to do so. The safe pattern is:

1. Read the current page content
2. Identify sections generated by agents (marked with agent footer)
3. Update only those sections
4. Append new agent-generated sections at the bottom
5. Leave all other content untouched

Agent-generated sections are identified by this footer:

```
---
_Generated by [Agent name] (commons v[version]) on [ISO 8601 date]_
_Do not edit this section manually -- it will be overwritten on next agent run_
```

---

## 5. Standard labels

All pages created or updated by agents must have the `ai-generated`
label plus at least one content label.

### 5.1 System labels (applied automatically by agents)


| Label             | When applied                       |
| ----------------- | ---------------------------------- |
| `ai-generated`    | All agent-created content          |
| `ai-updated`      | Existing page updated by an agent  |
| `awaiting-review` | Content pending human review       |
| `approved`        | Content approved by human reviewer |
| `draft`           | Content not yet ready for use      |


### 5.2 Content labels


| Label            | Page type                           |
| ---------------- | ----------------------------------- |
| `technical-spec` | Technical specification pages       |
| `adr`            | Architecture Decision Records       |
| `runbook`        | Operational runbooks                |
| `api-docs`       | API documentation                   |
| `kedb`           | Known Error Database entries        |
| `incident`       | Incident records                    |
| `post-mortem`    | Post-mortem documents               |
| `architecture`   | Architecture overview and diagrams  |
| `sprint-report`  | Sprint and PI reports               |
| `workaround`     | Known error workaround instructions |
| `onboarding`     | New engineer onboarding content     |


---

## 6. Content format standards

### 6.1 Heading hierarchy

Agents must use consistent heading levels:

```
H1 -- Page title (set as page title, not as heading in body)
H2 -- Major sections (Overview, Solution, Data model, etc.)
H3 -- Sub-sections within a major section
H4 -- Detail within a sub-section -- use sparingly
```

Never skip heading levels. Do not use H1 in the page body -- Confluence
renders the page title as H1 automatically.

### 6.2 Standard page sections by type

**Technical spec page:**

```
## Overview
[Problem statement and context -- 2-3 paragraphs]

## Solution design
[Approach chosen and why -- including alternatives considered]

## Data model changes
[Schema changes, new tables, modified fields]

## API changes
[New or modified endpoints with request/response examples]

## Integration impact
[Other services affected and how]

## Non-functional requirements
[Performance, security, accessibility, scalability targets]

## Risks and mitigations
[Known risks and how they are addressed]

## Acceptance criteria
[Given/When/Then format -- same as Jira story ACs]

## Open questions
[Unresolved questions and who owns resolving them]

## References
[Jira story, related specs, ADRs, external docs]
```

**ADR page:**

```
## Status
[Proposed / Accepted / Deprecated / Superseded by ADR-NNN]

## Context
[What situation is forcing this decision]

## Decision
[What we decided to do]

## Options considered
### Option A -- [name]
[Description, pros, cons]
### Option B -- [name]
[Description, pros, cons]

## Consequences
[What becomes easier, what becomes harder, what debt is accepted]

## References
[Related ADRs, Jira tickets, external resources]
```

**Runbook page:**

```
## Purpose
[What this runbook is for and when to use it]

## Prerequisites
[Access, tools, permissions needed before starting]

## Steps
### Step 1 -- [Name]
[Instruction]
Expected output: [What you should see]

### Step 2 -- [Name]
[Instruction]
Expected output: [What you should see]

## Verification
[How to confirm the procedure completed successfully]

## Rollback
[How to undo the procedure if something goes wrong]

## Contacts
[Who to call if this runbook does not resolve the issue]
```

**KEDB workaround page:**

```
## What the user sees
[Exact symptom description from the user perspective]

## When this occurs
[Trigger conditions -- when, under what load, which actions]

## Impact
[Who is affected, severity, duration]

## Workaround steps
1. [Step one]
2. [Step two]
3. [Step three]

## What NOT to do
[Actions that look helpful but make things worse]

## When to escalate
[Conditions where the workaround is not enough and engineering must be involved]

## Review date
[Date when this known error decision must be reviewed]
Linked problem: [KEDB-NNN Jira ticket URL]
```

### 6.3 Code blocks

All code in Confluence pages must be in a code block macro with the
language specified. Agents generate the correct Confluence storage format:

```xml
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">java</ac:parameter>
  <ac:plain-text-body><![CDATA[
    // Code here
  ]]></ac:plain-text-body>
</ac:structured-macro>
```

Supported language values: `java`, `javascript`, `typescript`, `csharp`,
`python`, `sql`, `yaml`, `json`, `xml`, `bash`, `none`

### 6.4 Info, warning, and note panels

Agents use Confluence info panels for important callouts:

```xml
<!-- Info panel -->
<ac:structured-macro ac:name="info">
  <ac:rich-text-body><p>[Info message]</p></ac:rich-text-body>
</ac:structured-macro>

<!-- Warning panel -->
<ac:structured-macro ac:name="warning">
  <ac:rich-text-body><p>[Warning message]</p></ac:rich-text-body>
</ac:structured-macro>

<!-- Note panel -->
<ac:structured-macro ac:name="note">
  <ac:rich-text-body><p>[Note message]</p></ac:rich-text-body>
</ac:structured-macro>
```

---

## 7. Agent page ownership

Each page type has a primary owner agent. Only the owner agent creates
and updates that page type. Other agents may read all pages.


| Page type                    | Owner agent            | May also update                           |
| ---------------------------- | ---------------------- | ----------------------------------------- |
| Technical spec               | Spec Writer            | Documentation (minor updates after merge) |
| ADR                          | Arch Doc               | Spec Writer (status field only)           |
| Architecture overview        | Arch Doc               | --                                        |
| API documentation            | Documentation          | Spec Writer                               |
| Runbook                      | Release, Documentation | SRE (execution notes only)                |
| KEDB entry (Jira)            | Problem Management     | --                                        |
| KEDB workaround (Confluence) | Problem Management     | SRE (frequency counts)                    |
| Incident record              | Incident Response      | SRE                                       |
| Post-mortem                  | Incident Response      | --                                        |
| Sprint report                | Stakeholder Report     | Planning                                  |
| Onboarding guide             | Documentation          | Onboarding Agent                          |


---

## 8. Searching Confluence

Agents use CQL (Confluence Query Language) for structured searches.

### 8.1 Standard CQL queries

```
-- Find technical spec for a feature
type = page AND label = "technical-spec" AND title ~ "order cancellation"
AND space = "ENG"

-- Find all ADRs in architecture space
type = page AND label = "adr" AND space = "ARCH"
ORDER BY title ASC

-- Find runbooks for a specific service
type = page AND label = "runbook" AND title ~ "orders service"
AND space = "OPS"

-- Find pages updated by agents in the last 7 days
type = page AND label = "ai-updated"
AND lastModified >= "2025-01-08"
ORDER BY lastModified DESC

-- Find KEDB entries due for review
type = page AND label = "kedb"
AND space = "OPS"
ORDER BY lastModified ASC

-- Find pages awaiting human review
type = page AND label = "awaiting-review"
ORDER BY created DESC
```

### 8.2 Search scope restrictions

Agents must include a `space` filter in all searches unless
explicitly cross-space search is required. Unrestricted searches
can return content from spaces the team should not be reading.

---

## 9. Cross-referencing Jira and Confluence

Agents maintain bidirectional links between Jira issues and Confluence
pages. This is how the two systems stay connected.

### 9.1 From Confluence to Jira

Every Confluence page created by an agent includes a References section
with a link to the originating Jira ticket:

```
## References
- Jira story: [PROJ-412](https://telia-company.atlassian.net/browse/PROJ-412)
- Related ADR: [ADR-042](https://telia-company.atlassian.net/wiki/...)
```

### 9.2 From Jira to Confluence

When an agent creates or significantly updates a Confluence page, it
adds the page URL as a Jira remote link on the originating ticket:

```
Remote link title: "Technical spec -- [page title]"
Remote link URL:   [Confluence page URL]
Icon URL:          Confluence favicon URL
```

This ensures engineers can navigate from a Jira story directly to its
specification without searching.

---

## 10. Rate limiting and error handling


| Response code           | Meaning                            | Agent action                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------ |
| 429 Too Many Requests   | Rate limit hit                     | Wait for Retry-After, then retry                 |
| 409 Conflict            | Page version conflict              | Re-read current version, merge, retry            |
| 404 Not Found           | Page or space does not exist       | Stop, flag to human -- do not create replacement |
| 403 Forbidden           | Insufficient permissions           | Stop, flag permission error to human             |
| 400 Bad Request         | Invalid content or metadata        | Log error, do not retry, flag to human           |
| 503 Service Unavailable | Confluence temporarily unavailable | Retry with exponential backoff (max 3)           |


**Version conflict (409) handling:**

Version conflicts occur when two agents or an agent and a human update
the same page concurrently. Agents handle this by:

1. Re-reading the current page version
2. Identifying what changed in the concurrent edit
3. Merging the changes carefully -- agent content goes in agent sections,
  human content is preserved exactly
4. Retrying the update with the new version number
5. If merge is not possible cleanly, flagging to human for manual resolution

---

## 11. Agent service account

All agents authenticate to Confluence using the same service account
as Jira -- this is standard for Atlassian Cloud.


| Setting               | Value                                                             |
| --------------------- | ----------------------------------------------------------------- |
| Service account email | [ai-agents@telia-company.com](mailto:ai-agents@telia-company.com) |
| Display name          | AI Engineering Agent                                              |
| Token storage         | Azure Key Vault -- secret name: confluence-api-token              |
| Token rotation        | Quarterly -- DevOps responsibility                                |
| Permissions           | Space Member (create/edit) on all permitted spaces                |


---

## 12. Version and review


| Attribute       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| File owner      | CoE Core + Tech Lead representatives                  |
| Review cadence  | Quarterly -- or when Confluence configuration changes |
| Last reviewed   | 2026-04                                               |
| Next review due | 2026-04                                               |
| Approvers       | CoE Lead, Tech Lead representative                    |
| Change process  | PR to ai-engineering-common, 2 CoE approvals required |


