# SRE_DASHBOARD_REGISTRY.md
# SDLC -- Ops Stage -- SRE Dashboard Registry
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + SRE Lead
#
# This file is read by:
#   - SRE Agent (A38) -- polling targets and SLO thresholds per cycle
#   - Observability Setup Agent (A37) -- adds new service registrations

---

## 1. Purpose

Every service monitored by the SRE Agent must be registered here.
Services NOT in this registry are NOT monitored autonomously.

The Observability Setup Agent (A37) adds entries via PR when a new
service is set up. The PR requires Tech Lead approval (gate D01).

---

## 2. Registered services

```yaml
# Registry format -- one entry per service
# Generated and maintained by Observability Setup Agent (A37)

services: []

# Example entry (added by A37 for each new service):
#
# - service: order-service
#   dashboard_uid: order-service-overview
#   owner_team: orders-team
#   on_call_channel: "#orders-oncall"
#   kedb_suppression_check: true
#   panels:
#     - panel_id: 2
#       name: "Error rate (5xx)"
#       metric: >
#         rate(http_requests_total{service="order-service",status=~"5.."}[5m])
#         / rate(http_requests_total{service="order-service"}[5m])
#       slo:
#         warning_threshold: 0.005
#         critical_threshold: 0.010
#         comparison: above
#     - panel_id: 4
#       name: "P95 latency"
#       metric: >
#         histogram_quantile(0.95,
#           rate(http_request_duration_seconds_bucket{service="order-service"}[5m]))
#       slo:
#         warning_threshold: 0.500
#         critical_threshold: 1.000
#         comparison: above
#     - panel_id: 6
#       name: "Active instances"
#       metric: count(up{service="order-service"} == 1)
#       slo:
#         warning_threshold: 1
#         critical_threshold: 0
#         comparison: below
```

---

## 3. Registry entry schema

Each service entry must include:

```
service:                  [service-name -- matches MODULE_REGISTRY.md]
dashboard_uid:            [Grafana dashboard UID -- format: {service}-overview]
owner_team:               [team-name]
on_call_channel:          [Slack channel for Tier 2 notifications]
kedb_suppression_check:   [true -- always true for production services]
panels:                   [list of monitored panels]
  - panel_id:             [Grafana panel ID]
    name:                 [Human-readable panel name]
    metric:               [PromQL expression]
    slo:
      warning_threshold:  [Numeric value]
      critical_threshold: [Numeric value]
      comparison:         [above / below]
```

---

## 4. Deregistration

To remove a service from SRE monitoring:

1. Open a PR removing the service entry from this file
2. Confirm with the Observability Setup Agent that dashboards and
   alert rules are also removed from Grafana
3. Tech Lead approval (gate D01)

Do NOT simply delete alert rules in Grafana without removing from this
registry -- the SRE Agent will log errors attempting to poll removed panels.

---

## 5. Version and review

| File owner | CoE Core + SRE Lead |
| Review cadence | Monthly -- verify all production services are registered |
| Approvers | SRE Lead |
