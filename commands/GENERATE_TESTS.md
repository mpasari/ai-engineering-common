# GENERATE_TESTS.md
# Command: GENERATE_TESTS
# Category: Engineering
# Agent: A15 Test Gen Agent
# Version: 1.0.0

---

## What this command does

Generates a complete test suite for an existing class, module, or set
of files. Covers unit tests, integration test stubs, and accessibility
tests for UI code. Verifies tests pass before committing.

---

## When to use it

- When tests are missing for existing code
- After GENERATE_CODE to add extra test coverage
- When a known error is resolved and a regression test is needed

---

## Required inputs

```
One of:
  -- Jira story key: GENERATE_TESTS PROJ-412
  -- File path: GENERATE_TESTS src/main/java/com/telia/orders/domain/Order.java
  -- Module name: GENERATE_TESTS orders-domain
```

---

## Usage

```
GENERATE_TESTS PROJ-412

or

GENERATE_TESTS src/main/java/com/telia/orders/domain/Order.java
```

---

## Output

- Unit test files committed alongside source files
- Integration test stubs with Testcontainers setup
- Accessibility tests (jest-axe) for React components
- Coverage report -- flags if below project threshold
- Gate D05 presented if coverage remains below threshold

---

## Notes

- Tests run in sandbox before committing -- failing tests are fixed automatically
- Test data uses fictional values -- never real personal data
- The command will not generate tests for production-environment-only code
