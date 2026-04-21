# PRIVACY_GUARDRAILS.md
# AI Engineering Commons — Data Privacy Rules for All Agents
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + Security Lead

---

## 1. Purpose

This file defines what data must never enter an AI agent prompt, an agent
output, a generated artefact, or any intermediate context passed between
agents. It applies to every agent in the ai-engineering-commons system without
exception.

AGENT.md section 4.3 makes compliance with this file a non-negotiable
constraint. This file provides the detail behind that constraint.

When an agent detects that input provided to it contains data listed in this
file, the agent must stop immediately, flag the issue clearly, and not process
the sensitive content. The agent does not attempt to redact or anonymise the
data itself — it stops and asks a human to resolve the input before proceeding.

---

## 2. Absolute prohibitions — never enter a prompt

The following data categories must never appear in any agent prompt, agent
output, generated code, generated configuration, generated documentation,
Confluence page, Jira ticket, or GitHub commit produced by or with the
assistance of an agent.

### 2.1 Personal data (GDPR Article 4)

| Data type | Examples |
|---|---|
| Full name combined with any identifier | "John Smith, customer ID 8821" |
| National identification numbers | Norwegian personal number (fødselsnummer), passport number |
| Financial account data | Bank account numbers, card numbers, IBAN |
| Health and medical data | Any patient record, diagnosis, prescription |
| Biometric data | Fingerprint hashes, facial recognition data |
| Location data that identifies an individual | GPS coordinates linked to a named person |
| Email addresses of real individuals | Customer or employee email addresses |
| Phone numbers of real individuals | Customer or employee mobile/landline numbers |
| IP addresses linked to individuals | Where the IP can identify a specific person |
| Any data that can identify a living person | When combined with other data in the prompt |

### 2.2 Credentials and secrets

| Data type | Examples |
|---|---|
| Passwords | Any password, passphrase, or PIN in any system |
| API keys | AWS, Azure, GitHub, third-party service keys |
| OAuth tokens | Access tokens, refresh tokens, bearer tokens |
| Private certificates | Private keys, PEM files, PKCS files |
| Connection strings | Database URLs with embedded credentials |
| SSH keys | Private SSH key material |
| Service account credentials | Client secrets, service principal passwords |
| Encryption keys | Symmetric or asymmetric key material |
| Session tokens | Authenticated session cookies or tokens |
| Webhook secrets | Signing secrets for webhook validation |

### 2.3 Production system data

| Data type | Examples |
|---|---|
| Live customer records | Any record from a production database |
| Production configuration | Actual production IP addresses, hostnames, ports |
| Production log data containing PII | Log lines with customer identifiers |
| Production event payloads | Real Kafka messages from production topics |
| Backup files | Database dumps, backup archives |
| Real transaction data | Payment records, order history, usage data |

### 2.4 Commercially sensitive data

| Data type | Examples |
|---|---|
| Unpublished financial data | Revenue figures, cost structures not yet public |
| M&A information | Details of acquisitions, partnerships, negotiations |
| Unreleased product plans | Features not yet publicly announced |
| Pricing models | Internal pricing structures and margins |
| Supplier contracts | Contract terms, rates, penalties |
| Customer contract details | SLA terms, pricing agreed with specific customers |

### 2.5 Regulated telecommunications data

| Data type | Examples |
|---|---|
| Call detail records (CDR) | Who called whom, when, duration |
| Network identifiers | IMSI, IMEI, MSISDN linked to individuals |
| Lawful intercept data | Any data subject to legal interception orders |
| Subscriber location data | Cell tower or GPS data linked to a subscriber |
| Traffic data | Data identifying communication patterns of individuals |

---

## 3. What is permitted in prompts

To be clear about what agents CAN use, the following categories are
explicitly permitted:

| Permitted data | Conditions |
|---|---|
| Anonymised or synthetic test data | Must not be reversible to real individuals |
| Jira ticket content | Only if the ticket contains no PII or credentials |
| Confluence page content | Only if the page contains no PII or credentials |
| Code from the repository | Only if the code contains no embedded secrets or PII |
| Architecture descriptions | Service names, patterns, flows — no real config values |
| Error messages and stack traces | After PII and credential scrubbing |
| Anonymised log samples | After all identifiers have been removed |
| Story and epic descriptions | Written in business language, no personal data |
| Schema definitions | Table and field definitions — no real data values |
| API specifications | Endpoint definitions and contracts — no real payloads |

---

## 4. How agents detect prohibited data

Agents apply these detection checks before processing any input:

### 4.1 Pattern-based detection

Agents check for these patterns in all input before processing:

```
Credential patterns:
  - Strings matching: AKIA[A-Z0-9]{16}             (AWS access key)
  - Strings matching: [A-Za-z0-9+/]{40}             (likely base64 secret)
  - Strings matching: ghp_[A-Za-z0-9]{36}           (GitHub token)
  - Strings matching: eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+ (JWT token)
  - Keywords near values: password=, secret=, key=, token=, credential=

Personal data patterns:
  - Norwegian fødselsnummer: \d{6}\s?\d{5}
  - Email format: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
  - IBAN format: [A-Z]{2}\d{2}[A-Z0-9]{4}\d{7,}
  - Phone numbers: (\+47|0047)?\s?\d{3}\s?\d{2}\s?\d{3}

Production data signals:
  - Connection strings: (mongodb|postgresql|mysql|redis|kafka):\/\/[^:]+:[^@]+@
  - The words "production", "prod" near configuration values
```

### 4.2 Contextual detection

Beyond pattern matching, agents apply contextual judgement. If input
appears to be from a production system (based on context, not just pattern),
the agent flags it even if no specific pattern matches.

### 4.3 When detection fires

When a prohibited data pattern is detected, the agent must:

1. Stop processing immediately
2. Output the following message clearly:

```
PRIVACY STOP — [Agent Name]

Prohibited data detected in input.
Category: [e.g. Credential / Personal data / Production data]
Location: [e.g. Line 12 of the provided code snippet]

I have not processed this input further.

Action required:
- Remove or replace the sensitive content with a placeholder
- Use anonymised or synthetic data instead
- For credentials: rotate the exposed credential immediately,
  then provide a placeholder in the prompt

I will continue once the input has been cleaned.
```

3. Not produce any output based on the flagged input
4. Log the detection event (agent ID, timestamp, data category detected —
   not the actual sensitive value)

---

## 5. Handling code that contains secrets

A common scenario is an engineer pasting code that contains a hardcoded
secret — a connection string, an API key, or a password that should not be
there. The agent's response in this case serves two purposes: protecting
privacy and flagging a security issue.

When an agent detects a secret in code:

1. Apply the PRIVACY STOP procedure from section 4.3
2. Additionally flag: "This credential should be rotated immediately
   as it has been exposed outside its intended context"
3. When the engineer provides cleaned code (with placeholder values),
   the agent proceeds and also recommends: where the secret should be
   stored (vault, environment variable, secrets manager), and which
   coding pattern removes hardcoded credentials permanently

This is not a blocker to getting work done — it is a prompt to fix
a security issue while the engineer has the context to do so.

---

## 6. Synthetic and anonymised data

Agents regularly need realistic-looking data for test generation, fixture
creation, and example outputs. The following rules govern what agents may
generate:

### 6.1 Agents MAY generate

- Realistic-looking names that are clearly fictitious (e.g. "Test User",
  "Jane Example", "Ola Nordmann" used explicitly as a placeholder)
- Synthetic phone numbers using non-dialable ranges (e.g. +47 000 00 000)
- Synthetic email addresses using example domains (e.g. test@example.com,
  user@test.internal)
- Synthetic account numbers that do not pass Luhn checks
- Randomised UUIDs as identifiers
- Realistic-structured but clearly fictional addresses

### 6.2 Agents must NOT generate

- Names that could identify a real Telia employee or customer
- Phone numbers in dialable ranges (even if randomly generated)
- Real company names combined with real financial figures
- Any data that could be mistaken for real production data if encountered
  out of context

### 6.3 Labelling synthetic data

All synthetic data generated by agents must be clearly labelled in the
output: either inline with a comment (`// TEST DATA — not real`) or in
the accompanying explanation. Agents do not produce unlabelled synthetic
data that could be mistaken for real data.

---

## 7. Data residency and prompt routing

When an agent sends a prompt to an LLM provider, the following rules apply:

| Data classification | Permitted routing |
|---|---|
| Internal engineering content (code, specs, docs with no PII) | Azure OpenAI (EU region) or approved provider |
| Any content touching PII categories | Must use EU-hosted models only — verify with Security Lead |
| Regulated telecom data | Must not leave Telia-controlled infrastructure — use on-premises models |
| Any content under legal hold | Must not be processed by any external AI system |

The specific approved model providers and their data residency guarantees
are maintained by the Security team and updated in COMPLIANCE_STANDARDS.md.
When in doubt, ask the Security Lead before routing sensitive content.

---

## 8. Engineer responsibilities

This file governs agent behaviour. Engineers using AI tools also have
corresponding responsibilities:

- Do not paste production data into any AI tool, regardless of the tool's
  privacy claims
- Do not share Jira tickets or Confluence pages that contain PII with AI
  tools unless PII has been removed
- Do not use real customer names, account numbers, or contact details in
  prompts, even as examples
- If you accidentally share sensitive data with an AI tool, report it to
  the Security Lead and follow the data breach procedure in
  COMPLIANCE_STANDARDS.md
- When generating test data, use the `GENERATE_MOCK_DATA` command rather
  than adapting real customer records

---

## 9. Incident response for privacy violations

If an agent produces output that contains or is derived from prohibited
data, or if an engineer identifies that prohibited data was included in
a prompt:

1. Stop using the output immediately
2. Do not commit, share, or deploy any output produced in that session
3. Notify the Security Lead within 1 hour
4. If personal data was involved, the Security Lead assesses whether
   this constitutes a GDPR reportable breach (72-hour notification
   window to relevant supervisory authority)
5. Log the incident in the security incident register

---

## 10. Exceptions process

In rare cases, working with real data may be necessary — for example,
debugging a production issue that cannot be reproduced with synthetic
data. The exceptions process is:

1. Engineer submits an exception request to the Security Lead with:
   - What data is needed and why synthetic data is insufficient
   - What safeguards will be applied (anonymisation, access controls)
   - Duration of the exception
2. Security Lead approves or denies within one business day
3. Approved exceptions are time-limited (maximum 48 hours)
4. All work done under an exception is conducted in an isolated,
   non-networked environment with no AI tool access
5. The exception and its outcome are logged in the security register

There are no exceptions to the credential and secrets prohibitions.
Those are absolute regardless of any other circumstance.

---

## 11. Version and review

| Attribute | Value |
|---|---|
| File owner | Security Lead + CoE Core |
| Review cadence | Quarterly, or immediately following any privacy incident |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | Security Lead, CoE Lead, Legal/Compliance representative |
| Change process | PR to ai-engineering-commons, Security Lead approval required |
| Regulatory basis | GDPR (EU 2016/679), Norwegian Personal Data Act (personopplysningsloven), Telia Group Data Classification Policy |
