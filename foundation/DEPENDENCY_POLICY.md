# DEPENDENCY_POLICY.md

# AI Engineering Commons -- Dependency Policy for All Projects

# Version: 1.0.0

# Status: Active

# Last updated: 2026-04

# Owner: CoE Core + Security Lead + Architect representatives

---

## 1. Purpose

This file defines the rules governing how external dependencies are
introduced, approved, maintained, and removed across all Telia engineering
projects. It applies to all package managers and ecosystems in use:
Maven/Gradle (Java), npm/pnpm (TypeScript/React), and NuGet (C#).

Referenced by:

- `agents/VULN_SCAN_AGENT.md` -- scans dependencies against this policy
- `agents/CVE_TRIAGE_AGENT.md` -- classifies findings against approved list
- `agents/PEER_REVIEW_AGENT.md` -- checks new dependencies in every PR
- `agents/REFACTOR_AGENT.md` -- checks replacement libraries against policy
- `SECURITY_STANDARDS.md` section 2.6 -- refers to this file for component rules
- `COMPLIANCE_STANDARDS.md` section 6.3 -- refers to this file for licence rules

When an agent encounters a dependency not in the approved list, it flags
the dependency for human review before proceeding with code generation that
uses it.

---

## 2. Dependency introduction process

### 2.1 Before adding any new dependency

Before generating code that introduces a new dependency, agents must
verify the following. If any check fails, the agent flags it and waits
for human approval before proceeding.


| Check                                      | How to verify                 | Fail action                        |
| ------------------------------------------ | ----------------------------- | ---------------------------------- |
| Dependency is in approved list (section 3) | Check section 3 of this file  | Flag for approval, do not generate |
| Licence is in permitted list (section 5)   | Check licence in section 5    | Flag for Legal review              |
| No known critical CVEs                     | Check against CVE database    | Flag for Security Lead review      |
| Actively maintained                        | Last release within 12 months | Flag for Tech Lead review          |
| Download count indicates community trust   | >100k weekly downloads        | Flag for Tech Lead review          |
| Not a transitive dependency conflict       | Check version compatibility   | Flag for Tech Lead review          |


### 2.2 Approval process for new dependencies

If a required dependency is not in the approved list:

1. Engineer raises a Jira task: "Dependency approval request: [library name]"
2. Task includes: library name, version, licence, purpose, alternatives considered
3. Security Lead reviews within 3 business days
4. If approved, CoE Core adds to the approved list in this file via PR
5. PR requires 2 CoE approvals before merge
6. Dependency may not be used until the PR is merged and released

Agents do not add new dependencies to the approved list autonomously.
That action requires human approval and a CoE PR.

---

## 3. Approved dependency lists

### 3.1 Java / Maven / Gradle -- approved dependencies

**Core framework:**


| Library                | Version range | Purpose               | Notes                    |
| ---------------------- | ------------- | --------------------- | ------------------------ |
| spring-boot            | 3.2.x+        | Application framework | Use starter POMs         |
| spring-security        | 6.x           | Security framework    | OAuth2 resource server   |
| spring-data-jpa        | 3.2.x+        | Database access       | With Hibernate 6.x       |
| spring-kafka           | 3.x           | Kafka integration     |                          |
| spring-cloud-openfeign | 4.x           | HTTP clients          | Declarative REST clients |
| spring-boot-actuator   | 3.2.x+        | Health and metrics    |                          |


**Database:**


| Library        | Version range | Purpose                | Notes                   |
| -------------- | ------------- | ---------------------- | ----------------------- |
| postgresql     | 42.x          | PostgreSQL JDBC driver |                         |
| flyway-core    | 9.x+          | Database migrations    |                         |
| hikaricp       | 5.x           | Connection pooling     | Included in Spring Boot |
| hibernate-core | 6.x           | ORM                    | Via Spring Data JPA     |


**Serialisation:**


| Library                 | Version range | Purpose                  | Notes           |
| ----------------------- | ------------- | ------------------------ | --------------- |
| jackson-databind        | 2.16.x+       | JSON serialisation       |                 |
| jackson-datatype-jsr310 | 2.16.x+       | Java 8 date/time support |                 |
| jackson-module-kotlin   | 2.16.x+       | Kotlin support           | If using Kotlin |


**Utilities:**


| Library       | Version range | Purpose                | Notes                     |
| ------------- | ------------- | ---------------------- | ------------------------- |
| lombok        | 1.18.x+       | Boilerplate reduction  |                           |
| mapstruct     | 1.5.x+        | Object mapping         |                           |
| guava         | 32.x+         | Core utilities         | Prefer JDK where possible |
| commons-lang3 | 3.14.x+       | String/array utilities |                           |
| commons-io    | 2.15.x+       | IO utilities           |                           |


**Observability:**


| Library            | Version range | Purpose             | Notes           |
| ------------------ | ------------- | ------------------- | --------------- |
| micrometer-core    | 1.12.x+       | Metrics             |                 |
| micrometer-tracing | 1.2.x+        | Distributed tracing |                 |
| logback-classic    | 1.4.x+        | Logging             | Via Spring Boot |


**Security:**


| Library         | Version range | Purpose      | Notes         |
| --------------- | ------------- | ------------ | ------------- |
| nimbus-jose-jwt | 9.x+          | JWT handling |               |
| bcprov-jdk18on  | 1.77.x+       | Cryptography | Bouncy Castle |


**Testing:**


| Library               | Version range | Purpose                     | Notes           |
| --------------------- | ------------- | --------------------------- | --------------- |
| junit-jupiter         | 5.10.x+       | Unit testing framework      |                 |
| mockito-core          | 5.x+          | Mocking                     |                 |
| mockito-junit-jupiter | 5.x+          | Mockito + JUnit 5           |                 |
| assertj-core          | 3.25.x+       | Fluent assertions           |                 |
| testcontainers        | 1.19.x+       | Integration test containers |                 |
| spring-boot-test      | 3.2.x+        | Spring testing support      |                 |
| wiremock              | 3.x           | HTTP stub server            |                 |
| h2database            | 2.x           | In-memory DB for tests      | Test scope only |
| rest-assured          | 5.x           | REST API testing            |                 |


### 3.2 TypeScript / npm -- approved dependencies

**Core framework:**


| Library    | Version range | Purpose                    | Notes                  |
| ---------- | ------------- | -------------------------- | ---------------------- |
| react      | 18.x+         | UI framework               |                        |
| react-dom  | 18.x+         | DOM rendering              |                        |
| next       | 14.x+         | Full-stack React framework | If SSR required        |
| typescript | 5.x+          | Type system                |                        |
| vite       | 5.x+          | Build tool                 | Preferred over webpack |


**State management:**


| Library               | Version range | Purpose                  | Notes                     |
| --------------------- | ------------- | ------------------------ | ------------------------- |
| @tanstack/react-query | 5.x+          | Server state management  | Preferred                 |
| zustand               | 4.x+          | Client state management  | Lightweight               |
| @reduxjs/toolkit      | 2.x+          | Complex state management | When zustand insufficient |


**Data fetching and validation:**


| Library               | Version range | Purpose                      | Notes                      |
| --------------------- | ------------- | ---------------------------- | -------------------------- |
| axios                 | 1.x+          | HTTP client                  |                            |
| zod                   | 3.x+          | Runtime validation and types | Required for external data |
| @tanstack/react-query | 5.x+          | Data fetching/caching        |                            |


**UI components and styling:**


| Library                  | Version range | Purpose                        | Notes                   |
| ------------------------ | ------------- | ------------------------------ | ----------------------- |
| @radix-ui/*              | latest        | Headless accessible components | Preferred for custom UI |
| tailwindcss              | 3.x+          | Utility CSS                    |                         |
| clsx                     | 2.x+          | Conditional classnames         |                         |
| class-variance-authority | 0.7.x+        | Component variants             |                         |


**Forms:**


| Library             | Version range | Purpose                   | Notes |
| ------------------- | ------------- | ------------------------- | ----- |
| react-hook-form     | 7.x+          | Form management           |       |
| @hookform/resolvers | 3.x+          | Zod integration for forms |       |


**Utilities:**


| Library   | Version range | Purpose           | Notes                    |
| --------- | ------------- | ----------------- | ------------------------ |
| date-fns  | 3.x+          | Date manipulation | Preferred over moment.js |
| lodash-es | 4.x+          | Utility functions | ESM version only         |
| uuid      | 9.x+          | UUID generation   |                          |


**Accessibility:**


| Library                | Version range | Purpose               | Notes     |
| ---------------------- | ------------- | --------------------- | --------- |
| @axe-core/react        | 4.x+          | Accessibility testing | Dev only  |
| jest-axe               | 8.x+          | axe in Jest           | Test only |
| eslint-plugin-jsx-a11y | 6.x+          | Accessibility linting | Dev only  |


**Testing:**


| Library                     | Version range | Purpose                     | Notes               |
| --------------------------- | ------------- | --------------------------- | ------------------- |
| vitest                      | 1.x+          | Unit test framework         | Preferred with Vite |
| @testing-library/react      | 14.x+         | Component testing           |                     |
| @testing-library/user-event | 14.x+         | User interaction simulation |                     |
| @testing-library/jest-dom   | 6.x+          | DOM matchers                |                     |
| msw                         | 2.x+          | API mocking                 |                     |
| playwright                  | 1.40.x+       | E2E testing                 |                     |


**Code quality:**


| Library              | Version range | Purpose                 | Notes |
| -------------------- | ------------- | ----------------------- | ----- |
| eslint               | 8.x+          | Linting                 |       |
| prettier             | 3.x+          | Formatting              |       |
| @typescript-eslint/* | 6.x+          | TypeScript ESLint rules |       |


### 3.3 C# / NuGet -- approved dependencies

**Core framework:**


| Library                                       | Version range | Purpose            | Notes      |
| --------------------------------------------- | ------------- | ------------------ | ---------- |
| Microsoft.AspNetCore.*                        | 8.x+          | Web framework      | .NET 8 LTS |
| Microsoft.EntityFrameworkCore                 | 8.x+          | ORM                |            |
| Microsoft.EntityFrameworkCore.SqlServer       | 8.x+          | SQL Server driver  |            |
| Microsoft.EntityFrameworkCore.PostgreSQL      | 8.x+          | PostgreSQL driver  | Npgsql     |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.x+          | JWT authentication |            |


**Messaging:**


| Library                    | Version range | Purpose                 | Notes |
| -------------------------- | ------------- | ----------------------- | ----- |
| Confluent.Kafka            | 2.x+          | Kafka client            |       |
| MassTransit                | 8.x+          | Message bus abstraction |       |
| Azure.Messaging.ServiceBus | 7.x+          | Azure Service Bus       |       |


**Utilities:**


| Library          | Version range | Purpose               | Notes |
| ---------------- | ------------- | --------------------- | ----- |
| AutoMapper       | 12.x+         | Object mapping        |       |
| FluentValidation | 11.x+         | Request validation    |       |
| MediatR          | 12.x+         | Mediator pattern      | CQRS  |
| Serilog          | 3.x+          | Structured logging    |       |
| Polly            | 8.x+          | Resilience and retry  |       |
| Dapper           | 2.x+          | Micro-ORM for raw SQL |       |


**Observability:**


| Library         | Version range | Purpose             | Notes |
| --------------- | ------------- | ------------------- | ----- |
| OpenTelemetry.* | 1.7.x+        | Distributed tracing |       |
| prometheus-net  | 8.x+          | Prometheus metrics  |       |


**Testing:**


| Library                          | Version range | Purpose               | Notes |
| -------------------------------- | ------------- | --------------------- | ----- |
| xunit                            | 2.7.x+        | Test framework        |       |
| Moq                              | 4.20.x+       | Mocking               |       |
| FluentAssertions                 | 6.x+          | Assertion library     |       |
| AutoFixture                      | 4.x+          | Test data generation  |       |
| Microsoft.AspNetCore.Mvc.Testing | 8.x+          | Integration testing   |       |
| Testcontainers                   | 3.x+          | Container-based tests |       |
| WireMock.Net                     | 1.5.x+        | HTTP stub server      |       |


---

## 4. Explicitly banned dependencies

These dependencies must never be introduced into any Telia project.
Agents must block any code generation that would add these.


| Library                               | Ecosystem | Reason for ban                                 |
| ------------------------------------- | --------- | ---------------------------------------------- |
| moment                                | npm       | Deprecated, large bundle size -- use date-fns  |
| lodash                                | npm       | Use lodash-es for tree-shaking or native JS    |
| request                               | npm       | Deprecated -- use axios or native fetch        |
| node-fetch                            | npm       | Use native fetch (Node 18+)                    |
| log4j                                 | Java      | Critical CVEs (Log4Shell) -- use logback       |
| commons-collections 3.x               | Java      | Known deserialization CVEs -- use 4.x          |
| BouncyCastle (old package)            | Java      | Use bcprov-jdk18on                             |
| Newtonsoft.Json                       | C#        | Use System.Text.Json unless legacy requirement |
| jQuery                                | npm       | Not appropriate for React applications         |
| react-router v5                       | npm       | Use v6+                                        |
| passport                              | npm       | Use established framework-native auth          |
| jsonwebtoken                          | npm       | Manual JWT handling -- use framework auth      |
| Any library with < 1000 GitHub stars  | Any       | Insufficient community validation              |
| Any library not updated in 2+ years   | Any       | Likely unmaintained                            |
| Any library with a known critical CVE | Any       | Until CVE is patched                           |


---

## 5. Permitted open source licences

### 5.1 Approved for production use (no restrictions)

- MIT
- Apache 2.0
- BSD 2-Clause
- BSD 3-Clause
- ISC
- CC0 1.0 (public domain)
- Unlicense

### 5.2 Approved with conditions


| Licence        | Condition for use                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------- |
| LGPL 2.1 / 3.0 | Library must be used without modification and linked dynamically. Approved by Legal before use. |
| MPL 2.0        | File-level copyleft -- modifications to MPL files must be open-sourced. Approved by Legal.      |
| CDDL 1.0       | Only for specific approved libraries (e.g. GlassFish). Legal approval required.                 |


### 5.3 Prohibited licences


| Licence                                   | Reason                                                          |
| ----------------------------------------- | --------------------------------------------------------------- |
| GPL v2                                    | Strong copyleft -- would require open-sourcing proprietary code |
| GPL v3                                    | Strong copyleft with additional restrictions                    |
| AGPL v3                                   | Network copyleft -- triggered by SaaS deployment                |
| SSPL                                      | MongoDB licence -- not OSI approved, similar effect to AGPL     |
| Commons Clause                            | Restricts commercial use                                        |
| BSL (Business Source Licence)             | Restricts production use                                        |
| Proprietary with no redistribution rights | Cannot be included in our build artefacts                       |


When a required library uses a prohibited licence, raise a Legal review
ticket before any use. Legal may grant a specific exception in writing.

---

## 6. Version pinning and upgrade rules

### 6.1 Version pinning strategy


| Ecosystem     | Strategy                         | Example            |
| ------------- | -------------------------------- | ------------------ |
| Java (Maven)  | Pin major and minor, allow patch | `3.2.+` or `3.2.4` |
| Java (Gradle) | Pin major and minor, allow patch | `"3.2.+"`          |
| npm           | Pin major, allow minor and patch | `"^18.0.0"`        |
| NuGet         | Pin major and minor, allow patch | `[8.0.*, 9.0)`     |


Never use floating versions for security-sensitive libraries
(authentication, cryptography, JWT). Pin these to exact versions:

```xml
<!-- Maven -- exact version for security libraries -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-resource-server</artifactId>
    <version>6.2.1</version>
</dependency>
```

### 6.2 Upgrade cadence


| Vulnerability type        | Maximum time to upgrade                      |
| ------------------------- | -------------------------------------------- |
| Critical CVE (CVSS 9.0+)  | 48 hours                                     |
| High CVE (CVSS 7.0-8.9)   | 7 days                                       |
| Medium CVE (CVSS 4.0-6.9) | 30 days                                      |
| Low CVE (CVSS < 4.0)      | 90 days or next planned upgrade              |
| No CVE -- major version   | Review within 6 months of release            |
| No CVE -- minor version   | Review within 3 months of release            |
| No CVE -- patch version   | Apply within 2 weeks (Dependabot auto-merge) |


### 6.3 Dependabot configuration

All projects must have Dependabot configured to monitor dependencies.
The Pipeline Agent generates this configuration when scaffolding a new
service:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: maven
    directory: "/"
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 10
    labels: ["dependency-update"]
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 10
    labels: ["dependency-update"]
```

Major version updates are excluded from auto-PR because they frequently
contain breaking changes and require manual review.

---

## 7. Transitive dependency management

### 7.1 Transitive dependency rules

- Do not rely on transitive dependencies for direct usage in code
- If a transitive dependency is used directly, declare it explicitly
- Use dependency management sections to enforce version consistency

```xml
<!-- Maven -- enforce transitive dependency versions -->
<dependencyManagement>
  <dependencies>
    <!-- Force specific version of a transitive dependency -->
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.16.1</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

### 7.2 Dependency exclusions

When a transitive dependency has a known CVE and the parent has not
yet updated it, exclude and replace explicitly:

```xml
<!-- Maven -- exclude vulnerable transitive, replace with safe version -->
<dependency>
  <groupId>some.library</groupId>
  <artifactId>some-library</artifactId>
  <version>1.0.0</version>
  <exclusions>
    <exclusion>
      <groupId>vulnerable.group</groupId>
      <artifactId>vulnerable-lib</artifactId>
    </exclusion>
  </exclusions>
</dependency>
<!-- Explicit safe version -->
<dependency>
  <groupId>vulnerable.group</groupId>
  <artifactId>vulnerable-lib</artifactId>
  <version>2.0.0</version> <!-- patched version -->
</dependency>
```

---

## 8. Dependency review checklist for agents

The Peer Review Agent checks every PR that modifies dependency files
(pom.xml, package.json, build.gradle, *.csproj) against this list.


| #   | Check                                                                 | Severity |
| --- | --------------------------------------------------------------------- | -------- |
| D01 | New dependency is in approved list (section 3)                        | BLOCK    |
| D02 | Dependency licence is in permitted list (section 5)                   | BLOCK    |
| D03 | Dependency is not in banned list (section 4)                          | BLOCK    |
| D04 | No known critical or high CVEs in new dependency                      | BLOCK    |
| D05 | Dependency is actively maintained (< 12 months since last release)    | WARN     |
| D06 | Security-sensitive libraries are pinned to exact version              | WARN     |
| D07 | Dependabot configuration present in repository                        | WARN     |
| D08 | Test-scope dependencies not leaking to production scope               | WARN     |
| D09 | No direct use of transitive dependencies without explicit declaration | WARN     |
| D10 | Version pinning strategy follows section 6.1                          | INFO     |


---

## 9. Version and review


| Attribute       | Value                                                            |
| --------------- | ---------------------------------------------------------------- |
| File owner      | CoE Core + Security Lead + Architect representatives             |
| Review cadence  | Quarterly -- approved list updated as new libraries are approved |
| Last reviewed   | 2026-04                                                          |
| Next review due | 2026-04                                                          |
| Approvers       | CoE Lead, Security Lead, Architect representative                |
| Change process  | PR to ai-engineering-common, Security Lead approval required     |


