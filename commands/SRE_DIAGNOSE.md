# SRE_DIAGNOSE.md
# Command: SRE_DIAGNOSE
# Category: Operations
# Agent: A38 SRE Agent
# Version: 1.0.0

---

## What this command does

Analyses a Grafana signal, metric anomaly, or Alertmanager alert and
produces a structured diagnosis: affected service, root cause hypotheses,
correlated signals, and recommended first action. Does not take
infrastructure action -- diagnosis only.

---

## When to use it

- When an alert fires and you need rapid diagnosis context
- During on-call investigation of a latency or error rate issue
- Before escalating to an incident

---

## Required inputs

```
One of:
  -- Service name: SRE_DIAGNOSE order-service
  -- Grafana alert name: SRE_DIAGNOSE "High error rate -- order-service"
  -- Jira incident ticket: SRE_DIAGNOSE PROJ-INC-001
```

---

## Usage

```
SRE_DIAGNOSE order-service

or

SRE_DIAGNOSE "P95 latency breach -- billing-service"
```

---

## Output

- Signal summary: metric, current value vs threshold, duration
- Database and infrastructure signal assessment
- Root cause hypotheses with confidence levels
- Log anomalies (PII scrubbed)
- Recommended first action
- Runbook link if registered

---

## Notes

- Reads only -- no infrastructure changes from this command
- PII in log lines is scrubbed before output
- For Tier 4 escalation use DECLARE_INCIDENT instead
