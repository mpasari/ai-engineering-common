# REPO_BOOTSTRAP.md

# AI Engineering Commons -- Repository Bootstrap Guide

# Version: 1.0.0

# Status: Active

# Last updated: 2025-01

# Owner: CoE Core

---

## 1. Purpose

This file is the step-by-step guide for setting up the AI engineering
toolkit in a new or existing repository. Follow it in order the first
time you set up a project. After initial setup, day-to-day use is just
`npx aec update` whenever you update project-layer files.

This guide covers:

- Installing the commons package
- Running the init command
- Filling in the project-layer stub files
- Verifying the tool configs are working
- What to commit and what to leave out

---

## 2. Prerequisites

Before starting, confirm these are in place:

```
[ ] Node.js 18 or higher installed
    Verify: node --version

[ ] npm configured for GitHub Packages (telia-company scope)
    File needed: .npmrc in project root
    Content:
      @telia-company:registry=https://npm.pkg.github.com
      //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

[ ] GITHUB_TOKEN environment variable set
    Windows PowerShell:
      $env:GITHUB_TOKEN = "ghp_your_token_here"
    Permanent (user scope):
      [System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN","ghp_xxx","User")
    Token needs: read:packages scope minimum

[ ] At least one AI tool installed (Copilot, Claude Code, or Cursor)
    See AI_TOOL_SELECTION.md section 8 for setup instructions

[ ] Git repository exists and is cloned locally
```

---

## 3. Installation

### Step 1 -- Create .npmrc if not present

```powershell
# Run in the project repo root
$npmrc = @"
@telia-company:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=`${GITHUB_TOKEN}
"@
Set-Content -Path ".npmrc" -Value $npmrc -Encoding UTF8
```

### Step 2 -- Install the commons package

```powershell
npm install @telia-company/ai-engineering-common
```

Expected output:

```
added 1 package, and audited 2 packages in Xs
found 0 vulnerabilities
```

### Step 3 -- Run aec init

```powershell
npx aec init
```

Expected output:

```
  aec v1.0.0 -- initialising project

  created  .ai/project/ARCHITECTURE_OVERVIEW.md
  created  .ai/project/MODULE_REGISTRY.md
  created  .ai/project/INTEGRATION_MAP.md
  created  .ai/project/KAFKA_TOPICS.md
  created  .ai/project/DATA_MODEL.md
  created  .ai/project/TECH_DEBT_REGISTRY.md
  created  .ai/project/FEATURE_ENV_CONFIG.md
  created  .ai/project/SRE_SERVICE_CONFIG.md
  updated  COMMONS_VERSION.md
  updated  .github/copilot-instructions.md
  updated  CLAUDE.md
  updated  .cursorrules

  Done. Fill in .ai/project/ files then run: npx aec update
```

---

## 4. Filling in the project-layer files

The stub files created by `aec init` contain placeholder content.
Fill them in the order below -- each file builds on the previous one.

### 4.1 ARCHITECTURE_OVERVIEW.md -- fill in first

This is the most important file. It gives every AI tool an understanding
of what the system does and how it is structured.

Minimum required content:

```markdown
# Architecture overview -- [Project name]

## What this system does
[2-3 sentences describing the business purpose of this system]

## Technology stack
- Language: [Java 21 / TypeScript / C# .NET 8]
- Framework: [Spring Boot 3.x / Next.js 14 / ASP.NET Core 8]
- Database: [PostgreSQL 15 / SQL Server 2022]
- Messaging: [Kafka / Azure Service Bus / none]
- Infrastructure: [Azure AKS / Azure App Service]

## System boundaries
[What this system owns vs what it calls externally]

## Key constraints
[Any architectural decisions that must be respected -- e.g.
"All external communication goes through the API gateway",
"No direct database access from the frontend"]
```

### 4.2 MODULE_REGISTRY.md -- fill in second

List every module or service in this project. Agents use this to
understand the codebase structure before touching any code.

Minimum required content:

```markdown
# Module registry -- [Project name]

## Modules

| Module name | Path | Language | Owner | Status | Description |
|---|---|---|---|---|---|
| [module-name] | src/[path] | Java | [team] | Active | [one line] |
| [module-name] | src/[path] | TypeScript | [team] | Active | [one line] |

## Status values
- Active -- in use and maintained
- Deprecated -- being phased out, do not add new code
- Legacy -- not actively maintained, touch only when necessary
```

### 4.3 INTEGRATION_MAP.md -- fill in third

List every external system this project calls or is called by.
Agents check this before generating integration code.

Minimum required content:

```markdown
# Integration map -- [Project name]

## Outbound integrations (we call these)

| System | Protocol | Auth | SLA | DPA in place | Notes |
|---|---|---|---|---|---|
| [System name] | REST / Kafka / SOAP | OAuth2 / API key | 99.9% | Yes / No | [notes] |

## Inbound integrations (these call us)

| System | Protocol | Auth method | Notes |
|---|---|---|---|
| [System name] | REST | Bearer token | [notes] |

## Internal dependencies

| Service | What we use from it | Protocol |
|---|---|---|
| [Service name] | [What we call] | REST |
```

### 4.4 KAFKA_TOPICS.md -- fill in if using Kafka

Skip this file if the project does not use Kafka. If it does, list
every topic the project produces to or consumes from.

```markdown
# Kafka topics -- [Project name]

## Topics we produce to

| Topic name | Schema | Schema registry | DLQ topic | SLA |
|---|---|---|---|---|
| [domain.entity.event] | Avro / JSON | [registry URL] | [dlq-topic] | [latency target] |

## Topics we consume from

| Topic name | Consumer group | Committed offset policy | DLQ handling |
|---|---|---|---|
| [domain.entity.event] | [group-name] | At-least-once | [strategy] |
```

### 4.5 DATA_MODEL.md -- fill in for any service with a database

Describe the core domain entities. Agents use this to generate
correctly typed code and avoid wrong field names.

```markdown
# Data model -- [Project name]

## Core entities

### [Entity name]
| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID | No | Primary key |
| [field] | [type] | [Yes/No] | [notes] |

## Key relationships
[Describe how entities relate -- e.g. "An Order has many OrderItems"]

## Retention policy
| Entity | Retention period | Anonymisation strategy |
|---|---|---|
| [Entity] | [duration] | [how PII is removed at expiry] |
```

### 4.6 TECH_DEBT_REGISTRY.md -- fill in with known issues

Document known technical debt. Agents consult this before touching
legacy code to understand known risks.

```markdown
# Technical debt registry -- [Project name]

| ID | Description | Severity | Affected module | Owner | KEDB link |
|---|---|---|---|---|---|
| TD-001 | [description] | High / Medium / Low | [module] | [team] | [KEDB-NNN or none] |
```

Leave empty if there is no known technical debt.

### 4.7 FEATURE_ENV_CONFIG.md -- fill in if using Feature Validation Agent

Describe how to spin up the isolated test environment for AC execution.

```markdown
# Feature environment config -- [Project name]

## How to start the test environment

```powershell
# Start all services
docker-compose -f docker-compose.test.yml up -d

# Verify health
curl http://localhost:8080/health
```

## Seed data

[How to load test data -- migration script, seed file, etc.]

## Mock dependencies

[Which external services are mocked and how]

## Teardown

```powershell
docker-compose -f docker-compose.test.yml down -v
```

```

### 4.8 SRE_SERVICE_CONFIG.md -- fill in for production services

Override default SLO thresholds for this specific service. Leave empty
to use the defaults from PERFORMANCE_GUIDELINES.md section 7.

```markdown
# SRE service config -- [Project name]

## Service SLO overrides

| Metric | Default | This service | Reason |
|---|---|---|---|
| P95 latency | 200ms | 500ms | Upstream dependency is slow |
| Error rate | 0.1% | 0.5% | Expected transient failures from partner |

## Custom runbooks
[Links to any custom Confluence runbooks for this service]

## Kafka consumer lag SLA
| Topic | Max acceptable lag | Alert threshold |
|---|---|---|
| [topic-name] | [messages] | [messages] |
```

---

## 5. Regenerate tool configs

After filling in the project-layer files, regenerate the tool configs:

```powershell
npx aec update
```

This merges the commons foundation files with your project-layer files
into the three AI tool config files:

- `.github/copilot-instructions.md` -- GitHub Copilot context
- `CLAUDE.md` -- Claude Code context
- `.cursorrules` -- Cursor rules

Run `npx aec update` every time you update any file in `.ai/project/`.

---

## 6. Verification

Verify each tool is reading the generated configs correctly:

### 6.1 GitHub Copilot

```
1. Open any code file in VS Code
2. Start typing a function or class
3. The suggestion should reflect the project's coding conventions
   from CODING_STANDARDS.md (naming, patterns)
4. If suggestions seem generic, check that Copilot has loaded the
   instructions file: Settings -> Copilot -> Instructions file
```

### 6.2 Claude Code

```powershell
# In the project repo root
claude

# Ask this question to verify CLAUDE.md is loaded:
> What project is this and what are the main modules?

# Expected: Claude describes the project from your ARCHITECTURE_OVERVIEW.md
# and lists modules from your MODULE_REGISTRY.md

# If Claude does not know the project context, CLAUDE.md may not be
# in the repo root or may have encoding issues (see CODING_STANDARDS.md
# for UTF-8 BOM guidance)
```

### 6.3 Cursor

```
1. Open the repo in Cursor
2. Check the status bar for "Rules applied" -- Cursor shows this
   when .cursorrules is loaded
3. Open Cursor Composer and type: "Write a service class"
4. The generated code should follow the project's naming conventions
5. If rules are not applied, check Settings -> Rules -> Project rules
```

---

## 7. What to commit

```
Commit these files:
  [ ] .npmrc                                  -- registry config (no token)
  [ ] package.json                            -- commons dependency declared
  [ ] .ai/project/ARCHITECTURE_OVERVIEW.md   -- project context
  [ ] .ai/project/MODULE_REGISTRY.md         -- module list
  [ ] .ai/project/INTEGRATION_MAP.md         -- integrations
  [ ] .ai/project/KAFKA_TOPICS.md            -- if using Kafka
  [ ] .ai/project/DATA_MODEL.md              -- domain entities
  [ ] .ai/project/TECH_DEBT_REGISTRY.md      -- known debt
  [ ] .ai/project/FEATURE_ENV_CONFIG.md      -- test environment
  [ ] .ai/project/SRE_SERVICE_CONFIG.md      -- SLO overrides
  [ ] .ai/project/COMMONS_VERSION.md         -- auto-generated
  [ ] .github/copilot-instructions.md        -- generated tool config
  [ ] CLAUDE.md                              -- generated tool config
  [ ] .cursorrules                           -- generated tool config

Do NOT commit:
  [ ] node_modules/                          -- in .gitignore
  [ ] .ai/commons/                           -- managed by npm
  [ ] .npmrc token values                    -- use ${GITHUB_TOKEN} variable

Verify .gitignore includes:
  node_modules/
  .ai/commons/
```

---

## 8. Keeping configs up to date

### 8.1 When to run npx aec update

Run it when:

- You update any file in `.ai/project/`
- A new version of `@telia-company/ai-engineering-common` is installed
- You add a new module to MODULE_REGISTRY.md
- You add a new integration to INTEGRATION_MAP.md

### 8.2 Updating the commons version

When a new version of the commons is available (Dependabot PR or
CoE notification), update it in the project:

```powershell
# Update to latest
npm update @telia-company/ai-engineering-common

# Or update to specific version
npm install @telia-company/ai-engineering-common@1.2.0

# Regenerate configs after update
npx aec update

# Commit the updated package.json and generated configs
git add package.json package-lock.json .github\copilot-instructions.md CLAUDE.md .cursorrules
git commit -m "chore: update ai-engineering-common to v1.2.0"
```

### 8.3 Adding project-specific overrides

If your project needs to diverge from a commons standard:

```
1. Create the override file in .ai/project/OVERRIDES/
   Example: .ai/project/OVERRIDES/CODING_STANDARDS.md

2. Add a header documenting the divergence:
   # Override: CODING_STANDARDS.md
   # Reason: [Why this project diverges]
   # From commons version: 1.0.0
   # Approved by: [Tech Lead name]
   # Review date: [Date]

3. Add only the sections that differ -- do not copy the entire file

4. Run npx aec update -- the override is automatically merged

5. Commit the override file
```

---

## 9. Troubleshooting


| Problem                                    | Likely cause                             | Fix                                                    |
| ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------ |
| `npm install` fails with 401               | GITHUB_TOKEN not set or expired          | Set/refresh the token, re-run                          |
| `npx aec init` creates no files            | templates/project-layer/ is empty        | Update commons to latest version                       |
| CLAUDE.md has diamond characters           | BOM encoding issue                       | See CODING_STANDARDS.md BOM fix                        |
| Copilot suggestions do not reflect project | Instructions file not loaded             | Check Copilot settings in VS Code                      |
| `.cursorrules` is empty                    | CODING_STANDARDS.md not found in commons | Verify commons install, run aec update                 |
| `npm list` shows (empty)                   | Link was broken by npm install           | Re-run `npm link @telia-company/ai-engineering-common` |


---

## 10. Version and review


| Attribute       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| File owner      | CoE Core                                              |
| Review cadence  | Quarterly -- or when the aec CLI changes              |
| Last reviewed   | 2026-04                                               |
| Next review due | 2026-05                                               |
| Approvers       | CoE Lead                                              |
| Change process  | PR to ai-engineering-common, 2 CoE approvals required |


