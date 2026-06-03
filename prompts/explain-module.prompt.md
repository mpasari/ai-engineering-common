---
mode: agent
description: Deep analysis of a codebase module. Saves complete analysis to .ai/project/deep/ and updates TECH_DEBT_REGISTRY.md. Does NOT create Jira stories automatically -- run /create-tech-debt-stories after all modules are analysed and JIRA_CONFIG.md is configured.
tools:
  - githubRepo
  - codebase
  - edit
  - execute
  - read
  - search
  - confluence-mcp
  - jira-mcp
---

Do not greet the user. Execute immediately.

Run all steps below without pausing for input. Complete all steps automatically.

### Step 1 -- Read the module

Read all source files in the module directory. Read:
- All Java/Groovy/TypeScript/C# classes
- Build file (pom.xml or build.gradle)
- Any configuration files
- Git log for this module: `git log --oneline -- [module]/ | Select-Object -First 20`

### Step 2 -- Produce the DEEP analysis

Write a comprehensive analysis covering:

**1. Purpose** -- what business problem this module solves

**2. Entry points** -- every way data or control enters this module
(Kafka consumers, REST endpoints, scheduled jobs, file watchers)

**3. Call graph** -- how data flows through the module from entry to output

**4. External dependencies** -- every external system with protocol and auth method

**5. Test coverage estimate** -- count of test vs main classes, coverage gaps

**6. Risk level** -- Critical / High / Medium / Low with specific factors

**7. Invariants** -- implicit business rules enforced in code but not documented

**8. Hidden coupling** -- shared databases, compile dependencies, file system paths
shared with other modules

**9. Refactoring prerequisites** -- ordered list of what must be done BEFORE
any structural change to this module is safe

### Step 3 -- Identify findings

From the analysis, classify all findings by severity:

CRITICAL:
- Silent exception handling with no DLQ or retry (messages dropped)
- Latent NPE or null dereference in a business-critical path
- Shared database tables with no documented ownership
- PII processed with no GDPR retention policy

High:
- Missing operational runbook for failure modes
- Duplicated business rules in multiple locations
- Unmaintained dependency in a critical integration path
- No alerting on async/scheduled job failures

Medium:
- Test coverage gaps in critical paths
- Hardcoded configuration that should be externalised
- Thread model risks without load test evidence

### Step 4 -- Update TECH_DEBT_REGISTRY.md

Add all Critical and High findings to .ai/project/TECH_DEBT_REGISTRY.md.

Assign TD numbers sequentially from the highest existing number in the registry.
Check for duplicates -- do not add a finding that is already in the registry.

Do NOT create any Jira stories. Jira story creation happens after all modules
are analysed, JIRA_CONFIG.md is configured for the real project, and the
Tech Lead has reviewed all findings. Run /create-tech-debt-stories for that.

### Step 5 -- Save the DEEP analysis

Save the complete analysis to:
`.ai/project/deep/[module-name]-DEEP.md`

Include at the top:
```
# DEEP Analysis: [module-name]
Generated: [today's date]
Risk level: [Critical/High/Medium/Low]
Findings: [N Critical, N High, N Medium, N Low]
TD items added to registry: [TD-NNN, TD-NNN]
Jira stories: not yet created -- run /create-tech-debt-stories when all modules are done
Next recommended analysis: [next highest-risk module]
```

### Step 6 -- Tell the engineer

State clearly:
1. Risk level and one-sentence summary of why
2. Number of findings by severity and their TD numbers
3. The single most important finding (must be fixed first)
4. Whether this module should be avoided until prerequisites are resolved
5. The next module to run DEEP on (from MODULE_REGISTRY.md, next highest risk)
6. The exact command to run next:
   `/explain-module [next-module] DEEP`
   or if all Active modules are done:
   `All Active modules analysed. Configure JIRA_CONFIG.md (OT-2) then run /create-tech-debt-stories`

Do not show a command menu. Do not ask what to do next. State it.
