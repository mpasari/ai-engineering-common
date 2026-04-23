# RUN_BROWNFIELD_SCAN.md
# Command: RUN_BROWNFIELD_SCAN
# Category: Project setup
# Agent: A14 Brownfield Discovery Agent
# Version: 1.0.0

---

## What this command does

Executes the 7-phase brownfield scan protocol on an existing codebase:
language detection, structure mapping, integration discovery, data model
analysis, tech debt identification, security check, and documentation
output. Populates all .ai/project/ files.

---

## When to use it

- Taking ownership of an existing codebase with no AI tooling
- Existing .ai/project/ files are empty or stale
- Team has grown and needs refreshed documentation

---

## Required inputs

```
Optional scope:
  -- Full scan (default): RUN_BROWNFIELD_SCAN
  -- Specific modules: RUN_BROWNFIELD_SCAN orders-domain,orders-api
```

---

## Usage

```
RUN_BROWNFIELD_SCAN

or

RUN_BROWNFIELD_SCAN --modules orders-domain,orders-api
```

---

## What to expect

1. 7-phase scan executes sequentially (30-60 min for medium codebase)
2. Phase 6 (security) halts if exposed credentials are found -- must be resolved before Phase 7
3. All project-layer files written to .ai/project/
4. Architecture overview page drafted in Confluence
5. Tech debt Jira stories created for High severity findings
6. Gate C01 presented for Tech Lead review of discovery output

---

## Output

- All .ai/project/ stub files populated
- MODULE_REGISTRY.md, INTEGRATION_MAP.md, DATA_MODEL.md complete
- TECH_DEBT_REGISTRY.md with High/Medium findings
- Architecture overview page in Confluence (draft)
- Gate C01 for Tech Lead approval

---

## Notes

- Scan is read-only until Phase 7 (no code changes)
- Exposed credentials halt the scan -- rotation required before completion
- Run npx aec update after the scan to refresh CLAUDE.md and copilot-instructions.md
