# REQUEST_SPRINT_PLAN.md
# Command: REQUEST_SPRINT_PLAN
# Category: Planning
# Agent: A03 Planning Agent
# Version: 1.0.0

---

## What this command does

Generates a sprint plan summary from the current Jira sprint board --
capacity analysis, dependency risks, story distribution, and recommended
actions before the sprint starts.

---

## When to use it

- At sprint start during the planning ceremony
- When reviewing sprint commitment vs capacity

---

## Required inputs

```
Optional:
  -- Sprint name (defaults to current active sprint)
  -- Project key (defaults to project in .ai/project/)

Example: REQUEST_SPRINT_PLAN Sprint 43
         REQUEST_SPRINT_PLAN (uses current sprint)
```

---

## Usage

```
REQUEST_SPRINT_PLAN

or

REQUEST_SPRINT_PLAN Sprint 43
```

---

## What to expect

1. Planning Agent reads current sprint from Jira
2. Calculates committed points vs recommended capacity (80% of avg velocity)
3. Checks for dependency-blocked stories
4. Identifies high-risk stories (Legacy module, low confidence estimate)
5. Publishes plan to Confluence and posts link

---

## Output

- Sprint plan page in Confluence with:
  - Capacity summary (committed vs recommended)
  - Story table with risk flags
  - Dependency risk list
  - Recommended pre-sprint actions
- Jira sprint description updated with Confluence link

---

## Notes

- Velocity is calculated from the last 3 completed sprints
- Stories without estimates are flagged as risks
- Cross-team blockers are flagged for Cross-team Coordinator review
