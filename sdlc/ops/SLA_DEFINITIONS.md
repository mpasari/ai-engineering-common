# SLA_DEFINITIONS.md
# SDLC -- Ops Stage -- SLA and SLO Definitions
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + SRE Lead

---

## 1. Terminology

```
SLI (Service Level Indicator):
  A quantitative measure of service behaviour.
  Example: "P95 request latency" or "error rate"

SLO (Service Level Objective):
  A target value for an SLI.
  Example: "P95 latency < 500ms", "error rate < 0.1%"

SLA (Service Level Agreement):
  A commitment to a customer or partner, often with consequences
  for breach. SLAs are typically less strict than internal SLOs.
  Example: "99.9% monthly availability"

Error budget:
  The allowed amount of SLO breaches in a given period.
  Example: "99.9% SLO = 0.1% budget = 43.8 minutes downtime/month"
```

---

## 2. Standard SLI definitions

All services use these standard SLIs. Custom SLIs require Architect
approval and documentation in SRE_SERVICE_CONFIG.md.

```
Availability:
  SLI = successful requests / total requests
  Measured: rolling 30-day window
  Success: HTTP 2xx and 3xx responses
  Failure: HTTP 5xx responses (not 4xx -- client errors are not our failure)

Latency:
  SLI = P95 request duration in milliseconds
  Measured: rolling 5-minute window
  Scope: all requests except health check endpoints

Error rate:
  SLI = 5xx responses / total requests
  Measured: rolling 5-minute window

Kafka consumer lag:
  SLI = messages behind latest offset
  Measured: per consumer group per topic
```

---

## 3. Default SLO targets by service tier

| SLI | Critical tier | Standard tier | Best-effort tier |
|---|---|---|---|
| Monthly availability | 99.95% | 99.9% | 99.5% |
| P95 latency warning | 300ms | 500ms | 1000ms |
| P95 latency critical | 600ms | 1000ms | 2000ms |
| Error rate warning | 0.1% | 0.5% | 1.0% |
| Error rate critical | 0.5% | 1.0% | 5.0% |
| Kafka consumer lag warning | 500 msgs | 1000 msgs | 5000 msgs |
| Kafka consumer lag critical | 2000 msgs | 10000 msgs | 50000 msgs |

Override these in SRE_SERVICE_CONFIG.md with justification.

---

## 4. Error budget calculation

```
Monthly availability SLO: 99.9%
Error budget: 100% - 99.9% = 0.1%
Minutes in month: ~43,800
Budget in minutes: 43,800 * 0.001 = 43.8 minutes/month

If a P0 incident causes 2 hours of downtime:
  Budget consumed: 120 minutes / 43.8 minutes = 274% -- SLO breached
  Action: post-mortem required, NIS2 assessment required
```

---

## 5. SLO breach response

| Severity | Definition | Response |
|---|---|---|
| Warning | SLI between warning and critical threshold | Investigate -- no incident |
| Critical | SLI above critical threshold for > 5 minutes | SRE Tier 3 escalation |
| SLO breach | Monthly SLO target not met | Post-mortem required |
| P0 | Complete service unavailability | Incident declared, NIS2 assessment |

---

## 6. Version and review

| File owner | CoE Core + SRE Lead |
| Review cadence | Quarterly |
