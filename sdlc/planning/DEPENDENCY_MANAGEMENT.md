# DEPENDENCY_MANAGEMENT.md
# SDLC -- Planning Stage -- Dependency Management Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Purpose

Defines how teams identify, document, and manage story dependencies
within and across sprints. The Dependency Mapper Agent (A06) and
Cross-team Coordinator Agent (A02) reference this guide when
assessing impact and generating re-sequencing suggestions.

---

## 2. Dependency types

| Type | Definition | Jira link type | Urgency |
|---|---|---|---|
| Hard block | Story B cannot start until Story A is merged | "is blocked by" | High -- resolve before sprint |
| Soft dependency | Story B works better after Story A but can proceed | "relates to" | Medium -- coordinate timing |
| Cross-team | Story B depends on output from another team | "is blocked by" + cross-team label | High -- escalate early |
| External | Story B depends on a third-party API or delivery | "is blocked by" + external label | Critical -- track weekly |

---

## 3. Identifying dependencies

Run dependency analysis before sprint planning:

```
DRAFT_STORIES [epic or CR key]
```

The Story Drafter Agent automatically:
- Checks for existing in-progress stories in the same module
- Identifies cross-team dependencies from INTEGRATION_MAP.md
- Sequences stories by logical dependency order
- Links stories with appropriate Jira link types

For manual dependency check:

```
# JQL -- stories in the same module currently in progress
project = [PROJECT-KEY] AND component = [module-name]
AND status in ("In Progress", "In Review")
```

---

## 4. Cross-team dependency protocol

When a story depends on another team:

```
Step 1: Identify the blocking team and their Jira project key
Step 2: Check if the blocking story exists in their backlog
  -- If yes: link and notify their tech lead
  -- If no: raise a request with their DM/tech lead

Step 3: Add label "cross-team-dependency" to the blocked story
Step 4: Set due date on the blocking story (the date you need it by)
Step 5: Check status weekly -- escalate to Cross-team Coordinator if
        the blocking story has not moved in 3 days
```

---

## 5. Dependency sequencing in sprints

The recommended sequence for a sprint with dependencies:

```
Week 1:
  -- Foundation stories (data model, API contracts, shared components)
  -- These must complete first so Week 2 stories can start

Week 2:
  -- Feature stories that depend on Week 1 foundation
  -- Integration stories (can start once contract is agreed)
  -- UI stories (can start once API contract exists, even before implementation)
```

Never plan a sprint where Story B starts the same day Story A finishes.
Build in at least 1 day buffer for review, merge, and deployment.

---

## 6. When to escalate

Escalate a dependency to the Cross-team Coordinator when:
- The blocking story has been unresolved for > 3 days
- The blocking team has no story in progress to address the dependency
- The dependency puts a PI milestone at risk

Use the RAISE_PROBLEM command if the same dependency pattern recurs
across multiple sprints -- that is a systemic integration problem,
not just a sprint coordination issue.

---

## 7. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
