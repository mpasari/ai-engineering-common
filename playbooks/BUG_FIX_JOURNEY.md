# BUG_FIX_JOURNEY.md
# Playbooks -- End-to-end journey: triaging and fixing a bug
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## Overview

Use this playbook for any bug report -- whether it comes from a
user, a monitoring alert, or a test failure. The flow takes a
vague bug report and turns it into a fixed, tested, documented
resolution.

**Tools needed:** Claude Code (with Jira MCP)
**Time:** 30 min to triage. Fix time varies by bug complexity.

---

## Step 1 -- Triage the bug

```
# In Claude Code:
TRIAGE_BUG [BUG-KEY]
```

**What happens:**

1. Claude Code reads the bug ticket from Jira
2. Checks the KEDB (Known Error Database) for a matching known error
3. If known error found: links the ticket to the existing KEDB entry
   and surfaces the workaround. Investigation complete -- skip to Step 5.
4. If new bug: enriches the ticket with:
   - Severity classification (P0-P3)
   - Affected module identification
   - Root cause hypotheses (ranked by probability)
   - Structured reproduction steps

**For P0 bugs:** Claude Code immediately notifies the on-call engineer
via a Jira comment and recommends declaring an incident.
If this is production-critical: run `DECLARE_INCIDENT` instead of continuing here.

---

## Step 2 -- Understand the affected code

Before attempting a fix:

```
# In Claude Code:
EXPLAIN_MODULE [module-identified-in-triage]
```

For bugs where the triage result pointed to a specific hypothesis,
use the Standard depth analysis. For bugs in Legacy or unfamiliar
modules, use Deep:

```
# In Claude Code:
EXPLAIN_MODULE [module-name] DEEP
```

Review the call graph and root cause hypotheses together. Make sure
you understand the code path before touching anything.

---

## Step 3 -- Reproduce the bug locally

Follow the reproduction steps from the triage output. Confirm the
bug reproduces in your local test environment.

```
# Verify test environment is healthy
curl http://localhost:8080/health

# Run the reproduction steps from the triage output
# [steps are specific to the bug]

# Confirm the bug: you see the actual behaviour, not the expected one
```

If the triage reproduction steps are inferred (not confirmed from the
bug report), update them in Jira based on what you actually observe.

---

## Step 4 -- Write the fix

For most bugs, write the fix manually using Copilot assistance:

```
# In VS Code with Copilot Chat:
"I have a bug where [describe symptom]. The root cause is [hypothesis].
 Looking at [paste the relevant code], how should I fix this?"

# Or in Cursor Composer for multi-file fixes:
"Fix the bug in [module] where [symptom]. The root cause is [hypothesis].
 Follow the patterns in BACKEND_PATTERNS.md."
```

### When to use GENERATE_CODE for bug fixes

For bugs where the fix requires:
- Implementing a missing validation that should have been there
- Adding error handling that was omitted
- Refactoring a method to remove an N+1 query

You can use `GENERATE_CODE` with the bug ticket key:

```
# In Claude Code (if the bug has clear ACs for the fix):
GENERATE_CODE [BUG-KEY]
```

This works best when the bug ticket has structured ACs (which TRIAGE_BUG
creates automatically). For vague bug reports, write the fix manually.

---

## Step 5 -- Write the regression test

**This step is not optional.** A bug without a regression test
will reappear.

```
# In Claude Code:
GENERATE_TESTS [BUG-KEY]
```

Or manually:

```
# In VS Code with Copilot Chat:
"Write a unit test that would have caught this bug: [describe the bug and fix]"
```

The test must:
- Reproduce the exact bug condition (what the user experienced)
- Assert the fixed behaviour
- Be in the test file for the affected class

Run the test before the fix to verify it fails (red), then after
the fix to verify it passes (green). This confirms the test is meaningful.

---

## Step 6 -- Review and validate

```
# In Claude Code:
REVIEW_PR [PR-NUMBER]
```

For a bug fix, the review focuses on:
- Is the fix minimal? (does not change unrelated code)
- Is the regression test meaningful?
- Does the fix introduce any security issues?
- Does the fix follow the coding patterns for this module?

```
# In Claude Code:
VALIDATE_STORY [BUG-KEY]
```

The AC Executor runs the bug fix ACs:
- At minimum: the scenario that was broken now passes
- The regression test passes
- No other related scenarios are now broken

---

## Step 7 -- Raise a problem record (if recurring)

If this is the second or third time this type of bug has occurred:

```
# In Claude Code:
RAISE_PROBLEM [BUG-KEY-1], [BUG-KEY-2], [BUG-KEY-3]
```

The Problem Management Agent creates a KEDB entry, documents the
root cause, and asks for a fix decision (fix now / defer / accept).
Future occurrences of the same pattern will match the KEDB and be
logged automatically rather than creating new investigation work.

---

## Step 8 -- Update documentation (if needed)

For bugs caused by an undocumented invariant or missing constraint:

```
# In Claude Code:
Update MODULE_REGISTRY.md for [module] to document the invariant we just discovered.
Update TECH_DEBT_REGISTRY.md if this bug reveals underlying technical debt.
```

---

## Bug fix checklist

```
[ ] TRIAGE_BUG run -- severity and module identified
[ ] KEDB checked -- not a known error (or linked if it is)
[ ] EXPLAIN_MODULE run -- understand code before touching it
[ ] Bug reproduced locally
[ ] Fix written and tested manually
[ ] Regression test written (the test fails before fix, passes after)
[ ] REVIEW_PR passed (no BLOCK findings)
[ ] VALIDATE_STORY passed (all ACs green)
[ ] RAISE_PROBLEM if this is the third or more occurrence
```

---

## When bugs become incidents

Escalate to `DECLARE_INCIDENT` when:
- P0 bug (production down or data loss)
- P1 bug that has been unresolved for more than 30 minutes
- Bug is impacting a significant number of users right now
- SLO breach is occurring or imminent

Do not try to fix a P0 bug quietly. Declare the incident first,
get the right people in the room, then fix.

---

## Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
