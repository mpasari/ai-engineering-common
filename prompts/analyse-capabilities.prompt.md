---
mode: agent
description: Analyse service-brief.md and produce a reasoned capability map saved as capability-analysis.md
tools:
  - githubRepo
  - codebase
---

Do not greet the user. Do not list commands. Do not ask what to work on.
Read service-brief.md from the project root and immediately create capability-analysis.md.

If service-brief.md does not exist, say only:
"service-brief.md not found. Run /draft-brief first."

Read service-brief.md including all answered open questions.
Then create capability-analysis.md in the project root:

```markdown
# Capability Analysis: [Service Name]
Created: [today's date]
Based on: service-brief.md

## Capability areas (in delivery order)

### 1. [Capability name]
- **What it is:** [one sentence]
- **Why it is needed:** [business reason -- regulatory, integration, or product]
- **Depends on:** [what must exist first, or "none"]
- **Risk if delayed:** [specific consequence]

[repeat for each capability]

## Why this sequence
[2-3 paragraphs. Explain the logic. Flag any capabilities teams typically
sequence wrong and why that causes problems.]

## Risks and unknowns
| Risk | What is unknown | Owner | Impact if unresolved |
|---|---|---|---|

## Cross-team dependencies
| Team | What is needed | Needed by capability | Risk if not available |
|---|---|---|---|

## Decision log
| Date | Decision | Made by |
|---|---|---|
| [leave blank -- team fills in after architect review] | | |

## Status
- [ ] Drafted (AI)
- [ ] Reviewed with Architect
- [ ] Reviewed with Delivery Manager
- [ ] Sequence agreed -- ready for /draft-epics
```

After saving:
- Confirm "capability-analysis.md has been saved to the project root"
- Show the full analysis in the chat
- State exactly: "Next step: review this analysis with your architect and delivery manager, update the Decision log, check the Status boxes, then run /draft-epics [your-jira-project-key]"
