# TECH_RADAR.md
# Architecture -- Telia AI Engineering Technology Radar
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core
#
# This file is read by:
#   - Spec Writer Agent (A07) -- checks proposed technologies against radar
#   - Code Gen Agent (A09) -- selects from Adopt/Trial tier libraries
#   - Dependency Mapper Agent (A06) -- flags Assess/Hold libraries

---

## 1. How to read this radar

Technologies fall into four rings:

```
ADOPT    -- Strong recommendation to use. Proven at Telia. Default choice.
TRIAL    -- Promising. Encouraged for new projects with Tech Lead awareness.
ASSESS   -- Interesting but not yet proven. Small experiments only.
HOLD     -- Do not start new usage. Migrate away when practical.
```

A technology not on the radar should be treated as ASSESS until the
CoE reviews it. Raise a GitHub issue to request a radar review.

---

## 2. Languages and frameworks

| Technology | Ring | Notes |
|---|---|---|
| Java 21 (LTS) | ADOPT | Standard backend language |
| TypeScript 5.x | ADOPT | Standard frontend and Node.js language |
| C# 12 / .NET 8 | ADOPT | Standard for .NET services |
| Spring Boot 3.2+ | ADOPT | Standard Java framework |
| Next.js 14+ | ADOPT | Standard React framework |
| ASP.NET Core 8 | ADOPT | Standard C# web framework |
| Java 17 | TRIAL | Acceptable if upgrading to 21 is planned |
| Python 3.12 | TRIAL | For ML/data workloads only -- not general services |
| Go 1.22 | ASSESS | Interesting for CLI tooling |
| Java 11 or older | HOLD | Upgrade to 21 |
| JavaScript (no types) | HOLD | Use TypeScript |
| Node.js without types | HOLD | Use TypeScript |

---

## 3. Databases

| Technology | Ring | Notes |
|---|---|---|
| PostgreSQL 15/16 | ADOPT | Standard relational database |
| Azure SQL (SQL Server 2022) | ADOPT | Acceptable alternative for .NET services |
| Redis 7 | ADOPT | Standard cache and session store |
| Azure Blob Storage | ADOPT | Standard object storage |
| MongoDB | ASSESS | Case-by-case with Architect approval |
| MySQL | HOLD | Use PostgreSQL for new services |
| H2 (in-memory) | HOLD | Use Testcontainers for integration tests |
| Oracle | HOLD | Legacy only -- no new services |

---

## 4. Messaging and streaming

| Technology | Ring | Notes |
|---|---|---|
| Kafka (Confluent Cloud) | ADOPT | Standard async messaging |
| Azure Service Bus | TRIAL | Acceptable for .NET services in Azure-native contexts |
| Azure Event Grid | ASSESS | For event-driven Azure integrations |
| RabbitMQ | HOLD | Migrate to Kafka |
| ActiveMQ | HOLD | Migrate to Kafka |

---

## 5. AI engineering tools

| Technology | Ring | Notes |
|---|---|---|
| GitHub Copilot | ADOPT | Standard inline completion |
| Claude Code | ADOPT | Standard agentic coding assistant |
| Cursor | ADOPT | Alternative IDE with built-in AI |
| @telia-company/ai-engineering-common | ADOPT | Required for all new services |
| GitHub Copilot Chat | TRIAL | Useful but not primary workflow |
| Codeium | ASSESS | Not yet evaluated at Telia scale |
| Tabnine | HOLD | Replaced by Copilot |

---

## 6. Infrastructure and deployment

| Technology | Ring | Notes |
|---|---|---|
| Azure Kubernetes Service (AKS) | ADOPT | Standard deployment target |
| Azure Container Apps | TRIAL | For simpler stateless services |
| Azure Functions | TRIAL | For event-driven serverless workloads |
| GitHub Actions | ADOPT | Standard CI/CD |
| Azure Container Registry | ADOPT | Standard container registry |
| Helm 3 | ADOPT | Standard Kubernetes packaging |
| Terraform | ADOPT | Standard IaC for Azure resources |
| Azure Bicep | TRIAL | Preferred for pure Azure resources |
| Docker Compose | ADOPT | Local development only |
| Azure App Service | HOLD | Use AKS for new services |
| Jenkins | HOLD | Migrate to GitHub Actions |

---

## 7. Observability

| Technology | Ring | Notes |
|---|---|---|
| Grafana | ADOPT | Standard dashboarding |
| Prometheus | ADOPT | Standard metrics |
| Loki | ADOPT | Standard log aggregation |
| Alertmanager | ADOPT | Standard alert routing |
| Micrometer | ADOPT | Standard Java metrics library |
| OpenTelemetry | TRIAL | Evaluating for distributed tracing |
| Jaeger | ASSESS | Depends on OpenTelemetry adoption |
| Splunk | HOLD | Being replaced by Grafana/Loki |

---

## 8. Security tooling

| Technology | Ring | Notes |
|---|---|---|
| SpotBugs + Find Security Bugs | ADOPT | Java SAST |
| ESLint security plugin | ADOPT | TypeScript/Node.js SAST |
| SecurityCodeScan | ADOPT | C# SAST |
| Trufflehog | ADOPT | Secrets scanning |
| OWASP Dependency Check | ADOPT | Dependency CVE scanning |
| Trivy | ADOPT | Container image scanning |
| cosign | TRIAL | Container image signing |
| Snyk | ASSESS | Commercial alternative -- evaluating |
| SonarQube | ASSESS | Code quality -- evaluating hosted option |

---

## 9. Testing

| Technology | Ring | Notes |
|---|---|---|
| JUnit 5 | ADOPT | Java unit testing |
| Mockito | ADOPT | Java mocking |
| AssertJ | ADOPT | Java assertion library |
| Testcontainers | ADOPT | Integration testing with real dependencies |
| Vitest | ADOPT | TypeScript/React unit testing |
| Testing Library | ADOPT | React component testing |
| jest-axe | ADOPT | Accessibility testing in React |
| Playwright | TRIAL | E2E and browser automation |
| k6 | ADOPT | Performance / load testing |
| xUnit | ADOPT | C# unit testing |
| JMeter | HOLD | Use k6 |
| Selenium | HOLD | Use Playwright |

---

## 10. Requesting radar changes

To propose adding or moving a technology on the radar:

1. Raise a GitHub issue on ai-engineering-common with label "tech-radar"
2. Include: technology name, proposed ring, reason, and evidence from usage
3. CoE reviews at the monthly champion sync
4. Changes require CoE Lead approval and a PR to this file

---

## 11. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly -- technology landscape changes fast |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead, Architect |
| Change process | PR with CoE Lead and Architect approval |
