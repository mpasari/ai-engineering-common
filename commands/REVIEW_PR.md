# REVIEW_PR.md
# Command: REVIEW_PR
# Category: Engineering
# Agent: A27 Peer Review Agent
# Version: 1.0.0

---

## What this command does

Runs a full peer review of an open pull request -- applying all
checklist items from CODING_STANDARDS, SECURITY_STANDARDS,
PERFORMANCE_GUIDELINES, and ACCESSIBILITY_STANDARDS. Coordinates
parallel Security Review and Secrets Scan.

---

## When to use it

- After opening a PR manually (code written without GENERATE_CODE)
- To re-review a PR after addressing review feedback
- Before presenting a PR to the Tech Lead for gate D01

---

## Required inputs

```
PR number or URL
Example: REVIEW_PR 142
         REVIEW_PR https://github.com/telia-company/order-service/pull/142
```

---

## Usage

```
REVIEW_PR 142
```

---

## What to expect

1. Peer Review reads full PR diff
2. Security Review Agent runs in parallel
3. Secrets Scan Agent runs in parallel
4. Accessibility Agent runs in parallel (if UI code present)
5. Spec compliance checked (if spec linked in PR or Jira)
6. Consolidated review comment posted to PR

---

## Output

- Structured PR review comment with BLOCK/WARN/INFO findings
- Security review findings (from A22)
- Secrets scan result (from A25)
- Accessibility findings (from A19, if UI code)
- Gate D01 prepared for Tech Lead approval (if no BLOCK findings)

---

## Notes

- Agent submits COMMENT or REQUEST_CHANGES -- never APPROVE
- BLOCK findings must be fixed before gate D01 can proceed
- Hotfix PRs use expedited review (BLOCK only, WARN deferred)
