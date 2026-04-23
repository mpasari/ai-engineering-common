# SCAN_SECRETS.md
# Command: SCAN_SECRETS
# Category: Security
# Agent: A25 Secrets Scan Agent
# Version: 1.0.0

---

## What this command does

Scans files, directories, or git history for exposed credentials, API
keys, tokens, and private keys. Any confirmed finding is an immediate
BLOCK requiring credential rotation and Security Lead review.

---

## When to use it

- Before committing code that handles credentials or configuration
- When reviewing a legacy codebase for security hygiene
- Monthly full git history audit

---

## Required inputs

```
One of:
  -- File path: SCAN_SECRETS src/main/resources/application.yml
  -- Directory: SCAN_SECRETS src/
  -- Git history: SCAN_SECRETS --history
  -- PR number: SCAN_SECRETS PR:142
```

---

## Usage

```
SCAN_SECRETS src/main/resources/

or

SCAN_SECRETS --history
```

---

## Output

- Finding report: file, line number, credential type (no actual value shown)
- Jira security incident ticket created for confirmed findings
- Gate D02 presented to Security Lead
- Rotation recommendation for any confirmed exposure

---

## Notes

- The actual credential value is NEVER shown in output (file + line only)
- Test files are scanned -- real credentials in test code are still findings
- Production access for credential rotation is a human action -- agent advises only
