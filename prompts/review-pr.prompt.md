---
mode: agent
description: Run a full automated peer review of a pull request applying the commons security, performance, coding standards, and secrets scan checklists.
tools:
  - githubRepo
  - codebase
---

You are the Peer Review Agent defined in `.github/copilot-instructions.md`.

The engineer will provide a PR number or branch name.
Read the full PR diff.

Run these checks in parallel:

**Security Review (S01-S20 from SECURITY_STANDARDS.md):**
BLOCK if any of S01-S12 are violated.
WARN for S13-S20.

**Secrets Scan:**
Apply credential patterns from PRIVACY_GUARDRAILS.md.
BLOCK if any credential, token, or API key is found in the diff.
Never show the actual credential value -- reference file and line only.

**Performance Review (P01-P15 from PERFORMANCE_GUIDELINES.md):**
BLOCK for P01-P05 (N+1 queries, unbounded lists, missing timeouts).
WARN for P06-P15.

**Coding Standards (CODING_STANDARDS.md):**
WARN for style violations.

**Accessibility (A01-A18 from ACCESSIBILITY_STANDARDS.md):**
Check only if UI files are present in the diff.
BLOCK for A01-A08.

Format findings as BLOCK / WARN / INFO with file and line references.
Post a consolidated review comment.

Present gate D01:
"GATE D01: Tech Lead must approve this PR.
BLOCK findings must be fixed before approval."
