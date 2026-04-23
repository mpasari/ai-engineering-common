# REVIEW_SECURITY.md
# Command: REVIEW_SECURITY
# Category: Security
# Agent: A22 Security Review Agent
# Version: 1.0.0

---

## What this command does

Applies the full SECURITY_STANDARDS.md checklist (S01-S20) to a file,
PR, or directory. Produces BLOCK/WARN findings with compliant code
alternatives. Triggers gate D02 for BLOCK findings.

---

## When to use it

- Before submitting a PR for review
- When reviewing security-sensitive code (auth, data handling)
- As a manual step when REVIEW_PR is not running automatically

---

## Required inputs

```
One of:
  -- PR number: REVIEW_SECURITY PR:142
  -- File path: REVIEW_SECURITY src/main/java/.../OrderController.java
  -- Directory: REVIEW_SECURITY src/main/java/com/telia/orders/api/
```

---

## Usage

```
REVIEW_SECURITY PR:142

or

REVIEW_SECURITY src/main/java/com/telia/orders/api/
```

---

## Output

- Structured security review with BLOCK/WARN findings
- SECURITY BLOCK format per SECURITY_STANDARDS.md section 9
- Compliant code alternative for each BLOCK finding
- Gate D02 presented to Security Lead for BLOCK findings

---

## Notes

- BLOCK findings must be fixed before any PR can be merged
- Applies S01-S12 (BLOCK) and S13-S20 (WARN) per SECURITY_STANDARDS.md
- Does not check for secrets in code -- use SCAN_SECRETS for that
