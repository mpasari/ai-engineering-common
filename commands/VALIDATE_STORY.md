# VALIDATE_STORY.md
# Command: VALIDATE_STORY
# Category: Operations
# Agent: A16 Feature Validation Agent
# Version: 1.0.0

---

## What this command does

Runs automated acceptance criteria execution for a Jira story against
the test environment. Executes each AC as an HTTP or Kafka test,
asserts on results, and transitions story status based on outcome.

---

## When to use it

- When a story moves to QA status
- To re-validate after fixing failing ACs
- Before moving a story to Done

---

## Required inputs

```
Jira story key
Example: VALIDATE_STORY PROJ-412
```

---

## Usage

```
VALIDATE_STORY PROJ-412
```

---

## What to expect

1. Feature Validation checks test environment health
2. Reads all ACs from the story
3. Calls AC Executor for each HTTP/state AC
4. Delegates Kafka ACs to Kafka Skill Agent
5. Runs Accessibility Agent for UI code
6. Aggregates results and posts report to Jira and PR
7. Transitions story to Done (all pass) or In Progress (any fail)

---

## Output

- AC execution report in Jira comment and PR comment
- Pass/fail/blocked/skip result per AC
- Story status transition based on result
- Accessibility violations listed for UI stories

---

## Notes

- Only runs against test environment -- never production
- Ambiguous ACs are SKIP and require manual verification
- All evidence is PII-scrubbed before output
