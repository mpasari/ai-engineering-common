# GENERATE_CODE.md
# Command: GENERATE_CODE
# Category: Engineering
# Agent: A09 Code Gen Agent
# Version: 1.0.0

---

## What this command does

Generates production-ready code from an approved technical specification.
Commits to a feature branch, generates tests, and opens a PR for review.
Requires gate C01 to be approved before running.

---

## When to use it

- After WRITE_SPEC and gate C01 approval
- When implementing a story with an approved spec

---

## Required inputs

```
Jira story key (spec must already be approved at gate C01)
Example: GENERATE_CODE PROJ-412
```

---

## Usage

```
GENERATE_CODE PROJ-412
```

---

## What to expect

1. Code Gen reads the approved Confluence spec
2. Analyses affected files (reads existing code before modifying)
3. Generates code in dependency order (domain -> service -> controller)
4. Commits in logical steps to feature branch
5. Calls Test Gen Agent to generate tests
6. Opens PR and calls Peer Review Agent
7. Presents gate D01 for Tech Lead PR approval

---

## Output

- Code committed to branch: feature/PROJ-412-[description]
- Test suite generated alongside code
- PR opened with auto-generated description
- Security and performance checks run automatically
- Gate D01 presented for Tech Lead merge approval

---

## Notes

- Requires approved spec (gate C01 must have been passed)
- New unapproved dependencies trigger gate B04
- Legacy module changes trigger gate D04
- All commits include Agent trailer per GITHUB_INTEGRATION.md
