# PARTY_MANAGEMENT_WALKTHROUGH.md
# Playbooks -- Party Management system: step-by-step in Cursor
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## What this walkthrough covers

This is the concrete, command-by-command guide for building the
Telia Party Information Management system using Cursor as the
primary IDE. It follows GREENFIELD_JOURNEY.md and NEW_FEATURE_JOURNEY.md
but with every Cursor-specific step made explicit.

**Prerequisites before starting:**
- [ ] CURSOR_SETUP.md completed (Cursor installed, MCP configured)
- [ ] SECRETS_GUIDE.md completed (.env created, env vars set permanently)
- [ ] MCP connections verified (Jira and Confluence responding in Chat)
- [ ] `npx aec` command works in Cursor terminal

---

## Phase 1 -- Service brief and Architect approval

### 1.1 Write the service brief

Open a new file `party-service-brief.md` in Cursor and type:

```markdown
Service name:    party-management-service (Java backend)
                 party-management-ui (React frontend)
Domain:          party
Purpose:         Master data management for Telia party information.
                 Manages B2C (individual), B2B (organisation), and
                 B2O (operator) party records. Single authoritative
                 source for party identity, roles, consent, and
                 characteristics across Norwegian, Swedish, and
                 Finnish markets.

API standard:    TMForum TMF632 Party Management API v5
                 TMForum TMF669 Party Role Management API v4
                 TMForum TMF644 Party Consent Management API v2

Tech stack:      Java 21 / Spring Boot 3.2 (backend)
                 React 18 / TypeScript / Next.js 14 (frontend)
                 PostgreSQL 15
                 Kafka (party lifecycle events)

Consumers:       Order management, billing, CRM, regulatory reporting
Dependencies:    CIAM (auth), compliance-registry (GDPR lawful basis)
Team:            [your team name]
Tech Lead:       [your name]

Key constraints:
  - Soft delete only: party records are never hard deleted
  - GDPR: all personal data requires documented lawful basis
  - TMForum: API responses must conform exactly to TMF schemas
  - Multi-market: NO personnummer, SE personnummer, FI henkilotunnus
  - NIS2: system handles regulated telecom personal data
```

### 1.2 Generate gate B01 presentation in Cursor Chat

Open Cursor Chat (Ctrl+L):

```
@CLAUDE.md
@party-service-brief.md

Acting as the Orchestrator Agent described in CLAUDE.md, prepare
the gate B01 presentation for Architect approval of the new
party-management-service. Use the HITL_PROTOCOL.md gate format.
```

Cursor reads both files and generates the formatted gate B01 output.
Copy the output and share with your Architect (email, Confluence, or
paste directly into Jira as a comment on an architecture epic).

**Wait for Architect approval before continuing.**

---

## Phase 2 -- Scaffold the service (after gate B01 approval)

### 2.1 Create the project folder structure

```powershell
# In Cursor terminal (Ctrl+`)
mkdir party-management-service
cd party-management-service

# Install commons
npm install @telia-company/ai-engineering-common

# Initialise
npx aec init
```

This creates:
```
party-management-service/
  .ai/
    project/
      ARCHITECTURE_OVERVIEW.md  (stub)
      MODULE_REGISTRY.md        (stub)
      INTEGRATION_MAP.md        (stub)
      KAFKA_TOPICS.md           (stub)
      DATA_MODEL.md             (stub)
      TECH_DEBT_REGISTRY.md     (stub)
      FEATURE_ENV_CONFIG.md     (stub)
      SRE_SERVICE_CONFIG.md     (stub)
  CLAUDE.md                     (generated -- currently thin)
  .github/
    copilot-instructions.md     (generated)
  .cursorrules                  (generated)
```

Open in Cursor:
```powershell
cursor .
```

### 2.2 Scaffold the Spring Boot project structure

In Cursor Composer (Ctrl+I):

```
@CLAUDE.md
@.ai/project/ARCHITECTURE_OVERVIEW.md

Acting as the Greenfield Scaffold Agent described in CLAUDE.md,
scaffold a Java 21 / Spring Boot 3.2 project structure for the
party-management-service.

Create the following directory structure:
  src/main/java/com/telia/party/
    api/          (REST controllers and DTOs)
    application/  (use cases and application services)
    domain/       (entities, value objects, domain services)
    infrastructure/ (JPA repositories, Kafka, HTTP clients)
    config/       (Spring configuration)
  src/main/resources/
    application.yml
    application-local.yml
    db/migration/ (empty -- Flyway migrations go here)
  src/test/java/com/telia/party/
    api/
    application/
    domain/
    infrastructure/

Also create:
  pom.xml with Java 21, Spring Boot 3.2, PostgreSQL, Flyway, Kafka,
  Lombok, JUnit 5, Testcontainers, Micrometer (Prometheus)
  .gitignore for Java/Maven
  docker-compose.yml with PostgreSQL 15 and Kafka for local dev
  Dockerfile (multi-stage build with eclipse-temurin:21-jre-alpine)
```

Cursor generates all files. Review the diffs and accept (Ctrl+Enter).

### 2.3 Scaffold the React frontend

Open a second terminal, navigate to the parent folder:

```powershell
cd ..
mkdir party-management-ui
cd party-management-ui
npm install @telia-company/ai-engineering-common
npx aec init
cursor .
```

In Cursor Composer for the frontend project:

```
@CLAUDE.md

Acting as the Greenfield Scaffold Agent, scaffold a Next.js 14 /
React 18 / TypeScript project for the party-management-ui.

Create:
  src/
    app/         (Next.js app router)
    components/  (reusable UI components)
    features/    (feature-level components: party-search, party-detail)
    hooks/       (custom React hooks)
    api/         (API client layer)
    types/       (TypeScript types matching TMF632 schemas)
  public/

package.json with Next.js 14, React 18, TypeScript, TanStack Query,
React Hook Form, Vitest, Testing Library, jest-axe, ESLint

global.css with all Telia design tokens from DESIGN_SYSTEM.md in CLAUDE.md
```

---

## Phase 3 -- Fill in project context files

This is the most important step. Do not skip it. The quality of every
subsequent AI output depends on these files being accurate.

Open `.ai/project/ARCHITECTURE_OVERVIEW.md` in Cursor and use Chat:

```
@.ai/project/ARCHITECTURE_OVERVIEW.md

Help me fill in this ARCHITECTURE_OVERVIEW.md for the
party-management-service. The service details are:
[paste your service brief]

Generate content for all sections with specific, accurate information.
Include in Key constraints:
- All APIs must follow TMForum TMF632/TMF669/TMF644 schemas exactly
- Soft delete: use deleted_at timestamp, never DELETE from tables
- GDPR: every personal data field needs documented lawful basis
- Multi-market national IDs: validate format per market (NO/SE/FI)
- Monetary values: never stored in this service (belongs to billing)
```

Review, edit to be accurate, save.

Repeat for each project file. Use these Chat prompts:

**MODULE_REGISTRY.md:**
```
Help me fill in MODULE_REGISTRY.md for a Java Spring Boot service
with four layers: party-api (controllers), party-application (use cases),
party-domain (entities and business rules), party-infrastructure (JPA, Kafka).
All modules are Active. The owning team is [team name].
```

**INTEGRATION_MAP.md:**
```
Help me fill in INTEGRATION_MAP.md. Outbound: CIAM (OAuth2 token validation),
Kafka (publish party.party.created/updated events), compliance-registry (REST,
GDPR lawful basis lookup). Inbound: billing-service, order-management, CRM.
DPA status for all external systems is Unknown -- need Security Lead confirmation.
```

**DATA_MODEL.md:**
```
Help me fill in DATA_MODEL.md for a TMForum party system.
Tables: party (core party record with soft delete), party_characteristic
(extensible attributes), party_role (TMF669 roles), party_consent (TMF644
consent records). All tables contain personal data.
Retention: active party record + 7 years post soft deletion.
```

**KAFKA_TOPICS.md:**
```
Help me fill in KAFKA_TOPICS.md. We produce to:
  party.party.created -- Avro schema, published when a party is created
  party.party.updated -- Avro schema, published when party data changes
  party.party.deleted -- Avro schema, published when party is soft-deleted
All topics may contain personal data (party identification fields).
```

**FEATURE_ENV_CONFIG.md:**
```
Help me fill in FEATURE_ENV_CONFIG.md for a Spring Boot service
with docker-compose. The service runs on port 8080. Health check at
GET /health. Test database is PostgreSQL on port 5432. Kafka on port 9092.
Test users: party-viewer (read-only), party-editor (read-write), party-admin.
```

After filling in all files:

```powershell
npx aec update
```

Verify context is now rich:

```
# In Cursor Chat:
What project is this? List all modules, integrations, and key constraints.
```

Expected: Cursor accurately describes the Party Management service using
the content you filled in -- TMForum APIs, soft delete, multi-market IDs,
GDPR requirements, all modules.

If the response is accurate: commit all project files.

```powershell
git init
git add .
git commit -m "chore: initial scaffold with project context files"
```

---

## Phase 4 -- Gate B05: Architect approves initial ADRs

In Cursor Chat:

```
@CLAUDE.md
@.ai/project/ARCHITECTURE_OVERVIEW.md

Create three Architecture Decision Records for the party-management-service
following the ADR_TEMPLATE.md format:

ADR-001: Java 21 / Spring Boot 3.2 as the backend technology
  Context: New MDM service for party data. Team has Java expertise.
  Decision: Use Java 21 LTS with Spring Boot 3.2.
  Alternatives: Kotlin/Ktor (less team familiarity), C#/.NET (not standard for this domain)

ADR-002: TMForum TMF632/669/644 as the API standard
  Context: Telia is a TMForum member. Party APIs need to integrate with
           multiple internal systems and potentially external partners.
  Decision: Adopt TMForum Party Management API v5 as the API contract.
  Alternatives: Internal REST standards (less interoperability), GraphQL (not TMForum aligned)

ADR-003: PostgreSQL 15 as the primary data store
  Context: Party data requires ACID transactions, complex queries, and
           JSON support for extensible characteristics.
  Decision: Use Azure Database for PostgreSQL 15 Flexible Server.
  Alternatives: SQL Server (also acceptable), MongoDB (ACID concerns for MDM)

Output each ADR using the template format with all required sections.
```

Share these with your Architect. When approved, update each ADR status
from "Proposed" to "Accepted" in your Confluence space.

---

## Phase 5 -- First sprint: Foundation stories

### 5.1 Story 1: Local development environment

In Cursor Chat (reads the story from Jira via MCP):

```
WRITE_SPEC PARTY-[story-1-key]
```

Or if MCP is not configured yet, paste the story manually:

```
@CLAUDE.md
@.ai/project/ARCHITECTURE_OVERVIEW.md
@.ai/project/MODULE_REGISTRY.md

Acting as the Spec Writer Agent described in CLAUDE.md, generate a
technical specification for this story:

Summary: Set up local development environment
ACs:
  Given a developer clones the party-management-service repository
  When they run docker-compose up
  Then PostgreSQL, Kafka, and the service all start healthy

  Given the service is running locally
  When GET http://localhost:8080/health is called
  Then it returns 200 with status UP within 100ms

Use TECHNICAL_SPEC_TEMPLATE.md structure from CLAUDE.md.
```

Review the spec output. Gate C01: confirm the spec is correct.

In Cursor Composer (Ctrl+I):

```
@CLAUDE.md
@.ai/project/MODULE_REGISTRY.md
@docker-compose.yml

GENERATE_CODE PARTY-[story-1-key]

The approved spec says:
- docker-compose.yml with PostgreSQL 15 on port 5432 and Kafka on port 9092
- Health check endpoint at GET /actuator/health (Spring Boot Actuator)
- application-local.yml pointing at the docker-compose services
- README.md with quickstart instructions

Follow BACKEND_PATTERNS.md in CLAUDE.md for the Spring Boot configuration.
Apply the SECURITY_BASELINE.md -- no hardcoded credentials.
```

Cursor generates the files and shows you diffs. Review each file:
- `docker-compose.yml` -- check service names and port mappings
- `application-local.yml` -- check it references env vars, not hardcoded credentials
- `src/main/java/.../config/HealthConfig.java` -- check it follows the pattern

Accept the diffs. Then run peer review:

```
@CLAUDE.md

Acting as the Peer Review Agent described in CLAUDE.md, review
the files just generated for this story.

Files to review:
@docker-compose.yml
@src/main/resources/application-local.yml

Apply these checklists:
- SECURITY_STANDARDS.md S01-S12 (BLOCK items)
- CODING_STANDARDS.md patterns
- No hardcoded credentials (Secrets Scan check)
```

Address any BLOCK findings. Gate D01: Tech Lead reviews in GitHub.

### 5.2 Story 2: Authentication with CIAM

In Cursor Composer:

```
@CLAUDE.md
@.ai/project/INTEGRATION_MAP.md
@src/main/resources/application.yml

Acting as the Code Gen Agent described in CLAUDE.md, implement
Spring Security OAuth2 resource server configuration for the
party-management-service.

Requirements from ARCHITECTURE_OVERVIEW.md:
- All non-public endpoints require Bearer token authentication
- Token validation via CIAM (JIRA_BASE_URL value from INTEGRATION_MAP.md)
- Public endpoints: GET /health only

Generate:
1. SecurityConfig.java in config/ package
2. application.yml oauth2 resource server section
3. SecurityConfigTest.java with tests for:
   - Unauthenticated request returns 401
   - Authenticated request proceeds
   - GET /health is public (no token needed)

Follow SECURITY_STANDARDS.md S05 (auth requirements) from CLAUDE.md.
Follow BACKEND_PATTERNS.md controller patterns.
```

---

## Phase 6 -- Epic 2: Party CRUD (the first real TMForum feature)

### 6.1 Draft the party CRUD stories

In Cursor Chat:

```
@CLAUDE.md
@.ai/project/ARCHITECTURE_OVERVIEW.md
@.ai/project/DATA_MODEL.md

Acting as the Story Drafter Agent described in CLAUDE.md, draft
Jira stories for the Party CRUD epic. The epic is:
"Implement TMF632 Party Management core API endpoints"

Required capabilities:
- Create a party (POST /party/v5/party) -- Individual, Organisation, Operator types
- Get a party by ID (GET /party/v5/party/{id})
- List parties with filtering (GET /party/v5/party?type=&status=)
- Update a party (PATCH /party/v5/party/{id}) -- JSON Merge Patch
- Soft delete a party (DELETE /party/v5/party/{id} -- sets deleted_at)

Each story should have Given/When/Then acceptance criteria.
Include stories for the data model (Flyway migration) and domain entity.

Output as a Jira-ready story list.
```

Review and create the stories in Jira. Then:

```
# In Cursor Chat:
ESTIMATE_STORIES PARTY-[list of story keys]
```

### 6.2 Data model migration story

This is always the first story in an API epic because code depends on it.

In Cursor Composer:

```
@CLAUDE.md
@.ai/project/DATA_MODEL.md

GENERATE_MIGRATION PARTY-[migration-story-key]

Create a Flyway migration V1__create_party_tables.sql for:

Table: party
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  type          VARCHAR(50) NOT NULL   -- INDIVIDUAL, ORGANISATION, OPERATOR
  status        VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
  market        CHAR(2) NOT NULL       -- NO, SE, FI
  external_id   VARCHAR(200)
  href          VARCHAR(500)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  deleted_at    TIMESTAMPTZ            -- soft delete timestamp

Table: party_individual (extends party for B2C)
  party_id           UUID PRIMARY KEY REFERENCES party(id)
  given_name         VARCHAR(200)     -- PII
  family_name        VARCHAR(200)     -- PII
  full_name          VARCHAR(500)     -- PII
  preferred_name     VARCHAR(200)
  gender             VARCHAR(50)
  nationality        CHAR(2)
  birth_date         DATE             -- PII
  national_id        VARCHAR(50)      -- PII (personnummer format varies by market)
  marital_status     VARCHAR(50)

Table: party_organisation (extends party for B2B)
  party_id           UUID PRIMARY KEY REFERENCES party(id)
  trading_name       VARCHAR(500)     -- PII (company name)
  legal_name         VARCHAR(500)     -- PII
  organisation_type  VARCHAR(100)
  registration_no    VARCHAR(100)
  tax_exempt_cert    VARCHAR(200)

Table: party_characteristic
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
  party_id     UUID NOT NULL REFERENCES party(id)
  name         VARCHAR(200) NOT NULL
  value        TEXT
  value_type   VARCHAR(50)

Add COMMENT ON COLUMN for every PII field with retention policy:
"Personal data. Retention: active party record + 7 years post soft deletion."

Add indexes on: party.type, party.status, party.market,
party_individual.national_id, party_individual.family_name

Apply all rules from DATA_MIGRATION_AGENT.md in CLAUDE.md:
- Every migration has a rollback script
- All PII columns have retention comments
- Use expand-contract for any NOT NULL additions
```

Review the generated migration carefully -- this is the foundation
everything else builds on. Check:
- All PII fields have retention comments
- Indexes make sense for the query patterns
- Rollback script is correct

Gate C04: Tech Lead + DBA approve.

### 6.3 Party domain entity

In Cursor Composer:

```
@CLAUDE.md
@.ai/project/MODULE_REGISTRY.md
@src/main/resources/db/migration/V1__create_party_tables.sql

Acting as the Code Gen Agent, implement the Party domain entity
following BACKEND_PATTERNS.md in CLAUDE.md (domain entity pattern section).

Create:
  domain/Party.java              -- Base party entity (JPA @Entity)
  domain/PartyIndividual.java    -- Individual party (@Entity, inherits Party)
  domain/PartyOrganisation.java  -- Organisation party (@Entity)
  domain/PartyType.java          -- Enum: INDIVIDUAL, ORGANISATION, OPERATOR
  domain/PartyStatus.java        -- Enum: ACTIVE, INACTIVE
  domain/PartyMarket.java        -- Enum: NO, SE, FI
  domain/PartyCharacteristic.java -- Characteristic value object

Business rules in the domain:
  - Party cannot change type after creation
  - Soft delete sets deleted_at and status to INACTIVE
  - deleted_at cannot be unset once set
  - national_id format must match market (NO: 11 digits, SE: 10 digits, FI: 11 chars)

Raise domain events:
  - PartyCreatedEvent when party is first saved
  - PartyUpdatedEvent when any field changes
  - PartyDeletedEvent when soft-deleted

Follow the entity pattern from BACKEND_PATTERNS.md exactly.
Use Lombok @Getter, @Builder for value objects.
No @Setter -- all mutations via domain methods.
```

### 6.4 Party CRUD API endpoints

In Cursor Composer:

```
@CLAUDE.md
@src/main/java/com/telia/party/domain/Party.java
@src/main/java/com/telia/party/domain/PartyIndividual.java
@.ai/project/DATA_MODEL.md

Acting as the Code Gen Agent, implement the TMF632 Party Management
API for the party-management-service.

Create in order:

1. infrastructure/PartyRepository.java
   JpaRepository<Party, UUID>
   findByIdAndDeletedAtIsNull(UUID id) -- exclude soft-deleted
   findAllByTypeAndStatusAndDeletedAtIsNull(type, status, Pageable)

2. application/GetPartyUseCase.java
   Returns party by ID or throws PartyNotFoundException

3. application/CreatePartyUseCase.java
   Creates Individual or Organisation party
   Validates national_id format against market
   Publishes PartyCreatedEvent via Kafka after save

4. application/UpdatePartyUseCase.java
   JSON Merge Patch semantics (null = remove field)
   Only non-null fields in request are updated
   Publishes PartyUpdatedEvent

5. application/DeletePartyUseCase.java
   Sets deleted_at = now() and status = INACTIVE
   Hard DELETE is forbidden -- throw exception if attempted
   Publishes PartyDeletedEvent

6. api/dto/PartyDto.java (TMF632 response schema)
   @type field for polymorphism (Individual, Organisation, Operator)
   href field populated as /party/v5/party/{id}
   All fields match TMF632 Party schema

7. api/PartyController.java
   POST   /party/v5/party           -- createParty
   GET    /party/v5/party/{id}      -- getParty
   GET    /party/v5/party           -- listParties with ?type ?status ?offset ?limit
   PATCH  /party/v5/party/{id}      -- updateParty (JSON Merge Patch)
   DELETE /party/v5/party/{id}      -- deleteParty (soft delete)

Follow BACKEND_PATTERNS.md patterns for all layers.
Follow API_DESIGN_STANDARDS.md for error responses.
Authentication: all endpoints require Bearer token (from SecurityConfig).
```

This is the largest Composer task so far. Cursor will generate 7+ files.
Review each diff carefully. The most important things to check:
- TMForum `@type` discriminator is present in response DTOs
- Soft delete is enforced (no hard DELETE path exists)
- national_id format validation differs by market
- Domain events are published AFTER save, not before

---

## Phase 7 -- Running it locally

After the CRUD endpoints are generated:

```powershell
# In Cursor terminal
docker-compose up -d
./mvnw spring-boot:run

# Test the health endpoint
curl http://localhost:8080/health

# Test party creation (you need a Bearer token from CIAM)
curl -X POST http://localhost:8080/party/v5/party \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "@type": "Individual",
    "givenName": "Test",
    "familyName": "Testesen",
    "market": "NO"
  }'
```

---

## Phase 8 -- AC validation

In Cursor Chat:

```
@CLAUDE.md
@.ai/project/FEATURE_ENV_CONFIG.md

Acting as the Feature Validation Agent described in CLAUDE.md,
validate the acceptance criteria for PARTY-[story-key].

The test environment is at http://localhost:8080.
Test user credentials are in FEATURE_ENV_CONFIG.md.

Run the AC execution protocol from AC_EXECUTOR_AGENT.md in CLAUDE.md
for each Given/When/Then AC in the story.

Report: PASS / FAIL / BLOCKED / SKIP per AC with evidence.
```

---

## Phase 9 -- Repeat for remaining features

Each subsequent epic follows the same rhythm:

```
Epic 3 (Party roles):
  Composer: GENERATE_MIGRATION for party_role tables
  Composer: Generate PartyRole domain entity and use cases
  Composer: Generate TMF669 /party/v5/partyRole endpoints

Epic 4 (Consent):
  Composer: GENERATE_MIGRATION for party_consent tables
  Chat: REVIEW_SECURITY on all consent endpoints (GDPR-sensitive)
  Composer: Generate TMF644 /party/v5/partyConsent endpoints

Epic 5 (Characteristics):
  Composer: PartyCharacteristic extensible attribute framework
  Composer: Market-specific validation for national_id formats

Epic 6 (Audit trail):
  Composer: GENERATE_MIGRATION for party_audit_log table
  Composer: Spring Data Envers or custom audit interceptor
  Composer: Audit history API endpoints

Epic 7-8 (React frontend):
  Switch to party-management-ui project in Cursor
  Composer: Generate party search page with Telia design tokens
  Composer: Generate party detail and edit forms
  Composer: Generate party audit display component
```

---

## What to do when Cursor gets it wrong

```
Wrong pattern used:
  Add @BACKEND_PATTERNS.md reference and re-run:
  "@CLAUDE.md @src/main/java/.../SomeExample.java
   The generated code uses RestTemplate but we should use RestClient.
   Regenerate OrderController using RestClient per BACKEND_PATTERNS.md."

TMForum schema not followed:
  Add the specific TMF schema section:
  "The response is missing the @type discriminator required by TMF632.
   Add @type: Individual/Organisation/Operator to the response DTO."

Soft delete not enforced:
  "All repository queries must include AND deleted_at IS NULL.
   Update PartyRepository to exclude soft-deleted records from all
   findBy* methods."

Test missing important case:
  "@CLAUDE.md Add these missing test cases to PartyControllerTest:
   - Attempt to hard-delete a party (should throw exception)
   - Create party with invalid national_id for NO market (should return 422)"
```

---

## Cursor session management tips

```
One story = one Composer session:
  Each story gets a fresh Composer session (Ctrl+Shift+I for new session).
  This prevents context from one story bleeding into another.

Always include @CLAUDE.md at the start of Composer sessions:
  Ensures the agent skill files and project context are always in scope.

Use Chat for analysis, Composer for generation:
  EXPLAIN_MODULE, TRIAGE_BUG, REVIEW_PR --> Chat
  GENERATE_CODE, GENERATE_MIGRATION, GENERATE_TESTS --> Composer

Save chat sessions that contain important decisions:
  Cursor Chat > Save session > name it for the story key.
  These become your audit trail for the HITL gate decisions.
```

---

## Version and review

| File owner | CoE Core |
| Review cadence | After each use case is tested -- update with findings |
| Approvers | CoE Lead |
EOF