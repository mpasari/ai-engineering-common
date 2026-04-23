# SRE_RUNBOOK_LIBRARY.md
# SDLC -- Ops Stage -- SRE Runbook Library Index
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + SRE Lead
#
# This file is read by:
#   - SRE Agent (A38) -- links runbooks in Tier 3 escalation packages
#   - Incident Response Agent (A39) -- war room runbook reference

---

## 1. Purpose

This index maps alert names to their Confluence runbook pages.
When the SRE Agent produces a Tier 3 escalation package, it includes
the relevant runbook URL from this index.

Runbooks are created by the Observability Setup Agent (A37) when
alerts are configured. They are updated by engineers after incidents.

---

## 2. Common runbooks (platform-wide)

| Alert scenario | Runbook |
|---|---|
| AKS node not ready | [Confluence URL -- update when created] |
| Azure Database high CPU | [Confluence URL -- update when created] |
| Azure Database storage > 80% | [Confluence URL -- update when created] |
| Redis eviction rate high | [Confluence URL -- update when created] |
| Kafka broker unavailable | [Confluence URL -- update when created] |
| Certificate expiry < 14 days | [Confluence URL -- update when created] |

---

## 3. Service-specific runbooks

Service runbooks are registered by the Observability Setup Agent
when alerts are created. Update the Confluence URL after creation.

| Service | Alert | Runbook URL |
|---|---|---|
| [service-name] | High error rate | [Confluence URL -- add when created] |
| [service-name] | High P95 latency | [Confluence URL -- add when created] |
| [service-name] | Service unavailable | [Confluence URL -- add when created] |

---

## 4. Runbook quality standards

Every runbook registered in this index must contain:

```
[ ] What the alert means (plain language -- no jargon)
[ ] Customer impact description
[ ] Step 1: Verify the alert is real (not false positive)
[ ] Step 2: Identify the scope (one service? all services?)
[ ] Step 3: Check recent deployments
[ ] Step 4: Log query to run
[ ] Common causes and fixes (at least 2)
[ ] Escalation path if standard steps don't resolve
[ ] Rollback command
```

Runbooks failing these standards are flagged in the monthly compliance
review (Compliance Agent section 7).

---

## 5. Runbook review cadence

Runbooks must be reviewed and updated:
- After every incident where the runbook was used
- Quarterly as part of the compliance review
- When the service architecture changes significantly

---

## 6. Version and review

| File owner | CoE Core + SRE Lead |
| Review cadence | Monthly -- verify all registered alerts have runbooks |
