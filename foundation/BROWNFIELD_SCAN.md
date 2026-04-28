# BROWNFIELD_SCAN.md
# AI Engineering Commons -- Brownfield Discovery Protocol
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Purpose

This file defines the structured protocol for discovering and documenting
an existing codebase that is new to the team. It is used by:

- The Brownfield Discovery Agent (A14) -- executes this protocol autonomously
- Engineers -- follow this manually before the agent is available or
  when the agent output needs human verification
- The Legacy Explainer Agent (A11) -- uses this as a reference for
  module-level deep dives

The output of a brownfield scan is a populated set of project-layer
files in `.ai/project/` and a draft architecture page in Confluence.
Once complete, every subsequent agent working on this codebase has
the context it needs to operate safely.

Referenced by:
- `agents/BROWNFIELD_DISCOVERY_AGENT.md` -- executes this protocol
- `REPO_BOOTSTRAP.md` section 4 -- links here for existing codebases
- Journey flow J11 -- brownfield discovery chain
- `coe/ONBOARDING_CHECKLIST.md` -- new team member onboarding

---

## 2. When to run a brownfield scan

Run this protocol when:
- A team takes ownership of a codebase they did not build
- A codebase has not had AI tooling set up previously
- The existing `.ai/project/` files are empty, stale, or missing
- A significant architecture change has made existing docs inaccurate
- Onboarding more than 3 new engineers simultaneously

Do NOT run this protocol on:
- A codebase that already has accurate `.ai/project/` files
- A new greenfield project (use REPO_BOOTSTRAP.md instead)
- A single module within a larger codebase (use Legacy Explainer Agent)

---

## 3. Preparation

Before starting the scan, gather:

```
[ ] Repository access and clone URL
[ ] Read access to existing Confluence spaces (if any)
[ ] Read access to Jira (to find linked tickets and known issues)
[ ] List of people who built or know this codebase (for interviews)
[ ] Any existing architecture diagrams, README files, or docs
[ ] Access to production monitoring (Grafana) if available
[ ] List of known integrations (from ops team or previous engineers)
```

Set up the commons package first:

```powershell
# In the project repo root
npm install @telia-company/ai-engineering-common
npx aec init
```

The `aec init` command creates the stub files you will populate
during this scan.

---

## 4. Phase 1 -- Language and framework detection

**Goal:** Understand what tech stack is in use before reading any code.

### 4.1 Detect languages and frameworks

```powershell
# Identify languages by file extension (run in repo root)
Get-ChildItem -Recurse -File |
  Group-Object Extension |
  Sort-Object Count -Descending |
  Select-Object -First 15 |
  Format-Table Name, Count

# Find framework indicators
Get-ChildItem -Recurse -Name -Include "pom.xml","build.gradle","package.json","*.csproj" |
  Where-Object { $_ -notlike "*node_modules*" }
```

### 4.2 Identify build tools and CI/CD

```powershell
# Check for build files
Test-Path "pom.xml"           # Maven
Test-Path "build.gradle"      # Gradle
Test-Path "package.json"      # Node/npm
Test-Path "*.sln"             # .NET solution
Test-Path "Makefile"          # Make
Test-Path ".github\workflows" # GitHub Actions
Test-Path "Jenkinsfile"       # Jenkins
Test-Path "azure-pipelines.yml" # Azure DevOps
```

### 4.3 Check dependency files for framework clues

```powershell
# Java -- check pom.xml for spring-boot, quarkus, micronaut
Select-String -Path "pom.xml" -Pattern "spring-boot|quarkus|micronaut" |
  Select-Object -First 5

# Node -- check package.json for react, next, angular, vue
Get-Content "package.json" | ConvertFrom-Json |
  Select-Object -ExpandProperty dependencies
```

### 4.4 Record findings

Write what you find to `ARCHITECTURE_OVERVIEW.md` -- Technology stack section.

---

## 5. Phase 2 -- Repository structure mapping

**Goal:** Understand how the codebase is organised before reading individual files.

### 5.1 Top-level structure

```powershell
# View top 3 levels of directory structure
Get-ChildItem -Recurse -Depth 3 -Directory |
  Where-Object { $_.FullName -notlike "*node_modules*" -and
                 $_.FullName -notlike "*\.git*" -and
                 $_.FullName -notlike "*target*" -and
                 $_.FullName -notlike "*build*" -and
                 $_.FullName -notlike "*dist*" } |
  Select-Object FullName
```

### 5.2 Identify module boundaries

Look for these patterns that indicate module boundaries:

```
Java / Spring Boot:
  - Separate directories under src/main/java/{package}/
  - Separate Maven modules (sub-directories with their own pom.xml)
  - Package naming: com.telia.{domain}.{module}

TypeScript / React:
  - Separate directories under src/components/, src/pages/, src/features/
  - Separate packages in a monorepo (packages/ or apps/ directories)

C# / .NET:
  - Separate .csproj files in subdirectories
  - Solution file (.sln) listing multiple projects
```

### 5.3 Count files per module

```powershell
# Count source files per top-level package/module
Get-ChildItem -Recurse -File -Include "*.java","*.ts","*.cs" |
  Where-Object { $_.FullName -notlike "*test*" -and
                 $_.FullName -notlike "*node_modules*" } |
  Group-Object { $_.DirectoryName.Split("\")[($_.DirectoryName.Split("\").Count - 2)] } |
  Sort-Object Count -Descending |
  Format-Table Name, Count
```

### 5.4 Record findings

Write module names and paths to `MODULE_REGISTRY.md`.
Set all initial statuses to `Active` unless evidence suggests otherwise.

---

## 6. Phase 3 -- Integration discovery

**Goal:** Find every external system this codebase calls or is called by.

### 6.1 Search for HTTP clients

```powershell
# Java -- RestTemplate, RestClient, WebClient, FeignClient, Feign
Select-String -Path "src\**\*.java" -Recurse -Pattern "RestTemplate|RestClient|WebClient|FeignClient|@FeignClient" |
  Select-Object Filename, LineNumber, Line |
  Sort-Object Filename

# TypeScript -- axios, fetch, got
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Recurse -Pattern "axios|fetch\(|got\." |
  Select-Object Filename, LineNumber, Line |
  Sort-Object Filename

# C# -- HttpClient, RestSharp
Select-String -Path "**\*.cs" -Recurse -Pattern "HttpClient|RestClient|IRestClient" |
  Select-Object Filename, LineNumber, Line |
  Sort-Object Filename
```

### 6.2 Search for database connections

```powershell
# Java -- datasource URLs, JPA repositories, JDBC
Select-String -Path "src\**\*.java","src\**\*.yml","src\**\*.yaml","src\**\*.properties" `
  -Recurse -Pattern "datasource|spring\.data|@Repository|JdbcTemplate" |
  Select-Object Filename, Line |
  Sort-Object Filename -Unique

# Check application config files
Get-ChildItem -Recurse -Name -Include "application*.yml","application*.yaml","application*.properties" |
  ForEach-Object { Get-Content $_ | Select-String "datasource|database|db\." }
```

### 6.3 Search for Kafka configuration

```powershell
# Look for Kafka topic names and bootstrap server config
Select-String -Path "src\**\*","*.yml","*.yaml","*.properties" `
  -Recurse -Pattern "kafka|bootstrap\.servers|KafkaTemplate|@KafkaListener" |
  Where-Object { $_.Filename -notlike "*node_modules*" } |
  Select-Object Filename, Line |
  Sort-Object Filename -Unique
```

### 6.4 Search for external URLs and hostnames

```powershell
# Find hardcoded URLs and environment variable references to external services
Select-String -Path "src\**\*","*.yml","*.yaml" -Recurse `
  -Pattern "https?://|\.url=|\.host=|BASE_URL|API_URL|SERVICE_URL" |
  Where-Object { $_.Line -notlike "*localhost*" -and
                 $_.Line -notlike "*127.0.0.1*" -and
                 $_.Filename -notlike "*test*" } |
  Select-Object Filename, LineNumber, Line
```

### 6.5 Check for OpenAPI or Swagger specs

```powershell
# Existing API specs indicate integration points
Get-ChildItem -Recurse -Name -Include "*.yaml","*.yml","*.json" |
  Where-Object { (Get-Content $_) -match "openapi:|swagger:" }
```

### 6.6 Record findings

Write discovered integrations to `INTEGRATION_MAP.md`.
Mark DPA field as "Unknown -- verify with Security Lead" for all
third-party integrations until confirmed.

---

## 7. Phase 4 -- Data model discovery

**Goal:** Understand what data the codebase stores and how it is structured.

### 7.1 Find entity definitions

```powershell
# Java -- JPA entities
Select-String -Path "src\**\*.java" -Recurse -Pattern "@Entity|@Table" |
  Select-Object Filename |
  Sort-Object Filename -Unique

# TypeScript -- TypeORM, Prisma schemas
Get-ChildItem -Recurse -Name -Include "*.prisma","schema.ts","entity.ts","*.entity.ts"

# C# -- Entity Framework models
Select-String -Path "**\*.cs" -Recurse -Pattern "\[Table\]|\[Key\]|DbSet<" |
  Select-Object Filename |
  Sort-Object Filename -Unique
```

### 7.2 Find database migrations

```powershell
# Flyway migrations
Get-ChildItem -Recurse -Name -Include "V*.sql" | Sort-Object

# Liquibase
Get-ChildItem -Recurse -Name -Include "*.xml","*.yaml" |
  Where-Object { (Get-Content $_) -match "databaseChangeLog|changeSet" }

# EF Core migrations
Get-ChildItem -Recurse -Directory -Name "Migrations"
```

### 7.3 Check for personal data fields

Look for field names that suggest personal data storage:

```powershell
# Search for common PII field names
Select-String -Path "src\**\*.java","src\**\*.ts","**\*.cs","**\*.sql" `
  -Recurse -Pattern "email|phone|address|ssn|personnummer|fødselsnummer|firstName|lastName|dateOfBirth" |
  Where-Object { $_.Filename -notlike "*test*" } |
  Select-Object Filename, Line |
  Sort-Object Filename
```

Flag any findings to the Security Lead. Personal data fields require:
- Documented lawful basis
- Retention policy
- Right to erasure implementation

### 7.4 Record findings

Write entity names, key fields, and relationships to `DATA_MODEL.md`.
Add retention policy stubs for any table containing personal data fields.

---

## 8. Phase 5 -- Technical debt identification

**Goal:** Identify areas of risk before any agent touches the code.

### 8.1 Code quality signals

```powershell
# Find large files (potential God classes)
Get-ChildItem -Recurse -File -Include "*.java","*.ts","*.cs" |
  Where-Object { $_.FullName -notlike "*test*" -and
                 $_.FullName -notlike "*node_modules*" } |
  Select-Object FullName, @{N="Lines";E={(Get-Content $_.FullName).Count}} |
  Sort-Object Lines -Descending |
  Select-Object -First 20

# Find TODO comments (unfinished work)
Select-String -Path "src\**\*.java","src\**\*.ts","src\**\*.cs" `
  -Recurse -Pattern "TODO|FIXME|HACK|XXX|TEMP" |
  Where-Object { $_.Filename -notlike "*node_modules*" } |
  Select-Object Filename, LineNumber, Line |
  Sort-Object Filename
```

### 8.2 Dependency age check

```powershell
# Java -- check for old Spring Boot version
Select-String -Path "pom.xml" -Pattern "spring-boot.version|spring-boot-starter-parent" |
  Select-Object Line

# Node -- check for outdated packages
npm outdated --json 2>$null | ConvertFrom-Json

# Check for known problematic versions
Select-String -Path "pom.xml","package.json","**\*.csproj" `
  -Recurse -Pattern "log4j|commons-collections:3\.|moment@" |
  Select-Object Filename, Line
```

### 8.3 Test coverage signals

```powershell
# Count test files vs source files
$sourceFiles = (Get-ChildItem -Recurse -File -Include "*.java","*.ts","*.cs" |
  Where-Object { $_.FullName -notlike "*test*" -and
                 $_.FullName -notlike "*node_modules*" }).Count

$testFiles = (Get-ChildItem -Recurse -File -Include "*.java","*.ts","*.cs" |
  Where-Object { $_.FullName -like "*test*" -or $_.FullName -like "*spec*" }).Count

Write-Host "Source files: $sourceFiles"
Write-Host "Test files:   $testFiles"
Write-Host "Test ratio:   $([math]::Round($testFiles/$sourceFiles * 100))%"
```

A test ratio below 50% is a risk signal. Below 25% is high risk.

### 8.4 Record findings

Write identified tech debt items to `TECH_DEBT_REGISTRY.md` with:
- Severity (High / Medium / Low)
- Affected module
- Description
- Initial assessment of effort to fix

---

## 9. Phase 6 -- Security and compliance check

**Goal:** Identify any security risks or compliance gaps before teams start work.

### 9.1 Run vulnerability scan

```powershell
# Trigger Vuln Scan Agent or run manually
# Java
./mvnw dependency-check:check

# Node
npm audit --json | ConvertFrom-Json

# C#
dotnet list package --vulnerable
```

Record any Critical or High CVEs in `TECH_DEBT_REGISTRY.md` with
severity TD-SEC and notify the Security Lead immediately.

### 9.2 Check for exposed secrets

```powershell
# Search for potential hardcoded credentials
Select-String -Path "src\**\*","*.yml","*.yaml","*.properties","*.json" `
  -Recurse -Pattern "password=|api_key=|secret=|token=|AKIA[A-Z0-9]{16}" |
  Where-Object { $_.Filename -notlike "*test*" -and
                 $_.Filename -notlike "*node_modules*" -and
                 $_.Line -notlike "*your_*" -and
                 $_.Line -notlike "*example*" -and
                 $_.Line -notlike "*placeholder*" } |
  Select-Object Filename, LineNumber
```

Any findings here must be reported to the Security Lead immediately.
Exposed credentials must be rotated before any agent accesses the repo.

### 9.3 Check for PII in test data

```powershell
# Look for real-looking personal data in test files
Select-String -Path "src\**\*test*\**\*","test\**\*" `
  -Recurse -Pattern "\d{6}\s?\d{5}|[a-z]+@[a-z]+\.[a-z]+" |
  Select-Object Filename, Line |
  Sort-Object Filename
```

Real personal data in tests is a GDPR violation. Flag to Security Lead.

---

## 10. Phase 7 -- Output and documentation

**Goal:** Translate scan findings into the project-layer files and a Confluence page.

### 10.1 Complete all project-layer files

By the end of phases 1-6, you should have enough information to fill
in all stub files created by `aec init`. Work through them in order:

```
[ ] ARCHITECTURE_OVERVIEW.md -- from Phase 1 and 2 findings
[ ] MODULE_REGISTRY.md       -- from Phase 2 findings
[ ] INTEGRATION_MAP.md       -- from Phase 3 findings
[ ] DATA_MODEL.md            -- from Phase 4 findings
[ ] KAFKA_TOPICS.md          -- from Phase 3 Kafka findings
[ ] TECH_DEBT_REGISTRY.md    -- from Phase 5 and 6 findings
[ ] SRE_SERVICE_CONFIG.md    -- from Phase 1 (SLO targets if known)
[ ] FEATURE_ENV_CONFIG.md    -- from Phase 2 (test environment if exists)
```

For fields where you do not yet know the answer, write:
`[TODO: verify with [person/team]]`

Do not leave fields blank -- a visible TODO is better than a silent gap.

### 10.2 Run aec update and commit

```powershell
npx aec update
git add .ai\project\ .github\copilot-instructions.md CLAUDE.md .cursorrules
git commit -m "feat: populate project-layer files from brownfield scan"
git push origin main
```

### 10.3 Create Confluence architecture page

Ask the Arch Doc Agent to generate the initial architecture page:

```
USE COMMAND: REFRESH_ARCH_DOCS
INPUT: .ai/project/ARCHITECTURE_OVERVIEW.md and MODULE_REGISTRY.md
OUTPUT: Draft architecture page in Confluence [ARCH] space
STATUS: Draft -- requires Tech Lead review
```

Or create it manually using the template in
`CONFLUENCE_INTEGRATION.md` section 6.2 (Architecture overview).

### 10.4 Tech Lead review gate

Present the scan output at HITL gate C01 (Tech Lead reviews):

- Walk through the MODULE_REGISTRY.md -- are all modules identified?
- Walk through the INTEGRATION_MAP.md -- are all integrations identified?
- Walk through the TECH_DEBT_REGISTRY.md -- does the severity assessment match?
- Walk through the security findings -- any surprises?

Incorporate feedback and update the project-layer files.

---

## 11. Scan quality checklist

Before declaring the brownfield scan complete:

```
[ ] ARCHITECTURE_OVERVIEW.md has no [TODO] fields for technology stack
[ ] MODULE_REGISTRY.md lists all directories with source code
[ ] INTEGRATION_MAP.md lists all external HTTP clients found in Phase 3
[ ] INTEGRATION_MAP.md lists all database connections found in Phase 3
[ ] All third-party integrations have DPA field assessed (Yes/No/Unknown)
[ ] DATA_MODEL.md covers all @Entity / TypeORM / EF Core models found
[ ] Retention policy is documented for all tables with PII fields
[ ] TECH_DEBT_REGISTRY.md has entries for all Critical and High findings
[ ] Security Lead has been notified of any exposed credentials or CVEs
[ ] Test ratio has been measured and recorded
[ ] npx aec update runs without errors
[ ] CLAUDE.md, copilot-instructions.md, .cursorrules are generated
[ ] Tech Lead has reviewed and approved the scan output (gate C01)
[ ] Confluence architecture page draft exists
```

A brownfield scan is not complete until all items are checked.

---

## 12. Scan duration estimates

| Codebase size | Estimated scan duration | Notes |
|---|---|---|
| Small (< 20 source files) | 2-4 hours | Single engineer, manual |
| Medium (20-100 source files) | 1-2 days | Engineer + Brownfield Discovery Agent |
| Large (100-500 source files) | 3-5 days | Team + agent, module by module |
| Very large (500+ source files) | 1-2 weeks | Staged scan, one module group per day |

The Brownfield Discovery Agent (A14) reduces these estimates by 40-60%
by automating phases 1-6. The agent still requires human verification
at phase 10 (Tech Lead review).

---

## 13. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
