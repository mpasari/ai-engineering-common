---
mode: agent
description: "Layer 1 -- Understand. Reads .ai/project/ files and PRODUCT_GOVERNANCE.md to produce PRODUCT_OVERVIEW.md -- a plain-language summary of what the product does, what data it processes, what AI components it uses, and what external systems it connects to. No gaps, no verdicts. This is the prerequisite for all other compliance commands."
tools: [codebase, read, search, edit, execute]
---

Do not greet. Execute immediately.

## Rules
- This command produces facts only. No gap analysis. No verdicts.
- Plain business language throughout. No class names or API paths.
- This file is read by every other compliance command. Accuracy matters more than completeness.
- Do NOT publish to Confluence. Save to docs/governance/PRODUCT_OVERVIEW.md only.

## Step 1 -- Read all project context
Read in this order:
- .ai/project/PRODUCT_GOVERNANCE.md (governance decisions)
- .ai/project/JIRA_CONFIG.md (product identity)
- .ai/project/ARCHITECTURE_OVERVIEW.md (what the system does)
- .ai/project/MODULE_REGISTRY.md (components)
- .ai/project/INTEGRATION_MAP.md (external systems)
- .ai/project/DATA_MODEL.md (what data is stored)
- .ai/project/TECH_DEBT_REGISTRY.md (known risks)
- .ai/project/KAFKA_TOPICS.md (if exists)

Scan codebase for:
- Authentication mechanisms (Azure AD, MSAL, JWT, OAuth patterns)
- LLM/AI calls (litellm, openai, azure openai patterns)
- Personal data handling (fields named email, phone, name, msisdn, user)
- Logging (logger calls -- flag any that log user input)
- External HTTP calls (requests, httpx, aiohttp)
- Input validation / guardrails

## Step 2 -- Generate PRODUCT_OVERVIEW.md

Save to docs/governance/PRODUCT_OVERVIEW.md. Create docs/governance/ if needed.

```markdown
# Product Overview
# System: [from ARCHITECTURE_OVERVIEW.md]
# Generated: [date] | Version: 1.0
# Status: DRAFT -- verify with Tech Lead before using in compliance commands
#
# This file is the foundation for all /compliance-* commands.
# Update with /compliance-scan when the system changes significantly.
# Do not edit manually -- re-run /compliance-scan instead.

---

## 1. What this product does
[2-3 sentences. Business purpose, who uses it, what it does with information.]

## 2. Components
[List from MODULE_REGISTRY.md with one-line plain-language description each.]

## 3. Data processed

### 3.1 Data users provide
[What a user inputs when they use the product.]

### 3.2 Data the product retrieves or generates
[What the product looks up, generates, or returns.]

### 3.3 Personal data categories
[GDPR Article 4 categories in plain language. Source: DATA_MODEL.md PII fields.]

### 3.4 Special category data
[Explicitly state yes/no. Source: DATA_MODEL.md.]

## 4. How data flows
[Numbered plain-language journey. Source: ARCHITECTURE_OVERVIEW.md + INTEGRATION_MAP.md.]
1. [step]
2. [step]
...

## 5. Where data is stored
| Entity | Location | Encrypted | Retention |
|---|---|---|---|
[From DATA_MODEL.md. Retention from PRODUCT_GOVERNANCE.md or "Not yet defined".]

## 6. External systems and processors
| System | What data is shared | Purpose | Location | DPA status |
|---|---|---|---|---|
[From INTEGRATION_MAP.md and PRODUCT_GOVERNANCE.md third-party processors section.]

## 7. AI components
[If AI is used -- describe in plain language:]
- What AI model or service is used
- What data is sent to it
- Whether the provider retains prompt data
- Whether it is used for automated decisions affecting individuals

[If no AI: "This product does not use AI or automated decision-making."]

## 8. Access control
[Who can access what. Source: codebase auth scan.]

## 9. Security controls observed
[From codebase scan -- plain language:]
- Encryption in transit: [evidence or "not observed"]
- Secrets management: [evidence or "not observed"]
- Input validation: [evidence or "not observed"]
- Rate limiting: [evidence or "not observed"]
- Audit logging: [evidence or "not observed"]

## 10. Known risks
[From TECH_DEBT_REGISTRY.md -- security and data-relevant items only. Plain language.]

## 11. Applicable regulations
[From PRODUCT_GOVERNANCE.md applicable regulations section, or infer from product type:]
- GDPR: [Yes/No -- reason]
- EU AI Act: [Yes/No -- risk category if yes]
- NIS2: [Yes/No -- reason]
- DORA: [Yes/No -- reason]
- ePrivacy: [Yes/No -- reason]

## Scan metadata
| Field | Value |
|---|---|
| Scan date | [date] |
| Modules scanned | [N] |
| PII fields found | [N] |
| External processors | [N] |
| AI components | [Yes/No] |
| Codebase signals | [auth pattern found / secrets pattern found / etc] |
```

## Step 3 -- Tell the engineer
State:
1. File saved: docs/governance/PRODUCT_OVERVIEW.md
2. Any fields left blank because the codebase could not confirm them -- these need Tech Lead input
3. Any fields pulled from PRODUCT_GOVERNANCE.md (already decided)
4. Next step: run /compliance-status to see which assessments to run first
5. Git commands:
```
git add docs/governance/PRODUCT_OVERVIEW.md
git commit -m "docs: compliance scan -- product overview generated

Run /compliance-gdpr, /compliance-ai-act, /compliance-iso27001,
/compliance-nis2, /compliance-dora, or /compliance-owasp next."
```
