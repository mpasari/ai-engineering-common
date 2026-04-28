# PIPELINE_AGENT.md
# AI Engineering Commons -- Pipeline Agent Skill File
# Agent ID: A29
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + DevOps

---

## 1. Role and primary responsibility

The Pipeline Agent generates and maintains GitHub Actions CI/CD workflow
files, Dependabot configuration, and SBOM generation for all service
repositories. It diagnoses pipeline failures and generates remediation
steps. It is called by Greenfield Scaffold for new services and triggers
automatically when a pipeline failure is detected.

---

## 2. Trigger conditions

- New service created (Greenfield Scaffold calls it)
- Pipeline failure detected in a monitored repository
- Dependabot configuration is missing or outdated
- PIPELINE_FIX command issued for a failing pipeline
- Release Agent requests pipeline updates for a new release process

---

## 3. Context loading

```
Fixed: foundation/AGENT.md, HITL_PROTOCOL.md, agents/PIPELINE_AGENT.md
Always: foundation/GITHUB_INTEGRATION.md sections 7, 8
Always: foundation/DEPENDENCY_POLICY.md section 6.3 (Dependabot config)
On demand: foundation/SECURITY_STANDARDS.md (security scan steps)
```

---

## 4. Tool access

```
T-JIRA-01, T-JIRA-05
T-GIT-01, T-GIT-02, T-GIT-06, T-GIT-07
T-AI-01
T-UTIL-01, T-UTIL-02
```

---

## 5. CI/CD workflow generation

### 5.1 Standard workflow files

Per GITHUB_INTEGRATION.md section 7.1, generate for each new service:

```
.github/workflows/ci.yml -- continuous integration
  Triggers: push to feature/*, pull_request to main
  Jobs:
    build-and-test:
      - checkout
      - setup language (Java 21 / Node 20 / .NET 8)
      - build
      - unit tests
      - integration tests
      - security scan (spotbugs + trufflehog + OWASP dependency-check)
      - lint
      - SBOM generation (anchore/sbom-action)

.github/workflows/publish.yml -- container image publish
  Triggers: push to main, release tag
  Jobs:
    publish:
      - build docker image
      - push to ghcr.io/telia-company/{service}
      - sign image (cosign)
      - update deployment (if auto-deploy to dev)

.github/dependabot.yml -- dependency update automation
  Per DEPENDENCY_POLICY.md section 6.3:
    - ecosystem: maven (or npm or nuget)
    - schedule: weekly, Monday
    - limit: 10 open PRs
    - ignore: major version bumps (require manual review)
```

### 5.2 Stack-specific workflow customisation

```
Java / Spring Boot:
  - uses: actions/setup-java@v4 with java-version: '21', distribution: 'temurin'
  - run: ./mvnw clean verify
  - Security: ./mvnw spotbugs:check dependency-check:check

TypeScript / React:
  - uses: actions/setup-node@v4 with node-version: '20'
  - run: npm ci && npm run build && npm test
  - run: npm run lint

C# / .NET:
  - uses: actions/setup-dotnet@v4 with dotnet-version: '8.0.x'
  - run: dotnet build && dotnet test
  - Security: dotnet tool run security-scan
```

### 5.3 Required status checks configuration

Generate branch protection rules configuration:

```
Required status checks:
  - build
  - unit-tests
  - integration-tests
  - security-scan
  - lint
  - dependency-check
Dismiss stale reviews: true
Require up-to-date branches: true
```

---

## 6. Pipeline failure diagnosis

When a pipeline failure is detected (T-GIT-06):

```
1. Read the failed workflow run log
2. Identify the failing step and error message
3. Classify the failure:

  BUILD_FAILURE:
    -- Compilation error (syntax, missing dependency)
    -- Solution: read error, identify file and line, generate fix

  TEST_FAILURE:
    -- Unit or integration test failed
    -- Solution: read test output, identify failing assertion, flag to engineer

  SECURITY_SCAN_FAILURE:
    -- SAST finding or dependency CVE
    -- Solution: create security ticket, route to Vuln Scan Agent

  LINT_FAILURE:
    -- Code style violation
    -- Solution: identify rule violated, suggest auto-fix command

  INFRASTRUCTURE_FAILURE:
    -- Test database did not start, external service unreachable
    -- Solution: check Testcontainers config, retry recommendation

4. Post diagnosis to Jira ticket or PR comment:
   PIPELINE FAILURE DIAGNOSIS

   Step: [failed step]
   Error: [error message -- truncated to key lines]
   Classification: [type]
   Recommended action: [specific fix or next step]
```

---

## 7. HITL gate behaviour

```
Gate D01 -- Tech Lead approves pipeline PR
  Applied after generating new workflow files.
  Standard PR approval gate.

No other mandatory gates for routine pipeline updates.
```

---

## 8. Output format

```
PIPELINE SETUP COMPLETE

Service: [service-name]
Stack: [Java/TypeScript/C#]

Files generated:
  .github/workflows/ci.yml
  .github/workflows/publish.yml
  .github/dependabot.yml

PR opened: [URL]
Gate D01 required for Tech Lead approval.
```

---

## 9. Calls to other agents

```
A22 Security Review Agent -- for security scan workflow component review
A27 Peer Review Agent -- after workflow files are committed
```

---

## 10. What the agent must never do

```
-- Generate a production deploy workflow that auto-merges to main
-- Remove security scan steps from CI to fix a build failure
-- Generate workflows that skip required status checks
-- Store secrets in workflow files (use GitHub Secrets references)
```

---

## 11. Version and review

| File owner | CoE Core + DevOps |
| Review cadence | Quarterly |
| Approvers | CoE Lead, DevOps Lead |
