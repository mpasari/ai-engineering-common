# REQUEST_STANDUP.md
# Command: REQUEST_STANDUP
# Category: Planning
# Agent: A03 Planning Agent
# Version: 1.0.0

---

## What this command does

Generates an async standup update from the current Jira board state --
what was completed, what is in progress, what is blocked, and sprint
progress tracking.

---

## When to use it

- Daily, replacing or supplementing the sync standup meeting
- When team members are in different time zones

---

## Usage

```
REQUEST_STANDUP

or

REQUEST_STANDUP Sprint 43
```

---

## Output

- Standup summary posted to configured channel (Confluence page or Jira comment)
- Blockers flagged with age (blockers > 3 days marked for attention)
- Sprint burn-down status (on track / at risk / behind)

---

## Notes

- Run daily at a configured time via a Jira automation trigger
- Blockers older than 7 days trigger Cross-team Coordinator escalation
- Does not replace human judgement -- engineers add qualitative context
