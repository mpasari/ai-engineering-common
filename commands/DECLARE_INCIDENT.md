# DECLARE_INCIDENT.md
# Command: DECLARE_INCIDENT
# Category: Operations
# Agent: A39 Incident Response Agent
# Version: 1.0.0

---

## What this command does

Initiates the formal incident response process. Creates the Jira incident
ticket, opens the Confluence war room page, sends stakeholder notifications,
and begins maintaining the live incident timeline. Presents gate A09 for
severity declaration.

---

## When to use it

- When a P0 or P1 production issue is confirmed
- When the SRE Agent reaches Tier 4 escalation
- When a customer-facing outage is detected

---

## Required inputs

```
Brief description of the incident (required)
Severity suggestion (optional -- confirmed at gate A09)

Example: DECLARE_INCIDENT "Order service returning 500 errors -- all users affected"
         DECLARE_INCIDENT P1 "Billing service degraded -- intermittent failures"
```

---

## Usage

```
DECLARE_INCIDENT "Order service unavailable"

or

DECLARE_INCIDENT P0 "Payment processing down -- all markets affected"
```

---

## What to expect

1. Incident Response Agent presents gate A09 for severity declaration
2. On declaration: Jira incident ticket created, war room page opened
3. Stakeholder notifications sent
4. Live timeline maintained every 5 minutes (P0) or 10 minutes (P1)
5. On resolution: post-mortem template created
6. Gate E05 for post-mortem approval before incident is closed

---

## Output

- Jira incident ticket: [INC-DATE-description]
- Confluence war room: [URL]
- Stakeholder notification sent
- Live timeline maintained until resolution

---

## Notes

- Gate A09 must be approved before full war room activation
- Regulatory notification check (NIS2, GDPR) runs automatically for P0
- Use SRE_DIAGNOSE first if unsure whether this is a P0/P1
