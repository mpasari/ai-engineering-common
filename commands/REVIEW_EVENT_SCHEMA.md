# REVIEW_EVENT_SCHEMA.md
# Command: REVIEW_EVENT_SCHEMA
# Category: Architecture
# Agent: A21 Event Schema Agent
# Version: 1.0.0

---

## What this command does

Assesses whether a proposed Kafka event schema change is backward
compatible, forward compatible, or breaking. For breaking changes,
generates migration options and presents gate B06 for Architect approval.

---

## When to use it

- Before changing an Avro or JSON schema for a Kafka topic
- When designing a new Kafka topic schema
- When a PR touches event class definitions

---

## Required inputs

```
One of:
  -- Topic name (reviews current schema): REVIEW_EVENT_SCHEMA order.order.placed
  -- PR number (reviews schema change in PR): REVIEW_EVENT_SCHEMA PR:142
  -- Topic name + proposed schema file: REVIEW_EVENT_SCHEMA order.order.placed schema_v2.avsc
```

---

## Usage

```
REVIEW_EVENT_SCHEMA order.order.placed

or

REVIEW_EVENT_SCHEMA PR:142
```

---

## Output

- Compatibility assessment: BACKWARD / FORWARD / FULL / BREAKING
- For BREAKING: list of specific breaking changes and affected consumers
- For BREAKING: three migration options (expand-contract / cutover / new topic)
- Gate B06 for Architect + Tech Lead approval of breaking changes
- For compatible changes: consumer notification tasks created

---

## Notes

- Compatible changes do not require a gate -- consumers notified automatically
- Breaking changes always present gate B06 before any registry update
- PII in event schemas triggers PRIVACY_GUARDRAILS.md compliance review
