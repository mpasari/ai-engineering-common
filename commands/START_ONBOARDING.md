# START_ONBOARDING.md
# Command: START_ONBOARDING
# Category: Project setup
# Agent: A33 Onboarding Agent
# Version: 1.0.0

---

## What this command does

Generates a personalised onboarding guide for a new engineer from the
project-layer files. Selects starter Jira tickets appropriate for a
newcomer and remains available to answer orientation questions.

---

## When to use it

- When a new engineer joins the team
- When an engineer takes over a new codebase

---

## Required inputs

```
Engineer name (required)
Role (required): backend / frontend / full-stack / devops / qa
Start date (optional -- defaults to today)

Example: START_ONBOARDING name="Anna" role="backend"
         START_ONBOARDING name="Erik" role="full-stack" start="2025-02-01"
```

---

## Usage

```
START_ONBOARDING name="Anna" role="backend"
```

---

## Output

- Personalised onboarding guide in Confluence (draft -- Tech Lead review)
- Week 1 and Week 2 structure with specific tasks
- Links to key documentation, ADRs, architecture pages
- 1-3 suggested starter Jira tickets
- Onboarding Agent available for orientation Q&A

---

## Notes

- Starter tickets are in Active modules with good test coverage -- not Legacy
- Guide is draft until Tech Lead removes the awaiting-review label
- Agent answers follow-up orientation questions at any depth level
- After 2 weeks engineer should consult documentation directly
