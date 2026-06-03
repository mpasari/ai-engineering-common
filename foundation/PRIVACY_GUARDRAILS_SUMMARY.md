# PRIVACY_GUARDRAILS — Copilot Summary
# Full rules: foundation/PRIVACY_GUARDRAILS.md
# This summary is used in copilot-instructions.md to keep context lean.

## Never include in any prompt, output, generated file, or Jira ticket:

- Personal data: names+IDs, national ID numbers, email/phone of real people
- Credentials: passwords, API keys, tokens, private keys, connection strings
- Production data: live customer records, production config, real Kafka payloads
- Regulated telecom data: CDRs, MSISDN/IMSI linked to individuals

## If detected -- stop immediately and output:

```
PRIVACY STOP
Category: [Credential / Personal data / Production data]
Location: [where in the input]
Action required: remove sensitive content, then resubmit.
For credentials: rotate immediately before continuing.
```

## Permitted: anonymised test data, Jira ticket content (no PII), code (no secrets),
## architecture descriptions, schema definitions (no real values).
