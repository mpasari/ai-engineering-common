# ESTIMATE_STORIES.md
# Command: ESTIMATE_STORIES
# Category: Planning
# Agent: A05 Estimation Agent
# Version: 1.0.0

---

## What this command does

Provides calibrated story point suggestions for one or more Jira stories,
with transparent reasoning based on comparable historical stories, module
complexity, and risk factors.

---

## When to use it

- Before a backlog refinement session
- After DRAFT_STORIES creates new stories
- When re-estimating after scope change

---

## Required inputs

```
One of:
  -- Single Jira ticket key: PROJ-412
  -- List of ticket keys: PROJ-412, PROJ-413, PROJ-414
  -- Sprint name: Sprint 42 (estimates all unpointed stories in the sprint)
```

---

## Usage

```
ESTIMATE_STORIES PROJ-412

or

ESTIMATE_STORIES PROJ-412, PROJ-413, PROJ-414

or

ESTIMATE_STORIES Sprint 42
```

---

## What to expect

1. Estimation Agent reads each story's ACs and affected module
2. Searches for comparable completed stories in the last 90 days
3. Applies complexity scoring and risk multipliers
4. Posts estimate suggestions as Jira comments
5. Flags stories > 8 points for split recommendation
6. Reports confidence level per estimate

---

## Output

- Jira comment per story: suggested points, reasoning, comparable stories
- Batch summary if multiple stories: total estimated velocity, split recommendations
- Stories with Low confidence flagged for spike recommendation

---

## Notes

- Estimates are suggestions -- engineers set the actual points
- The agent never modifies the story points field directly
- Low confidence estimate = recommend a 1-day spike before committing
