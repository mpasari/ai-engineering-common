# RUN_REFACTOR.md
# Command: RUN_REFACTOR
# Category: Engineering
# Agent: A10 Refactor Agent
# Version: 1.0.0

---

## What this command does

Executes a code refactoring task -- pattern replacement, library
migration, or structure improvement -- in staged, module-by-module
commits with rollback plans. Requires existing test coverage before
starting.

---

## When to use it

- Tech debt story requires pattern modernisation
- Library upgrade requires API migration (journey J08)
- After an integration change requires adapter updates (journey J09)

---

## Required inputs

```
Jira story key describing the refactoring task
Example: RUN_REFACTOR PROJ-445
```

---

## Usage

```
RUN_REFACTOR PROJ-445
```

---

## What to expect

1. Refactor Agent reads the story for scope and target pattern
2. Inventories affected files
3. Verifies test coverage (minimum 60% before starting)
4. Creates rollback plan in Jira
5. Refactors module by module, one PR per module
6. Gate D01 presented per module PR
7. Gate D03 at completion for overall review

---

## Output

- One PR per module with staged commits
- Rollback plan documented in Jira
- Gate D01 per module PR
- Gate D03 on overall completion
- TECH_DEBT_REGISTRY.md updated to mark item resolved

---

## Notes

- Refactoring never changes observable behaviour
- Bugs found during refactoring get separate tickets -- not fixed inline
- New behaviour during refactoring is rejected -- belongs in a feature story
