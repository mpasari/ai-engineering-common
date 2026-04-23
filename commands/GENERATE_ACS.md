# GENERATE_ACS.md
# Command: GENERATE_ACS
# Category: Specification
# Agent: A07 Spec Writer Agent / A04 Story Drafter Agent
# Version: 1.0.0

---

## What this command does

Generates Given/When/Then acceptance criteria from a plain-language
feature description or an existing story with insufficient ACs.

---

## When to use it

- When a story has a summary but no ACs
- When ACs need expanding before refinement
- When a BA needs a starting point for AC writing

---

## Required inputs

```
One of:
  -- Jira story key: GENERATE_ACS PROJ-412
  -- Feature description: GENERATE_ACS [paste description]
```

---

## Usage

```
GENERATE_ACS PROJ-412

or

GENERATE_ACS
The user should be able to cancel an order. Cancellation requires a reason.
Only PENDING orders can be cancelled. The system should notify the customer.
```

---

## Output

- Given/When/Then ACs posted as Jira comment or printed for review
- Happy path + error cases + edge cases covered
- Ambiguous requirements documented as questions, not resolved
- Flagged: ACs that may require tech clarification before implementation

---

## Notes

- Generated ACs require BA/PO review before gate C02
- This command does not update the Jira story directly -- human pastes
  reviewed ACs into the story description
