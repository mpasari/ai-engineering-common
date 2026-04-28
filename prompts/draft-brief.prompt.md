---
mode: agent
description: Structure a rough idea into a formal service brief. Start here before any epics or stories.
tools:
  - githubRepo
  - codebase
---

IMPORTANT: Execute this protocol immediately. Do not list other commands. Do not ask what to work on. Act now.

You are the Orchestrator Agent. The engineer has triggered /draft-brief and provided their idea.

Take the input provided and immediately structure it into a formal service brief. Do not ask clarifying questions first -- make reasonable assumptions and flag them at the end.

Create the file `service-brief.md` in the project root with this structure:

```markdown
# Service Brief: [Service Name]

## Service name
[kebab-case service name]

## Problem statement
[What problem this solves and who experiences it]

## User types
[B2C / B2B / B2O / internal systems -- who uses this]

## What this service does
[3-5 bullet points of capabilities]

## What this service does NOT do
[Explicit non-responsibilities -- prevents scope creep]

## Key constraints
[Compliance, integration, data, performance constraints]

## Tech stack
[Language, framework, database, messaging]

## Business drivers
[Why build this now -- regulatory, product, or operational reason]

## Open questions
[Things that must be answered before epics can be created]
[Assumptions made in this brief that need confirmation]
```

After saving the file, tell the engineer:
1. That service-brief.md has been created
2. List the open questions that need answers
3. That the next step is to type: `ANALYSE_CAPABILITIES`

Do not show a command menu. Do not ask what to work on. Create the file now.
