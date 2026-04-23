# SETUP_OBSERVABILITY.md
# Command: SETUP_OBSERVABILITY
# Category: Operations
# Agent: A37 Observability Setup Agent
# Version: 1.0.0

---

## What this command does

Creates Grafana dashboards, alert rules, and Confluence runbooks for
a service. Registers panels in the SRE Dashboard Registry so the SRE
Agent monitors them. Generates instrumentation code.

---

## When to use it

- When a new service is deployed
- When a service is not yet monitored by the SRE Agent
- After SLO targets change and dashboards need updating

---

## Required inputs

```
Service name (must be in MODULE_REGISTRY.md)
Example: SETUP_OBSERVABILITY order-service
```

---

## Usage

```
SETUP_OBSERVABILITY order-service
```

---

## Output

- Grafana overview dashboard: [service]-overview
- Grafana SLO dashboard: [service]-slo
- Alert rules (error rate, latency, availability, Kafka lag)
- Confluence runbook pages per alert
- SRE Dashboard Registry PR (gate D01 required)
- Instrumentation code committed to service repo

---

## Notes

- SLO targets from SRE_SERVICE_CONFIG.md or PERFORMANCE_GUIDELINES.md defaults
- Every alert gets a runbook -- no alert without a runbook
- SRE Agent begins monitoring after Registry PR is merged
