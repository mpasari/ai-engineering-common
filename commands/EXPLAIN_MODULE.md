# EXPLAIN_MODULE.md
# Command: EXPLAIN_MODULE
# Category: Engineering
# Agent: A11 Legacy Explainer Agent
# Version: 1.0.0

---

## What this command does

Analyses a module or code file and produces a structured explanation:
entry points, call graph, data flows, test coverage, and risk assessment.
Use before modifying unfamiliar or legacy code.

---

## When to use it

- Before working in a Legacy module for the first time
- When debugging an unfamiliar code path
- During onboarding to understand a specific module

---

## Required inputs

```
One of:
  -- Module name from MODULE_REGISTRY.md
  -- File path
  -- Entry point class/function name

Optional depth:
  -- SURFACE (fast, 5-10 min) -- default for quick orientation
  -- STANDARD (15-30 min) -- default for pre-modification review
  -- DEEP (30-60 min) -- for major refactoring

Example: EXPLAIN_MODULE orders-domain
         EXPLAIN_MODULE src/main/java/com/telia/orders/domain/Order.java DEEP
```

---

## Usage

```
EXPLAIN_MODULE orders-domain

or

EXPLAIN_MODULE OrderApplicationService DEEP
```

---

## Output

- Module purpose and responsibility
- Entry points and call graph
- External dependencies
- Data flow (inputs and outputs)
- Test coverage estimate
- Risk level (Low / Medium / High / Critical)
- Modification guidance for the current task

---

## Notes

- Critical risk level triggers a recommendation to involve the Architect
- The agent never modifies code -- analysis only
- Results are used by Code Gen and Refactor agents automatically
