# NON_FUNCTIONAL_REQUIREMENTS.md
# SDLC -- Specification Stage -- NFR Reference Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core
#
# This file is read by:
#   - Spec Writer Agent (A07) -- NFR section of specs
#   - Performance Agent (A18) -- review mode thresholds
#   - SRE Agent (A38) -- SLO baseline reference
#   - Test Gen Agent (A15) -- performance test scenario generation

---

## 1. Default NFR targets

These apply to all services unless overridden in SRE_SERVICE_CONFIG.md.
Reference these in spec section 9 (Non-functional requirements).

### 1.1 Performance

| Metric | Warning threshold | Critical threshold | Notes |
|---|---|---|---|
| P95 API latency | 500ms | 1000ms | Measured at service ingress |
| P99 API latency | 1000ms | 2000ms | |
| P95 database query | 200ms | 500ms | Measured in application |
| Kafka consumer lag | 1000 messages | 10000 messages | Per topic |
| Page load time (FCP) | 2s | 4s | Frontend services |

### 1.2 Availability

| Tier | Monthly uptime SLO | Max planned downtime |
|---|---|---|
| Critical | 99.95% (4.4h/year) | 1h/quarter |
| Standard | 99.9% (8.7h/year) | 2h/quarter |
| Best-effort | 99.5% (43.8h/year) | 4h/quarter |

Default tier: Standard. Override in SRE_SERVICE_CONFIG.md.

### 1.3 Scalability

```
Default assumptions (adjust in spec if different):
  Baseline RPS: [Derive from current traffic or product estimate]
  Peak multiplier: 3x baseline (handle traffic spikes)
  Data growth: [N]% per month (drives storage and index planning)
  Concurrent users: [N] (drives connection pool sizing)
```

### 1.4 Security

All services must meet:
- OWASP Top 10 compliance (verified by Security Review Agent)
- No credentials in code or configuration (verified by Secrets Scan Agent)
- All endpoints authenticated unless explicitly public
- Input validation on all user-supplied data
- PII encrypted at rest and in transit

### 1.5 Accessibility

All user-facing UI must meet:
- WCAG 2.1 Level AA (verified by Accessibility Agent)
- Keyboard navigable without mouse
- Screen reader compatible (NVDA + Chrome, VoiceOver + Safari)

---

## 2. NFR specification guidance

### 2.1 Performance requirements in specs

When a feature has non-default performance requirements, state them
explicitly in the spec with justification:

```
Performance:
  P95 latency target: 200ms (tighter than default -- payment flow,
                              user expectation from UX research)
  Expected RPS: 50 at baseline, 150 at peak (Black Friday traffic model)
  Database: max 3 queries per request (N+1 prevention -- see P01 checklist)
```

### 2.2 When to escalate NFR conflicts

Escalate to Architect when:
- Proposed design cannot meet the default latency targets without
  significant architectural change
- Feature requires eventual consistency (deviates from standard ACID pattern)
- Feature requires data residency outside the approved Azure regions
- Feature SLO requirement is higher than Critical tier (99.95%)

---

## 3. NFR anti-patterns in specs

| Anti-pattern | Problem | Correct approach |
|---|---|---|
| "The system should be fast" | Not measurable | Specify P95 latency in milliseconds |
| "The system should be secure" | Not actionable | Reference specific S01-S20 checklist items |
| "The system should scale" | No target | Specify RPS targets and growth assumptions |
| No NFR section in spec | Agents use defaults without awareness | Always include section 9 in spec |
| Copying NFRs from another spec | May not apply | Derive from this service's actual SLO |

---

## 4. Version and review

| File owner | CoE Core + SRE Lead |
| Review cadence | Quarterly |
