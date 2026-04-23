# DRAFT_STORIES.md
# Command: DRAFT_STORIES
# Category: Planning
# Agent: A04 Story Drafter Agent
# Version: 1.0.0

---

## What this command does

Translates meeting notes, a feature brief, a change request ticket, or
an epic description into structured Jira stories with Given/When/Then
acceptance criteria, dependency links, and estimation requests.

---

## When to use it

- After a product discovery or planning meeting
- When a CR ticket needs to be broken into implementable stories
- When an epic needs full story decomposition before a sprint

---

## Required inputs

```
One of:
  -- Meeting notes (paste as text)
  -- Jira CR or Epic ticket key (e.g. PROJ-100)
  -- Feature brief (paste as text)

Optional:
  -- Epic key to link stories to
  -- Target sprint name
  -- Module scope (which modules are in scope)
```

---

## Usage

```
DRAFT_STORIES

[Paste meeting notes / feature brief here]

or

DRAFT_STORIES PROJ-100
```

---

## What to expect

1. Story Drafter Agent reads the input
2. Checks for duplicate stories in the backlog
3. Generates stories with full ACs in Jira
4. Sequences stories by dependency
5. Presents gate C02 for BA/PO review of ACs
6. After C02 approval: stories are set to Ready and Estimation Agent is called

---

## Output

- N Jira stories created in [PROJECT-KEY] backlog
- Stories linked to epic (if provided)
- Dependency chain documented
- Estimation requested via A05 Estimation Agent
- Gate C02 presented for BA/PO acceptance criteria confirmation

---

## Example

```
DRAFT_STORIES

Meeting notes 2025-01-15:
Agreed to add order cancellation feature to the Orders service.
Customers should be able to cancel orders that are in PENDING or
PROCESSING status. A cancellation reason is required. Once cancelled,
the customer should receive a confirmation email. The inventory team
needs to be notified via Kafka so stock can be released.
```

---

## Notes

- Stories > 8 points will have split recommendations
- The agent checks MODULE_REGISTRY.md to set the correct component field
- Personal data fields in the brief are flagged for privacy review
- Ambiguous requirements are documented as open questions, not resolved
