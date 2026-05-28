---
mode: agent
description: Execute the 7-phase brownfield discovery scan on an existing codebase to populate all .ai/project/ files.
tools:
  - githubRepo
  - codebase
  - edit
  - execute
  - read
  - search
  - confluence-mcp
  - jira-mcp
edit, execute, read, codebase. If any are missing, say which ones
and ask the engineer to enable them in the tools panel before continuing.

Execute the 7-phase scan protocol. Report progress after each phase.

**Phase 1 -- Language and framework detection**
Read pom.xml / build.gradle / package.json / *.csproj / Dockerfile.
Identify: primary language, framework, version, CI tool.
Report: "Phase 1 complete -- Stack: [detected stack]"

**Phase 2 -- Repository structure mapping**
Map all directories to modules.
For each module run: git log --oneline --since="90 days ago" -- [module]/
Classify:
  Active     = commits in last 90 days
  Legacy     = no commits in 90+ days (verify with git log before classifying)
  Deprecated = explicitly marked or empty
Write: .ai/project/MODULE_REGISTRY.md
Report: "Phase 2 complete -- [N] modules found"

**Phase 3 -- Integration discovery**
Scan for: HTTP clients, Kafka config, database connections, SMTP, SMPP, external URLs.
Map all inbound AND outbound integrations with protocol and auth method.
Write: .ai/project/INTEGRATION_MAP.md
Write: .ai/project/KAFKA_TOPICS.md (if Kafka found)
Report: "Phase 3 complete -- [N] integrations found"

**Phase 4 -- Data model and PII discovery**
Find: entity classes, database schemas, migration files, flat files.
Flag: columns and files likely to contain personal data (SSNs, emails, phone numbers).
For any PII flat file not in git: note it is runtime-only and investigate which class loads it.
Write: .ai/project/DATA_MODEL.md
Report: "Phase 4 complete -- [N] entities found, PII fields: [list]"

**Phase 5 -- Technical debt identification**
Find: outdated dependencies, TODO/FIXME comments, large files, unmaintained drivers.
Assign severity: High / Medium / Low.
Assign TD numbers sequentially: TD-001, TD-002 etc.
Write: .ai/project/TECH_DEBT_REGISTRY.md
Report: "Phase 5 complete -- [N] debt items ([H] High, [M] Medium, [L] Low)"

**Phase 6 -- Credential scan**
Scan ALL source files for: passwords, API keys, connection strings, tokens.
Classify each finding:
  Production credential (real IP, real hostname): STOP. Gate C01 blocked.
    Tell engineer: credential must be rotated before Phase 7 can continue.
    Do NOT proceed to Phase 7 until engineer confirms rotation.
  Test credential (private dev IP like 10.x.x.x, test class): Medium severity.
    Log as tech debt item. Continue to Phase 7.
Report finding details WITHOUT reproducing the actual credential value.

**Phase 7 -- Write output files and present gate**
Write: .ai/project/ARCHITECTURE_OVERVIEW.md
Write: .ai/project/SRE_SERVICE_CONFIG.md
Write: .ai/project/FEATURE_ENV_CONFIG.md (stub -- engineer fills in manually)
Write: .ai/project/COMMONS_VERSION.md

Present the Gate C01 summary:
  - Total modules (Active / Legacy / Deprecated)
  - All integrations found
  - All PII fields and flat files found
  - All High severity tech debt items
  - Credential findings (yes/no, severity)
  - Recommended next step: /explain-module [highest-risk-module] DEEP

Tell engineer: "Run git add .ai\ .github\ CLAUDE.md .cursorrules in the terminal
(not through Copilot) then git commit."

Do NOT run git commands yourself.
