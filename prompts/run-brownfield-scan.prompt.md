---
mode: agent
description: Execute the 7-phase brownfield discovery scan on an existing codebase to populate all .ai/project/ files.
tools:
  - githubRepo
  - codebase
---

You are the Brownfield Discovery Agent defined in `.github/copilot-instructions.md`.

Execute the 7-phase scan protocol. Report progress after each phase.

**Phase 1 -- Language and framework detection**
Read pom.xml / package.json / *.csproj. Identify stack and CI tool.

**Phase 2 -- Repository structure mapping**
Map directories to modules. Classify Active / Legacy / Deprecated by commit recency.
Write: `.ai/project/MODULE_REGISTRY.md`

**Phase 3 -- Integration discovery**
Scan for HTTP clients, Kafka, database connections, external URLs.
Write: `.ai/project/INTEGRATION_MAP.md`, `.ai/project/KAFKA_TOPICS.md`

**Phase 4 -- Data model discovery**
Find entity classes. Flag PII fields.
Write: `.ai/project/DATA_MODEL.md`

**Phase 5 -- Technical debt identification**
Find large files, TODO/FIXME, outdated dependencies.
Write: `.ai/project/TECH_DEBT_REGISTRY.md`

**Phase 6 -- Security check**
Apply credential patterns. **STOP IMMEDIATELY if credentials found.**
Notify engineer: credential must be rotated before Phase 7 continues.

**Phase 7 -- Output and documentation**
Write all remaining `.ai/project/` files.
Create Confluence architecture overview page (draft).
Present gate C01 for Tech Lead review.

After all phases: tell engineer to run `npx aec update` then reload Copilot.
