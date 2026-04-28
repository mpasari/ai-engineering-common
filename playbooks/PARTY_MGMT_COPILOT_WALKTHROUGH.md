# PARTY_MGMT_COPILOT_WALKTHROUGH.md
# Playbooks -- Party Management system: step-by-step using GitHub Copilot Agent Mode
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## Overview

This walkthrough builds the Telia Party Information Management system
using GitHub Copilot Agent Mode in VS Code. It assumes COPILOT_SETUP.md
is complete and Copilot is signed in.

If your organisation has MCP disabled, each step includes a manual
fallback using context pasted directly into the prompt.

---

## Before you start: context quality check

Open Copilot Chat (Ctrl+Alt+I), switch to Agent mode, then type:

```
What project is this? Describe the architecture, modules, and key constraints.
```

If Copilot accurately describes the Party Management service from your
.ai/project/ files: context is loaded. Proceed.

If Copilot gives a generic answer: run `npx aec update` in the terminal,
reload VS Code, then try again.

---

## Phase 1 -- Project setup (one time)

### Step 1.1 -- Create project and install commons

Open VS Code integrated terminal (Ctrl+`):

```powershell
mkdir party-management-service
cd party-management-service

# Install commons
npm install @telia-company/ai-engineering-common

# Bootstrap project files
npx aec init

# Open in VS Code
code .
```

### Step 1.2 -- Scaffold Spring Boot project structure

Open Copilot Chat, switch to Agent mode, then type:

```
#file:.ai/project/ARCHITECTURE_OVERVIEW.md
#file:.github/copilot-instructions.md

Create a Java 21 / Spring Boot 3.2 project structure for the
party-management-service following the BACKEND_PATTERNS.md patterns
in copilot-instructions.md.

Create:
  pom.xml
    -- Java 21, Spring Boot 3.2, spring-boot-starter-web,
       spring-boot-starter-security, spring-boot-starter-oauth2-resource-server,
       spring-boot-starter-data-jpa, spring-boot-starter-actuator,
       flyway-core, postgresql driver, lombok, micrometer-registry-prometheus,
       spring-kafka, testcontainers-junit-jupiter, testcontainers-postgresql

  src/main/java/com/telia/party/
    api/           (controllers and DTOs)
    application/   (use cases)
    domain/        (entities and business rules)
    infrastructure/ (JPA repositories, Kafka, HTTP clients)
    config/        (Spring Security, Kafka config)

  src/main/resources/
    application.yml
    application-local.yml

  src/test/java/com/telia/party/ (matching structure)

  docker-compose.yml (PostgreSQL 15, Kafka, Zookeeper)
  .gitignore
  README.md

Apply all rules from SECURITY_BASELINE.md in copilot-instructions.md:
  - No hardcoded credentials anywhere
  - All config via environment variables
```

Copilot shows diffs for each file. Review and accept.

### Step 1.3 -- Fill in project context files

Use Agent mode to help fill in .ai/project/ files:

```
Help me fill in .ai/project/ARCHITECTURE_OVERVIEW.md for this service:

Service name: party-management-service
Purpose: Master data management for Telia party information.
         Manages B2C (individual), B2B (organisation), and B2O (operator)
         party records following TMForum TMF632, TMF669, and TMF644 standards.
         Single authoritative source for party identity, roles, and consent
         across Norwegian, Swedish, and Finnish markets.

Tech stack: Java 21, Spring Boot 3.2, PostgreSQL 15, Kafka
API standard: TMForum TMF632 Party Management v5

Key constraints:
  - Soft delete only (deleted_at timestamp, never hard DELETE)
  - GDPR: all personal data requires documented lawful basis
  - TMForum: API responses must match TMF schemas exactly
  - Multi-market national IDs: NO 11 digits, SE 10 digits, FI 11 chars
  - NIS2: regulated telecom personal data

Generate a complete ARCHITECTURE_OVERVIEW.md using the template structure
from copilot-instructions.md.
```

After Copilot generates it, review and save. Then fill in the remaining
.ai/project/ files similarly (MODULE_REGISTRY, INTEGRATION_MAP, DATA_MODEL,
KAFKA_TOPICS, FEATURE_ENV_CONFIG, SRE_SERVICE_CONFIG).

After all files are filled in:

```powershell
npx aec update
git add .
git commit -m "chore: initial project scaffold with context files"
```

---

## Phase 2 -- Sprint 1: Foundation

### Story 1: Local development environment

**In Agent mode:**

```
#file:.github/copilot-instructions.md
#file:.ai/project/FEATURE_ENV_CONFIG.md

Acting as the Code Gen Agent described in copilot-instructions.md,
implement the local development environment for party-management-service.

Requirements:
- docker-compose.yml starts PostgreSQL 15 (port 5432) and Kafka (port 9092)
- GET /actuator/health returns 200 with status UP
- application-local.yml connects to docker-compose services via env vars
- README.md has quickstart: clone, docker-compose up, ./mvnw spring-boot:run

Apply SECURITY_BASELINE.md -- no credentials in any committed file.
Credentials come from environment variables only.
```

Review the generated diffs. Accept each file.

Then run peer review:

```
#file:.github/copilot-instructions.md

Acting as the Peer Review Agent, review these files for the foundation story:
#file:docker-compose.yml
#file:src/main/resources/application.yml
#file:src/main/resources/application-local.yml

Apply:
- Security checklist S01-S12 (BLOCK items) from copilot-instructions.md
- Check for hardcoded credentials (Secrets Scan)
- Coding standards compliance

Output BLOCK findings (must fix) and WARN findings (Tech Lead aware).
```

Fix any BLOCK findings. Then commit:

```powershell
git checkout -b feature/PARTY-001-local-dev
git add .
git commit -m "feat(party-infrastructure): local development environment

- docker-compose.yml with PostgreSQL 15 and Kafka
- Health check at /actuator/health
- Environment variable configuration (no hardcoded credentials)

Jira: PARTY-001"
git push origin feature/PARTY-001-local-dev
```

### Story 2: Authentication

```
#file:.github/copilot-instructions.md
#file:.ai/project/INTEGRATION_MAP.md

Acting as the Code Gen Agent, implement Spring Security OAuth2 resource
server for the party-management-service.

Requirements from ARCHITECTURE_OVERVIEW.md:
- All endpoints except GET /actuator/health require Bearer token auth
- Token validation via CIAM OAuth2 endpoint (from INTEGRATION_MAP.md)
- JWT claims map to user roles for authorisation

Generate:
1. config/SecurityConfig.java
   - All paths secured except /actuator/health
   - JWT resource server with CIAM issuer URI from application.yml

2. application.yml addition:
   spring.security.oauth2.resourceserver.jwt.issuer-uri from env var

3. SecurityConfigTest.java (integration test):
   - Unauthenticated request to protected endpoint returns 401
   - Authenticated request with valid token proceeds
   - GET /actuator/health is accessible without token

Follow BACKEND_PATTERNS.md security patterns from copilot-instructions.md.
Follow SECURITY_STANDARDS.md S05 (auth requirements).
```

---

## Phase 3 -- Sprint 3: Party CRUD (Epic 2)

### Step 3.1 -- Draft stories for Party CRUD

```
#file:.github/copilot-instructions.md
#file:.ai/project/DATA_MODEL.md

Acting as the Story Drafter Agent, create Jira stories for:
"Implement TMF632 Party Management core API"

Capabilities needed:
- Database migration: party, party_individual, party_organisation tables
- Party domain entity with soft delete and domain events
- POST /party/v5/party -- create Individual or Organisation party
- GET /party/v5/party/{id} -- get party by ID
- GET /party/v5/party -- list with ?type &status &offset &limit
- PATCH /party/v5/party/{id} -- update (JSON Merge Patch)
- DELETE /party/v5/party/{id} -- soft delete (sets deleted_at)

Output Given/When/Then acceptance criteria for each story.
Sequence by dependency: migration first, domain entity second, API endpoints third.
```

[If MCP enabled: Copilot creates the stories in Jira automatically]
[If MCP disabled: copy the output and create stories manually in Jira]

### Step 3.2 -- Generate database migration

```
#file:.github/copilot-instructions.md
#file:.ai/project/DATA_MODEL.md

Acting as the Data Migration Agent, create the Flyway migration for
the party tables.

Follow DATA_MIGRATION_AGENT.md rules from copilot-instructions.md:
- File: src/main/resources/db/migration/V1__create_party_tables.sql
- Also create: V1__rollback_party_tables.sql

Tables required:
  party:
    id UUID PK DEFAULT gen_random_uuid()
    type VARCHAR(50) NOT NULL CHECK (type IN ('INDIVIDUAL', 'ORGANISATION', 'OPERATOR'))
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
    market CHAR(2) NOT NULL CHECK (market IN ('NO', 'SE', 'FI'))
    external_id VARCHAR(200)
    href VARCHAR(500)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    deleted_at TIMESTAMPTZ -- soft delete, never NULL in WHERE clause

  party_individual (extends party for B2C):
    party_id UUID PK FK -> party(id)
    given_name VARCHAR(200)     -- PII
    family_name VARCHAR(200)    -- PII
    full_name VARCHAR(500)      -- PII
    birth_date DATE             -- PII
    national_id VARCHAR(50)     -- PII (format varies by market)
    gender VARCHAR(50)
    nationality CHAR(2)

  party_organisation (extends party for B2B):
    party_id UUID PK FK -> party(id)
    trading_name VARCHAR(500)   -- PII
    legal_name VARCHAR(500)     -- PII
    organisation_type VARCHAR(100)
    registration_no VARCHAR(100)

  party_characteristic:
    id UUID PK DEFAULT gen_random_uuid()
    party_id UUID NOT NULL FK -> party(id)
    name VARCHAR(200) NOT NULL
    value TEXT
    value_type VARCHAR(50)

Rules:
- Add COMMENT ON COLUMN for EVERY PII field:
  'Personal data. Retention: active party record + 7 years post soft deletion.'
- Add indexes: party(type), party(status), party(market), party_individual(national_id)
- Use IF NOT EXISTS for idempotency
- Rollback script must restore original state
```

Review the migration carefully -- every PII column must have a retention comment.

### Step 3.3 -- Generate domain entity

```
#file:.github/copilot-instructions.md
#file:src/main/resources/db/migration/V1__create_party_tables.sql

Acting as the Code Gen Agent, implement the Party domain entity
following BACKEND_PATTERNS.md domain entity pattern from copilot-instructions.md.

Create in src/main/java/com/telia/party/domain/:

  PartyType.java       -- enum: INDIVIDUAL, ORGANISATION, OPERATOR
  PartyStatus.java     -- enum: ACTIVE, INACTIVE
  PartyMarket.java     -- enum: NO, SE, FI with national ID format regex per market

  Party.java           -- @Entity, base party record
    - All fields from migration (id, type, status, market, etc.)
    - softDelete() method: sets deleted_at = Instant.now(), status = INACTIVE
    - isDeletd() method: returns deleted_at != null
    - Raises PartyCreatedEvent, PartyUpdatedEvent, PartyDeletedEvent
    - @PrePersist sets created_at, @PreUpdate sets updated_at
    - NO @Setter on any field -- all changes via domain methods

  PartyIndividual.java -- @Entity extending Party
    - nationalId validation: format must match market enum regex
    - validate() throws exception if national_id format is wrong for market

  PartyOrganisation.java -- @Entity extending Party

  PartyCharacteristic.java -- @Embeddable value object

  PartyCreatedEvent.java, PartyUpdatedEvent.java, PartyDeletedEvent.java
    -- domain events extending AbstractDomainEvent

Follow the entity pattern from BACKEND_PATTERNS.md exactly.
Use Lombok @Getter only -- no @Setter, no @Data.
```

### Step 3.4 -- Generate the TMForum Party API

```
#file:.github/copilot-instructions.md
#file:src/main/java/com/telia/party/domain/Party.java
#file:src/main/java/com/telia/party/domain/PartyIndividual.java
#file:.ai/project/DATA_MODEL.md

Acting as the Code Gen Agent, implement the TMF632 Party Management API.

Create in this order:

1. infrastructure/repository/PartyRepository.java
   - JpaRepository<Party, UUID>
   - findByIdAndDeletedAtIsNull(UUID id) -- all finds exclude soft-deleted
   - findAllByTypeAndStatusAndDeletedAtIsNull(type, status, Pageable)

2. application/usecase/CreatePartyUseCase.java
   - Validates national_id format against market (via PartyMarket enum)
   - Saves party, publishes domain events via ApplicationEventPublisher
   - @Transactional

3. application/usecase/GetPartyUseCase.java
   - Throws PartyNotFoundException if not found or soft-deleted

4. application/usecase/UpdatePartyUseCase.java
   - JSON Merge Patch: only non-null fields update (null = leave unchanged)
   - Publishes PartyUpdatedEvent after save

5. application/usecase/SoftDeletePartyUseCase.java
   - Calls party.softDelete(), saves, publishes PartyDeletedEvent
   - Hard DELETE throws UnsupportedOperationException

6. api/dto/PartyDto.java (TMF632 response schema)
   - @type field for polymorphism ("Individual", "Organisation", "Operator")
   - href field: "/party/v5/party/{id}"
   - All fields match TMF632 Party schema naming (camelCase)
   - Static factory methods: PartyDto.from(Party party)

7. api/PartyController.java
   POST   /party/v5/party        -- createParty -- 201 Created
   GET    /party/v5/party/{id}   -- getParty -- 200 OK or 404
   GET    /party/v5/party        -- listParties -- ?type &status &offset &limit
   PATCH  /party/v5/party/{id}   -- updateParty -- 200 OK
   DELETE /party/v5/party/{id}   -- deleteParty (soft) -- 204 No Content

   All endpoints: @PreAuthorize with role checks
   Error responses: RFC 7807 Problem Details format

8. api/exception/GlobalExceptionHandler.java
   - Maps PartyNotFoundException to 404
   - Maps validation errors to 400 with field-level details
   - Maps business rule violations to 422

Follow BACKEND_PATTERNS.md for all layers.
Follow API_DESIGN_STANDARDS.md for response format and error handling.
```

This generates ~10 files. Copilot shows each diff -- review carefully:
- Check @type discriminator is in every response DTO
- Check all repository queries include `AndDeletedAtIsNull`
- Check no hard DELETE path exists anywhere

### Step 3.5 -- Generate tests

```
#file:.github/copilot-instructions.md
#file:src/main/java/com/telia/party/api/PartyController.java
#file:src/main/java/com/telia/party/domain/Party.java

Acting as the Test Gen Agent, generate a complete test suite
following TEST_STRATEGY.md from copilot-instructions.md.

Generate:

1. domain/PartyTest.java (unit tests)
   - softDelete() sets deleted_at and status INACTIVE
   - softDelete() twice does not change deleted_at (idempotent)
   - national_id validation fails for wrong market format
   - PartyCreatedEvent is raised on construction

2. application/CreatePartyUseCaseTest.java (unit tests with Mockito)
   - Creates individual party successfully
   - Creates organisation party successfully
   - Throws on invalid national_id format
   - Publishes PartyCreatedEvent after save

3. api/PartyControllerTest.java (integration test -- @SpringBootTest)
   - POST /party/v5/party -- 201 with valid Individual body
   - POST /party/v5/party -- 422 when national_id format is wrong for market
   - POST /party/v5/party -- 401 when no Bearer token
   - GET  /party/v5/party/{id} -- 200 with valid ID
   - GET  /party/v5/party/{id} -- 404 for soft-deleted party
   - DELETE /party/v5/party/{id} -- 204, party has deleted_at set
   - DELETE /party/v5/party/{id} -- 404 for already-deleted party

Use Testcontainers for integration tests (real PostgreSQL).
Use fictional test data -- no real personal data.
Follow Given/When/Then comment structure in each test.
```

### Step 3.6 -- Validate the story

```
#file:.github/copilot-instructions.md
#file:.ai/project/FEATURE_ENV_CONFIG.md

Acting as the Feature Validation Agent, validate these acceptance criteria
against the running local environment at http://localhost:8080.

ACs:
Given the user is authenticated with role PARTY_EDITOR
When POST /party/v5/party is called with:
  { "@type": "Individual", "givenName": "Test", "familyName": "Testesen",
    "market": "NO", "nationalId": "01010112345" }
Then 201 is returned and the response includes:
  id (UUID), @type "Individual", href "/party/v5/party/{id}", status "ACTIVE"

Given the user is authenticated with role PARTY_EDITOR
When POST /party/v5/party is called with nationalId "123" for market "NO"
Then 422 VALIDATION_FAILED is returned

Given the user is NOT authenticated
When POST /party/v5/party is called
Then 401 UNAUTHENTICATED is returned

Execute each AC and report PASS / FAIL / BLOCKED with evidence.
Scrub any PII from the evidence before reporting.
```

---

## Phase 4 -- Subsequent epics (same pattern)

Each epic follows the same rhythm:

```
Epic 3 (Party roles -- TMF669):
  Agent: Generate V2__create_party_role_table.sql migration
  Agent: Generate PartyRole domain entity
  Agent: Generate /party/v5/partyRole endpoints

Epic 4 (Consent -- TMF644):
  Agent: Generate V3__create_party_consent_table.sql
  Agent: REVIEW_SECURITY on consent endpoints (GDPR sensitive)
  Agent: Generate /party/v5/partyConsent endpoints

Epic 5 (Characteristics):
  Agent: Generate characteristic framework with market-specific validation

Epic 6 (Audit trail):
  Agent: Generate audit log table and history API

Epic 7-8 (React frontend):
  Create party-management-ui project
  Agent: Generate party search page with Telia design tokens from DESIGN_SYSTEM.md
  Agent: Generate party detail and edit forms
  Agent: Generate party audit display
```

---

## Tips for effective Agent mode prompts

```
Always include:
  #file:.github/copilot-instructions.md  (agent skill files + project context)
  #file:.ai/project/[relevant file]      (specific project context for the task)

Be specific about the agent role:
  "Acting as the Code Gen Agent described in copilot-instructions.md..."
  "Acting as the Data Migration Agent..."
  "Acting as the Peer Review Agent..."

Reference patterns explicitly:
  "Follow BACKEND_PATTERNS.md from copilot-instructions.md"
  "Apply SECURITY_STANDARDS.md S01-S12 checklist"
  "Use TMForum TMF632 Party schema naming conventions"

Confirm HITL gates explicitly:
  "Present gate C01 for Tech Lead review before generating code"
  "List any security concerns before proceeding (gate D02)"
```

---

## Version and review

| File owner | CoE Core |
| Review cadence | After each use case is tested |
| Last updated | 2026-04 |
| Approvers | CoE Lead |
