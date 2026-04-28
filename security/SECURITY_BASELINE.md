# SECURITY_BASELINE.md
# Security -- Security baseline requirements for all Telia services
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + Security Lead

---

## 1. Purpose

This file defines the minimum security baseline that every service
must meet before being deployed to production. The Security Review
Agent (A22) references this file when reviewing PRs. The Greenfield
Scaffold Agent generates code meeting these requirements by default.

A service that does not meet this baseline cannot receive gate A02
(production deployment approval).

---

## 2. Authentication and authorisation baseline

### 2.1 Authentication requirements

```
REQUIRED for all services:
  [ ] All non-public endpoints require authentication
  [ ] Authentication uses OAuth2 / OpenID Connect via the Telia CIAM
  [ ] JWT tokens validated on every request (not cached server-side)
  [ ] Token expiry is enforced (no accepting expired tokens)
  [ ] Token signing algorithm is RS256 or ES256 (never HS256 with shared secret)

REQUIRED for services handling sensitive data:
  [ ] Multi-factor authentication enforced for admin operations
  [ ] Session timeout after 15 minutes of inactivity (for UI services)
```

### 2.2 Authorisation requirements

```
REQUIRED:
  [ ] Role-based access control applied at the method level, not just endpoint
  [ ] Horizontal privilege escalation prevented (user A cannot access user B's data)
  [ ] Vertical privilege escalation prevented (regular user cannot call admin endpoints)
  [ ] Authorisation decisions are logged (who accessed what, when)
  [ ] Failed authorisation attempts are logged and monitored
```

---

## 3. Input validation baseline

```
REQUIRED for all API endpoints:
  [ ] All user-supplied input is validated before use
  [ ] Validation uses allowlist (acceptable values), not blocklist (banned values)
  [ ] String length limits enforced on all text inputs
  [ ] Numeric range limits enforced on all numeric inputs
  [ ] File type and size limits enforced on all file uploads
  [ ] Validation errors return 400 Bad Request with VALIDATION_FAILED code
  [ ] Validation error details are returned to the caller (not logged and hidden)
  [ ] No validation error messages reveal internal implementation details

REQUIRED for database interaction:
  [ ] All database queries use parameterised statements or JPA/ORM
  [ ] No string concatenation to build SQL (zero exceptions)
  [ ] Database user has minimum permissions (read-only where write is not needed)

REQUIRED for external system calls:
  [ ] All URLs constructed from user input are validated against an allowlist
  [ ] No user-controlled data passed to system commands
```

---

## 4. Data protection baseline

### 4.1 Encryption requirements

```
REQUIRED:
  [ ] All network traffic uses TLS 1.2 minimum (TLS 1.3 preferred)
  [ ] TLS certificates are valid and from an approved CA
  [ ] No self-signed certificates in production
  [ ] All personal data encrypted at rest (Azure encryption at rest sufficient)
  [ ] Database connection strings use TLS
  [ ] No plaintext passwords stored (bcrypt with cost factor >= 12)
```

### 4.2 Personal data handling

```
REQUIRED:
  [ ] Only collect personal data that is strictly necessary
  [ ] Retention periods documented in DATA_MODEL.md
  [ ] Data deletion/anonymisation implemented for account closure
  [ ] PII not logged in application logs
  [ ] PII not included in error messages returned to clients
  [ ] PII not stored in URL parameters (use request body)
```

---

## 5. Secrets management baseline

```
REQUIRED:
  [ ] No secrets (passwords, API keys, tokens) in source code
  [ ] No secrets in environment variable files committed to git (.env, appsettings.json)
  [ ] All secrets stored in Azure Key Vault
  [ ] Application accesses Key Vault via Managed Identity (no client secrets)
  [ ] Key rotation policy defined and automated where possible
  [ ] Trufflehog scan passing in CI pipeline

VERIFIED BY:
  Secrets Scan Agent (A25) on every PR
  Trufflehog in CI pipeline (section 5 of SAST_CONFIG.md)
```

---

## 6. Logging and monitoring baseline

```
REQUIRED:
  [ ] Authentication events logged (success and failure)
  [ ] Authorisation failures logged with user ID and resource attempted
  [ ] Data access to sensitive records logged (reads and writes)
  [ ] No personal data in log output (PII scrubbed per PRIVACY_GUARDRAILS.md)
  [ ] Logs shipped to centralised logging (Grafana/Loki)
  [ ] Log retention: minimum 90 days (active), 1 year (archived)
  [ ] Alerting configured for authentication failure spikes
  [ ] Alerting configured for authorisation failure spikes
```

---

## 7. Dependency baseline

```
REQUIRED:
  [ ] No dependencies with Critical (CVSS 9.0+) unpatched CVEs
  [ ] No dependencies with High (CVSS 7.0-8.9) unpatched CVEs older than 7 days
  [ ] OWASP Dependency Check passing in CI pipeline
  [ ] Dependabot configured and active
  [ ] No dependencies from DEPENDENCY_POLICY.md banned list
```

---

## 8. Infrastructure baseline

```
REQUIRED:
  [ ] Containers run as non-root user
  [ ] readOnlyRootFilesystem: true on all containers
  [ ] allowPrivilegeEscalation: false on all containers
  [ ] Resource limits set on all containers (CPU and memory)
  [ ] No public IP on database servers
  [ ] Network policies restrict ingress to known sources
  [ ] Key Vault access restricted to AKS subnet (no public access)
  [ ] Container images scanned for vulnerabilities (Trivy in CI)
  [ ] Production images signed (cosign)
```

---

## 9. Pre-production security checklist

Before requesting gate A02 (production deployment), confirm:

```
Code:
  [ ] SAST scan passing (no Critical or High findings)
  [ ] Secrets scan passing (Trufflehog + Secrets Scan Agent)
  [ ] Dependency scan passing (no unpatched High or Critical CVEs)
  [ ] Security Review Agent shows no BLOCK findings

Configuration:
  [ ] All secrets in Key Vault (none in environment variables or code)
  [ ] TLS configured and certificate valid
  [ ] Auth configured and validated (auth integration test passing)

Infrastructure:
  [ ] Container security context hardened (non-root, read-only filesystem)
  [ ] Network policies in place
  [ ] Monitoring and alerting configured (SRE Agent registered)

Documentation:
  [ ] DATA_MODEL.md has retention policies for all PII fields
  [ ] DPA confirmed for all external integrations (INTEGRATION_MAP.md)
  [ ] Security review documented (gate C05 or D02 approved)
```

---

## 10. Version and review

| File owner | CoE Core + Security Lead |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | Security Lead, CoE Lead |
| Change process | PR with Security Lead approval required |
