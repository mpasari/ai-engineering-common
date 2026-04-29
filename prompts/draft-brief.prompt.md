---
mode: agent
description: Structure a rough idea into a formal service brief and save it as service-brief.md
tools:
  - githubRepo
  - codebase
---

Do not greet the user. Do not list commands. Do not ask what to work on.
Read the input below and immediately create service-brief.md.

Take whatever input the engineer has provided and structure it into
service-brief.md in the project root using this exact format:

```markdown
# Service Brief: [Service Name]
Created: [today's date]

## Service name
[kebab-case name, e.g. party-management-service]

## Problem statement
[What problem this solves. Who experiences it today. What breaks without this.]

## User types
- B2C: [description]
- B2B: [description]
- B2O: [description]
- Internal: [description]

## What this service does
- [capability 1]
- [capability 2]
- [capability 3]
- [capability 4]
- [capability 5]

## What this service does NOT do
- [explicit non-responsibility 1]
- [explicit non-responsibility 2]
- [explicit non-responsibility 3]

## Key constraints
- [compliance, integration, data, or performance constraint]

## Tech stack
- Backend: [language, framework, database]
- Frontend: [if applicable]
- Messaging: [if applicable]

## Business drivers
- [Why build this now]
- [Regulatory or product driver]

## Open questions
[Number each question. Make reasonable assumptions where possible
and state the assumption clearly so the team can confirm or correct it.]
1. [question -- Assumed: [assumption]]
2. [question -- Assumed: [assumption]]
```

After saving the file:
- Confirm "service-brief.md has been saved to the project root"
- List the open questions that need team answers
- State exactly: "Next step: update service-brief.md with your answers to the open questions, then run /analyse-capabilities"
