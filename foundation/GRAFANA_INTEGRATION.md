# GRAFANA_INTEGRATION.md
# AI Engineering Commons -- Grafana Integration Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + SRE Lead + DevOps

---

## 1. Purpose

This file defines how agents in the ai-engineering-commons system
interact with Grafana, Prometheus, Loki, and Alertmanager. It covers
authentication, dashboard querying, metric interpretation, log analysis,
alert webhook handling, and the SRE Dashboard Registry that governs
which signals the SRE Agent monitors.

Referenced by:
- `AGENT.md` section 9 -- listed as a required integration file
- `TOOLS_MANIFEST.md` -- T-OBS tools reference this file
- `agents/SRE_AGENT.md` -- primary consumer of all observability tools
- `agents/PERFORMANCE_AGENT.md` -- metric analysis during incidents
- `agents/OBSERVABILITY_SETUP_AGENT.md` -- creates dashboards and alerts
- `agents/INCIDENT_RESPONSE_AGENT.md` -- reads signals during incidents
- `sdlc/ops/SRE_AUTONOMY_BUDGET.md` -- autonomy tiers reference signal types

---

## 2. Instance configuration

### 2.1 Grafana

| Setting | Value |
|---|---|
| Instance type | Grafana Cloud |
| Base URL | https://telia-company.grafana.net |
| Authentication | Service account token via Azure Key Vault |
| API version | Grafana HTTP API v1 |
| Default organisation ID | 1 |

**Authentication header:**
```
Authorization: Bearer {GRAFANA_SERVICE_ACCOUNT_TOKEN}
Content-Type: application/json
```

**API base path:**
```
https://telia-company.grafana.net/api
```

### 2.2 Prometheus

| Setting | Value |
|---|---|
| Endpoint | https://prometheus.telia-company.grafana.net |
| Authentication | Grafana Cloud credentials (same token) |
| API path | /api/prom/api/v1 |
| Retention period | 13 months |

### 2.3 Loki (log aggregation)

| Setting | Value |
|---|---|
| Endpoint | https://logs.telia-company.grafana.net |
| Authentication | Grafana Cloud credentials (same token) |
| API path | /loki/api/v1 |
| Retention period | 30 days |

### 2.4 Alertmanager

| Setting | Value |
|---|---|
| Webhook receiver URL | https://alertmanager.telia-company.grafana.net |
| Webhook format | Alertmanager v2 webhook payload |
| SRE Agent webhook endpoint | Configured in Alertmanager routing rules |

---

## 3. SRE Dashboard Registry

The SRE Agent only monitors panels registered in this registry. Panels
not registered here are ignored -- this prevents alert fatigue from
experimental or low-signal dashboards.

Each entry in the registry maps a Grafana dashboard panel to the service
it represents, its SLO thresholds, and the owning team.

### 3.1 Registry format

The registry is maintained in `sdlc/ops/SRE_DASHBOARD_REGISTRY.md`.
Each entry has this structure:

```yaml
- service: order-service
  dashboard_uid: order-service-overview
  panels:
    - panel_id: 1
      name: Request rate
      metric: rate(http_requests_total{service="order-service"}[5m])
      slo:
        warning_threshold: 500   # requests/sec
        critical_threshold: 1000 # requests/sec
        comparison: above
    - panel_id: 2
      name: Error rate (5xx)
      metric: rate(http_requests_total{service="order-service",status=~"5.."}[5m])
        / rate(http_requests_total{service="order-service"}[5m])
      slo:
        warning_threshold: 0.005  # 0.5%
        critical_threshold: 0.01  # 1.0%
        comparison: above
    - panel_id: 3
      name: P95 latency
      metric: histogram_quantile(0.95,
        rate(http_request_duration_seconds_bucket{service="order-service"}[5m]))
      slo:
        warning_threshold: 0.5   # 500ms
        critical_threshold: 1.0  # 1000ms
        comparison: above
  owner_team: orders-team
  on_call_channel: "#orders-oncall"
  kedb_suppression_check: true
```

### 3.2 Standard panels all services must register

The Observability Setup Agent creates these panels for every new service
and registers them in the SRE Dashboard Registry.

| Panel name | Metric type | SLO source |
|---|---|---|
| Request rate | Counter | `sdlc/ops/SLA_DEFINITIONS.md` |
| Error rate (4xx) | Counter ratio | `sdlc/ops/SLA_DEFINITIONS.md` |
| Error rate (5xx) | Counter ratio | `sdlc/ops/SLA_DEFINITIONS.md` |
| P50 latency | Histogram quantile | `PERFORMANCE_GUIDELINES.md` section 7.1 |
| P95 latency | Histogram quantile | `PERFORMANCE_GUIDELINES.md` section 7.1 |
| P99 latency | Histogram quantile | `PERFORMANCE_GUIDELINES.md` section 7.1 |
| Active instances | Gauge | Per service min/max from infra spec |
| Memory usage | Gauge | 80% of pod memory limit |
| CPU usage | Gauge | 70% of pod CPU limit |
| Database connection pool | Gauge | Per `PERFORMANCE_GUIDELINES.md` section 2.4 |
| Kafka consumer lag | Gauge | Per `PERFORMANCE_GUIDELINES.md` section 7.3 |

---

## 4. Grafana API operations

### 4.1 Query dashboard panel data

Used by the SRE Agent on every observation cycle.

```
GET /api/dashboards/uid/{dashboard_uid}
```

Returns the full dashboard JSON including panel definitions and
datasource references.

To query live panel data, agents use the Prometheus API directly
with the panel's metric expression:

```
GET /api/prom/api/v1/query_range
  ?query={promql_expression}
  &start={unix_timestamp}
  &end={unix_timestamp}
  &step={resolution_seconds}
```

**Example -- query P95 latency for order-service over last 5 minutes:**
```
GET /api/prom/api/v1/query_range
  ?query=histogram_quantile(0.95,rate(http_request_duration_seconds_bucket{service="order-service"}[5m]))
  &start=1705312200
  &end=1705312500
  &step=30
```

**Response format:**
```json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": { "service": "order-service" },
        "values": [
          [1705312200, "0.245"],
          [1705312230, "0.312"],
          [1705312260, "0.289"]
        ]
      }
    ]
  }
}
```

### 4.2 Create dashboard

Used by the Observability Setup Agent when a new service is deployed.

```
POST /api/dashboards/db
Content-Type: application/json

{
  "dashboard": {
    "title": "{service-name} -- Overview",
    "uid": "{service-name}-overview",
    "panels": [...],
    "tags": ["ai-generated", "{service-name}", "sre-monitored"]
  },
  "folderId": {folder_id},
  "overwrite": false,
  "message": "Created by Observability Setup Agent (commons v1.0.0)"
}
```

Every agent-created dashboard must have the `ai-generated` tag so it
can be filtered in the Grafana UI.

### 4.3 Create alert rule

Used by the Observability Setup Agent to create alert rules alongside
dashboards.

```
POST /api/ruler/grafana/api/v1/rules/{folder_uid}
Content-Type: application/json

{
  "name": "{service-name} -- SLO alerts",
  "interval": "1m",
  "rules": [
    {
      "grafana_alert": {
        "title": "{service-name} -- High error rate",
        "condition": "C",
        "data": [
          {
            "refId": "A",
            "queryType": "",
            "relativeTimeRange": { "from": 300, "to": 0 },
            "model": {
              "expr": "rate(http_requests_total{service=\"{service-name}\",status=~\"5..\"}[5m]) / rate(http_requests_total{service=\"{service-name}\"}[5m])",
              "refId": "A"
            }
          },
          {
            "refId": "C",
            "queryType": "__expr__",
            "model": {
              "type": "threshold",
              "conditions": [
                { "evaluator": { "type": "gt", "params": [0.01] } }
              ]
            }
          }
        ],
        "noDataState": "NoData",
        "execErrState": "Error",
        "for": "5m",
        "labels": {
          "service": "{service-name}",
          "severity": "critical",
          "team": "{owner-team}"
        },
        "annotations": {
          "summary": "High 5xx error rate on {service-name}",
          "description": "Error rate is {{ $value | humanizePercentage }} (threshold: 1%)",
          "runbook_url": "{confluence-runbook-url}"
        }
      }
    }
  ]
}
```

---

## 5. Prometheus query patterns

The SRE Agent uses these standard PromQL patterns when analysing metrics.
The Performance Agent uses the same patterns during incident investigation.

### 5.1 Standard metric names

All Telia services must expose metrics using these standard names.
The Observability Setup Agent generates the instrumentation code
that produces these metrics.

| Metric name | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | service, method, path, status | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | service, method, path | Request duration |
| `db_query_duration_seconds` | Histogram | service, query_name | Database query duration |
| `db_connection_pool_size` | Gauge | service, pool | Total connection pool size |
| `db_connection_pool_active` | Gauge | service, pool | Active connections |
| `kafka_consumer_lag` | Gauge | service, topic, consumer_group | Consumer lag in messages |
| `kafka_producer_errors_total` | Counter | service, topic | Producer error count |
| `jvm_memory_used_bytes` | Gauge | service, area | JVM memory usage |
| `jvm_threads_live_threads` | Gauge | service | Live thread count |
| `cache_hit_ratio` | Gauge | service, cache_name | Cache hit ratio |
| `circuit_breaker_state` | Gauge | service, name | Circuit breaker state (0=closed, 1=open) |

### 5.2 Standard PromQL expressions

```promql
# Error rate (5xx) over 5 minutes
rate(http_requests_total{service="$service",status=~"5.."}[5m])
  / rate(http_requests_total{service="$service"}[5m])

# P95 latency
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{service="$service"}[5m]))

# SLO error budget burn rate (1 hour window vs 30 day target)
(1 - (
  rate(http_requests_total{service="$service",status!~"5.."}[1h])
    / rate(http_requests_total{service="$service"}[1h])
)) / (1 - 0.999)

# Database connection pool saturation
db_connection_pool_active{service="$service"}
  / db_connection_pool_size{service="$service"}

# Kafka consumer lag trend (rate of change)
rate(kafka_consumer_lag{service="$service",topic="$topic"}[10m])

# Circuit breaker open
circuit_breaker_state{service="$service"} == 1
```

### 5.3 Correlation query -- deploy to anomaly

The SRE Agent uses this pattern to correlate a deployment with a
subsequent metric change. If a deploy preceded an anomaly within
the correlation window (default 15 minutes), it is included in the
diagnosis as a probable contributing factor.

```promql
# Changes in error rate around deployment time
rate(http_requests_total{service="$service",status=~"5.."}[5m])
  and on() (
    changes(deployment_info{service="$service"}[15m]) > 0
  )
```

---

## 6. Loki log query patterns

The SRE Agent queries Loki for log anomalies when metric signals are
ambiguous or when a novel error pattern is detected.

### 6.1 Standard log stream selectors

All Telia services must emit structured JSON logs with these standard
fields. The Observability Setup Agent generates the logging configuration.

```
Standard log stream labels:
  {service="order-service", environment="production", namespace="orders"}

Required JSON log fields:
  timestamp   -- ISO 8601 UTC
  level       -- INFO, WARN, ERROR, DEBUG
  service     -- service name
  traceId     -- distributed trace ID
  spanId      -- span ID
  message     -- human-readable message
  errorCode   -- application error code (if error)
  userId      -- anonymised user identifier (if applicable)
```

### 6.2 Standard LogQL queries

```logql
# Error rate by service over last 5 minutes
sum(rate({service="order-service", level="ERROR"}[5m])) by (service)

# New error messages not seen in baseline window
{service="order-service", level="ERROR"}
  | json
  | line_format "{{.errorCode}} {{.message}}"
  | pattern "<code> <rest>"
  | __error__ = ""

# Stack traces (multiline log events)
{service="order-service"}
  | json
  | level = "ERROR"
  | message =~ "Exception|Error|Caused by"

# Authentication failures
{service="auth-service", level="WARN"}
  | json
  | message =~ "Failed login|Access denied|Invalid token"
  | count_over_time([5m]) > 10

# Slow database queries
{service="order-service"}
  | json
  | label_format duration=db_query_duration_ms
  | duration > 1000
```

### 6.3 PII scrubbing in log queries

Log lines may contain personal data. Before the SRE Agent processes
log content, it applies these scrubbing patterns:

```
Patterns to scrub from log content before processing:
  - Email addresses: replace with [EMAIL]
  - Norwegian personal numbers: replace with [PERSONNUMMER]
  - Phone numbers: replace with [PHONE]
  - IP addresses: replace with [IP]
  - Bearer tokens: replace with [TOKEN]
  - Credit card patterns: replace with [CARD]
```

Scrubbed log content must never be written to Confluence, Jira, or
any external system. It is used only for in-context analysis.

---

## 7. Alertmanager webhook handling

The SRE Agent receives Alertmanager webhook payloads when alert rules
fire. This is the primary real-time signal source.

### 7.1 Webhook payload format

```json
{
  "version": "4",
  "groupKey": "{}:{alertname=\"HighErrorRate\",service=\"order-service\"}",
  "truncatedAlerts": 0,
  "status": "firing",
  "receiver": "sre-agent-webhook",
  "groupLabels": {
    "alertname": "HighErrorRate",
    "service": "order-service"
  },
  "commonLabels": {
    "alertname": "HighErrorRate",
    "service": "order-service",
    "severity": "critical",
    "team": "orders-team"
  },
  "commonAnnotations": {
    "summary": "High 5xx error rate on order-service",
    "description": "Error rate is 2.3% (threshold: 1%)",
    "runbook_url": "https://telia-company.atlassian.net/wiki/..."
  },
  "externalURL": "https://telia-company.grafana.net/alerting",
  "alerts": [
    {
      "status": "firing",
      "labels": { ... },
      "annotations": { ... },
      "startsAt": "2025-01-15T10:30:00Z",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "https://telia-company.grafana.net/...",
      "fingerprint": "abc123def456"
    }
  ]
}
```

### 7.2 SRE Agent webhook processing

When the SRE Agent receives a webhook, it processes it in this order:

```
1. Parse the payload and extract: service, severity, alert name,
   description, start time, fingerprint

2. Check SRE_SUPPRESSION_RULES.md -- is this alert suppressed by a
   known KEDB entry?
   - If YES: log the occurrence against the KEDB record,
             increment impact counter on the Jira problem ticket,
             do NOT escalate. Done.
   - If NO: proceed to step 3

3. Look up the service in SRE_DASHBOARD_REGISTRY.md -- get SLO thresholds
   and owner team

4. Assess severity and tier using SRE_AUTONOMY_BUDGET.md

5. Route to the appropriate tier action (Tier 1-4)

6. Log the decision to SRE_DECISION_LOG.md format
```

### 7.3 Alert fingerprint deduplication

Alertmanager sends repeated webhooks for the same firing alert.
The SRE Agent deduplicates using the `fingerprint` field:

- If the fingerprint has been seen in the last 15 minutes: skip
- If the fingerprint is new or the previous occurrence was resolved: process

---

## 8. Dashboard and alert naming conventions

### 8.1 Dashboard naming

| Convention | Format | Example |
|---|---|---|
| Dashboard title | {Service name} -- {Type} | Order service -- Overview |
| Dashboard UID | {service-kebab-case}-{type-kebab-case} | order-service-overview |
| Dashboard tags | ai-generated, {service-name}, sre-monitored | ai-generated, order-service |
| Folder | Service name | Order service |

### 8.2 Alert rule naming

| Convention | Format | Example |
|---|---|---|
| Alert group | {Service name} -- SLO alerts | Order service -- SLO alerts |
| Alert name | {Service} -- {What is wrong} | Order service -- High error rate |
| Summary annotation | {What happened} on {service} | High 5xx error rate on order-service |
| Description annotation | Include current value and threshold | Error rate is 2.3% (threshold: 1%) |
| Runbook annotation | Confluence runbook URL | https://... |

---

## 9. Observability setup workflow

When the Observability Setup Agent creates observability infrastructure
for a new service, it follows this sequence:

```
1. Read .ai/project/SRE_SERVICE_CONFIG.md for service-specific thresholds
   Fall back to PERFORMANCE_GUIDELINES.md section 7 defaults if not set

2. Create Grafana folder for the service

3. Create overview dashboard with standard panels (section 3.2)

4. Create SLO dashboard with error budget panels

5. Create alert rules for each SLO panel (section 4.3 pattern)

6. Register all panels in SRE_DASHBOARD_REGISTRY.md via PR

7. Create Confluence runbook page for each alert
   Links back to the Grafana dashboard

8. Notify SRE Lead via Jira ticket that new service is registered
   for monitoring
```

---

## 10. Synthetic monitoring

For customer-facing services, the SRE Agent additionally monitors
synthetic transactions. Synthetic monitors check user-facing flows
end-to-end and are the highest-confidence signal for availability.

### 10.1 Synthetic monitor registration

Synthetic monitors are registered in `sdlc/ops/SRE_DASHBOARD_REGISTRY.md`
alongside metric-based panels:

```yaml
- service: order-service
  synthetic_monitors:
    - name: "Create order -- happy path"
      url: https://api.telia.no/api/v1/orders
      method: POST
      check_interval: 60  # seconds
      slo:
        availability: 99.9
        max_latency_ms: 2000
```

### 10.2 Synthetic failure handling

A synthetic monitor failure routes directly to Tier 3 in the SRE
Agent autonomy model -- it bypasses the normal metric threshold
checks because it directly confirms user-facing impact.

---

## 11. Rate limiting and error handling

| Response code | Meaning | Agent action |
|---|---|---|
| 429 Too Many Requests | API rate limit hit | Wait 60 seconds, retry |
| 401 Unauthorized | Token expired or invalid | Stop, flag to DevOps -- token rotation needed |
| 403 Forbidden | Insufficient permissions | Stop, flag to SRE Lead |
| 404 Not Found | Dashboard or panel does not exist | Stop, flag -- do not create replacement without approval |
| 503 Service Unavailable | Grafana temporarily unavailable | Retry with exponential backoff. If unavailable > 5 minutes, notify SRE Lead. |

**Grafana unavailability during active monitoring:**

If the SRE Agent cannot reach Grafana for more than 5 minutes during
normal operation, it treats this as a potential platform-level incident
and notifies the SRE Lead, rather than silently stopping its observation
loop.

---

## 12. Agent service account

| Setting | Value |
|---|---|
| Service account name | ai-sre-agent |
| Role | Viewer (read) + Editor (for Observability Setup Agent) |
| Token storage | Azure Key Vault -- secret name: grafana-agent-token |
| Token rotation | Quarterly -- DevOps responsibility |
| Scope | All dashboards in permitted folders only |

The SRE Agent uses the Viewer role for all observation operations.
The Observability Setup Agent requires the Editor role to create
dashboards and alert rules. These should be separate service account
tokens to enforce least privilege.

---

## 13. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core + SRE Lead + DevOps |
| Review cadence | Quarterly -- or when Grafana configuration changes |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead, SRE Lead, DevOps Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
