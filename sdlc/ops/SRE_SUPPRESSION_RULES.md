# SRE_SUPPRESSION_RULES.md
# SDLC -- Ops Stage -- SRE Alert Suppression Rules
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + SRE Lead
#
# This file is read by:
#   - SRE Agent (A38) -- checks suppression before every action
#   - Problem Management Agent (A40) -- adds rules after fix decisions

---

## 1. Purpose

Suppression rules tell the SRE Agent to log a signal occurrence and
increment a KEDB counter instead of escalating. This prevents alert
fatigue from known issues that have been assessed and given a fix decision.

A signal without a suppression rule is always escalated.
A signal with a suppression rule is logged and counted only.

---

## 2. Suppression rules

```yaml
# Active suppression rules
# Managed by Problem Management Agent (A40)
# Changes require CoE PR approval

suppression_rules: []

# Example entry format (added by A40 after gate E01/E02 approval):
#
# - rule_id: KEDB-001
#   service: order-service
#   alert_name: "High error rate"
#   signal_description: "Elevated 5xx errors on /api/v1/orders on Monday mornings"
#   metric_condition: >
#     rate(http_requests_total{service="order-service",status=~"5.."}[5m])
#     / rate(http_requests_total{service="order-service"}[5m]) > 0.01
#   time_window:
#     days_of_week: [1]           # 1=Monday
#     time_range: "06:00-08:00"   # UTC -- if time-bounded
#   suppress_until: "2025-07-01"  # Max 6 months -- null = permanent review date
#   action_on_match:
#     log_to_decision_log: true
#     increment_jira_counter: true
#     jira_ticket: "PROJ-PROBLEM-001"
#   suppress_action: true
#   suppress_escalation: true
#   notify_on_match: false
#   added_by: "Problem Management Agent (commons v1.0.0)"
#   added_at: "2025-01-15"
#   decision: "Deferred"
#   review_date: "2025-07-01"
#   reason: "Monday morning batch job causes transient load spike. Fix deferred
#            to Sprint 52. Workaround: batch rescheduled to 04:00 UTC."
```

---

## 3. Suppression rule lifecycle

```
Create:  Problem Management Agent adds after gate E01/E02 approval
Update:  Problem Management Agent updates after review date reached
Expire:  Auto-expires on suppress_until date
         SRE Agent resumes normal escalation after expiry
Delete:  Problem Management Agent removes when KEDB entry is resolved
```

---

## 4. Reviewing suppression rules

Monthly review by Problem Management Agent:
- Identify rules past their review_date
- Flag to Tech Lead for re-assessment (keep / update / remove)
- Rules that have suppressed > 100 occurrences in 30 days are flagged
  as high-frequency -- consider escalating fix priority

---

## 5. Version and review

| File owner | CoE Core + SRE Lead |
| Review cadence | Monthly |
| Change process | PR with CoE approval required for any rule addition |
