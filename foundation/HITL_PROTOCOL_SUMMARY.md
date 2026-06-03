# HITL_PROTOCOL — Copilot Summary
# Full protocol: foundation/HITL_PROTOCOL.md
# This summary is used in copilot-instructions.md to keep context lean.
# Copilot enforces gates. Full protocol detail is in HITL_PROTOCOL.md.

## Gate rule: stop and present output. Never proceed past a gate autonomously.

## Gates that apply to daily development work

| Gate | Trigger | Approver | How to approve |
|---|---|---|---|
| C01 | Technical spec ready | Tech Lead | Type: APPROVED C01 [JIRA-KEY] |
| C02 | Acceptance criteria generated | Product Owner | Type: APPROVED C02 [JIRA-KEY] |
| D01 | PR ready for merge | Tech Lead | Merge the PR |
| D02 | Security BLOCK found in review | Security Lead | Type: APPROVED D02 [JIRA-KEY] |
| A01 | Any merge to main/release | Tech Lead | Merge the PR |

## Gate output format (mandatory)

When a gate is reached, present this block -- then stop and wait:

```
=== GATE [ID] ===
Status: PENDING APPROVAL
Story: [Jira key]
Approver: [role]
Decisions required:
  [numbered list]
To approve: [exact instruction]
To request changes: CHANGES [ID] [Jira key] [feedback]
=== END GATE [ID] ===
```

## Never proceed past a gate based on assumption or inference.
## Never skip a gate because the task seems low-risk.
